/**
 * Studio Canvas Bridge
 *
 * A module-level singleton that the canvas registers itself into.
 * Allows Studio AI agents (and any non-React code) to perform CRUD
 * operations on the canvas without needing React context access.
 *
 * Usage in canvas provider:
 *   studioCanvasBridge.register({ addNode, updateNodeData, deleteNode, getNodes, importSchema })
 *
 * Usage in agent tools:
 *   const result = studioCanvasBridge.addNode({ type: "text", props: { content: "Hello" } })
 */

export interface CanvasNodeSpec {
  id?: string
  type: string
  props?: Record<string, any>
  children?: string[]
  position?: { x: number; y: number }
}

export interface CanvasBridgeOps {
  addNode: (spec: CanvasNodeSpec) => Promise<string>
  updateNode: (id: string, props: Record<string, any>) => Promise<boolean>
  deleteNode: (id: string) => Promise<boolean>
  getNodes: () => Promise<Array<{ id: string; type: string; props: Record<string, any> }>>
  importSchema: (schema: object) => Promise<boolean>
  clearCanvas: () => Promise<boolean>
}

type BridgeState =
  | { registered: false }
  | ({ registered: true } & CanvasBridgeOps)

let _bridge: BridgeState = { registered: false }

export const studioCanvasBridge = {
  register(ops: CanvasBridgeOps) {
    _bridge = { registered: true, ...ops }
  },

  unregister() {
    _bridge = { registered: false }
  },

  isRegistered(): boolean {
    return _bridge.registered
  },

  async addNode(spec: CanvasNodeSpec): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!_bridge.registered) return { success: false, error: "Canvas not mounted" }
    try {
      const id = await _bridge.addNode(spec)
      return { success: true, id }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  async updateNode(id: string, props: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    if (!_bridge.registered) return { success: false, error: "Canvas not mounted" }
    try {
      await _bridge.updateNode(id, props)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  async deleteNode(id: string): Promise<{ success: boolean; error?: string }> {
    if (!_bridge.registered) return { success: false, error: "Canvas not mounted" }
    try {
      await _bridge.deleteNode(id)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  async getNodes(): Promise<{ success: boolean; nodes?: any[]; error?: string }> {
    if (!_bridge.registered) return { success: false, error: "Canvas not mounted" }
    try {
      const nodes = await _bridge.getNodes()
      return { success: true, nodes }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  async importSchema(schema: object): Promise<{ success: boolean; error?: string }> {
    if (!_bridge.registered) return { success: false, error: "Canvas not mounted" }
    try {
      await _bridge.importSchema(schema)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  },

  async clearCanvas(): Promise<{ success: boolean; error?: string }> {
    if (!_bridge.registered) return { success: false, error: "Canvas not mounted" }
    try {
      await _bridge.clearCanvas()
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  },
}
