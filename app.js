const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("morgan");
const cors = require("cors");
const boolParser = require("express-query-boolean");
const { limiterApi } = require("./helpers/constants");
const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");
require("dotenv").config();
const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(helmet());
app.use(express.static(path.join(__dirname, AVATAR_OF_USERS)));
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: 10000 }));
app.use(boolParser());

app.use("/api/", rateLimit(limiterApi));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ status: "fail", code: 404, message: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    status: status === 500 ? "fail" : "error",
    code: status,
    message: err.message,
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
