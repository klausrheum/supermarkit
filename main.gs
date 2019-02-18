// main.gs ===================================================
// holds global objects for various doc IDs, eventually these 
// will be part of the spreadsheet this is attached to...
// =============================================================


// SEE README.gs for details of each file's purpose


// TODO FIX var sheet = rb.getSheetByName("Portfolios");

// https://developers.google.com/drive/api/v3/reference/files

//    "lastname": "Kershaw",
//    "firstname": "Tom",
//    "email": "tom.kershaw@students.hope.edu.kh",
//    "fullname": "Tom Kershaw",
//    "year": "Y09",
//    "filename": "KERSHAW, Tom (Sem 1 2018 Report)",
//    "fileid": "1I2WDPzVVat5xwczFGW2iUtyEivsThKa9Y8YgZAno3GM",
//    "link": "https://docs.google.com/spreadsheets/d/1I2WDPzVVat5xwczFGW2iUtyEivsThKa9Y8YgZAno3GM/edit",
//    "tabs": "ENG",
//    "row": 86,

var top = {
  "students": [],
  
  "rbTemplatesId": "1YyMyHCQeshm4bWnfiwC3DbRSWDw48PQv9I822oXU8ys",
  "SUBY00TemplateId": "17ZJgVhi_SQeoJffFmjdcOFsMp0FRiZVIkjulnmQXJBw",
  "aaa": "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y", // test reportbook

  FILES: {
    "rbDec2018": "1D3OEcKrRIWpJmopP07u-KWh6sQHae2Q3dSTzo6uMFVc",
    "rbJun2019": "1JSJDpMOWQ766EDZjlKz_d2pxzNTNe_NT15JiI3WMuQE",
    
    "RBTRACKER": "",
    "RBTEMPLATES": "1YyMyHCQeshm4bWnfiwC3DbRSWDw48PQv9I822oXU8ys",
    "SUBY00": "17ZJgVhi_SQeoJffFmjdcOFsMp0FRiZVIkjulnmQXJBw",
    "AAA": "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y"
  },
  
  SHEETS: {
    TITLESROW : 3,
    
    REPORTBOOKS: "Reportbooks",
    PORTFOLIOS: "Portfolios",
    PROBLEMLOG: "ProblemLog",
    
    OVERVIEW: "Overview",
    GRADES: "Grades",
    INDREP: "Individual report", // NB small 'r'
    
    ADMIN: "Admin",
    PASTORAL: "Pastoral",
    SUB: "Sub"
  },
  
  COLS: {
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
    
    IDSTOEXPORT: 12,
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
  
  CELLS: {
    OVERVIEWSUBJECT:      "B1",
    OVERVIEWTEACHER:      "B2",
    
    ADMINPASTORALTEACHER: "B3",
    ADMINEXTRACURRICULAR: "B9",
    ADMINATTENDANCETOTAL: "B10",
    ADMINPASTORALCOMMENT: "B11",
    ADMINATTRIBUTES:      "B13:B21"
  }
};

top.FILES.RBTRACKER = top.FILES.rbJun2019;
top.students = initialiseStudents();


var testing = false; // true
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

  var rawIds = SpreadsheetApp.openById(top.rbTrackerId)
  .getSheetByName("Reportbooks")
  .getRange("A2:A").getValues();
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

var courseId = 16052292479;
var courseWorkId = 16052292479;
mrkershaw = 107554112463094781867;


function listAllStudents() {
  var optionalArgs = {
    // pageSize: 10
  };
  var responses = Classroom.Courses.Students.list(courseId).students;
  //var courses = response.courses;
  Logger.log('responses = %s', responses.length);
  // Logger.log('responses = %s', responses);

  if (responses && responses.length > 0) {
    for (i = 0; i < responses.length; i++) {
      var response = responses[i];
      Logger.log('%s %s (%s)', i, response.profile.name.fullName, response.profile.emailAddress);
    }
  } else {
    Logger.log('No matches found.');
  }
}

/*
  'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&studentId=tom.kershaw%40students.hope.edu.kh&fields=courses(id%2Cname%2CguardiansEnabled%2CownerId%2CalternateLink)' \

https://developers.google.com/classroom/reference/rest/v1/courses/list?apix=true
// get student's acrive courses by id
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

