#!/usr/bin/env node
import teenytest from "teenytest";

const defaults = {
  cwd: process.cwd(),
  output: console.log,
  name: [],
  helperPath: "test/helper.js",
  asyncTimeout: 5000,
  configurator: null,
  plugins: [],
};

teenytest("test/**/*.{js,mjs}", defaults, function (er, passing) {
  process.exit(!er && passing ? 0 : 1);
});
