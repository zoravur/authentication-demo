require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { indexLogger } = require('./logging.cjs');

const http = require('http');
// TODO:
// use SSL for production

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database
const { db } = require('./db.cjs');
db.connect();

// Routes
const routes = require('./api.cjs');
app.use('/api', routes);

// Start the server
const port = process.env.PORT || 3000;
http.createServer(app).listen(port, () => {
  indexLogger.info(`Server is running on port ${port}`);
});
