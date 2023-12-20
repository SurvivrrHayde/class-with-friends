const axios = require("axios");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

const firestore = admin.firestore();

// Function triggered by an HTTP request or a scheduled event
exports.fetchAndStoreClasses = functions.https.onRequest(async (req, res) => {
  try {
    const baseUrl = "https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_ClassSearch";
    const term = "1242"; // Replace with your desired term
    let page = 1;
    let hasMoreClasses = true;

    // Make requests until an empty array is received
    while (hasMoreClasses) {
      const response = await axios.get(baseUrl, {
        params: {
          institution: "UVA01",
          term,
          x_acad_career: "UGRD",
          page,
        },
      });

      const classes = response.data;

      if (classes.length === 0) {
        // No more classes, exit the loop
        hasMoreClasses = false;
      } else {
        // Process and store classes in Firestore
        await processAndStoreClasses(classes);
      }
      // Increment the page for the next request
      page++;
    }

    res.status(200).send("Classes fetched and stored successfully.");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error.");
  }
});

/**
 * Processes and stores classes in Firestore.
 *
 * @param {Array} classes - Array of class objects to be processed and stored.
 * @return {Promise<void>} Resolves when classes are processed and stored.
 */
async function processAndStoreClasses(classes) {
  // Process each class and store in Firestore
  const batch = firestore.batch();

  classes.forEach((classData) => {
    const classId = classData.crse_id;
    const className = classData.descr;
    const classSection = classData.class_section;

    const classRef = firestore.collection("classes").doc(classId);

    batch.set(classRef, {
      className,
      classSection,
    });
  });

  // Commit the batch write
  await batch.commit();
}
