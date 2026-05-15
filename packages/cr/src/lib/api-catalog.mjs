// API endpoint catalog — surfaced inside AI prompts so the model knows
// where to fetch info / mutate state without guessing.

export const API_CATALOG = {
  hostinger: {
    docs: "https://developers.hostinger.com/",
    auth: "Bearer ${HOSTINGER_API_TOKEN}",
    endpoints: {
      "list-vps": "GET https://developers.hostinger.com/api/vps/v1/virtual-machines",
      "vps-info": "GET https://developers.hostinger.com/api/vps/v1/virtual-machines/{id}",
      "list-dns-zones": "GET https://developers.hostinger.com/api/dns/v1/zones",
      "create-dns-record":
        "POST https://developers.hostinger.com/api/dns/v1/zones/{domain}/records  body: {type:'A', name:'control', content:'<tailscale-ip>', ttl:300}",
      "list-domains": "GET https://developers.hostinger.com/api/domains/v1/portfolio",
    },
  },
  tailscale: {
    docs: "https://tailscale.com/api",
    auth: "Bearer ${TAILSCALE_API_KEY}  (oauth client or api key)",
    endpoints: {
      "create-auth-key":
        "POST https://api.tailscale.com/api/v2/tailnet/-/keys  body: {capabilities:{devices:{create:{reusable:false, ephemeral:false, preauthorized:true, tags:['tag:server']}}}}",
      "list-devices": "GET https://api.tailscale.com/api/v2/tailnet/-/devices",
      "device-info": "GET https://api.tailscale.com/api/v2/device/{deviceId}",
      "enable-funnel":
        "POST https://api.tailscale.com/api/v2/device/{deviceId}/attributes/funnel",
    },
  },
  dokploy: {
    docs: "Self-hosted — see your Dokploy panel /docs",
    auth: "header: x-api-key: ${DOKPLOY_API_KEY}",
    endpoints: {
      "list-apps": "GET ${DOKPLOY_API_URL}/api/application.all",
      "create-app": "POST ${DOKPLOY_API_URL}/api/application.create",
      "deploy-app": "POST ${DOKPLOY_API_URL}/api/application.deploy",
      "create-domain": "POST ${DOKPLOY_API_URL}/api/domain.create",
      "list-domains": "GET ${DOKPLOY_API_URL}/api/domain.all",
    },
    notes: [
      "Backend panel domain is ${DOKPLOY_API_URL} — never set this as a deploy target.",
      "Always use scripts/deploy.js end-to-end (worker binds GitHub provider correctly).",
    ],
  },
  github: {
    docs: "https://docs.github.com/rest",
    auth: "Bearer ${GITHUB_TOKEN}  (gh CLI or PAT)",
    endpoints: {
      "create-repo": "POST https://api.github.com/user/repos  body: {name, private:true}",
      "create-deploy-key":
        "POST https://api.github.com/repos/{owner}/{repo}/keys  body: {title, key, read_only:true}",
      "list-workflows": "GET https://api.github.com/repos/{owner}/{repo}/actions/workflows",
    },
  },
};

export function catalogMarkdown() {
  let out = "";
  for (const [name, group] of Object.entries(API_CATALOG)) {
    out += `\n### ${name}\n`;
    out += `- Docs: ${group.docs}\n`;
    out += `- Auth: \`${group.auth}\`\n`;
    out += "- Endpoints:\n";
    for (const [k, v] of Object.entries(group.endpoints)) {
      out += `  - **${k}** — \`${v}\`\n`;
    }
    if (group.notes?.length) {
      out += "- Notes:\n";
      for (const n of group.notes) out += `  - ${n}\n`;
    }
  }
  return out;
}
