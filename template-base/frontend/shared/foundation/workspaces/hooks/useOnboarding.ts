import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { OnboardingData } from "../types";

export function useOnboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    type: "personal",
    description: "",
  });

  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const complete = async (): Promise<Id<"workspaces"> | null> => {
    // Mirror the server slug normalization and add duplicate retries
    const slugify = (s: string) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, "")
        .replace(/\s+/g, "")
        .replace(/-+/g, "")
        .replace(/^-|-$/g, "");

    const base = slugify(data.name) || "workspace";
    let attempt = 0;
    while (attempt < 10) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      try {
        const workspaceId = await createWorkspace({
          name: data.name,
          slug: candidate,
          type: data.type,
          description: data.description,
          isPublic: false,
        });
        return workspaceId;
      } catch (error: any) {
        const msg = String(error?.message || error);
        const duplicate = msg.includes("slug already exists") || (msg.includes("slug") && msg.includes("exists"));
        if (!duplicate) {
          console.error(error);
          break;
        }
        attempt += 1;
      }
    }
    return null;
  };

  return {
    step,
    data,
    updateData,
    nextStep,
    prevStep,
    complete,
    canProceed: step === 1 ? data.name.trim().length > 0 : true
  };
}
