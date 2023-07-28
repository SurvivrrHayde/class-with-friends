const axios = require("axios");
const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/csClassesFall2023', async(req, res) => {
  const response = await axios.get("https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_ClassSearch?institution=UVA01&term=1238&subject=CS");
  res.json(response);
});

// catchall handler
app.get('*', (req, res) => {
  const Error = "Error: No URL matched any api calls"
  res.json(Error);
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("Successfully ran on port 5000.");