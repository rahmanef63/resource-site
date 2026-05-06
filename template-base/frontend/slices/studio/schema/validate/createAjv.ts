/**
 * createAjv — singleton AJV instance compiled once at module load.
 *
 * Compiles both schemas (ui.schema.json, studio.schema.json) during
 * initialization so subsequent validate calls pay no compilation cost.
 */

import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import type { ValidateFunction } from "ajv";
import uiSchema from "../json-schema/ui.schema.json";
import studioSchema from "../json-schema/studio.schema.json";

// Compile once at module initialisation.
let _ajv: Ajv2020 | null = null;
let _validateUi: ValidateFunction | null = null;
let _validateStudio: ValidateFunction | null = null;

function getAjv(): Ajv2020 {
  if (!_ajv) {
    _ajv = new Ajv2020({
      allErrors: true,
      strict: false, // allow unknown keywords like our "note:" fields
      verbose: true,
    });
    addFormats(_ajv as any);
    _ajv.addSchema(uiSchema, "ui");
    _ajv.addSchema(studioSchema, "studio");
  }
  return _ajv;
}

export function getUiValidator(): ValidateFunction {
  if (!_validateUi) {
    _validateUi = getAjv().getSchema("ui")!;
  }
  return _validateUi;
}

export function getStudioValidator(): ValidateFunction {
  if (!_validateStudio) {
    _validateStudio = getAjv().getSchema("studio")!;
  }
  return _validateStudio;
}
