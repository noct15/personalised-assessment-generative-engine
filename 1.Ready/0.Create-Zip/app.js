"use strict";

/**
 * Script to create zip files for multiple versions of assessment files.
 *
 * This script reads files from the input directory (`INPATH`) and creates zip files
 * for each version specified in the `HASHES` array. Each zip file contains files grouped
 * according to the `groupingType` ('file' or 'folder').
 *
 * Input:
 * - `INPATH`: The directory containing the files or folders to be zipped.
 * - `HASHES`: An array of version identifiers (hashes) imported from `hash.js`.
 *
 * Output:
 * - Zip files created in `OUTPATH`, named according to the pattern:
 *   `<hash>-<zipFileSuffix>-<uniqueId>.zip`
 *
 * Usage:
 * - Configure the constants at the beginning of the script as needed.
 * - Run `npm install` from the `1.Ready/0.Create-Zip` directory to install dependencies.
 * - Run `node app.js` from the `1.Ready/0.Create-Zip` directory.
 *
 * Notes:
 * - The script uses the `archiver` library to create zip files.
 * - Files or folders are selected based on the `groupingType`.
 * - The script logs progress to the console.
 */

const NUM_VERSIONS = 3; // Number of assessment versions to process

const INPATH = ""; // Input directory containing files/folders to zip
const OUTPATH = ""; // Output directory where zip files will be saved

const zipFileSuffix = "game"; // Suffix to include in the zip file names

const groupingType = "folder"; // 'file' or 'folder'; determines how files are grouped in the zip
const patternsToExclude = [
  `*/answer.csv`, // Exclude specific files (e.g., answer.csv)
  `*answer*`, // Exclude files containing 'answer'
];

const archiver = require("archiver");
const async = require("async");
const fs = require("fs");
const mkpath = require("mkpath");
const path = require("path");
const shortid = require("shortid");

// Ensure the output directory exists
mkpath.sync(`${OUTPATH}`);

// Import the list of hashes (version identifiers)
const hash = require("../../1.Ready/0.Create-Zip/hash.js");
const HASHES = hash.HASHES; // Array of version hashes

console.log(require("os").EOL);
console.log("All versions okay");
console.log("==============");
console.log(require("os").EOL);
console.log('Wait until "All files zipped" is printed.');
console.log("===========================================");
console.log(require("os").EOL);

// Process each version hash in parallel, limiting concurrency to NUM_VERSIONS
async.eachLimit(
  HASHES,
  NUM_VERSIONS,
  (hash, done) => {
    // Generate a unique zip file name for this version
    const zipFileName = `${hash}-${zipFileSuffix}-${shortid.generate()}.zip`;
    const zipFilePath = path.join(OUTPATH, zipFileName);
    const outFile = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip");

    // Listen for the 'close' event to know when the zip file has been finalized
    outFile.on("close", function () {
      console.log(`Created zip file: ${zipFileName}`);
      done(null);
    });

    // Pipe the archive data to the output file
    archive.pipe(outFile);

    // Handle any errors during archiving
    archive.on("error", (err) => {
      throw err;
    });

    let globPattern = "*";

    // Determine the glob pattern based on the grouping type
    if (groupingType === "file") {
      globPattern = hash + "@(-|.)*"; // Files starting with the hash and a '-' or '.'
    } else if (groupingType === "folder") {
      globPattern = path.join(hash, "/*"); // All files in the folder named with the hash
    }

    console.log(
      `Zipping files matching pattern: ${path.join(INPATH, globPattern)}`
    );

    // Append files matching the glob pattern to the archive, excluding specified patterns
    archive
      .glob(globPattern, {
        cwd: INPATH,
        ignore: patternsToExclude,
      })
      .finalize(); // Finalize the archive (no more files will be appended)
  },
  (err) => {
    if (err) {
      console.error("An error occurred during zipping:", err);
    } else {
      console.log(`${require("os").EOL}All files zipped successfully.`);
      process.exit();
    }
  }
);
