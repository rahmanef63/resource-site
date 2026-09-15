export type ShellCommand = { id: string; label: string; hint?: string; keywords?: string; run: () => void };
let commands: ShellCommand[] = [];
const sources = new Map<string, ShellCommand[]>();
const subs = new Set<() => void>();
function emit(){ commands=[...sources.values()].flat(); subs.forEach(f=>f()); }
export const commandStore={ subscribe(cb:()=>void){subs.add(cb);return()=>subs.delete(cb)}, get:()=>commands };
export function registerCommands(source:string, cmds:ShellCommand[]):()=>void { sources.set(source,cmds); emit(); return()=>{ if(sources.get(source)===cmds){sources.delete(source);emit()} } }
export function getCommands(){ return commands }
