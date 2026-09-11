import { existsSync } from "node:fs";
import path from "node:path";

export function validateFrameworkMetadata(slice, repo) {
  const frontend = slice.frontend;
  if (!frontend || typeof frontend !== "object") return [];

  const errors = [];
  const frameworks = frontend.frameworks;
  const defaultFramework = frontend.defaultFramework ?? "react-next";

  if (!frameworks) {
    if (defaultFramework !== "react-next") {
      errors.push(`frontend.defaultFramework "${defaultFramework}" requires frontend.frameworks to declare that framework`);
    }
    return errors;
  }

  const names = Object.keys(frameworks);
  const available = new Set(names);
  if (frontend.slicePath) available.add("react-next");
  if (!available.has(defaultFramework)) {
    errors.push(`frontend.defaultFramework "${defaultFramework}" is not declared; available: ${[...available].join(", ")}`);
  }
  if (!frontend.defaultFramework && !available.has("react-next")) {
    errors.push("frontend.frameworks must declare defaultFramework when react-next is unavailable");
  }

  const aliases = new Map();
  for (const name of names) {
    const descriptor = frameworks[name] ?? {};
    if (name === "react-next" && frontend.slicePath && descriptor.path !== frontend.slicePath) {
      errors.push("frontend.frameworks.react-next.path must equal legacy frontend.slicePath to avoid an ambiguous React/Next source");
    }
    if (typeof descriptor.path === "string" && !existsSync(path.join(repo, descriptor.path))) {
      errors.push(`frontend.frameworks.${name}.path missing on disk: ${descriptor.path}`);
    }
    for (const alias of descriptor.aliases ?? []) {
      if (available.has(alias) || aliases.has(alias)) {
        errors.push(`frontend.frameworks.${name}: duplicate framework alias "${alias}"`);
      } else {
        aliases.set(alias, name);
      }
    }
  }
  return errors;
}
