import { cronJobs } from "convex/server"
import { internal } from "../../_generated/api"

const crons = cronJobs()

crons.interval(
  "process scheduled cms actions",
  { minutes: 1 },
  internal.features.cms.actions.processScheduledActions
)

export default crons
