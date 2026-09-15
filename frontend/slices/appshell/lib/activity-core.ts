export type Activity={id:string;appId?:string;label:string;detail?:string;progress?:number|null;tone?:"active"|"done"|"error"};
let activities:Activity[]=[]; const subs=new Set<()=>void>(); const emit=()=>subs.forEach(f=>f());
export const activityStore={subscribe(cb:()=>void){subs.add(cb);return()=>subs.delete(cb)},get:()=>activities};
export function setActivity(id:string,a:Omit<Activity,"id">){activities=[...activities.filter(x=>x.id!==id),{id,...a}];emit()}
export function clearActivity(id:string){const n=activities.filter(x=>x.id!==id);if(n.length===activities.length)return;activities=n;emit()}
