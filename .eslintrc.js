module.exports = {
  extends: ["eslint:recommended", "prettier", "prettier/@typescript-eslint"],
  env: {
    es2020: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
};
