const express = require("express");
const path = require("path");
const sisRouter = require(".sis-router.js");

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api", async (req, res) => {
  const response = await axios.get(
    "https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_ClassSearch?institution=UVA01",
  );
  res.json(response);
});
app.use('/sis', sisRouter);

// catchall handler
app.get("*", (req, res) => {
  const Error = "Error: No URL matched any api calls";
  res.json(Error);
});

const port = process.env.PORT || 8000;
app.listen(port);

console.log("Successfully ran on port 8000.");
