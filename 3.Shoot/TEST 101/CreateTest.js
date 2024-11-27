"use strict";

/**
 * Script to create Canvas quizzes for each version of the assessment.
 *
 * This script reads the questions and answers generated for each version,
 * and uses the Canvas API to create quizzes, add questions, and set up assignment overrides
 * so that each version is assigned to a subset of students.
 *
 * Input:
 * - A JSON file (`TestQA-<timestamp>.json`) containing questions and answers for each version.
 * - A CSV file (`TestFiles.csv`) containing file download URLs for each version.
 *
 * Output:
 * - Creates quizzes in Canvas for each version of the assessment.
 *
 * Usage:
 * - Configure the constants in the script (e.g., COURSE_ID, TOKEN, etc.).
 * - Run `npm install` from the `3.Shoot/TEST 101` directory to install dependencies.
 * - Run `node CreateTest.js` from the `3.Shoot/TEST 101` directory.
 *
 * Notes:
 * - The script uses the Canvas API to create quizzes and assignments.
 * - Students are assigned to versions based on their user ID.
 * - Ensure that your Canvas API token has the necessary permissions.
 */

const _ = require("lodash");
const async = require("async");
const fs = require("fs");
const path = require("path");
const util = require("./util.js");
const RestClient = require("node-rest-client").Client;

const resourcesPath = "inOutFiles";

const NUM_VERSIONS = 3; // Number of assessment versions to create

const COURSE_ID = 0; // Canvas Course ID
const DOMAIN = "https://auckland.test.instructure.com"; // Your Canvas domain (we suggest using a test environment first before using production)
// Platform for storing file URLs ('Canvas', 'Google Drive', or 'OneDrive'; refer to and edit `3.Shoot/TEST 101/util.js` if 'OneDrive' is specified)
const PLATFORM = "Canvas";

const hash = require("../../1.Ready/0.Create-Zip/hash.js");
const HASHES = hash.HASHES; // List of version hashes

/**********************/
/** Configuration    **/
/**********************/

// Replace with actual file names and settings
const QA_FILE = "TestQA-2024-12-02-230419.json"; // Questions and answers file
const URL_FILE = "TestFiles.csv"; // File containing download URLs
const Q_PREFIX = ""; // Prefix for question keys, if necessary

const ASSIGNMENT_TITLE = "Test Assessment"; // Assignment title
const STARTING_Q_NUMBER = 1; // Starting question number
const ASSIGNMENT_GROUP = 0; // Canvas assignment group ID

const NUMBER_OF_ATTEMPTS = 1; // Number of attempts allowed
const START_DATE = new Date("2024/12/25 18:00:00 GMT +13:00").toISOString(); // Quiz start date
const LOCK_AND_DUE_DATE = new Date(
  "2024/12/25 20:00:00 GMT +13:00"
).toISOString(); // Quiz lock and due date

const TOTAL_MARKS_PER_QUIZ = 100; // Total marks per quiz
const NUMBER_OF_QUESTIONS_PER_QUIZ = 4; // Number of questions per quiz
const MARKS_PER_QUESTION = TOTAL_MARKS_PER_QUIZ / NUMBER_OF_QUESTIONS_PER_QUIZ; // Marks per question
const BONUS_Q = {}; // Bonus questions (optional)

/**********************/
/** End Configuration **/
/**********************/

const TOKEN = ""; // Your Canvas API token

// Initialize the Canvas client with the API token
util.init(TOKEN);

const client = new RestClient();

let quizIds = ["assignmentId|quizId|canvasStudentIds"];

/**
 * Main process:
 * - Load questions and answers for each version.
 * - Load file URLs for each version.
 * - Assign students to versions.
 * - For each version:
 *     - Create a quiz in Canvas.
 *     - Add questions to the quiz.
 *     - Set assignment overrides for the students assigned to the version.
 */

// Load student questions and answers
const qaFilePath = path.join(resourcesPath, QA_FILE);
let studentsQA = util.loadStudentQaFile(qaFilePath);

// Load student file download URLs
const urlFilePath = path.join(resourcesPath, URL_FILE);
let studentsFileUrls = util.loadStudentFilesUrls(urlFilePath, PLATFORM);

// Merge the file URLs into the studentsQA object
studentsQA = _.forEach(studentsQA, (s, version) => {
  s = _.merge(s, studentsFileUrls[version]);
});

// Check that all questions have answers
const truthyCheckResult = util.checkTruthy(studentsQA);
if (truthyCheckResult.errors) {
  console.error(`
Errors found in QA file:
${truthyCheckResult.errors}
`);
  process.exit();
}

// Get Canvas user IDs for students enrolled in the course
getCanvasUserIds(
  `${DOMAIN}/api/v1/courses/${COURSE_ID}/users?enrollment_type[]=student&per_page=100`
);
// When getCanvasUserIds finishes, it calls createQuizzes().

function createQuizzes() {
  const url = `${DOMAIN}/api/v1/courses/${COURSE_ID}/quizzes`;

  async.eachSeries(
    Object.keys(studentsQA),
    (version, versionDone) => {
      const title = `${ASSIGNMENT_TITLE}`;
      const fileName = studentsQA[version].fileName;
      const fileUrl = studentsQA[version].fileUrl;
      const description = `<p>This is a test assessment. Please use the link below to download the files for your assessment version.</p>
          <p><strong>${fileName}</strong>: <a href="${fileUrl}">${fileUrl}</a></p>`;

      const quizArgs = util.newQuizArgs(
        title,
        description,
        TOTAL_MARKS_PER_QUIZ,
        NUMBER_OF_ATTEMPTS,
        ASSIGNMENT_GROUP
      );

      console.log(`Creating quiz for version ${version}`);

      client.post(url, quizArgs, (data, response) => {
        if (response.statusCode !== 200) {
          console.error(`Failed to create quiz for version ${version}`);
          return versionDone();
        }

        const quizId = data.id;
        const assignmentId = data.assignment_id;
        const canvasStudentIds = studentsQA[version].id;

        quizIds.push(`${assignmentId}|${quizId}|${canvasStudentIds.join(",")}`);

        async.series(
          [
            // Add questions to the quiz
            (questionsAdded) => {
              addQuestions(quizId, version, questionsAdded);
            },
            // Add assignment overrides for students assigned to this version
            (overridesAdded) => {
              const overrideUrl = `${DOMAIN}/api/v1/courses/${COURSE_ID}/assignments/${assignmentId}/overrides`;
              const overrideArgs = util.newOverrideArgs(
                START_DATE,
                LOCK_AND_DUE_DATE,
                canvasStudentIds
              );
              client.post(overrideUrl, overrideArgs, (data, response) => {
                if (response.statusCode === 201) {
                  overridesAdded();
                } else {
                  console.error(
                    `Override failed for version ${version}. Response: ${response.statusCode} - ${response.statusMessage}`
                  );
                  overridesAdded(); // Proceed even if override fails
                }
              });
            },
            // Publish the quiz
            (quizPublished) => {
              const publishUrl = `${DOMAIN}/api/v1/courses/${COURSE_ID}/quizzes/${quizId}`;
              client.put(
                publishUrl,
                util.newPublishQuizArgs(),
                (data, response) => {
                  quizPublished();
                }
              );
            },
          ],
          () => {
            // Version processing done
            versionDone();
          }
        );
      });
    },
    () => {
      // All versions processed
      console.log(`All quizzes created.`);
      process.exit();
    }
  );
}

/**
 * Adds questions to a Canvas quiz.
 * @param {number} quizId - The Canvas quiz ID.
 * @param {string} version - The version identifier.
 * @param {function} done - Callback function when done.
 */
function addQuestions(quizId, version, done) {
  const url = `${DOMAIN}/api/v1/courses/${COURSE_ID}/quizzes/${quizId}/questions`;
  const tasks = [];

  // Add each question to the quiz
  for (
    let i = STARTING_Q_NUMBER;
    i <= STARTING_Q_NUMBER - 1 + NUMBER_OF_QUESTIONS_PER_QUIZ;
    i++
  ) {
    tasks.push((questionDone) => {
      const args = util.newQuestionArgs(
        i, // position
        `Question ${i}`, // Name
        BONUS_Q[i] ? 0 : MARKS_PER_QUESTION, // 0 marks if bonus question
        studentsQA[version][`q${Q_PREFIX + i}q`].replace(/\n/g, "<br/>"), // Question text
        studentsQA[version][`q${Q_PREFIX + i}a`] // Correct answer
      );
      client.post(url, args, (data, response) => {
        questionDone();
      });
    });
  }
  async.series(tasks, () => done());
}

/**
 * Retrieves Canvas user IDs for students enrolled in the course.
 * Assigns students to versions based on their SIS user ID.
 * @param {string} url - The API endpoint URL.
 */
function getCanvasUserIds(url) {
  client.get(url, util.standardArgs(), (data, response) => {
    // Save users
    data.forEach((s) => {
      const fileNum = parseInt(s.sis_user_id) % NUM_VERSIONS; // Assign students to versions
      const fileHash = HASHES[fileNum];
      if (!studentsQA[fileHash].id) {
        studentsQA[fileHash].id = [];
        studentsQA[fileHash].auid = [];
      }
      studentsQA[fileHash].id.push(s.id);
      studentsQA[fileHash].auid.push(s.sis_user_id);
    });

    // Process next page of results if available
    const nextUrl = util.nextURL(response.headers.link);
    if (nextUrl) {
      getCanvasUserIds(nextUrl);
    } else {
      // No more users, proceed to create quizzes
      createQuizzes();
    }
  });
}
