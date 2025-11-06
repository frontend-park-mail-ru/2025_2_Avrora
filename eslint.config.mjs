import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ...js.configs.recommended,
    ignores: [
      "docs/**",
      "public/templates/compiled/",
      "node_modules/**",
      "dist/**",
    ]
  },

  {
    files: ["**/*.js"],
    ignores: [
      "docs/**",
      "public/templates/compiled/*.js",
      "node_modules/**",
      "dist/**",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        "Handlebars": "readonly",
        "HandlebarsTemplates": "readonly"
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
    files: ["public/templates/compiled/*.js"],
    languageOptions: {
      globals: {
        "Handlebars": "readonly",
        "template": "readonly",
        "templates": "readonly",
        "container": "readonly",
        "depth0": "readonly",
        "helpers": "readonly",
        "partials": "readonly",
        "data": "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }
];