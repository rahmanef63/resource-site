import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "node_modules/**",
      "convex/_generated/**",
      "template-base/**",
      "convex-templates/**",
      "cookbook/**",
      "recipes/**",
      "packages/cli/dist/**",
      "packages/mcp/dist/**",
      "plugins/**",
      "**/*.d.ts",
    ],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  {
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            { name: "@clerk/nextjs", message: "Clerk forbidden in rr. Use @convex-dev/auth + PBKDF2." },
            { name: "@clerk/clerk-react", message: "Clerk forbidden in rr." },
            { name: "@clerk/clerk-sdk-node", message: "Clerk forbidden in rr." },
          ],
          patterns: [
            { group: ["@/slices/*/*"], message: "Slice barrel imports only: @/slices/<name>." },
            { group: ["**/src/*"], message: "src/ folder not used. Use @/slices, @/shared, @convex aliases." },
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "prefer-const": "warn",
    },
  },
  {
    files: ["frontend/slices/*/index.ts", "shared/ui/**/*.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // npm packages use the standard bin/ + src/ Node layout — the app-side
    // "no src/ imports" pattern does not apply there. Clerk stays banned.
    files: ["packages/**"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            { name: "@clerk/nextjs", message: "Clerk forbidden. Use @convex-dev/auth + PBKDF2." },
            { name: "@clerk/clerk-react", message: "Clerk forbidden." },
            { name: "@clerk/clerk-sdk-node", message: "Clerk forbidden." },
          ],
        },
      ],
    },
  },
  {
    files: ["convex/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "convex/ is server-only. No React." },
            { name: "react-dom", message: "convex/ is server-only. No React." },
          ],
          patterns: [{ group: ["next/*"], message: "convex/ is server-only." }],
        },
      ],
    },
  },
];

export default eslintConfig;
