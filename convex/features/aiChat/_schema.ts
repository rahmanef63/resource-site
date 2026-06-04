// aiChat is stateless today — the chat action calls Anthropic directly and
// returns the reply without persisting threads. Tables land with the W5
// workbench (threads/messages/attachments). Keep the export so the feature
// folder follows the `<slug>Tables` convention and consumers can spread it
// into their schema unconditionally.
export const aiChatTables = {};
