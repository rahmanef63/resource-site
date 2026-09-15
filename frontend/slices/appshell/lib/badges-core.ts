export type AppIconBadge={count?:number;dot?:boolean;progress?:number|null};
let badges:Record<string,AppIconBadge>={}; const subs=new Set<()=>void>(); const emit=()=>subs.forEach(f=>f());
export const badgeStore={subscribe(cb:()=>void){subs.add(cb);return()=>subs.delete(cb)},get:()=>badges,getOne:(id:string)=>badges[id]};
export function setBadge(appId:string,badge:AppIconBadge|null){if(badge===null){if(!(appId in badges))return;const {[appId]:_,...rest}=badges;badges=rest}else badges={...badges,[appId]:badge};emit()}
export function getBadge(appId:string){return badges[appId]}
