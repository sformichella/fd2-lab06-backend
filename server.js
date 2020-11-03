require('dotenv').config();
require('./lib/client').connect();

const app = require('./lib/app');
const express = require('express');
const cors = require('cors');
const client = require('./lib/client');


const Client = pg.Client;
const client = new Client(process.env.DATABASE_URL);
client.connect();

const app = express();
const PORT = process.env.PORT || 7890;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});
