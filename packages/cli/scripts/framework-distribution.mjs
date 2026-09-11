// Framework distribution metadata shared by manifest generation.
// Legacy slicePath remains the React/Next compatibility source.

export function frameworkDistribution(frontend, legacySlicePath) {
  if (!legacySlicePath) return {};
  const declared = frontend?.frameworks ?? {};
  return {
    defaultFramework: frontend?.defaultFramework ?? "react-next",
    frameworks: {
      "react-next": { path: legacySlicePath },
      ...declared,
    },
  };
}
