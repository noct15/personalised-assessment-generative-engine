"use strict";

/**
 * Utility functions for interacting with the Canvas API and handling quiz data.
 *
 * This module provides functions to create API request arguments, parse responses,
 * and manage authentication for the Canvas LMS API.
 *
 * Dependencies:
 * - `fs`: File system operations.
 * - `path`: File path utilities.
 * - `os`: Operating system utilities.
 */

let init = false;
let auth;
const initErrMsg = `util.js has not been initialized with a valid Canvas API access token.
Call init(token) first before using other functions.`;

const fs = require("fs");
const path = require("path");
const EOL = require("os").EOL; // Use the operating system's end-of-line marker

/**
 * Initializes the module with the Canvas API access token.
 *
 * @param {string} token - The Canvas API access token.
 */
exports.init = (token) => {
  auth = `Bearer ${token}`;
  init = true;
};

/**
 * Returns the standard header object for Canvas API requests.
 *
 * @returns {object} - The header object containing Content-Type and Authorization.
 * @throws Will throw an error if the module has not been initialized.
 */
function getStandardHeader() {
  if (!init) {
    throw new Error(initErrMsg);
  }

  return {
    "Content-Type": "application/json",
    Authorization: auth,
  };
}

/**
 * Parses the 'Link' header from a Canvas API response to find the next page URL.
 *
 * @param {string} linkText - The content of the 'Link' header.
 * @returns {string|null} - The URL of the next page, or null if not found.
 */
exports.nextURL = (linkText) => {
  let url = null;
  if (linkText) {
    const links = linkText.split(",");
    const nextRegEx = new RegExp('^<(.*)>; rel="next"$');
    for (let i = 0; i < links.length; i++) {
      const matches = nextRegEx.exec(links[i].trim());
      if (matches) {
        url = matches[1];
        break;
      }
    }
  }
  return url;
};

/**
 * Generates standard arguments for Canvas API GET requests.
 *
 * @returns {object} - The arguments object with headers.
 */
exports.standardArgs = () => {
  return { headers: getStandardHeader() };
};

/**
 * Generates arguments for creating a new quiz report.
 *
 * @returns {object} - The arguments object for the quiz report API call.
 */
exports.newReportArgs = () => {
  return {
    headers: getStandardHeader(),
    data: {
      include: "file",
      quiz_report: {
        includes_all_versions: true,
        report_type: "student_analysis",
      },
    },
  };
};

/**
 * Generates arguments for creating a new quiz.
 *
 * @param {string} title - The quiz title.
 * @param {string} description - The quiz description (HTML format).
 * @param {number} pointsPossible - The total points possible for the quiz.
 * @param {number} numberOfAttempts - Allowed attempts (-1 for unlimited).
 * @param {number} group - The assignment group ID.
 * @param {string|null} [hideRes=null] - Optional parameter to hide results.
 * @returns {object} - The arguments object for the quiz creation API call.
 */
exports.newQuizArgs = (
  title,
  description,
  pointsPossible,
  numberOfAttempts,
  group,
  hideRes = null
) => {
  return {
    headers: getStandardHeader(),
    data: {
      quiz: {
        title: `${title}`,
        description: `${description}`,
        type: "assignment",
        points_possible: `${pointsPossible}`,
        scoring_policy: "keep_highest",
        show_correct_answers: false,
        allowed_attempts: `${numberOfAttempts}`,
        published: false,
        only_visible_to_overrides: true,
        assignment_group_id: group,
        hide_results: hideRes,
      },
    },
  };
};

/**
 * Generates arguments for editing an existing quiz.
 *
 * @param {object} quizObject - The quiz object containing updated properties.
 * @returns {object} - The arguments object for the quiz edit API call.
 */
exports.editQuizArgs = (quizObject) => {
  return {
    headers: getStandardHeader(),
    data: {
      quiz: quizObject,
    },
  };
};

/**
 * Generates arguments for saving a quiz.
 *
 * @param {number} id - The quiz ID.
 * @returns {object} - The arguments object for saving the quiz.
 */
exports.saveQuizArgs = (id) => {
  return {
    headers: getStandardHeader(),
    data: {
      quizzes: [id],
    },
  };
};

/**
 * Generates arguments for creating a new short answer question.
 *
 * @param {number} position - The position of the question in the quiz.
 * @param {string} questionName - The name of the question.
 * @param {number} pointsPossible - Points possible for the question.
 * @param {string} questionText - The question text (HTML format).
 * @param {string} answerText - The correct answer text.
 * @returns {object} - The arguments object for the question creation API call.
 */
exports.newQuestionArgs = (
  position,
  questionName,
  pointsPossible,
  questionText,
  answerText
) => {
  return {
    headers: getStandardHeader(),
    data: {
      question: {
        position: position,
        name: questionName,
        question_type: "short_answer_question",
        question_text: `<p>${questionText}</p>`,
        points_possible: `${pointsPossible}`,
        answers: [
          {
            answer_text: `${answerText}`,
            answer_weight: 100,
          },
        ],
      },
    },
  };
};

/**
 * Generates arguments for creating a new essay question.
 *
 * @param {number} position - The position of the question in the quiz.
 * @param {string} questionName - The name of the question.
 * @param {number} pointsPossible - Points possible for the question.
 * @param {string} questionText - The question text (HTML format).
 * @returns {object} - The arguments object for the question creation API call.
 */
exports.newLongQuestionArgs = (
  position,
  questionName,
  pointsPossible,
  questionText
) => {
  return {
    headers: getStandardHeader(),
    data: {
      question: {
        position: position,
        name: questionName,
        question_type: "essay_question",
        question_text: `<p>${questionText}</p>`,
        points_possible: `${pointsPossible}`,
      },
    },
  };
};

/**
 * Generates arguments for creating a text-only question.
 *
 * @param {number} position - The position of the question in the quiz.
 * @param {string} questionText - The text to display (HTML format).
 * @returns {object} - The arguments object for the question creation API call.
 */
exports.newBlankQuestionArgs = (position, questionText) => {
  return {
    headers: getStandardHeader(),
    data: {
      question: {
        position: position,
        question_type: "text_only_question",
        question_text: `<p>${questionText}</p>`,
      },
    },
  };
};

/**
 * Generates arguments for creating a file upload question.
 *
 * @param {number} position - The position of the question in the quiz.
 * @param {string} questionText - The question text (HTML format).
 * @returns {object} - The arguments object for the question creation API call.
 */
exports.newFileQuestionArgs = (position, questionText) => {
  return {
    headers: getStandardHeader(),
    data: {
      question: {
        position: position,
        question_type: "file_upload_question",
        question_text: `<p>${questionText}</p>`,
      },
    },
  };
};

/**
 * Generates arguments for editing an existing question.
 *
 * @param {object} questionObject - The question object with updated properties.
 * @returns {object} - The arguments object for the question edit API call.
 */
exports.editQuestionArgs = (questionObject) => {
  return {
    headers: getStandardHeader(),
    data: {
      question: questionObject,
    },
  };
};

/**
 * Generates arguments for creating an assignment override for specific students.
 *
 * @param {string} startDate - The unlock date in ISO format.
 * @param {string} lockAndDueDate - The lock and due date in ISO format.
 * @param {number[]} studentIds - An array of Canvas student IDs.
 * @returns {object} - The arguments object for the assignment override API call.
 */
exports.newOverrideArgs = (startDate, lockAndDueDate, studentIds) => {
  return {
    headers: getStandardHeader(),
    data: {
      assignment_override: {
        unlock_at: `${startDate}`,
        lock_at: `${lockAndDueDate}`,
        due_at: `${lockAndDueDate}`,
        student_ids: studentIds,
      },
    },
  };
};

/**
 * Generates arguments for publishing a quiz.
 *
 * @returns {object} - The arguments object for publishing the quiz.
 */
exports.newPublishQuizArgs = () => {
  return {
    headers: getStandardHeader(),
    data: {
      quiz: {
        published: true,
        notify_of_update: false,
      },
    },
  };
};

/**
 * Loads the student question and answer data from a JSON file.
 *
 * @param {string} file - The path to the JSON file.
 * @returns {object} - The parsed JSON object.
 */
exports.loadStudentQaFile = (file) => {
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

// Header mapping for the file URLs CSV
const header = {
  fileid: 0,
  fileName: 1,
};

/**
 * Loads the student file URLs from a CSV file.
 *
 * @param {string} file - The path to the CSV file.
 * @param {string} platform - The platform ('Canvas', 'Google Drive', or 'OneDrive').
 * @returns {object} - An object mapping student identifiers to their file names and URLs.
 */
exports.loadStudentFilesUrls = (file, platform) => {
  const students = {};
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/) // Split on new lines (handles Windows and Unix)
    .forEach((line) => {
      if (line.trim() === "") return; // Skip empty lines
      const row = line.split(",");
      const auid = row[header.fileName].split("-")[0];
      const fileName = row[header.fileName];
      let url = "";
      switch (platform) {
        case "Canvas":
          url = row[header.fileid];
          break;
        case "Google Drive":
          url =
            "https://drive.google.com/uc?export=download&id=" +
            row[header.fileid];
          break;
        case "OneDrive":
          url = "yourOneDriveUrl" + encodeURIComponent(row[header.fileName]);
          break;
        default:
          throw new Error("Invalid platform specified.");
      }
      students[auid] = {
        fileName: fileName,
        fileUrl: url,
      };
    });

  return students;
};

/**
 * Generates the output file name for quiz IDs based on the QA file and assignment name.
 *
 * @param {string} fileName - The name of the QA JSON file.
 * @param {string} assignmentName - The name of the assignment.
 * @returns {string} - The generated output file name.
 */
exports.generateIdOutputFileName = (fileName, assignmentName) => {
  return `${path.basename(fileName, ".json")}-${assignmentName}-quizIds.txt`;
};

/**
 * Checks that all questions have corresponding answers and that required fields are present.
 *
 * @param {object} QaObject - The object containing questions and answers.
 * @returns {object} - An object containing any errors found.
 */
exports.checkTruthy = (QaObject) => {
  const qRE = /q$/; // Regex to identify question keys ending with 'q'
  const result = {};

  for (let auid in QaObject) {
    // Check question and answer pairs
    for (let key in QaObject[auid]) {
      if (qRE.test(key)) {
        const aKey = key.replace(/.$/, "a"); // Replace last character 'q' with 'a' to get the answer key
        const aVal = QaObject[auid][aKey];

        if (aVal === undefined || aVal === null || aVal === "") {
          addError(
            result,
            `${auid} - Missing or invalid answer for key: ${aKey}`
          );
        }
      }
    }

    // Check that each student has a fileName and fileUrl
    if (!(QaObject[auid].fileName && QaObject[auid].fileUrl)) {
      addError(result, `${auid}: Missing fileName or fileUrl`);
    }
  }

  return result;
};

/**
 * Helper function to add an error message to the result object.
 *
 * @param {object} resultObject - The result object where errors are collected.
 * @param {string} msg - The error message to add.
 */
function addError(resultObject, msg) {
  if (!resultObject.errors) {
    resultObject.errors = [];
  }
  resultObject.errors.push(msg);
}
