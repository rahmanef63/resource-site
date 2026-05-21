/** database-csv — domain types re-exported from notion-database.
 *
 *  Centralised so internal slice files import from `../types` (relative
 *  within slice) rather than crossing the slice boundary at every call
 *  site. The peer `notion-database` itself re-exports these from
 *  `notion-shell` — see slice.contract.ts for the dep chain. */

export type {
  Database,
  Page,
  Property,
  PropertyType,
  PropertyValue,
  SelectOption,
} from "@/features/notion-database";
