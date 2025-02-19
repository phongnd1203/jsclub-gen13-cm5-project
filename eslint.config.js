import js from "@eslint/js";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["node_modules/**"] },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  prettierConfigRecommended,
];
