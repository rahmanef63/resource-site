import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

export type AccordionType = "single" | "multiple";
export type AccordionContext = {
  open: Writable<Set<string>>;
  toggle: (value: string) => void;
};
export type AccordionItemContext = {
  value: () => string;
  id: () => string;
};

const ROOT_KEY = Symbol("motion-kit-accordion");
const ITEM_KEY = Symbol("motion-kit-accordion-item");

export function setAccordionContext(input: {
  type: () => AccordionType;
  collapsible: () => boolean;
  defaultValue?: string | string[];
}) {
  const initial = Array.isArray(input.defaultValue)
    ? input.defaultValue
    : input.defaultValue ? [input.defaultValue] : [];
  const open = writable(new Set(initial));
  const context: AccordionContext = {
    open,
    toggle(value) {
      open.update((current) => {
        const next = new Set(current);
        const isOpen = next.has(value);
        if (input.type() === "single") {
          next.clear();
          if (!isOpen || !input.collapsible()) next.add(value);
        } else if (isOpen) next.delete(value);
        else next.add(value);
        return next;
      });
    },
  };
  setContext(ROOT_KEY, context);
}

export function getAccordionContext(): AccordionContext {
  const context = getContext<AccordionContext | undefined>(ROOT_KEY);
  if (!context) throw new Error("Accordion child must be used inside <Accordion>.");
  return context;
}

export function setAccordionItem(value: () => string) {
  setContext(ITEM_KEY, {
    value,
    id: () => value().replace(/[^a-zA-Z0-9_-]/g, "-"),
  } satisfies AccordionItemContext);
}

export function getAccordionItem(): AccordionItemContext {
  const item = getContext<AccordionItemContext | undefined>(ITEM_KEY);
  if (!item) throw new Error("Accordion trigger/content must be used inside <AccordionItem>.");
  return item;
}
