"use client";

import { useEffect, type ComponentType, type ReactNode } from "react";
import { OsDesktop } from "../components/desktop";
import { IconDefaults } from "../components/icon-defaults";
import { configureWindowTitle, startWindowTitleSync } from "../lib/window-title";
import { BrandProvider } from "../registry/brand";
import { FeatureRegistryProvider } from "../registry/feature-registry";
import { ShellConfigProvider } from "../registry/shell-config";
import { CapabilitiesProvider } from "../registry/capabilities";
import { UrlSync } from "../runtime/use-url-sync";
import type { ShellManifest } from "../registry/types";

function withProviders(
  providers: ComponentType<{ children: ReactNode }>[],
  node: ReactNode,
): ReactNode {
  return providers.reduceRight((acc, P) => <P>{acc}</P>, node);
}

/**
 * THE wrapper provider. A project hands it one manifest (brand + apps +
 * features) and gets the whole desktop+mobile shell. appshell core stays
 * brand- and feature-agnostic: everything specific is injected here. Lifts to
 * rr as the single entry point.
 */
export function AppShell({ manifest }: { manifest: ShellManifest }) {
  const features = manifest.features ?? [];
  // Optional agent surface (rr) — a consumer-supplied component that self-
  // registers its tools on the host. Non-visual; mounts once inside the tree.
  const AgentMount = manifest.agentMount;

  // Tab title follows the focused window ("Files — Brand"); audit found it
  // frozen on the SSR metadata. Opt out via manifest.titleSync: false.
  useEffect(() => {
    configureWindowTitle({ suffix: manifest.brand.name, enabled: manifest.titleSync !== false });
    if (manifest.titleSync !== false) startWindowTitleSync();
  }, [manifest.brand.name, manifest.titleSync]);
  const providers = features
    .map((f) => f.provider)
    .filter((p): p is ComponentType<{ children: ReactNode }> => Boolean(p));

  // IconDefaults sets phosphor weight="fill" + the .os-accent-icons wrapper (icons
  // recolor with the theme accent) for the whole shell — one mount here so every
  // AppShell consumer inherits it (rahmanef-com wires it at the app layout).
  return (
    <IconDefaults>
      <CapabilitiesProvider value={manifest.capabilities}>
        <BrandProvider brand={manifest.brand}>
          <ShellConfigProvider value={{ persistKey: manifest.persistKey ?? "appshell:layout" }}>
            <FeatureRegistryProvider features={features}>
              {manifest.routing !== false && <UrlSync apps={manifest.apps} />}
              {AgentMount ? <AgentMount /> : null}
              {withProviders(providers, <OsDesktop apps={manifest.apps} />)}
            </FeatureRegistryProvider>
          </ShellConfigProvider>
        </BrandProvider>
      </CapabilitiesProvider>
    </IconDefaults>
  );
}
