function TEST_format() {
  var greeting = "Hello {0}! Goodbye {0}".format('world');
  Logger.log (greeting);
}

String.prototype.format = function() {
  a = this;
  var regex;
  for (k in arguments) {
    regex = new RegExp('\\{' + k + '\\}', 'g');
    a = a.replace(regex, arguments[k])
  }
  return a
}

/*

HELPER FUNCTIONS

*/



function TEST_fileFunctions() {
  TEST_fileExists();
  TEST_havePermission();
  TEST_removeFileFromFolder();
}

function TEST_fileExists() {
  var testFolderId = "158fKZJ2YguKhRrR6CYKfYpl7PEvf6GX-";
  var copyFolderId = "1PtGBTxVZEoITrGZnCBM_1TEqQn3iYyTs";
  var linkFolderId = "1jeaC1J_04tGlUEXMOPTCQ3tYgaNy8WhJ";

  var testFileId = "1Gvabvr8396KZbiWuT47ihJ9Qo4NNLoreeVX6N6NOlwo";
  var testFileName = "This is a test file";

  // test that an existing file is actually there
  var result = fileExists(testFileName, testFolderId);
  Logger.log ("Existing file exists? " + result);
  if (result != true) {
    throw ("FAILED: TEST_fileExists should return true for an existing file");
  }

  // test that a missing file is really missing
  var missingFileName = "No file with this name";
  var result = fileExists( missingFileName, testFolderId);
  Logger.log (result);
  if (result != false) {
    throw ("FAILED: TEST_fileExists: should return false for a missing file");
  }
}


function TEST_havePermission() {
  var folderId = "0ByUSUXY3mRrIfjNpREozM3RWdmtRemNXaVVmcGVDZzR4dTk4VVJDVERrRDNUaG0wRDFTUTA";
  Logger.log (havePermission(folderId));
  
  // circuit scramble
  var folderId = "15vEo8P3G-bBXemg7CsTpCLzZR1c7p7t4";
  Logger.log (havePermission(folderId));
}


function TEST_copyFile() {
  // test folder: https://drive.google.com/drive/folders/158fKZJ2YguKhRrR6CYKfYpl7PEvf6GX-
  var testFileId = "1Gvabvr8396KZbiWuT47ihJ9Qo4NNLoreeVX6N6NOlwo";
  var destFolderId = "1PtGBTxVZEoITrGZnCBM_1TEqQn3iYyTs";
  var newName = "I am a copy";  
  Logger.log ( copyFile (testFileId, destFolderId, newName) );
}

function TEST_linkFile() {
  // Y2022 IGCSE CS JKw Jun2019 Reportbook
  var fileId = "1foZ6ZvDjp0sAX3aW33lzfQRjLnCW-h8_svyB60jN5pI";
  var folderId = "0ByUSUXY3mRrIfjNpREozM3RWdmtRemNXaVVmcGVDZzR4dTk4VVJDVERrRDNUaG0wRDFTUTA";
  linkFile(fileId, folderId);
}

function TEST_removeFileFromFolder() {
  // test folder: https://drive.google.com/drive/folders/158fKZJ2YguKhRrR6CYKfYpl7PEvf6GX-
  var testFileId = "1Gvabvr8396KZbiWuT47ihJ9Qo4NNLoreeVX6N6NOlwo";
  var destFolderId = "1PtGBTxVZEoITrGZnCBM_1TEqQn3iYyTs";
  Logger.log ( removeFileFromFolder (testFileId, destFolderId) );
}

function removeFileFromFolder(fileId, folderId) {
  var file = DriveApp.getFileById(fileId);
  if (file) {
   Logger.log ('removeFileFromFolder (' + file.getName() + ', ' + folderId + ')' ); 
    
  };
}
  
function copyFile (srcId, destFolderId, newName) {
  console.log("copyFile(" + srcId + ", " + destFolderId + ", " + newName + ")");
  var destFolder = DriveApp.getFolderById(destFolderId);
  var srcFile = DriveApp.getFileById(srcId);

  var newFile = srcFile.makeCopy(newName, destFolder);
  if (newFile) {
    console.log("Copied " + srcFile.getName() + " into folder " + destFolder.getName() + " as " + newName);
    return newFile.getId();
  } else {
    console.error("FAILED: copy " + srcFile.getName() + " into folder " + destFolder.getName() + " as " + newName);
    return false;
  } 
}

function linkFile(fileId, folderId) {
  // link means to add another parent to an existing file
  console.log("linkFile(" + fileId + ", " + folderId + ")" );
  var folder = DriveApp.getFolderById(folderId);  
  var file = DriveApp.getFileById(fileId);
  var linkedFolder = folder.addFile(file);
  if (linkedFolder) {
    console.log("Linked " + file.getName() + " into folder " + folder.getName());
    return linkedFolder.getName();
  } else {
    console.error("FAILED: link " + file.getName() + " into folder " + folder.getName());
    return false;
  } 
}

function havePermission(folderId) {
  // do we have permissions to look in the folder?
  var errors = [];
  
  try {
    var folder = DriveApp.getFolderById(folderId);
    return folder;
  } catch(e) { 
    errors.push("Permission denied for folder " + folderId);
    console.error(errors[errors.length - 1]);
    return false;
  }
}

function fileExists(fileName, folderId) {
  var fileId = undefined;
  var folder = havePermission(folderId);
  var errors = [];
  
  if (folder) {
  var folderName = folder.getName();
    try {
      // any files at all?
      var filesList = folder.getFilesByName(fileName);
      
      if (filesList.hasNext()) {
        var file = filesList.next();
        var fileId = file.getId();
        Logger.log('File exists: ' + file.getName() + " in folder " + folderName );
     
        
      } else {
        errors.push('File: ' + fileName + " not found in folder " + folderName + " ");
        console.error( errors[errors.length - 1] );
      } 
    } catch(e) { 
      errorText = "File not found: " + folder + "/" + fileName + "\n" + e.message + "\n\n";
      console.error(errorText);
      errors.push(errorText);
    }
  } else {
    errors.push("Permission denied for file " + fileName  + " in folderId " + folderId);
    console.error( errors[errors.length - 1] );
  }
  
  if (errors.length > 0) {
    sendTheDeveloperTheError(errors.join("") + errors.length + " errors.");
  }
  
  return fileId;
}

var _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

// test it
var a = new Date("2017-01-01"),
    b = new Date("2017-07-25"),
    difference = dateDiffInDays(a, b);