import { CodeBlock } from "@/components/site/code-block";
import { Section, ExtLink } from "./page-shared";

export function ApiReference() {
  return (
    <Section
      eyebrow="Reference"
      title="API endpoints (AI / automation)"
      body={
        <>
          <p className="text-muted-foreground">
            The AI prompt embeds this catalog. Listed here for direct reference.
          </p>

          <h3 className="text-base font-semibold">Tailscale</h3>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li>Docs: <ExtLink href="https://tailscale.com/api">tailscale.com/api</ExtLink></li>
            <li>Auth: <code className="rounded bg-muted px-1 py-0.5">Bearer ${"{TAILSCALE_API_KEY}"}</code></li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> /api/v2/tailnet/-/keys — create auth key</li>
            <li><code className="rounded bg-muted px-1 py-0.5">GET</code> /api/v2/tailnet/-/devices — list devices</li>
          </ul>

          <h3 className="text-base font-semibold">Hostinger</h3>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li>Docs: <ExtLink href="https://developers.hostinger.com/">developers.hostinger.com</ExtLink></li>
            <li>Auth: <code className="rounded bg-muted px-1 py-0.5">Bearer ${"{HOSTINGER_API_TOKEN}"}</code></li>
            <li><code className="rounded bg-muted px-1 py-0.5">GET</code> /api/vps/v1/virtual-machines — list VPS</li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> /api/dns/v1/zones/{"{domain}"}/records — create DNS record</li>
          </ul>

          <h3 className="text-base font-semibold">Dokploy (optional)</h3>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li>Auth header: <code className="rounded bg-muted px-1 py-0.5">x-api-key: ${"{DOKPLOY_API_KEY}"}</code></li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> {"${DOKPLOY_API_URL}"}/api/application.create</li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> {"${DOKPLOY_API_URL}"}/api/application.deploy</li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> {"${DOKPLOY_API_URL}"}/api/domain.create</li>
          </ul>

          <h3 className="text-base font-semibold">GitHub</h3>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li>Docs: <ExtLink href="https://docs.github.com/rest">docs.github.com/rest</ExtLink></li>
            <li>Generate a PAT: <ExtLink href="https://github.com/settings/tokens">github.com/settings/tokens</ExtLink></li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> https://api.github.com/user/repos — create repo</li>
            <li><code className="rounded bg-muted px-1 py-0.5">POST</code> /repos/{"{owner}"}/{"{repo}"}/keys — create deploy key</li>
          </ul>
        </>
      }
    />
  );
}

export function Operations() {
  return (
    <Section
      eyebrow="Operations"
      title="Day-2: update, rollback, rotate"
      body={
        <>
          <h3 className="text-base font-semibold">Deploy an update</h3>
          <CodeBlock
            code={`ssh user@<vps-ip>
cd ~/projects/vps-control-room
git pull origin main
bash scripts/deploy.sh main`}
            language="bash"
            filename="terminal (VPS)"
          />

          <h3 className="text-base font-semibold">Rollback (one-shot)</h3>
          <CodeBlock
            code={`cd ~/projects/vps-control-room/frontend
mv .next .next-broken
mv .next-previous .next
sudo systemctl restart vps-control-room-frontend`}
            language="bash"
            filename="terminal (VPS)"
          />

          <h3 className="text-base font-semibold">Rotate secrets</h3>
          <CodeBlock
            code={`# on the VPS
NEW=$(openssl rand -hex 32)
NEW_SESSION=$(openssl rand -hex 32)
sed -i "s/^CONTROL_ROOM_SECRET=.*/CONTROL_ROOM_SECRET=$NEW/" .env.local
sed -i "s/^CONTROL_ROOM_SESSION_SECRET=.*/CONTROL_ROOM_SESSION_SECRET=$NEW_SESSION/" .env.local
sudo systemctl restart vps-control-room-agent vps-control-room-frontend
echo "new login: $NEW"
echo "(save in password manager, then clear scrollback)"`}
            language="bash"
            filename="terminal (VPS)"
          />
        </>
      }
    />
  );
}

export function ScAllAnchor() {
  return (
    <Section
      eyebrow="Skill"
      title="/sc-all anchor"
      body={
        <>
          <p className="text-muted-foreground">
            The AI prompt auto-loads the{" "}
            <code className="rounded bg-muted px-1 py-0.5">sc-all</code> skill if you have it
            installed at <code className="rounded bg-muted px-1 py-0.5">~/.claude/skills/sc-all/</code>{" "}
            (or the equivalent for Codex / Gemini). <code className="rounded bg-muted px-1 py-0.5">/sc-all</code>{" "}
            orchestrates:
          </p>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            <li>GitHub repo ensure (private fork) + push</li>
            <li>Dokploy project + application creation</li>
            <li>Self-hosted Convex deploy (skipped — Control Room is terminal-only)</li>
            <li>DNS record creation</li>
            <li>Deploy poll until done</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            For Control Room, <code className="rounded bg-muted px-1 py-0.5">/sc-all</code>{" "}
            skips Convex but reuses the GitHub + Dokploy + DNS phases. The{" "}
            <code className="rounded bg-muted px-1 py-0.5">rahman-cr install</code> one-liner
            also reuses this sequencing.
          </p>
        </>
      }
    />
  );
}

const TROUBLE_ROWS: [string, string, string][] = [
  ["ssh: connection refused", "VPS firewall blocking port 22", "Open port 22 in provider firewall"],
  ["tailscale up hangs", "Auth key expired or wrong tags", "Regenerate at admin.tailscale.com/settings/keys"],
  ["dig returns nothing", "DNS not propagated", "Wait 5 min, try dig +trace"],
  ["Login page says invalid", "Secret mismatch", "Re-check .env.local on the VPS"],
  ["White dashboard after deploy", "Build failed silently", "journalctl -u vps-control-room-frontend"],
  ["systemctl shows failed", "Wrong WorkingDirectory", "Re-run scripts/install-systemd.sh from repo root"],
];

export function Troubleshoot() {
  return (
    <Section
      eyebrow="Troubleshoot"
      title="Common symptoms"
      body={
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Symptom</th>
                <th className="px-3 py-2 text-left font-medium">Likely cause</th>
                <th className="px-3 py-2 text-left font-medium">Fix</th>
              </tr>
            </thead>
            <tbody>
              {TROUBLE_ROWS.map((row) => (
                <tr key={row[0]} className="border-t">
                  {row.map((cell, i) => (
                    <td key={i} className="px-3 py-2 align-top">
                      {i === 2 ? <code className="rounded bg-muted px-1 py-0.5 text-xs">{cell}</code> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
