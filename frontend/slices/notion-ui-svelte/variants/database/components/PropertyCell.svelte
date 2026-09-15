<script lang="ts">
  import type { Database, Page, Property, PropertyValue } from "@/features/notion-ui/variants/database/types";
  import { evalFormula, formatFormulaValue } from "@/features/notion-ui/variants/database/lib/formulaEngine";
  import { rawText } from "../lib/view-core";
  let { prop, value=null, row, db, pages=[], readOnly=false, onChange } = $props<{prop:Property;value?:PropertyValue;row:Page;db:Database;pages?:Page[];readOnly?:boolean;onChange?:(value:PropertyValue)=>void}>();
  let text=$derived(rawText(value,prop));
  let computed=$derived(prop.type==="formula"?formatFormulaValue(evalFormula(prop.formulaExpression??"",{row,db,pages}).value):text);
  const input="w-full min-w-24 rounded border border-transparent bg-transparent px-1.5 py-1 text-xs outline-none hover:border-border focus:border-border";
  function multi(e:Event){const el=e.currentTarget as HTMLSelectElement;onChange?.([...el.selectedOptions].map((o)=>o.value));}
</script>
{#if prop.type==="checkbox"}<input type="checkbox" checked={value===true} disabled={readOnly} onchange={(e)=>onChange?.(e.currentTarget.checked)}/>
{:else if prop.type==="number"}<input class={input} type="number" value={typeof value==="number"?value:""} disabled={readOnly} oninput={(e)=>onChange?.(e.currentTarget.value===""?null:Number(e.currentTarget.value))}/>
{:else if prop.type==="select"||prop.type==="status"}<select class={input} value={typeof value==="string"?value:""} disabled={readOnly} onchange={(e)=>onChange?.(e.currentTarget.value||null)}><option value="">—</option>{#each prop.options??[] as option (option.id)}<option value={option.id}>{option.name}</option>{/each}</select>
{:else if prop.type==="multi_select"}<select class={input} multiple value={Array.isArray(value)?value:[]} disabled={readOnly} onchange={multi}>{#each prop.options??[] as option (option.id)}<option value={option.id}>{option.name}</option>{/each}</select>
{:else if prop.type==="date"}<input class={input} type="date" value={typeof value==="object"&&value&&!Array.isArray(value)?value.date??"":typeof value==="string"?value:""} disabled={readOnly} onchange={(e)=>onChange?.(e.currentTarget.value?{date:e.currentTarget.value}:null)}/>
{:else if ["formula","created_time","last_edited_time","unique_id","created_by","last_edited_by","rollup"].includes(prop.type)}<span class="block min-w-20 px-1.5 py-1 text-xs text-muted-foreground">{computed||"—"}</span>
{:else}<input class={input} type={prop.type==="email"?"email":prop.type==="url"?"url":prop.type==="phone"?"tel":"text"} value={text} disabled={readOnly} oninput={(e)=>onChange?.(e.currentTarget.value||null)}/>{/if}
