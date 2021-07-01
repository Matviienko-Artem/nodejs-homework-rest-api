module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    "jest/glabals": true,
  },
  extends: ["standard", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "comma-dangle": "off",
    "space-before-function-paren": "off",
  },
};
