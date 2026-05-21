"use client";

import * as React from "react";
import { CodeBlock } from "@/features/code-block";

const SAMPLE = `// Notion-style code block primitive.
// Language detection, syntax highlight, copy button.
async function fetchUsers(workspaceId: string) {
  const res = await fetch(\`/api/users?ws=\${workspaceId}\`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users.filter((u) => u.status === 'active');
}

fetchUsers('ws_demo').then((users) => console.log(users.length));`;

/** Minimal interactive preview: editable code + language selector. */
export default function Page() {
  const [text, setText] = React.useState(SAMPLE);
  const [lang, setLang] = React.useState("typescript");
  const refReg = React.useCallback((_el: HTMLElement | null) => {}, []);
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl place-items-center bg-background p-6">
      <div className="w-full">
        <CodeBlock
          text={text}
          onText={setText}
          lang={lang}
          onLang={setLang}
          registerRef={refReg}
          onKeyDown={() => {}}
        />
      </div>
    </main>
  );
}
