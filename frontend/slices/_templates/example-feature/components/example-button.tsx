"use client";

import { Button } from "@/components/ui/button";

export function ExampleButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button type="button" variant="default" onClick={onClick}>
      Example action
    </Button>
  );
}
