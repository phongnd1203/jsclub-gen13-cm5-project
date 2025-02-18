import js from "@eslint/js";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["node_modules/**"] },
  js.configs.recommended,
  prettierConfigRecommended,
];
