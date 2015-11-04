/**
 * Summary
 *
 * Create an object that will have each model as a key
 * and it's initialized self as the value.
 */

// INFO: fs is necessary for reading the model files in this directory
var fs = require('fs');

// INFO: path is necessary for creating a requirement path string
var path = require('path');

// INFO: import the database utility for project
var database = require('../libs/db').sequelize;

// INFO: model variable to return to application
var model = {};

// INFO: read current directory for each file do something
// INFO: done synchonously on purpose; this task must complete
// INFO: there were instances were async would not complete before other tasks
// TODO: wrap this in a Promise to allow asynchronisty
fs.readdirSync(__dirname).forEach(function(file) {

  // INFO: split the file name into parts
  var splitFile = file.split('.');

  // INFO: create path name to model file
  // INFO: __filename could be used in this case
  // INFO: path.join gives us granular control over model instantiation
  var modelPath = path.join(__dirname, file);

  // INFO: conditional, only *.js files and not the current 'index' file
  if (splitFile[splitFile.length -1] === 'js' && splitFile[0] !== 'index') {

    // INFO: instantiate model object
    model[splitFile[0]] = database.import(modelPath);
  }
});

module.exports = model;
