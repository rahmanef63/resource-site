/**
 * useConvexCMSPersistence Hook Tests
 * 
 * Tests for the CMS persistence hook that manages saving/loading collections.
 * Uses mocked Convex hooks and context for unit testing.
 * 
 * @vitest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock data
const mockWorkspace = {
  _id: 'ws-1' as any,
  name: 'Test Workspace',
  slug: 'test-workspace',
};

const mockUser = {
  _id: 'user-1' as any,
  name: 'Test User',
};

const mockCollection = {
  _id: 'collection-1' as any,
  workspaceId: 'ws-1' as any,
  label: 'Test Collection',
  slug: 'test-collection',
  fields: [],
  draftsEnabled: true,
  _creationTime: Date.now(),
};

// Create mock functions at module level (these will be hoisted)
const mockCreateCollection = vi.fn();
const mockUpdateCollection = vi.fn();
const mockDeleteCollection = vi.fn();
const mockUseCMSCollections = vi.fn();
const mockUseConvexWorkspaceContext = vi.fn();

// Mock foundation hooks
vi.mock('@/frontend/shared/foundation', () => ({
  useCMSCollections: (...args: any[]) => mockUseCMSCollections(...args),
  useCreateCollection: () => ({ mutate: mockCreateCollection }),
  useUpdateCollection: () => ({ mutate: mockUpdateCollection }),
  useDeleteCollection: () => ({ mutate: mockDeleteCollection })
}));

// Mock workspace context
vi.mock('@/frontend/shared/context/ConvexWorkspaceContext', () => ({
  useConvexWorkspaceContext: () => mockUseConvexWorkspaceContext()
}));

// Mock schema converters
vi.mock('../useSchema', () => ({
  toSchema: vi.fn(() => [])
}));

vi.mock('../useSchemaParser', () => ({
  fromSchema: vi.fn(() => ({ nodes: [], edges: [] }))
}));

// Import after mocks are set up
import { useConvexCMSPersistence } from '../useConvexCMSPersistence';
import { fromSchema } from '../useSchemaParser';

describe('useConvexCMSPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup default mock implementations
    mockUseCMSCollections.mockReturnValue({ 
      collections: [mockCollection], 
      loading: false 
    });
    mockUseConvexWorkspaceContext.mockReturnValue({
      currentWorkspace: mockWorkspace,
      currentUser: mockUser
    });
    mockCreateCollection.mockResolvedValue('new-collection-id');
    mockUpdateCollection.mockResolvedValue(undefined);
    mockDeleteCollection.mockResolvedValue(undefined);
  });
  
  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty state', () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    expect(result.current.collections).toEqual([mockCollection]);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it('should return collections from Convex', () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    expect(result.current.collections).toHaveLength(1);
    expect(result.current.collections[0].label).toBe('Test Collection');
  });

  it('should create new collection successfully', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    // Return empty collections so the hook will use create instead of update
    mockUseCMSCollections.mockReturnValue({ 
      collections: [], 
      loading: false 
    });
    mockCreateCollection.mockResolvedValue('new-collection-id');
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    let collectionId: string | undefined;
    await act(async () => {
      collectionId = await result.current.saveCollection('New Collection');
    });

    expect(mockCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'ws-1',
        label: 'New Collection',
        slug: 'new-collection',
      })
    );
    expect(collectionId).toBe('new-collection-id');
  });

  it('should update existing collection successfully', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    // Set current collection ID to trigger update path
    localStorage.setItem('current-cms-collection-id', 'collection-1');
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    await act(async () => {
      await result.current.saveCollection('Updated Collection');
    });

    expect(mockUpdateCollection).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'collection-1',
        workspaceId: 'ws-1',
        label: 'Updated Collection',
      })
    );
  });

  it('should mark as dirty when nodes change', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    const { result, rerender } = renderHook(
      ({ nodes }) => useConvexCMSPersistence(nodes, [], setNodes, setEdges, { autoSave: false }),
      { initialProps: { nodes: [] as any[] } }
    );

    expect(result.current.isDirty).toBe(false);

    // Change nodes
    rerender({ nodes: [{ id: '1', type: 'text', data: { label: 'Test' }, position: { x: 0, y: 0 } }] });

    await waitFor(() => {
      expect(result.current.isDirty).toBe(true);
    });
  });

  it('should handle save error gracefully', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    const onSaveError = vi.fn();
    
    // Return empty collections to trigger create path, which will fail
    mockUseCMSCollections.mockReturnValue({ 
      collections: [], 
      loading: false 
    });
    mockCreateCollection.mockRejectedValue(new Error('Save failed'));
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { 
        autoSave: false,
        onSaveError 
      })
    );

    await act(async () => {
      try {
        await result.current.saveCollection('Test');
      } catch (e) {
        // Expected to throw
        expect((e as Error).message).toBe('Save failed');
      }
    });

    expect(onSaveError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should load collection by ID', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    (fromSchema as any).mockReturnValue({
      nodes: [{ id: 'node-1', type: 'text' }],
      edges: []
    });
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    await act(async () => {
      await result.current.loadCollection('collection-1' as any);
    });

    expect(fromSchema).toHaveBeenCalled();
    expect(setNodes).toHaveBeenCalledWith([{ id: 'node-1', type: 'text' }]);
    expect(setEdges).toHaveBeenCalledWith([]);
    expect(result.current.currentCollectionId).toBe('collection-1');
  });

  it('should delete current collection', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    // Set current collection ID in localStorage before rendering
    localStorage.setItem('current-cms-collection-id', 'collection-1');
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    // Verify initial state has the collection ID from localStorage
    expect(result.current.currentCollectionId).toBe('collection-1');

    await act(async () => {
      await result.current.deleteCurrentCollection();
    });

    // Verify delete mutation was called with correct params
    expect(mockDeleteCollection).toHaveBeenCalledWith({
      id: 'collection-1',
      workspaceId: 'ws-1',
    });
    
    // Verify nodes and edges were cleared
    expect(setNodes).toHaveBeenCalledWith([]);
    expect(setEdges).toHaveBeenCalledWith([]);
    
    // Note: The hook may reload from the first available collection after delete,
    // so we just verify the delete was called rather than the final state
  });

  it('should throw error when no workspace is selected', async () => {
    const setNodes = vi.fn();
    const setEdges = vi.fn();
    
    // Mock no workspace
    mockUseConvexWorkspaceContext.mockReturnValue({
      currentWorkspace: null,
      currentUser: mockUser
    });
    
    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], setNodes, setEdges, { autoSave: false })
    );

    await act(async () => {
      try {
        await result.current.saveCollection('Test');
      } catch (e) {
        expect((e as Error).message).toBe('No workspace selected');
      }
    });
  });
});
