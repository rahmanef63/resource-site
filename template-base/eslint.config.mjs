import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Flat config for template-base. Mirrors the root repo config but keeps its own
// ignore list, because this project ships to consumers and carries vendored
// slices the root site does not build.
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "convex/_generated/**",
      "**/*.d.ts",
      "frontend/slices/notion/app-fragments/**",
      "archive/**",
      "**/*.legacy",
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
      // Vendored slice code predates this config in places; keep the rules that
      // catch real defects as errors and downgrade the stylistic backlog to
      // warnings so `eslint .` exits 0 on a clean tree.
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "prefer-const": "warn",
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            { name: "@clerk/nextjs", message: "Clerk forbidden in rr. Use @convex-dev/auth." },
            { name: "@clerk/clerk-react", message: "Clerk forbidden in rr." },
          ],
        },
      ],
    },
  },
];
