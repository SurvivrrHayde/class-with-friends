const asyncHandler = require("express-async-handler");
const axios = require("axios");
const url = require("../helpers/uva-sis-urls");

exports.cs_classes_fall23 = asyncHandler(async (req, res, next) => {
  const response = await axios.get(url.csClassesFall2023);
  
});
