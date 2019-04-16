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
    "SEM": "Jun2019"  
  },
  
  FILES: {
    // reportbook trackers in semester order: rb(Dec|Jun)\d{4}
    "rbDec2018": "1D3OEcKrRIWpJmopP07u-KWh6sQHae2Q3dSTzo6uMFVc",
    "rbJun2019": "1JSJDpMOWQ766EDZjlKz_d2pxzNTNe_NT15JiI3WMuQE",
    
    // will become whichever is current
    "RBTRACKER": "",
    
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
    SUB: "Sub"
  },
  
  COLS: {
    // Columns in REPORTBOOKS sheet
    RBIDS: "A2:A",
    RBIDSTOEXPORT: 23, // replace this with getRBRows
    
    // Columns in PORTFOLIOS Sheet
    LASTNAME: 1,
    FIRSTNAME: 2,
    EMAIL: 3,
    FULLNAME: 4,
    YEAR: 5,
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

  },
  
  RANGES: {
    // Reportbooks
    COURSEIDS: "D:D",
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
    ADMINATTRIBUTES:      "B13:B21"
  }
};

// change this with each new semester (or pick from a list?)
top.FILES.RBTRACKER = top.FILES.rbJun2019;

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

var testRB = "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y";

var testStudentEmail = "tom.kershaw@students.hope.edu.kh";

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

function listCoursesForTom() {
  return listCourses(studentEmail);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}


// https://developers.google.com/classroom/reference/rest/v1/courses.students/list?apix_params=%7B%22courseId%22%3A%2216052292479%22%2C%22fields%22%3A%22students(userId%2Cprofile.name.fullName%2Cprofile.name.givenName%2Cprofile.name.familyName%2Cprofile.emailAddress)%22%7D

function listCourses(studentEmail) {
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





function listGradesForTom() {
  var studentId = "tom.kershaw@students.hope.edu.kh";
  var courseId = "16063195662";
  listGrades(courseId, studentId);
}

function listGrades(courseId, studentEmail) {
//  "courseWorkId": "-",
//      "states": [
//        "RETURNED"
//      ],
//      "userId": "tom.kershaw@students.hope.edu.kh",
//      "fields": "studentSubmissions(courseWorkId,assignedGrade)"

  var optionalArgs = {
    pageSize: 100,
    states: "RETURNED",
    userId: studentEmail,
    fields: "studentSubmissions(courseWorkId,assignedGrade)",
  };
  var courseWorkId = "-";
  
  Logger.log('%s %s', courseId, courseWorkId);
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(16063195662, "-");
  
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId, optionalArgs);
  var grades = response.studentSubmissions;
  var token = response.nextPageToken;
  
  Logger.log('grades.length = %s', grades.length);
  Logger.log('grades = %s', grades);
   
  //  RESULT: grades = [
//    {assignedGrade=100, courseWorkId=17017362948}, 
//     {assignedGrade=20, courseWorkId=16576592952}, 
//     {courseWorkId=16351918886}, 
//     {assignedGrade=9, courseWorkId=16063873810}
//     ]


  if (grades && grades.length > 0) {
    for (i = 0; i < grades.length; i++) {
      var grade = grades[i];
      var score = typeof grade.assignedGrade === "undefined" ? "has not yet been marked." : "scored " + parseInt(grade.assignedGrade);
      Logger.log('%s assignment %s %s', studentEmail, grade.courseWorkId, score);
    }
  } else {
    Logger.log('No courses found.');
  }
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
  https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&studentId=tom.kershaw%40students.hope.edu.kh&fields=courses(id%2Cname%2CguardiansEnabled%2CownerId%2CalternateLink)
  https://developers.google.com/classroom/reference/rest/v1/courses/list?apix=true

// get student's active courses by id
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

