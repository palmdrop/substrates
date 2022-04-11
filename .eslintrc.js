module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    extraFileExtensions: [".svelte"]
  },
  overrides: [{
    files: ["*.svelte"],
    processor: "svelte3/svelte3"
  }],
  plugins: [
    "svelte3",
    "@typescript-eslint"
  ],
  settings: {
    'svelte3/typescript': require('typescript'),
    // ignore style tags in Svelte because of Tailwind CSS
    // See https://github.com/sveltejs/eslint-plugin-svelte3/issues/70
    'svelte3/ignore-styles': () => true
  },
  ignorePatterns: [
    "node_modules",
    ".eslintrc.js"
  ],
  rules: {
    "@typescript-eslint/indent": [
      1,
      2
    ],
    "linebreak-style": [
      1,
      "unix"
    ],
    "quotes": [
      1,
      "single"
    ],
    "semi": [
      1,
      "always"
    ],
    "no-multi-spaces": [
      1
    ],
    "space-in-parens": [1, "never"],
    "object-curly-spacing": [1, "always"],
    "array-bracket-spacing": [1, "never"],
    "template-curly-spacing": [1, "always"],
    "key-spacing": [
      1, {
        "beforeColon": false,
        "afterColon": true
      }
    ],
    "space-infix-ops": [
      1, {
        "int32Hint": false
      }
    ],
    "space-unary-ops": [
      1, {
        "words": true,
        "nonwords": false,
        "overrides": {
          "new": true,
          "++": false
        }
    }],
    "@typescript-eslint/type-annotation-spacing": [
      1, {
        "before": false,
        "after": true,
        "overrides": { 
          arrow: { 
            before: true, 
            after: true 
          }
        }
      }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/restrict-plus-operands": "off"
  }
}
