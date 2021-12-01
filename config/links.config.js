require("dotenv").config();

module.exports = {
  OTHER_LINK: process.env.OTHER_LINK,
  BASE_URL: process.env.BASE_URL,
  OCR_API_KEY: process.env.OCR_API_KEY,
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION,
};
