// tracker.gs ==================================================
// functions for managing the Reportbooks Tracker spreadsheet
// createStudent, deleteStudent, getStudentByEmail, 
// create portfolio if doesn't exist, copy fileid back into here
// =============================================================

var paulson = {
  "lastname": "Paulson",
  "firstname": "Robert",
  "email": "robert.paulson@students.hope.edu.kh",
  "year": "Y99"
}

var bobby = {
  "lastname": "Tables",
  "firstname": "Bobby",
  "email": "bobby.tables@students.hope.edu.kh",
  "year": "Y99"
};



// TODO finish this - add  
function testUpdateStudentFromSheet() {
  var fromSheetKid = "nofirstname.nolastname@students.hope.edu.kh";
  student = getStudentByEmail(fromSheetKid);
}

function testCreateStudentFullInfo() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};

  var email = paulson.email;
  
  // SETUP:
  deleteRowByEmail(email);

  student = createStudentFullInfo(paulson);
  
  // lastname tests
  if (student.lastname === undefined || student.lastname == "") {
    logIt("Call to createStudentFullInfo deleted .lastname for " + email, meta);
  }
  if (student.lastname != paulson.lastname || student.lastname == "") {
    logIt("After createStudentFullInfo .lastname doesn't match for " + email, meta);
  }
  
  // filename tests
  if (student.filename === undefined || student.filename == "") {
    logIt("Call to createStudentFullInfo returned no filename for " + email, meta);
  }
  if (student.filename === undefined || student.filename == "") {
    logIt("Call to createStudentFullInfo returned no filename for " + email, meta);
  }
  
  // fileid tests
  if (student.fileid === undefined || student.fileid == "") {
    logIt("Failed to create fileid for " + email, meta);
  }
  if (student.fileid.length != top.rbTemplatesId.length) {
    logIt("fileid (" + student.fileid + "wrong length for " + email, meta);
  }

  // TEARDOWN:
  deleteRowByEmail(email);
}

function testDeleteRowByEmail() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  deleteRowByEmail(paulson.email);
  deleteRowByEmail(bobby.email);
}


function deleteStudent(student) {
  deleteRowByEmail(student.email); 
}

function deleteRowByEmail(email) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  var student = getStudentByEmail(email);

  if (student.row < 1) {
    logIt("Couldn't delete, email not found for " + email, meta);
  } else {
    
    logIt("Deleting " + email + " from row " + student.row, meta);
    SpreadsheetApp
    .openById(top.rbTrackerId)
    .getSheetByName("Portfolios")
    .deleteRow(student.row);
  }
}

function createStudentFullInfo(student) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  try {
    student = createPortfolioRow(student);
  }
  
  catch(e) {
    throw e;
  }
  
  return student;
}


function makeLink(fileId) {
  return "https://docs.google.com/spreadsheets/d/" + fileId + "/edit"; 
}

function testGetStudentByEmail() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  var student = {};
  
  // check empty student returns {}
  student = getStudentByEmail("");
  Logger.log(student);
  
  if (! student.row == -1) {
    Logger.log(student);
    throw "getStudentByEmail('') should return {row:-1}";
  }
  
  
  // check student with details on sheet but no fileid yet
  
  // TODO SETUP: clear fileid field in RB tracker

  // TODO delete bobby's portfolioId from RBs Tracker
  
  student = getStudentByEmail(bobby.email);
  Logger.log(student);
  
  // TEARDOWN: delete file "BOBBY, Tables"

  
  
  // check student with full data
  var testEmail = "tom.kershaw@students.hope.edu.kh";
  student = getStudentByEmail(testEmail);
  //Logger.log(student);
  
  var testStudent = {
    "lastname": "Kershaw",
    "firstname": "Tom",
    "email": "tom.kershaw@students.hope.edu.kh",
    "fullname": "Tom Kershaw",
    "year": "Y09",
    "filename": "KERSHAW, Tom (Sem 1 2018 Report)",
    "fileid": "1I2WDPzVVat5xwczFGW2iUtyEivsThKa9Y8YgZAno3GM",
    "link": "https://docs.google.com/spreadsheets/d/1I2WDPzVVat5xwczFGW2iUtyEivsThKa9Y8YgZAno3GM/edit",
    "tabs": "ENG",
    "row": 86,
  };
  
  var testFields = [
    "lastname",
    "firstname",
    "email",
    "fullname",
    "year",
    "filename",
    "fileid",
    "link"];
  
  for (var f=0; f<testFields.length; f++) { 
    var field = testFields[f];
    if (student[field] != testStudent[field]) {
      logIt(student, meta);
      throw "testGetStudent() error on field " + field;
    }
    
  }
}

function getStudentByEmail(studentEmail) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  var failResponse = {row:-1};
  
  if (typeof (studentEmail) != "string") {
    return failResponse
    throw "studentEmail must be a string";
  }
  
  // return a student record
  // on error, return {}
  
  var student = {};
  if (studentEmail == '') 
  { 
    Logger.log("studentEmail was empty");
    return failResponse
  }
  student.email = studentEmail;
  return getStudent(student);
}

//function createStudentRBs() {
//  var meta = {'tag': arguments.callee.name, "dest": "L"};
//  
//  for (var s in top.students) {
//    student = top.students[s];
//    student.fileid = getStudent(student).fileid;
//  }
//}
//// END createStudentRBs

function getStudents() {
  // students is now global for speed (!) 
  if (top.students !== undefined && top.students.length != 0) {
    console.log("Skipping creation of students", top.students.length);
    return top.students;
  }
}

function initialiseStudents() {
  console.warn ("Initialising students list");
  var students = [];
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var sheet = rb.getSheetByName("Portfolios");
  var data = sheet.getDataRange().getValues();
  
  var student;
  
  for (var d=1; d<data.length; d++) { // skip titles row
    student = {
      "lastname": data[d][top.COLS.LASTNAME-1],
      "firstname": data[d][top.COLS.FIRSTNAME-1],
      "email": data[d][top.COLS.EMAIL-1],
      "fullname": data[d][top.COLS.FULLNAME-1],
      "year": data[d][top.COLS.YEAR-1],
      "filename": data[d][top.COLS.FILENAME-1],
      "fileid": data[d][top.COLS.FILEID-1],
      "link": makeLink(data[d][top.COLS.FILEID-1]),
      "tabs": data[d][top.COLS.TABS-1],
      "row": d+1,
      "guardianemail": data[d][top.COLS.GUARDIANEMAIL-1],
    };
    
    // TODO DELETE? student.link = makeLink(student.fileid);
    
    // log first 5 records ...
    if (d < 5) {
      //Logger.log(student);
    }
    
    if (student.email.length < 2 || 
        student.lastname.length < 2 || 
        student.firstname.length < 2 || 
        student.year.length != 3) {
      logIt(student.email + ", " + 
            student.lastname + ", " + 
            student.firstname + ", " + 
            student.year, meta);
      throw "Damaged / incomplete student record in Portfolios spreadsheet - CHECK & FIX IMMEDIATELY (row " + student.row + ")";
    } else {
      students.push(student);
    }
  }

  // ... and the last record
  // Logger.log(student);
  
  return students; 
}
// END initialiseStudents

function getStudent(student) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  // search RB Tracker for student.email:
  // return student or return student.row = -1
  
  var studentFound = false;
  for (var s=0; s < top.students.length; s++) {
    var thisStudent = top.students[s];
    if (thisStudent.email == student.email) {
      student = top.students[s];
      studentFound = true;
      break;
    }
  }
  
  // email not found in RB tracker
  if (! studentFound) { 
    logIt("Student not found " + student.email, meta);
    student.row = -1;
  }
  
  // Logger.log("Student " + student.email + " is on row " + student.row); 
  return student;  
}
// END getStudent

function createStudent(student) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};

  // already exists?
  if (getStudent(student).row > 0) {
    updateStudent(student);
  
  } else {
    //  create new line in RB Tracker
    student = createPortfolioRow(student);
  }
  
  if (! student.fileId) {
    // create a new file & store its fileid etc in RB Tracker
    createPortfolioFile(student);
  }
  return student; 
}

function createPortfolioRow(student) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};

  // look for student, if not found, add a new row for them
  // return student (including student.row)
  
  if (student.email === undefined) {
    var errMsg = "Cannot create portfolio without email"; 
    logIt(errMsg, meta);
    throw errMsg; 
  }

  if (  student.lastname === undefined ||  student.firstname === undefined || student.year === undefined) {
    logIt(student, meta); 
   
    var errMsg =  "Cannot create portfolio, missing firstname/lastname/year for " + student.email;
    logIt(errMsg, meta); 
    throw errMsg;
  }
  
  var rb = SpreadsheetApp.openById(top.rbTrackerId);
  var sheet = rb.getSheetByName("Portfolios");
 
  var studentRow = -1;
  var rows = sheet.getDataRange().getValues();
  for (var i=1; i<rows.length; i++) {
    var thisEmail = rows[i][top.COLS.EMAIL - 1];

    if (thisEmail.indexOf(student.email) == 0) {
      studentRow = i+1;
      // break;
    }  
  }
  
  Logger.log("studentRow: " + studentRow);
  
  if (studentRow != -1) {
    logIt(student, meta);
    // TODO updateStudent(student);
    throw "Cannot create portfolio row, student already exists";
  }
  
  logIt("Creating a new row for student" + student.fullname);
  sheet.appendRow([
    student.lastname, 
    student.firstname, 
    student.email, 
    "", // fullname will be overwritten by a calcuation
    student.year
  ]);
  studentRow = sheet.getLastRow();
  student.row = studentRow;
  
  updatePortfolioFormulas();
  student.fullname = sheet.getRange(student.row, top.COLS.FULLNAME).getValue();
  student.filename = sheet.getRange(student.row, top.COLS.FILENAME).getValue();

  student = createPortfolioFile(student);
  
  // store fileid in tracker
  var rb = SpreadsheetApp.openById(top.rbTrackerId);
  var sheet = rb.getSheetByName("Portfolios");
  sheet.getRange(student.row, top.COLS.FILEID).setValue(student.fileid);
  
  student.fileid = sheet.getRange(student.row, top.COLS.FILEID).getValue();
  student.link = sheet.getRange(student.row, top.COLS.LINK).getValue();
  
  return student;
}
// END getStudentRow


function createPortfolioFile(student) {
  
  if (student.filename === undefined || student.filename.length < 2) {
    throw "Cannot create portfolio file, missing student.filename"  
  }
  var templatesId = SpreadsheetApp.openById(top.rbTemplatesId);
  
  var pastoralSheetName = "Pastoral";
  
  var pastoralTemplateSheet = templatesId.getSheetByName(pastoralSheetName);
  
  var new_rows = 5;
  var new_cols = 2;
  var studentFile = SpreadsheetApp.create(student.filename, new_rows, new_cols);
  
  var adminSheet = studentFile.getSheets()[0].setName("Admin");
  adminSheet.setName("Admin")
  .getRange("A1:B2")
  .setValues([
    ["Created on",new Date()],
    ["Created by",Session.getActiveUser().getEmail()]
  ]);
  adminSheet.setColumnWidth(2, 200);
  adminSheet.getRange("B:B").setHorizontalAlignment("left");
  
  student.fileid = studentFile.getId();
  
  var pastoralSheet = pastoralTemplateSheet.copyTo(studentFile);
  pastoralSheet.setName("Pastoral");
  pastoralSheet.getRange("B4").setValue(student.fullname);
  
  return student;
}