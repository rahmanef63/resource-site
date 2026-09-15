import { setBadge } from "./badges-core";
export type ToastTone="default"|"success"|"error"; export type ToastAction={label:string;onClick:()=>void};
export type Toast={id:number;message:string;tone:ToastTone;action?:ToastAction};
export type ToastOptions={tone?:ToastTone;duration?:number;action?:ToastAction;appId?:string};
export type NotificationItem={id:number;message:string;tone:ToastTone;ts:number;read:boolean;appId?:string;action?:ToastAction};
let toasts:Toast[]=[];let log:NotificationItem[]=[];let seq=0;let quiet=false;const LOG_CAP=60;let badgedApps=new Set<string>();
const toastSubs=new Set<()=>void>(), logSubs=new Set<()=>void>(); const emit=()=>toastSubs.forEach(f=>f()), emitLog=()=>logSubs.forEach(f=>f());
export const toastStore={subscribe(cb:()=>void){toastSubs.add(cb);return()=>toastSubs.delete(cb)},get:()=>toasts};
export const notificationStore={subscribe(cb:()=>void){logSubs.add(cb);return()=>logSubs.delete(cb)},get:()=>log};
function syncBadges(){const c=new Map<string,number>();for(const n of log)if(n.appId&&!n.read)c.set(n.appId,(c.get(n.appId)??0)+1);for(const id of badgedApps)if(!c.has(id))setBadge(id,null);c.forEach((count,id)=>setBadge(id,{count}));badgedApps=new Set(c.keys())}
export function setToastsQuiet(v:boolean){quiet=v}
export function toast(message:string,opts:ToastOptions={}){const id=++seq,tone=opts.tone??"default";if(!quiet)toasts=[...toasts,{id,message,tone,action:opts.action}];const ts=typeof Date!=="undefined"?Date.now():0;log=[{id,message,tone,ts,read:false,appId:opts.appId,action:opts.action},...log].slice(0,LOG_CAP);emit();emitLog();syncBadges();const duration=opts.duration??(opts.action?0:3500);if(typeof window!=="undefined"&&duration>0)window.setTimeout(()=>dismissToast(id),duration);return id}
export function dismissToast(id:number){const n=toasts.filter(t=>t.id!==id);if(n.length===toasts.length)return;toasts=n;emit()}
export function dismissNotification(id:number){const n=log.filter(x=>x.id!==id);if(n.length===log.length)return;log=n;emitLog();syncBadges()}
export function clearNotifications(){if(!log.length)return;log=[];emitLog();syncBadges()}
export function markNotificationsRead(){if(!log.some(n=>!n.read))return;log=log.map(n=>n.read?n:{...n,read:true});emitLog();syncBadges()}
