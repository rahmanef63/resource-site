import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';
import { Renderer } from './Renderer';
import { instantiateDefaultTemplate } from '@/frontend/slices/studio/ui/state/templateStore';
import { fromSchema } from '@/frontend/slices/studio/ui/hooks/useSchemaParser';
import { toSchema } from '@/frontend/slices/studio/ui/hooks/useSchema';
import type { Schema } from '@/frontend/slices/studio/ui/types';

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, unoptimized: _unoptimized, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const renderRenderer = (schema: Schema, selectedId: string | null = null) => render(
  <Renderer
    schema={schema}
    activeWs={{ category: 'personal', key: '' }}
    onChangeWs={() => {}}
    activeRoute="/"
    onNavigate={() => {}}
    commands={{
      newWorkspace: () => {},
      newMenu: () => {},
      newPage: () => {},
    }}
    menuOverride={null}
    setMenuOverride={() => {}}
    onSelectNode={() => {}}
    selectedId={selectedId}
    designMode
  />
);

describe('Renderer', () => {
  it('renders layout children without an extra DOM wrapper between parent and grid nodes', async () => {
    const schema = await instantiateDefaultTemplate('SaaS Product Landing') as Schema;
    const { container } = renderRenderer(schema);

    expect(screen.getByText('Shared context')).toBeInTheDocument();

    const platformInner = container.querySelector('[data-studio-node-id="platform-inner"]');
    const platformGrid = container.querySelector('[data-studio-node-id="platform-grid"]');

    expect(platformInner).toBeTruthy();
    expect(platformGrid).toBeTruthy();
    expect(platformGrid?.parentElement).toBe(platformInner);
  });

  it('keeps flex children as direct layout items and does not force alignItems or justifyContent defaults', () => {
    const schema: Schema = {
      version: '0.4',
      root: ['page'],
      nodes: {
        page: { type: 'section', props: { path: '/' }, children: ['row'] },
        row: { type: 'div', props: { className: 'flex flex-row gap-6' }, children: ['copy', 'visual'] },
        copy: { type: 'div', props: { className: 'flex-1 flex flex-col gap-4' }, children: ['copy-text'] },
        'copy-text': { type: 'text', props: { tag: 'p', content: 'Copy column' }, children: [] },
        visual: { type: 'div', props: { className: 'flex-1 min-h-8 bg-slate-200' }, children: [] },
      },
    };

    const { container } = renderRenderer(schema, 'copy');

    const row = container.querySelector('[data-studio-node-id="row"]') as HTMLElement | null;
    const copy = container.querySelector('[data-studio-node-id="copy"]') as HTMLElement | null;

    expect(row).toBeTruthy();
    expect(copy).toBeTruthy();
    expect(copy?.parentElement).toBe(row);
    expect(copy).toHaveClass('flex-1');
    expect(copy?.style.alignItems).toBe('');
    expect(copy?.style.justifyContent).toBe('');
    expect(copy).toHaveClass('ring-2');
  });

  it('round-trips builtin templates through fromSchema and toSchema without requiring a migration', async () => {
    const schema = await instantiateDefaultTemplate('SaaS Product Landing') as Schema;
    const { nodes, edges } = fromSchema(schema);
    const roundTrip = toSchema(nodes, edges);

    expect(roundTrip.version).toBe('0.4');
    expect(roundTrip.root).toEqual(schema.root);
    expect(Object.keys(roundTrip.nodes)).toHaveLength(Object.keys(schema.nodes).length);
    expect(roundTrip.nodes['platform-grid']).toMatchObject({
      type: 'grid',
      children: ['platform-1', 'platform-2', 'platform-3'],
    });
    expect(roundTrip.nodes['platform-grid']).toMatchObject({
      props: {},
    });
  });

  it('renders mixed-content text nodes with inline icons inside the semantic tag', () => {
    const schema: Schema = {
      version: '0.5',
      root: ['page'],
      nodes: {
        page: { type: 'div', props: {}, children: ['headline'] },
        headline: { type: 'text', props: { tag: 'h2', className: 'flex items-center gap-2' }, children: ['headline-icon', 'headline-copy'] },
        'headline-icon': { type: 'icon', props: { name: 'hub', size: 20, className: 'text-blue-500' }, children: [] },
        'headline-copy': { type: 'text', props: { tag: 'span', content: 'Dashboard' }, children: [] },
      },
    };

    const { container } = renderRenderer(schema);

    const headline = container.querySelector('[data-studio-node-id="headline"]') as HTMLElement | null;
    const icon = headline?.querySelector('.material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp') as HTMLElement | null;

    expect(headline?.tagName).toBe('H2');
    expect(headline).toHaveTextContent('Dashboard');
    expect(icon?.tagName).toBe('SPAN');
    expect(icon?.parentElement).toBe(headline);
    expect(icon).toHaveTextContent('hub');
  });
});
