import kleur from "kleur";
import { buildPrompt, providers } from "../lib/prompt-builder.mjs";
import { tryCopy } from "../lib/clipboard.mjs";

export async function runAi(args) {
  const provider = args[0]?.toLowerCase();
  const validProviders = providers();

  if (!provider || !validProviders.includes(provider)) {
    console.error(
      kleur.red("Pick a provider:"),
      validProviders.map((p) => kleur.cyan(p)).join(" | "),
    );
    console.error(`\nExample: ${kleur.bold("npx @rahman/cr ai claude")}`);
    process.exit(1);
  }

  const prompt = buildPrompt(provider);
  process.stdout.write(prompt);
  process.stdout.write("\n");

  const copied = await tryCopy(prompt);
  if (copied) {
    console.error(
      kleur.gray(`\n[copied to clipboard via ${copied}] — paste into ${provider}.`),
    );
  } else {
    console.error(
      kleur.gray(
        "\n[clipboard tool not found] — copy the prompt above and paste into " +
          provider +
          ".",
      ),
    );
  }
}
