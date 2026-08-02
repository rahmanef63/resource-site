import { Terminal } from "@/features/os-terminal";

// Live preview: the shell emulator in mock mode — 17 built-ins (try `help`,
// `neofetch`, `ls`, `mkdir x && cd x`) over an in-memory fs, arrow-key
// history. Live passthrough: configureTerminal({ mode:"live", fs, exec }).

export default function TerminalPreview() {
  return (
    <div className="h-dvh w-full">
      <Terminal />
    </div>
  );
}
