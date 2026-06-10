// Agentic tool collection. Wizard state is parent-owned (R3 props-driven),
// so the ctx is a small injectable contract the host page builds from its
// own step/fields state.

import { defineToolCollection, noArgs, num, obj, str } from "@/shared/agentic";

export type OnboardingWizardCtx = {
  /** Read-back: current step index (0-based) + total + field values. */
  status: () => string;
  goto: (step: number) => string;
  setField: (key: string, value: string) => string;
  complete: () => string | Promise<string>;
};

export const onboardingWizardTools = defineToolCollection<OnboardingWizardCtx>({
  namespace: "onboarding-wizard",
  instructions: "Onboarding flow. Read status first; set_field before goto_step/complete; complete finalizes the flow and cannot be replayed.",
  describe: (ctx) => ctx.status(),
  tools: [
    {
      name: "status",
      description: "Read the wizard state (current step, total steps, field values).",
      parameters: noArgs,
      run: (ctx) => ctx.status(),
    },
    {
      name: "goto_step",
      description: "Jump to a step (0-based index).",
      parameters: obj({ "step!": num("step index", { min: 0 }) }),
      run: (ctx, a) => ctx.goto(a.step as number),
    },
    {
      name: "set_field",
      description: "Set a wizard field value.",
      parameters: obj({ "key!": str("field key, e.g. siteName"), "value!": str("field value") }),
      run: (ctx, a) => ctx.setField(a.key as string, a.value as string),
    },
    {
      name: "complete",
      description: "Finish the wizard (runs the host's onComplete).",
      parameters: noArgs,
      run: (ctx) => ctx.complete(),
    },
  ],
});
