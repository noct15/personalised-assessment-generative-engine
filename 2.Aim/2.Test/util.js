"use strict";

/**
 * Utility functions for parsing CSV files and performing data manipulations.
 *
 * This module provides functions to parse CSV files, work with data arrays,
 * and perform common operations needed for generating questions and answers.
 *
 * Dependencies:
 * - `babyparse`: For parsing CSV files.
 * - `lodash`: Utility library for data manipulations.
 */

const Baby = require("babyparse");
const _ = require("lodash");

// Header mapping for the CSV file columns
const header = {
  Rank: 0,
  Name: 1,
  Platform: 2,
  Year: 3,
  Genre: 4,
  Publisher: 5,
  NA_Sales: 6,
  EU_Sales: 7,
  JP_Sales: 8,
  Other_Sales: 9,
  Global_Sales: 10,
};

exports.header = header;

/**
 * Parses a CSV file and returns its data as a 2D array.
 *
 * @param {string} file - The file path to the CSV file.
 * @returns {Array[]} - A 2D array representing the CSV data.
 * @throws Will throw an error if the CSV file cannot be parsed.
 */
exports.parseStudentAnswerCsv = (file) => {
  const csv = Baby.parseFiles(file, {
    delimiter: ",",
    encoding: "UTF-8",
    header: false,
    skipEmptyLines: true,
  });

  if (csv.errors.length > 0) {
    csv.errors.forEach((e) => {
      console.error(e.message);
    });
    throw new Error("Could not parse the CSV file.");
  }

  return csv.data;
};

/**
 * Sums an array of numbers, parsing each element to an integer.
 *
 * @param {number[]} array - The array of numbers to sum.
 * @returns {number} - The sum of the array elements.
 */
exports.sumArrayAsNumber = (array) => {
  return array.reduce((acc, value) => {
    return acc + Number.parseInt(value);
  }, 0);
};

/**
 * Returns the length of a string. If the input is not a string, returns 0.
 *
 * @param {string} str - The string whose length is to be calculated.
 * @returns {number} - The length of the string, or 0 if input is not a string.
 */
exports.len = (str) => {
  if (str && typeof str === "string") {
    return str.length;
  } else {
    return 0;
  }
};
