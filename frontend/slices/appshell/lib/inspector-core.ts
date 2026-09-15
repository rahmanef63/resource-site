export type InspectorProp={label:string;value:string}; export type InspectorAction={id:string;label:string;run:()=>void|Promise<void>}; export type InspectorInfo={subject?:string;props?:InspectorProp[];actions?:InspectorAction[];context?:string;suggestions?:string[]};
const infos=new Map<string,InspectorInfo>();const subs=new Set<()=>void>();let version=0;const emit=()=>{version++;subs.forEach(f=>f())};
export const inspectorStore={subscribe(cb:()=>void){subs.add(cb);return()=>subs.delete(cb)},version:()=>version,get:(id:string|null|undefined)=>id?infos.get(id):undefined};
export function publishInspector(appId:string,info:InspectorInfo){infos.set(appId,info);emit()} export function clearInspector(appId:string){if(infos.delete(appId))emit()}
