import { registerCommands } from "../../appshell/lib/commands-core";
import { BUILTIN_SHELL_META, setShell } from "../../appshell/registry/shell-core";
import "../../appshell/lib/focus-mode-core";
import "../../appshell/lib/layouts-core";
import "../../appshell/lib/profiles-core";
import "../../appshell/lib/spaces-core";
import "../../appshell/lib/window-tabs-core";
registerCommands("shells", BUILTIN_SHELL_META.filter(s=>s.id!=="mobile").map(s=>({id:`shell:${s.id}`,label:`Switch ${s.surface} shell: ${s.label}`,hint:"Shell",keywords:`os layout ${s.id}`,run:()=>setShell(s.surface,s.id)})));
