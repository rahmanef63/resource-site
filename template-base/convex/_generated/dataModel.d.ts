/**
 * TEMPORARY HAND-WRITTEN STUB.
 * `npx convex dev` overwrites this file with real codegen.
 * Exists only so `tsc --noEmit` runs against the studio extraction
 * without requiring a Convex deployment.
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type TableNames = TableNamesInDataModel<DataModel>;

export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

export type Id<TableName extends TableNames | "_storage" | "_scheduled_functions"> =
  GenericId<TableName>;
