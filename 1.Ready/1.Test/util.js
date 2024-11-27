"use strict";

/**
 * Utility functions for processing lines from arrays.
 *
 * This module provides utility functions that can be used across different scripts
 * in the application. It is designed to be a central place for shared helper functions.
 *
 * Exports:
 * - `yo`: A simple test export.
 * - `pickLines`: Function to pick specific lines from a source array.
 */

exports.yo = "yo";

/**
 * Picks specific lines from a source array based on provided line indices.
 *
 * @param {number[]} linesToPick - An array of line indices to pick.
 * @param {any[]} srcArray - The source array from which lines are to be picked.
 * @returns {any[]} - An array containing the selected lines.
 */
function pickLines(linesToPick, srcArray) {
  return linesToPick.map((lineNumber) => srcArray[lineNumber]);
}

exports.pickLines = pickLines;
