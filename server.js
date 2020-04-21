const express = require("express");

const app = express();
const path = require("path");
const fs = require("fs");

const PORT = 5000;
const html = fs.readFileSync(path.resolve("html", "index.html"), "utf-8");
const js = fs.readFileSync(path.resolve("js", "index.js"), "utf-8");
const css = fs.readFileSync(path.resolve("style.css"), "utf-8");
const login = fs.readFileSync(path.resolve("html", "login.html"), "utf-8");
const loginstyle = fs.readFileSync(
  path.resolve("css", "my-login.css"),
  "utf-8"
);
const loginjs = fs.readFileSync(path.resolve("js", "my-login.js"), "utf-8");

let loginfile = login.replace("{%JS%}", loginjs);
loginfile = loginfile.replace("{%STYLE%}", loginstyle);

let file = html.replace("{%JS%}", js);
file = file.replace("{%STYLE%}", css);

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(file);
});

app.get("/login", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(loginfile);
});

app.get("/image", (req, res) => {
  console.log("hello");
  fs.createReadStream(path.resolve("images", "background.jpg")).pipe(res);
});

app.listen(PORT, () => console.log("listening on 5000"));
