// server.js
// where your node app starts

// init project
const express = require('express');
const fs = require('fs');

const app = express();

const res = require('./res.js');

app.use(express.static('public'));

app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/level.html');
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

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
