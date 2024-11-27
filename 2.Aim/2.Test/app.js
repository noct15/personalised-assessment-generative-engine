"use strict";

/**
 * Script to generate personalised questions and answers for each version of the assessment.
 *
 * This script reads the version-specific datasets and generates questions and answers
 * based on the data for each version.
 *
 * Input:
 * - For each version (identified by a hash), a CSV file located at `inFiles/<hash>/Video Game Sales.csv`
 *
 * Output:
 * - A JSON file (`TestQA-<timestamp>.json`) containing the questions and answers for all versions.
 *
 * Usage:
 * - Ensure that the datasets for each version are located in `inFiles/<hash>/Video Game Sales.csv`
 * - Run `npm install` from the `2.Aim/2.Test` directory to install dependencies.
 * - Run `node app.js` from the `2.Aim/2.Test` directory.
 *
 * Notes:
 * - The script uses the `hash.js` file to get the list of hashes (version identifiers).
 * - The generated JSON file is used in the next step to create quizzes in Canvas.
 */

const inPath = "inFiles";
const answerFileName = "Video Game Sales.csv";

const dateFormat = require("dateformat");
const YMDHMS_FORMAT = "yyyy-mm-dd-HHMMss";
const outFile = `TestQA-${dateFormat(Date.now(), YMDHMS_FORMAT)}.json`;

const _ = require("lodash");
const async = require("async");
const fs = require("fs");
const path = require("path");
const util = require("./util");

const hash = require("../../1.Ready/0.Create-Zip/hash.js");
const HASHES = hash.HASHES; // List of version hashes

let numLeft = HASHES.length; // Number of versions left to process

const studentQA = {};

// Process each version to generate questions and answers
async.each(HASHES, (hash, versionDone) => {
  // Parse the CSV file for this version
  const csv = util.parseStudentAnswerCsv(
    path.join(inPath, `${hash}`, answerFileName)
  );

  studentQA[hash] = {};

  // Generate questions and answers for this version
  async.series(
    [
      async.apply(questionOne, hash, csv),
      async.apply(questionTwo, hash, csv),
      async.apply(questionThree, hash, csv),
      async.apply(questionFour, hash, csv),
    ],
    function whenVersionDone() {
      printWhenDone(hash);
      versionDone();
    }
  );
});

/**
 * Generates question 1 and its answer for a given version.
 * @param {string} hash - The version identifier.
 * @param {Array} csv - The CSV data as an array of rows.
 * @param {function} questionDone - Callback function when done.
 */
function questionOne(hash, csv, questionDone) {
  const qNum = 1;

  // Randomly select a year between 1985 and 2004 (inclusive)
  const year = Math.floor(Math.random() * 20) + 1985;

  let totalSales = 0;

  // Calculate total difference in sales between NA_Sales and JP_Sales for the given year
  for (let i = 1; i < csv.length; i++) {
    let row = csv[i];
    if (row[util.header.Year] == year) {
      totalSales +=
        parseFloat(row[util.header.NA_Sales]) -
        parseFloat(row[util.header.JP_Sales]);
    }
  }

  // Create the question and answer
  studentQA[hash][
    `q${qNum}q`
  ] = `For video games released in the year "${year}", how many more sales units were made in North America compared to Japan?`;
  const answer = totalSales.toFixed(2);
  studentQA[hash][`q${qNum}a`] = `${answer}`;

  questionDone(null);
}

/**
 * Generates question 2 and its answer for a given version.
 * @param {string} hash - The version identifier.
 * @param {Array} csv - The CSV data as an array of rows.
 * @param {function} questionDone - Callback function when done.
 */
function questionTwo(hash, csv, questionDone) {
  const qNum = 2;

  const names = ["Pokemon", "Wii", "Super Mario", "Grand Theft Auto"];
  const randIndex = Math.floor(Math.random() * names.length);
  const name = names[randIndex];

  let numGames = 0;

  // Count the number of games containing the selected name
  for (let i = 1; i < csv.length; i++) {
    let row = csv[i];
    if (row[util.header.Name].includes(name)) {
      numGames++;
    }
  }

  // Create the question and answer
  studentQA[hash][
    `q${qNum}q`
  ] = `How many video games contain "${name}" in their name?`;
  const answer = numGames;
  studentQA[hash][`q${qNum}a`] = `${answer}`;

  questionDone(null);
}

/**
 * Generates question 3 and its answer for a given version.
 * @param {string} hash - The version identifier.
 * @param {Array} csv - The CSV data as an array of rows.
 * @param {function} questionDone - Callback function when done.
 */
function questionThree(hash, csv, questionDone) {
  const qNum = 3;

  const isNintendo = Math.random() < 0.5;
  const conditionText = isNintendo ? "are" : "are <strong>not</strong>";

  let totalSales = 0;

  // Calculate total global sales based on the condition
  for (let i = 1; i < csv.length; i++) {
    let row = csv[i];
    if (
      (isNintendo && row[util.header.Publisher] == "Nintendo") ||
      (!isNintendo && row[util.header.Publisher] != "Nintendo")
    ) {
      totalSales += parseFloat(row[util.header.Global_Sales]);
    }
  }

  // Create the question and answer
  studentQA[hash][
    `q${qNum}q`
  ] = `What are the total global sales for games that ${conditionText} published by Nintendo?`;
  const answer = totalSales.toFixed(2);
  studentQA[hash][`q${qNum}a`] = `${answer}`;

  questionDone(null);
}

/**
 * Generates question 4 and its answer for a given version.
 * @param {string} hash - The version identifier.
 * @param {Array} csv - The CSV data as an array of rows.
 * @param {function} questionDone - Callback function when done.
 */
function questionFour(hash, csv, questionDone) {
  const qNum = 4;

  const randX = Math.ceil(Math.random() * 20);
  const randY = Math.ceil(Math.random() * 5);

  const solution = 8 * randX + randY;

  // Create the question and answer
  studentQA[hash][
    `q${qNum}q`
  ] = `What is 8x + y, where x = ${randX} and y = ${randY}?`;
  const answer = solution;
  studentQA[hash][`q${qNum}a`] = `${answer}`;

  questionDone(null);
}

/**
 * Decrements the count of versions left to process.
 * When all versions are processed, writes the studentQA object to a JSON file.
 * @param {string} hash - The version identifier.
 */
function printWhenDone(hash) {
  numLeft--;

  console.log(`FINISHED ${hash}`);

  if (numLeft === 0) {
    // All versions processed, write output file
    fs.writeFileSync(outFile, JSON.stringify(studentQA, null, 2));
    console.log(`All done. Answer file written to ${outFile}`);
    process.exit(0);
  }
}
