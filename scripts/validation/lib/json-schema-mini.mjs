/**
 * Minimal JSON Schema validator covering the fields used by slice.manifest.v1.
 * Supports: type (object/string/array), required, properties, additionalProperties:false,
 * pattern, enum, items, oneOf, and local "#/..." $ref.
 *
 * Avoids pulling in ajv as a dep until we're sure we want it.
 */

// Resolves local "#/..." $refs against the root schema. Non-local refs unsupported.
export function resolveRef(ref, root) {
  if (!ref.startsWith("#/")) {
    throw new Error(`Only local $ref supported, got: ${ref}`);
  }
  const segments = ref.slice(2).split("/");
  let node = root;
  for (const seg of segments) {
    node = node?.[seg];
    if (node === undefined) {
      throw new Error(`Unresolvable $ref: ${ref}`);
    }
  }
  return node;
}

export function validate(manifest, schema, path = "$", root = schema) {
  const errors = [];

  if (schema.$ref) {
    return validate(manifest, resolveRef(schema.$ref, root), path, root);
  }

  // oneOf: exactly one branch must validate without errors.
  // Pick the branch with zero errors; if none match, report the branch with
  // fewest errors (most likely intended shape) for actionable feedback.
  if (Array.isArray(schema.oneOf)) {
    const branchResults = schema.oneOf.map((branch) => validate(manifest, branch, path, root));
    const passing = branchResults.filter((errs) => errs.length === 0);
    if (passing.length === 1) {
      // single match — accept, continue with any sibling constraints
    } else if (passing.length > 1) {
      errors.push(`${path}: matches more than one oneOf branch (ambiguous)`);
    } else {
      // pick the branch with the fewest errors as the "intended" one
      const best = branchResults.reduce((a, b) => (a.length <= b.length ? a : b));
      errors.push(`${path}: does not match any oneOf branch (closest branch errors below)`);
      errors.push(...best);
    }
    return errors;
  }

  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in manifest)) {
        errors.push(`${path}: missing required field "${key}"`);
      }
    }
  }

  if (schema.type === "object" && schema.properties) {
    for (const [key, val] of Object.entries(manifest)) {
      const propSchema = schema.properties[key];
      if (!propSchema) {
        if (schema.additionalProperties === false) {
          errors.push(`${path}.${key}: unknown property (additionalProperties: false)`);
        }
        continue;
      }
      errors.push(...validate(val, propSchema, `${path}.${key}`, root));
    }
  }

  if (schema.type === "string") {
    if (typeof manifest !== "string") {
      errors.push(`${path}: expected string, got ${typeof manifest}`);
    } else {
      if (schema.pattern) {
        const re = new RegExp(schema.pattern);
        if (!re.test(manifest)) {
          errors.push(`${path}: value "${manifest}" does not match pattern ${schema.pattern}`);
        }
      }
      if (schema.enum && !schema.enum.includes(manifest)) {
        errors.push(`${path}: value "${manifest}" not in enum ${JSON.stringify(schema.enum)}`);
      }
    }
  }

  if (schema.type === "array") {
    if (!Array.isArray(manifest)) {
      errors.push(`${path}: expected array, got ${typeof manifest}`);
    } else if (schema.items) {
      manifest.forEach((item, i) => {
        errors.push(...validate(item, schema.items, `${path}[${i}]`, root));
      });
    }
  }

  if (schema.type === "object" && typeof manifest !== "object") {
    errors.push(`${path}: expected object, got ${typeof manifest}`);
  }

  return errors;
}
