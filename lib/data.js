/*
*Library for storing and editing data
*
*/

// Dependencies
let fs = require('fs');
let path = require('path');
let helpers = require('./helpers');

// Container for the module to be exported
let lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = (dir,file,data,callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if(!err && fileDescriptor){
      // Convert data to string
      let stringData = JSON.stringify(data);

      // Write the file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if(!err){
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            }else {
              callback('Error closing file');
            }
          });
        }else {
          callback('Error writing to file');
        }
      });
    } else {
      callback('Could not create file, it may already exist.');
    }
  });
}

// Read data from a file
lib.read = (dir,file,callback) => {
  fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', (err, data) => {
    if (!err && data) {
      let parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    }else {
      callback(err,data);
    }
  });
}

lib.update = (dir,file,data,callback) => {
  //OPen file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDecriptor) => {
    if(!err && fileDecriptor){
      // Convert data to string
      let stringData = JSON.stringify(data);

      //Truncate the file
      fs.ftruncate(fileDecriptor, (err) => {
        if(!err){
          // Write to the file and close it
          fs.writeFile(fileDecriptor, stringData, (err) => {
            if(!err){
              fs.close(fileDecriptor, () => {
                 if (!err) {
                   callback(false);
                 }else {
                   callback('Error closing file');
                 }
              });
            }else {
              callback('Error writing to existing file');
            }
          });
        }else {
          callback('Error truncating file');
        }
      });
    }else {
      callback('It may not exist yet');
    }
  });
}

lib.delete = (dir,file, callback) => {
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
    if (!err) {
      callback(false);
    }else {
      callback('Error deleting this file.');
    }
  });
}

// Export module
module.exports = lib;
