import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ...js.configs.recommended,
    ignores: [
      "docs/**",
      "public/templates/compiled/**",
      "node_modules/**"
    ]
  },
  
  {
    files: ["**/*.js"],
    ignores: [
      "docs/**",
      "public/templates/compiled/**",
      "node_modules/**"
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        "Handlebars": "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },
  
  {
    files: ["server.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  
  {
    files: ["public/templates/compiled/**/*.js"],
    languageOptions: {
      globals: {
        "Handlebars": "readonly",
        "helpers": "readonly",
        "partials": "readonly",
        "data": "readonly",
        "alias1": "readonly",
        "alias2": "readonly",
        "container": "readonly",
        "depth0": "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }
];