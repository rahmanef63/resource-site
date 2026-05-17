"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { buildSections } from "./docs-sidebar/build-sections";
import { SectionGroup } from "./docs-sidebar/nav-parts";

export function DocsSidebar() {
  const pathname = usePathname();
  const sections = React.useMemo(() => buildSections(), []);

  return (
    <nav className="flex flex-col gap-4 px-3 pt-6 pb-8">
      {sections.map((section) => (
        <SectionGroup key={section.label} section={section} pathname={pathname} />
      ))}
    </nav>
  );
}
