import type { Database, DatabaseViewConfig, Page, Property, PropertyValue } from "@/features/notion-ui/variants/database/types";

export function visibleProps(db: Database, view: DatabaseViewConfig): Property[] {
  const hidden=new Set(view.hiddenPropIds??[]); return db.properties.filter((p)=>!p.hidden&&!hidden.has(p.id));
}
export function rawText(value: PropertyValue | undefined, prop?: Property): string {
  if(value==null)return "";
  if(Array.isArray(value))return value.map((id)=>prop?.options?.find((o)=>o.id===id)?.name??id).join(", ");
  if(typeof value==="object")return value.date??"";
  if(prop&&(prop.type==="select"||prop.type==="status"))return prop.options?.find((o)=>o.id===value)?.name??String(value);
  return String(value);
}
export function propValue(row: Page, prop: Property): PropertyValue | undefined { return row.rowProps?.[prop.id]; }
export function numeric(value: PropertyValue | undefined): number | null { const n=typeof value==="number"?value:Number(value); return Number.isFinite(n)?n:null; }
export function selectGroupProp(db:Database,view:DatabaseViewConfig):Property|undefined{
  return db.properties.find((p)=>p.id===view.groupBy)??db.properties.find((p)=>p.type==="status"||p.type==="select");
}
export function dateProp(db:Database,view:DatabaseViewConfig):Property|undefined{
  const id=view.timelineStartProp??view.groupBy; return db.properties.find((p)=>p.id===id&&p.type==="date")??db.properties.find((p)=>p.type==="date");
}
export function chartBuckets(rows:Page[],db:Database,view:DatabaseViewConfig){
  const prop=db.properties.find((p)=>p.id===view.chartXProp)??selectGroupProp(db,view); const map=new Map<string,number>();
  for(const row of rows){const key=prop?rawText(propValue(row,prop),prop)||"No value":"Rows";map.set(key,(map.get(key)??0)+1);}
  return [...map].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,view.chartTopN??12);
}
