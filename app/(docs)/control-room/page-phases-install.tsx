import { CodeBlock } from "@/components/site/code-block";
import { Section } from "./page-shared";

export function Phase5() {
  return (
    <Section
      eyebrow="Phase 5"
      title="Pick an install path"
      body={
        <>
          <p className="text-muted-foreground">
            Three paths, same end state. Run from your laptop.
          </p>

          <h3 className="text-base font-semibold">A. AI-assisted</h3>
          <p className="text-sm text-muted-foreground">
            The CLI prints a structured prompt + copies it to your clipboard. Paste into
            Claude / Codex / Gemini. The AI triggers the{" "}
            <code className="rounded bg-muted px-1 py-0.5">/sc-all</code> skill if available
            and walks the remaining phases.
          </p>
          <CodeBlock
            code={`npx rahman-cr ai claude     # or: codex | gemini`}
            language="bash"
            filename="terminal"
          />

          <h3 className="text-base font-semibold">B. One-line (non-interactive)</h3>
          <p className="text-sm text-muted-foreground">
            SSHs in, installs Node 22 + Tailscale (optional), clones the repo, generates two
            32-char secrets, writes <code className="rounded bg-muted px-1 py-0.5">.env.local</code>{" "}
            (chmod 600), runs <code className="rounded bg-muted px-1 py-0.5">install-systemd.sh</code>{" "}
            and <code className="rounded bg-muted px-1 py-0.5">deploy.sh main</code>, then
            verifies. Login secret prints once at the end — save it.
          </p>
          <CodeBlock
            code={`# already on tailnet
npx rahman-cr install \\
  --vps user@<ip> \\
  --domain control-room.<tailnet>.ts.net

# fresh VPS not on tailnet yet
npx rahman-cr install \\
  --vps user@<ip> \\
  --domain control-room.<tailnet>.ts.net \\
  --tailscale-key tskey-auth-XXXX`}
            language="bash"
            filename="terminal"
          />

          <h3 className="text-base font-semibold">C. Manual</h3>
          <p className="text-sm text-muted-foreground">
            Walk every step yourself. Good for learning the architecture.
          </p>
          <CodeBlock
            code={`ssh user@<vps-ip>
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/rahmanef63/control-room.git vps-control-room
cd vps-control-room

cp .env.example .env.local
$EDITOR .env.local    # set CONTROL_ROOM_SECRET, _SESSION_SECRET, NEXT_PUBLIC_APP_HOST, _APP_URL
chmod 600 .env.local

npm --prefix frontend install
npm --prefix agent    install
npm --prefix cli      install

sudo bash scripts/install-systemd.sh
bash scripts/deploy.sh main`}
            language="bash"
            filename="terminal (VPS)"
          />
          <p className="text-sm text-muted-foreground">
            Generate the two secrets locally with{" "}
            <code className="rounded bg-muted px-1 py-0.5">openssl rand -hex 32</code> (twice
            — they must be different).
          </p>
        </>
      }
    />
  );
}

export function Phase6() {
  return (
    <Section
      eyebrow="Phase 6"
      title="Verify"
      body={
        <>
          <h3 className="text-base font-semibold">6.1 systemd services</h3>
          <CodeBlock
            code={`ssh user@<vps-ip> 'systemctl is-active vps-control-room-agent vps-control-room-frontend'
# expect:
#   active
#   active`}
            language="bash"
            filename="terminal"
          />

          <h3 className="text-base font-semibold">6.2 Health endpoint</h3>
          <CodeBlock
            code={`ssh user@<vps-ip> 'curl -s http://127.0.0.1:4001/health'
# expect: {"ok":true,...}`}
            language="bash"
            filename="terminal"
          />

          <h3 className="text-base font-semibold">6.3 Browser login</h3>
          <p className="text-sm text-muted-foreground">
            Open <code className="rounded bg-muted px-1 py-0.5">https://control-room.&lt;tailnet&gt;.ts.net</code>
            {" "}(or your custom domain). Paste{" "}
            <code className="rounded bg-muted px-1 py-0.5">CONTROL_ROOM_SECRET</code> from your
            password manager. Spawn a terminal, type <code className="rounded bg-muted px-1 py-0.5">whoami</code>,
            expect your VPS user.
          </p>

          <h3 className="text-base font-semibold">6.4 Install as a PWA</h3>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>iOS Safari</strong>: Share → <strong>Add to Home Screen</strong>
            </li>
            <li>
              <strong>Android Chrome</strong>: ⋮ → <strong>Install app</strong>
            </li>
          </ul>

          <h3 className="text-base font-semibold">6.5 Operational CLI (optional)</h3>
          <p className="text-sm text-muted-foreground">
            Repo ships a standalone TypeScript CLI at{" "}
            <code className="rounded bg-muted px-1 py-0.5">cli/</code> (<code className="rounded bg-muted px-1 py-0.5">@vps-control-room/cli</code>) — query host
            snapshot, list apps, tail events, dispatch actions, manage agents, launch a
            TUI. Reads from a Convex backend via{" "}
            <code className="rounded bg-muted px-1 py-0.5">CONVEX_URL</code> +{" "}
            <code className="rounded bg-muted px-1 py-0.5">CONVEX_ADMIN_KEY</code> (skip
            if you don't run Convex — the web dashboard works HTTP-only).
          </p>
          <CodeBlock
            code={`# from VPS
cd ~/projects/vps-control-room
npm --prefix cli run build
npm --prefix cli run start -- status
npm --prefix cli run start -- apps
npm --prefix cli run start -- events --tail
npm --prefix cli run start -- tui      # interactive`}
            language="bash"
            filename="terminal (VPS)"
          />
        </>
      }
    />
  );
}
