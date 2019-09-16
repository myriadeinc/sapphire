'use strict';

const express = require('express');
const routes = require('src/routes');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
      'Cache-Control, Pragma, Origin, '+
      'Authorization, Content-Type, '+
      ' X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  next();
});

app.enable('trust proxy');
app.disable('x-powered-by');
app.use(bodyParser.json());


app.use('/v1', routes);

app.get('/healthcheck', (req, res, next) => {
  res.sendStatus(200);
});

module.exports = app;
