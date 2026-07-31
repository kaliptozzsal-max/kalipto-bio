import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `kaliptotop/` is a separate application that happens to live inside this
    // directory. It ships its own eslint and TypeScript configs, so linting it
    // from here only produces noise about code this project does not own.
    "kaliptotop/**",
  ]),
]);

export default eslintConfig;
