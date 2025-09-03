const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const route = require("./route");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(logger);
// Routes
app.use("/slack", route);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Slack Bot running on port ${process.env.PORT}`);
});
