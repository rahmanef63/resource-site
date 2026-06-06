# assistant changelog

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  configureAssistantStream injects any async text-delta generator (SSE/AI
  SDK/agent loop); a typing demo stream keeps the UI alive unwired;
  inspector bus inert. Agents/skills/automations persist in localStorage.
