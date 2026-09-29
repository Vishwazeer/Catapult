import js from "@eslint/js";
import next from "eslint-config-next";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
