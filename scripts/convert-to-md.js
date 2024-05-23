#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readFile, writeFile } from "fs/promises";
import { convertProtoToMdFile } from "./utils/convert-utils.js";

// Handle CLI arguments

const argv = yargs(hideBin(process.argv))
  .usage("\nThis script converts GitHub issues to markdown files.")
  .option("i", {
    alias: "issue",
    describe: "Convert ith issue",
    type: "number",
    default: 0,
  })
  .option("n", {
    alias: "number",
    describe: "Convert first n issues",
    type: "number",
    default: 0,
  })
  .option("r", {
    alias: "randomize",
    describe: "Randomize tags in generated files",
    type: "boolean",
  })
  .option("v", {
    alias: "verbose",
    describe: "Run with verbose logging",
    type: "boolean",
  })

  .help("h")
  .alias("h", "help").argv;

if (argv.i === 0 && argv.n === 0) {
  console.error("Please provide either -i or -n option.");
  process.exit(1);
}

// console.error(`argv: ${JSON.stringify(argv, null, 2)}`);

// Prepare and perform the conversion

// config
const dataFile = "./src/data/issues.json";
const prototypeFile = "./scripts/utils/prototype.md";
const destDir = "./src/content/sessions/converted/";

// input data
const data = await readFile(dataFile, "utf8");
const issues = JSON.parse(data);
issues.reverse();
const prototype = await readFile(prototypeFile, "utf8");

// Convert issues to markdown files in range [fromIdx, toIdx)

let fromIdx = 0;
let toIdx = 0;

if (argv.i > 0) {
  console.error(`Converting ${getOrdinalSuffix(argv.i)} issue...`);
  fromIdx = argv.i - 1;
  toIdx = argv.i;
} else if (argv.n > 0) {
  console.error(`Converting first ${argv.n} issues...`);
  fromIdx = 0;
  toIdx = argv.n;
}

issues.slice(fromIdx, toIdx).forEach((issue, index) => {
  convertProtoToMdFile(issue, prototype, destDir, argv.randomize, argv.verbose);
});

/**
 *
 * @param {number} num
 * @returns {string} ordinal suffix for a number
 */
function getOrdinalSuffix(num) {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;

  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}
