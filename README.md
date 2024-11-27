<a id="top"></a>
# Personalised Assessment Generative Engine - Assessment Creation Example

Welcome to the **Personalised Assessment Generative Engine**! This repository contains scripts and documentation to help you:

1. [Generate Randomised Datasets](#1-generate-randomised-datasets)
   - [Making Files Available to Students](#making-files-available-to-students)
2. [Generate Q&A Files](#2-generate-qa-files)
3. [Create Canvas Quizzes](#3-create-canvas-quizzes)
   - [Obtain a Canvas API Token](#obtain-a-canvas-api-token)

You can either **download the repository as a ZIP file** or **clone it using Git**:

- **Download ZIP**:

  ![Download ZIP](https://github.com/user-attachments/assets/62080faa-b9c7-41e4-8ed8-bf7dc806418a)

- **Clone with Git**:

  ```bash
  git clone https://github.com/songyanteng/personalised-assessment-generative-engine.git
  ```
[Back to Top](#top)

---

## 1. Generate Randomised Datasets
**Acknowledgement**: The dataset used for this example is sourced from: https://www.kaggle.com/datasets/gregorut/videogamesales.

Follow these steps to generate randomised datasets for your assessments:

1. **Set the Number of Versions**:

   - Open `1.Ready/1.Test/app.js` in a text editor.
   - Set the `NUM_VERSIONS` constant to the number of assessment versions you want to create (default is `3`).

2. **Install Required Packages**:

   - Open a command line and navigate to `1.Ready/1.Test`.
   - Run:
     ```bash
     npm install
     ```

3. **Run the Script**:

   - Execute the following command:
     ```bash
     node app.js
     ```
     ![Running app.js](https://github.com/user-attachments/assets/65a44149-f8b4-4fd0-8241-fd1d3b9668e3)

     ![Script output](https://user-images.githubusercontent.com/64071081/199625452-10af770e-55cd-4e6f-a998-0ad081122c86.png)

4. **Update Hashes**:

   - Copy the generated hashes from the output.
   - Paste them as the value of the `HASHES` constant in `1.Ready/0.Create-Zip/hash.js`.

5. **Check Generated Files**:

   - The generated files are located in `1.Ready/1.Test/outFiles`.

     ![Generated files](https://user-images.githubusercontent.com/64071081/199625591-7b4dc968-3a3d-4d9d-ba80-b89d9e793154.png)
     ![OutFiles directory](https://user-images.githubusercontent.com/64071081/199492063-88917965-d161-452b-ba7c-ae7682eb4231.png)
     
[Back to Top](#top)

---

### Making Files Available to Students

After generating the datasets, follow these steps to make the files available to students:

1. **Prepare the Zip Creation Script**:

   - Open a command line and navigate to `1.Ready/0.Create-Zip`.
   - Install required packages:
     ```bash
     npm install
     ```
   - Open `1.Ready/0.Create-Zip/app.js` in a text editor and set the following parameters:
     - **`NUM_VERSIONS`**: (number of assessment versions, default is `3`).
     - **`INPATH`**: Path to the folder containing the version files or folders (output from the previous step).
     - **`OUTPATH`**: Path to the folder where the zip files will be created.
     - **`zipFileSuffix`**: Suffix to add to each zip file's name.
     - **`groupingType`**: `'file'` or `'folder'`. Use `'file'` if zipping files with version prefixes (e.g., `1-xxxx.csv`), or `'folder'` if zipping entire folders named by version.

2. **Run the Zip Creation Script**:

   - Execute:
     ```bash
     node app.js
     ```
     ![Running zip creation script](https://github.com/user-attachments/assets/97cb0275-89a8-4e0b-8f60-ba7378b85256)

     ![Zip script output](https://github.com/user-attachments/assets/fed29ad0-12af-487f-a8e9-bba10d2d8d6d)

3. **Check Generated Zip Files**:

   - The zip files are created in the directory specified by `OUTPATH`.

     ![Generated zip files](https://user-images.githubusercontent.com/64071081/199626213-2937d7ee-7c57-48b7-b34b-482dfafe7cac.png)

4. **Upload Zip Files to Canvas**:

   - Upload all `.zip` files to a folder in Canvas.
   - Set the folder visibility to **"Only available to students with link"**.

     ![Canvas folder settings](https://user-images.githubusercontent.com/64071081/199626287-88f267c4-7e59-4aac-9cdb-332bf13d55b8.png)

5. **Extract Download Links**:

   - Follow the steps in `1.Ready/0.Shared-Drive/Steps-Canvas.txt` to extract the download links and file IDs for each zip file.
     - **ef-main Element**:

       ![ef-main element](https://user-images.githubusercontent.com/64071081/155683674-ea2f015f-5081-4758-b38b-12d8522d1807.png)

     - **XPath Result**:

       ![XPath result](https://user-images.githubusercontent.com/64071081/199626383-da45ccb1-40fe-4be7-82ac-cba724ccdd67.png)

     - **Find & Replace Result**:

       ![Find & Replace result](https://user-images.githubusercontent.com/64071081/199626432-6978936d-0573-44a4-8411-0492facf7557.png)

6. **Save Links for Later Use**:

   - Save the extracted information in `3.Shoot/TEST 101/inOutFiles/TestFiles.csv`.

     ![TestFiles.csv](https://user-images.githubusercontent.com/64071081/199626559-9de15bf4-a1ec-434c-a9a6-fb48951050af.png)

[Back to Top](#top)

---

## 2. Generate Q&A Files

Now, generate the question and answer files for each version:

1. **Move Generated Datasets**:

   - Move the files from `1.Ready/1.Test/outFiles` to `2.Aim/2.Test/inFiles`.

2. **Install Required Packages**:

   - Open a command line and navigate to `2.Aim/2.Test`.
   - Run:
     ```bash
     npm install
     ```

3. **Run the Q&A Generation Script**:

   - Execute:
     ```bash
     node app.js
     ```
     ![Running Q&A script](https://github.com/user-attachments/assets/455179ec-4910-4ec4-9ad8-84131f376ce6)

     ![Q&A script output](https://github.com/user-attachments/assets/c3bed021-ed97-452b-a957-0d0c61190b9f)

4. **Check Generated Q&A File**:

   - The generated Q&A file is located in `2.Aim/2.Test`.

     ![Generated Q&A File](https://github.com/user-attachments/assets/9ad7274c-eb0c-45c7-9fbd-57da21dfc70d)

[Back to Top](#top)

---

## 3. Create Canvas Quizzes

Finally, create the quizzes in Canvas using the generated Q&A files:

1. **Prepare the Files**:

   - Move the generated Q&A file from `2.Aim/2.Test` to `3.Shoot/TEST 101/inOutFiles`.
     
     ![Moving Q&A file](https://github.com/user-attachments/assets/e80c7563-85f3-44dd-aad7-73ec18b1acac)

2. **Configure `CreateTest.js`**:

   - **Note:** The following examples use the University of Auckland's Canvas domain. Please replace it with **your institution's domain**.
   - Open `3.Shoot/TEST 101/CreateTest.js` in a text editor and set the following parameters:
     - **`NUM_VERSIONS`**: Number of assessment versions (default is `3`).
     - **`COURSE_ID`**: Canvas course ID number.
       - To find this, open your course in Canvas and examine the URL:
         ```
         https://canvas.auckland.ac.nz/courses/COURSE_ID
         ```
     - **`DOMAIN`**: Canvas instance URL. Use one of:
       1. `https://auckland.beta.instructure.com` (beta build for testing)
       2. `https://auckland.test.instructure.com` (test build for testing)
       3. `https://auckland.instructure.com` (production build visible to students)
     - **`TOKEN`**: Your Canvas API token. [Obtain a Canvas API Token](#obtain-a-canvas-api-token).

     - **Quiz Settings**:

       - **`QA_FILE`**: Name of the `TestQA-<timestamp>.json` file in `inOutFiles`.
       - **`URL_FILE`**: `TestFiles.csv` file in `inOutFiles`.
         - Format: `fileid, filename`
         - Used to populate the quiz description with file download links.
       - **`Q_PREFIX`**: Prefix for question keys if using multiple quizzes (usually leave as `""`).
       - **`ASSIGNMENT_TITLE`**: Name of the quiz as it will appear in Canvas.
       - **`STARTING_Q_NUMBER`**: Starting number for questions.
       - **`ASSIGNMENT_GROUP`**: Canvas assignment group ID.
       - **`NUMBER_OF_ATTEMPTS`**: Number of attempts allowed (`-1` for unlimited).
       - **`START_DATE`**: ISO string for when the quiz becomes available.
       - **`LOCK_AND_DUE_DATE`**: ISO string for when the quiz is due and locked.
       - **`TOTAL_MARKS_PER_QUIZ`**: Total marks for the quiz.
       - **`NUMBER_OF_QUESTIONS_PER_QUIZ`**: Number of questions in the quiz.

3. **Install Required Packages**:

   - Open a command line and navigate to `3.Shoot/TEST 101`.
   - Run:
     ```bash
     npm install
     ```
     
4. **Run the Quiz Creation Script**:

   - Execute:
     ```bash
     node CreateTest.js
     ```
     ![Running CreateTest.js](https://github.com/user-attachments/assets/6d588954-c8db-46de-88fb-6b1b86838b3c)
     
     ![CreateTest script output](https://user-images.githubusercontent.com/64071081/199627283-f16a1bd4-c49f-41f8-8db7-0dec5fb35613.png)

5. **Verify Quizzes in Canvas**:

   - Check your Canvas course to ensure the quizzes have been created correctly.

     ![Quizzes in Canvas](https://user-images.githubusercontent.com/64071081/199627351-b36540ba-7c39-40b0-a6df-8d0a9256fe08.png)

[Back to Top](#top)

---

### Obtain a Canvas API Token

To interact with the Canvas API, you'll need an API token:

1. **Navigate to Canvas Settings**:

   - Go to your profile settings in Canvas:
     - For production: `https://canvas.auckland.ac.nz/profile/settings`
     - For beta: `https://auckland.beta.instructure.com/profile/settings`
     - For test: `https://auckland.test.instructure.com/profile/settings`

2. **Unhide the "New Access Token" Button**:

   - Inspect the page source and locate the "New Access Token" dialog.
   - Remove the `style="display: none;"` attribute to unhide the button.

   **Before**:

   ```html
   <div id="add_access_token_dialog" style="display: none;" title="New Access Token">
   ```

   **After**:

   ```html
   <div id="add_access_token_dialog" title="New Access Token">
   ```

   ![Unhiding token button](https://user-images.githubusercontent.com/64071081/199965313-eee19a0a-b27b-497f-8d55-015c586ddd66.png)

3. **Generate the Access Token**:

   - Click the now visible "Generate a New Access Token" button.
   - Fill in the required information and generate the token.

     ![Generating access token](https://user-images.githubusercontent.com/64071081/199964751-4299839a-d7ba-48a3-ad93-219752cead41.png)
     
     ![Access token generated](https://user-images.githubusercontent.com/64071081/199964904-fbbbba5d-a5ab-4ad4-8f4f-b578d9733943.png)

4. **Retrieve the Token**:

   - Refresh the page to see your token in the "Approved Integrations" list.
   - Click on "Details" next to your token.
   - You may need to click "Regenerate Token" to see the full token text.

     ![Retrieving token](https://user-images.githubusercontent.com/64071081/199965029-20621b69-e40a-4125-b6ea-fcfad8180e5d.png)

[Back to Top](#top)

---

## Minimum NPM Dependency Versions

Ensure you have the following minimum versions of dependencies installed (installed using `npm install`):

- **CSV Parser for NodeJS and the Web** - v4.4.41
- **REST Client for NodeJS** - v3.1.0

[Back to Top](#top)

---

**Note**: If you encounter any issues, make sure to check for package vulnerabilities and update your dependencies accordingly using `npm audit fix`.

---
