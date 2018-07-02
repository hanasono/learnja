// server.js
// where your node app starts

// init project
const express = require('express');
const fs = require('fs');

const app = express();

const res = require('./res.js');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});
app.get("/vue", (request, response) => {
  response.sendFile(__dirname + '/views/vue.html');
});
app.get("/list", (request, response) => {
  response.sendFile(__dirname + '/views/list.html');
});

// Simple in-memory store
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

app.get("/dreams", (request, response) => {
  response.send(dreams);
});

app.get("/get", (request, response) => {
  //console.log(res.getBatch());
  response.send(res.getBatch());
});
app.get("/close", (request, response) => {
  //console.log(res.getBatch());
  response.send(res.closeBatch());
});
app.get("/reset", (request, response) => {
  //console.log(res.getBatch());
  response.send(res.resetBatch());
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", (request, response) => {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
