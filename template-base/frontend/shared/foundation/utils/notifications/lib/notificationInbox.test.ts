import { describe, expect, it } from "vitest"

import {
  buildNotificationInbox,
  filterNotificationInbox,
  getNotificationInboxUnreadCount,
} from "./notificationInbox"

describe("notificationInbox", () => {
  it("merges system notifications with invitations sorted by newest first", () => {
    const items = buildNotificationInbox(
      [
        {
          _id: "sys-1",
          type: "system",
          title: "System notice",
          message: "Background job completed",
          isRead: true,
          _creationTime: 100,
        },
      ],
      [
        {
          _id: "inv-1",
          type: "workspace",
          workspace: { name: "Acme Space" },
          inviterName: "Owner Name",
          _creationTime: 200,
        },
      ]
    )

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      _id: "invitation:inv-1",
      source: "invitation",
      type: "invitation",
    })
    expect(items[1]).toMatchObject({
      _id: "sys-1",
      source: "system",
      type: "system",
    })
  })

  it("filters invitation items into the invitation tab", () => {
    const items = buildNotificationInbox(
      [
        {
          _id: "sys-1",
          type: "task",
          title: "Task updated",
          message: "One task moved",
          isRead: false,
          _creationTime: 100,
        },
      ],
      [
        {
          _id: "inv-1",
          type: "personal",
          inviterEmail: "owner@example.com",
          _creationTime: 200,
        },
      ]
    )

    expect(filterNotificationInbox(items, "invitation")).toHaveLength(1)
    expect(filterNotificationInbox(items, "task")).toHaveLength(1)
  })

  it("counts pending invitations as unread inbox items", () => {
    expect(
      getNotificationInboxUnreadCount(3, [
        { _id: "inv-1" },
        { _id: "inv-2" },
      ])
    ).toBe(5)
  })
})
