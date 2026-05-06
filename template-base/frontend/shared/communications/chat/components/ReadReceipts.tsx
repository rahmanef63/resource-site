/**
 * Read receipts component
 * @module shared/chat/components/ReadReceipts
 */

import React from "react";
import Image from "next/image";
import type { UserMeta } from "../types/message";
import { formatUserName } from "../util/formatMessage";

export type ReadReceiptsProps = {
  readBy: string[];
  participants: UserMeta[];
  maxDisplay?: number;
};

/**
 * Display read receipts for a message
 */
export function ReadReceipts({
  readBy,
  participants,
  maxDisplay = 3,
}: ReadReceiptsProps) {
  if (!readBy || readBy.length === 0) return null;

  const readers = participants.filter((p) => readBy.includes(p.id));
  const displayReaders = readers.slice(0, maxDisplay);
  const remaining = readers.length - displayReaders.length;

  return (
    <div className="chat-read-receipts">
      <div className="chat-read-receipts-avatars">
        {displayReaders.map((user) => (
          <div
            key={user.id}
            className="chat-read-receipt-avatar"
            title={`Read by ${formatUserName(user)}`}
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={formatUserName(user)}
                width={16}
                height={16}
                className="h-full w-full rounded-full object-cover"
                sizes="16px"
              />
            ) : (
              <span>{formatUserName(user)[0]}</span>
            )}
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <span className="chat-read-receipts-more">+{remaining}</span>
      )}
    </div>
  );
}
