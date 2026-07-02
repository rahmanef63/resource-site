import { internalMutation } from "../../_generated/server"

export const processScheduledActions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    
    const pendingSchedules = await ctx.db
      .query("cms_schedules")
      .withIndex("by_scheduled_at", (q) =>
        q.eq("status", "pending").lte("scheduledAt", now)
      )
      .take(1000)
    
    await Promise.all(
      pendingSchedules.map(async (schedule) => {
        try {
          if (schedule.action === "publish") {
            if (schedule.targetType === "entry") {
              const entryId = schedule.targetId as any
              const entry = await ctx.db.get(entryId)
              if (entry) {
                await ctx.db.patch(entryId, {
                  status: "published",
                  publishedAt: now,
                  updatedAt: now,
                })
              }
            } else if (schedule.targetType === "global") {
              const globalDataId = schedule.targetId as any
              const globalData = await ctx.db.get(globalDataId)
              if (globalData) {
                await ctx.db.patch(globalDataId, {
                  status: "published",
                  publishedAt: now,
                  updatedAt: now,
                })
              }
            }
          } else if (schedule.action === "unpublish") {
            if (schedule.targetType === "entry") {
              const entryId = schedule.targetId as any
              const entry = await ctx.db.get(entryId)
              if (entry) {
                await ctx.db.patch(entryId, {
                  status: "draft",
                  updatedAt: now,
                })
              }
            } else if (schedule.targetType === "global") {
              const globalDataId = schedule.targetId as any
              const globalData = await ctx.db.get(globalDataId)
              if (globalData) {
                await ctx.db.patch(globalDataId, {
                  status: "draft",
                  updatedAt: now,
                })
              }
            }
          }

          await ctx.db.patch(schedule._id, {
            status: "completed",
            executedAt: now,
          })
        } catch (error) {
          await ctx.db.patch(schedule._id, {
            status: "failed",
            executedAt: now,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }),
    )
    
    return { processed: pendingSchedules.length }
  },
})
