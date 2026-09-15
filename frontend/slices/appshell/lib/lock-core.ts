import { registerCommands } from "./commands-core"; let locked=false;let guard:(()=>boolean|Promise<boolean>)|null=null;const subs=new Set<()=>void>();const emit=()=>subs.forEach(f=>f());
export const lockStore={subscribe(cb:()=>void){subs.add(cb);return()=>subs.delete(cb)},get:()=>locked}; export function lock(){if(!locked){locked=true;emit()}}
export async function requestUnlock(){if(!locked)return true;const ok=guard?await guard():true;if(ok){locked=false;emit()}return ok}
export function setUnlockGuard(fn:(()=>boolean|Promise<boolean>)|null){guard=fn}
const KEY="sv:autolock";export function autoLockMinutes(){if(typeof localStorage==="undefined")return null;const v=Number(localStorage.getItem(KEY));return Number.isFinite(v)&&v>0?v:null}
export function setAutoLockMinutes(min:number|null){try{if(min&&min>0)localStorage.setItem(KEY,String(min));else localStorage.removeItem(KEY)}catch{}emit()}
registerCommands("lock",[{id:"lock:now",label:"Lock screen",hint:"System",keywords:"privacy curtain idle away",run:lock}]);
