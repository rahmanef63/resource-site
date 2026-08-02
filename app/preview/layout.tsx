import { AgentBridge } from "@/components/agent-bridge";

// Every /preview surface (slice demos + the composed OS shells) gets the live
// model bridge. AgentBridge renders null and only wires the agentic seam; the
// /api/agent-stream route is the cost gate, so this is inert until a chat fires.
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AgentBridge />
    </>
  );
}
