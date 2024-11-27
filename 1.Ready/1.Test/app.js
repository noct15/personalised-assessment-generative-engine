"use strict";

/**
 * Script to generate multiple versions of student datasets by randomly sampling rows from a master CSV file.
 *
 * This script reads a master CSV file, randomly selects a subset of rows for each version,
 * and writes the subset to separate output files for each version.
 *
 * Input:
 * - A master CSV file located at `inFiles/Video Game Sales.csv`
 *
 * Output:
 * - For each version, a folder in `outFiles/` containing a CSV file (`Video Game Sales.csv`)
 *   with a random subset of rows from the master file.
 *
 * Usage:
 * - Set `NUM_VERSIONS` to the number of versions you wish to create.
 * - Run `npm install` from the `1.Ready/1.Test` directory to install dependencies.
 * - Run `node app.js` from the `1.Ready/1.Test` directory.
 *
 * Notes:
 * - The number of rows selected for each version is randomly chosen between `numToPickMin` and `numToPickMax`.
 * - The header row is always included in each output file.
 */

const NUM_VERSIONS = 3; // Number of assessment versions to create

const inPath = "inFiles"; // Input directory
const outPath = "outFiles"; // Output directory

const studentCsvFileName = "Video Game Sales.csv"; // Input CSV file name

const numToPickMin = 16450; // Minimum number of rows to pick (excluding header)
const numToPickMax = 16550; // Maximum number of rows to pick (excluding header)

const _ = require("lodash");
const async = require("async");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mkpath = require("mkpath");
const shortid = require("shortid");

// Configure allowed characters for hash generation (excluding '-' which is used as a delimiter)
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@"
);

let hashes = [];

// Generate a unique hash for each version
for (let i = 0; i < NUM_VERSIONS; i++) {
  hashes.push(shortid.generate());
}

console.log(require("os").EOL);
console.log(`All ${hashes.length} files ready`);
console.log("==============");

const studentLines = [];

// Execute the main processing functions in series
async.series([processInFiles, processOutFiles], () => {
  console.log("---------------------------");
  console.log("All files processed");
  process.exit(0);
});

/**
 * Reads the input CSV file and stores each line in an array.
 * @param {function} whenDone - Callback function when done.
 */
function processInFiles(whenDone) {
  async.parallel(
    [
      async.apply(
        readCsvToArray,
        path.join(inPath, studentCsvFileName),
        studentLines
      ),
    ],
    () => {
      console.log("Input files processed");
      whenDone(null);
    }
  );
}

/**
 * Reads a CSV file line by line and appends each line to the provided array.
 * @param {string} csvFilePath - Path to the CSV file.
 * @param {Array} array - Array to store the lines.
 * @param {function} whenDone - Callback function when done.
 */
function readCsvToArray(csvFilePath, array, whenDone) {
  readline
    .createInterface({
      input: fs.createReadStream(csvFilePath),
      terminal: false,
    })
    .on("line", (line) => {
      array.push(line);
    })
    .on("close", () => {
      whenDone(null);
    });
}

/**
 * Generates output files for each version by randomly sampling rows from the master CSV.
 * @param {function} allVersionsDone - Callback function when all versions are processed.
 */
function processOutFiles(allVersionsDone) {
  console.log(`Processing output files for each version`);

  let versionsLeft = hashes.length;

  async.each(
    hashes,
    (hash, versionDone) => {
      const lineNums = _.range(studentLines.length);
      const numToPick = _.random(numToPickMin, numToPickMax);

      process.stdout.write(`${hash}: Processing ... `);

      // Randomly select line numbers to pick
      let selectedLineNumbers = _.sampleSize(lineNums, numToPick);

      // Ensure line numbers are sorted and unique
      selectedLineNumbers = _.sortedUniq(
        selectedLineNumbers.sort((a, b) => a - b)
      );

      // Always include the header (line 0)
      if (selectedLineNumbers.indexOf(0) === -1) {
        selectedLineNumbers.unshift(0);
      }

      // Create output directory for the version
      mkpath.sync(path.join(outPath, hash));

      // Write the selected lines to the output CSV file
      fs.writeFileSync(
        path.join(outPath, hash, `Video Game Sales.csv`),
        selectedLineNumbers.map((v) => studentLines[v]).join("\n")
      );

      versionsLeft--;
      process.stdout.write(`done\n`);
      versionDone(null);
    },
    (err) => {
      if (versionsLeft === 0) {
        console.log("All versions processed:");
        console.log(hashes);
        allVersionsDone(err);
      }
    }
  );
}
