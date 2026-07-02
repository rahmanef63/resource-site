# Comments Feature Documentation

## Overview
The comments feature provides a flexible commenting system with support for threading, mentions, reactions, and moderation.

## Tables

### `cmsLiteCommentThreads`
Organizes comments into threads attached to various entities.
```typescript
{
  workspaceId: string;   // Workspace context
  entityType: string;    // Type of entity (product, post, etc.)
  entityId: string;      // ID of the entity
  status: string;        // open, closed, archived
  title?: string;        // Optional thread title
  commentCount: number;  // Total comments in thread
  lastCommentAt: number; // Last activity timestamp
  lastCommentBy?: string; // Last commenter's ID
  tags?: string[];      // Optional categorization
  createdBy?: string;   // Creator's ID
  updatedBy?: string;   // Last updater's ID
}
```

### `comments`
Individual comments within threads.
```typescript
{
  threadId: Id<"cmsLiteCommentThreads">; // Parent thread
  authorId: string;     // Comment author's ID
  authorName: string;   // Author's display name
  content: string;      // Comment text
  replyToId?: Id<"cmsLiteComments">; // Optional parent comment
  status: string;       // published, pending, hidden
  reactions?: Array<{   // Optional reactions
    type: string;       // like, heart, etc.
    userId: string;     // Reactor's ID
    timestamp: number;  // When reacted
  }>;
  attachments?: Array<{ // Optional files
    fileId: string;     // Storage reference
    fileName: string;   // Original name
    fileType: string;   // MIME type
    fileSize: number;   // In bytes
  }>;
  createdBy?: string;   // Creator's ID
  updatedBy?: string;   // Last updater's ID
}
```

### `cmsLiteCommentMentions`
Tracks @mentions in comments for notifications.
```typescript
{
  commentId: Id<"cmsLiteComments">; // Source comment
  userId: string;     // Mentioned user
  notified: boolean;  // Notification status
  notifiedAt?: number; // When notified
  createdBy?: string; // Creator's ID
}
```

## Public APIs

### Queries
- `getThread`: Get a thread and its comments
- `listThreads`: List threads for an entity
- `getUnreadMentions`: Get current user's unread mentions

### Mutations
- `createThread`: Create a new thread with initial comment
- `addComment`: Add a comment to a thread
- `updateCommentStatus`: Update moderation status
- `addReaction`: Add a reaction to a comment

## Usage Examples

### Creating a Comment Thread
```typescript
import { api } from "./_generated/api";

// Create new thread with comment
const { threadId, commentId } = await ctx.runMutation(
  api.comments.mutations.createThread,
  {
    workspaceId: "workspace123",
    entityType: "product",
    entityId: "prod123",
    title: "Product Discussion",
    initialComment: "What do you think about this product? @john",
    tags: ["feedback", "discussion"]
  }
);
```

### Adding a Comment
```typescript
import { api } from "./_generated/api";

// Add reply to thread
const { commentId } = await ctx.runMutation(
  api.comments.mutations.addComment,
  {
    threadId: "thread123",
    content: "Great product! @sarah check this out",
    replyToId: "comment456", // Optional reply reference
    attachments: [
      {
        fileId: "file123",
        fileName: "feedback.pdf",
        fileType: "application/pdf",
        fileSize: 1024567
      }
    ]
  }
);
```

## Migration Notes
1. Comments structure simplified from SQL to document model
2. Added workspace context for multi-tenant support
3. Enhanced with reactions and file attachments
4. Added mention tracking for notifications

## Migration Status
- [x] Schema migrated
- [x] Queries ported
- [x] Mutations ported
- [x] Docs updated

## Pending Tasks
- [ ] Implement comment editing
- [ ] Add rich text support
- [ ] Create notification system for mentions
- [ ] Add bulk moderation tools
