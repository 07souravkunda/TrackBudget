const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
let html = fs.readFileSync(`${path.join(__dirname)}/index.html`, "utf-8");
const css = fs.readFileSync(`${path.join(__dirname)}/style.css`, "utf-8");
const js = fs.readFileSync(`${path.join(__dirname)}/index.js`, "utf-8");
app.get("/", (req, res, next) => {
  html = html.replace("{%STYLE%}", css);
  html = html.replace("{%JS%}", js);

  res.setHeader("Content-Type", "text/html");
  res.statusCode = 200;
  //   res.status(200);
  res.end(html);
});

app.listen(3002);
