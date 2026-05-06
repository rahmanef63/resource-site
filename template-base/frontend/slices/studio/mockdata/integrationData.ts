export const INTEGRATION_MOCK_DATA = {
  googleSheets: {
    spreadsheets: [
      {
        id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        name: 'Contact Forms',
        sheets: ['Sheet1', 'Leads', 'Archive']
      },
      {
        id: '1234567890abcdef',
        name: 'Sales Data',
        sheets: ['Q1 2024', 'Q2 2024', 'Summary']
      }
    ]
  },
  
  notion: {
    databases: [
      {
        id: 'blog-posts-db-id',
        name: 'Blog Posts',
        properties: ['Title', 'Content', 'Status', 'Published Date']
      },
      {
        id: 'orders-db-id',
        name: 'Orders',
        properties: ['Order ID', 'Customer', 'Total', 'Status', 'Date']
      },
      {
        id: 'tasks-db-id',
        name: 'Tasks',
        properties: ['Task', 'Assignee', 'Priority', 'Due Date', 'Status']
      }
    ]
  },
  
  telegram: {
    bots: [
      {
        token: 'bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        name: 'Notification Bot',
        username: '@notification_bot'
      },
      {
        token: 'bot789012:XYZ-ABC5678def-rst90U3v2u456fg22',
        name: 'Support Bot',
        username: '@support_bot'
      }
    ],
    chats: [
      { id: '-1001234567890', name: 'General Notifications' },
      { id: '-1009876543210', name: 'Sales Team' },
      { id: '123456789', name: 'Admin Chat' }
    ]
  },
  
  webhooks: [
    {
      id: 'webhook-1',
      name: 'Contact Form Webhook',
      url: '/webhook/contact-form',
      method: 'POST',
      status: 'active',
      lastTriggered: '2024-01-15T10:30:00Z'
    },
    {
      id: 'webhook-2',
      name: 'Order Webhook',
      url: '/webhook/new-order',
      method: 'POST',
      status: 'active',
      lastTriggered: '2024-01-15T09:15:00Z'
    },
    {
      id: 'webhook-3',
      name: 'User Registration',
      url: '/webhook/user-signup',
      method: 'POST',
      status: 'inactive',
      lastTriggered: '2024-01-14T16:45:00Z'
    }
  ]
};
