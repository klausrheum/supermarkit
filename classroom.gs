/**
* Check main.gs / TESTING = false
* 
* updateReportbookClassrooms to pull data from Classroom into Reportbooks tab
* getTeachersFromTracker - grab list of teachers from Classroom using ownerIds in RB Tracker
* createMissingReportbooks - creates a reportbook from the template for each row in RB Tracker
*/




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

function getRbRows() {
  // get list of courses from rbTracker
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var rbSheet = rb.getSheetByName(top.SHEETS.REPORTBOOKS);
  
  return getRows(rbSheet);
}


/**
 * Create RB docs for classrooms with empty rbID fields (Reportbooks tab) 
 * @param {string} rbTrackerId
 * @return {array} list of created rbIds
 */
function createMissingReportbooks() {
  // get list of courses from rbTracker
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var rbSheet = rb.getSheetByName(top.SHEETS.REPORTBOOKS);
  
  var rbRows = getRows(rbSheet);
  
  var errors = [];
  for (var row = 0; row < rbRows.length; row++) {
    var rbRow = rbRows[row];
    
    Logger.log(rbRow.courseName);
    
    // ESCAPE ROUTE - only do the first two rows
    // if (row >= 2) break;
    
    if (rbRow.Sync) {
      
      // look for missing rbIds
      if (! rbRow.rbId) {
        var courseName = rbRow.courseName;
        console.log("Missing rbId for " + courseName);
        
        // if not found: create doc
        // TODO move this into createReportbook stub
        var rbFolderId = "1ixgKE3RJ_XRR_9Fu2mMsLNuz-wj-VpbT";
        
        var rbTitle = rbRow["Reportbook Title"];
        if (! fileExists(rbTitle, rbFolderId) ) {
          var newRbId = copyFile(top.FILES.SUBY00, rbFolderId, rbTitle);
          var email       = rbRow["ownerEmail"]
          var teacherName = rbRow["ownerName"];
          var subjectName = rbRow["Subject Name in Report"];
          
          if (newRbId && newRbId.length > 10) {
            rbRows[row]["rbId"] = newRbId;
            
            // update tracker row with rbId
            rbSheet.getRange(row + 2, 1).setValue(newRbId);
            addEditor(newRbId, email);
            updateReportbookMetadata(newRbId, subjectName, teacherName);
            
            var classroomPermission = havePermission(rbRow["teacherFolder"]);
            if (classroomPermission) {
              var alreadyLinked = fileExists(rbTitle, rbRow["teacherFolder"] );
              if ( ! alreadyLinked ) {
                linkFile(newRbId, rbRow["teacherFolder"]);
              }
            } else {
              console.error("Permission denied for " + rbTitle);
            }
          }
        }  
      }
    }
  }
  return rbRows;
}

function TEST_addEditor() {
  // Y2021 Math JKw
  var fileId = "1qLPF0bb78lCvP5Tf-cS9NaoVhWLYv70-NzwANrZOO6w";
  var email = "john.kershaw@hope.edu.kh";
  addEditor(fileId, email);
}

// Log the name of every file in the user's Drive.
function addEditor(fileId, email) {
   DriveApp.getFileById(fileId).addEditor(email);
}

function TEST_updateReportbookMetadata() {
  var rbFileId = "1qLPF0bb78lCvP5Tf-cS9NaoVhWLYv70-NzwANrZOO6w"; // Y10 Maths JKw
  var subjectName = "Math";
  var teacherName = "John Kershaw";
  updateReportbookMetadata(rbFileId, subjectName, teacherName);
}

function updateReportbookMetadata(rbFileId, subjectName, teacherName) {
  var ss = SpreadsheetApp.openById(rbFileId);
  Logger.log ("Updating OVERVIEW metadata for " + ss.getName() );
  var sheet = ss.getSheetByName(top.SHEETS.OVERVIEW);
  var gradesText = "GRADING SYSTEM (or replace column B with your own)";
  Logger.log(sheet.getRange(top.RANGES.OVERVIEWSUBJECT).setValue(subjectName) );
  sheet.getRange(top.RANGES.OVERVIEWTEACHER).setValue(teacherName);
  sheet.getRange(top.RANGES.OVERVIEWGRADETITLE).setValue(gradesText).mergeAcross();
  Logger.log("Updated reportbook metadata: ");
}


/*

Pull students from Classroom Courses into RBs

*/

function TEST_replaceRbStudents() {
  // The Klaus Room
  var courseId = 24614491226; 
  var rbId = "1pSh-DXY34nCL6KeQFwWbo07MZ0Z4pYdNxQ1d4kJYIAs";
  var courseStudents = listStudents(courseId);
  replaceRbStudents(rbId, courseStudents);
}

function replaceRbStudents (rbId, courseStudents) {
  // setup: remove any existing student data
  clearRbStudents(rbId);
  updateRbStudents(rbId, courseStudents);
}

function TEST_clearRbStudents() {
  // The Klaus Room
  var rbId = "1pSh-DXY34nCL6KeQFwWbo07MZ0Z4pYdNxQ1d4kJYIAs";
  clearRbStudents(rbId);  
}

function clearRbStudents(rbId) {
  var ss = SpreadsheetApp.openById(rbId);
  var sheet = ss.getSheetByName(top.SHEETS.GRADES);
  sheet.getRange("A7:C46").clearContent();
}

function TEST_hasComments() {
  var rbId = "1pSh-DXY34nCL6KeQFwWbo07MZ0Z4pYdNxQ1d4kJYIAs";
  var sheet = SpreadsheetApp.openById(rbId).getSheetByName(top.SHEETS.GRADES);
  
  sheet.getRange("Y7:Y").setValue("");
  if (hasComments(rbId) != false) {
    throw "ERROR: The Klaus Room should have NO comments!";  
  };
  
  sheet.getRange("Y20").setValue("This is a comment");
  if (hasComments(rbId) != true) {
    throw "ERROR: The Klaus Room should have comments!";  
  };
}

function emptyStr(element) {
  //Logger.log(element);
  var notEmpty = element != ""; 
  //Logger.log(notEmpty);
  return notEmpty;
}

function hasComments(rbId) {
  return hasValues(rbId, top.SHEETS.GRADES, "Y7:Y");
}

function hasValues(ss, sheetName, range) {
  var sheet = SpreadsheetApp.openById(ss).getSheetByName(sheetName);
  var values = sheet.getRange(range).getValues();
  return values.some(emptyStr);
}

function TEST_updateRbStudents() {
  // The Klaus Room
  var courseId = 24614491226; 
  var rbId = "1pSh-DXY34nCL6KeQFwWbo07MZ0Z4pYdNxQ1d4kJYIAs";
  var courseStudents = listStudents(courseId);
  if ( updateRbStudents(rbId, courseStudents) ) {
    Logger.log ("updateRbStudents completed successfully"); 
  } else {
    Logger.log ("updateRbStudents FAILED."); 
  };
}


function updateAllRbStudents () {
  var startTime = new Date(); 
  console.warn("updateAllRbStudents: STARTED " + startTime );

  // get list of courses from rbTracker
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var rbSheet = rb.getSheetByName(top.SHEETS.REPORTBOOKS);
  
  var rbRows = getRows(rbSheet);
  
  var errors = [];
  for (var row = 0; row < rbRows.length; row++) {
    var rbRow = rbRows[row];
    
    Logger.log(rbRow.courseName);
    
    // ESCAPE ROUTE - only do the first two rows
    // if (row >= 2) break;
    
    var courseName = rbRow.courseName;
    console.info("updateRbStudents: " + courseName);
    var courseStudents = listStudents(rbRow.courseId);
    updateRbStudents(rbRow.rbId, courseStudents);
  }
  var endTime = new Date();
  var elapsedTime = (endTime - startTime)/1000;
  
  console.warn("updateAllRbStudents: COMPLETED %s in %s secs", endTime, elapsedTime);

}

function updateRbStudents(rbId, courseStudents) {
  if (rbId == undefined || rbId.length < 10) {
    return false;
  }
  
  if (courseStudents == undefined || courseStudents.length < 1) {
    return false;
  }
    
  // check no comments are already in
  if ( hasValues(rbId, top.SHEETS.GRADES, "Y7:Y") ) {
    // throw "ERROR: Reportbook already has comments in column Y, cannot update students.";
    console.warn("Reportbook already has comments in column Y, skipping.");
    return false;
  }

  // check no students are already in
  if ( hasValues(rbId, top.SHEETS.GRADES, "A7:A") ) {
    console.warn("Reportbook already has students in column A, skipping.");
    return false;
  }
  
  var ss = SpreadsheetApp.openById(rbId);
  console.info ("Adding students to " + ss.getName());
  //Logger.log ("Adding students");
  //Logger.log (courseStudents);
  var sheet = ss.getSheetByName(top.SHEETS.GRADES);
  var maxRows = sheet.getMaxRows();
  //Logger.log("maxRows: " + maxRows);
  
  var startRow = 7;
  for (var i = 0; i < courseStudents.length; i++) {
    var values = [
      [
        courseStudents[i].familyName, 
        courseStudents[i].givenName, 
        courseStudents[i].emailAddress
      ]];
    //Logger.log(values);
    var row = startRow + i;
    sheet.getRange(row, 1, 1, 3).setValues(values);
    
    // fullName formula
    var formula = '=B{0} & " " & A{0}'.format(row);
    sheet.getRange(row, 4, 1, 1).setFormula(formula).setVerticalAlignment("middle");

    // GPA formula
    var formula = '=G{0} / 0.25'.format(row);
    sheet.getRange(row, 5, 1, 1).setFormula(formula);

    // Grd formula
    var formula = '=if(istext(A{0}), index(Grades, match($G{0}*100,GradeRange,-1), 1),"")'.format(row);
    sheet.getRange(row, 6, 1, 1).setFormula(formula);
    
    var formula = '=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H{0}:$X{0}, "<>", $H$1:$X$1)) * (H{0}:X{0} / $H$4:$X$4))))'.format(row);
    sheet.getRange(row, 7, 1, 1).setFormula(formula);
  }
  
  var sortSpecObj = [{column: 1, ascending: true}, {column: 2, ascending: true}];
  sheet.getRange(startRow, 1, maxRows-startRow-1, 3).sort(sortSpecObj);
  
  return courseStudents;
}


/**
 * TODO extract code from updateReportbooks (in updaters.gs)
 * 
 * Copy SUBY00 template into teacherFolder 
 * Rename it to: Y2019 IB Mathematical Studies JK Jun2019 Reportbook
   (title is from the current RB Tracker)
 *
 * @param {string} courseId the Classroom id for this course
 * @return {number} docId of the newly created Reportbook
 */
function createReportbook(courseId) {
  
}

/** 
 * TODO extract code from updateReportbooks (in updaters.gs)
 * 
 * Update class details (title, teacher, student list etc) from RB Tracker to RB
 * @param {string} courseId the Classroom id for this course
 * @return {number} docId of the newly created Reportbook
 */
function updateReportbook(courseId) {
  
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

function TEST_updateReportbookClassrooms() {
  importClassrooms("john.kershaw@hope.edu.kh");
}



function updateReportbookClassrooms(teacherId) {
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
    if (course.teacherFolder != undefined && course.teacherFolder.id != undefined) {
      sheet.getRange(row, 6).setValue(course.teacherFolder.id);
    }
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
    
    if (course.teacherFolder != undefined && course.teacherFolder.id != undefined) {
      sheet.getRange(row, 6).setValue(course.teacherFolder.id);
    }
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
  sheet.getRange(rows[goodBad][START], 2, rows[goodBad][END], 8)
  .sort(
    [{column: 8, ascending: true}, // teacher name, alpha 
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


function TEST_getCoursesFromClassroom() {
  var testTeacher = "17444398597"; // must be string
  var response = getCoursesFromClassroom( "john.kershaw@hope.edu.kh" );
  Logger.log ( response );
}

function getCoursesFromClassroom(teacherId) {
  // teacherId can be ""
  // TODO Use nextPageToken as pageToken to pull next page (!)
  var iterations = 0;
  var courses = [];
  var archivedCourses = [];
  
  var optionalArgs = {
    pageSize: 50,
    teacherId: teacherId,
    // NO SPACES!
    fields: "nextPageToken,courses.name,courses.alternateLink,courses.id,courses.ownerId,courses.teacherFolder.id,courses.courseState",
    pageToken: ""
  };
  
  var finished = false;
  while (! finished && iterations < 2000) { // 2000 courses is more than we have!
    iterations ++;
    var response = Classroom.Courses.list(optionalArgs);
    var rCourses = response.courses;
    
    if (rCourses && rCourses.length > 0) {
      for (i = 0; i < rCourses.length; i++) {
        
        var course = rCourses[i];
        // Logger.log('%s', course.name.slice(0,3));
        if (course.courseState == "ACTIVE" && course.name.indexOf("Pastoral") == -1) {
          courses.push(course);
          console.log("ACTIVE course found: " + course);
        } else {
          console.log("NON-ACTIVE course found: %s", course.name); 
          archivedCourses.push(course);
        }
        console.log("Now I have %s good courses and %s archived courses", courses.length, archivedCourses.length);

        
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
    console.info("After request #%s I have %s good courses and %s archived courses", iterations, courses.length, archivedCourses.length);
  }
  console.log("Live courses: " + courses.length + ", archived courses: " + archivedCourses.length);
  return [courses, archivedCourses];
}

function getStudentsFromClassroom() {
  // loop through reportbooks
  // grab students (first, last, email)
  // push to rbId's OVERVIEW tab
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