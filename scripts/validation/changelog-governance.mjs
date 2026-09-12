export const GOVERNANCE_START_DATE = "2026-09-12";
export const GOVERNANCE_START_EPOCH = Date.UTC(2026, 8, 12);

export const RETROFIT_IDS = new Set([
  "FRAMEWORK-AWARE-SLICE-DISTRIBUTION",
  "SVELTE-FEEDBACK-STATES-DISTRIBUTION",
  "SVELTE-FULL-WIDTH-TOGGLE-DISTRIBUTION",
]);

export const RELATED_PREFIX = "Related: https://resource.rahmanef.com/";
export const TRANSFORM_RE = /\[before:\s*([^\]]+)\]\s*→\s*\[after:\s*([^\]]+)\]/;

export const PUBLIC_CHANGELOG_CUTOFF = "2026-09-09";
export const ROOT_DATED_SECTION = /^###\s+(\d{4}-\d{2}-\d{2})\s+—/;
export const ROOT_SECTION = /^##(?:\s|$)/;
export const ROOT_PUBLIC_ENTRY = /<!--\s*public-changelog:([A-Z0-9][A-Z0-9-]*)\s*-->/;

export const isGovernanceDate = (date) => {
  if (typeof date === "number") {
    return date >= GOVERNANCE_START_EPOCH;
  }

  return date >= GOVERNANCE_START_DATE;
};

export const relatedMissing = (text) => !text.includes(RELATED_PREFIX);

export const transformationMissing = (text) => {
  const match = text.match(TRANSFORM_RE);
  if (!match) return true;
  return match[1].trim().length === 0 || match[2].trim().length === 0;
};

const governanceRequirementErrors = (text) => {
  const violations = [];

  if (relatedMissing(text)) {
    violations.push("missing Related public URL");
  }
  if (transformationMissing(text)) {
    violations.push("missing [before] → [after] transformation");
  }

  return violations;
};

export const isGovernedRootSection = (section, markerId = null) => {
  if (section.date >= GOVERNANCE_START_DATE) return true;
  if (!markerId) return false;

  return RETROFIT_IDS.has(markerId);
};

export const governanceViolationsForText = ({ id, date, text }) => {
  if (!isGovernanceDate(date) && !RETROFIT_IDS.has(id)) return [];

  return governanceRequirementErrors(text);
};

export const governanceErrorsForStructuredEntry = ({ id, date, text, file, line }) => {
  return governanceViolationsForText({ id, date, text }).map(
    (violation) => `${file}:${line} public entry "${id}" ${violation}`,
  );
};

export const governanceErrorsForRootSection = ({ section, file, seen, rootMarkerSeen }) => {
  if (!section) return [];

  const errors = [];

  if (section.date >= PUBLIC_CHANGELOG_CUTOFF && section.markers.length !== 1) {
    const requirement = section.markers.length === 0
      ? "is missing a public-changelog marker"
      : `must contain exactly one public-changelog marker (found ${section.markers.length})`;
    errors.push(`${file}:${section.line} root changelog entry ${requirement}`);
  }

  const entryText = section.lines.join("\n");
  const sectionRelatedMissing = relatedMissing(entryText);
  const sectionTransformMissing = transformationMissing(entryText);

  for (const { id, line } of section.markers) {
    if (!seen.has(id)) {
      errors.push(`${file}:${line} root changelog references missing public entry "${id}"`);
    }

    if (rootMarkerSeen.has(id)) {
      errors.push(
        `${file}:${line} duplicate public-changelog marker "${id}" (first seen at line ${rootMarkerSeen.get(id)})`,
      );
    } else {
      rootMarkerSeen.set(id, line);
    }

    if (!isGovernedRootSection(section, id)) continue;

    if (sectionRelatedMissing) {
      errors.push(`${file}:${line} public-changelog marker "${id}" missing Related public URL`);
    }
    if (sectionTransformMissing) {
      errors.push(
        `${file}:${line} public-changelog marker "${id}" missing [before] → [after] transformation`,
      );
    }
  }

  return errors;
};
