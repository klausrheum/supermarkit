/**
* Lists all course names and ids
*
* https://developers.google.com/classroom/reference/rest/v1/courses/list#try-it
* fields: nextPageToken,courses(name,id,ownerId)
*/

/**
 * Explanation of function
 * @param {string} text The text you want logged
 * @return {number} the length of the debug string
 */
function debug(text) {
  var logText = "debug: " + text;
  Logger.log(logText);
  return logText.length;
}

function flush() {
  SpreadsheetApp.flush();
}


/**
 * @param {string} arg
 * @return {number}
 */
function createRBTrackers() {
  
}

/**
 * Explanation of function
 * @param {string} arg
 * @return {number}
 */
function createRBTracker() {
  
}

/**
 * Updates the 'Teachers' tab in the 'Reportbooks Tracker' SS
 */
function getTeachersFromTracker() {
 
  // https://developers.google.com/classroom/reference/rest/v1/courses.teachers/list?apix_params=%7B%22courseId%22%3A%2216063195662%22%2C%22fields%22%3A%22teachers(userId%2Cprofile.name.fullName%2Cprofile.emailAddress)%22%7D
  // teachers(userId,profile.name.fullName,profile.emailAddress)

  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  
  // get current list of teacher ids
  var tSheet = rb.getSheetByName(top.SHEETS.TEACHERS);
  var existingTeachers = tSheet.getRange(top.RANGES.TEACHERIDS).getValues();
  //Logger.log("existingTeachers: %s", existingTeachers);
  
  // build an array of teacherIds for fast indexOf checks
  // var teacherIds = [];
  // for (var t = 1; t < existingTeachers.length; t++) {
  //    var teacherId = existingTeachers[t][0];
  //    if (teacherId != "" && teacherIds.indexOf(teacherId) == -1) {
  //      //Logger.log(teacherId);
  //      teacherIds.push(teacherId);
  //    }
  //  }
  //Logger.log(teacherIds);

  // get list of courses from Reportbooks sheet
  var rbSheet = rb.getSheetByName(top.SHEETS.REPORTBOOKS);
  var courseIds = rbSheet.getRange(top.RANGES.COURSEIDS).getValues();
  if (courseIds[0][0] != "courseId") {
    throw "Column D in Reportbooks sheet does not start with 'courseId' - CHECK & FIX IMMEDIATELY";
  }
  
  // get teachers from each rb course
  var teacherIds = [];

  var newTeachers = [["id", "fullName", "email"]]; // header row
  for (var c = 1; c < courseIds.length; c++) { // skip header row
    var courseId = courseIds[c][0];
    // Logger.log(courseId);
    if (courseId == "") break;
    if (Number.isNaN(courseId)) continue;
    
    // teachers: {userId, fullName, email}
    var teachers = getTeachersFromCourse(courseId);
    
    // Logger.log("courseId: %s, teachers: %s", courseId, teachers);
    for (var t = 0; t < teachers.length; t++) {
      if (teacherIds.indexOf(teachers[t].userId) == -1) {
        // add this teacher to newTeachers;
        newTeachers.push([teachers[t].userId, teachers[t].fullName, teachers[t].email]);
        teacherIds.push(teachers[t].userId);
      }
    }
  }
  
  // update Teachers sheet
  //Logger.log(newTeachers);
  tSheet.getDataRange().setValue("");
  tSheet.getRange(1, 1, newTeachers.length, newTeachers[0].length).setValues(newTeachers);
}

function getStudentsFromClassroom() {
  
}

function TEST_createRBs() {
  importClassrooms("john.kershaw@hope.edu.kh");
}



function importClassrooms(teacherId) {
  if (teacherId == undefined) {
    teacherId = "";
  }
  
  var coursesData = getCoursesFromClassroom(teacherId);
  var goodCourses = coursesData[0];
  goodCourses.sort();
  var badCourses = coursesData[1];
  badCourses.sort();
  Logger.log("good: %s, bad: %s", goodCourses.length, badCourses.length);
  
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var sheet = rb.getSheetByName(top.SHEETS.REPORTBOOKS);
  
  //sheet = rb.getSheetByName("Copy of Reportbooks");
    
  var c, row, course;
  var goodRowsStart, goodRowsEnd;
  var badRowsStart, badRowsEnd;
  
  var startRow = 2;
  goodRowsStart = startRow;
  
  // good courses
  for (c = 0; c < goodCourses.length; c++) {
    course = goodCourses[c];
    //Logger.log(course);
    row = startRow + c;
    sheet.getRange(row, 2).setValue(course.name);
    sheet.getRange(row, 3).setValue(course.alternateLink);
    sheet.getRange(row, 4).setValue(course.id);
    sheet.getRange(row, 5).setValue(course.ownerId);
  }
  goodRowsEnd = row;
  
  sheet.getRange(goodRowsStart, 2, goodRowsEnd, 6)
  .setFontWeight("normal")
  .setFontColor("black");
  
  sheet.getRange(goodRowsEnd + 1, 2, 5, 4).setValue("");
  
  sheet.getRange(row + 3, 2)
  .setValue("Old/bad/dead courses (not in reports)")
  .setFontWeight("bold")
  .setFontColor("#999999");
  
  // bad courses
  startRow = row + 4;
  badRowsStart = startRow;
  
  for (c = 0; c < badCourses.length; c++) {
    course = badCourses[c];
    //Logger.log(course);
    row = startRow + c;
    sheet.getRange(row, 2).setValue(course.name);
    sheet.getRange(row, 3).setValue(course.alternateLink);
    sheet.getRange(row, 4).setValue(course.id);
    sheet.getRange(row, 5).setValue(course.ownerId);
  }

  badRowsEnd = row;
  
  sheet.getRange(badRowsEnd+1, 2, 20, 4).setValue("");
  
  sheet.getRange(badRowsStart, 2, badRowsEnd, 6)
  .setFontWeight("normal")
  .setFontColor("#999999");
  
  var rows = [[goodRowsStart, goodRowsEnd],
                 [badRowsStart, badRowsEnd]];
  var START = 0, END = 1;
  
  SpreadsheetApp.flush();
  
  // sort rows
  for (var goodBad = 0; goodBad < rows.length; goodBad ++) {
  sheet.getRange(rows[goodBad][START], 2, rows[goodBad][END], 5)
  .sort(
    [{column: 6, ascending: true}, // teacher name, alpha 
     {column: 2, ascending: true}  // courseName
    ]);
  }
}

function TEST_getTeachersFromCourse() {
  getTeachersFromCourse("16063195662");
}

function getTeachersFromCourse(courseId) {
  // Expects: courseId, eg 16063195662
  // Returns: teachers [{userId, fullName, email}, ...]
  
  if (courseId == undefined) {
    throw "getTeachersFromCourse called with no courseId";
  }
  var teachers = [];
  var optionalArgs = {
    pageSize: 50,
    fields: "teachers(userId,profile.name.fullName,profile.emailAddress)",
    pageToken: ""
  };
  var response = Classroom.Courses.Teachers.list(courseId, optionalArgs);
  var rTeachers = response.teachers;
  
  var nextPageToken = response.nextPageToken;
  if (rTeachers && rTeachers.length > 0) {
    for (i = 0; i < rTeachers.length; i++) {
      var teacher = {
        "userId": rTeachers[i].userId,
        "fullName": rTeachers[i].profile.name.fullName,
        "email": rTeachers[i].profile.emailAddress
      };
      // Logger.log(teacher);
      teachers.push(teacher);
    }
  } else {
    Logger.log('No teacher found.');
  }
  console.log(teacher);
  return teachers;
}


function getCoursesFromClassroom(teacherId) {
  // teacherId can be ""
  // TODO Use nextPageToken as pageToken to pull next page (!)
  var iterations = 0;
  var courses = [];
  var misnamedCourses = [];
  
  var optionalArgs = {
    pageSize: 50,
    teacherId: teacherId,
    fields: "nextPageToken,courses.name,courses.alternateLink,courses.id,courses.ownerId",
    pageToken: ""
  };
  
  var finished = false;
  while (! finished && iterations < 200) { // 4000 courses is more than we have!
    iterations ++;
    var response = Classroom.Courses.list(optionalArgs);
    var rCourses = response.courses;
    
    if (rCourses && rCourses.length > 0) {
      for (i = 0; i < rCourses.length; i++) {
        
        var course = rCourses[i];
        // Logger.log('%s', course.name.slice(0,3));
        if (course.name.slice(0,3) == "Y20") {
          courses.push(course);
          console.log("Adding course: " + course);
        } else {
          console.log("Invalid course name: %s", course.name); 
          misnamedCourses.push(course);
        }
        console.log("Now I have %s good courses and %s misnamed courses", courses.length, misnamedCourses.length);

        
        //Logger.log('%s %s', i, course);
        // Logger.log('%s %s (%s)', i, course.name, course.id);
        //}
      }
    }
    var nextPageToken = response.nextPageToken;
    console.log (nextPageToken);
    if (nextPageToken == undefined) {
      finished = true;
    } else {
      optionalArgs.pageToken = nextPageToken; 
    }
    console.info("After the %s request I have %s good courses and %s misnamed courses", iterations, courses.length, misnamedCourses.length);
  }
  console.log(courses.length, misnamedCourses.length);
  return [courses, misnamedCourses];
}

/*

{
  "courses": [
    {
      "id": "27744697001",
      "name": "Y2022 Khmer Beginner 1 JS",
      "section": "P5&6",
      "descriptionHeading": "Y2022 Khmer Beginner 1 JS P5&6",
      "room": "S30/31",
      "ownerId": "113890735713045680299",
      "creationTime": "2019-01-30T07:33:16.272Z",
      "updateTime": "2019-01-30T07:33:15.520Z",
      "enrollmentCode": "9rna5yw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc3NDQ2OTcwMDFa",
      "teacherGroupEmail": "Y2022_Khmer_Beginner_1_JS_P5_6_teachers_ad81dfa8@hope.edu.kh",
      "courseGroupEmail": "Y2022_Khmer_Beginner_1_JS_P5_6_af544b0e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfmdWaG9HTEliaS15TFM2SUpKX2pFV0VsVTc1VU9UeDd4bnFPVGppalFYNzg",
        "title": "Y2022 Khmer Beginner 1 JS P5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfmdWaG9HTEliaS15TFM2SUpKX2pFV0VsVTc1VU9UeDd4bnFPVGppalFYNzg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7e5dfb32@group.calendar.google.com"
    },
    {
      "id": "27699708831",
      "name": "Y2024 English MPk",
      "section": "Year 7",
      "descriptionHeading": "Y2024 English MPk Year 7",
      "ownerId": "107127868601574680717",
      "creationTime": "2019-01-29T04:12:29.753Z",
      "updateTime": "2019-01-29T04:12:29.016Z",
      "enrollmentCode": "1fbp0v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc2OTk3MDg4MzFa",
      "teacherGroupEmail": "Y2024_English_MPk_Year_7_teachers_f775beee@hope.edu.kh",
      "courseGroupEmail": "Y2024_English_MPk_Year_7_713977c1@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfi11YlphRWJsd0RZU0JtWFk0cGlsVFc0bGdBdjdzcGZUakpqaDRZVDFJMG8",
        "title": "Y2024 English MPk Year 7",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfi11YlphRWJsd0RZU0JtWFk0cGlsVFc0bGdBdjdzcGZUakpqaDRZVDFJMG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd29382bf@group.calendar.google.com"
    },

...

  ],
  "nextPageToken": "CioKKBImCJDJ2OmKLRIdCg5iDAjs5PywBRCAnK6tAgoLCICAgICAsuHZ7QE="
}

*/