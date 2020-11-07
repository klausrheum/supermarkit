// **************************************************************************
//   W  A  R  N  I  N  G       W  A  R  N  I  N  G       W  A  R  N  I  N  G
//
//                             Do NOT click 
//
//                  'Enable new Apps Script v8 runtime'
// 
//             It is incompatible and will break everything!
//
//   W  A  R  N  I  N  G       W  A  R  N  I  N  G       W  A  R  N  I  N  G
// **************************************************************************

/*
1. Create a copy of the Reportbooks Tracker
2. Copy its ID
3. Create a new line in top.FILES, eg rbWhatever
4. Update top.META.SEM to match (without the rb)
*/

var TESTING = false; // false/true 

// main.gs ===================================================
// holds global objects for various doc IDs, eventually these 
// will be part of the spreadsheet this is attached to...
// =============================================================


// SEE README.gs for instructions and details of each file's purpose


// TODO FIX var sheet = rb.getSheetByName("Portfolios");

// https://developers.google.com/drive/api/v3/reference/files

//    "lastname": "Kershaw",
//    "firstname": "Tom",
//    "email": "tom.kershaw@students.hope.edu.kh",
//    "fullname": "Tom Kershaw",
//    "year": "Y09",
//    "filename": "KERSHAW, Tom (" + top.META.SEM + " Report)",
//    "fileid": "1I2WDPzVVat5xwczFGW2iUtyEivsThKa9Y8YgZAno3GM",
//    "link": "https://docs.google.com/spreadsheets/d/1I2WDPzVVat5xwczFGW2iUtyEivsThKa9Y8YgZAno3GM/edit",
//    "tabs": "ENG",
//    "row": 86,

var top = {
  "students": [],
  
  // DELETE? "rbTemplatesId": "1YyMyHCQeshm4bWnfiwC3DbRSWDw48PQv9I822oXU8ys",
  // DELETE? "SUBY00TemplateId": "17ZJgVhi_SQeoJffFmjdcOFsMp0FRiZVIkjulnmQXJBw",
  // DELETE? "aaa": "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y", // test reportbook

  META: {
    "SEM": ""  // eg top.META.SEM = "Dec2019" select a RB from list in FILES
  },
  
  FILES: {
    // reportbook trackers in semester order: rb(Dec|Jun)\d{4}
    
    //"rbDec2018": "1D3OEcKrRIWpJmopP07u-KWh6sQHae2Q3dSTzo6uMFVc",
    //"rbJun2019": "1JSJDpMOWQ766EDZjlKz_d2pxzNTNe_NT15JiI3WMuQE",
    //"rbDec2019": "1gajYqRDtQaYgknbkFtWkPBjhnJXOhe3Lc2cP8X--F8c",

    // will become whichever is current
    "RBTRACKER": "",  // top.FILES.RBTRACKER = "rbDec2019"
    
    // holds portfolio page templates
    "RBTEMPLATES": "1YyMyHCQeshm4bWnfiwC3DbRSWDw48PQv9I822oXU8ys",
    
    // the reportbooks template
    "SUBY00": "17ZJgVhi_SQeoJffFmjdcOFsMp0FRiZVIkjulnmQXJBw",
    
    // a dummy reportbook for testing
    "AAA": "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y"
  },
  
  SHEETS: {
    // names of sheets
    TITLESROW : 3,
    
    // Sheets in Reportbooks Tracker
    REPORTBOOKS: "Reportbooks",
    PORTFOLIOS: "Portfolios",
    PROBLEMLOG: "ProblemLog",
    TEACHERS: "Teachers",
    
    // Sheets in Subject Reportbooks
    OVERVIEW: "Overview",
    GRADES: "Grades",
    INDREP: "Individual report", // NB small 'r'
    
    // Sheets in Student Portfolio
    ADMIN: "Admin",
    PASTORAL: "Pastoral",
    SUB: "Sub",
    ELL: "ELL Individual Report"
  },
  
  COLS: {
    // Columns in REPORTBOOKS sheet
    RBIDS: "A2:A",
    RBID: 1,
    COURSENAME: 2,
    SECTION: 3,
    CLASSROOMLINK: 4,
    COURSEID: 5,
    OWNERID: 6,
    TEACHERFOLDER: 7,
    RBIDSTOEXPORT: 13, // replace this with getRBRows
    REPORTFOOTER: 28,
    
    // Columns in PORTFOLIOS Sheet
    LASTNAME: 1,
    FIRSTNAME: 2,
    EMAIL: 3,
    FULLNAME: 4,
    YEAR: 5, // AA00
    FILENAME: 6,
    FILEID: 7,
    LINK: 8,
    TABS: 9,
    GUARDIANEMAIL: 19,
    
    OVERVIEWSUBJECT: 10,
    OVERVIEWTEACHER: 11,
    
    EMAILSTOEXPORT: 9,

    PASTORALCOMMENTBACKUP: 11,
    ATTRIBUTESBACKUP:      15,
    EXTRACURRICULARBACKUP: 16,
    PASTORALTEACHERBACKUP: 17, 
    ATTENDANCETOTALBACKUP: 18,

    PORTFOLIOLASTEXPORT:   13,
    PORTFOLIOTABSLIST:     14,
    PASTORALFOOTER:        24,
    EXTRACURRICULARSUMMARY:25,
    
  },
  
  RANGES: {
    // RBTRACKER: Reportbooks
    COURSEIDS: "E:E",
    
    // RBTRACKER: Teachers
    TEACHERIDS: "A:A",
    TEACHERINFO: "A:C",
    
    // Reportbook: Overview tab
    OVERVIEWSUBJECT:      "B1",
    OVERVIEWTEACHER:      "B2",
    OVERVIEWGRADETITLE:   "B5:I5",
    
    // Pastoral
    ADMINPASTORALTEACHER: "B3",
    ADMINEXTRACURRICULAR: "B9",
    ADMINATTENDANCETOTAL: "B10",
    ADMINPASTORALCOMMENT: "B11",
    ADMINATTRIBUTES:      "B13:B21",
    PASTORALFOOTER:       "B29:H29",
    REPORTFOOTER:         "B28:R28",
  }
};


if (TESTING) {
  sheet = top.SHEETS.REPORTBOOKS = "Copy of Reportbooks";
}
  
var folderRB = "1SxM_NQ8ZsDzZPaZAhfdTXl7e21eFJBkk";
var listRBs = "1EAW-XHHtA1gIFoXe3sruqTHXtKi07xBxP4oXbWObCgU";

var rbTestIds = [
  "1-O8VZX341WdMx8xkzV7om_jPPJ6q-ia36ME-krz49gc",
  "1UV9BysLHpyz4_ycPaV9QO1LxumJYW02umDGQXU2RG-s",
  "1nJ56x-Rjc5WZeOs9cCtRv2d1afexiHByEqDziIMpLm8",
  "1nyo3UPNl3B4quk5nuk1C9YJpNrDIcvGmA8XrPHQRcL4",
  "1_EqGZAtog9rB-eWVpLJq-nW671UWGgJqpxNHmL5-dvY",
  "1XNiXHrW4xAj3SMdsAm4ls66bbYBEjqd3I5rE35vZbmU"
];

var klaus = {
  "name": "Klaus Rheum",
  "email": "classroom@hope.edu.kh"
  };

var testRBTRACKER = "1Q9rH_hexTkgsT07vJ80pIV0g8JgLIulxZEin0cyTLgA"; // Dec2020
var testStudentEmail = "tom.kershaw@students.hope.edu.kh";
var currSS = SpreadsheetApp.getActiveSpreadsheet();
Logger.log(currSS);

if (!currSS) {
  Logger.log('No current spreadsheet! Will use Jun2020');
  top.FILES.RBTRACKER = testRBTRACKER;
  Logger.log(top.FILES.RBTRACKER);
};

var template = {
  "titlesRow" : 3,
  "overviewSheetName": "Overview",
  "gradesSheetName": "Grades",
  "reportsSheetName": "Individual report"
};

// TODO Get a student grade from their email
// TODO Build an array of student submission grades
// TODO Create an email from student grades

// Useful
// Adding OAuth2 Scopes to the manifest: https://developers.google.com/apps-script/concepts/scopes#setting_explicit_scopes


// Client ID
// 753729569384-hnr6veoqigbj942kvjmlqknb8qaic392.apps.googleusercontent.com

// Client Secret
// l8CfwFCvGsROVdDJEXgiTvcG

// var courses = listCourses(studentEmail);

function TESTtop() { 
  var ss = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  Logger.log(ss.getName());
}

function getRbIds() {

  var rawIds = SpreadsheetApp.openById(top.FILES.RBTRACKER)
  .getSheetByName(top.SHEETS.REPORTBOOKS)
  .getRange(top.COLS.RBIDS).getValues();
  //Logger.log(raw_ids);
  
  var cleanIds = [];
  for (var i=0; i < rawIds.length; i++) {
    var thisId = rawIds[i][0];
    //Logger.log(thisId);
    if (thisId.length > 2) {
      //Logger.log("Clean");
      cleanIds.push(thisId);
    }
  }
  //Logger.log(clean_ids);
  return cleanIds;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}


function TEST_listCourses() {
  var testStudentEmail = "tom.kershaw@students.hope.edu.kh";
  return listCourses(testStudentEmail);
}


function listCourses(studentEmail) {
  // https://developers.google.com/classroom/reference/rest/v1/courses.students/list?apix_params=%7B%22courseId%22%3A%2216052292479%22%2C%22fields%22%3A%22students(userId%2Cprofile.name.fullName%2Cprofile.name.givenName%2Cprofile.name.familyName%2Cprofile.emailAddress)%22%7D
  var optionalArgs = {
    pageSize: 100,
    courseStates: "ACTIVE",
    studentId: studentEmail,
    fields: "courses(id,name,courseState,guardiansEnabled,ownerId,alternateLink)",
  };
  
  var response = Classroom.Courses.list(optionalArgs);
  var courses = response.courses;
  Logger.log('courses.length = %s', courses.length);
  
  
  if (courses && courses.length > 0) {
    for (i = 0; i < courses.length; i++) {
      var course = courses[i];
      Logger.log('%s %s (%s) is %s %s', i, course.name, course.id, course.courseState, course.guardiansEnabled ? "" : " and guardians email is off");
    }
  } else {
    Logger.log('No courses found.');
  }
  
  return courses;
}


function TEST_listCourseWorks() {
  var courseId = "16059575101";
  var courseworks = listCourseWorks(courseId);
  Logger.log (courseworks);
}

function listCourseWorks(courseId) {
  var optionalArgs = {
    pageSize: 100,
    orderBy: "dueDate asc",
    fields: "courseWork(id,courseId,title,dueDate,maxPoints,state,workType,alternateLink)"
  }
  
  // courseWork(alternateLink,dueDate,id,maxPoints,state,title,workType),nextPageToken
  var response = Classroom.Courses.CourseWork.list(courseId, optionalArgs);
  var courseWorks = response.courseWork;
  var token = response.nextPageToken;
  
  if (token) {
    var message = "listCourseWorks ran to more than one page!";
    sendTheDeveloperTheError( message );
    console.error ( message );
  }
  
  return courseWorks;
}

function TEST_getEmailIds() {
  var courseId = "35753904788";
  var emailIds = getEmailIds(courseId);
  Logger.log(emailIds);
}

function getEmailIds(courseId) {
  var courseStudents = listStudents(courseId);
  var emailIds = {};
  for (var i = 0; i < courseStudents.length; i++) {
    //Logger.log(courseStudents[i]);
    // {emailAddress=amy.piper@students.hope.edu.kh, givenName=Amy, familyName=Piper, fullName=Amy Piper, userId=111296958067356506259}
    var email = courseStudents[i].emailAddress;
    var userId = courseStudents[i].userId;
    //Logger.log(email + ": " + userId);
    emailIds[email] = userId; 
  }
  return emailIds;
}

function TEST_importGrades() {
  // Y2022 CS10 JKw
  var rbId = "1OK5U2yySrs3zZmkf-yAi4AuLtc4D76g57KK8sDPpqgU";  
  var courseId = "16052527003";
  
//  // Y2025 ICT 
//  var rbId = "1BijeGY49S0amD3u-eePjz8iWBwH1sEc7QE_yADzVzgQ";  
//  var courseId = "16052292479";
  top.META.SEM = "Jun2020";
  top.FILES.RBTRACKER = "1Z4tc9AsmpuRgZ88puLCANMrr7hgvUTtMrlYenRcEZWg";
  importGrades(rbId, courseId);
}

function importGrades(rbId, courseId) {

  var titleRegex = / REP ?([0-9]*)%?/;
  var dueYear = top.META.SEM.slice(-4); // 2019;
  var dueMonth = top.META.SEM.slice(0,-4);
  var dueMonths;
  var message = "importGrades for 6 months up to " + dueMonth + " " + dueYear;
  logMe(message);
  
  if (dueMonth === "Jun") {
    dueMonths = [1, 2, 3, 4, 5, 6];
  } else if (dueMonth === "Dec") {
   dueMonths = [7, 8, 9, 10, 11, 12];
  } else {
    var message = "Parsing top.META.SEM for dueMonth didn't match Dec or Jun. Fix in main.gs";
    logMe( message, 'error' );
    console.error ( message );
    throw new Error(message);
  }
  
  var courseWorks = listCourseWorks(courseId);
  var filteredCourseWorks = filterCourseWorks(courseWorks, titleRegex, dueYear, dueMonths);  
  
  var emailIds = getEmailIds(courseId);
  
  var sheet = SpreadsheetApp.openById(rbId).getSheetByName(top.SHEETS.GRADES);
  var emailStartRow = 7;
  var studentEmails = sheet.getRange("C" + emailStartRow + ":C").getValues();
  // Logger.log (studentEmails);

  var startCol = 8;
  
  var dateRow = 2
  var titleRow = 3;
  var maxPointsRow = 4;
  var idRow = 5;
  var averageRow = 6;
  
  sheet.getRange("H2:V46").clearContent().setHorizontalAlignment("right");
  
  for (var i = 0; i < filteredCourseWorks.length; i++) {
    
    var column = startCol + i;
    var cw = filteredCourseWorks[i];
    cw.title = cw.title.trim();
    
    // set date
    var dateText = cw.dueDate.day + '/' + cw.dueDate.month + '/' + cw.dueDate.year;
    sheet.getRange(dateRow, column)
    .setValue(dateText);
    
    // set title
    sheet.getRange(titleRow, column)
    .setFormula('=HYPERLINK("' + cw.alternateLink + '", "' + cw.title + '")' )
    .clearNote();
    //.setNote(cw.id);
    
    // set max points
    sheet.getRange(maxPointsRow, column)
    .setValue(cw.maxPoints);

    // set id as note in 'black' row
    sheet.getRange(idRow, column)
    .setNote(cw.id);
    
    // set average formula
    var formula = '=iferror(average(indirect(address(row()+1, COLUMN()) & ":" & address(row()+40, column()))))';
    sheet.getRange(averageRow, column)
    .setFormula(formula);
    
    // loop through student emails
    var grades = getUserIdGrades(cw.courseId, cw.id); // get grades for ALL students
    
    Logger.log(grades);
    for (var j = 0; j < studentEmails.length; j++) {
      Logger.log(j);
      var studentEmail = studentEmails[j][0];
      if (studentEmail) {
        var grade = grades[emailIds[studentEmail]];
        if (grade == undefined) {
          grade = "";
        }
        sheet.getRange(emailStartRow + j, column).setValue(grade);
      }
    }
  }
}

function TEST_getUserIdGrades() {
  var courseId = "16059575101"; // Y2024 ICT
  var courseWorkId = "32765561263"; // "title": "Event Programming 8-23 REP"
  var userIdGrades = getUserIdGrades(courseId, courseWorkId);
  Logger.log(userIdGrades);
}

function getUserIdGrades(courseId, courseWorkId) {
  if (! courseId || ! courseWorkId) return {};
  
  var rawGrades = listGrades("", courseId, courseWorkId);
  Logger.log("rawGrades=" + rawGrades);
  
  var userIdGrades = {};
  for (var i = 0; i < rawGrades.length; i++) {
    Logger.log(rawGrades[i]);
    // {emailAddress=amy.piper@students.hope.edu.kh, givenName=Amy, familyName=Piper, fullName=Amy Piper, userId=111296958067356506259}
    var userId = rawGrades[i].userId;
    var assignedGrade = rawGrades[i].assignedGrade;
    Logger.log(i + " " + userId + ": " + assignedGrade);
    userIdGrades[userId] = assignedGrade; 
  }
  return userIdGrades;
}

function TEST_filterCourseWorks() {
  var courseId = "16059575101";
  var courseWorks = listCourseWorks(courseId);
  
  var titleRegex = / REP ?([0-9]*)%?/;
  var dueYear = 2019;
//  var dueMonths = [1, 2, 3, 4, 5, 6];
  var dueMonths = [7, 8, 9, 10, 11, 12];
  
  var courseWorks = filterCourseWorks(courseWorks, titleRegex, dueYear, dueMonths);
  Logger.log (courseWorks);
  
  return courseWorks;
}

function filterCourseWorks(courseWorks, titleRegex, dueYear, dueMonths) {
  
  var filteredCourseWorks = [];
  
  for (var i = 0; i < courseWorks.length; i++) {
    var cw = courseWorks[i];
    
    var inDateRange = cw.dueDate && cw.dueDate.year == dueYear && dueMonths.indexOf(cw.dueDate.month) > -1;
    var hasREP = cw.title && cw.title.match(titleRegex);
    
    if (inDateRange && hasREP) {
      filteredCourseWorks.push(cw);
      //Logger.log ( cw.title + " " + cw.dueDate );
    }
  }
  
  return filteredCourseWorks;
}

function TEST_listGrades() {
  
  // list all grades for this course for ONE student
  var studentEmail = "tom.kershaw@students.hope.edu.kh";
  var courseId = "16063195662"; // Y2022 CS
  listGrades(studentEmail, courseId);

  // list single grade for specific assignment for ONE student 
  var studentEmail = "thomas.norman@students.hope.edu.kh";
  var courseId = "16059575101"; // Y2024 ICT
  var courseWorkId = "32765561263"; // "title": "Event Programming 8-23 REP"
  listGrades(studentEmail, courseId, courseWorkId);

  // list ALL grades for specific assignment for ALL students 
  var studentEmail = "thomas.norman@students.hope.edu.kh";
  var courseId = "16059575101"; // Y2024 ICT
  var courseWorkId = "32765561263"; // "title": "Event Programming 8-23 REP"
  listGrades("", courseId, courseWorkId);
    
}

function listGrades(studentEmail, courseId, courseWorkId) {
//  "courseWorkId": "-",
//      "states": [
//        "RETURNED"
//      ],
//      "userId": "tom.kershaw@students.hope.edu.kh",
//      "fields": "studentSubmissions(courseWorkId,assignedGrade)"

  if (! courseId) {
    return false;
  }
  
  if (! studentEmail) {
    var studentEmail = "";
  }
  
  if (! courseWorkId) {
    var courseWorkId = "-";
  }
  
  var optionalArgs = {
    pageSize: 100,
    userId: studentEmail,
    fields: "studentSubmissions(courseId,courseWorkId,assignedGrade,userId)",
  };
  
  //Logger.log('email: %s, courseId: %s, cwId: %s', studentEmail, courseId, courseWorkId);
  
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId, optionalArgs);
  var grades = response.studentSubmissions;
  var token = response.nextPageToken;
  
  //Logger.log('grades.length = %s', grades.length);
  //Logger.log('grades = %s', grades);

  return grades;
}


// classroom.courses.courseWork.studentSubmissions.list
// 16063195662

function TEST_listStudents() {
  var courseId = 16052292479;
  var courseWorkId = 16052292479;
  var mrkershaw = 107554112463094781867;
  var y6 = listStudents(courseId);
  Logger.log(y6);
}

function listStudents(courseId) {
  var optionalArgs = {
    // pageSize: 10
    fields:"students(userId,profile.name.fullName,profile.name.givenName,profile.name.familyName,profile.emailAddress)"
  };
  var responses = Classroom.Courses.Students.list(courseId).students;
  //var courses = response.courses;
  //Logger.log('responses = %s', responses.length);
  // Logger.log('responses = %s', responses);
  
  var courseStudents = [];
  
  if (responses && responses.length > 0) {
    for (i = 0; i < responses.length; i++) {
      var response = responses[i];
      // Logger.log('%s %s (%s)', i, response.profile.name.fullName, response.profile.emailAddress);
      
      if (response.profile.emailAddress != undefined) {
        //Logger.log(response);
        courseStudents.push({
          "userId": response.userId, 
          "emailAddress": response.profile.emailAddress,
          "fullName": response.profile.name.fullName,
          "givenName": response.profile.name.givenName,
          "familyName": response.profile.name.familyName
        });
      }
    }
  } else {
    Logger.log('No matches found.');
  }
  
  return courseStudents;
}

/*
fields:students(userId,profile.name.fullName,profile.name.givenName,profile.name.familyName,profile.emailAddress)

{
  "students": [
    {
      "courseId": "16052292479",
      "userId": "109441503280302149020",
      "profile": {
        "id": "109441503280302149020",
        "name": {
          "givenName": "Tanyaradzwa",
          "familyName": "Hungwe",
          "fullName": "Tanyaradzwa Hungwe"
        },
        "emailAddress": "tanyaradzwa.hungwe@students.hope.edu.kh",
        "photoUrl": "//lh3.googleusercontent.com/a-/AAuE7mC-d4wzYIvLdp1VbjbqDvuEMFmBjWkvjI1GggVG"
      }
    },
    {
      "courseId": "16052292479",
      "userId": "117219793083402379130",
      ...    
*/

/*
Courses API Reference
  https://developers.google.com/apis-explorer/#search/classroom/classroom/v1/
  https://developers.google.com/classroom/guides/manage-coursework
  https://developers.google.com/classroom/reference/rest/v1/courses/list?apix=true

https://developers.google.com/apis-explorer/#search/classroom/classroom/v1/classroom.courses.courseWork.studentSubmissions.list?courseId=16059575101&courseWorkId=-&_h=1&
Request
 
=================================

GET https://classroom.googleapis.com/v1/courses/16059575101/courseWork/-/studentSubmissions?key={YOUR_API_KEY}
 
Response
 
200
 
- Show headers -
  
{
 "studentSubmissions": [
  {
   "courseId": "16059575101",
   "courseWorkId": "33112639531",
   "id": "CgsI9f2LMxCrkKutew",
   "userId": "106167875798496561165",
   "creationTime": "2019-03-27T06:49:08.976Z",
   "updateTime": "2019-03-28T13:07:50.793Z",
   "state": "TURNED_IN",
   "late": true,
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzMxMTI2Mzk1MzFa/submissions/student/MTA3MTUxMDkz",
   "courseWorkType": "ASSIGNMENT",
   "assignmentSubmission": {
   },
   "submissionHistory": [
    {
     "stateHistory": {
      "state": "CREATED",
      "stateTimestamp": "2019-03-27T06:49:08.945Z",
      "actorUserId": "106167875798496561165"
     }
    },
    {
     "stateHistory": {
      "state": "TURNED_IN",
      "stateTimestamp": "2019-03-28T13:07:50.793Z",
      "actorUserId": "106167875798496561165"
     }
    }
   ]
  },
  {
   "courseId": "16059575101",
   "courseWorkId": "33112639531",
   "id": "CgsIg4KMMxCrkKutew",
   "userId": "101780983833249541275",
   "creationTime": "2019-03-27T06:49:09.581Z",
   "updateTime": "2019-03-27T06:49:09.548Z",
   "state": "CREATED",
   "late": true,
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzMxMTI2Mzk1MzFa/submissions/student/MTA3MTUxNjE5",
   "courseWorkType": "ASSIGNMENT",
   "assignmentSubmission": {
   },
   "submissionHistory": [
    {
     "stateHistory": {
      "state": "CREATED",
      "stateTimestamp": "2019-03-27T06:49:09.547Z",
      "actorUserId": "101780983833249541275"
     }
    }
   ]
  },
  {
   "courseId": "16059575101",
   "courseWorkId": "33112639531",
   "id": "CgsI34WMMxCrkKutew",
   "userId": "101363693952849006549",
   "creationTime": "2019-03-27T06:49:09.853Z",
   "updateTime": "2019-03-27T06:49:09.814Z",
   "state": "CREATED",
   "late": true,
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzMxMTI2Mzk1MzFa/submissions/student/MTA3MTUyMDk1",
   "courseWorkType": "ASSIGNMENT",
   "assignmentSubmission": {
   },
   "submissionHistory": [
    {
     "stateHistory": {
      "state": "CREATED",
      "stateTimestamp": "2019-03-27T06:49:09.814Z",
      "actorUserId": "101363693952849006549"
     }
    }
   ]
  },

=================================

// get student's active courses by email
// https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&studentId=tom.kershaw%40students.hope.edu.kh&fields=courses(id%2Cname%2CguardiansEnabled%2CownerId%2CalternateLink)

"courseStates": [
        "ACTIVE"
      ],
      "studentId": "tom.kershaw@students.hope.edu.kh",
      "fields": "courses(id,name,guardiansEnabled,ownerId,alternateLink)"

// get submissions & grades for ONE student, by email address
      "courseId": "16063195662",
      "courseWorkId": "-",
      "states": [
        "RETURNED"
      ],
      "userId": "tom.kershaw@students.hope.edu.kh",
      "fields": "studentSubmissions(courseWorkId,assignedGrade)"

*/

/*

==================================================

GET https://classroom.googleapis.com/v1/courses/16059575101/courseWork?key={YOUR_API_KEY}
 
 
Response
 
200
 
- Show headers -
  
{
 "courseWork": [
  {
   "courseId": "16059575101",
   "id": "32765561263",
   "title": "Event Programming 8-23 REP",
   "description": "Complete puzzles 8-23, attach a link to your finished 'Chaser Game' and submit.\n\nPART A (15 marks):\n\nThis section covers:\n\n8. Common Patterns\n9. Naming things pt 1\n10.  Naming things pt 2\n11. Event Types\n12-16. Common Problems & Debugging\n17-19. Positioning objects on the screen\n20. Labels\n21. Images \n22. Chaser Game v1\n23. Quick Check-in\n\n(Took me about 35 minutes, but you may be quicker or slower - either is fine.)\n\n\nPART B (5 marks):\n\ni. Click the 'Share' button and copy the link to your finished Chaser Game\nii. Paste the link into this assignment & click 'Submit' \niii. View your game on a phone (or in your computer's browser) by emailing yourself the link.",
   "materials": [
    {
     "link": {
      "url": "https://studio.code.org/s/csp5-2018/stage/1/puzzle/8",
      "title": "Code.org",
      "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://studio.code.org/s/csp5-2018/stage/1/puzzle/8&a=AIYkKU_FkKnJ7wkHAjRPfVxpuD98SWVP8A"
     }
    }
   ],
   "state": "PUBLISHED",
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzI3NjU1NjEyNjNa/details",
   "creationTime": "2019-03-13T08:12:29.157Z",
   "updateTime": "2019-04-19T04:44:46.506Z",
   "dueDate": {
    "year": 2019,
    "month": 3,
    "day": 17
   },
   "dueTime": {
    "hours": 13
   },
   "maxPoints": 20,
   "workType": "ASSIGNMENT",
   "submissionModificationMode": "MODIFIABLE_UNTIL_TURNED_IN",
   "assignment": {
    "studentWorkFolder": {
     "id": "0ByUSUXY3mRrIfmlieGpydjFONDl6Q2dhNnJTdGVJb2xpeWpNb3FqSUh4V0Flb3oyQjBhZWs",
     "title": "Event Programming 8-23 REP",
     "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfmlieGpydjFONDl6Q2dhNnJTdGVJb2xpeWpNb3FqSUh4V0Flb3oyQjBhZWs"
    }
   },
   "assigneeMode": "ALL_STUDENTS",
   "creatorUserId": "107554112463094781867"
  },
  {
   "courseId": "16059575101",
   "id": "32692034019",
   "title": "Event Programming 1-7 REP",
*/

/*

GET courseWork.list
courseId = "16052292479"

Fields:
courseWork(alternateLink,dueDate,id,maxPoints,state,title,workType),nextPageToken
id, title, alternateLink, dueDate, maxPoints, assignment.studentWorkFolder.alternateLink

{
 "courseWork": [
  {
   "id": "32765561263",
   "title": "Event Programming 8-23 REP",
   "state": "PUBLISHED",
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzI3NjU1NjEyNjNa/details",
   "dueDate": {
    "year": 2019,
    "month": 3,
    "day": 17
   },
   "maxPoints": 20,
   "workType": "ASSIGNMENT"
  },
  
{
 "courseWork": [
  {
   "courseId": "16059575101",
   "id": "32765561263",
   "title": "Event Programming 8-23 REP",
   
Filter:
title.match(/REP[0-9% ]*$/)
?workType in ["ASSIGNMENT", "SHORT_ANSWER_QUESTION"]
dueDate["year"] == 2019
dueDate["month"] in [1,2,3,4,5,6]
state == "PUBLISHED"


*/




/*
GET https://classroom.googleapis.com/v1/
courses/16059575101/
courseWork/32765561263/studentSubmissions

?userId=kyler.hester%40students.hope.edu.kh
&fields=nextPageToken%2CstudentSubmissions(alternateLink%2CassignedGrade%2Cstate)
&key={YOUR_API_KEY}

nextPageToken,studentSubmissions(alternateLink,assignedGrade,state)

if state == "RETURNED" {
  .setValue(assignedGrade);
} else {
  var formula = '=HYPERLINK(' + alternateLink + ', ' + state + ')';
  .setFormula( formula );
}


Vilma: absent, not done
{
 "studentSubmissions": [
  {
   "state": "CREATED",
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzI3NjU1NjEyNjNa/submissions/student/ODY4MjA0MDI4"
  }
 ]
}

Kyler: 15/20 at first, then 20/20
{
 "studentSubmissions": [
  {
   "courseId": "16059575101",
   "courseWorkId": "32765561263",
   "id": "CgsI1J6MMxCvk-uHeg",
   "userId": "113773490023225569783",
   "creationTime": "2019-03-13T09:09:59.794Z",
   "updateTime": "2019-04-19T04:41:54.832Z",
   "state": "RETURNED",
   "draftGrade": 20,
   "assignedGrade": 20,
   "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa/a/MzI3NjU1NjEyNjNa/submissions/student/MTA3MTU1Mjg0",
   "courseWorkType": "ASSIGNMENT",
   "assignmentSubmission": {
   },
   "submissionHistory": [
    {
     "stateHistory": {
      "state": "CREATED",
      "stateTimestamp": "2019-03-13T09:09:59.738Z",
      "actorUserId": "113773490023225569783"
     }
    },
    {
     "stateHistory": {
      "state": "TURNED_IN",
      "stateTimestamp": "2019-03-17T15:25:16.692Z",
      "actorUserId": "113773490023225569783"
     }
    },
    {
     "gradeHistory": {
      "pointsEarned": 15,
      "maxPoints": 20,
      "gradeTimestamp": "2019-04-19T04:21:40.066Z",
      "actorUserId": "107554112463094781867",
      "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
     }
    },
    {
     "stateHistory": {
      "state": "RETURNED",
      "stateTimestamp": "2019-04-19T04:21:43.676Z",
      "actorUserId": "107554112463094781867"
     }
    },
    {
     "gradeHistory": {
      "pointsEarned": 15,
      "maxPoints": 20,
      "gradeTimestamp": "2019-04-19T04:21:43.676Z",
      "actorUserId": "107554112463094781867",
      "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
     }
    },
    {
     "stateHistory": {
      "state": "TURNED_IN",
      "stateTimestamp": "2019-04-19T04:34:00.298Z",
      "actorUserId": "113773490023225569783"
     }
    },
    {
     "gradeHistory": {
      "pointsEarned": 20,
      "maxPoints": 20,
      "gradeTimestamp": "2019-04-19T04:41:50.748Z",
      "actorUserId": "107554112463094781867",
      "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
     }
    },
    {
     "stateHistory": {
      "state": "RETURNED",
      "stateTimestamp": "2019-04-19T04:41:54.832Z",
      "actorUserId": "107554112463094781867"
     }
    },
    {
     "gradeHistory": {
      "pointsEarned": 20,
      "maxPoints": 20,
      "gradeTimestamp": "2019-04-19T04:41:54.832Z",
      "actorUserId": "107554112463094781867",
      "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
     }
    }
   ]
  }
 ]
}
*/

