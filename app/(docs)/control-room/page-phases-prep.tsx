import { CodeBlock } from "@/components/site/code-block";
import { Section, ExtLink } from "./page-shared";

export function Phase0() {
  return (
    <Section
      eyebrow="Phase 0"
      title="Local prereqs (your laptop)"
      body={
        <>
          <p className="text-muted-foreground">
            Run on <strong>your laptop</strong>, not the VPS.
          </p>
          <CodeBlock code={`npx rahman-cr doctor`} language="bash" filename="terminal" />
          <p className="text-sm text-muted-foreground">
            Confirms Node 18+, <code className="rounded bg-muted px-1 py-0.5">ssh</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5">git</code>, and{" "}
            <code className="rounded bg-muted px-1 py-0.5">openssl</code> are all in PATH.
          </p>
          <p className="text-sm text-muted-foreground">
            Also have ready: an SSH key (
            <code className="rounded bg-muted px-1 py-0.5">~/.ssh/id_ed25519.pub</code>) and a
            password manager — you&apos;ll need to store two 32-char secrets at the end.
          </p>
          <CodeBlock
            code={`# generate an SSH key if you don't have one yet
ssh-keygen -t ed25519 -C "your-email"`}
            language="bash"
            filename="terminal"
          />
        </>
      }
    />
  );
}

export function Phase1() {
  return (
    <Section
      eyebrow="Phase 1"
      title="VPS provisioning"
      body={
        <>
          <p className="text-muted-foreground">
            Bring your own VPS. Tested providers: Hostinger, DigitalOcean, Vultr, Hetzner.
            Minimum Ubuntu 22.04, 1 GB RAM, 5 GB disk, 1 vCPU. Recommended Ubuntu 24.04 LTS,
            2 GB+ RAM.
          </p>
          <p className="text-sm text-muted-foreground">
            After provisioning, confirm you have the public IPv4 and can SSH in.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <ExtLink href="https://www.hostinger.com/vps-hosting">Hostinger VPS</ExtLink>
            <ExtLink href="https://www.digitalocean.com/">DigitalOcean</ExtLink>
            <ExtLink href="https://www.vultr.com/">Vultr</ExtLink>
            <ExtLink href="https://www.hetzner.com/cloud">Hetzner</ExtLink>
          </div>
        </>
      }
    />
  );
}

export function Phase2() {
  return (
    <Section
      eyebrow="Phase 2"
      title="Push SSH key, kill password auth"
      body={
        <>
          <p className="text-muted-foreground">
            Get rid of password auth before doing anything else.
          </p>
          <CodeBlock
            code={`# from your laptop
ssh-copy-id user@<vps-ip>
ssh user@<vps-ip> 'echo ok'   # should print: ok (no password prompt)`}
            language="bash"
            filename="terminal (laptop)"
          />
          <p className="text-sm text-muted-foreground">
            Recommended: disable password auth on the VPS afterward.
          </p>
          <CodeBlock
            code={`# on the VPS
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd`}
            language="bash"
            filename="terminal (VPS)"
          />
        </>
      }
    />
  );
}
