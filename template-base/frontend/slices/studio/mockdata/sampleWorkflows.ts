export const SAMPLE_WORKFLOWS = {
  contactFormToSheets: {
    name: "Contact Form to Google Sheets",
    description: "Automatically save contact form submissions to Google Sheets",
    nodes: [
      {
        type: 'webhookTrigger',
        props: {
          path: '/webhook/contact',
          method: 'POST',
          authentication: 'secret'
        }
      },
      {
        type: 'dataTransform',
        props: {
          transformation: 'map',
          script: 'return { name: data.name, email: data.email, message: data.message, date: new Date() };'
        }
      },
      {
        type: 'googleSheets',
        props: {
          action: 'append',
          spreadsheetId: 'your-sheet-id',
          range: 'Contacts!A:D'
        }
      }
    ]
  },
  
  orderProcessing: {
    name: "E-commerce Order Processing",
    description: "Process new orders and send notifications",
    nodes: [
      {
        type: 'webhookTrigger',
        props: {
          path: '/webhook/order',
          method: 'POST'
        }
      },
      {
        type: 'condition',
        props: {
          operator: 'greater_than',
          leftValue: 'order.total',
          rightValue: '100'
        }
      },
      {
        type: 'telegram',
        props: {
          action: 'sendMessage',
          message: 'New high-value order received!'
        }
      },
      {
        type: 'notion',
        props: {
          action: 'create',
          databaseId: 'orders-db-id'
        }
      }
    ]
  },

  aiContentGeneration: {
    name: "AI Content Generation Workflow",
    description: "Generate content using AI and publish to multiple platforms",
    nodes: [
      {
        type: 'httpRequest',
        props: {
          method: 'POST',
          url: 'https://api.example.com/trigger',
          headers: '{"Content-Type": "application/json"}'
        }
      },
      {
        type: 'openAI',
        props: {
          model: 'gpt-4',
          prompt: 'Generate a blog post about the latest technology trends',
          temperature: 0.7,
          maxTokens: 1000
        }
      },
      {
        type: 'dataTransform',
        props: {
          transformation: 'custom',
          script: 'return { title: data.title, content: data.content, publishDate: new Date() };'
        }
      },
      {
        type: 'notion',
        props: {
          action: 'create',
          databaseId: 'blog-posts-db'
        }
      }
    ]
  }
};
