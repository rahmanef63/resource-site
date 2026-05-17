import { CodeBlock } from "@/components/site/code-block";
import { Section, ExtLink } from "./page-shared";

export function Phase3() {
  return (
    <Section
      eyebrow="Phase 3"
      title="Tailscale on the VPS"
      body={
        <>
          <p className="text-muted-foreground">
            The dashboard is designed for{" "}
            <strong>Tailscale-only access</strong>. The reverse proxy binds to the Tailscale
            interface; the public IP never sees the dashboard.
          </p>

          <h3 className="text-base font-semibold">3.1 Generate a Tailscale auth key</h3>
          <p className="text-sm text-muted-foreground">
            Open the keys admin page and click <strong>Generate auth key</strong>:
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <ExtLink href="https://login.tailscale.com/admin/settings/keys">
              Tailscale → Settings → Keys
            </ExtLink>
          </div>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            <li>Reusable: <strong>No</strong></li>
            <li>Ephemeral: <strong>No</strong></li>
            <li>Pre-authorized: <strong>Yes</strong></li>
            <li>
              Tags: <code className="rounded bg-muted px-1 py-0.5">tag:server</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Copy the <code className="rounded bg-muted px-1 py-0.5">tskey-auth-…</code> string —
            you&apos;ll paste it in the next step.
          </p>

          <h3 className="text-base font-semibold">3.2 Install Tailscale on the VPS</h3>
          <CodeBlock
            code={`ssh user@<vps-ip>
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=tskey-auth-XXXX --hostname=control-room
tailscale ip -4    # → 100.x.y.z
exit`}
            language="bash"
            filename="terminal (VPS)"
          />

          <h3 className="text-base font-semibold">3.3 Note your tailnet hostname</h3>
          <p className="text-sm text-muted-foreground">
            Your dashboard URL will be{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              control-room.&lt;tailnet&gt;.ts.net
            </code>
            . Find your tailnet name at:
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <ExtLink href="https://login.tailscale.com/admin/dns">
              Tailscale → DNS
            </ExtLink>
          </div>
        </>
      }
    />
  );
}

export function Phase4() {
  return (
    <Section
      eyebrow="Phase 4 (optional)"
      title="Custom DNS"
      body={
        <>
          <p className="text-muted-foreground">
            Skip this phase if you&apos;re happy using{" "}
            <code className="rounded bg-muted px-1 py-0.5">.ts.net</code>. Otherwise, create an
            A record pointing your custom subdomain at the Tailscale 100.x IP.
          </p>

          <h3 className="text-base font-semibold">4.1 Manual via your DNS provider</h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                  <th className="px-3 py-2 text-left font-medium">TTL</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-2 font-mono">A</td>
                  <td className="px-3 py-2 font-mono">control</td>
                  <td className="px-3 py-2 font-mono">100.x.y.z</td>
                  <td className="px-3 py-2 font-mono">300</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold">4.2 Hostinger API (one curl)</h3>
          <p className="text-sm text-muted-foreground">
            Generate a token at{" "}
            <ExtLink href="https://developers.hostinger.com/">developers.hostinger.com</ExtLink>{" "}
            first.
          </p>
          <CodeBlock
            code={`# replace YOUR_TOKEN, yourdomain.com, and 100.x.y.z
curl -X POST https://developers.hostinger.com/api/dns/v1/zones/yourdomain.com/records \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","name":"control","content":"100.x.y.z","ttl":300}'`}
            language="bash"
            filename="terminal"
          />

          <h3 className="text-base font-semibold">4.3 Verify</h3>
          <CodeBlock
            code={`dig +short control.yourdomain.com    # → 100.x.y.z`}
            language="bash"
            filename="terminal"
          />

          <p className="text-sm text-amber-700 dark:text-amber-400">
            ⚠️ <strong>Do NOT</strong> set the A record to your public IP. That defeats the
            threat model — Traefik binds to Tailscale only, so a public record just leaks the
            VPS IP.
          </p>
        </>
      }
    />
  );
}
