import type { Node, Edge } from 'reactflow';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

export const INITIAL_AUTOMATION_NODES: Node[] = [
  {
    id: 'webhook-1',
    type: 'automationNode',
    position: { x: 100, y: 100 },
    data: {
      type: 'webhookTrigger',
      props: {
        path: '/webhook/contact-form',
        method: 'POST',
        authentication: 'secret',
        secret: 'webhook-secret-key'
      },
      feature: 'automation',
      category: 'Webhook'
    }
  },
  {
    id: 'transform-1',
    type: 'automationNode',
    position: { x: 400, y: 100 },
    data: {
      type: 'dataTransform',
      props: {
        transformation: 'map',
        script: 'return { ...data, timestamp: new Date().toISOString() };'
      },
      feature: 'automation',
      category: 'Data'
    }
  },
  {
    id: 'sheets-1',
    type: 'automationNode',
    position: { x: 700, y: 100 },
    data: {
      type: 'googleSheets',
      props: {
        action: 'append',
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A:E',
        apiKey: 'your-google-api-key'
      },
      feature: 'automation',
      category: 'Integration'
    }
  }
];

export const INITIAL_AUTOMATION_EDGES: Edge[] = [
  {
    id: 'edge-1',
    source: 'webhook-1',
    target: 'transform-1',
    animated: true
  },
  {
    id: 'edge-2',
    source: 'transform-1',
    target: 'sheets-1',
    animated: true
  }
];
