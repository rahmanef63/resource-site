export type StudioTemplateFactory = () => any;

export const createTemplate = (nodes: Record<string, any>) => ({
  version: '0.4',
  root: ['page'],
  nodes,
});
