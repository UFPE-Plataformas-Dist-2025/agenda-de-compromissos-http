import js from "@eslint/js";
import globals from "globals";
import jest from "eslint-plugin-jest";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest", 
      sourceType: "module", 
      globals: {
        ...globals.node, 
      },
    },
    rules: {
      ...js.configs.recommended.rules, 
    },
  },
  {
    files: ["**/*.test.js"], 
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
    },
  },
];