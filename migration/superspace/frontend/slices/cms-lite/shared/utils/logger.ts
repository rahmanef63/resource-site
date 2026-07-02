export const logger = {
  save: (entity: string, location: string, data?: any) => {
  },

  saved: (entity: string, location: string, data?: any) => {
  },

  load: (entity: string, source: string) => {
  },

  loaded: (entity: string, source: string, count?: number) => {
    const countInfo = count !== undefined ? ` (${count} items)` : '';
  },

  error: (action: string, entity: string, error: any) => {
    console.error(`? Error ${action} ${entity}:`, {
      message: error?.message || error,
      details: error?.response?.data || error,
      stack: error?.stack,
      fullError: error,
    });
  },

  update: (entity: string, location: string, data?: any) => {
  },

  updated: (entity: string, location: string) => {
  },

  delete: (entity: string, location: string, id?: any) => {
  },

  deleted: (entity: string, location: string) => {
  },

  export: (entity: string, destination: string) => {
  },

  exported: (entity: string, count?: number) => {
    const countInfo = count !== undefined ? ` (${count} items)` : '';
  },

  import: (entity: string, source: string) => {
  },

  imported: (entity: string, count?: number) => {
    const countInfo = count !== undefined ? ` (${count} items)` : '';
  },

  action: (action: string, details?: any) => {
  },
};
