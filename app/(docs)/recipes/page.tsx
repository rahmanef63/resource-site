import { redirect } from "next/navigation";

// Recipes were migrated into the slices catalog (lib/content/recipes is a
// deprecated empty shim). Keep the old URL alive: /recipes → /slices.
export default function RecipesIndexRedirect() {
  redirect("/slices");
}
