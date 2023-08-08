const express = require("express");
const path = require("path");
const sisRouter = require(".sis-router.js");

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/sis', sisRouter);

// catchall handler
app.get('*', (req, res) => {
  const Error = "Error: No URL matched any api calls"
  res.json(Error);
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("Successfully ran on port 5000.");