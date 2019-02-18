/**
* Lists all course names and ids
*
* https://developers.google.com/classroom/reference/rest/v1/courses/list#try-it
* fields: nextPageToken,courses(name,id,ownerId)
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
//  var teacherIds = [];
//  for (var t = 1; t < existingTeachers.length; t++) {
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
  createRBs("john.kershaw@hope.edu.kh");
}


function createRBs(teacherId) {
  if (teacherId == undefined) {
    teacherId = "";
  }
  var courses = getCoursesFromClassroom(teacherId);
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var sheet = rb.getSheetByName(top.SHEETS.REPORTBOOKS);
  var startRow = 2;
  
  for (var c = 0; c < courses.length; c++) {
    var course = courses[c];
    //Logger.log(course);
    var row = startRow + c;
    sheet.getRange(row, 2).setValue(course.name);
    sheet.getRange(row, 4).setValue(course.id);
    sheet.getRange(row, 5).setValue(course.ownerId);
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
    pageSize: 10,
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
  var courses = [];
  var optionalArgs = {
    pageSize: 10,
    teacherId: teacherId,
    fields: "courses.name,courses.id,courses.ownerId",
    pageToken: ""
  };
  
  var response = Classroom.Courses.Teachers.list(optionalArgs);
  var rCourses = response.courses;
  var nextPageToken = response.nextPageToken;
  if (rCourses && rCourses.length > 0) {
    for (i = 0; i < rCourses.length; i++) {
      var course = rCourses[i];
      // Logger.log('%s', course.name.slice(0,3));
      if (course.name.slice(0,3) == "Y20") {
        courses.push(course);
      }
      //Logger.log('%s %s', i, course);
      // Logger.log('%s %s (%s)', i, course.name, course.id);
      //}
    }
  } else {
    Logger.log('No courses found.');
  }
  console.log(courses);
  return courses;
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
    {
      "id": "27699708740",
      "name": "Y2026 English MPk",
      "section": "Year 5",
      "descriptionHeading": "Y2026 English MPk Year 5",
      "ownerId": "107127868601574680717",
      "creationTime": "2019-01-29T04:01:56.067Z",
      "updateTime": "2019-01-29T04:01:55.313Z",
      "enrollmentCode": "apa26",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc2OTk3MDg3NDBa",
      "teacherGroupEmail": "Y2026_English_MPk_Year_5_teachers_33eb5861@hope.edu.kh",
      "courseGroupEmail": "Y2026_English_MPk_Year_5_08a101fe@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfi1ZOW5VRXlWZ1V3QjQ2QW1nUFRJdm5USDBKdmVFazdvSjBOck5TQTlNMlE",
        "title": "Y2026 English MPk Year 5",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfi1ZOW5VRXlWZ1V3QjQ2QW1nUFRJdm5USDBKdmVFazdvSjBOck5TQTlNMlE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfa8d3d3c@group.calendar.google.com"
    },
    {
      "id": "27657436306",
      "name": "Y2023 Mathematics MPk",
      "section": "Year 8",
      "descriptionHeading": "Y2023 Mathematics MPk Year 8",
      "ownerId": "107127868601574680717",
      "creationTime": "2019-01-28T02:41:05.749Z",
      "updateTime": "2019-01-28T02:41:05.024Z",
      "enrollmentCode": "il21qr1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc2NTc0MzYzMDZa",
      "teacherGroupEmail": "Y2023_Mathematics_MPk_Year_8_teachers_ec2f5db3@hope.edu.kh",
      "courseGroupEmail": "Y2023_Mathematics_MPk_Year_8_728a59dc@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfkUwN2xRd0dzeXFJNE9jb1c5WndQamxzQjlVcU9Bck5kNFI3VDRQZFVxQ1k",
        "title": "Y2023 Mathematics MPk Year 8",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfkUwN2xRd0dzeXFJNE9jb1c5WndQamxzQjlVcU9Bck5kNFI3VDRQZFVxQ1k"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9d4959a1@group.calendar.google.com"
    },
    {
      "id": "27657435931",
      "name": "Y2025 Mathematics MPk",
      "section": "Year 6",
      "descriptionHeading": "Math 6 (2025) Mathematics MPk",
      "description": "Year 6",
      "ownerId": "107127868601574680717",
      "creationTime": "2019-01-28T02:10:02.146Z",
      "updateTime": "2019-01-28T02:23:37.608Z",
      "enrollmentCode": "l9kk3y",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc2NTc0MzU5MzFa",
      "teacherGroupEmail": "Math_6_2025_Mathematics_MPk_teachers_1cd35705@hope.edu.kh",
      "courseGroupEmail": "Math_6_2025_Mathematics_MPk_ac3cee94@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfjRfUllkczBRRjd3ZkV4QWdOTm1uN2RmbjFhOWVWQkIzSHBkWUgtMG1tU2s",
        "title": "Math 6 (2025) Mathematics MPk",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfjRfUllkczBRRjd3ZkV4QWdOTm1uN2RmbjFhOWVWQkIzSHBkWUgtMG1tU2s"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom2319316f@group.calendar.google.com"
    },
    {
      "id": "27648124001",
      "name": "Y2020 IB Business Management SL JA",
      "descriptionHeading": "Y11 Business Management SL",
      "ownerId": "102003547718393718946",
      "creationTime": "2019-01-26T04:10:10.473Z",
      "updateTime": "2019-01-29T03:14:12.124Z",
      "enrollmentCode": "k7eloo5",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc2NDgxMjQwMDFa",
      "teacherGroupEmail": "Y11_Business_Management_SL_teachers_d70667ce@hope.edu.kh",
      "courseGroupEmail": "Y11_Business_Management_SL_be0d73ef@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfm12MThGS3JJVFMwa0NFUHE2M0h5QzhwdnBhRXE2WWMxSE92blFfRkhhX0k",
        "title": "Y11 Business Management SL",
        "alternateLink": "https://drive.google.com/drive/folders/0B6KfBVM7lPEbfm12MThGS3JJVFMwa0NFUHE2M0h5QzhwdnBhRXE2WWMxSE92blFfRkhhX0k"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8609dd83@group.calendar.google.com"
    },
    {
      "id": "27518248764",
      "name": "5/6 Language Arts",
      "descriptionHeading": "5/6 Language Arts",
      "ownerId": "113635599462006979888",
      "creationTime": "2019-01-22T04:23:52.623Z",
      "updateTime": "2019-01-22T04:23:51.874Z",
      "enrollmentCode": "mrajsc0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc1MTgyNDg3NjRa",
      "teacherGroupEmail": "5_6_Language_Arts_teachers_2cba06b1@hope.edu.kh",
      "courseGroupEmail": "5_6_Language_Arts_5e7de656@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fk5yaVEzMER6NWxReV9sdjhZU01jVm1yRU5ZeThSb0RqaVY4Zl9pNElTRms"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom94497e87@group.calendar.google.com"
    },
    {
      "id": "27466269978",
      "name": "Y2024  ELL ML",
      "descriptionHeading": "Y2024  ESL ML",
      "ownerId": "115973731579234221936",
      "creationTime": "2019-01-18T02:49:37.922Z",
      "updateTime": "2019-01-18T06:27:23.036Z",
      "enrollmentCode": "jtjetdz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc0NjYyNjk5Nzha",
      "teacherGroupEmail": "Y2024_ESL_ML_teachers_2548edbd@hope.edu.kh",
      "courseGroupEmail": "Y2024_ESL_ML_9d4e89ad@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfkxSSE5lS3A5UXJzLTE1R1A0aThJMWtJTmRZempISEllZ2s0aGdBT1k2bG8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombcbfe24d@group.calendar.google.com"
    },
    {
      "id": "27441247689",
      "name": "Y06 SST 2018-2019",
      "descriptionHeading": "Y06 SST 2018-2019",
      "ownerId": "106362883448493695223",
      "creationTime": "2019-01-17T06:54:00.728Z",
      "updateTime": "2019-01-17T06:53:59.819Z",
      "enrollmentCode": "7cdi71l",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc0NDEyNDc2ODla",
      "teacherGroupEmail": "Y06_SST_2018_2019_teachers_f270ec3f@hope.edu.kh",
      "courseGroupEmail": "Y06_SST_2018_2019_dc890895@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfjJ5Y19zUzJPY0NUdDhKdUk4OFR5ODZMbkFTYVUwaXpnZU03NW5JSVEyLWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5229ab60@group.calendar.google.com"
    },
    {
      "id": "27333894361",
      "name": "Y2025 Science JG",
      "descriptionHeading": "Y2025 Science JG",
      "ownerId": "104832867972448297624",
      "creationTime": "2019-01-14T06:31:33.672Z",
      "updateTime": "2019-01-14T06:31:32.769Z",
      "enrollmentCode": "aq3c8j",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjczMzM4OTQzNjFa",
      "teacherGroupEmail": "Y2025_Science_JG_teachers_5e49edf9@hope.edu.kh",
      "courseGroupEmail": "Y2025_Science_JG_4cab11f6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4y8p5qN5Oqqfm8tekxQZ1Y3S190eDFSVEtqa1U3MUVTc29aUkJHYW5VZS1icGctX3B2c0E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome31d4a2e@group.calendar.google.com"
    },
    {
      "id": "27333894321",
      "name": "Y2023 Science JG",
      "descriptionHeading": "Y2023 Science JG",
      "ownerId": "104832867972448297624",
      "creationTime": "2019-01-14T06:25:23.151Z",
      "updateTime": "2019-01-14T06:25:22.286Z",
      "enrollmentCode": "oi9he5d",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjczMzM4OTQzMjFa",
      "teacherGroupEmail": "Y2023_Science_JG_teachers_ac7d8854@hope.edu.kh",
      "courseGroupEmail": "Y2023_Science_JG_f71a3c86@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4y8p5qN5Oqqfk9XbnR0X3ZtSDdjNy00R1UtU3ZzbTEzazE3UUh0SG1FMnBXR2ZvZlhEYm8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom090770ff@group.calendar.google.com"
    },
    {
      "id": "27325777585",
      "name": "Year 4 Miss G",
      "section": "Miss G",
      "descriptionHeading": "Year 4 Miss G Miss G",
      "ownerId": "111085591619122677825",
      "creationTime": "2019-01-13T11:56:55.319Z",
      "updateTime": "2019-01-13T12:10:37.888Z",
      "enrollmentCode": "dz8t8y",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjczMjU3Nzc1ODVa",
      "teacherGroupEmail": "Year_4_Miss_G_Miss_G_teachers_d64cafa4@hope.edu.kh",
      "courseGroupEmail": "Year_4_Miss_G_Miss_G_a6e28f1e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4fETXUlfqmxfjF4clBiMGY4MnRYRlVOcGxBSjVjaE5RUVVFYzVQeTBJQ2x1RVlaUzVQV0U"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom78209842@group.calendar.google.com"
    },
    {
      "id": "27204434707",
      "name": "Y2023 Khmer Beginner JS",
      "section": "P1&2",
      "descriptionHeading": "Year 8 Khmer Beginner P1&2",
      "room": "30",
      "ownerId": "113890735713045680299",
      "creationTime": "2019-01-08T01:53:41.734Z",
      "updateTime": "2019-01-30T00:06:31.728Z",
      "enrollmentCode": "st5jbem",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjcyMDQ0MzQ3MDda",
      "teacherGroupEmail": "Year_8_Khmer_Beginner_P1_2_teachers_0482a149@hope.edu.kh",
      "courseGroupEmail": "Year_8_Khmer_Beginner_P1_2_474c873b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfnBmM1AxeGpBQ1dwLXExZkJvU3FibllpMXU2RjI0b0ZSRXN6X3NKZ0FGTHM",
        "title": "Year 8 Khmer Beginner P1&2",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfnBmM1AxeGpBQ1dwLXExZkJvU3FibllpMXU2RjI0b0ZSRXN6X3NKZ0FGTHM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf179050a@group.calendar.google.com"
    },
    {
      "id": "26823362169",
      "name": "Year 6 B Pastoral Classroom",
      "descriptionHeading": "Year 6 B Pastoral Classroom",
      "room": "S12",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-12-11T06:52:01.836Z",
      "updateTime": "2018-12-11T07:32:32.891Z",
      "enrollmentCode": "wsgflzk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY4MjMzNjIxNjla",
      "teacherGroupEmail": "Year_6_B_Pastoral_Classroom_teachers_7197e619@hope.edu.kh",
      "courseGroupEmail": "Year_6_B_Pastoral_Classroom_55538305@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fldiNm5YR29NRUpWazFPUXBuVXVPVFRRaTRmSS1acVE3SFU5MnBQVUlUZlk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3b9003e7@group.calendar.google.com"
    },
    {
      "id": "26819158351",
      "name": "Y12 CPE Semester 2 2018-2019",
      "descriptionHeading": "Y12 CPE Semester 2 2018-2019",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-12-11T05:01:50.154Z",
      "updateTime": "2018-12-11T05:01:49.281Z",
      "enrollmentCode": "zuxezp",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY4MTkxNTgzNTFa",
      "teacherGroupEmail": "Y12_CPE_Semester_2_2018_2019_teachers_d4bdebc1@hope.edu.kh",
      "courseGroupEmail": "Y12_CPE_Semester_2_2018_2019_a239572f@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkl0YWx4bXFRVGgtSUVyZmtCdTlsdjZiQU5WcHpTVVZiU2h5OFh4eTk1bDA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0c8d1741@group.calendar.google.com"
    },
    {
      "id": "26819158318",
      "name": "Y11 CPE Semester 2 2018-2019",
      "descriptionHeading": "Y11 CPE",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-12-11T04:57:21.856Z",
      "updateTime": "2018-12-11T05:00:56.567Z",
      "enrollmentCode": "2xro6bu",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY4MTkxNTgzMTha",
      "teacherGroupEmail": "Y11_CPE_teachers_d8273f47@hope.edu.kh",
      "courseGroupEmail": "Y11_CPE_c905c7fc@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkxMLWdaMGZyUnh2elR4Wl9nbi1ZbXJaUkU4MkswVTZpMEZiakwzd3E1XzQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome534c02f@group.calendar.google.com"
    },
    {
      "id": "26819158259",
      "name": "Y09 CPE Semester 2 2018-2019",
      "descriptionHeading": "Y09 CPE Semester 2 2018-2019",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-12-11T04:53:42.948Z",
      "updateTime": "2018-12-11T04:53:42.048Z",
      "enrollmentCode": "6oykw9",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY4MTkxNTgyNTla",
      "teacherGroupEmail": "Y09_CPE_Semester_2_2018_2019_teachers_0bc95942@hope.edu.kh",
      "courseGroupEmail": "Y09_CPE_Semester_2_2018_2019_0131cb7b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXflhsQjhvZGtpNURTbzl1bXNLZVU5UTVLUlhVSEhzTy1iVGVwNWpfQnF2ek0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5bd9a047@group.calendar.google.com"
    },
    {
      "id": "26819158149",
      "name": "Y10 CPE Semester 2 2018-2019",
      "descriptionHeading": "Y10 CPE Semester 2 2018-2019",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-12-11T04:03:49.948Z",
      "updateTime": "2018-12-11T04:03:49.193Z",
      "enrollmentCode": "974n9f",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY4MTkxNTgxNDla",
      "teacherGroupEmail": "Y10_CPE_Semester_2_2018_2019_teachers_a602cdcb@hope.edu.kh",
      "courseGroupEmail": "Y10_CPE_Semester_2_2018_2019_687a06e5@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfk9ENUpvNHIzTlNLeUhGOW9uM08wZUdXcFd3Y3ZtdWJzSlc3dmFhQTJkdUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom50a8e9b0@group.calendar.google.com"
    },
    {
      "id": "24849166443",
      "name": "Y7 ELL",
      "descriptionHeading": "Y7 ELL",
      "ownerId": "102003547718393718946",
      "creationTime": "2018-11-20T09:31:57.090Z",
      "updateTime": "2018-11-20T09:31:56.263Z",
      "enrollmentCode": "7h754cc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjQ4NDkxNjY0NDNa",
      "teacherGroupEmail": "Y7_ELL_teachers_2551fcdc@hope.edu.kh",
      "courseGroupEmail": "Y7_ELL_c36efaf7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfnNlZW1HSWx3ajR3bUpld3hXbkdmRzJPZjAtVWZpUnJBcGIycGVCbzRvNkU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf1bab110@group.calendar.google.com"
    },
    {
      "id": "24614491226",
      "name": "The Klaus Room",
      "descriptionHeading": "Reportbook",
      "ownerId": "112192955798475743739",
      "creationTime": "2018-11-10T12:06:08.487Z",
      "updateTime": "2018-11-10T14:41:46.490Z",
      "enrollmentCode": "xshyzw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjQ2MTQ0OTEyMjZa",
      "teacherGroupEmail": "Reportbook_teachers_442c3247@hope.edu.kh",
      "courseGroupEmail": "Reportbook_a201c7c1@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9NN3apiglTJfmFlc2dHOUFzU1hNNzJFYVo3M241SzR1SmdRVWdzUlM4U3VRODZyU0FaY1E",
        "title": "Reportbook",
        "alternateLink": "https://drive.google.com/drive/folders/0B9NN3apiglTJfmFlc2dHOUFzU1hNNzJFYVo3M241SzR1SmdRVWdzUlM4U3VRODZyU0FaY1E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb1eea841@group.calendar.google.com"
    },
    {
      "id": "24545738795",
      "name": "Y2021 Global Perspectives RD",
      "descriptionHeading": "Global Perspectives 2019",
      "ownerId": "103551314133091140944",
      "creationTime": "2018-11-08T06:55:02.275Z",
      "updateTime": "2019-01-30T06:00:12.849Z",
      "enrollmentCode": "t3zt47v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjQ1NDU3Mzg3OTVa",
      "teacherGroupEmail": "Global_Perspectives_2019_teachers_183b6813@hope.edu.kh",
      "courseGroupEmail": "Global_Perspectives_2019_60b1c4f7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefjBEdXlZQnZQRXQ4cjZiRVR4Y1BDZ1VQeTNDdUNMNTBNc0ZaZzZySlU5U1U",
        "title": "Global Perspectives 2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefjBEdXlZQnZQRXQ4cjZiRVR4Y1BDZ1VQeTNDdUNMNTBNc0ZaZzZySlU5U1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom52292648@group.calendar.google.com"
    },
    {
      "id": "24375696302",
      "name": "Chemistry IB 2018 - 2020 (Secret HL Class)",
      "descriptionHeading": "Chemistry IB 2018 - 2020 (Secret HL Class)",
      "ownerId": "113917612521896405543",
      "creationTime": "2018-11-02T08:34:42.063Z",
      "updateTime": "2018-11-02T08:34:41.113Z",
      "enrollmentCode": "4dpxl5",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjQzNzU2OTYzMDJa",
      "teacherGroupEmail": "Chemistry_IB_2018_2020_Secret_HL_Class_teachers_41a7b10e@hope.edu.kh",
      "courseGroupEmail": "Chemistry_IB_2018_2020_Secret_HL_Class_226a00f7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fmIzUUZ3WmNaMmpNNlNxa1BPdktuZGxZNXlpSEFVRkpPazFtTDNWSTB5c0U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5dc16a8a@group.calendar.google.com"
    },
    {
      "id": "19836605740",
      "name": "Y2022 English Language TA",
      "descriptionHeading": "Mr A's Year 9 English Language",
      "description": "Mr A's year 9 English",
      "room": "iGCSE English Language",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-10-19T02:00:07.111Z",
      "updateTime": "2019-01-29T06:59:00.054Z",
      "enrollmentCode": "tqf5tw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk4MzY2MDU3NDBa",
      "teacherGroupEmail": "Mr_A_s_Year_9_English_Language_teachers_2e38500e@hope.edu.kh",
      "courseGroupEmail": "Mr_A_s_Year_9_English_Language_b908e477@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fklIMncxOV9zeFhBWjItWU5ieXE2UVVhYnFZQU15TVp1YVlWeEg2NFhHUEU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfcec5071@group.calendar.google.com"
    },
    {
      "id": "19689765898",
      "name": "Christian Perspectives",
      "section": "Year 8",
      "descriptionHeading": "CP8 Year 8",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-10-15T11:33:33.870Z",
      "updateTime": "2019-01-29T05:55:38.590Z",
      "enrollmentCode": "ujleg4t",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk2ODk3NjU4OTha",
      "teacherGroupEmail": "CP8_Year_8_teachers_36debd90@hope.edu.kh",
      "courseGroupEmail": "CP8_Year_8_38ff8a2b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfkNNRjZIYUNNMzFfa1ZEWk8wak1adVE0TGoyaTZwRjQzLTRKeXZyVGFGOUU",
        "title": "CP8 Year 8",
        "alternateLink": "https://drive.google.com/drive/folders/0BzV9BTf3s2RpfkNNRjZIYUNNMzFfa1ZEWk8wak1adVE0TGoyaTZwRjQzLTRKeXZyVGFGOUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomdb0a30b9@group.calendar.google.com"
    },
    {
      "id": "19689503377",
      "name": "Christian Perspectives",
      "section": "Year 7",
      "descriptionHeading": "CP7 Year 7",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-10-15T11:29:10.880Z",
      "updateTime": "2019-01-29T05:55:50.189Z",
      "enrollmentCode": "418z50t",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk2ODk1MDMzNzda",
      "teacherGroupEmail": "CP7_Year_7_teachers_c9d4cc22@hope.edu.kh",
      "courseGroupEmail": "CP7_Year_7_50f73945@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfllNQUVVLWNlNDM4N1QyR0V6dmExek9xa3VQaFFMQmtLMGdKQW5OQ3FCTXM",
        "title": "CP7 Year 7",
        "alternateLink": "https://drive.google.com/drive/folders/0BzV9BTf3s2RpfllNQUVVLWNlNDM4N1QyR0V6dmExek9xa3VQaFFMQmtLMGdKQW5OQ3FCTXM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3a26a570@group.calendar.google.com"
    },
    {
      "id": "17514495102",
      "name": "Y2022 Pastoral Class ME/HG/JV",
      "descriptionHeading": "Class of 2022 Pastoral Class",
      "ownerId": "115496394537878274323",
      "creationTime": "2018-10-05T03:37:40.654Z",
      "updateTime": "2019-01-31T15:36:47.228Z",
      "enrollmentCode": "grqhls4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc1MTQ0OTUxMDJa",
      "teacherGroupEmail": "Class_of_2022_Pastoral_Class_teachers_62c7fe0d@hope.edu.kh",
      "courseGroupEmail": "Class_of_2022_Pastoral_Class_7da916f6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3Z2_x68KLtrfkZxbVVvOElRMml5TXc1S1hCRkVfcUVDTGVoOVg4NFExYnNraXR4R0NINWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom316aaed2@group.calendar.google.com"
    },
    {
      "id": "17501572097",
      "name": "Spanish Y12",
      "descriptionHeading": "Spanish Y11",
      "room": "s30",
      "ownerId": "106764436087764054484",
      "creationTime": "2018-10-05T01:10:09.934Z",
      "updateTime": "2018-10-05T01:16:17.875Z",
      "enrollmentCode": "pjlqn3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc1MDE1NzIwOTda",
      "teacherGroupEmail": "Spanish_Y11_teachers_0c735153@hope.edu.kh",
      "courseGroupEmail": "Spanish_Y11_4f9a9249@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6ZQeT5ezgjrfjY1YlZyQ210SzRJOGVSQ2JwcXFOVExUS0lfTW5lYWFtNnpDTEIweHp1aEU",
        "title": "Spanish Y11",
        "alternateLink": "https://drive.google.com/drive/folders/0B6ZQeT5ezgjrfjY1YlZyQ210SzRJOGVSQ2JwcXFOVExUS0lfTW5lYWFtNnpDTEIweHp1aEU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc4fac2c6@group.calendar.google.com"
    },
    {
      "id": "17483088170",
      "name": "asdf",
      "section": "asd",
      "descriptionHeading": "asdf asd",
      "room": "sd",
      "ownerId": "106949743532299895798",
      "creationTime": "2018-10-04T11:27:14.603Z",
      "updateTime": "2018-10-04T11:27:13.456Z",
      "enrollmentCode": "8j3wma",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0ODMwODgxNzBa",
      "teacherGroupEmail": "asdf_asd_teachers_e9a0ee4c@hope.edu.kh",
      "courseGroupEmail": "asdf_asd_7268ebba@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0MVC1aTFYQIflRVb3llV2dhUk1NVnNjeHRJZHBNb0l6M2tWazRHcDNfaVBXWW5QUGVqNXc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom59bf4807@group.calendar.google.com"
    },
    {
      "id": "17444876010",
      "name": "Guidance",
      "section": "Graduate 2022",
      "descriptionHeading": "Guidance Graduate 2022",
      "room": "Wherever you like :)",
      "ownerId": "106949743532299895798",
      "creationTime": "2018-10-03T08:46:22.956Z",
      "updateTime": "2018-10-03T08:46:21.802Z",
      "enrollmentCode": "qne4o6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDQ4NzYwMTBa",
      "teacherGroupEmail": "Guidance_Graduate_2022_teachers_5b580d30@hope.edu.kh",
      "courseGroupEmail": "Guidance_Graduate_2022_44945537@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0MVC1aTFYQIflZIWmRGLTg0X01haWh2NENFM1J2MG5fUjliQ2NzZXd1em15Mm1pNUdaVzA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomffaa5ab1@group.calendar.google.com"
    },
    {
      "id": "17444875922",
      "name": "Guidance",
      "section": "Graduate 2021",
      "descriptionHeading": "Guidance Graduate 2021",
      "room": "Wherever you like :)",
      "ownerId": "106949743532299895798",
      "creationTime": "2018-10-03T08:39:36.521Z",
      "updateTime": "2018-10-03T08:39:35.607Z",
      "enrollmentCode": "448mlc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDQ4NzU5MjJa",
      "teacherGroupEmail": "Guidance_Graduate_2021_teachers_18734cba@hope.edu.kh",
      "courseGroupEmail": "Guidance_Graduate_2021_9bc16aef@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0MVC1aTFYQIflFxVURNeWU0d180Z1lpM2hoRkx0anhCclVjMkVwNTUyWGRvUXBpb3VRUWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroombd1684a2@group.calendar.google.com"
    },
    {
      "id": "17444874699",
      "name": "Guidance",
      "section": "Graduate 2020",
      "descriptionHeading": "Guidance Graduate 2020",
      "room": "Wherever you like :)",
      "ownerId": "106949743532299895798",
      "creationTime": "2018-10-03T08:34:47.584Z",
      "updateTime": "2018-10-03T08:34:46.556Z",
      "enrollmentCode": "bonpbqh",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDQ4NzQ2OTla",
      "teacherGroupEmail": "Guidance_Graduate_2020_teachers_d49b24e2@hope.edu.kh",
      "courseGroupEmail": "Guidance_Graduate_2020_c6627858@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0MVC1aTFYQIfjBRRlEtWjJOY2F5LU5PNXRFN1hnT2lrWGg3Tmp6Umt3aWxwdTA5a2NjY28"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom90a37d1f@group.calendar.google.com"
    },
    {
      "id": "17444874628",
      "name": "Guidance For 2019 Graduates",
      "section": "Graduate 2019",
      "descriptionHeading": "Guidance For 2019 Graduates Graduate 2019",
      "room": "Wherever you like :)",
      "ownerId": "106949743532299895798",
      "creationTime": "2018-10-03T08:20:21.482Z",
      "updateTime": "2018-10-03T08:20:20.557Z",
      "enrollmentCode": "6gr3cvq",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDQ4NzQ2Mjha",
      "teacherGroupEmail": "Guidance_For_2019_Graduates_Graduate_2019_teachers_e64908c5@hope.edu.kh",
      "courseGroupEmail": "Guidance_For_2019_Graduates_Graduate_2019_cd3fea94@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0MVC1aTFYQIfmd2b0dBWGZaRG9YTmZ0NWN5SVQxd3Y2R2c2b3VhUl93dFlfcm51UTNzX3c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf70ab378@group.calendar.google.com"
    },
    {
      "id": "17444873012",
      "name": "Guidance",
      "section": "teachers",
      "descriptionHeading": "Guidance teachers",
      "room": "outer space",
      "ownerId": "106949743532299895798",
      "creationTime": "2018-10-03T07:58:31.969Z",
      "updateTime": "2018-10-03T07:58:30.964Z",
      "enrollmentCode": "43menpw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDQ4NzMwMTJa",
      "teacherGroupEmail": "Guidance_teachers_teachers_9ffdef5f@hope.edu.kh",
      "courseGroupEmail": "Guidance_teachers_4459c0e2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0MVC1aTFYQIfjNFQlN6Y1B2blpSYzhJN3Fvd252ZGdYZHJzRXNhTzFucGIwUWxHdXNndG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome83ebadc@group.calendar.google.com"
    },
    {
      "id": "17443654652",
      "name": "Y2019 Mathematical Studies JK",
      "descriptionHeading": "year 12 MathstudiesJK 2018-2019",
      "ownerId": "115587463545633093027",
      "creationTime": "2018-10-03T07:07:24.757Z",
      "updateTime": "2019-01-11T02:14:09.794Z",
      "enrollmentCode": "a94it9",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDM2NTQ2NTJa",
      "teacherGroupEmail": "year_12_MathstudiesJK_2018_2019_teachers_34d50b23@hope.edu.kh",
      "courseGroupEmail": "year_12_MathstudiesJK_2018_2019_c69d47e3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJfjNsV0tpeC1rWFBleFJvTmp2aEJ5NjlKV1Z0VGxiV0w3eEp2WnhjU0ZTMzQ",
        "title": "year 12 MathstudiesJK 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B__ejNZ_YZSJfjNsV0tpeC1rWFBleFJvTmp2aEJ5NjlKV1Z0VGxiV0w3eEp2WnhjU0ZTMzQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0d511254@group.calendar.google.com"
    },
    {
      "id": "17444398597",
      "name": "year 10 MathJK 2018-2019",
      "descriptionHeading": "year 10 MathJK 2018-2019",
      "ownerId": "115587463545633093027",
      "creationTime": "2018-10-03T07:02:09.115Z",
      "updateTime": "2018-10-03T07:02:08.150Z",
      "enrollmentCode": "6e32o2j",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0NDQzOTg1OTda",
      "teacherGroupEmail": "year_10_MathJK_2018_2019_teachers_120b338b@hope.edu.kh",
      "courseGroupEmail": "year_10_MathJK_2018_2019_3db55249@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJfmZjYWxYLTIzQk1SQk5qZktWQ2wyNVh1ZE1HT1RKQ0M5Uk1qRnMwZDBfOWs"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7e1a8368@group.calendar.google.com"
    },
    {
      "id": "17403677939",
      "name": "Y2022 Khmer Advance 2 JS",
      "section": "P 5&6",
      "descriptionHeading": "Year 9 Khmer Class Advance 2 P 5&6",
      "room": "S 30",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-10-02T06:38:55.669Z",
      "updateTime": "2019-01-30T07:40:59.097Z",
      "enrollmentCode": "ka7phv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0MDM2Nzc5Mzla",
      "teacherGroupEmail": "Year_9_Khmer_Class_Advance_2_P_5_6_teachers_4d6eeb82@hope.edu.kh",
      "courseGroupEmail": "Year_9_Khmer_Class_Advance_2_P_5_6_05757c5c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfnlYdUVRSjl4c0wyRVlYdUF2UDZYcVNRdEwzUXJPZDR5cEZteXdFUjRzX3c",
        "title": "Year 9 Khmer Class Advance 2 P 5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfnlYdUVRSjl4c0wyRVlYdUF2UDZYcVNRdEwzUXJPZDR5cEZteXdFUjRzX3c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomef3bdc68@group.calendar.google.com"
    },
    {
      "id": "17403677920",
      "name": "Y2022 Khmer Advance 1 JS",
      "section": "P 5&6",
      "descriptionHeading": "Year 9 Khmer Class Advance 1 P 5&6",
      "room": "S 30",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-10-02T06:36:24.775Z",
      "updateTime": "2019-01-30T07:40:36.205Z",
      "enrollmentCode": "f9yyuz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0MDM2Nzc5MjBa",
      "teacherGroupEmail": "Year_9_Khmer_Class_Advance_1_P_5_6_teachers_fc24ca4b@hope.edu.kh",
      "courseGroupEmail": "Year_9_Khmer_Class_Advance_1_P_5_6_d61083f3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfkU1QUg5M2lpYW9fXzRRX2lsR2tRVkhfcldVdmxFbDBpd0cyYUFRV3hkblU",
        "title": "Year 9 Khmer Class Advance 1 P 5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfkU1QUg5M2lpYW9fXzRRX2lsR2tRVkhfcldVdmxFbDBpd0cyYUFRV3hkblU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom76618729@group.calendar.google.com"
    },
    {
      "id": "17403677897",
      "name": "Y2022 Khmer Intermediate JS",
      "section": "P 5&6",
      "descriptionHeading": "Year 9 Khmer Class Intermediate P 5&6",
      "room": "S 30",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-10-02T06:34:25.147Z",
      "updateTime": "2019-01-30T07:39:58.284Z",
      "enrollmentCode": "10pir43",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0MDM2Nzc4OTda",
      "teacherGroupEmail": "Year_9_Khmer_Class_Intermediate_P_5_6_teachers_872e16c7@hope.edu.kh",
      "courseGroupEmail": "Year_9_Khmer_Class_Intermediate_P_5_6_f7b55e80@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfjRqRlRPMERON1hLZldFV1NnOFZtOTNuRlRIY0drZzlEY2ZTR3FCaFRnVjQ",
        "title": "Year 9 Khmer Class Intermediate P 5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfjRqRlRPMERON1hLZldFV1NnOFZtOTNuRlRIY0drZzlEY2ZTR3FCaFRnVjQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfea540d5@group.calendar.google.com"
    },
    {
      "id": "17403677878",
      "name": "Y2022 Khmer Beginner 2 JS",
      "section": "P 5&6",
      "descriptionHeading": "Year 9 Khmer Class Beginner P 5&6",
      "room": "S 30",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-10-02T06:32:23.285Z",
      "updateTime": "2019-01-30T07:38:06.534Z",
      "enrollmentCode": "4lz8wz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0MDM2Nzc4Nzha",
      "teacherGroupEmail": "Year_9_Khmer_Class_Beginner_P_5_6_teachers_27ab6f08@hope.edu.kh",
      "courseGroupEmail": "Year_9_Khmer_Class_Beginner_P_5_6_ea067edc@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfnhBbkgwS2NhRFo2M0pyOGRkOVJDUHd1Mld6a0xMUGJJNW1TYkFTTEhUR0U",
        "title": "Year 9 Khmer Class Beginner P 5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfnhBbkgwS2NhRFo2M0pyOGRkOVJDUHd1Mld6a0xMUGJJNW1TYkFTTEhUR0U"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomed4e54a2@group.calendar.google.com"
    },
    {
      "id": "17403456754",
      "name": "Year 10 Khmer Class Intermediate",
      "section": "P 5&6",
      "descriptionHeading": "Year 10 Khmer Class Intermediate P 5&6",
      "room": "S 30",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-10-02T06:24:37.276Z",
      "updateTime": "2018-10-02T06:24:36.139Z",
      "enrollmentCode": "6j6npj",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTc0MDM0NTY3NTRa",
      "teacherGroupEmail": "Year_10_Khmer_Class_Intermediate_P_5_6_teachers_401186aa@hope.edu.kh",
      "courseGroupEmail": "Year_10_Khmer_Class_Intermediate_P_5_6_dbfa781c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfkxEcmM5ZVlBbHhONHNZUTNqREM1QzRIdHc1ejJhM012aVF6QlFsMThWUE0",
        "title": "Year 10 Khmer Class Intermediate P 5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfkxEcmM5ZVlBbHhONHNZUTNqREM1QzRIdHc1ejJhM012aVF6QlFsMThWUE0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb27cafab@group.calendar.google.com"
    },
    {
      "id": "17312273872",
      "name": "Year 10 Khmer Class beginner",
      "section": "P 5&6",
      "descriptionHeading": "Year 10 Khmer Class beginner P 5&6",
      "room": "S30",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-09-28T07:31:52.808Z",
      "updateTime": "2018-09-28T07:31:51.979Z",
      "enrollmentCode": "k5jbg3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTczMTIyNzM4NzJa",
      "teacherGroupEmail": "Year_10_Khmer_Class_beginner_P_5_6_teachers_d5660d08@hope.edu.kh",
      "courseGroupEmail": "Year_10_Khmer_Class_beginner_P_5_6_0af1c666@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfmpjRGNNX2UwZnA1MHdUWjVSWXNFdHZ5X2ZhUGZfWHNPdEVDQkx4SWo5MTQ",
        "title": "Year 10 Khmer Class beginner P 5&6",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfmpjRGNNX2UwZnA1MHdUWjVSWXNFdHZ5X2ZhUGZfWHNPdEVDQkx4SWo5MTQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3dedd058@group.calendar.google.com"
    },
    {
      "id": "18202503369",
      "name": "ICT08",
      "descriptionHeading": "JKw Information Technology Yr 08",
      "description": "Google Classroom name: Y8 ICT 2018-2019rnSycamore class name: ICT08",
      "ownerId": "112981667321270804129",
      "creationTime": "2018-09-26T07:31:06.878Z",
      "updateTime": "2018-09-26T08:13:16.578Z",
      "enrollmentCode": "l4ea50z",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTgyMDI1MDMzNjla",
      "teacherGroupEmail": "Y8_ICT_2018_2019_teachers_f360413a@hope.edu.kh",
      "courseGroupEmail": "Y8_ICT_2018_2019_47091030@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6CfEUqoQMi1fldxYlBfM2N6SjMwR2VLb25SZWJOcERaRkYyTzdldkJUaVRDUE15QlRlWjA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom2c9503d0@group.calendar.google.com"
    },
    {
      "id": "17189980127",
      "name": "Y10 CL 2018-2019",
      "descriptionHeading": "Y10 CL 2018-2019",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-09-25T06:19:32.174Z",
      "updateTime": "2018-09-25T06:19:31.118Z",
      "enrollmentCode": "2ssmob",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcxODk5ODAxMjda",
      "teacherGroupEmail": "Y10_CL_2018_2019_teachers_853d0038@hope.edu.kh",
      "courseGroupEmail": "Y10_CL_2018_2019_954e2685@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkZBWjFMTXpXNXVrdURpVlN1OU43dWhNamdvV0lPdlloN1V4ckt3a3hSU0U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf0984312@group.calendar.google.com"
    },
    {
      "id": "17191737257",
      "name": "Year 8 Khmer Class",
      "section": "P 1&2",
      "descriptionHeading": "Year 8 Khmer Class P 1&2",
      "room": "The HUB",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-09-25T02:46:59.676Z",
      "updateTime": "2018-09-25T02:46:58.804Z",
      "enrollmentCode": "a4kthf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcxOTE3MzcyNTda",
      "teacherGroupEmail": "Year_8_Khmer_Class_P_1_2_teachers_6062010e@hope.edu.kh",
      "courseGroupEmail": "Year_8_Khmer_Class_P_1_2_48b892f8@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfjVhbktxejlqbmpJS1hrMjMzbzI2eTBlUE51YXAzM0J3WmozOTRZVDR4c2c",
        "title": "Year 8 Khmer Class P 1&2",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfjVhbktxejlqbmpJS1hrMjMzbzI2eTBlUE51YXAzM0J3WmozOTRZVDR4c2c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4034639e@group.calendar.google.com"
    },
    {
      "id": "17150655334",
      "name": "Year 6 PE",
      "descriptionHeading": "Year 6 PE",
      "ownerId": "116812421249571245741",
      "creationTime": "2018-09-24T06:38:14.161Z",
      "updateTime": "2018-09-24T06:39:07.811Z",
      "enrollmentCode": "d5sa7g",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcxNTA2NTUzMzRa",
      "teacherGroupEmail": "Year_6_PE_teachers_146c2055@hope.edu.kh",
      "courseGroupEmail": "Year_6_PE_36b16132@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9idqSzWuCWUfjNkcElGdFI3YjVLRW1tOHpKZDhMcUNjMEVTQzYzZlR2Z0UxTEE1UHBiWkE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom22af3766@group.calendar.google.com"
    },
    {
      "id": "17095626195",
      "name": "Year 7 Khmer Advance",
      "section": "P 1&2",
      "descriptionHeading": "Year 7 Khmer Advance P 1&2",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-09-21T01:51:06.956Z",
      "updateTime": "2018-09-21T01:51:06.134Z",
      "enrollmentCode": "388ty",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcwOTU2MjYxOTVa",
      "teacherGroupEmail": "Year_7_Khmer_Advance_P_1_2_teachers_4af5c234@hope.edu.kh",
      "courseGroupEmail": "Year_7_Khmer_Advance_P_1_2_40346c3d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfk5oWWVaN3FKT0l2Qmd0VWFvN3FSa19kd19Hal9tT05KWl82bHNKYzRZcEk",
        "title": "Year 7 Khmer Advance P 1&2",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfk5oWWVaN3FKT0l2Qmd0VWFvN3FSa19kd19Hal9tT05KWl82bHNKYzRZcEk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom11776d44@group.calendar.google.com"
    },
    {
      "id": "17095626146",
      "name": "Year 7 Khmer Beginner",
      "section": "P 1&2",
      "descriptionHeading": "Year 7 Khmer Beginner P 1&2",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-09-21T01:45:26.271Z",
      "updateTime": "2018-09-21T01:45:25.078Z",
      "enrollmentCode": "d8y8ddv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcwOTU2MjYxNDZa",
      "teacherGroupEmail": "Year_7_Khmer_Beginner_P_1_2_teachers_fc957a23@hope.edu.kh",
      "courseGroupEmail": "Year_7_Khmer_Beginner_P_1_2_9dc57b5f@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHflVQcVlPVDRUcDdBbWZMNkVSZlZhd1VVemZuR09yVkc4aWZnOEhUWV9xRE0",
        "title": "Year 7 Khmer Beginner P 1&2",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHflVQcVlPVDRUcDdBbWZMNkVSZlZhd1VVemZuR09yVkc4aWZnOEhUWV9xRE0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroombc59f2a2@group.calendar.google.com"
    },
    {
      "id": "17059881667",
      "name": "Year 12",
      "descriptionHeading": "Year 12",
      "room": "S 26.1/ 24",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-09-20T06:54:49.327Z",
      "updateTime": "2018-09-20T06:54:48.455Z",
      "enrollmentCode": "achu6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcwNTk4ODE2Njda",
      "teacherGroupEmail": "Year_12_teachers_ddf7c251@hope.edu.kh",
      "courseGroupEmail": "Year_12_cc5427c6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfkZBV0JGUmk4ak1RQjRoYjlKeGowRmVpdEZhNktyXzl4aExKQy1hSlRHWTA",
        "title": "Year 12",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfkZBV0JGUmk4ak1RQjRoYjlKeGowRmVpdEZhNktyXzl4aExKQy1hSlRHWTA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6d42c777@group.calendar.google.com"
    },
    {
      "id": "17019285041",
      "name": "Y2020 Mathematical Studies JK",
      "descriptionHeading": "year 11 math studies",
      "room": "S4",
      "ownerId": "115587463545633093027",
      "creationTime": "2018-09-19T08:42:20.836Z",
      "updateTime": "2019-01-11T02:13:38.954Z",
      "enrollmentCode": "7pelmf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTcwMTkyODUwNDFa",
      "teacherGroupEmail": "year_11_math_studies_teachers_df1133e3@hope.edu.kh",
      "courseGroupEmail": "year_11_math_studies_77c8abe7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJflJRZ00wUjFVLTdBMjlaLWJGTU9ockRyU0labFE5RGJHaUo4aWdTUW5SaVE",
        "title": "year 11 math studies",
        "alternateLink": "https://drive.google.com/drive/folders/0B__ejNZ_YZSJflJRZ00wUjFVLTdBMjlaLWJGTU9ockRyU0labFE5RGJHaUo4aWdTUW5SaVE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom224429b8@group.calendar.google.com"
    },
    {
      "id": "16978458178",
      "name": "Christian Perspectives",
      "section": "Year 6",
      "descriptionHeading": "CP6 6A, 6B",
      "room": "S24",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-09-18T10:51:56.796Z",
      "updateTime": "2019-01-29T05:56:03.036Z",
      "enrollmentCode": "6nm6kw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5Nzg0NTgxNzha",
      "teacherGroupEmail": "CP6_6A_6B_teachers_d5a9cdd2@hope.edu.kh",
      "courseGroupEmail": "CP6_6A_6B_ce54e8be@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpflBma3A5MnVLTUIzN3VHMzJBejRtZjdKNERsTWxqQ1lnbDgxNWItd1k5NGs",
        "title": "CP6 6A, 6B",
        "alternateLink": "https://drive.google.com/drive/folders/0BzV9BTf3s2RpflBma3A5MnVLTUIzN3VHMzJBejRtZjdKNERsTWxqQ1lnbDgxNWItd1k5NGs"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8e9e2160@group.calendar.google.com"
    },
    {
      "id": "16973522459",
      "name": "Y2025 English TP",
      "descriptionHeading": "Year 6 English T. Portela 2018-19",
      "ownerId": "110760563115232207760",
      "creationTime": "2018-09-18T01:24:33.735Z",
      "updateTime": "2019-01-29T04:53:59.219Z",
      "enrollmentCode": "bvo9zl",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5NzM1MjI0NTla",
      "teacherGroupEmail": "Year_6_English_T_Portela_2018_19_teachers_f932721b@hope.edu.kh",
      "courseGroupEmail": "Year_6_English_T_Portela_2018_19_f5f0ea87@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiuflRMU1pnc1NKWFpQejRGeEZQOG5aRU1EY2psWnJveUdvLVF6c2Joa1ZyVmc",
        "title": "Year 6 English T. Portela 2018-19",
        "alternateLink": "https://drive.google.com/drive/folders/0Bz2WH4eYFAiuflRMU1pnc1NKWFpQejRGeEZQOG5aRU1EY2psWnJveUdvLVF6c2Joa1ZyVmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8c8888a1@group.calendar.google.com"
    },
    {
      "id": "16940754915",
      "name": "Y2025 Devotions CK",
      "descriptionHeading": "Devotions Y06 2018-19",
      "ownerId": "105047164691301773564",
      "creationTime": "2018-09-17T13:07:06.145Z",
      "updateTime": "2019-01-08T08:14:39.850Z",
      "enrollmentCode": "qk1m4uz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5NDA3NTQ5MTVa",
      "teacherGroupEmail": "Devotions_Y06_2018_19_teachers_94d329e7@hope.edu.kh",
      "courseGroupEmail": "Devotions_Y06_2018_19_81bf5e70@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfjM4cjdXU0tWOG4tUlEzOFZhd045Y3QyUEFQQ1U1Ny04Q2dKemozRzhyUEU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom25106397@group.calendar.google.com"
    },
    {
      "id": "16934967943",
      "name": "Year 10 Advance Level",
      "section": "P 5;6",
      "descriptionHeading": "Year 10",
      "room": "S 30/31",
      "ownerId": "113890735713045680299",
      "creationTime": "2018-09-17T07:33:59.459Z",
      "updateTime": "2018-09-20T08:19:27.701Z",
      "enrollmentCode": "51jpa6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5MzQ5Njc5NDNa",
      "teacherGroupEmail": "Year_10_teachers_502e323f@hope.edu.kh",
      "courseGroupEmail": "Year_10_d3e02f7d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3tviumg6TpHfjZoaWZ0b1RpeTdZZnJQUGE3TktWQXZsbjBhYllXU09NUndha3NGVGVnMGc",
        "title": "Year 10",
        "alternateLink": "https://drive.google.com/drive/folders/0B3tviumg6TpHfjZoaWZ0b1RpeTdZZnJQUGE3TktWQXZsbjBhYllXU09NUndha3NGVGVnMGc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4aa1ed26@group.calendar.google.com"
    },
    {
      "id": "16934531467",
      "name": "Y2022 Mathematics JK",
      "descriptionHeading": "year 9 mathsJK",
      "ownerId": "115587463545633093027",
      "creationTime": "2018-09-17T06:49:23.991Z",
      "updateTime": "2019-01-11T02:12:19.878Z",
      "enrollmentCode": "7x4l1m",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5MzQ1MzE0Njda",
      "teacherGroupEmail": "year_9_mathsJK_teachers_0076efc9@hope.edu.kh",
      "courseGroupEmail": "year_9_mathsJK_bba03110@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJfk1pYUp2MWFmeUdIQ1VXcU1KMzJ3bVBmSUxRdFplTnRYNHFONW00RWRZQm8",
        "title": "year 9 mathsJK",
        "alternateLink": "https://drive.google.com/drive/folders/0B__ejNZ_YZSJfk1pYUp2MWFmeUdIQ1VXcU1KMzJ3bVBmSUxRdFplTnRYNHFONW00RWRZQm8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0d775ff5@group.calendar.google.com"
    },
    {
      "id": "16930662373",
      "name": "Y2021 Physical Education RK",
      "descriptionHeading": "Year 10 PE",
      "description": "Year 10 PE",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-09-17T02:25:25.033Z",
      "updateTime": "2019-01-31T01:42:34.704Z",
      "enrollmentCode": "kbtbth",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5MzA2NjIzNzNa",
      "teacherGroupEmail": "Year_10_PE_teachers_26cbe84a@hope.edu.kh",
      "courseGroupEmail": "Year_10_PE_71f24290@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_flZuY3BkNU5SS2FUdTR2aENvb1o5bDV6bVZMNFhmRGhIVWVYUmZseTdMWWc",
        "title": "Year 10 PE",
        "alternateLink": "https://drive.google.com/drive/folders/0B7KUeE9gLng_flZuY3BkNU5SS2FUdTR2aENvb1o5bDV6bVZMNFhmRGhIVWVYUmZseTdMWWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom17663ba5@group.calendar.google.com"
    },
    {
      "id": "16930305466",
      "name": "Y2024 Physical Education RK NK",
      "descriptionHeading": "Year 7 PE",
      "description": "Year 7 PE",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-09-17T02:19:05.544Z",
      "updateTime": "2019-01-31T01:40:30.989Z",
      "enrollmentCode": "lyo5r3a",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5MzAzMDU0NjZa",
      "teacherGroupEmail": "Year_7_PE_teachers_3f2c775f@hope.edu.kh",
      "courseGroupEmail": "Year_7_PE_81b5e83b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_fjFkUEdtMnNWRlY5MHJabWFJYXFGWjVGMzMtODFBR2lGTzVXajZhSnA1blE",
        "title": "Year 7 PE",
        "alternateLink": "https://drive.google.com/drive/folders/0B7KUeE9gLng_fjFkUEdtMnNWRlY5MHJabWFJYXFGWjVGMzMtODFBR2lGTzVXajZhSnA1blE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6a64a4c7@group.calendar.google.com"
    },
    {
      "id": "16930929664",
      "name": "Y2022 Physical Education RK",
      "descriptionHeading": "Year 9 PE",
      "description": "Year 9 PE",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-09-17T02:05:35.711Z",
      "updateTime": "2019-01-31T01:41:40.127Z",
      "enrollmentCode": "2vt52h",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY5MzA5Mjk2NjRa",
      "teacherGroupEmail": "Year_9_PE_teachers_7e1ac24b@hope.edu.kh",
      "courseGroupEmail": "Year_9_PE_f52e1cd8@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_fmdCRnRRTUh5LVBqdjY4dFpKS3gxLTlYYWlDMVU5RjNuVkVPNnkwcFVzUVk",
        "title": "Year 9 PE",
        "alternateLink": "https://drive.google.com/drive/folders/0B7KUeE9gLng_fmdCRnRRTUh5LVBqdjY4dFpKS3gxLTlYYWlDMVU5RjNuVkVPNnkwcFVzUVk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom21028cf4@group.calendar.google.com"
    },
    {
      "id": "16847644968",
      "name": "Worship Team 2018",
      "descriptionHeading": "Worship Team 2018",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-09-13T12:18:32.485Z",
      "updateTime": "2018-09-13T12:18:31.537Z",
      "enrollmentCode": "ba95xvs",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY4NDc2NDQ5Njha",
      "teacherGroupEmail": "Worship_Team_2018_teachers_9db2862d@hope.edu.kh",
      "courseGroupEmail": "Worship_Team_2018_3dbb49aa@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfjhMak1NLXlrYk4wQUUxUjFKRGxQN3lXXzRac1JzazFjVC11bS1WaTdfR1E"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf511136f@group.calendar.google.com"
    },
    {
      "id": "16845373421",
      "name": "Matthieu Google Testing",
      "descriptionHeading": "Matthieu Google Testing",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-09-13T10:18:17.320Z",
      "updateTime": "2018-09-13T10:21:06.071Z",
      "enrollmentCode": "qxvdyl",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY4NDUzNzM0MjFa",
      "teacherGroupEmail": "Matthieu_Google_Testing_teachers_49c1e5cd@hope.edu.kh",
      "courseGroupEmail": "Matthieu_Google_Testing_0c8512fa@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fmE5YTFWaWF3VnV6eGpjUG9MS1lqcl82dENmT0xRUWMxRy13N3F3NlZmSVE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom612e86d0@group.calendar.google.com"
    },
    {
      "id": "16843819779",
      "name": "Y2020 IGCSE Art & Design JV",
      "descriptionHeading": "Y9 IGCSE Art (NEW)",
      "ownerId": "112022231024540234956",
      "creationTime": "2018-09-13T07:07:44.297Z",
      "updateTime": "2019-01-31T15:34:27.712Z",
      "enrollmentCode": "vnku765",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY4NDM4MTk3Nzla",
      "teacherGroupEmail": "Y9_IGCSE_Art_NEW_teachers_b4037568@hope.edu.kh",
      "courseGroupEmail": "Y9_IGCSE_Art_NEW_b0e4369c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fmk0S3h2dS00NFVSczVZMUtWejNyWGdKcURuUnA1X21ic3FySEdwYWg2MkU",
        "title": "Y9 IGCSE Art (NEW)",
        "alternateLink": "https://drive.google.com/drive/folders/0ByTPkAZtJDZ5fmk0S3h2dS00NFVSczVZMUtWejNyWGdKcURuUnA1X21ic3FySEdwYWg2MkU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom667a76da@group.calendar.google.com"
    },
    {
      "id": "16801019129",
      "name": "Y2019 IGCSE Art & Design JV",
      "descriptionHeading": "Y10 IGCSE Art",
      "ownerId": "112022231024540234956",
      "creationTime": "2018-09-12T04:10:35.343Z",
      "updateTime": "2019-01-31T15:34:02.646Z",
      "enrollmentCode": "wrd8ss3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY4MDEwMTkxMjla",
      "teacherGroupEmail": "Y10_IGCSE_Art_teachers_92bdd9c8@hope.edu.kh",
      "courseGroupEmail": "Y10_IGCSE_Art_b5b5c543@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fkVKb1NOanpDS2NYWXV4NWczZldjM1A0b1RYaTBBblNyeEpWYzlfNXR1V3c",
        "title": "Y10 IGCSE Art",
        "alternateLink": "https://drive.google.com/drive/folders/0ByTPkAZtJDZ5fkVKb1NOanpDS2NYWXV4NWczZldjM1A0b1RYaTBBblNyeEpWYzlfNXR1V3c"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombe0e15fe@group.calendar.google.com"
    },
    {
      "id": "16763470723",
      "name": "Y2023 Mathematics JK",
      "descriptionHeading": "year 8 maths",
      "ownerId": "115587463545633093027",
      "creationTime": "2018-09-11T08:09:09.383Z",
      "updateTime": "2019-01-11T02:11:16.277Z",
      "enrollmentCode": "to3kuyt",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3NjM0NzA3MjNa",
      "teacherGroupEmail": "year_8_maths_teachers_ac9ddec6@hope.edu.kh",
      "courseGroupEmail": "year_8_maths_6fde0a38@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJfkljeTlpbGlIVGxwb2ZibGROSHJZaENrd21RMFNnSl83dFh2TGI3Q09ORms",
        "title": "year 8 maths",
        "alternateLink": "https://drive.google.com/drive/folders/0B__ejNZ_YZSJfkljeTlpbGlIVGxwb2ZibGROSHJZaENrd21RMFNnSl83dFh2TGI3Q09ORms"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom284cae5c@group.calendar.google.com"
    },
    {
      "id": "16763334465",
      "name": "Y2025 Mathematics HG",
      "section": "Middle School",
      "descriptionHeading": "Year 6 Maths (Miss Gage) Middle School",
      "ownerId": "115496394537878274323",
      "creationTime": "2018-09-11T08:08:43.891Z",
      "updateTime": "2019-01-08T08:28:27.583Z",
      "enrollmentCode": "zraekp",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3NjMzMzQ0NjVa",
      "teacherGroupEmail": "Year_6_Maths_Miss_Gage_Middle_School_teachers_80ff9a9f@hope.edu.kh",
      "courseGroupEmail": "Year_6_Maths_Miss_Gage_Middle_School_1e9ebc5f@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3Z2_x68KLtrfkdDZnlpQlU1MHRES2VyQVdnNkdORnByYTROeE5JeDJEWkY4QUhDQzZaTWM",
        "title": "Year 6 Maths (Miss Gage) Middle School",
        "alternateLink": "https://drive.google.com/drive/folders/0B3Z2_x68KLtrfkdDZnlpQlU1MHRES2VyQVdnNkdORnByYTROeE5JeDJEWkY4QUhDQzZaTWM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3a95fd0d@group.calendar.google.com"
    },
    {
      "id": "16763651497",
      "name": "Social Studies",
      "section": "Year 6A",
      "descriptionHeading": "SOSE 6A",
      "room": "24",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-09-11T08:01:57.690Z",
      "updateTime": "2019-01-29T05:55:24.662Z",
      "enrollmentCode": "hz0pac",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3NjM2NTE0OTda",
      "teacherGroupEmail": "SOSE_6A_teachers_53de1fa0@hope.edu.kh",
      "courseGroupEmail": "SOSE_6A_8617461c@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfmd0QXBLWDQ0c0ZCcEZKbXdKZktfMEpMWTFvbXlKMkJWNWJtNXJydmYydFU",
        "title": "SOSE 6A",
        "alternateLink": "https://drive.google.com/drive/folders/0BzV9BTf3s2Rpfmd0QXBLWDQ0c0ZCcEZKbXdKZktfMEpMWTFvbXlKMkJWNWJtNXJydmYydFU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8c045b2b@group.calendar.google.com"
    },
    {
      "id": "16761906372",
      "name": "Y2024 Mathematics HG",
      "section": "Middle School",
      "descriptionHeading": "Year 7 Maths Class (Miss Gage) Middle School",
      "ownerId": "115496394537878274323",
      "creationTime": "2018-09-11T04:34:04.625Z",
      "updateTime": "2019-01-08T08:23:08.096Z",
      "enrollmentCode": "zerb3gu",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3NjE5MDYzNzJa",
      "teacherGroupEmail": "Year_7_Maths_Class_Miss_Gage_Middle_School_teachers_47c4bb1f@hope.edu.kh",
      "courseGroupEmail": "Year_7_Maths_Class_Miss_Gage_Middle_School_88326b20@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3Z2_x68KLtrfnN5cUp5bzF0MWx4UnU2Qm82NDVYRVhyeVN2aWtVSndONFF2SXZkeDZJeDA",
        "title": "Year 7 Maths Class (Miss Gage) Middle School",
        "alternateLink": "https://drive.google.com/drive/folders/0B3Z2_x68KLtrfnN5cUp5bzF0MWx4UnU2Qm82NDVYRVhyeVN2aWtVSndONFF2SXZkeDZJeDA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom90b7fec8@group.calendar.google.com"
    },
    {
      "id": "16722417152",
      "name": "Tom's French class",
      "descriptionHeading": "Tom's French class",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-09-10T10:22:17.997Z",
      "updateTime": "2018-09-10T10:23:18.687Z",
      "enrollmentCode": "rd6tt",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3MjI0MTcxNTJa",
      "teacherGroupEmail": "Tom_s_French_class_teachers_6b5f8dab@hope.edu.kh",
      "courseGroupEmail": "Tom_s_French_class_9df63768@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fmhpU1RKWFhvTTI4d18tTEJ0VTItVzZRVGp0aFV3amxFTm1zQ0UteXpGX2c"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf4ef202c@group.calendar.google.com"
    },
    {
      "id": "16722178533",
      "name": "Jadon's French class",
      "descriptionHeading": "Jadon's French class",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-09-10T10:03:05.759Z",
      "updateTime": "2018-09-10T10:19:39.659Z",
      "enrollmentCode": "uly07s3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3MjIxNzg1MzNa",
      "teacherGroupEmail": "Jadon_s_French_class_teachers_ef7f1a59@hope.edu.kh",
      "courseGroupEmail": "Jadon_s_French_class_81e231eb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3flhVVkRTSUZxSTJZcUhCN2w2eFRhQlhjMUNSQUI4blZtTVdnMThDWGxtMmM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2b87cd1a@group.calendar.google.com"
    },
    {
      "id": "16713502864",
      "name": "Y2022 IGCSE Business Studies JA",
      "descriptionHeading": "IGCSE Business Studies",
      "ownerId": "102003547718393718946",
      "creationTime": "2018-09-09T22:03:52.730Z",
      "updateTime": "2019-01-29T03:16:01.480Z",
      "enrollmentCode": "nyo7m5v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3MTM1MDI4NjRa",
      "teacherGroupEmail": "IGCSE_Business_Studies_teachers_ae7042fc@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Business_Studies_a39f0006@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfkpmemxpTkI5RGpuSzQ0OXFremR4dXlPcTgzVGM0bTNGLUJHNEtwRlZUWlU",
        "title": "IGCSE Business Studies",
        "alternateLink": "https://drive.google.com/drive/folders/0B6KfBVM7lPEbfkpmemxpTkI5RGpuSzQ0OXFremR4dXlPcTgzVGM0bTNGLUJHNEtwRlZUWlU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom24d4b290@group.calendar.google.com"
    },
    {
      "id": "16701369299",
      "name": "Y2023 Mathematics HG",
      "section": "Middle School",
      "descriptionHeading": "Year 8 Maths Class  (Miss Gage) Middle School",
      "ownerId": "115496394537878274323",
      "creationTime": "2018-09-08T04:40:17.986Z",
      "updateTime": "2019-01-08T08:22:20.155Z",
      "enrollmentCode": "t4gciu0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY3MDEzNjkyOTla",
      "teacherGroupEmail": "Year_8_Maths_Class_Miss_Gage_Middle_School_teachers_605a1dd3@hope.edu.kh",
      "courseGroupEmail": "Year_8_Maths_Class_Miss_Gage_Middle_School_59b9e9fe@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3Z2_x68KLtrfjdxMUJWaUxUYXJ0ci1JQzR1RkV2ajJ0OWwyb0ltdjNRWHFwMGhzWEFWSDA",
        "title": "Year 8 Maths Class  (Miss Gage) Middle School",
        "alternateLink": "https://drive.google.com/drive/folders/0B3Z2_x68KLtrfjdxMUJWaUxUYXJ0ci1JQzR1RkV2ajJ0OWwyb0ltdjNRWHFwMGhzWEFWSDA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd6de4d00@group.calendar.google.com"
    },
    {
      "id": "16664191347",
      "name": "Y2023 Physical Education RK",
      "descriptionHeading": "Year 8 PE",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-09-07T04:40:26.102Z",
      "updateTime": "2019-01-31T01:41:10.041Z",
      "enrollmentCode": "io09s3s",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY2NjQxOTEzNDda",
      "teacherGroupEmail": "Year_8_PE_teachers_5449c88a@hope.edu.kh",
      "courseGroupEmail": "Year_8_PE_65ad92b1@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_fkwxX1MyTFJ4bnhSaEpvdGNkTGxvTmU0ZF85blBBMlhDTHYwa1ppenhVLWc",
        "title": "Year 8 PE",
        "alternateLink": "https://drive.google.com/drive/folders/0B7KUeE9gLng_fkwxX1MyTFJ4bnhSaEpvdGNkTGxvTmU0ZF85blBBMlhDTHYwa1ppenhVLWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome327e5f9@group.calendar.google.com"
    },
    {
      "id": "16590168245",
      "name": "Model United Nations",
      "section": "Extra Curricular",
      "descriptionHeading": "Model United Nations Extra Curricular",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-09-05T15:20:32.311Z",
      "updateTime": "2018-09-05T15:29:07.231Z",
      "enrollmentCode": "o9emmm",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1OTAxNjgyNDVa",
      "teacherGroupEmail": "Model_United_Nations_Extra_Curricular_teachers_a7186097@hope.edu.kh",
      "courseGroupEmail": "Model_United_Nations_Extra_Curricular_745bbd05@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJfnhUWFp5TWNfV2c0R1M0R2IzTkZlUUltU05zbU5HMHBoNjVmWVZtNnVQQm8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd5f6d89a@group.calendar.google.com"
    },
    {
      "id": "16578401905",
      "name": "EE 2017-2019 Joosung Park",
      "section": "IB",
      "descriptionHeading": "EE 2017-2019 Joosung Park IB",
      "ownerId": "110575928947711158789",
      "creationTime": "2018-09-05T08:05:08.794Z",
      "updateTime": "2018-09-05T08:05:07.974Z",
      "enrollmentCode": "rdsf2p",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1Nzg0MDE5MDVa",
      "teacherGroupEmail": "EE_2017_2019_Joosung_Park_IB_teachers_45a71563@hope.edu.kh",
      "courseGroupEmail": "EE_2017_2019_Joosung_Park_IB_0be8f61d@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzflFGeTZ1LWNfZi02SDZEZUVBZkNPVW9hUGhRdV84dVFQbVFlZWVfQzYwdW8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6d92f247@group.calendar.google.com"
    },
    {
      "id": "16574424044",
      "name": "Year 3 2018",
      "section": "Primary",
      "descriptionHeading": "Year 3 2018 Primary",
      "ownerId": "113960745032722324317",
      "creationTime": "2018-09-05T02:56:09.665Z",
      "updateTime": "2018-09-05T02:56:08.869Z",
      "enrollmentCode": "g0lzjww",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1NzQ0MjQwNDRa",
      "teacherGroupEmail": "Year_3_2018_Primary_teachers_996b80a5@hope.edu.kh",
      "courseGroupEmail": "Year_3_2018_Primary_249a9003@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8zo4-L8tHGDfkJPY3ltM2lDQ0EyVGhBVTNCRGJTU2Y4b1VvZEFsZ2VfLUlCRWJQTG1HYVk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd06fc643@group.calendar.google.com"
    },
    {
      "id": "16573263705",
      "name": "SR78 ICT",
      "descriptionHeading": "SR78",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-09-05T01:41:54.553Z",
      "updateTime": "2018-09-05T01:42:42.097Z",
      "enrollmentCode": "kqawjf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1NzMyNjM3MDVa",
      "teacherGroupEmail": "SR78_teachers_e57faa47@hope.edu.kh",
      "courseGroupEmail": "SR78_dc7cf71b@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnQ4LVgwaEtjM3JWOF94bmhGMlBEX0RtR0JJNmNSMmdNaTNmQXVRc04ycUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom51412027@group.calendar.google.com"
    },
    {
      "id": "16532873117",
      "name": "Y2022 IGCSE Additional Mathematics HG",
      "descriptionHeading": "Year 9 Additional Maths class",
      "ownerId": "115496394537878274323",
      "creationTime": "2018-09-04T07:59:11.297Z",
      "updateTime": "2019-01-29T01:44:18.594Z",
      "enrollmentCode": "c6g3yq",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1MzI4NzMxMTda",
      "teacherGroupEmail": "Year_9_Additional_Maths_class_teachers_d373d521@hope.edu.kh",
      "courseGroupEmail": "Year_9_Additional_Maths_class_da18a4ba@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3Z2_x68KLtrfkVwLWQ3Z0lFcmRxbGdCLXQxbGY0VThkTVpCTDFSZDRrMHpSelMxMEw0MXM",
        "title": "Year 9 Additional Maths class",
        "alternateLink": "https://drive.google.com/drive/folders/0B3Z2_x68KLtrfkVwLWQ3Z0lFcmRxbGdCLXQxbGY0VThkTVpCTDFSZDRrMHpSelMxMEw0MXM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom1a1f0d60@group.calendar.google.com"
    },
    {
      "id": "16516164652",
      "name": "Y2023 ELL JA",
      "section": "Y8 ELL",
      "descriptionHeading": "Y8 ELL Y8 ELL",
      "ownerId": "102003547718393718946",
      "creationTime": "2018-09-03T12:21:53.431Z",
      "updateTime": "2019-01-29T03:16:29.026Z",
      "enrollmentCode": "5cst3fc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1MTYxNjQ2NTJa",
      "teacherGroupEmail": "Y8_ELL_Y8_ELL_teachers_1db60ca8@hope.edu.kh",
      "courseGroupEmail": "Y8_ELL_Y8_ELL_3b6ffa81@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfk54RURMa25TazJja1k2YXM4ZEpreXpiblZEd21JVXB2Y2dsT29qeTQ2a1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma6b05372@group.calendar.google.com"
    },
    {
      "id": "16513839274",
      "name": "SR56 ICT",
      "descriptionHeading": "Year 5,6 ICT",
      "ownerId": "106105345643542180841",
      "creationTime": "2018-09-03T03:07:02.104Z",
      "updateTime": "2018-09-05T01:43:53.196Z",
      "enrollmentCode": "6oqre85",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY1MTM4MzkyNzRa",
      "teacherGroupEmail": "Year_5_6_ICT_teachers_06726dbe@hope.edu.kh",
      "courseGroupEmail": "Year_5_6_ICT_43a1f2ee@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4Ay4SpSmoQlfjktMXEwQnV3OFFZNUJuWm5meVV6bll1YVhSMkNmZ2JCX1J1eThLMFluSTQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf28c1bab@group.calendar.google.com"
    },
    {
      "id": "16445822839",
      "name": "TEST CLASSROOM 101",
      "section": "Period 1",
      "descriptionHeading": "TEST CLASSROOM 101 Period 1",
      "ownerId": "112981667321270804129",
      "creationTime": "2018-08-31T07:05:51.229Z",
      "updateTime": "2018-08-31T07:05:50.304Z",
      "enrollmentCode": "rko09ou",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTY0NDU4MjI4Mzla",
      "teacherGroupEmail": "TEST_CLASSROOM_101_Period_1_teachers_03d095a0@hope.edu.kh",
      "courseGroupEmail": "TEST_CLASSROOM_101_Period_1_dd81a64f@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6CfEUqoQMi1fjEtb1lUdjVrNkpXS0ZkWEx3d204NVlkTGl4MTVpaWlGNFV3TEdjOVR4VEU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc710e928@group.calendar.google.com"
    },
    {
      "id": "16348540779",
      "name": "Y2024 English 7A  ML",
      "descriptionHeading": "2018 English 7A",
      "ownerId": "115973731579234221936",
      "creationTime": "2018-08-29T00:43:03.555Z",
      "updateTime": "2019-01-18T06:33:20.919Z",
      "enrollmentCode": "7pharo",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYzNDg1NDA3Nzla",
      "teacherGroupEmail": "2018_English_7A_teachers_b8b2df17@hope.edu.kh",
      "courseGroupEmail": "2018_English_7A_711cd4cf@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHfkdDQkpkSXExWjlCSnRfcTAwbG1oMXptOHlnZ05QYTl4emJJeTk5Y3N1Vlk",
        "title": "2018 English 7A",
        "alternateLink": "https://drive.google.com/drive/folders/0B6UbBTr6rakHfkdDQkpkSXExWjlCSnRfcTAwbG1oMXptOHlnZ05QYTl4emJJeTk5Y3N1Vlk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomecdd1f16@group.calendar.google.com"
    },
    {
      "id": "15341135197",
      "name": "Y2023 Geography JL",
      "descriptionHeading": "2018 Geography Y8",
      "ownerId": "115976931584272436878",
      "creationTime": "2018-08-28T12:55:14.809Z",
      "updateTime": "2019-01-08T08:16:10.431Z",
      "enrollmentCode": "d8jzmp",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzNDExMzUxOTda",
      "teacherGroupEmail": "2018_Geography_Y8_teachers_63d0656e@hope.edu.kh",
      "courseGroupEmail": "2018_Geography_Y8_628909ad@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHfkl4SHl0Q25SdjVBUlJyTFhrTDhyN1BrNWQ5eHZ1WWpOdWcxZlZ2NUpJYUk",
        "title": "2018 Geography Y8",
        "alternateLink": "https://drive.google.com/drive/folders/0B6UbBTr6rakHfkl4SHl0Q25SdjVBUlJyTFhrTDhyN1BrNWQ5eHZ1WWpOdWcxZlZ2NUpJYUk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom600c8080@group.calendar.google.com"
    },
    {
      "id": "15338204790",
      "name": "Y2025 ELL JA",
      "descriptionHeading": "Y6 ELL",
      "ownerId": "102003547718393718946",
      "creationTime": "2018-08-28T05:04:49.664Z",
      "updateTime": "2019-01-29T03:16:45.335Z",
      "enrollmentCode": "duhk6vf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzMzgyMDQ3OTBa",
      "teacherGroupEmail": "Y6_ELL_teachers_0d29742c@hope.edu.kh",
      "courseGroupEmail": "Y6_ELL_f9123b82@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbflhwQ2cwNXVMb3lBZVpWRS1BR18xMXQyMjVxMzVOQkJvTUlFTjNSSG04OXc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom173f669d@group.calendar.google.com"
    },
    {
      "id": "15335492698",
      "name": "Y2023 Language: Korean SM",
      "section": "Language",
      "descriptionHeading": "Y8 2018-2019 Language",
      "room": "S28",
      "ownerId": "110575928947711158789",
      "creationTime": "2018-08-28T01:19:07.909Z",
      "updateTime": "2019-01-31T07:10:36.315Z",
      "enrollmentCode": "vniod09",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzMzU0OTI2OTha",
      "teacherGroupEmail": "Y8_2018_2019_Language_teachers_40e8aca7@hope.edu.kh",
      "courseGroupEmail": "Y8_2018_2019_Language_76637a85@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfnZ1QzhZN3hmSVFDSW5VbHNfT0pUU0Fva0xyVVhpYW5uZlo4YVZXX011VUk",
        "title": "Y8 2018-2019 Language",
        "alternateLink": "https://drive.google.com/drive/folders/0BzBsM2bdtMnzfnZ1QzhZN3hmSVFDSW5VbHNfT0pUU0Fva0xyVVhpYW5uZlo4YVZXX011VUk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1fb19d1f@group.calendar.google.com"
    },
    {
      "id": "15316936498",
      "name": "Science Year 6/7 Starting August 2018",
      "descriptionHeading": "Science Year 6/7 Starting August 2018",
      "ownerId": "108951450081736118120",
      "creationTime": "2018-08-27T16:22:16.712Z",
      "updateTime": "2018-08-27T16:22:15.885Z",
      "enrollmentCode": "vnznuf5",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzMTY5MzY0OTha",
      "teacherGroupEmail": "Science_Year_6_7_Starting_August_2018_teachers_7bac69ba@hope.edu.kh",
      "courseGroupEmail": "Science_Year_6_7_Starting_August_2018_18d89185@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfkR4NkxHQWlURFJuUWpCaWpERzdQX0RKbDlQWEZGOGZzYkJxd2ptb2Y1eTQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom61ef56fb@group.calendar.google.com"
    },
    {
      "id": "15305826493",
      "name": "Beauty and the Beast COSTUME TEAM",
      "descriptionHeading": "Beauty and the Beast COSTUME TEAM",
      "ownerId": "110627498288637945705",
      "creationTime": "2018-08-27T12:12:14.512Z",
      "updateTime": "2018-11-26T04:34:14.675Z",
      "enrollmentCode": "jxkcjfj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTUzMDU4MjY0OTNa",
      "teacherGroupEmail": "Beauty_and_the_Beast_COSTUME_TEAM_teachers_9b60fc6d@hope.edu.kh",
      "courseGroupEmail": "Beauty_and_the_Beast_COSTUME_TEAM_9f340e48@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfmxPZ0VjWUpTZFlKUEp2azJJQUhpOFcxN05ETnBqSlFHbmluaVp2ME5qXzA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9d260eda@group.calendar.google.com"
    },
    {
      "id": "15305389228",
      "name": "Y2021 English Literature MPr",
      "descriptionHeading": "ENGLISH LITERATURE Year 10",
      "ownerId": "110627498288637945705",
      "creationTime": "2018-08-27T11:37:51.073Z",
      "updateTime": "2019-01-08T08:14:51.186Z",
      "enrollmentCode": "2mjmwa",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzMDUzODkyMjha",
      "teacherGroupEmail": "ENGLISH_LITERATURE_Year_10_teachers_440f2152@hope.edu.kh",
      "courseGroupEmail": "ENGLISH_LITERATURE_Year_10_8219defb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfi1MUkhWU0pkWVp0WVdvbUFyd1UxVkltRlVMeUV0UHdrZFNUV0FwWVpMNUU",
        "title": "ENGLISH LITERATURE Year 10",
        "alternateLink": "https://drive.google.com/drive/folders/0B0UdooaZgUJrfi1MUkhWU0pkWVp0WVdvbUFyd1UxVkltRlVMeUV0UHdrZFNUV0FwWVpMNUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom286b5f82@group.calendar.google.com"
    },
    {
      "id": "15305404384",
      "name": "Y2022 English Literature MPr",
      "descriptionHeading": "ENGLISH LITERATURE Year 9",
      "ownerId": "110627498288637945705",
      "creationTime": "2018-08-27T11:35:01.272Z",
      "updateTime": "2019-01-08T08:13:25.965Z",
      "enrollmentCode": "770n5u",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzMDU0MDQzODRa",
      "teacherGroupEmail": "ENGLISH_LITERATURE_Year_9_teachers_36f33310@hope.edu.kh",
      "courseGroupEmail": "ENGLISH_LITERATURE_Year_9_3a260e11@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfjRORFd6LURUeVozRkpjMS1YcG1WU2NaSWNVckZkSnViMjhlbjA2WndVRFU",
        "title": "ENGLISH LITERATURE Year 9",
        "alternateLink": "https://drive.google.com/drive/folders/0B0UdooaZgUJrfjRORFd6LURUeVozRkpjMS1YcG1WU2NaSWNVckZkSnViMjhlbjA2WndVRFU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom13a0ec79@group.calendar.google.com"
    },
    {
      "id": "15259800327",
      "name": "Y2024 Social Studies RD",
      "descriptionHeading": "Year 7 Social Studies",
      "ownerId": "103551314133091140944",
      "creationTime": "2018-08-24T04:26:27.347Z",
      "updateTime": "2019-01-29T04:25:41.803Z",
      "enrollmentCode": "vgokpd0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyNTk4MDAzMjda",
      "teacherGroupEmail": "Year_7_Social_Studies_teachers_507d3e56@hope.edu.kh",
      "courseGroupEmail": "Year_7_Social_Studies_db8d9663@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefnBhU21RanFjQWQyS040cDZzdGg3cDVfUHZmRFJQQmVaMlRPNUtpbDRXZE0",
        "title": "Year 7 Social Studies",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefnBhU21RanFjQWQyS040cDZzdGg3cDVfUHZmRFJQQmVaMlRPNUtpbDRXZE0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6d3047ae@group.calendar.google.com"
    },
    {
      "id": "15235609043",
      "name": "Y2020 IB Korean SL SM",
      "section": "IB",
      "descriptionHeading": "Y11 2018-2020 IB IB",
      "ownerId": "110575928947711158789",
      "creationTime": "2018-08-23T13:52:27.793Z",
      "updateTime": "2019-01-31T07:07:04.508Z",
      "enrollmentCode": "t5u0bl",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMzU2MDkwNDNa",
      "teacherGroupEmail": "Y11_2018_2020_IB_IB_teachers_9a7327d5@hope.edu.kh",
      "courseGroupEmail": "Y11_2018_2020_IB_IB_7311ee82@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfnJpcFMteXlreDlaZnAwT1BXS2FWQVNyREF1Nm9iZFNyZDF3Rk1EbGF4WU0",
        "title": "Y11 2018-2020 IB IB",
        "alternateLink": "https://drive.google.com/drive/folders/0BzBsM2bdtMnzfnJpcFMteXlreDlaZnAwT1BXS2FWQVNyREF1Nm9iZFNyZDF3Rk1EbGF4WU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom449e3dcb@group.calendar.google.com"
    },
    {
      "id": "15229916992",
      "name": "Y2024 Social Studies JL",
      "descriptionHeading": "2018 SOSE Y7",
      "ownerId": "115976931584272436878",
      "creationTime": "2018-08-23T09:52:13.065Z",
      "updateTime": "2019-01-08T08:17:21.708Z",
      "enrollmentCode": "zv8abdl",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjk5MTY5OTJa",
      "teacherGroupEmail": "2018_SOSE_Y7_teachers_4c276f19@hope.edu.kh",
      "courseGroupEmail": "2018_SOSE_Y7_d5a8986f@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHflMzR2UxRWROaHFqaFhYc0M5ZGJlZ3lETUN5UGsxcjhxWnJTZ01RWkd5d3c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfcf85964@group.calendar.google.com"
    },
    {
      "id": "15230506102",
      "name": "Pastoral",
      "section": "Year 7",
      "descriptionHeading": "Pastoral Class Year 7",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-08-23T08:31:51.106Z",
      "updateTime": "2019-01-29T05:57:43.430Z",
      "enrollmentCode": "izhaji",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMzA1MDYxMDJa",
      "teacherGroupEmail": "Pastoral_Class_Year_7_teachers_9b214185@hope.edu.kh",
      "courseGroupEmail": "Pastoral_Class_Year_7_68c59c93@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfkxKbXFJX3RvdkhnT0lKTjJibGJqcmd3UnlVX3ozZWhNNjVxQWVTWjZWcms"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6eac2f38@group.calendar.google.com"
    },
    {
      "id": "15230210216",
      "name": "Theory of Knowledge 2020",
      "section": "Year 11",
      "descriptionHeading": "TOK (2018-19) Year 11",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-08-23T08:13:03.013Z",
      "updateTime": "2019-01-16T01:21:34.095Z",
      "enrollmentCode": "nwxdw3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMzAyMTAyMTZa",
      "teacherGroupEmail": "TOK_2018_19_Year_11_teachers_726cca2a@hope.edu.kh",
      "courseGroupEmail": "TOK_2018_19_Year_11_1186626f@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfl9QN1lJclZ5NU9tZGRHLTJQTFZFeGdTX25mcmhyQ2pIYXF3RTJuWGlJOTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomae05f5e6@group.calendar.google.com"
    },
    {
      "id": "15229074694",
      "name": "Vision Into Action",
      "section": "Year 9, Year 10",
      "descriptionHeading": "VIA 2018-19 Vision Into Action",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-08-23T04:07:46.760Z",
      "updateTime": "2019-01-29T05:57:08.535Z",
      "enrollmentCode": "4delv3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjkwNzQ2OTRa",
      "teacherGroupEmail": "VIA_2018_19_Vision_Into_Action_teachers_d5252cdf@hope.edu.kh",
      "courseGroupEmail": "VIA_2018_19_Vision_Into_Action_62a4ee7f@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfnY2bGkwbGlpLXdmVDF2VWFuTmZzdUtOLXZpdUdWMG1xNjdxOEM1M3VfSjA",
        "title": "VIA 2018-19 Vision Into Action",
        "alternateLink": "https://drive.google.com/drive/folders/0BzV9BTf3s2RpfnY2bGkwbGlpLXdmVDF2VWFuTmZzdUtOLXZpdUdWMG1xNjdxOEM1M3VfSjA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfbd0a6da@group.calendar.google.com"
    },
    {
      "id": "15229242606",
      "name": "Y2022 IGCSE Chemistry ME",
      "descriptionHeading": "Chemistry IGCSE 2018 - 2020",
      "ownerId": "113917612521896405543",
      "creationTime": "2018-08-23T03:50:47.428Z",
      "updateTime": "2019-01-20T09:32:16.349Z",
      "enrollmentCode": "aml80x0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjkyNDI2MDZa",
      "teacherGroupEmail": "Chemistry_IGCSE_2018_2020_teachers_e41a6288@hope.edu.kh",
      "courseGroupEmail": "Chemistry_IGCSE_2018_2020_9176c86d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fnNaa2ZZaU1nZWFlQkNwU0lsY1d6S3dGMF9aS1c0eVhZekdWcTB2QkhjSzg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7d5df02c@group.calendar.google.com"
    },
    {
      "id": "15228472380",
      "name": "Y2020 IB Chemistry SL ME",
      "descriptionHeading": "Chemistry IB 2018 - 2020",
      "ownerId": "113917612521896405543",
      "creationTime": "2018-08-23T03:49:20.026Z",
      "updateTime": "2019-01-20T09:33:37.227Z",
      "enrollmentCode": "10ggpx",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjg0NzIzODBa",
      "teacherGroupEmail": "Chemistry_IB_2018_2020_teachers_13f1c121@hope.edu.kh",
      "courseGroupEmail": "Chemistry_IB_2018_2020_7f703269@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fkg0dFlqNDBPRWV1Wmx3VFB2SFM3RHNZNG9oeDZzQWsyeHlWS1ZTSWZvUmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom330da507@group.calendar.google.com"
    },
    {
      "id": "15229161916",
      "name": "Y2021 IGCSE ENGLISH LITERATURE JDS",
      "section": "10",
      "descriptionHeading": "English Literature 10",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-08-23T03:15:05.788Z",
      "updateTime": "2019-01-08T08:19:57.517Z",
      "enrollmentCode": "ld528k",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjkxNjE5MTZa",
      "teacherGroupEmail": "English_Literature_10_teachers_144952dd@hope.edu.kh",
      "courseGroupEmail": "English_Literature_10_7cbc5c7a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJfm5jalFaeEhzejk2Tnp5RjRIdkRmZnhUZmsxa3VvOHplWnl5djFVLUZiZnc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf7928057@group.calendar.google.com"
    },
    {
      "id": "15226774822",
      "name": "Y2021/22 IGCSE PE RK",
      "section": "Year 9 and 10",
      "descriptionHeading": "IGCSE PE Year 9 and 10",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-08-23T01:37:39.191Z",
      "updateTime": "2019-01-31T14:28:45.206Z",
      "enrollmentCode": "es46ie4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjY3NzQ4MjJa",
      "teacherGroupEmail": "IGCSE_PE_Year_9_and_10_teachers_f031c168@hope.edu.kh",
      "courseGroupEmail": "IGCSE_PE_Year_9_and_10_28cd2401@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_fmQwSXdpV2pUbWhUaVpwZFBnclZEM0tkdFM4MThIOU5NS3RYaFMzRmRGTjA",
        "title": "IGCSE PE Year 9 and 10",
        "alternateLink": "https://drive.google.com/drive/folders/0B7KUeE9gLng_fmQwSXdpV2pUbWhUaVpwZFBnclZEM0tkdFM4MThIOU5NS3RYaFMzRmRGTjA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom90f5c5b0@group.calendar.google.com"
    },
    {
      "id": "15226919974",
      "name": "Y2020 IB Sports, Exercise and Health Science SL RK",
      "descriptionHeading": "SEHS 2018 - 2020",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-08-23T01:28:59.840Z",
      "updateTime": "2019-01-31T01:43:58.254Z",
      "enrollmentCode": "ckogfu3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMjY5MTk5NzRa",
      "teacherGroupEmail": "SEHS_2018_2020_teachers_2c1f5ea1@hope.edu.kh",
      "courseGroupEmail": "SEHS_2018_2020_fd500cf2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_fnR2Y2FHaVFZQVB0YmxvT0F6WHVUVWJCaFNyN0g5a09xSk5ZQko1ZTlUNEU",
        "title": "SEHS 2018 - 2020",
        "alternateLink": "https://drive.google.com/drive/folders/0B7KUeE9gLng_fnR2Y2FHaVFZQVB0YmxvT0F6WHVUVWJCaFNyN0g5a09xSk5ZQko1ZTlUNEU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom56235978@group.calendar.google.com"
    },
    {
      "id": "15201107729",
      "name": "Y2020 IB French SL IP",
      "descriptionHeading": "BI français B année 11",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-08-22T09:18:24.861Z",
      "updateTime": "2019-01-08T08:20:05.947Z",
      "enrollmentCode": "aoihyo6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMDExMDc3Mjla",
      "teacherGroupEmail": "BI_fran_ais_B_ann_e_11_teachers_334a3b8e@hope.edu.kh",
      "courseGroupEmail": "BI_fran_ais_B_ann_e_11_ccf21649@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3flh2djlLaUdNa3ZiQXFQZDZ3VWZ6akZabGd3RC1rQlVxSG92cjc0QzcxLWc",
        "title": "BI français B année 11",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3flh2djlLaUdNa3ZiQXFQZDZ3VWZ6akZabGd3RC1rQlVxSG92cjc0QzcxLWc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomad824acf@group.calendar.google.com"
    },
    {
      "id": "15200734090",
      "name": "Y2022 IGCSE Korean SM",
      "section": "IGCSE",
      "descriptionHeading": "Y9 2018-2020 IGCSE IGCSE",
      "ownerId": "110575928947711158789",
      "creationTime": "2018-08-22T07:51:56.314Z",
      "updateTime": "2019-01-31T07:09:58.057Z",
      "enrollmentCode": "yo52hf8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUyMDA3MzQwOTBa",
      "teacherGroupEmail": "Y9_2018_2020_IGCSE_IGCSE_teachers_fadd8626@hope.edu.kh",
      "courseGroupEmail": "Y9_2018_2020_IGCSE_IGCSE_f6efaf14@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzflg4ekhzSWtYY2djdTBVeUJqMDVtTDJ2R00zQmZ4U2tHdWJqSl9YSUJ1aVU",
        "title": "Y9 2018-2020 IGCSE IGCSE",
        "alternateLink": "https://drive.google.com/drive/folders/0BzBsM2bdtMnzflg4ekhzSWtYY2djdTBVeUJqMDVtTDJ2R00zQmZ4U2tHdWJqSl9YSUJ1aVU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4fd74165@group.calendar.google.com"
    },
    {
      "id": "15198527849",
      "name": "Y2023 History RD",
      "descriptionHeading": "Year 8 History 2018-2019",
      "ownerId": "103551314133091140944",
      "creationTime": "2018-08-22T04:06:41.601Z",
      "updateTime": "2019-01-29T04:25:24.750Z",
      "enrollmentCode": "edf4mm0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxOTg1Mjc4NDla",
      "teacherGroupEmail": "Year_8_History_2018_2019_teachers_32c79967@hope.edu.kh",
      "courseGroupEmail": "Year_8_History_2018_2019_24773828@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefjVqbTMzYzR6TkEwa2I3T2I1MGZTSko2clRvSWpDWG5YY2ZZLXNfWjF5T1k",
        "title": "Year 8 History 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefjVqbTMzYzR6TkEwa2I3T2I1MGZTSko2clRvSWpDWG5YY2ZZLXNfWjF5T1k"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0e39f278@group.calendar.google.com"
    },
    {
      "id": "15172551647",
      "name": "Year 9 Study Skills",
      "section": "Semester 1 2018",
      "descriptionHeading": "Year 9 Study Skills Semester 1 2018",
      "ownerId": "113798815889845652257",
      "creationTime": "2018-08-21T12:30:53.402Z",
      "updateTime": "2018-08-21T12:30:52.468Z",
      "enrollmentCode": "kxobbi",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNzI1NTE2NDda",
      "teacherGroupEmail": "Year_9_Study_Skills_Semester_1_2018_teachers_a06f385b@hope.edu.kh",
      "courseGroupEmail": "Year_9_Study_Skills_Semester_1_2018_169e69c8@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwCLqTadiNUnfnpydnpXMXdlZ24ydlV6WTl1MmtFUy1KRW1uQWdTYjNSRGdLQWM2REJXbWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom5053dd66@group.calendar.google.com"
    },
    {
      "id": "15171503381",
      "name": "Y2024 French IP",
      "section": "French",
      "descriptionHeading": "Les jaunes Y7 French",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-08-21T07:29:00.071Z",
      "updateTime": "2019-01-08T08:15:26.700Z",
      "enrollmentCode": "nofhcjo",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNzE1MDMzODFa",
      "teacherGroupEmail": "Les_jaunes_Y7_French_teachers_3bd3f3c1@hope.edu.kh",
      "courseGroupEmail": "Les_jaunes_Y7_French_28a35aa7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fjBLOGw2ZW13T1JPQUR5alRrQUxZQmdFUzNpdXNtTFBuT0xGeUdtbTQwVUU",
        "title": "Les jaunes Y7 French",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3fjBLOGw2ZW13T1JPQUR5alRrQUxZQmdFUzNpdXNtTFBuT0xGeUdtbTQwVUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfa4799a0@group.calendar.google.com"
    },
    {
      "id": "15171756951",
      "name": "Y2023 French IP",
      "section": "French",
      "descriptionHeading": "Les blancs Y8 French",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-08-21T07:24:05.392Z",
      "updateTime": "2019-01-08T08:25:03.044Z",
      "enrollmentCode": "4v2355",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNzE3NTY5NTFa",
      "teacherGroupEmail": "Les_blancs_Y8_French_teachers_542bf6b2@hope.edu.kh",
      "courseGroupEmail": "Les_blancs_Y8_French_b65e1b59@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3flJiZHBMdkc2VktRUk40V1JmdzAwSEw0U0VjVUtZY25FQkxFT01Ccno3UUU",
        "title": "Les blancs Y8 French",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3flJiZHBMdkc2VktRUk40V1JmdzAwSEw0U0VjVUtZY25FQkxFT01Ccno3UUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0d5650ed@group.calendar.google.com"
    },
    {
      "id": "15167511069",
      "name": "3/4/5 INT",
      "descriptionHeading": "3/4/5 INT",
      "ownerId": "104005217247852726712",
      "creationTime": "2018-08-21T00:42:21.148Z",
      "updateTime": "2018-08-21T00:42:58.830Z",
      "enrollmentCode": "quuko",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNjc1MTEwNjla",
      "teacherGroupEmail": "3_4_5_INT_teachers_39d6cdab@hope.edu.kh",
      "courseGroupEmail": "3_4_5_INT_e99747e7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_Y_Fmg1zO9LfnVHU2tBcjVmY21HNndOaDFhR3FIZmRvUmI5Yk1XcXVfazZMbjMtUHB0bk0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroombea4b2fe@group.calendar.google.com"
    },
    {
      "id": "15148218944",
      "name": "Science Year 8 Starting August 2018",
      "descriptionHeading": "Grade 8 Science Semester 1 2018",
      "ownerId": "108951450081736118120",
      "creationTime": "2018-08-20T14:41:30.444Z",
      "updateTime": "2018-08-27T15:14:01.032Z",
      "enrollmentCode": "qa7f9q",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDgyMTg5NDRa",
      "teacherGroupEmail": "Grade_8_Science_Semester_1_2018_teachers_12351a64@hope.edu.kh",
      "courseGroupEmail": "Grade_8_Science_Semester_1_2018_ac7fa8a5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfllDa2VUaGZMazVtd1lldmtJVnVwN2JNQm02alRpRlRYTTZaaHEwaUR0X3M"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom779c8173@group.calendar.google.com"
    },
    {
      "id": "15148557771",
      "name": "Y2025 Math JG",
      "descriptionHeading": "Y6 Math 2018-2019",
      "ownerId": "111085591619122677825",
      "creationTime": "2018-08-20T14:27:34.676Z",
      "updateTime": "2019-01-09T03:07:54.459Z",
      "enrollmentCode": "kjczjc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDg1NTc3NzFa",
      "teacherGroupEmail": "Y6_Math_2018_2019_teachers_b35bb037@hope.edu.kh",
      "courseGroupEmail": "Y6_Math_2018_2019_e25439d3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4fETXUlfqmxflJXNFdfLXFFNFRwZEVzSlN4Y3RaN2V1QUxrbVFiSFM1eWN6Y0RKSnVUd28",
        "title": "Y6 Math 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B4fETXUlfqmxflJXNFdfLXFFNFRwZEVzSlN4Y3RaN2V1QUxrbVFiSFM1eWN6Y0RKSnVUd28"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomca8737c3@group.calendar.google.com"
    },
    {
      "id": "15145126080",
      "name": "Y2023 Science CK",
      "descriptionHeading": "Y8 Science",
      "ownerId": "111085591619122677825",
      "creationTime": "2018-08-20T12:45:43.305Z",
      "updateTime": "2019-01-08T08:15:42.713Z",
      "enrollmentCode": "hqjzpdz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDUxMjYwODBa",
      "teacherGroupEmail": "Y8_Science_teachers_dfa36fa1@hope.edu.kh",
      "courseGroupEmail": "Y8_Science_638f23d0@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4fETXUlfqmxfnpMNkgzR1lIMVc0Yng5OXhVMl9uVENxdzJaSG1rZVlyS3lNdGlkOXlqb1U",
        "title": "Y8 Science",
        "alternateLink": "https://drive.google.com/drive/folders/0B4fETXUlfqmxfnpMNkgzR1lIMVc0Yng5OXhVMl9uVENxdzJaSG1rZVlyS3lNdGlkOXlqb1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6dc2f520@group.calendar.google.com"
    },
    {
      "id": "15142009336",
      "name": "Y12 CP 2018-2019 Semester 1",
      "descriptionHeading": "Y12 CP 2018-2019 Semester 1",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-08-20T09:54:07.107Z",
      "updateTime": "2018-09-04T07:56:33.460Z",
      "enrollmentCode": "t355y7",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDIwMDkzMzZa",
      "teacherGroupEmail": "Y12_CP_2018_2019_Semester_1_teachers_8fa4d796@hope.edu.kh",
      "courseGroupEmail": "Y12_CP_2018_2019_Semester_1_53818aac@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkFzVWFyMUtnblRQdkp5NllyZWJ0Zm0wcWNZWW9lOXhySnhaLTlZX21iaU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0285a3b6@group.calendar.google.com"
    },
    {
      "id": "15142467417",
      "name": "Y2020 Geography JL",
      "descriptionHeading": "2018 Geography Y11",
      "ownerId": "115976931584272436878",
      "creationTime": "2018-08-20T07:30:19.704Z",
      "updateTime": "2019-01-08T08:18:33.806Z",
      "enrollmentCode": "oqhsiby",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDI0Njc0MTda",
      "teacherGroupEmail": "2018_Geography_Y11_teachers_d2165999@hope.edu.kh",
      "courseGroupEmail": "2018_Geography_Y11_91fb48de@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHfnBwalNzbEhoZlU3X0lYOHZKN0pSa0lfWmMxdTVKcEg4eHMtQl9jQktaSGs"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom56a08b72@group.calendar.google.com"
    },
    {
      "id": "15143942529",
      "name": "Y11 CP 2018-2019 Semester 1",
      "descriptionHeading": "Y11 CP 2018-2019 Semester 1",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-08-20T07:29:05.947Z",
      "updateTime": "2018-09-04T07:56:17.437Z",
      "enrollmentCode": "krwmqnp",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDM5NDI1Mjla",
      "teacherGroupEmail": "Y11_CP_2018_2019_Semester_1_teachers_a44ce02e@hope.edu.kh",
      "courseGroupEmail": "Y11_CP_2018_2019_Semester_1_cececbf8@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfjlWX3lhVm50Rko2SUFaQmt6N0RRSnhLZ0gtbml1cGN4bEJpeU0zaUN5LUk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomae503d41@group.calendar.google.com"
    },
    {
      "id": "15142972074",
      "name": "Y10 CP 2018-2019 Semester 1",
      "descriptionHeading": "Y10 CP 2018-2019 Semester 1",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-08-20T07:23:51.276Z",
      "updateTime": "2018-09-04T07:56:45.483Z",
      "enrollmentCode": "9go86vy",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDI5NzIwNzRa",
      "teacherGroupEmail": "Y10_CP_2018_2019_Semester_1_teachers_37485a7f@hope.edu.kh",
      "courseGroupEmail": "Y10_CP_2018_2019_Semester_1_115b5069@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkxMWVN0dktRdTVhVlNHWnpvbVdINHpmMFdYT1p6cDNfeHJlYnZPM1dfcHM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc0ae9856@group.calendar.google.com"
    },
    {
      "id": "15143241503",
      "name": "Y9 CP 2018-2019 Semester 1",
      "descriptionHeading": "Y9 CP 2018-2019 Semester 1",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-08-20T07:17:55.736Z",
      "updateTime": "2018-08-20T07:23:04.871Z",
      "enrollmentCode": "ywafgs7",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDMyNDE1MDNa",
      "teacherGroupEmail": "Y9_CP_2018_2019_Semester_1_teachers_2a4211f5@hope.edu.kh",
      "courseGroupEmail": "Y9_CP_2018_2019_Semester_1_b176749c@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXflRoaFpDb2xlbFc3TmJIWU1uWXZaVjlWa0Qxc19TNWl3U0VEa0s3RUxwM0k"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd4e2b9fa@group.calendar.google.com"
    },
    {
      "id": "15142029031",
      "name": "Y6 SOSE 2018-2019 Semester 1",
      "descriptionHeading": "Y6 SOSE 2018-2019 Semester 1",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-08-20T07:01:52.749Z",
      "updateTime": "2018-08-20T07:09:49.350Z",
      "enrollmentCode": "q9g6on",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDIwMjkwMzFa",
      "teacherGroupEmail": "Y6_SOSE_2018_2019_Semester_1_teachers_38dbd28a@hope.edu.kh",
      "courseGroupEmail": "Y6_SOSE_2018_2019_Semester_1_6f9b8a46@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkRmUHB4NnJTYVVFNDVPSkhvSVpjcEs2cUxiLXV2NGVVdmNoTE15MHB3SjQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom22097c9d@group.calendar.google.com"
    },
    {
      "id": "15142052610",
      "name": "Y2019 IB Visual Arts SL/HL JV",
      "descriptionHeading": "Y12 IB Visual Art",
      "ownerId": "112022231024540234956",
      "creationTime": "2018-08-20T04:27:49.844Z",
      "updateTime": "2019-01-31T15:31:23.498Z",
      "enrollmentCode": "fiobllq",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDIwNTI2MTBa",
      "teacherGroupEmail": "Y12_IB_Visual_Art_teachers_bc595ae7@hope.edu.kh",
      "courseGroupEmail": "Y12_IB_Visual_Art_aad29478@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fm83MDUyOTBuek91Nk5uSDRMb1hxNkxxc05MUnUwZUZ6dWEzbExnWDFFbGs",
        "title": "Y12 IB Visual Art",
        "alternateLink": "https://drive.google.com/drive/folders/0ByTPkAZtJDZ5fm83MDUyOTBuek91Nk5uSDRMb1hxNkxxc05MUnUwZUZ6dWEzbExnWDFFbGs"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom81d02681@group.calendar.google.com"
    },
    {
      "id": "15141803136",
      "name": "Y2021 English Language MPr",
      "descriptionHeading": "ENGLISH Year 10",
      "ownerId": "110627498288637945705",
      "creationTime": "2018-08-20T03:51:41.144Z",
      "updateTime": "2019-01-08T08:14:33.114Z",
      "enrollmentCode": "kd4lkuk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDE4MDMxMzZa",
      "teacherGroupEmail": "ENGLISH_Year_10_teachers_135f2737@hope.edu.kh",
      "courseGroupEmail": "ENGLISH_Year_10_de3267dc@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfkxlOHk5WEJPQTJaOTZQR09Xc2VYdi1uTVZDN0ZBM1hvRDR4TUR3a0c0S1U",
        "title": "ENGLISH Year 10",
        "alternateLink": "https://drive.google.com/drive/folders/0B0UdooaZgUJrfkxlOHk5WEJPQTJaOTZQR09Xc2VYdi1uTVZDN0ZBM1hvRDR4TUR3a0c0S1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4f4f131f@group.calendar.google.com"
    },
    {
      "id": "15141499932",
      "name": "Y2022 IGCSE History RD",
      "descriptionHeading": "Year 9 IGCSE History 2018-2019",
      "ownerId": "103551314133091140944",
      "creationTime": "2018-08-20T02:20:31.932Z",
      "updateTime": "2019-01-29T04:23:51.720Z",
      "enrollmentCode": "4uc52ul",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxNDE0OTk5MzJa",
      "teacherGroupEmail": "Year_9_IGCSE_History_2018_2019_teachers_7f722f7f@hope.edu.kh",
      "courseGroupEmail": "Year_9_IGCSE_History_2018_2019_25b7a08c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefjVncGdQaHpxejVBR1pOX3EwSEp1VndJdzc3Yk12WHJNUjEzN05VMVFwTzA",
        "title": "Year 9 IGCSE History 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefjVncGdQaHpxejVBR1pOX3EwSEp1VndJdzc3Yk12WHJNUjEzN05VMVFwTzA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5f5a847c@group.calendar.google.com"
    },
    {
      "id": "15139392752",
      "name": "Y2022 English Language MPr",
      "descriptionHeading": "ENGLISH Year 9",
      "ownerId": "110627498288637945705",
      "creationTime": "2018-08-20T02:06:39.664Z",
      "updateTime": "2019-01-08T08:14:01.184Z",
      "enrollmentCode": "es14ox",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMzkzOTI3NTJa",
      "teacherGroupEmail": "ENGLISH_Year_9_teachers_97a4cbbb@hope.edu.kh",
      "courseGroupEmail": "ENGLISH_Year_9_7b567d4c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfk02eThXRzdDckZqbjItYW4wcHhhcmFieGNOYklkbHluRE5keVVrOC1VZDQ",
        "title": "ENGLISH Year 9",
        "alternateLink": "https://drive.google.com/drive/folders/0B0UdooaZgUJrfk02eThXRzdDckZqbjItYW4wcHhhcmFieGNOYklkbHluRE5keVVrOC1VZDQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom972bd220@group.calendar.google.com"
    },
    {
      "id": "15134651983",
      "name": "Y2020 IB Visual Arts SL/HL JV",
      "descriptionHeading": "Y11 IB Visual Art",
      "ownerId": "112022231024540234956",
      "creationTime": "2018-08-19T08:31:13.307Z",
      "updateTime": "2019-01-31T15:32:42.620Z",
      "enrollmentCode": "ffqf2u",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMzQ2NTE5ODNa",
      "teacherGroupEmail": "Y11_IB_Visual_Art_teachers_e14cb7db@hope.edu.kh",
      "courseGroupEmail": "Y11_IB_Visual_Art_4f28c3b4@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fmRNU3FFOTRhVzF3Y01iNnotZFhYVExfLWkzRzkxdUcwbkJhOGQ3TDlfcnc",
        "title": "Y11 IB Visual Art",
        "alternateLink": "https://drive.google.com/drive/folders/0ByTPkAZtJDZ5fmRNU3FFOTRhVzF3Y01iNnotZFhYVExfLWkzRzkxdUcwbkJhOGQ3TDlfcnc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc2fcd995@group.calendar.google.com"
    },
    {
      "id": "15107143963",
      "name": "Y2020 IB History HL RD",
      "descriptionHeading": "Year 11 IB History 2018-2019",
      "ownerId": "103551314133091140944",
      "creationTime": "2018-08-17T07:27:17.307Z",
      "updateTime": "2019-01-29T04:22:01.603Z",
      "enrollmentCode": "ss7h8xk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMDcxNDM5NjNa",
      "teacherGroupEmail": "Year_11_IB_History_2018_2019_teachers_a2439eb5@hope.edu.kh",
      "courseGroupEmail": "Year_11_IB_History_2018_2019_e73afd0e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefktmanBfLUNWUFVDenVLMkk5V29GTmFVSU9ZTTZGTHhUV2V3dnhDcWR4Zzg",
        "title": "Year 11 IB History 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefktmanBfLUNWUFVDenVLMkk5V29GTmFVSU9ZTTZGTHhUV2V3dnhDcWR4Zzg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2488e3c6@group.calendar.google.com"
    },
    {
      "id": "15109178260",
      "name": "Year 7 Science 2018",
      "descriptionHeading": "Year 7 Science 2018",
      "ownerId": "100362126255417413706",
      "creationTime": "2018-08-17T05:22:55.168Z",
      "updateTime": "2018-08-17T05:22:54.354Z",
      "enrollmentCode": "fmor3o4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMDkxNzgyNjBa",
      "teacherGroupEmail": "Year_7_Science_2018_teachers_edfb5b82@hope.edu.kh",
      "courseGroupEmail": "Year_7_Science_2018_8ef7dbfa@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfjhOS1ZrWmtTT0dLSGgzRmFCa01IR2tsU3FNVXJxN2pDRTE4ZWpmSFhzeEE",
        "title": "Year 7 Science 2018",
        "alternateLink": "https://drive.google.com/drive/folders/0B_c4Ytt8TOwXfjhOS1ZrWmtTT0dLSGgzRmFCa01IR2tsU3FNVXJxN2pDRTE4ZWpmSFhzeEE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3ad95014@group.calendar.google.com"
    },
    {
      "id": "15109196013",
      "name": "IGCSE Science (Biology) 2020",
      "descriptionHeading": "IGCSE Science (Biology) 2020",
      "ownerId": "100362126255417413706",
      "creationTime": "2018-08-17T04:16:25.913Z",
      "updateTime": "2018-08-17T04:30:06.434Z",
      "enrollmentCode": "dw4fvm",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMDkxOTYwMTNa",
      "teacherGroupEmail": "IGCSE_Science_Biology_2020_teachers_68e9f4fd@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Science_Biology_2020_b48ae8b0@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfkFhQkhyMDNSYVF2X2tGam9fdmpMM2cxTmFIWFpXWmN1dk9fcEZLNnNPZ00",
        "title": "IGCSE Science (Biology) 2020",
        "alternateLink": "https://drive.google.com/drive/folders/0B_c4Ytt8TOwXfkFhQkhyMDNSYVF2X2tGam9fdmpMM2cxTmFIWFpXWmN1dk9fcEZLNnNPZ00"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom19b62674@group.calendar.google.com"
    },
    {
      "id": "15109395349",
      "name": "Y2025 Science CK",
      "descriptionHeading": "Y6 Science 2018-19",
      "description": "Year 6A",
      "room": "S6",
      "ownerId": "111085591619122677825",
      "creationTime": "2018-08-17T03:47:01.790Z",
      "updateTime": "2019-01-10T04:46:17.644Z",
      "enrollmentCode": "clq49m8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMDkzOTUzNDla",
      "teacherGroupEmail": "Y6_Science_2018_19_teachers_42253927@hope.edu.kh",
      "courseGroupEmail": "Y6_Science_2018_19_7da91fe1@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4fETXUlfqmxfnhWQnhKdnNkZDg0cU9aRW9aNlNoeGYzVzI1WXVVcHg0YmxuWFVoVEtnekU",
        "title": "Y6 Science 2018-19",
        "alternateLink": "https://drive.google.com/drive/folders/0B4fETXUlfqmxfnhWQnhKdnNkZDg0cU9aRW9aNlNoeGYzVzI1WXVVcHg0YmxuWFVoVEtnekU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5f080a68@group.calendar.google.com"
    },
    {
      "id": "15107568811",
      "name": "Y2022 National History RD",
      "descriptionHeading": "Year 9 National History 2018-2019",
      "ownerId": "103551314133091140944",
      "creationTime": "2018-08-17T01:45:49.709Z",
      "updateTime": "2019-01-29T04:26:06.667Z",
      "enrollmentCode": "hkvbwj",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUxMDc1Njg4MTFa",
      "teacherGroupEmail": "Year_9_National_History_2018_2019_teachers_fae39c4c@hope.edu.kh",
      "courseGroupEmail": "Year_9_National_History_2018_2019_236fd3f5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefm5xZzBwS0tCeXNHa3lEVjBsMHVQNy12QlZPR280cGdpY1hUM2VRWlZNVDg",
        "title": "Year 9 National History 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefm5xZzBwS0tCeXNHa3lEVjBsMHVQNy12QlZPR280cGdpY1hUM2VRWlZNVDg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom56d2578a@group.calendar.google.com"
    },
    {
      "id": "15086899566",
      "name": "IB Biology 2020",
      "descriptionHeading": "IB Biology 2020",
      "ownerId": "100362126255417413706",
      "creationTime": "2018-08-16T10:37:38.231Z",
      "updateTime": "2018-08-18T06:27:14.550Z",
      "enrollmentCode": "km4p1xi",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODY4OTk1NjZa",
      "teacherGroupEmail": "IB_Biology_2020_teachers_aa7a0097@hope.edu.kh",
      "courseGroupEmail": "IB_Biology_2020_9ed6341c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfmZFdS1EM0U1c19NNk5kQTlEa2dER2duWG5HNkZCaGpTbWtWRkFOMjgyQlU",
        "title": "IB Biology 2020",
        "alternateLink": "https://drive.google.com/drive/folders/0B_c4Ytt8TOwXfmZFdS1EM0U1c19NNk5kQTlEa2dER2duWG5HNkZCaGpTbWtWRkFOMjgyQlU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom78a193fb@group.calendar.google.com"
    },
    {
      "id": "15086653757",
      "name": "Y2021 Geography JL",
      "descriptionHeading": "2018 Geography Y10",
      "ownerId": "115976931584272436878",
      "creationTime": "2018-08-16T09:59:26.034Z",
      "updateTime": "2019-01-08T08:18:02.787Z",
      "enrollmentCode": "erjho9f",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODY2NTM3NTda",
      "teacherGroupEmail": "2018_Geography_Y10_teachers_56f57ab5@hope.edu.kh",
      "courseGroupEmail": "2018_Geography_Y10_3be4d832@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHflA2UW83T2FRUHdROHlndDd3QzNSVWRKenBxOTEwR0pLNDdzU19pTWpyRm8",
        "title": "2018 Geography Y10",
        "alternateLink": "https://drive.google.com/drive/folders/0B6UbBTr6rakHflA2UW83T2FRUHdROHlndDd3QzNSVWRKenBxOTEwR0pLNDdzU19pTWpyRm8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom19f7d7ae@group.calendar.google.com"
    },
    {
      "id": "15086303716",
      "name": "Y2026 Mathematics MPk",
      "section": "Year 5",
      "descriptionHeading": "Math 5/6 2018-2019",
      "description": "Year 5",
      "ownerId": "107127868601574680717",
      "creationTime": "2018-08-16T09:17:34.192Z",
      "updateTime": "2019-01-28T02:28:45.746Z",
      "enrollmentCode": "2gliyb",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODYzMDM3MTZa",
      "teacherGroupEmail": "Math_5_6_2018_2019_teachers_412d0b11@hope.edu.kh",
      "courseGroupEmail": "Math_5_6_2018_2019_7c66e1a6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfm4xNjEzX1hnWlFERmNROWpqemduMVlLQXBqc2JFM1djWW8tUGJwNWlIcTg",
        "title": "Math 5/6 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfm4xNjEzX1hnWlFERmNROWpqemduMVlLQXBqc2JFM1djWW8tUGJwNWlIcTg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom983b393b@group.calendar.google.com"
    },
    {
      "id": "15086537303",
      "name": "Y2024 Mathematics MPk",
      "section": "Year 7",
      "descriptionHeading": "Math 7/8 2018-2019",
      "description": "Year 7",
      "ownerId": "107127868601574680717",
      "creationTime": "2018-08-16T09:17:02.968Z",
      "updateTime": "2019-01-28T02:30:56.034Z",
      "enrollmentCode": "w4xrdc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODY1MzczMDNa",
      "teacherGroupEmail": "Math_7_8_2018_2019_teachers_2d2d37b6@hope.edu.kh",
      "courseGroupEmail": "Math_7_8_2018_2019_b9795c04@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfmMyYXVNV3p4WFJBYURHcGxZcVhPdFpMSWNXSmNaRnpRaTBPb1V3emlZZG8",
        "title": "Math 7/8 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfmMyYXVNV3p4WFJBYURHcGxZcVhPdFpMSWNXSmNaRnpRaTBPb1V3emlZZG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc84933a4@group.calendar.google.com"
    },
    {
      "id": "15086737922",
      "name": "Y2025 English MPk",
      "section": "Year 6",
      "descriptionHeading": "English 5/6 2018-2019",
      "description": "Year 6",
      "ownerId": "107127868601574680717",
      "creationTime": "2018-08-16T09:15:08.554Z",
      "updateTime": "2019-01-29T04:06:25.462Z",
      "enrollmentCode": "4oy5bco",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODY3Mzc5MjJa",
      "teacherGroupEmail": "English_5_6_2018_2019_teachers_8ca0e7bd@hope.edu.kh",
      "courseGroupEmail": "English_5_6_2018_2019_17bd5d3a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfkRKMDZlY2MwUmxnOEQzRmNfeGZubTNydFJWdWhFNjgzMWVxWUxIeHl1Z1E",
        "title": "English 5/6 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfkRKMDZlY2MwUmxnOEQzRmNfeGZubTNydFJWdWhFNjgzMWVxWUxIeHl1Z1E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom94a7ff94@group.calendar.google.com"
    },
    {
      "id": "15085939869",
      "name": "Y2023 English MPk",
      "section": "Year 8",
      "descriptionHeading": "English 7/8 2018-2019",
      "description": "Year 8",
      "ownerId": "107127868601574680717",
      "creationTime": "2018-08-16T09:14:23.067Z",
      "updateTime": "2019-01-29T04:11:36.710Z",
      "enrollmentCode": "trqk0l8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODU5Mzk4Njla",
      "teacherGroupEmail": "English_7_8_2018_2019_teachers_36103792@hope.edu.kh",
      "courseGroupEmail": "English_7_8_2018_2019_1fa074d7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7Z2bUyOQ9vHfjByTnBiODcwQ3UxN0hFd1VyZmRuYUV6bENFUmd6b1JReXdFRmFVWWVOMFU",
        "title": "English 7/8 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B7Z2bUyOQ9vHfjByTnBiODcwQ3UxN0hFd1VyZmRuYUV6bENFUmd6b1JReXdFRmFVWWVOMFU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc90c118e@group.calendar.google.com"
    },
    {
      "id": "15086195954",
      "name": "3/4 Classroom",
      "descriptionHeading": "3/4 Classroom",
      "ownerId": "104005217247852726712",
      "creationTime": "2018-08-16T07:58:33.151Z",
      "updateTime": "2018-08-16T08:04:51.619Z",
      "enrollmentCode": "bfehuy",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODYxOTU5NTRa",
      "teacherGroupEmail": "3_4_Classroom_teachers_88c1c807@hope.edu.kh",
      "courseGroupEmail": "3_4_Classroom_d55abc8c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_Y_Fmg1zO9LfnFQQkI2b0huOVRGSWNubUpNSnhTRFhBVVVlY1NxV0MwUkFzQ2ZPRkw2SGM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9a855e92@group.calendar.google.com"
    },
    {
      "id": "15086075673",
      "name": "IGCSE Science (Biology) 2019",
      "descriptionHeading": "IGCSE Science (Biology) 2019",
      "ownerId": "100362126255417413706",
      "creationTime": "2018-08-16T06:17:55.589Z",
      "updateTime": "2018-08-16T06:18:56.592Z",
      "enrollmentCode": "aevlwb",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODYwNzU2NzNa",
      "teacherGroupEmail": "IGCSE_Science_Biology_2019_teachers_87ba431c@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Science_Biology_2019_a72eb000@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfmc2blVuSXFQOXR0SkpyOC1PYU1aRnkzbmdBUHBFWnppNVR6TklsTmNleTg",
        "title": "IGCSE Science (Biology) 2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B_c4Ytt8TOwXfmc2blVuSXFQOXR0SkpyOC1PYU1aRnkzbmdBUHBFWnppNVR6TklsTmNleTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf9a50e6a@group.calendar.google.com"
    },
    {
      "id": "15080254909",
      "name": "Y2025 English TA",
      "descriptionHeading": "Mr A's Year 6 English",
      "description": "Mr A's Year 6 English",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-08-16T02:29:28.999Z",
      "updateTime": "2019-01-29T06:58:31.756Z",
      "enrollmentCode": "sjzqlg",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODAyNTQ5MDla",
      "teacherGroupEmail": "Mr_A_s_Year_6_English_teachers_1a01d676@hope.edu.kh",
      "courseGroupEmail": "Mr_A_s_Year_6_English_a749d0d6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fi11czRTNDZFdFZ5dGFlYXNjYVo3R1FvT2ZaLV9EQUUzWm9KUmNyQWJTV1U"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma8144487@group.calendar.google.com"
    },
    {
      "id": "15081970488",
      "name": "Y2023 Pastoral and CL JKw, IP, DE",
      "descriptionHeading": "Pastoral and CL Y8",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-08-16T01:58:37.003Z",
      "updateTime": "2019-01-09T06:12:00.043Z",
      "enrollmentCode": "7t4ogc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODE5NzA0ODha",
      "teacherGroupEmail": "Pastoral_and_CL_Y8_teachers_9f661319@hope.edu.kh",
      "courseGroupEmail": "Pastoral_and_CL_Y8_c633cdd0@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fnZlRnRGaXlSNmJ5MHVLXzY0ekI1QnN6b3RoZHUwRTNYOW80Wi1WUUF1QzA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom733df03a@group.calendar.google.com"
    },
    {
      "id": "15080734909",
      "name": "Y2022 English Literature TA",
      "descriptionHeading": "Mr A's Year 9 English",
      "description": "Mr A's iGCSE English literature",
      "room": "S27",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-08-16T00:45:09.395Z",
      "updateTime": "2019-01-29T06:59:30.805Z",
      "enrollmentCode": "8gghy5",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwODA3MzQ5MDla",
      "teacherGroupEmail": "Mr_A_s_Year_9_English_teachers_6f110b98@hope.edu.kh",
      "courseGroupEmail": "Mr_A_s_Year_9_English_5b7cfe19@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fm1feUFpaTl1b3NKR2s5SnhyeTVvVGV0TjZUNFNWam1COTlRUXZBZGpGdzg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom44121f62@group.calendar.google.com"
    },
    {
      "id": "15077971233",
      "name": "Y2023 English TA",
      "descriptionHeading": "Mr A's Year 8 English",
      "description": "Mr A's Year 8 English",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-08-16T00:42:38.521Z",
      "updateTime": "2019-01-29T06:57:39.385Z",
      "enrollmentCode": "k6h8ea",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNzc5NzEyMzNa",
      "teacherGroupEmail": "Mr_A_s_Year_8_English_teachers_a3a95bfb@hope.edu.kh",
      "courseGroupEmail": "Mr_A_s_Year_8_English_1025e49c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fjdqVjE2eElmYXNaWHN5YndJM2FXV2ZPZXM2cFpnZkhyRVhQV0pkczVZTlE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom06e3894d@group.calendar.google.com"
    },
    {
      "id": "15062744641",
      "name": "Y2023 ENGLISH JDS",
      "section": "8A",
      "descriptionHeading": "English Language 8A",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-08-15T13:31:01.367Z",
      "updateTime": "2019-01-18T02:54:43.092Z",
      "enrollmentCode": "k8qljr",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjI3NDQ2NDFa",
      "teacherGroupEmail": "English_Language_8A_teachers_2b41cf09@hope.edu.kh",
      "courseGroupEmail": "English_Language_8A_387268ab@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJflVieTZaOUg0S0dhTEl0RFZGS0s4eVlSdUJ1WldEZ29JbU9VT3BUSzVOcDA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb49726d7@group.calendar.google.com"
    },
    {
      "id": "15061755185",
      "name": "Y2023 Art DE",
      "descriptionHeading": "Y8 Art Sec B",
      "ownerId": "103117887730131250473",
      "creationTime": "2018-08-15T10:31:29.720Z",
      "updateTime": "2019-01-15T08:44:41.746Z",
      "enrollmentCode": "mftm5y",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjE3NTUxODVa",
      "teacherGroupEmail": "Y8_Art_Sec_B_teachers_d503147f@hope.edu.kh",
      "courseGroupEmail": "Y8_Art_Sec_B_f99a5e91@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9yyWlY3VJOAfmoteGNfbHdxLTRYTDRFMFRESjVjci1tVUVycFlYM3pMR0IwRTBsWVR2cEk",
        "title": "Y8 Art Sec B",
        "alternateLink": "https://drive.google.com/drive/folders/0B9yyWlY3VJOAfmoteGNfbHdxLTRYTDRFMFRESjVjci1tVUVycFlYM3pMR0IwRTBsWVR2cEk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombbcd34c9@group.calendar.google.com"
    },
    {
      "id": "15061270170",
      "name": "Y2024 Art DE",
      "descriptionHeading": "Y7 Art",
      "ownerId": "103117887730131250473",
      "creationTime": "2018-08-15T10:29:04.339Z",
      "updateTime": "2019-01-15T08:44:51.323Z",
      "enrollmentCode": "mdk1o1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjEyNzAxNzBa",
      "teacherGroupEmail": "Y7_Art_teachers_25933b85@hope.edu.kh",
      "courseGroupEmail": "Y7_Art_86b2e99b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9yyWlY3VJOAfmZqLTFYTFFMUFBpSDEzSWszYmhwby1Kb0EyM0hxWFMta3F5MTNwbjJuZG8",
        "title": "Y7 Art",
        "alternateLink": "https://drive.google.com/drive/folders/0B9yyWlY3VJOAfmZqLTFYTFFMUFBpSDEzSWszYmhwby1Kb0EyM0hxWFMta3F5MTNwbjJuZG8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5f0ed7e5@group.calendar.google.com"
    },
    {
      "id": "15061751828",
      "name": "Y2025 Art DE",
      "descriptionHeading": "Y6 Art",
      "ownerId": "103117887730131250473",
      "creationTime": "2018-08-15T10:17:54.788Z",
      "updateTime": "2019-01-15T08:45:28.838Z",
      "enrollmentCode": "oodwmpk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjE3NTE4Mjha",
      "teacherGroupEmail": "Y6_Art_teachers_01a59078@hope.edu.kh",
      "courseGroupEmail": "Y6_Art_d29c58ba@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9yyWlY3VJOAfjN2emRWck9RQ1E3dmkzbFpKUDZrZ0c1MlhhUG5XdF9IXy1zSGFmQy1pVjg",
        "title": "Y6 Art",
        "alternateLink": "https://drive.google.com/drive/folders/0B9yyWlY3VJOAfjN2emRWck9RQ1E3dmkzbFpKUDZrZ0c1MlhhUG5XdF9IXy1zSGFmQy1pVjg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomad7a85c0@group.calendar.google.com"
    },
    {
      "id": "15061475956",
      "name": "Y2022 IGCSE French IP",
      "section": "French",
      "descriptionHeading": "Les oranges Y9",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-08-15T09:23:43.162Z",
      "updateTime": "2019-01-08T08:24:01.802Z",
      "enrollmentCode": "mx3uku",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjE0NzU5NTZa",
      "teacherGroupEmail": "Les_oranges_Y9_teachers_bbe4d5bd@hope.edu.kh",
      "courseGroupEmail": "Les_oranges_Y9_b6bb8283@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fnpIZFhRWHFaYjZQUjRPeWwyLXd1NzQtekR4ZzFXVV9weUE3elp1U21uTTg",
        "title": "Les oranges Y9",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3fnpIZFhRWHFaYjZQUjRPeWwyLXd1NzQtekR4ZzFXVV9weUE3elp1U21uTTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom08bc4256@group.calendar.google.com"
    },
    {
      "id": "15061230304",
      "name": "Y2025 French IP",
      "section": "French",
      "descriptionHeading": "Les verts Y6",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-08-15T08:37:48.052Z",
      "updateTime": "2019-01-08T08:14:50.961Z",
      "enrollmentCode": "rb8klr",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjEyMzAzMDRa",
      "teacherGroupEmail": "Les_verts_Y6_teachers_3f81e7d5@hope.edu.kh",
      "courseGroupEmail": "Les_verts_Y6_aee0072b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3flRSeC1xWGwyQU9NUVktNUcyZkE0VHBQOGZHSkk5ejViNG1DSER5Y2hhelk",
        "title": "Les verts Y6",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3flRSeC1xWGwyQU9NUVktNUcyZkE0VHBQOGZHSkk5ejViNG1DSER5Y2hhelk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4a27ef34@group.calendar.google.com"
    },
    {
      "id": "15060988892",
      "name": "Y2020 IB English A: Language and Literature HL RB",
      "descriptionHeading": "2018-2020 Y11-12 IB English A: Language and Literature",
      "ownerId": "101376001376489767934",
      "creationTime": "2018-08-15T06:21:59.320Z",
      "updateTime": "2019-01-29T04:27:07.176Z",
      "enrollmentCode": "l9fuye",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNjA5ODg4OTJa",
      "teacherGroupEmail": "2018_2020_Y11_12_IB_English_A_Language_and_Literature_teachers_19817171@hope.edu.kh",
      "courseGroupEmail": "2018_2020_Y11_12_IB_English_A_Language_and_Literature_89a2e50c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByfnHSpTdBOBflpqZUlJWWpkUnM3ZzRaV3E1NVFyaFVETU83dzYyUkFqdHlLRUxaQ1ZYMW8",
        "title": "2018-2020 Y11-12 IB English A: Language and Literature",
        "alternateLink": "https://drive.google.com/drive/folders/0ByfnHSpTdBOBflpqZUlJWWpkUnM3ZzRaV3E1NVFyaFVETU83dzYyUkFqdHlLRUxaQ1ZYMW8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom42214540@group.calendar.google.com"
    },
    {
      "id": "15060673747",
      "name": "Year 8 English",
      "descriptionHeading": "Year 8 English",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-08-15T06:09:16.068Z",
      "updateTime": "2018-08-16T00:42:14.963Z",
      "enrollmentCode": "g2joqs",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTUwNjA2NzM3NDda",
      "teacherGroupEmail": "Year_8_English_teachers_7db98a8e@hope.edu.kh",
      "courseGroupEmail": "Year_8_English_6b32f713@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fkZfd083UUdFVjk2S2lZZjJJTGYxcjFqZG9OZ0dKUmxyR3hxR0VVNDZZOE0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom80960a28@group.calendar.google.com"
    },
    {
      "id": "15054375785",
      "name": "2018 Geography Y9",
      "descriptionHeading": "Geography Y9",
      "ownerId": "115976931584272436878",
      "creationTime": "2018-08-15T03:38:53.590Z",
      "updateTime": "2018-08-15T03:39:17.868Z",
      "enrollmentCode": "rr8vzuh",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNTQzNzU3ODVa",
      "teacherGroupEmail": "Geography_Y9_teachers_6b84114b@hope.edu.kh",
      "courseGroupEmail": "Geography_Y9_464c9f80@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHfnpQQzNjVE1FTDRtV01LUlAwMzZScVkzb3ZiZVBOTGtpejl3Um1zWmVockk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom40864d93@group.calendar.google.com"
    },
    {
      "id": "16063195662",
      "name": "Y2022 ICT JKw",
      "descriptionHeading": "Y9 ICT 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T22:30:17.881Z",
      "updateTime": "2019-01-09T06:09:16.296Z",
      "enrollmentCode": "ygkt73v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNjMxOTU2NjJa",
      "teacherGroupEmail": "Y9_ICT_2018_2019_teachers_b52633ec@hope.edu.kh",
      "courseGroupEmail": "Y9_ICT_2018_2019_a793771f@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfkZ1dWhONTc0MHdyMmQ4aVVUUWhWdDJYcEduWE14dUZ1V0R6bk5IdGFPdlE",
        "title": "Y9 ICT 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfkZ1dWhONTc0MHdyMmQ4aVVUUWhWdDJYcEduWE14dUZ1V0R6bk5IdGFPdlE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomcb66dcb1@group.calendar.google.com"
    },
    {
      "id": "16058185925",
      "name": "Y2023 ICT JKw",
      "descriptionHeading": "Y8 IT 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T18:55:07.992Z",
      "updateTime": "2019-01-08T08:14:36.571Z",
      "enrollmentCode": "f188ca",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNTgxODU5MjVa",
      "teacherGroupEmail": "Y8_IT_2018_2019_teachers_5891a055@hope.edu.kh",
      "courseGroupEmail": "Y8_IT_2018_2019_5522a81c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfkJKVVZYZmpncFlMNWVIY19qZG5RbDBjWGxzdXJJN0VjUjNoNVNLZG82WDA",
        "title": "Y8 IT 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfkJKVVZYZmpncFlMNWVIY19qZG5RbDBjWGxzdXJJN0VjUjNoNVNLZG82WDA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomaea7b3a2@group.calendar.google.com"
    },
    {
      "id": "16059575101",
      "name": "Y2024 ICT JKw",
      "descriptionHeading": "Y9 IT 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T18:54:01.968Z",
      "updateTime": "2019-01-09T06:11:14.634Z",
      "enrollmentCode": "yjyz0r",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNTk1NzUxMDFa",
      "teacherGroupEmail": "Y9_IT_2018_2019_teachers_2b7abff9@hope.edu.kh",
      "courseGroupEmail": "Y9_IT_2018_2019_0752dbc4@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmtvVGFsSUZ0SE5wTXRtbU51UTh5M0dsTG8tSmY3WUVjN3o4cjFJSE9ONDA",
        "title": "Y9 IT 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfmtvVGFsSUZ0SE5wTXRtbU51UTh5M0dsTG8tSmY3WUVjN3o4cjFJSE9ONDA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom478e26b9@group.calendar.google.com"
    },
    {
      "id": "16060536040",
      "name": "Y2021 ICT JKw",
      "descriptionHeading": "Y10 IT 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T18:52:29.688Z",
      "updateTime": "2019-01-09T06:10:12.542Z",
      "enrollmentCode": "2ca856",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNjA1MzYwNDBa",
      "teacherGroupEmail": "Y10_IT_2018_2019_teachers_ea2ec7f7@hope.edu.kh",
      "courseGroupEmail": "Y10_IT_2018_2019_1bc31e60@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIflBfYnVpQnFJMUh5RWV2OWRObnM2bS1BWi1CYjI3aE94SUozLU0zb2RWeVE",
        "title": "Y10 IT 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIflBfYnVpQnFJMUh5RWV2OWRObnM2bS1BWi1CYjI3aE94SUozLU0zb2RWeVE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8072cc2b@group.calendar.google.com"
    },
    {
      "id": "16057022859",
      "name": "Y2021 Math JKw",
      "descriptionHeading": "Y10 Math 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T15:58:47.656Z",
      "updateTime": "2019-01-09T06:10:56.665Z",
      "enrollmentCode": "qs2d3o",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNTcwMjI4NTla",
      "teacherGroupEmail": "Y10_Math_2018_2019_teachers_9231dd21@hope.edu.kh",
      "courseGroupEmail": "Y10_Math_2018_2019_93ee0718@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIflZRalkzYW5ZMGxxQzRWNGp1S0ZxODd0NWU0Wi1hZzNCN29lNERQa0EtU0E",
        "title": "Y10 Math 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIflZRalkzYW5ZMGxxQzRWNGp1S0ZxODd0NWU0Wi1hZzNCN29lNERQa0EtU0E"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2276843b@group.calendar.google.com"
    },
    {
      "id": "15043800221",
      "name": "Y2020 IB ENGLISH B HL JDS",
      "section": "11",
      "descriptionHeading": "IB English B Grade 11",
      "room": "S29",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-08-14T14:44:37.984Z",
      "updateTime": "2019-01-08T08:21:45.548Z",
      "enrollmentCode": "60u5es",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNDM4MDAyMjFa",
      "teacherGroupEmail": "IB_English_B_Grade_11_teachers_8452469c@hope.edu.kh",
      "courseGroupEmail": "IB_English_B_Grade_11_778366f5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJflJmMXNneE0xMThkdWs0NlNiMnFjdTFxYm5OVzh5X01KUFg5YVdEaDh6ZnM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7e82b9a4@group.calendar.google.com"
    },
    {
      "id": "15042694886",
      "name": "Y2021 IGCSE ENGLISH LANGUAGE JDS",
      "section": "10",
      "descriptionHeading": "IGCSE English Language 10",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-08-14T14:36:49.348Z",
      "updateTime": "2019-01-08T08:19:44.934Z",
      "enrollmentCode": "xwhcikz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNDI2OTQ4ODZa",
      "teacherGroupEmail": "IGCSE_English_Language_10_teachers_f548ad57@hope.edu.kh",
      "courseGroupEmail": "IGCSE_English_Language_10_8e532291@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJfjVIdmh1cGZtQ3JPWmxORWVKVm9qNlI2OThUaWJMRWRHSTlXNkNWU0Etd2s"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom354d7972@group.calendar.google.com"
    },
    {
      "id": "15042694784",
      "name": "Y2024 ENGLISH JDS",
      "section": "7B",
      "descriptionHeading": "English Language B",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-08-14T14:20:53.437Z",
      "updateTime": "2019-01-31T04:09:48.369Z",
      "enrollmentCode": "2xespm",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNDI2OTQ3ODRa",
      "teacherGroupEmail": "English_Language_B_teachers_53f3cb55@hope.edu.kh",
      "courseGroupEmail": "English_Language_B_a8f76000@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJfi1UV0d2RXRHTUlTdEhoY3puYld0ME54cWtqSWQ3Qm9HOHJHZUpqVTdyOVU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9b98f952@group.calendar.google.com"
    },
    {
      "id": "16052527003",
      "name": "Y2022 IGCSE CS JKw",
      "descriptionHeading": "Y9 IGCSE CS 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T08:28:38.894Z",
      "updateTime": "2019-01-09T06:09:44.977Z",
      "enrollmentCode": "brwtg6i",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNTI1MjcwMDNa",
      "teacherGroupEmail": "Y9_IGCSE_CS_2018_2019_teachers_2292fd5d@hope.edu.kh",
      "courseGroupEmail": "Y9_IGCSE_CS_2018_2019_0d4a3246@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfjNpREozM3RWdmtRemNXaVVmcGVDZzR4dTk4VVJDVERrRDNUaG0wRDFTUTA",
        "title": "Y9 IGCSE CS 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfjNpREozM3RWdmtRemNXaVVmcGVDZzR4dTk4VVJDVERrRDNUaG0wRDFTUTA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom90a75a0a@group.calendar.google.com"
    },
    {
      "id": "16052292479",
      "name": "Y2025 ICT JKw",
      "descriptionHeading": "Y6 ICT 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-08-14T08:10:08.518Z",
      "updateTime": "2019-01-09T06:11:33.463Z",
      "enrollmentCode": "r4kroc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwNTIyOTI0Nzla",
      "teacherGroupEmail": "Y6_ICT_2018_2019_teachers_c9ef8082@hope.edu.kh",
      "courseGroupEmail": "Y6_ICT_2018_2019_bd21b76d@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmliSEYwczlkdktsUE12NkpYTWpJeFFGX2FQU0ZadVQyeXRKUGF6SUh5OWs",
        "title": "Y6 ICT 2018-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfmliSEYwczlkdktsUE12NkpYTWpJeFFGX2FQU0ZadVQyeXRKUGF6SUh5OWs"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb3ef8039@group.calendar.google.com"
    },
    {
      "id": "15040781103",
      "name": "Y2023 Music TP",
      "descriptionHeading": "Year 8 Music 2018-19",
      "ownerId": "110760563115232207760",
      "creationTime": "2018-08-14T07:01:50.476Z",
      "updateTime": "2019-01-29T04:52:25.798Z",
      "enrollmentCode": "t1762zy",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNDA3ODExMDNa",
      "teacherGroupEmail": "Year_8_Music_2018_19_teachers_c201f126@hope.edu.kh",
      "courseGroupEmail": "Year_8_Music_2018_19_42641157@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiuflZBU3JoeG9SUUFYZ0xCa1ctNVh3eDk0UXNUVzdzS28zNjdCdWZrbGNweXM",
        "title": "Year 8 Music 2018-19",
        "alternateLink": "https://drive.google.com/drive/folders/0Bz2WH4eYFAiuflZBU3JoeG9SUUFYZ0xCa1ctNVh3eDk0UXNUVzdzS28zNjdCdWZrbGNweXM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom25953e59@group.calendar.google.com"
    },
    {
      "id": "15040878863",
      "name": "Y2024 Music TP",
      "descriptionHeading": "Year 7 Music 2018-19",
      "ownerId": "110760563115232207760",
      "creationTime": "2018-08-14T07:00:58.437Z",
      "updateTime": "2019-01-29T04:53:22.188Z",
      "enrollmentCode": "d40pkt",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwNDA4Nzg4NjNa",
      "teacherGroupEmail": "Year_7_Music_2018_19_teachers_030e03df@hope.edu.kh",
      "courseGroupEmail": "Year_7_Music_2018_19_99d51227@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufkxsNXRPaFNGS2s4TXNBcXRlRWJaWGNlQjZKT3NrQXdXX1NiaFczN0hiVXc",
        "title": "Year 7 Music 2018-19",
        "alternateLink": "https://drive.google.com/drive/folders/0Bz2WH4eYFAiufkxsNXRPaFNGS2s4TXNBcXRlRWJaWGNlQjZKT3NrQXdXX1NiaFczN0hiVXc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc430be26@group.calendar.google.com"
    },
    {
      "id": "15038696334",
      "name": "Y2025 Music TP",
      "descriptionHeading": "Year 6 Music 2018-19",
      "ownerId": "110760563115232207760",
      "creationTime": "2018-08-14T06:58:55.726Z",
      "updateTime": "2019-01-29T04:54:27.836Z",
      "enrollmentCode": "503tgrk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwMzg2OTYzMzRa",
      "teacherGroupEmail": "Year_6_Music_2018_19_teachers_3dbe9768@hope.edu.kh",
      "courseGroupEmail": "Year_6_Music_2018_19_0dad0afe@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufnNMRzdXT2o4VUhfekF4NXV6dDNBZ2xvS1MzOURIUFQ0M2RsdWlmX0ktcm8",
        "title": "Year 6 Music 2018-19",
        "alternateLink": "https://drive.google.com/drive/folders/0Bz2WH4eYFAiufnNMRzdXT2o4VUhfekF4NXV6dDNBZ2xvS1MzOURIUFQ0M2RsdWlmX0ktcm8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7e07d1d8@group.calendar.google.com"
    },
    {
      "id": "15038579287",
      "name": "Y2024 Mathematics LK",
      "descriptionHeading": "2021 Pastoral Class",
      "ownerId": "112644773599177931542",
      "creationTime": "2018-08-14T03:27:22.950Z",
      "updateTime": "2019-01-08T08:18:15.300Z",
      "enrollmentCode": "o4w363",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUwMzg1NzkyODda",
      "teacherGroupEmail": "2021_Pastoral_Class_teachers_f0f6aace@hope.edu.kh",
      "courseGroupEmail": "2021_Pastoral_Class_16cbab14@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fmVTYnJDZmtsbTBBV3EzWENiSFlUQkJYaFNmTnIyUExwdEVVemd0aGJ0dWc",
        "title": "2021 Pastoral Class",
        "alternateLink": "https://drive.google.com/drive/folders/0B6aeU8sX9ah_fmVTYnJDZmtsbTBBV3EzWENiSFlUQkJYaFNmTnIyUExwdEVVemd0aGJ0dWc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8ae53675@group.calendar.google.com"
    },
    {
      "id": "16016347823",
      "name": "Google Classroom PD",
      "descriptionHeading": "Google Classroom PD",
      "ownerId": "109990790352499959046",
      "creationTime": "2018-08-09T13:54:43.067Z",
      "updateTime": "2018-08-09T13:54:42.122Z",
      "enrollmentCode": "zwxsu9d",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTYwMTYzNDc4MjNa",
      "teacherGroupEmail": "Google_Classroom_PD_teachers_51d15088@hope.edu.kh",
      "courseGroupEmail": "Google_Classroom_PD_c62c4e76@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2I4aMarxbv1fmNJRUJvcHJCRzVOUlpVSmlYN25PdWhrcFpmYTZfRy1iZkZ5cTBhSG83eTg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom471a6b8c@group.calendar.google.com"
    },
    {
      "id": "14977294228",
      "name": "English Language",
      "section": "7B",
      "descriptionHeading": "English Language 7",
      "ownerId": "110125726136851680290",
      "creationTime": "2018-08-07T12:53:15.827Z",
      "updateTime": "2018-08-23T05:55:02.642Z",
      "enrollmentCode": "037jpwz",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTQ5NzcyOTQyMjha",
      "teacherGroupEmail": "English_Language_7B_teachers_ab534f51@hope.edu.kh",
      "courseGroupEmail": "English_Language_7B_131e0c09@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3GbVB_VmyUJfjhYczJpeDRiMXRlczJZNDdNTEs2QklIVDk5RmxOS3cyYlhaSzViR3F4Tm8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom5eaf8d63@group.calendar.google.com"
    },
    {
      "id": "14969973513",
      "name": "8 History",
      "descriptionHeading": "8 History",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:08:28.268Z",
      "updateTime": "2018-08-06T09:08:27.446Z",
      "enrollmentCode": "1uph3g",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ5Njk5NzM1MTNa",
      "teacherGroupEmail": "8_History_teachers_0a9cd199@hope.edu.kh",
      "courseGroupEmail": "8_History_e98440f0@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fkIzbHRqcXBXc09idDFKSTFFNjBxVktudU1OODE5dGVGT1kwM01ZaEpRaUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd8adc436@group.calendar.google.com"
    },
    {
      "id": "14970396831",
      "name": "8 Geography",
      "descriptionHeading": "8 Geography",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:07:41.981Z",
      "updateTime": "2018-08-06T09:07:41.256Z",
      "enrollmentCode": "rlevf6b",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ5NzAzOTY4MzFa",
      "teacherGroupEmail": "8_Geography_teachers_7aa02514@hope.edu.kh",
      "courseGroupEmail": "8_Geography_6ae382c9@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fkFVemJQLU9fbkd6Q2ZkeUYwX1lhaUdFSllydm5FdUdmbi1UZ1lfNzl6Zzg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3fe1917a@group.calendar.google.com"
    },
    {
      "id": "14970544764",
      "name": "7/8 Christian Living",
      "descriptionHeading": "7/8 Christian Living",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:05:17.507Z",
      "updateTime": "2019-01-31T04:06:26.135Z",
      "enrollmentCode": "aiblc6n",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTQ5NzA1NDQ3NjRa",
      "teacherGroupEmail": "7_8_Christian_Living_teachers_8a9a65b6@hope.edu.kh",
      "courseGroupEmail": "7_8_Christian_Living_a78b7716@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fmlyWkQyZ2pRMFJaWUk2X0JWMHM4TjAtY2E3NWFlV1dNRUZuajgwUTR3MUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom59f9ee02@group.calendar.google.com"
    },
    {
      "id": "14970506892",
      "name": "7 SOSE",
      "descriptionHeading": "7 SOSE",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:04:23.905Z",
      "updateTime": "2018-08-06T09:04:23.155Z",
      "enrollmentCode": "tdl4iu",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ5NzA1MDY4OTJa",
      "teacherGroupEmail": "7_SOSE_teachers_65b82095@hope.edu.kh",
      "courseGroupEmail": "7_SOSE_fa38edad@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fl9QVEpTRG9ITENkU181dHE0MXpWWExFRm5wZmRNdksyZTNUUTJCREV6MWs"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd1a6ed3c@group.calendar.google.com"
    },
    {
      "id": "14968630805",
      "name": "6 SOSE",
      "descriptionHeading": "6 SOSE",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:04:02.268Z",
      "updateTime": "2018-08-06T09:04:01.499Z",
      "enrollmentCode": "lu6zgm5",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ5Njg2MzA4MDVa",
      "teacherGroupEmail": "6_SOSE_teachers_75778a65@hope.edu.kh",
      "courseGroupEmail": "6_SOSE_a1989637@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fkY0ZmhEUDQ0bXJKbnMwdkhKZkRVUlNZWUpZcWtIQXJnQnNCTEt3el9xRWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3ea30577@group.calendar.google.com"
    },
    {
      "id": "14969858976",
      "name": "7/8 Christian Perspectives",
      "descriptionHeading": "7/8 Christian Perspectives",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:01:34.466Z",
      "updateTime": "2018-08-06T09:02:36.139Z",
      "enrollmentCode": "pgx30e9",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ5Njk4NTg5NzZa",
      "teacherGroupEmail": "7_8_Christian_Perspectives_teachers_16a76187@hope.edu.kh",
      "courseGroupEmail": "7_8_Christian_Perspectives_8051a294@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_flZ6LXRoclBYQllyMnZ5SzN6TU9lcXlieVhweHNkaFhrUDhmd3YzbU9qdm8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8a8dc2df@group.calendar.google.com"
    },
    {
      "id": "14970513130",
      "name": "5/6 Christian Perspectives",
      "descriptionHeading": "5/6 Christian Perspectives",
      "ownerId": "113635599462006979888",
      "creationTime": "2018-08-06T09:00:55.468Z",
      "updateTime": "2018-08-06T09:00:54.659Z",
      "enrollmentCode": "hqsvpc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ5NzA1MTMxMzBa",
      "teacherGroupEmail": "5_6_Christian_Perspectives_teachers_34fcca6c@hope.edu.kh",
      "courseGroupEmail": "5_6_Christian_Perspectives_ac9b0cc4@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fnlvTF9XSDBWWHBPQ2xlRkYwb3RsenNyYzZrMm1WQWpPcjRHQkcwenU2eVU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombc140135@group.calendar.google.com"
    },
    {
      "id": "15946312898",
      "name": "Teacher PD",
      "section": "Staff",
      "descriptionHeading": "Teacher PD Staff",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-07-24T15:04:12.346Z",
      "updateTime": "2018-07-24T15:04:11.230Z",
      "enrollmentCode": "3vqybv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTU5NDYzMTI4OTha",
      "teacherGroupEmail": "Teacher_PD_Staff_teachers_badea2d5@hope.edu.kh",
      "courseGroupEmail": "Teacher_PD_Staff_c30fcca8@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnZvM2wtQ1hFdk1ubFFkeFZBc2NMdnF4NHE1Zk1ocWRvNF9lTkRkR3JJZTQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc9f5f7c9@group.calendar.google.com"
    },
    {
      "id": "15948031511",
      "name": "Y2021 IGCSE CS JKw",
      "descriptionHeading": "Y9 IGCSE CS 2018-19",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-07-24T14:48:46.645Z",
      "updateTime": "2019-01-09T06:10:33.081Z",
      "enrollmentCode": "n1pp7j",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTU5NDgwMzE1MTFa",
      "teacherGroupEmail": "Y9_IGCSE_CS_2018_19_teachers_40aa733e@hope.edu.kh",
      "courseGroupEmail": "Y9_IGCSE_CS_2018_19_6ec3fd48@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnNMUWQzQlZUWEVBQjhCc2VHUl8xcHVYLVRibm9lXzAyVmk0cEc2eVhoQlU",
        "title": "Y9 IGCSE CS 2018-19",
        "alternateLink": "https://drive.google.com/drive/folders/0ByUSUXY3mRrIfnNMUWQzQlZUWEVBQjhCc2VHUl8xcHVYLVRibm9lXzAyVmk0cEc2eVhoQlU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombbbe4067@group.calendar.google.com"
    },
    {
      "id": "14810416855",
      "name": "Y8 IGCSE CS",
      "descriptionHeading": "Y9 IGCSE CS 2018-2019",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-06-14T02:22:09.715Z",
      "updateTime": "2018-08-18T10:09:57.954Z",
      "enrollmentCode": "k5hus0",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTQ4MTA0MTY4NTVa",
      "teacherGroupEmail": "Y8_IGCSE_CS_teachers_c9122c38@hope.edu.kh",
      "courseGroupEmail": "Y8_IGCSE_CS_54342b13@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIflp0UVNXR3ZTckZlZTVrdUJSWDdHS3Q2cC1Vci1YX21RYlR1bEZRM0xTVkk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8b4e37ce@group.calendar.google.com"
    },
    {
      "id": "14800265795",
      "name": "Y5 ICT",
      "descriptionHeading": "Y5 ICT",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-06-12T03:56:05.286Z",
      "updateTime": "2018-10-08T07:14:12.750Z",
      "enrollmentCode": "i64k4x",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTQ4MDAyNjU3OTVa",
      "teacherGroupEmail": "Y5_ICT_teachers_29cdabf1@hope.edu.kh",
      "courseGroupEmail": "Y5_ICT_ffc6492f@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnQwVy1aRVk4el9vb1puMVd3U0kwS0hoZTZEOGV1Sl85aHNrdTJGQ3hIYkU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome5857cd1@group.calendar.google.com"
    },
    {
      "id": "14768041187",
      "name": "Y2020 IB Physics HL LK",
      "descriptionHeading": "2020 IB Physics HL",
      "ownerId": "112644773599177931542",
      "creationTime": "2018-06-05T04:11:29.592Z",
      "updateTime": "2019-01-08T08:13:28.770Z",
      "enrollmentCode": "ml086p",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ3NjgwNDExODda",
      "teacherGroupEmail": "2020_IB_Physics_HL_teachers_072c8429@hope.edu.kh",
      "courseGroupEmail": "2020_IB_Physics_HL_b24ba06c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fi1GZ09oNlRrLWZkZjdTMTFvczE2T0MtNll0eTFXSkZMNF95b3hpNnV4Nnc",
        "title": "2020 IB Physics HL",
        "alternateLink": "https://drive.google.com/drive/folders/0B6aeU8sX9ah_fi1GZ09oNlRrLWZkZjdTMTFvczE2T0MtNll0eTFXSkZMNF95b3hpNnV4Nnc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom5131badd@group.calendar.google.com"
    },
    {
      "id": "14768675062",
      "name": "Y2020 IB Mathematics SL LK",
      "descriptionHeading": "2020 IB Maths SL",
      "ownerId": "112644773599177931542",
      "creationTime": "2018-06-05T03:55:59.220Z",
      "updateTime": "2019-01-08T08:14:37.091Z",
      "enrollmentCode": "882a0j",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ3Njg2NzUwNjJa",
      "teacherGroupEmail": "2020_IB_Maths_SL_teachers_c5269a55@hope.edu.kh",
      "courseGroupEmail": "2020_IB_Maths_SL_f789a781@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fnNqT3dsb3lqZG1KcmNXX2VpZjJrTzhNRUw5QnJMVmJlRTZmQlVFX3pqNmc",
        "title": "2020 IB Maths SL",
        "alternateLink": "https://drive.google.com/drive/folders/0B6aeU8sX9ah_fnNqT3dsb3lqZG1KcmNXX2VpZjJrTzhNRUw5QnJMVmJlRTZmQlVFX3pqNmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1b6ffccf@group.calendar.google.com"
    },
    {
      "id": "14704533466",
      "name": "EE 2017-2019 Woorinuri Yang",
      "section": "IB",
      "descriptionHeading": "Extended Essay 2017-2019 IB",
      "ownerId": "110575928947711158789",
      "creationTime": "2018-05-24T05:04:55.038Z",
      "updateTime": "2018-09-05T08:06:13.810Z",
      "enrollmentCode": "ay2zbk0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTQ3MDQ1MzM0NjZa",
      "teacherGroupEmail": "Extended_Essay_2017_2019_IB_teachers_10fda6c8@hope.edu.kh",
      "courseGroupEmail": "Extended_Essay_2017_2019_IB_f95b396b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfklBNnltakpWX3lCRUxLUGNEQ3VQSGRSSUktSms0ZjBpUTFnQXVsWjZRem8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome7affd5e@group.calendar.google.com"
    },
    {
      "id": "14568013524",
      "name": "Year 5 Transition",
      "descriptionHeading": "Year 5 Transition",
      "ownerId": "105047164691301773564",
      "creationTime": "2018-05-11T03:55:44.090Z",
      "updateTime": "2018-08-29T08:27:28.310Z",
      "enrollmentCode": "pc6re08",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTQ1NjgwMTM1MjRa",
      "teacherGroupEmail": "Year_5_Transition_teachers_414f1b10@hope.edu.kh",
      "courseGroupEmail": "Year_5_Transition_aa266822@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfjIyeTRhS2dISEkyak9xb1B0QW92NWVkcEllcVRLdGVKYl9YOGN2cUp2NlE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom66ed8557@group.calendar.google.com"
    },
    {
      "id": "12016250559",
      "name": "Year 8",
      "descriptionHeading": "Year 8",
      "ownerId": "105682420620679346959",
      "creationTime": "2018-04-03T07:01:14.935Z",
      "updateTime": "2018-04-03T07:01:13.998Z",
      "enrollmentCode": "shxb8v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTIwMTYyNTA1NTla",
      "teacherGroupEmail": "Year_8_teachers_b6d8dcce@hope.edu.kh",
      "courseGroupEmail": "Year_8_d4ea36f4@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfk1EV2JqcEdXczBqZ2RtMjBidC1RN1F1OWpoZWlYc3hJYUsxeGlqUDFrREU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombf3b9be0@group.calendar.google.com"
    },
    {
      "id": "11984163155",
      "name": "Y6-7 Korean 2018 S2",
      "section": "Afterschool",
      "descriptionHeading": "Y6-7 Korean 2018 S2 Afterschool",
      "ownerId": "110575928947711158789",
      "creationTime": "2018-03-28T10:27:26.073Z",
      "updateTime": "2018-08-30T02:58:08.010Z",
      "enrollmentCode": "c5vry3a",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTE5ODQxNjMxNTVa",
      "teacherGroupEmail": "Y6_7_Korean_2018_S2_Afterschool_teachers_df8d3411@hope.edu.kh",
      "courseGroupEmail": "Y6_7_Korean_2018_S2_Afterschool_acb64d4f@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfnA2ald1Z3RKSkhmeWk4ZUtibWtUcGhtUDE2aUJhaWpKQVNKc2NSVkdVdlE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2fe6e0ef@group.calendar.google.com"
    },
    {
      "id": "11840434241",
      "name": "Flight Training group",
      "descriptionHeading": "Flight Training group",
      "ownerId": "113798815889845652257",
      "creationTime": "2018-03-13T12:32:02.214Z",
      "updateTime": "2018-08-13T18:45:17.165Z",
      "enrollmentCode": "mpidcb",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTE4NDA0MzQyNDFa",
      "teacherGroupEmail": "Flight_Training_group_teachers_b95601d8@hope.edu.kh",
      "courseGroupEmail": "Flight_Training_group_40044f82@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwCLqTadiNUnfjYtckozMkswaEN3TGlacm50SHRZRUM3WGNUSG5oMENFaGg3SV9wbmpsczg"
      },
      "courseMaterialSets": [
        {
          "title": "Task for Tom Kershaw",
          "materials": [
            {
              "driveFile": {
                "id": "1WDn5VJXFSQpFH3lq7cB5PtTFD5zXKMIiToyk4yuC1eQ",
                "alternateLink": "https://drive.google.com/open?id=1WDn5VJXFSQpFH3lq7cB5PtTFD5zXKMIiToyk4yuC1eQ"
              }
            },
            {
              "driveFile": {
                "id": "1vIJI1sumrE4EzrXpXzjcHgk8EI-VqE4Y",
                "alternateLink": "https://drive.google.com/open?id=1vIJI1sumrE4EzrXpXzjcHgk8EI-VqE4Y"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc12c10c0@group.calendar.google.com"
    },
    {
      "id": "11805154429",
      "name": "Geography rocks",
      "descriptionHeading": "Geography rocks",
      "ownerId": "115976931584272436878",
      "creationTime": "2018-03-09T04:26:13.199Z",
      "updateTime": "2018-08-13T18:45:28.830Z",
      "enrollmentCode": "m0xe8op",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTE4MDUxNTQ0Mjla",
      "teacherGroupEmail": "Geography_rocks_teachers_496acb61@hope.edu.kh",
      "courseGroupEmail": "Geography_rocks_74f986a6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6UbBTr6rakHfm5IODFPNDhrbUhjeDFQeHZXc3pBNDJoQ05qazBtdTFCMTRQNHJ3ZFMtS00"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd2336f6b@group.calendar.google.com"
    },
    {
      "id": "11803582888",
      "name": "John Tsui's Classroom",
      "descriptionHeading": "Sycamore 101",
      "description": "Test classroom to integrate with Sycamore",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-03-09T01:50:50.058Z",
      "updateTime": "2018-08-13T18:45:11.324Z",
      "enrollmentCode": "kmmhs5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTE4MDM1ODI4ODha",
      "teacherGroupEmail": "John_Tsui_s_Classroom_teachers_75f90e51@hope.edu.kh",
      "courseGroupEmail": "John_Tsui_s_Classroom_fce53ebf@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6CfEUqoQMi1fkdLOWNsSWxOWlVKNjNmZ0ZLUmh0TVlESm4ycXdxN0x6QnNOVGFpdm5FR1U"
      },
      "courseMaterialSets": [
        {
          "title": "Reading",
          "materials": [
            {
              "link": {
                "url": "https://se.sycamoresupport.com/google",
                "title": "Google",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://se.sycamoresupport.com/google&a=AIYkKU86M43CTN_Eu8lPxosRTMQSC-tz3Q"
              }
            },
            {
              "link": {
                "url": "https://se.sycamoresupport.com/google-classrooms$syncing",
                "title": "Google Classrooms",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://se.sycamoresupport.com/google-classrooms$syncing&a=AIYkKU9SI9IdFkx79RzjeJ7iGD3wQN9JWQ"
              }
            },
            {
              "link": {
                "url": "https://se.sycamoresupport.com/gafe-google-classroom",
                "title": "Google Classroom",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://se.sycamoresupport.com/gafe-google-classroom&a=AIYkKU-qWTrPuS6NDukawPunFh8ju1fmKA"
              }
            },
            {
              "link": {
                "url": "https://se.sycamoresupport.com/google-classrooms",
                "title": "Google Classrooms",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://se.sycamoresupport.com/google-classrooms&a=AIYkKU9hVvKSHB-7I8vUYsyUXo76ybGICw"
              }
            },
            {
              "link": {
                "url": "https://se.sycamoresupport.com/google-organization-units",
                "title": "Google Organization Units",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://se.sycamoresupport.com/google-organization-units&a=AIYkKU8PDLPcyYSMl9HHjUukQh8NyyXVfg"
              }
            },
            {
              "link": {
                "url": "https://se.sycamoresupport.com/google-students",
                "title": "Google Students",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://se.sycamoresupport.com/google-students&a=AIYkKU9ts54Tw_vNb0TPXA4Q3APBU_6_LQ"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroombca19f85@group.calendar.google.com"
    },
    {
      "id": "11661812452",
      "name": "G-Suite Training",
      "descriptionHeading": "G-Suite Training",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-02-26T09:34:54.573Z",
      "updateTime": "2018-08-13T18:45:23.310Z",
      "enrollmentCode": "7lsxt4",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTE2NjE4MTI0NTJa",
      "teacherGroupEmail": "G_Suite_Training_teachers_3c933260@hope.edu.kh",
      "courseGroupEmail": "G_Suite_Training_2cf7f03a@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfllFWFpOOW1tdlgtNDJRUldLSGZMb0EzSXNxbklFLUlfbjNEN3RENVFJYUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom78dee96c@group.calendar.google.com"
    },
    {
      "id": "10519155524",
      "name": "Jeremie Classe de français",
      "descriptionHeading": "Jeremie FRench",
      "ownerId": "117957340856753443265",
      "creationTime": "2018-01-14T07:27:08.729Z",
      "updateTime": "2018-08-15T08:31:01.820Z",
      "enrollmentCode": "zbnkwqu",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA1MTkxNTU1MjRa",
      "teacherGroupEmail": "Jeremie_FRench_teachers_8167a9b6@hope.edu.kh",
      "courseGroupEmail": "Jeremie_FRench_6a56311c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fmxDcmNLZHJfc2lnSEdJdzBiNS13MDZ2WDNweENmcWhIT2oxYTJ1UTc2ZVU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb6b54616@group.calendar.google.com"
    },
    {
      "id": "10488893047",
      "name": "Y8 Maths AD",
      "descriptionHeading": "Y8 Mat",
      "ownerId": "105666599265309194719",
      "creationTime": "2018-01-11T07:22:10.742Z",
      "updateTime": "2018-02-07T02:41:08.346Z",
      "enrollmentCode": "32px1td",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTA0ODg4OTMwNDda",
      "teacherGroupEmail": "Y8_Mat_teachers_7ddb7404@hope.edu.kh",
      "courseGroupEmail": "Y8_Mat_205b31a5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-fnowcVpsUHdZUENJZktwRnBkeDNXYl9wR3dTNTdaREtNWkQ1OEU4dlc4ZlE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomab6d9276@group.calendar.google.com"
    },
    {
      "id": "10487274609",
      "name": "ICT Year 1",
      "section": "Semester 2",
      "descriptionHeading": "ICT Year 1 Semester 2",
      "ownerId": "108951450081736118120",
      "creationTime": "2018-01-11T02:02:13.063Z",
      "updateTime": "2018-01-11T02:02:12.098Z",
      "enrollmentCode": "rsdhw4e",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTA0ODcyNzQ2MDla",
      "teacherGroupEmail": "ICT_Year_1_Semester_2_teachers_d082c209@hope.edu.kh",
      "courseGroupEmail": "ICT_Year_1_Semester_2_df473d1a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfkVCMl8wSU9qNC1NZGVnclY1THU2UFpsMDNLWk1EWE5BN2JEUVh2cHJBeWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom97b0d1fc@group.calendar.google.com"
    },
    {
      "id": "10486955624",
      "name": "ICT Year 2",
      "section": "Semester 2",
      "descriptionHeading": "ICT Year 1 Semester 2",
      "ownerId": "108951450081736118120",
      "creationTime": "2018-01-11T02:02:02.700Z",
      "updateTime": "2018-01-11T02:05:12.542Z",
      "enrollmentCode": "gc3so9",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0ODY5NTU2MjRa",
      "teacherGroupEmail": "ICT_Year_1_Semester_2_teachers_32f37190@hope.edu.kh",
      "courseGroupEmail": "ICT_Year_1_Semester_2_2c6b124d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfmRGRjJBQWJ3SHozSl84QTVrZ0lqQjdwd0tJMnNzZjJwcWtpU085dDNla2c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom0dcc2024@group.calendar.google.com"
    },
    {
      "id": "10485750089",
      "name": "ICT Year 2",
      "section": "Semester 2",
      "descriptionHeading": "ICT Year 2 Semester 2",
      "ownerId": "108951450081736118120",
      "creationTime": "2018-01-11T01:26:18.551Z",
      "updateTime": "2018-01-11T01:26:16.928Z",
      "enrollmentCode": "8myc7y",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTA0ODU3NTAwODla",
      "teacherGroupEmail": "ICT_Year_2_Semester_2_teachers_755efe34@hope.edu.kh",
      "courseGroupEmail": "ICT_Year_2_Semester_2_b3a9aec5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9Hjfk1La0lWM0NFdVlUSmpOYk5vTTA0WEh5Mk54RHJ5Zmg5aTJPeDFtek1ueWM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9cd1437b@group.calendar.google.com"
    },
    {
      "id": "10470242501",
      "name": "CP Y12 Sem 2 (2017-2018)",
      "descriptionHeading": "CP Y12 Sem 2 (2017-2018)",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-01-10T04:44:37.437Z",
      "updateTime": "2018-08-20T07:00:37.992Z",
      "enrollmentCode": "alo9tef",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0NzAyNDI1MDFa",
      "teacherGroupEmail": "CP_Y12_Sem_2_2017_2018_teachers_9a85912d@hope.edu.kh",
      "courseGroupEmail": "CP_Y12_Sem_2_2017_2018_339a6da5@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfnJPMkwxbEE2NVc1aHhLWU5nQ193VFhDZGF3Qmc4bFV0cXk4RnQzNFRGSVk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom664d0cfb@group.calendar.google.com"
    },
    {
      "id": "10469214591",
      "name": "CP Y11 Sem 2 (2017-2018)",
      "descriptionHeading": "CP Y11 Sem 2 (2017-2018)",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-01-10T04:42:36.981Z",
      "updateTime": "2018-08-20T07:01:05.596Z",
      "enrollmentCode": "zwpa5s5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0NjkyMTQ1OTFa",
      "teacherGroupEmail": "CP_Y11_Sem_2_2017_2018_teachers_450d6378@hope.edu.kh",
      "courseGroupEmail": "CP_Y11_Sem_2_2017_2018_bf919a78@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfnlvb2tYd2VnZXFtRHVfWUVuVDBOems4Sy12Vy1NYXpldDZDOFc2aEpEN3c"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome1eb0da4@group.calendar.google.com"
    },
    {
      "id": "10469748371",
      "name": "CP Y10 Sem 2 (2017-2018)",
      "descriptionHeading": "CP Y10 Sem 2 (2017-2018)",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-01-10T04:39:30.861Z",
      "updateTime": "2018-08-20T07:00:44.986Z",
      "enrollmentCode": "z9teiad",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0Njk3NDgzNzFa",
      "teacherGroupEmail": "CP_Y10_Sem_2_2017_2018_teachers_7a5a529b@hope.edu.kh",
      "courseGroupEmail": "CP_Y10_Sem_2_2017_2018_3d4532ec@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfmUzT2d4bGRwbXJJZjNNRm54QVlmeFRBaHJNNVUyUk0yS1NBdUtFVDFBTlk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3485f1de@group.calendar.google.com"
    },
    {
      "id": "10469560896",
      "name": "CP Y9 Sem 2 (2017-2018)",
      "descriptionHeading": "CP Y9 Sem 2 (2017-2018)",
      "ownerId": "106362883448493695223",
      "creationTime": "2018-01-10T04:24:18.875Z",
      "updateTime": "2018-08-20T07:00:55.504Z",
      "enrollmentCode": "6l9y542",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0Njk1NjA4OTZa",
      "teacherGroupEmail": "CP_Y9_Sem_2_2017_2018_teachers_3abb4885@hope.edu.kh",
      "courseGroupEmail": "CP_Y9_Sem_2_2017_2018_755f142e@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfmVlRnJTOHZPNzZVdVBFYjJRalVtRmNRd1EzYy1FUEdPT1VhTC1LSWZhZWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom382a0954@group.calendar.google.com"
    },
    {
      "id": "10427034045",
      "name": "2021 IGCSE Maths Ext",
      "descriptionHeading": "2021 IGCSE Maths Ext",
      "ownerId": "112644773599177931542",
      "creationTime": "2018-01-07T09:20:49.440Z",
      "updateTime": "2018-08-17T07:18:48.239Z",
      "enrollmentCode": "tgj17q",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0MjcwMzQwNDVa",
      "teacherGroupEmail": "2021_IGCSE_Maths_Ext_teachers_66ab3922@hope.edu.kh",
      "courseGroupEmail": "2021_IGCSE_Maths_Ext_dbce2284@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fldHOUhmN3BGQThvYm1VamFWWm9ldjRBRVdqSjJQWW51MkdOZU1nTVBMSU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom42f0aa18@group.calendar.google.com"
    },
    {
      "id": "10426939484",
      "name": "11 SHES",
      "descriptionHeading": "11 SHES",
      "ownerId": "101283463079000616897",
      "creationTime": "2018-01-07T08:53:47.619Z",
      "updateTime": "2018-01-08T13:24:38.280Z",
      "enrollmentCode": "ajhrqnh",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTA0MjY5Mzk0ODRa",
      "teacherGroupEmail": "11_SHES_teachers_ac7e1555@hope.edu.kh",
      "courseGroupEmail": "11_SHES_1841cf45@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7KUeE9gLng_fmh3SndzbmdGV2xMVXNIQnRnWEd0SFNUdHRETXRLWUMxSVhYRzg2RlpmeG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome78a0485@group.calendar.google.com"
    },
    {
      "id": "10426907859",
      "name": "Y5 Integrated Studies 2017/18",
      "descriptionHeading": "Y5 Integrated Studies 2017/18",
      "ownerId": "108570494181753190812",
      "creationTime": "2018-01-07T08:33:39.703Z",
      "updateTime": "2018-01-07T08:33:38.922Z",
      "enrollmentCode": "s6ltj1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTA0MjY5MDc4NTla",
      "teacherGroupEmail": "Y5_Integrated_Studies_2017_18_teachers_22db1f9e@hope.edu.kh",
      "courseGroupEmail": "Y5_Integrated_Studies_2017_18_0132cb4c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-V1l1R60yLSfk95RXUweEFGUmlPNUV0UWttUm82ZGw2aXJWN255Q3N4aTBMQ3h0UjdwSWs"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom8fbd353f@group.calendar.google.com"
    },
    {
      "id": "10393813746",
      "name": "Y10 Maths",
      "descriptionHeading": "Y10 Maths",
      "ownerId": "107554112463094781867",
      "creationTime": "2018-01-03T09:54:20.619Z",
      "updateTime": "2018-08-13T18:44:43.796Z",
      "enrollmentCode": "cnme8r",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTAzOTM4MTM3NDZa",
      "teacherGroupEmail": "Y10_Maths_teachers_821c6603@hope.edu.kh",
      "courseGroupEmail": "Y10_Maths_2101acca@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmNaLS1UeGl2ek1jUllMSGpGWU1IMHJiSXFNdWJrQmoyQ0h1VDFjRUJDdDA"
      },
      "courseMaterialSets": [
        {
          "title": "0580 IGCSE Maths Syllabus for examination in 2018\n\nThis is the same as your paper document.",
          "materials": [
            {
              "link": {
                "url": "http://www.cambridgeinternational.org/images/203911-2017-2018-syllabus.pdf",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.cambridgeinternational.org/images/203911-2017-2018-syllabus.pdf&a=AIYkKU9JkxW8WrqVlr6OzkQiIZuJlwWLWg"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome9b84248@group.calendar.google.com"
    },
    {
      "id": "10275723783",
      "name": "Y12 HL IB Chemistry",
      "descriptionHeading": "Chemistry Y12",
      "ownerId": "106711321834093628256",
      "creationTime": "2017-12-14T01:57:59.794Z",
      "updateTime": "2017-12-14T02:01:54.766Z",
      "enrollmentCode": "weis71",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTAyNzU3MjM3ODNa",
      "teacherGroupEmail": "Chemistry_Y12_teachers_dde225db@hope.edu.kh",
      "courseGroupEmail": "Chemistry_Y12_efa114d1@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4hC7X-AATf-fmh2Zy1XYmVWS3MzTjBqaGJfQ3RtREh4WkxEdjJSbGZGMGM2UFI5UE1wWkU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom02382b8d@group.calendar.google.com"
    },
    {
      "id": "10021110556",
      "name": "Year 7 SOSE",
      "descriptionHeading": "Year 7 SOSE",
      "ownerId": "102003547718393718946",
      "creationTime": "2017-12-04T00:45:02.193Z",
      "updateTime": "2019-01-29T03:17:35.084Z",
      "enrollmentCode": "83eseh",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTAwMjExMTA1NTZa",
      "teacherGroupEmail": "Year_7_SOSE_teachers_04caf27e@hope.edu.kh",
      "courseGroupEmail": "Year_7_SOSE_a36736c7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfkN4OUw2cjR6VmdyRGk3ZklXUnBqNEVpYzduMTFMTWtjQWw3UW5tMWlxZ00"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2b4a233f@group.calendar.google.com"
    },
    {
      "id": "9552757291",
      "name": "VIA 2017-18",
      "section": "Year 9-10",
      "descriptionHeading": "VIA 2017-18",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-11-24T01:53:16.273Z",
      "updateTime": "2018-08-23T08:10:49.299Z",
      "enrollmentCode": "mvhdhff",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTU1Mjc1NzI5MVpa",
      "teacherGroupEmail": "VIA_2017_18_teachers_f899458f@hope.edu.kh",
      "courseGroupEmail": "VIA_2017_18_a91abd08@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfk9qTmQxajNGeHR4YTZOZGNTRHNlUHlELTc1WDEwUFNpRVVEeVRwNkxLaG8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1bca6b82@group.calendar.google.com"
    },
    {
      "id": "9482229876",
      "name": "Math 8(2)",
      "descriptionHeading": "Math 8(2)",
      "ownerId": "115587463545633093027",
      "creationTime": "2017-11-16T08:03:13.299Z",
      "updateTime": "2018-09-12T04:18:25.562Z",
      "enrollmentCode": "u2n1eo",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/OTQ4MjIyOTg3Nlpa",
      "teacherGroupEmail": "Math_8_2_teachers_22b5a3ec@hope.edu.kh",
      "courseGroupEmail": "Math_8_2_9057f072@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJfjJGal9TSFhmQ0IzYmNsZkNkT1FNQ3JDM3dmXzFPTFhxOHFmSDgzekJ0OEE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7d4b0bda@group.calendar.google.com"
    },
    {
      "id": "9482411170",
      "name": "TOK 11",
      "descriptionHeading": "TOK 11",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-11-16T08:03:05.716Z",
      "updateTime": "2018-04-03T07:05:06.183Z",
      "enrollmentCode": "7xze26",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/OTQ4MjQxMTE3MFpa",
      "teacherGroupEmail": "TOK_11_teachers_1d88e427@hope.edu.kh",
      "courseGroupEmail": "TOK_11_f3b78f7d@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfkw1am9mcm9Fb1NsNUZtSlIxQmV4N1dUanZzT01FY3ZQMW9YMURvQVc5Y1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd3829265@group.calendar.google.com"
    },
    {
      "id": "9480612750",
      "name": "HN12MathIBMathStudies",
      "descriptionHeading": "HNY12MathIBMathStudies",
      "ownerId": "104044394758901471275",
      "creationTime": "2017-11-16T07:56:51.072Z",
      "updateTime": "2017-11-16T08:27:13.947Z",
      "enrollmentCode": "0nttn4x",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTQ4MDYxMjc1MFpa",
      "teacherGroupEmail": "HNY12MathIBMathStudies_teachers_75530c5c@hope.edu.kh",
      "courseGroupEmail": "HNY12MathIBMathStudies_9112b7b8@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwv1AytYLh8GflltbjZ5MHA3UGt1U3RjS2NyWXZQYl9CcTVKZWlicjhKc1R2ZlRiWUxtUzg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3e8b0019@group.calendar.google.com"
    },
    {
      "id": "9480603383",
      "name": "HN11MathIBMathStudies",
      "descriptionHeading": "HNY11MathIBMathStudies",
      "ownerId": "104044394758901471275",
      "creationTime": "2017-11-16T07:56:13.942Z",
      "updateTime": "2017-11-16T08:30:26.566Z",
      "enrollmentCode": "5hxww77",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTQ4MDYwMzM4M1pa",
      "teacherGroupEmail": "HNY11MathIBMathStudies_teachers_77417d48@hope.edu.kh",
      "courseGroupEmail": "HNY11MathIBMathStudies_537d6b79@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwv1AytYLh8Gfm9FM1p0VVNyNzdrV3loOGNmQUtqNmJPdVZ2N0RMbHgwaklsVVBsOWVrUU0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9a8bb26d@group.calendar.google.com"
    },
    {
      "id": "9481799514",
      "name": "HN10MathIGCSECore",
      "descriptionHeading": "HNY10Math",
      "ownerId": "104044394758901471275",
      "creationTime": "2017-11-16T07:55:36.934Z",
      "updateTime": "2017-11-16T08:27:30.885Z",
      "enrollmentCode": "kctawpa",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTQ4MTc5OTUxNFpa",
      "teacherGroupEmail": "HNY10Math_teachers_4b45226a@hope.edu.kh",
      "courseGroupEmail": "HNY10Math_0e68707f@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwv1AytYLh8Gfk9JeW5VUkdpQWM5cFctc1JhbnNlUVhvYU5wTXZjRkJ2em8wTmhGWjgxTDQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom67c8b114@group.calendar.google.com"
    },
    {
      "id": "9481939010",
      "name": "HN06Math",
      "descriptionHeading": "HNY06Math",
      "ownerId": "104044394758901471275",
      "creationTime": "2017-11-16T07:55:01.518Z",
      "updateTime": "2017-11-16T08:27:37.808Z",
      "enrollmentCode": "a9cqzg3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTQ4MTkzOTAxMFpa",
      "teacherGroupEmail": "HNY06Math_teachers_9ceb10cb@hope.edu.kh",
      "courseGroupEmail": "HNY06Math_de090346@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwv1AytYLh8GflFwakY3dkUxcTY4UUFTOUZYNnZSSEFlSHl4cms4Z2hvVmtZOGlKMmdLRVE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb2602235@group.calendar.google.com"
    },
    {
      "id": "9482106597",
      "name": "HN09MathIGSCE",
      "descriptionHeading": "HN09Math",
      "ownerId": "104044394758901471275",
      "creationTime": "2017-11-16T07:54:09.168Z",
      "updateTime": "2017-11-16T08:25:38.263Z",
      "enrollmentCode": "g0rfcjx",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTQ4MjEwNjU5N1pa",
      "teacherGroupEmail": "HN09Math_teachers_49be2982@hope.edu.kh",
      "courseGroupEmail": "HN09Math_fe01cec2@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwv1AytYLh8Gfi1ub0lvRS1JWXVkNFhYUXEyQmdna2xuTXZTSHZPS0duT09GaHJxYURGTEk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom2dbbe5f2@group.calendar.google.com"
    },
    {
      "id": "9418268341",
      "name": "Writing Skills After School Class",
      "descriptionHeading": "Writing Skills After School Class",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-11-13T05:44:08.827Z",
      "updateTime": "2019-01-18T06:28:34.962Z",
      "enrollmentCode": "sq9phmd",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/OTQxODI2ODM0MVpa",
      "teacherGroupEmail": "Writing_Skills_After_School_Class_teachers_0cc26106@hope.edu.kh",
      "courseGroupEmail": "Writing_Skills_After_School_Class_b1fb00b8@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfkxJckQwbjF3NFBxQWJLb2N1VjB1ZjcxUXpqbzdkMUg2eEtYVjlaeVg1N2M"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7a648f5e@group.calendar.google.com"
    },
    {
      "id": "9411804686",
      "name": "Year 6 SOSE",
      "descriptionHeading": "Year 6 SOSE",
      "ownerId": "102003547718393718946",
      "creationTime": "2017-11-12T10:08:12.490Z",
      "updateTime": "2019-01-29T03:17:46.981Z",
      "enrollmentCode": "auw2kj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/OTQxMTgwNDY4Nlpa",
      "teacherGroupEmail": "Year_6_SOSE_teachers_731a3580@hope.edu.kh",
      "courseGroupEmail": "Year_6_SOSE_07740d47@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfllRTUxPY3M1OGM4alFnN0tMcEtWVDB2MlhDZnM1TUx0WjFKY1NuSmJFSms"
      },
      "courseMaterialSets": [
        {
          "title": "Ancient civilization",
          "materials": [
            {
              "driveFile": {
                "id": "1U7hzWsY-K9WOZffctFLi_a5A9tJtYglM",
                "alternateLink": "https://drive.google.com/open?id=1U7hzWsY-K9WOZffctFLi_a5A9tJtYglM"
              }
            },
            {
              "youTubeVideo": {
                "id": "IAQAAJo1fI0",
                "title": "The History of Civilization for Kids: How Civilization Began - FreeSchool",
                "alternateLink": "https://www.youtube.com/watch?v=IAQAAJo1fI0",
                "thumbnailUrl": "https://i.ytimg.com/vi/IAQAAJo1fI0/default.jpg"
              }
            },
            {
              "driveFile": {
                "id": "17f2QL9-w81EzaqrrhjNMhPhGnfsYvVqf",
                "alternateLink": "https://drive.google.com/open?id=17f2QL9-w81EzaqrrhjNMhPhGnfsYvVqf"
              }
            },
            {
              "youTubeVideo": {
                "id": "lESEb2-V1Sg",
                "title": "Mesopotamia - The Sumerians",
                "alternateLink": "https://www.youtube.com/watch?v=lESEb2-V1Sg",
                "thumbnailUrl": "https://i.ytimg.com/vi/lESEb2-V1Sg/default.jpg"
              }
            },
            {
              "driveFile": {
                "id": "1n1BtyO3xefLnzYaCq5DlPJo1GqLvpYif",
                "alternateLink": "https://drive.google.com/open?id=1n1BtyO3xefLnzYaCq5DlPJo1GqLvpYif"
              }
            },
            {
              "driveFile": {
                "id": "1IEpEFepvUrEyH5zeoTQX5KWy1L2EByPn",
                "alternateLink": "https://drive.google.com/open?id=1IEpEFepvUrEyH5zeoTQX5KWy1L2EByPn"
              }
            },
            {
              "driveFile": {
                "id": "1Oid4RnhLJgpyGpgwnOCEwaOJLFYDulcE",
                "alternateLink": "https://drive.google.com/open?id=1Oid4RnhLJgpyGpgwnOCEwaOJLFYDulcE"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma21202e8@group.calendar.google.com"
    },
    {
      "id": "9345187708",
      "name": "Y7 ESL",
      "descriptionHeading": "Y7 ESL",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-11-07T08:59:07.520Z",
      "updateTime": "2019-01-18T06:29:10.717Z",
      "enrollmentCode": "ucdcj79",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/OTM0NTE4NzcwOFpa",
      "teacherGroupEmail": "Y7_ESL_teachers_b79d2bce@hope.edu.kh",
      "courseGroupEmail": "Y7_ESL_e04be12a@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfmhOUmtZcndyemRMWGl3NmpSR3E2ZXdhbW12c2ItZ19OYjVQblJMS2IzRWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma2795a71@group.calendar.google.com"
    },
    {
      "id": "9344632078",
      "name": "Year 1 & 2",
      "descriptionHeading": "Year 1 & 2",
      "ownerId": "116578485452286869249",
      "creationTime": "2017-11-07T05:10:49.127Z",
      "updateTime": "2017-11-07T05:10:48.354Z",
      "enrollmentCode": "13f4w03",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/OTM0NDYzMjA3OFpa",
      "teacherGroupEmail": "Year_1_2_teachers_76f79c8c@hope.edu.kh",
      "courseGroupEmail": "Year_1_2_6e826686@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByPh_Mh6h4eMfmVLa0xFMUY3MU1RLVZnLU9IaE5RTEtncjdWN0tra3k0dk1LYkRaX3hPOE0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb03f314f@group.calendar.google.com"
    },
    {
      "id": "8598396382",
      "name": "Y2021 IGCSE Business Studies JA",
      "descriptionHeading": "IGCSE Business Studies",
      "ownerId": "102003547718393718946",
      "creationTime": "2017-10-11T00:11:08.962Z",
      "updateTime": "2019-01-29T03:15:43.302Z",
      "enrollmentCode": "u3nc1y",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/ODU5ODM5NjM4Mlpa",
      "teacherGroupEmail": "IGCSE_Business_Studies_teachers_f811807b@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Business_Studies_b2795110@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfml4cUE5MUxGeE1Td2NZRlR6ZjBKZWwwd1lRemU5ZlNORFdXaFEzQkRfMDg",
        "title": "IGCSE Business Studies",
        "alternateLink": "https://drive.google.com/drive/folders/0B6KfBVM7lPEbfml4cUE5MUxGeE1Td2NZRlR6ZjBKZWwwd1lRemU5ZlNORFdXaFEzQkRfMDg"
      },
      "courseMaterialSets": [
        {
          "title": "1.5 Business Objectives and Stakeholder Objectives",
          "materials": [
            {
              "link": {
                "url": "https://www.cosmeticsbusiness.com/news/article_page/The_Body_Shop_aims_to_be_the_worlds_most_ethical_and_sustainable_business/115595",
                "title": "The Body Shop aims to be \"the worlds most ethical and sustainable business\"",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cosmeticsbusiness.com/news/article_page/The_Body_Shop_aims_to_be_the_worlds_most_ethical_and_sustainable_business/115595&a=AIYkKU_V7zSA1F8LPGnZVVYsQnJJmmNpEg"
              }
            }
          ]
        },
        {
          "title": "1.3 Enterprise, business growth and size",
          "materials": [
            {
              "youTubeVideo": {
                "id": "6UhrIEUjtwI",
                "title": "Amazon's Retail Revolution Business Boomers   BBC Full documentary 2014",
                "alternateLink": "https://www.youtube.com/watch?v=6UhrIEUjtwI",
                "thumbnailUrl": "https://i.ytimg.com/vi/6UhrIEUjtwI/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://smallbusiness.chron.com/examples-backward-vertical-integration-strategies-14703.html",
                "title": "usersync.aspx (1�1)",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://smallbusiness.chron.com/examples-backward-vertical-integration-strategies-14703.html&a=AIYkKU-gPYTN-ugzyO3Ll6RZDxUXxw1gvQ"
              }
            },
            {
              "link": {
                "url": "http://smallbusiness.chron.com/example-companys-forward-integration-37601.html",
                "title": "usersync.aspx (1�1)",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://smallbusiness.chron.com/example-companys-forward-integration-37601.html&a=AIYkKU9_Kc2aIQi_5FgQsxf7etB-dpOvdQ"
              }
            },
            {
              "link": {
                "url": "http://www.bbc.com/news/business-39116672",
                "title": "Meg Whitman: Why I decided to shrink Hewlett-Packard - BBC News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.bbc.com/news/business-39116672&a=AIYkKU_J3TaJ-OJbvTLBea71f3UHV0eOUw"
              }
            },
            {
              "link": {
                "url": "http://www.globoforce.com/gfblog/2012/6-big-mergers-that-were-killed-by-culture/",
                "title": "6 Big Mergers That Were Killed by Culture",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.globoforce.com/gfblog/2012/6-big-mergers-that-were-killed-by-culture/&a=AIYkKU_zVwBRvwCyf-pFY5Pjsr45EghczQ"
              }
            },
            {
              "link": {
                "url": "http://www.businessinsider.com/why-small-businesses-fail-infographic-2017-8",
                "title": "    Why small businesses fail infographic - Business Insider\n",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.businessinsider.com/why-small-businesses-fail-infographic-2017-8&a=AIYkKU9kx30-U91TWfTgQLL2dVXOpcoMHQ"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4ad80975@group.calendar.google.com"
    },
    {
      "id": "8483322658",
      "name": "ICT Year 4",
      "descriptionHeading": "ITC Year 4",
      "ownerId": "108951450081736118120",
      "creationTime": "2017-10-04T06:30:10.841Z",
      "updateTime": "2018-08-24T12:54:47.049Z",
      "enrollmentCode": "yn6gxz",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/ODQ4MzMyMjY1OFpa",
      "teacherGroupEmail": "ITC_Year_4_teachers_c9607d8f@hope.edu.kh",
      "courseGroupEmail": "ITC_Year_4_4e677630@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfmJXRjZ5STdhVXBWWU44N3B6X2xtaXYxNEFiVkVPZ015RHBWeVVNQ2hvTlE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom5ffc1016@group.calendar.google.com"
    },
    {
      "id": "8399410820",
      "name": "HNO8Math",
      "descriptionHeading": "HNYO8Math",
      "ownerId": "104044394758901471275",
      "creationTime": "2017-09-29T01:54:49.899Z",
      "updateTime": "2017-11-16T08:29:37.188Z",
      "enrollmentCode": "qlxva54",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/ODM5OTQxMDgyMFpa",
      "teacherGroupEmail": "HNYO8Math_teachers_9765cfe1@hope.edu.kh",
      "courseGroupEmail": "HNYO8Math_57e9a6eb@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwv1AytYLh8GfktBYmI3eVh2a0pnR3NUZjFJdGtEaWJ5UEc4Y2w5RXVMSGFFb2pBSUU2dHc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom21052aec@group.calendar.google.com"
    },
    {
      "id": "8353671894",
      "name": "ICT Year 3",
      "descriptionHeading": "ICT Year 3",
      "ownerId": "106105345643542180841",
      "creationTime": "2017-09-27T07:35:10.463Z",
      "updateTime": "2018-08-24T12:54:58.102Z",
      "enrollmentCode": "eflg229",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/ODM1MzY3MTg5NFpa",
      "teacherGroupEmail": "ICT_Year_3_and_4_teachers_cabf104d@hope.edu.kh",
      "courseGroupEmail": "ICT_Year_3_and_4_f3cc1b72@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4Ay4SpSmoQlfnJfUF91bkc5bmxiRDByMFphMnRoVURkTmRtNUlMWEVGdGZvQWlKcFA1NE0"
      },
      "courseMaterialSets": [
        {
          "title": "Kidsmart UK",
          "materials": [
            {
              "link": {
                "url": "http://www.kidsmart.org.uk/beingsmart/",
                "title": "\n\tKidsmart: Being Smart RULES\n",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.kidsmart.org.uk/beingsmart/&a=AIYkKU9-9uOJIZGKMN05NRqlXxJJex7KCw"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom70a6827d@group.calendar.google.com"
    },
    {
      "id": "8353734152",
      "name": "ICT Year 5",
      "descriptionHeading": "ICT Year 5",
      "ownerId": "106105345643542180841",
      "creationTime": "2017-09-27T06:43:23.899Z",
      "updateTime": "2018-08-24T12:54:52.474Z",
      "enrollmentCode": "b1u9g1",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/ODM1MzczNDE1Mlpa",
      "teacherGroupEmail": "ICT_Year_5_teachers_fc2cc51e@hope.edu.kh",
      "courseGroupEmail": "ICT_Year_5_536aa5bf@hope.edu.kh",
      "teacherFolder": {
        "id": "0B4Ay4SpSmoQlfk9FbGN4MVNiX3FMMmtwNzBNMUhJZUdDRUFGY2piSEhYMGd2aTNKemp3YWM"
      },
      "courseMaterialSets": [
        {
          "title": "Kidsmart UK",
          "materials": [
            {
              "link": {
                "url": "http://www.kidsmart.org.uk/beingsmart/",
                "title": "\n\tKidsmart: Being Smart RULES\n",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.kidsmart.org.uk/beingsmart/&a=AIYkKU9-9uOJIZGKMN05NRqlXxJJex7KCw"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom2428e393@group.calendar.google.com"
    },
    {
      "id": "7747453223",
      "name": "Homeschool CS",
      "descriptionHeading": "Ratanakiri",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-09-20T22:55:48.822Z",
      "updateTime": "2017-10-04T01:26:16.312Z",
      "enrollmentCode": "e53rf9",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Nzc0NzQ1MzIyM1pa",
      "teacherGroupEmail": "Ratanakiri_teachers_4e4eee39@hope.edu.kh",
      "courseGroupEmail": "Ratanakiri_83fc46c1@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnBvY2hmdEZSUGt1NmxaV2ZBWWJmTlFZTkNOVzZXcWZLS1RaUUUzXzF6eE0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6c6b1949@group.calendar.google.com"
    },
    {
      "id": "7706210917",
      "name": "Y07 Science 2018",
      "descriptionHeading": "Y07 Science 2018",
      "ownerId": "100362126255417413706",
      "creationTime": "2017-09-19T12:29:21.930Z",
      "updateTime": "2018-08-16T06:16:06.196Z",
      "enrollmentCode": "mmpw0x",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzcwNjIxMDkxN1pa",
      "teacherGroupEmail": "Y07_Science_2018_teachers_9cd3dd97@hope.edu.kh",
      "courseGroupEmail": "Y07_Science_2018_338baae2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfmZnVm5Sdl9nSXZZU0lTZkxvVU41M002a2c1eWpET2tRdnJldmdtTXNPcmM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd177ede1@group.calendar.google.com"
    },
    {
      "id": "7631237326",
      "name": "SEHS 2016 -2018",
      "descriptionHeading": "SEHS 2016 -2018",
      "ownerId": "106622560452336024633",
      "creationTime": "2017-09-15T01:25:29.581Z",
      "updateTime": "2018-08-23T01:21:30.865Z",
      "enrollmentCode": "angmj7",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzYzMTIzNzMyNlpa",
      "teacherGroupEmail": "SEHS_2016_2018_teachers_e6ec5b2a@hope.edu.kh",
      "courseGroupEmail": "SEHS_2016_2018_80e99681@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxS6qtLdI0JLfndKSE5sZWFmMGo3V1loZ1FteVdzUkpyNXl6dnViLTBLR181YlJEaHV4QW8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom245972b8@group.calendar.google.com"
    },
    {
      "id": "7630687837",
      "name": "Y2019 Sports, Exercise and Health Science SL RK",
      "descriptionHeading": "Y2019 IB Sports, Exercise and Health Science SL RK",
      "ownerId": "106622560452336024633",
      "creationTime": "2017-09-15T01:23:49.618Z",
      "updateTime": "2019-02-02T05:21:32.470Z",
      "enrollmentCode": "eklhir",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzYzMDY4NzgzN1pa",
      "teacherGroupEmail": "Yr_11_SEHS_2017_2019_teachers_c345fa6c@hope.edu.kh",
      "courseGroupEmail": "Yr_11_SEHS_2017_2019_1f11fda9@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxS6qtLdI0JLfm1kUWlYN0VSZHkzWWp4dkJfUzRuVVhxSHVTOE5WTkFfcXQwM0dtR25XUlE",
        "title": "Yr 11 SEHS 2017 - 2019",
        "alternateLink": "https://drive.google.com/drive/folders/0BxS6qtLdI0JLfm1kUWlYN0VSZHkzWWp4dkJfUzRuVVhxSHVTOE5WTkFfcXQwM0dtR25XUlE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb2ce891e@group.calendar.google.com"
    },
    {
      "id": "7630512650",
      "name": "PE Yr 10",
      "descriptionHeading": "PE Yr 10",
      "ownerId": "106622560452336024633",
      "creationTime": "2017-09-15T01:20:56.611Z",
      "updateTime": "2018-08-23T01:27:48.378Z",
      "enrollmentCode": "tpgukng",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzYzMDUxMjY1MFpa",
      "teacherGroupEmail": "PE_Yr_10_teachers_87a38b2c@hope.edu.kh",
      "courseGroupEmail": "PE_Yr_10_2de19b89@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxS6qtLdI0JLfk8tM2E3a0pmeXJRcVllVzV0REZtQ3pfSmZCdHRlMEJHSUxfdUt6ZVd6Ym8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfcdbd401@group.calendar.google.com"
    },
    {
      "id": "7631045087",
      "name": "PE Yr 9",
      "descriptionHeading": "PE Yr 9",
      "ownerId": "106622560452336024633",
      "creationTime": "2017-09-15T01:20:27.934Z",
      "updateTime": "2018-08-23T01:27:54.066Z",
      "enrollmentCode": "nj77zf",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzYzMTA0NTA4N1pa",
      "teacherGroupEmail": "PE_Yr_9_teachers_55cba89b@hope.edu.kh",
      "courseGroupEmail": "PE_Yr_9_6f8d0e1a@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxS6qtLdI0JLfmVqNm1uVjVkWExyZHBQZjBfZl93dlNncDFiNnJfbzFwaDZiVUR4c2tuT0k"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0b711150@group.calendar.google.com"
    },
    {
      "id": "7630821299",
      "name": "PE IGCSE 2017 - 2019",
      "descriptionHeading": "IGCSE PE",
      "description": "For Year 9 and 10 IGCSE PE",
      "ownerId": "106622560452336024633",
      "creationTime": "2017-09-15T01:15:02.687Z",
      "updateTime": "2018-08-23T01:37:05.959Z",
      "enrollmentCode": "azqfsp",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzYzMDgyMTI5OVpa",
      "teacherGroupEmail": "2017_2019_IGCSE_PE_teachers_da42fc31@hope.edu.kh",
      "courseGroupEmail": "2017_2019_IGCSE_PE_b34df0d0@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxS6qtLdI0JLfm11Tnd1ZF9RckJHVTBmREZTT0xCRGlJT2l4UHFTX2pSeWdZaGpYQk5pTzQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome1508c0f@group.calendar.google.com"
    },
    {
      "id": "7555226729",
      "name": "Volleyball Highschool",
      "descriptionHeading": "Volleyball Highschool",
      "ownerId": "105666599265309194719",
      "creationTime": "2017-09-12T02:14:45.777Z",
      "updateTime": "2017-09-12T02:18:46.778Z",
      "enrollmentCode": "5vag0z4",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzU1NTIyNjcyOVpa",
      "teacherGroupEmail": "Volleyball_Highschool_teachers_79ec205e@hope.edu.kh",
      "courseGroupEmail": "Volleyball_Highschool_32b19919@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-fktQVUlRLUJXVjZLbW9PMk1MSEdSUlRCMVR2OVdrblMxUmhYdHh3TlRpYm8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomce8caa3e@group.calendar.google.com"
    },
    {
      "id": "7210511442",
      "name": "Y7 CL & Devotions",
      "descriptionHeading": "HNY07 Pastoral, CL & Devotions",
      "ownerId": "117957340856753443265",
      "creationTime": "2017-08-30T01:23:16.577Z",
      "updateTime": "2018-08-13T18:45:35.582Z",
      "enrollmentCode": "8tsai",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzIxMDUxMTQ0Mlpa",
      "teacherGroupEmail": "Devotion_Y7_teachers_86465ecb@hope.edu.kh",
      "courseGroupEmail": "Devotion_Y7_9c7efadd@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fjQtUV9kQVpsRWJEcVE3ci1OSW44R0dIUWlGRnFtdWdsOHNvSmRwdE4tcGM"
      },
      "courseMaterialSets": [
        {
          "title": "Y7 Devotions 2017-18",
          "materials": [
            {
              "driveFile": {
                "id": "1QWrao_uQC_FMO3HcU7Jsz7KCTrwSn5fR2bM0hlKLLps",
                "alternateLink": "https://drive.google.com/open?id=1QWrao_uQC_FMO3HcU7Jsz7KCTrwSn5fR2bM0hlKLLps"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb62a589d@group.calendar.google.com"
    },
    {
      "id": "7191052780",
      "name": "Y6 ESL class",
      "descriptionHeading": "Y6 after school ESL class",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-08-29T02:46:53.918Z",
      "updateTime": "2019-01-15T02:02:14.967Z",
      "enrollmentCode": "uyqc41",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE5MTA1Mjc4MFpa",
      "teacherGroupEmail": "Y6_ESL_after_school_ESL_class_teachers_eed4e736@hope.edu.kh",
      "courseGroupEmail": "Y6_ESL_after_school_ESL_class_a3f6434a@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfi05RTk1TkUyUnRveEtiYW5uMWJlT0lFQ3dGaEhxOXc5YnJGLU5rT0ZsUWc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomab040b34@group.calendar.google.com"
    },
    {
      "id": "7191108437",
      "name": "Y8 ESL",
      "descriptionHeading": "Y8 ESL",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-08-29T02:43:20.500Z",
      "updateTime": "2019-01-18T06:29:04.610Z",
      "enrollmentCode": "d3xj7hi",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE5MTEwODQzN1pa",
      "teacherGroupEmail": "Y8_ESL_teachers_8315e887@hope.edu.kh",
      "courseGroupEmail": "Y8_ESL_e3d69102@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfjRUdjV4Z21PZ1BIMUQtdEs0cG9VeU43Tnc1OTR6cWZpNkNWRGdudlN1U0k"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom089dd8f6@group.calendar.google.com"
    },
    {
      "id": "7165550073",
      "name": "Yr 6B CP",
      "descriptionHeading": "Yr 6B CP",
      "description": "Christian Perspectives",
      "room": "S24",
      "ownerId": "104277044188959221650",
      "creationTime": "2017-08-26T08:31:53.339Z",
      "updateTime": "2017-08-26T11:27:18.390Z",
      "enrollmentCode": "mnu4f6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzE2NTU1MDA3M1pa",
      "teacherGroupEmail": "Yr_6B_CP_teachers_372bd16e@hope.edu.kh",
      "courseGroupEmail": "Yr_6B_CP_e2a269c5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3k4xCcevmexfjlkaVVKVGJVel9qci0zdU9HWUlqV1RKLXpneWw0cHI1TWRBWEYyb2h3aFU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4952e619@group.calendar.google.com"
    },
    {
      "id": "7165617920",
      "name": "Yr 6A CP",
      "descriptionHeading": "Yr 6A CP",
      "description": "Christian Perspectives",
      "room": "S24",
      "ownerId": "104277044188959221650",
      "creationTime": "2017-08-26T08:26:04.948Z",
      "updateTime": "2017-08-26T11:26:44.995Z",
      "enrollmentCode": "bfpmc9r",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzE2NTYxNzkyMFpa",
      "teacherGroupEmail": "Yr_6A_CP_teachers_7357cbb2@hope.edu.kh",
      "courseGroupEmail": "Yr_6A_CP_9642de34@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3k4xCcevmexflJYYjZlakQwLTE1am5yVl96cFBpTFRuaERlZzN1QVNldUNjVUo4OV9nOUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomacbb38ba@group.calendar.google.com"
    },
    {
      "id": "7164656155",
      "name": "Yr 7 CP",
      "descriptionHeading": "Yr 7 CP",
      "description": "Christian Perspectives",
      "room": "S24",
      "ownerId": "104277044188959221650",
      "creationTime": "2017-08-26T01:58:11.920Z",
      "updateTime": "2017-08-26T11:28:12.457Z",
      "enrollmentCode": "bqqou9",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzE2NDY1NjE1NVpa",
      "teacherGroupEmail": "Yr_7_CP_teachers_fc57470a@hope.edu.kh",
      "courseGroupEmail": "Yr_7_CP_07cfd288@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3k4xCcevmexfmNQdGdneUdab3hSQW5NeVJDb1Z0aldaZDJGNE9aZjR6TTFySFdHTVBjcTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7505d06b@group.calendar.google.com"
    },
    {
      "id": "7148690231",
      "name": "Year 10 ENGLISH LITERATURE",
      "descriptionHeading": "Year 10 ENGLISH LITERATURE",
      "ownerId": "110627498288637945705",
      "creationTime": "2017-08-25T04:36:32.362Z",
      "updateTime": "2018-08-20T02:01:58.962Z",
      "enrollmentCode": "903m34",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE0ODY5MDIzMVpa",
      "teacherGroupEmail": "Year_10_ENGLISH_LITERATURE_teachers_24435a86@hope.edu.kh",
      "courseGroupEmail": "Year_10_ENGLISH_LITERATURE_b7299a52@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrflFEVU1ITVdhTVRyZGhSejJ6WE8zbkdSbkpMakc4M0x1OXpyYkpuUFFZeHM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomaad36113@group.calendar.google.com"
    },
    {
      "id": "7149235233",
      "name": "Year 10 ENGLISH LANGUAGE",
      "descriptionHeading": "Year 10 ENGLISH LANGUAGE",
      "ownerId": "110627498288637945705",
      "creationTime": "2017-08-25T04:32:35.601Z",
      "updateTime": "2018-10-17T02:05:47.058Z",
      "enrollmentCode": "1qwjcu8",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE0OTIzNTIzM1pa",
      "teacherGroupEmail": "Year_10_ENGLISH_LANGUAGE_teachers_8f319a53@hope.edu.kh",
      "courseGroupEmail": "Year_10_ENGLISH_LANGUAGE_cfb84d24@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfkswU2tSWkFndlhHb0ZHTDh4ZlpLOXFwZnJYeUp4aXhyZ0ZPUHNGZXlCSjg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1c8fddab@group.calendar.google.com"
    },
    {
      "id": "7149905266",
      "name": "Year 10 GP",
      "descriptionHeading": "Year 10 GP",
      "ownerId": "110627498288637945705",
      "creationTime": "2017-08-25T04:30:22.954Z",
      "updateTime": "2018-08-20T02:02:21.924Z",
      "enrollmentCode": "mpfbudw",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE0OTkwNTI2Nlpa",
      "teacherGroupEmail": "Year_10_GP_teachers_abbc5ef3@hope.edu.kh",
      "courseGroupEmail": "Year_10_GP_7ea82e08@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfjdiektWQlVsb0lRYmxJalNCS1JtUTFoSU9kQUhTcVZNdzVLbDB5UDQ2bjA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomeb44b881@group.calendar.google.com"
    },
    {
      "id": "7150172154",
      "name": "Year 9 GP",
      "descriptionHeading": "Year 9 GP",
      "ownerId": "110627498288637945705",
      "creationTime": "2017-08-25T04:14:50.016Z",
      "updateTime": "2018-08-20T02:02:40.613Z",
      "enrollmentCode": "vy2zrm8",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE1MDE3MjE1NFpa",
      "teacherGroupEmail": "Year_9_GP_teachers_ce1d86af@hope.edu.kh",
      "courseGroupEmail": "Year_9_GP_c6f29694@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrflpHSjl3MEpEdmppOEtQbjBPVVBYM2JZWnVsak9qZUJxMHBBN3ZlNzAxTFE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom40da375c@group.calendar.google.com"
    },
    {
      "id": "7150094760",
      "name": "Year 9 ENGLISH LITERATURE",
      "descriptionHeading": "Year 9 ENGLISH LITERATURE",
      "ownerId": "110627498288637945705",
      "creationTime": "2017-08-25T03:44:16.503Z",
      "updateTime": "2018-08-20T02:05:30.988Z",
      "enrollmentCode": "53qmtw",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE1MDA5NDc2MFpa",
      "teacherGroupEmail": "Year_9_ENGLISH_LITERATURE_teachers_969b009e@hope.edu.kh",
      "courseGroupEmail": "Year_9_ENGLISH_LITERATURE_924c7a56@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfl84cllFWExrNzhBejhQY29iVmJ2ZllWNjVaaFM2SXQ1QkNuSWZoZmdVZjg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4885c10b@group.calendar.google.com"
    },
    {
      "id": "7147639698",
      "name": "Year 9 ENGLISH LANGUAGE",
      "descriptionHeading": "Year 9 ENGLISH LANGUAGE",
      "ownerId": "110627498288637945705",
      "creationTime": "2017-08-25T02:45:24.121Z",
      "updateTime": "2018-08-20T02:05:51.977Z",
      "enrollmentCode": "jxyjsfm",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE0NzYzOTY5OFpa",
      "teacherGroupEmail": "Year_9_ENGLISH_LANGUAGE_teachers_38eac966@hope.edu.kh",
      "courseGroupEmail": "Year_9_ENGLISH_LANGUAGE_7a4ecf67@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfk96V1JFelhtRlg2WkJPSTRBUldhRmFPT2tsUDdtb2Z3UVZiSFEyRTNRaXM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom90221046@group.calendar.google.com"
    },
    {
      "id": "7149063258",
      "name": "Y10 IGCSE Art (2017-2018)",
      "descriptionHeading": "Y10 IGCSE Art",
      "ownerId": "112022231024540234956",
      "creationTime": "2017-08-25T00:59:46.418Z",
      "updateTime": "2018-09-12T04:04:52.456Z",
      "enrollmentCode": "6xgxvm",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzE0OTA2MzI1OFpa",
      "teacherGroupEmail": "Y10_IGCSE_Art_teachers_032bb9fa@hope.edu.kh",
      "courseGroupEmail": "Y10_IGCSE_Art_6a2052d0@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fkpVaGxCc3dKVDVHeXdjclItMXh5cF9vNUxWLUJkMDNPTWNfOGsyTno2bWM"
      },
      "courseMaterialSets": [
        {
          "title": "High school Art - Sketchbook Examples & Teacher Tips",
          "materials": [
            {
              "link": {
                "url": "http://www.studentartguide.com/",
                "title": "Welcome",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.studentartguide.com/&a=AIYkKU_lMmQ9oxeSq0iK-EoUm0M1Q53dPg"
              }
            }
          ]
        },
        {
          "title": "IGCSE Art Assessment Objectives & Grading Rubric",
          "materials": [
            {
              "driveFile": {
                "id": "0ByTPkAZtJDZ5TWVyS0w1eTIxTW8",
                "alternateLink": "https://drive.google.com/open?id=0ByTPkAZtJDZ5TWVyS0w1eTIxTW8"
              }
            }
          ]
        },
        {
          "title": "Syllabus IGCSE Art & Design 0400 (2017-2019)",
          "materials": [
            {
              "driveFile": {
                "id": "0ByTPkAZtJDZ5UUhWR2k3ZTdTMGs",
                "alternateLink": "https://drive.google.com/open?id=0ByTPkAZtJDZ5UUhWR2k3ZTdTMGs"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1736f907@group.calendar.google.com"
    },
    {
      "id": "7132667587",
      "name": "Theory of Knowledge",
      "section": "Year 12",
      "descriptionHeading": "TOK 12 (2017-2018)",
      "room": "S24",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-24T09:27:28.862Z",
      "updateTime": "2019-01-29T05:56:35.433Z",
      "enrollmentCode": "9mtwqfv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMjY2NzU4N1pa",
      "teacherGroupEmail": "TOK_11_2017_2018_teachers_67e8c643@hope.edu.kh",
      "courseGroupEmail": "TOK_11_2017_2018_d71ef986@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2flJ2ZmEyNmZRRHNVdXBlS3E1V2wwRDlkME1ZVmFFRFo4ZlltSW5WdkpVbTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd4ac4e69@group.calendar.google.com"
    },
    {
      "id": "7131539671",
      "name": "Y2019 IB Mathematics SL LK",
      "descriptionHeading": "2019 IB Maths SL",
      "ownerId": "112644773599177931542",
      "creationTime": "2017-08-24T08:40:04.342Z",
      "updateTime": "2019-01-08T08:14:48.962Z",
      "enrollmentCode": "vde7nu",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMTUzOTY3MVpa",
      "teacherGroupEmail": "2019_IB_Maths_SL_teachers_c79d86c1@hope.edu.kh",
      "courseGroupEmail": "2019_IB_Maths_SL_6b4465d0@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fm9XOG9lZHRvc1dOMUFoWHZTUS1hQlhOdm5BVV9VX3BSUXRnSEppaWJkLW8",
        "title": "2019 IB Maths SL",
        "alternateLink": "https://drive.google.com/drive/folders/0B6aeU8sX9ah_fm9XOG9lZHRvc1dOMUFoWHZTUS1hQlhOdm5BVV9VX3BSUXRnSEppaWJkLW8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8812873b@group.calendar.google.com"
    },
    {
      "id": "7132847935",
      "name": "Practice",
      "descriptionHeading": "Practice",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-08-24T08:32:58.790Z",
      "updateTime": "2017-08-24T08:32:57.718Z",
      "enrollmentCode": "pkgnlvk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMjg0NzkzNVpa",
      "teacherGroupEmail": "Practice_teachers_5b3b326a@hope.edu.kh",
      "courseGroupEmail": "Practice_3612c98e@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfm5ITW1uSXQwT2pOUU5NYnBBQm15T1E3YU12SjlsdUhqVW1TQV9LODEtME0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc819d284@group.calendar.google.com"
    },
    {
      "id": "7132032643",
      "name": "Y12 IB VA (2017-2018)",
      "descriptionHeading": "Y12 IB Visual Art",
      "description": "Visual arts (From: IB Visual Arts Guide 2017)\n\nThe visual arts are an integral part of everyday life, permeating all levels of human creativity, expression, communication and understanding. They range from traditional forms embedded in local and wider communities, societies and cultures, to the varied and divergent practices associated with new, emerging and contemporary forms of visual language. They may have sociopolitical impact as well as ritual, spiritual, decorative and functional value; they can be persuasive and subversive in some instances, enlightening and uplifting in others. We celebrate the visual arts not only in the way we create images and objects, but also in the way we appreciate, enjoy, respect and respond to the practices of art-making by others from around the world. Theories and practices in visual arts are dynamic and ever-changing, and connect many areas of knowledge and human experience through individual and collaborative exploration, creative production and critical interpretation.\n\nThe IB Diploma Programme visual arts course encourages students to challenge their own creative and cultural expectations and boundaries. It is a thought-provoking course in which students develop analytical skills in problem-solving and divergent thinking, while working towards technical proficiency and confidence as art-makers. In addition to exploring and comparing visual arts from different perspectives and in different contexts, students are expected to engage in, experiment with and critically reflect upon a wide range of contemporary practices and media. The course is designed for students who want to go on to study visual arts in higher education as well as for those who are seeking lifelong enrichment through visual arts.\n\nSupporting the International Baccalaureate mission statement and learner profile, the course encourages students to actively explore the visual arts within and across a variety of local, regional, national, international and intercultural contexts. Through inquiry, investigation, reflection and creative application, visual arts students develop an appreciation for the expressive and aesthetic diversity in the world around them, becoming critically informed makers and consumers of visual culture.\n\nThe arts aims (From: IB Visual Arts Guide 2017)\nThe aims of the arts subjects are to enable students to:\n\n1. enjoy lifelong engagement with the arts\n2. become informed, reflective and critical practitioners in the arts\n3. understand the dynamic and changing nature of the arts\n4. explore and value the diversity of the arts across time, place and cultures\n5. express ideas with confidence and competence\n6. develop perceptual and analytical skills.\n\nVisual arts aims (From: IB Visual Arts Guide 2017)\nIn addition, the aims of the visual arts course at SL and HL are to enable students to:\n\n7. make artwork that is influenced by personal and cultural contexts\n8. become informed and critical observers and makers of visual culture and media\n9. develop skills, techniques and processes in order to communicate concepts and ideas.",
      "room": "S1",
      "ownerId": "112022231024540234956",
      "creationTime": "2017-08-24T08:19:28.130Z",
      "updateTime": "2018-10-04T02:45:03.294Z",
      "enrollmentCode": "rtjaxkf",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzEzMjAzMjY0M1pa",
      "teacherGroupEmail": "Y12_IB_Visual_Art_teachers_7d39d2f3@hope.edu.kh",
      "courseGroupEmail": "Y12_IB_Visual_Art_7e9a159c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fjVVZUdvR193UWg5R3ZDaXVNLTRrYVBWbExGUHZVQ0dxWnFqUHFrYThKVmc"
      },
      "courseMaterialSets": [
        {
          "title": "Y11/12 IB VA HL Assessment Overview",
          "materials": [
            {
              "driveFile": {
                "id": "1w_t7sDR4ZiGP-jLZTabG60IMMZXt7dH7Z5WDZaKc7k4",
                "alternateLink": "https://drive.google.com/open?id=1w_t7sDR4ZiGP-jLZTabG60IMMZXt7dH7Z5WDZaKc7k4"
              }
            }
          ]
        },
        {
          "title": "IB VA Assessment Venn Diagram",
          "materials": [
            {
              "driveFile": {
                "id": "0ByTPkAZtJDZ5bmVqRE5WUmlwTkk",
                "alternateLink": "https://drive.google.com/open?id=0ByTPkAZtJDZ5bmVqRE5WUmlwTkk"
              }
            }
          ]
        },
        {
          "title": "IB Visual Arts Guide 2017",
          "materials": [
            {
              "driveFile": {
                "id": "0ByTPkAZtJDZ5dlhuaFZMM2tQQ1U",
                "alternateLink": "https://drive.google.com/open?id=0ByTPkAZtJDZ5dlhuaFZMM2tQQ1U"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb93adffe@group.calendar.google.com"
    },
    {
      "id": "7132314885",
      "name": "Y2021 IGCSE DRAMA JLK",
      "section": "Year 10",
      "descriptionHeading": "Yr 10 Drama with Ms Jeri-Lee",
      "description": "Drama with Ms Jeri-Lee",
      "ownerId": "111511272712109869545",
      "creationTime": "2017-08-24T08:08:44.271Z",
      "updateTime": "2019-01-31T09:37:04.804Z",
      "enrollmentCode": "2qd9k9z",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMjMxNDg4NVpa",
      "teacherGroupEmail": "Yr_10_Drama_with_Ms_Jeri_Lee_teachers_fcd7e292@hope.edu.kh",
      "courseGroupEmail": "Yr_10_Drama_with_Ms_Jeri_Lee_c3df2dd9@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2bblCzLbPVOfnBtZzRjUXBXakRYMElMMFNWNmNoNGNCREdLNGhyV2dSWnhpTkVQb09EZTA",
        "title": "Yr 10 Drama with Ms Jeri-Lee",
        "alternateLink": "https://drive.google.com/drive/folders/0B2bblCzLbPVOfnBtZzRjUXBXakRYMElMMFNWNmNoNGNCREdLNGhyV2dSWnhpTkVQb09EZTA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0d09287d@group.calendar.google.com"
    },
    {
      "id": "7132092376",
      "name": "Fake Class",
      "section": "Teachers",
      "descriptionHeading": "Fake Class Teachers",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-24T08:04:54.278Z",
      "updateTime": "2017-08-28T06:54:23.250Z",
      "enrollmentCode": "kglnsa",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzEzMjA5MjM3Nlpa",
      "teacherGroupEmail": "Fake_Class_Teachers_teachers_31bf1a46@hope.edu.kh",
      "courseGroupEmail": "Fake_Class_Teachers_28003d75@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfkhXSjhocVlhUWJ3bE1nRkxpM29qc1Z5aldsajdtdS1xYVhYOWdwRllPNkE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8c6d38ca@group.calendar.google.com"
    },
    {
      "id": "7132040011",
      "name": "YR 8 CP",
      "descriptionHeading": "YR 8 CP",
      "description": "Christian Perspectives",
      "room": "S24",
      "ownerId": "104277044188959221650",
      "creationTime": "2017-08-24T08:03:09.667Z",
      "updateTime": "2017-08-26T11:28:37.325Z",
      "enrollmentCode": "dnmso5x",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMjA0MDAxMVpa",
      "teacherGroupEmail": "YR_8_teachers_a5055b8a@hope.edu.kh",
      "courseGroupEmail": "YR_8_185067cf@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3k4xCcevmexfkxQUGJBOE1KMUtxaDBXVjNJYzdiTWVNMExQakttVmVsSG9ESW1KSGZicXc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma102bc46@group.calendar.google.com"
    },
    {
      "id": "7131869748",
      "name": "Year 9 Literature with Miss Fiona",
      "descriptionHeading": "Year 9 Literature with Miss Fiona",
      "ownerId": "106412644954351339427",
      "creationTime": "2017-08-24T07:59:49.674Z",
      "updateTime": "2017-08-24T07:59:48.817Z",
      "enrollmentCode": "hm0sa7d",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMTg2OTc0OFpa",
      "teacherGroupEmail": "Year_9_Literature_with_Miss_Fiona_teachers_5d915e0d@hope.edu.kh",
      "courseGroupEmail": "Year_9_Literature_with_Miss_Fiona_89c78dde@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxINKwxqyzJJflg1Y2pFTk9nalRVVmplbXpLMXp5VmRxampwemsxR1VQMC1zeGo2bno0aWc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfb3185d3@group.calendar.google.com"
    },
    {
      "id": "7130464648",
      "name": "Year 10 Literature with Miss Fiona",
      "descriptionHeading": "Year 10 Literature with Miss Fiona",
      "ownerId": "106412644954351339427",
      "creationTime": "2017-08-24T07:57:47.047Z",
      "updateTime": "2017-08-24T07:59:00.979Z",
      "enrollmentCode": "wq8kcs",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMDQ2NDY0OFpa",
      "teacherGroupEmail": "Year_10_Literature_with_Miss_Fiona_teachers_f0c9c0b4@hope.edu.kh",
      "courseGroupEmail": "Year_10_Literature_with_Miss_Fiona_4fff96d7@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxINKwxqyzJJflliSTM0SUdpYjloQXhWenlPSU80Ty1rcndXanN2LU9DTVZpRTBKRXR6QVk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom81c45028@group.calendar.google.com"
    },
    {
      "id": "7132028264",
      "name": "Year 8 English with Miss Fiona",
      "descriptionHeading": "Year 8 English with Miss Fiona",
      "ownerId": "106412644954351339427",
      "creationTime": "2017-08-24T07:56:55.933Z",
      "updateTime": "2017-09-25T01:50:28.833Z",
      "enrollmentCode": "589dj89",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMjAyODI2NFpa",
      "teacherGroupEmail": "Year_8_English_with_Miss_Fiona_teachers_c1b28a32@hope.edu.kh",
      "courseGroupEmail": "Year_8_English_with_Miss_Fiona_09eef6a2@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxINKwxqyzJJfnh5dHdqRW1BQ1JsQmZkTHI5SHk3NzBfalJ2dEFPNHBDckdEVXFRTWNzdFE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomed1fe3fe@group.calendar.google.com"
    },
    {
      "id": "7132336719",
      "name": "Y2019 IB Physics HL LK",
      "descriptionHeading": "2019 IB Physics HL",
      "ownerId": "112644773599177931542",
      "creationTime": "2017-08-24T07:51:57.587Z",
      "updateTime": "2019-01-08T08:14:20.890Z",
      "enrollmentCode": "i55g3vc",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMjMzNjcxOVpa",
      "teacherGroupEmail": "2019_IB_Physics_HL_teachers_08729dd6@hope.edu.kh",
      "courseGroupEmail": "2019_IB_Physics_HL_559c73ce@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fm9YYmJoUlNQdEZrNTBnYU9BOEd3eHVkSURqdFB5UnBHMlhqNXNMV0xaaEk",
        "title": "2019 IB Physics HL",
        "alternateLink": "https://drive.google.com/drive/folders/0B6aeU8sX9ah_fm9YYmJoUlNQdEZrNTBnYU9BOEd3eHVkSURqdFB5UnBHMlhqNXNMV0xaaEk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomcdf30d48@group.calendar.google.com"
    },
    {
      "id": "7131662782",
      "name": "Y11 English B Literature - Ms Maria",
      "descriptionHeading": "Y11 English B Literature - Ms Maria",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-08-24T06:05:48.002Z",
      "updateTime": "2019-01-18T06:28:55.492Z",
      "enrollmentCode": "yirv2za",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzEzMTY2Mjc4Mlpa",
      "teacherGroupEmail": "Y11_English_B_Literature_Ms_Maria_teachers_9022b100@hope.edu.kh",
      "courseGroupEmail": "Y11_English_B_Literature_Ms_Maria_09e9f76b@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJflhhLUZPUTFHSi1HckFHV051c1UzZGlQSFNYd1oyTk1Kck1OTlVFN0N2YTQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9fe25f54@group.calendar.google.com"
    },
    {
      "id": "7131793543",
      "name": "Y10 English Language - Ms Maria",
      "descriptionHeading": "Y10 English Language - Ms Maria",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-08-24T06:01:57.806Z",
      "updateTime": "2019-01-18T06:28:25.357Z",
      "enrollmentCode": "9wzw2u",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzEzMTc5MzU0M1pa",
      "teacherGroupEmail": "Y10_English_Language_Ms_Maria_teachers_75400c01@hope.edu.kh",
      "courseGroupEmail": "Y10_English_Language_Ms_Maria_625cbdfd@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfnU5Mmxqdld5aXMtTGdpRzNadFFqS3JXeURxci1PS2cySFlSNnVGbDJxRGM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomefcf78bb@group.calendar.google.com"
    },
    {
      "id": "7130289763",
      "name": "Y6 English - Ms Maria",
      "descriptionHeading": "Y6 English - Ms Maria",
      "ownerId": "115973731579234221936",
      "creationTime": "2017-08-24T05:56:58.881Z",
      "updateTime": "2019-01-18T06:28:44.516Z",
      "enrollmentCode": "6c0y97u",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzEzMDI4OTc2M1pa",
      "teacherGroupEmail": "Y6_English_Ms_Maria_teachers_291473fb@hope.edu.kh",
      "courseGroupEmail": "Y6_English_Ms_Maria_bc7515ef@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfmwwOFItbFc3b2RwZTFRU3F0cEZnaGk4djdjOWFiZjNVUEZHMEhiRThMNkk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome47a79a2@group.calendar.google.com"
    },
    {
      "id": "7130333324",
      "name": "PE Y6",
      "descriptionHeading": "PE Y6",
      "ownerId": "105666599265309194719",
      "creationTime": "2017-08-24T01:56:35.422Z",
      "updateTime": "2017-08-24T01:56:51.951Z",
      "enrollmentCode": "qq4sq7",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMDMzMzMyNFpa",
      "teacherGroupEmail": "PE_Y6_teachers_66b8f22c@hope.edu.kh",
      "courseGroupEmail": "PE_Y6_9149bb08@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-fjRHRWhuTk9Nc2taX25rSDh3eTF5Skh3ckRtSFlBaVhKazFLMGx0YTAyems"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfb03f7dd@group.calendar.google.com"
    },
    {
      "id": "7130396673",
      "name": "Y6 Maths AD",
      "descriptionHeading": "6B",
      "ownerId": "105666599265309194719",
      "creationTime": "2017-08-24T01:46:46.912Z",
      "updateTime": "2018-03-22T06:30:45.941Z",
      "enrollmentCode": "xks31j",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzEzMDM5NjY3M1pa",
      "teacherGroupEmail": "6B_teachers_782dfc0d@hope.edu.kh",
      "courseGroupEmail": "6B_642503b5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-flA5V1dDUVo0RjFid01BRlY5WUQ4ZjFHWU1xMk1SYkl3a2Q5ZjJQaC1JV3c"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf327d317@group.calendar.google.com"
    },
    {
      "id": "7114527128",
      "name": "Y8 ICT",
      "descriptionHeading": "HNY08 ICT",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-23T03:30:46.605Z",
      "updateTime": "2018-08-13T18:43:50.556Z",
      "enrollmentCode": "z193v3",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzExNDUyNzEyOFpa",
      "teacherGroupEmail": "HNY08_ICT_teachers_6e125ecb@hope.edu.kh",
      "courseGroupEmail": "HNY08_ICT_17db1d4c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmFLQjBvcHI4NG5MSnV1eW5rblV0eTVZY0hfUVRBcEZnaEtpWkx4dzloN0k"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2790b89a@group.calendar.google.com"
    },
    {
      "id": "7100355819",
      "name": "Y7 Maths",
      "descriptionHeading": "HNY07 MAT",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-22T07:32:01.666Z",
      "updateTime": "2018-08-13T18:43:32.186Z",
      "enrollmentCode": "o8t5237",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzEwMDM1NTgxOVpa",
      "teacherGroupEmail": "HNY07_MAT_teachers_97f71554@hope.edu.kh",
      "courseGroupEmail": "HNY07_MAT_42f1ca74@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnlvYkhoNjdWWEVHOW5wUGF1eThMdS1Kei1YSDNtX1k1bGUxWjhzWmhaTmM"
      },
      "courseMaterialSets": [
        {
          "title": "PDFs of every chapter for Year 7",
          "materials": [
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIMG5mdGIyZWdMbjg",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIMG5mdGIyZWdMbjg"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIOGUxZjdjc3BTVEU",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIOGUxZjdjc3BTVEU"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIRk1vbW1tRFM4RVE",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIRk1vbW1tRFM4RVE"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIczc3YUNHV3FTNnM",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIczc3YUNHV3FTNnM"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIRnJBZlQ5d0hqdjA",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIRnJBZlQ5d0hqdjA"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIY2g3azRRYXNxYk0",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIY2g3azRRYXNxYk0"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIUE9sYThYaXpiRWM",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIUE9sYThYaXpiRWM"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrISjRJY3ZEQm5mR2s",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrISjRJY3ZEQm5mR2s"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIdHlHUWZKNXNDVms",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIdHlHUWZKNXNDVms"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrINWpCRHJSc2FDeWM",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrINWpCRHJSc2FDeWM"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIWG1NT2VGeUgybzA",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIWG1NT2VGeUgybzA"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIOS1XS1NXY0x4TTA",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIOS1XS1NXY0x4TTA"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIVlZZeXdrRThDZlU",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIVlZZeXdrRThDZlU"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrITUE2ejJtcWpXY1k",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrITUE2ejJtcWpXY1k"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIRXVLYUpJc1VLeXc",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIRXVLYUpJc1VLeXc"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrITnpBOVZSZVI2NWc",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrITnpBOVZSZVI2NWc"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIRDVPZHNFb1JRWU0",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIRDVPZHNFb1JRWU0"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIRUsweFJZUGxtU2c",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIRUsweFJZUGxtU2c"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIR1h6ZGVXc21PX00",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIR1h6ZGVXc21PX00"
              }
            },
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIYVQxTThWbTlxYjQ",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIYVQxTThWbTlxYjQ"
              }
            }
          ]
        },
        {
          "title": "mathmindmap.png",
          "materials": [
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrISTQ2WmJqQ3FVVTg",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrISTQ2WmJqQ3FVVTg"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom62a48109@group.calendar.google.com"
    },
    {
      "id": "7088433374",
      "name": "Extended Essay 2016-2018",
      "section": "IB",
      "descriptionHeading": "Extended Essay 2016-2018 IB",
      "ownerId": "110575928947711158789",
      "creationTime": "2017-08-21T08:32:27.956Z",
      "updateTime": "2018-05-25T06:50:34.865Z",
      "enrollmentCode": "xfoptc7",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA4ODQzMzM3NFpa",
      "teacherGroupEmail": "Extended_Essay_2016_2018_IB_teachers_01dfcc1a@hope.edu.kh",
      "courseGroupEmail": "Extended_Essay_2016_2018_IB_0d694304@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfnlhQVp2V1pKa3JZQ0JtRTRmT09ZRXV2SG5SZkdSaEpoazhGanRJVjVTdWs"
      },
      "courseMaterialSets": [
        {
          "title": "EE Guide.pdf",
          "materials": [
            {
              "driveFile": {
                "id": "1ZE_sScyv_UpY44Ar4Hrdb5SXxe0bFhUf",
                "alternateLink": "https://drive.google.com/open?id=1ZE_sScyv_UpY44Ar4Hrdb5SXxe0bFhUf"
              }
            }
          ]
        },
        {
          "title": "EE samples",
          "materials": [
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzcWp6enVFazFiRm8",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzcWp6enVFazFiRm8"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzV0U1eEdCMXUycHM",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzV0U1eEdCMXUycHM"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzNWpCY25ocEVUUVk",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzNWpCY25ocEVUUVk"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzcjQyVEQ4ekpfNTg",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzcjQyVEQ4ekpfNTg"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzRWhwZjlFZUxjQjA",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzRWhwZjlFZUxjQjA"
              }
            }
          ]
        },
        {
          "title": "EE Guide",
          "materials": [
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzanAzZHJUUmlHM00",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzanAzZHJUUmlHM00"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc57ca35b@group.calendar.google.com"
    },
    {
      "id": "7086587420",
      "name": "Y2021 IGCSE History RD",
      "descriptionHeading": "Y2021 IGCSE History RD",
      "ownerId": "103551314133091140944",
      "creationTime": "2017-08-21T03:50:35.735Z",
      "updateTime": "2019-01-30T00:07:47.615Z",
      "enrollmentCode": "k4e34x2",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA4NjU4NzQyMFpa",
      "teacherGroupEmail": "Year_9_IGCSE_History_teachers_90dcffc7@hope.edu.kh",
      "courseGroupEmail": "Year_9_IGCSE_History_6c7ccbc1@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefk9KLXhSYXIzZU5Oc2pGWURqN3VHYnJMUXZmVG1WQ0t5TEtPQUc0SlViRVk",
        "title": "Year 9 IGCSE History",
        "alternateLink": "https://drive.google.com/drive/folders/0B6PDxPU9zcoefk9KLXhSYXIzZU5Oc2pGWURqN3VHYnJMUXZmVG1WQ0t5TEtPQUc0SlViRVk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom031cb9d4@group.calendar.google.com"
    },
    {
      "id": "7087241255",
      "name": "Year 1-3 Lesh",
      "descriptionHeading": "Year 1-3 Lesh",
      "ownerId": "118056716687842774738",
      "creationTime": "2017-08-21T02:43:18.601Z",
      "updateTime": "2017-08-21T07:13:33.509Z",
      "enrollmentCode": "n2djor6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA4NzI0MTI1NVpa",
      "teacherGroupEmail": "Year_1_3_Lesh_teachers_160f397b@hope.edu.kh",
      "courseGroupEmail": "Year_1_3_Lesh_efba49d9@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bzr3ZvcHDw0ufkxhSFZ5MWo1cjZwWG81eXMxajFZOXlwUkNyUzc3Ti02aXN2cFJOMnIwSms"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom8eb73c38@group.calendar.google.com"
    },
    {
      "id": "7086667137",
      "name": "IGCSE Music",
      "descriptionHeading": "Y2022/21 IGCSE Music TP",
      "ownerId": "110760563115232207760",
      "creationTime": "2017-08-21T02:13:23.311Z",
      "updateTime": "2019-01-31T01:31:33.645Z",
      "enrollmentCode": "sc1qbo0",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA4NjY2NzEzN1pa",
      "teacherGroupEmail": "IGCSE_Music_teachers_0799fee5@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Music_2caa1eac@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufmVOU1JXaFU1Rm1ENC0ySC1fWlFHV1FBRzlBc25LYkxFclFjS2xHN2JQY0U",
        "title": "IGCSE Music",
        "alternateLink": "https://drive.google.com/drive/folders/0Bz2WH4eYFAiufmVOU1JXaFU1Rm1ENC0ySC1fWlFHV1FBRzlBc25LYkxFclFjS2xHN2JQY0U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom84ca690b@group.calendar.google.com"
    },
    {
      "id": "5598783751",
      "name": "Chemistry 12 2017-18",
      "section": "Higher Level",
      "descriptionHeading": "Chemistry 12 2017-18 Higher Level",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:50:32.758Z",
      "updateTime": "2018-08-23T03:46:01.766Z",
      "enrollmentCode": "p1z5ye8",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NTU5ODc4Mzc1MVpa",
      "teacherGroupEmail": "Chemistry_12_2017_18_Higher_Level_teachers_abd7f700@hope.edu.kh",
      "courseGroupEmail": "Chemistry_12_2017_18_Higher_Level_9b589486@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fnVTSXhaRW5iSkw3N01vVmFFQnBDVGRuV0cxa2g2dUQ3TGNSdVBHXzZ2WG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom8a56a8e4@group.calendar.google.com"
    },
    {
      "id": "5599429093",
      "name": "Chemistry 12 2017-18",
      "section": "Standard Level",
      "descriptionHeading": "Chemistry 12 2017-18 Standard Level",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:49:33.626Z",
      "updateTime": "2018-08-23T03:48:01.451Z",
      "enrollmentCode": "wawdm3a",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NTU5OTQyOTA5M1pa",
      "teacherGroupEmail": "Chemistry_12_2017_18_Standard_Level_teachers_fef68ba1@hope.edu.kh",
      "courseGroupEmail": "Chemistry_12_2017_18_Standard_Level_35769513@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2flJnY2NOSDdJUGFyd1p4NVRUMG9Ea3RrNmUyRVpzSGh5amV3Mlk4NjdMZUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom92a33f18@group.calendar.google.com"
    },
    {
      "id": "5599239421",
      "name": "Y2019 IB Chemistry HL ME",
      "section": "Higher Level",
      "descriptionHeading": "Chemistry 11 2017-18 Higher Level",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:47:05.061Z",
      "updateTime": "2019-01-20T09:34:18.533Z",
      "enrollmentCode": "8vzucb",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5OTIzOTQyMVpa",
      "teacherGroupEmail": "Chemistry_11_2017_18_Higher_Level_teachers_86e7f9b6@hope.edu.kh",
      "courseGroupEmail": "Chemistry_11_2017_18_Higher_Level_b5ab409a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fk52cWRTTjQ3NTVHOWFDZm1jcnFfMFZJeGNSbUthWktzZGpMWlYwRTZFNFE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4f63ec2a@group.calendar.google.com"
    },
    {
      "id": "7076805669",
      "name": "Y2019 IB Chemistry SL ME",
      "section": "Standard Level",
      "descriptionHeading": "Chemistry 11 2017-18 Standard Level",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:45:54.680Z",
      "updateTime": "2019-01-20T09:34:56.673Z",
      "enrollmentCode": "u7yjmky",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA3NjgwNTY2OVpa",
      "teacherGroupEmail": "Chemistry_11_2017_18_Standard_Level_teachers_c7913a0d@hope.edu.kh",
      "courseGroupEmail": "Chemistry_11_2017_18_Standard_Level_6d2f028b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fkZuYlZCY09CSmc2UlhmeEFuSjZEVVRzbU1PMkhIT3VYZlIwZ3VaVmc0Qmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8c9b55af@group.calendar.google.com"
    },
    {
      "id": "5599185234",
      "name": "Chemistry 10 2017-18",
      "section": "Set 2",
      "descriptionHeading": "Chemistry 10 2017-18 Set 2",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:44:39.291Z",
      "updateTime": "2018-08-23T03:47:19.915Z",
      "enrollmentCode": "vahz6y",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NTU5OTE4NTIzNFpa",
      "teacherGroupEmail": "Chemistry_10_2017_18_Set_2_teachers_b76900d7@hope.edu.kh",
      "courseGroupEmail": "Chemistry_10_2017_18_Set_2_bd2c7263@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fmVUMVgtN0dvalZrYmY5UXIwV1FCVl9VenU5NWR2QV9VNXhRQXBVZFl4N0k"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma54afa9b@group.calendar.google.com"
    },
    {
      "id": "7076802650",
      "name": "Chemistry 10 2017-18",
      "section": "Set 1",
      "descriptionHeading": "Chemistry 10 2017-18 Set 1",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:42:48.579Z",
      "updateTime": "2018-08-23T03:47:13.015Z",
      "enrollmentCode": "2y7vtw3",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA3NjgwMjY1MFpa",
      "teacherGroupEmail": "Chemistry_10_2017_18_Set_1_teachers_368691fe@hope.edu.kh",
      "courseGroupEmail": "Chemistry_10_2017_18_Set_1_56e9cb8c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fmlsXzNwaEJ2VUM4enBMdEVCMTNjcFNJWXdFeFRwSm1lZzZwalR4UWRldUE"
      },
      "courseMaterialSets": [
        {
          "title": "General Revision PowerPoint",
          "materials": [
            {
              "driveFile": {
                "id": "1K-nVxlISq0AC5KQ_ONmm15rE80zJ7RsYmf0UcTVarcE",
                "alternateLink": "https://drive.google.com/open?id=1K-nVxlISq0AC5KQ_ONmm15rE80zJ7RsYmf0UcTVarcE"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6b7bd072@group.calendar.google.com"
    },
    {
      "id": "5599267663",
      "name": "Y2021 IGCSE Chemistry ME",
      "descriptionHeading": "Chemistry IGCSE 2017 - 2019",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-08-18T10:39:44.432Z",
      "updateTime": "2019-01-20T09:35:24.922Z",
      "enrollmentCode": "tmwkrxk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5OTI2NzY2M1pa",
      "teacherGroupEmail": "Chemistry_9_teachers_85135e0b@hope.edu.kh",
      "courseGroupEmail": "Chemistry_9_94a20a2a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fkloeF9VRjRBNGtJLXdzeS1qemZyODRaMG1UQWJmTDdpcnpvak1lRUZNOWM"
      },
      "courseMaterialSets": [
        {
          "title": "General Revision PowerPoint",
          "materials": [
            {
              "driveFile": {
                "id": "1K-nVxlISq0AC5KQ_ONmm15rE80zJ7RsYmf0UcTVarcE",
                "alternateLink": "https://drive.google.com/open?id=1K-nVxlISq0AC5KQ_ONmm15rE80zJ7RsYmf0UcTVarcE"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd99b0a67@group.calendar.google.com"
    },
    {
      "id": "5598939363",
      "name": "Year 6-10 PE",
      "descriptionHeading": "Year 6-10 PE",
      "ownerId": "109433851042173840244",
      "creationTime": "2017-08-18T07:47:19.606Z",
      "updateTime": "2017-08-18T07:48:06.690Z",
      "enrollmentCode": "e4qdks",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5ODkzOTM2M1pa",
      "teacherGroupEmail": "Year_6_10_PE_teachers_a8161f7d@hope.edu.kh",
      "courseGroupEmail": "Year_6_10_PE_52d1694b@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz7x2qXyrxU6fkNEVmpEcnFlQ0NlNHN3TTNqQjZMdVFjU3FFZ0F4TVdwZHdQVGZYMW9ZdHM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom982a775e@group.calendar.google.com"
    },
    {
      "id": "7076479296",
      "name": "History Y8",
      "descriptionHeading": "History Y8",
      "ownerId": "102261900644294993185",
      "creationTime": "2017-08-18T05:07:00.055Z",
      "updateTime": "2017-08-24T10:36:31.925Z",
      "enrollmentCode": "y8l43i1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA3NjQ3OTI5Nlpa",
      "teacherGroupEmail": "History_Y8_teachers_dd7830c3@hope.edu.kh",
      "courseGroupEmail": "History_Y8_380a183d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_8Jhws4eciYfklhNW9sYWZTalhtMnRJX1d4OFdaUGRGUGxZSzdKY0VtYlU1QnNZYTVPWTg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9b30a0b8@group.calendar.google.com"
    },
    {
      "id": "5598693526",
      "name": "Geography Y8",
      "descriptionHeading": "Geography Y8",
      "ownerId": "102261900644294993185",
      "creationTime": "2017-08-18T04:55:38Z",
      "updateTime": "2017-08-18T04:55:36.958Z",
      "enrollmentCode": "1duign3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5ODY5MzUyNlpa",
      "teacherGroupEmail": "Geography_Y8_teachers_832f29f0@hope.edu.kh",
      "courseGroupEmail": "Geography_Y8_3fdf6e58@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_8Jhws4eciYfjV3WFNQanF5dmVHOXFab1R5aWFkYzBBNmRvc2V2bl9iTExQWWhjYVZjd2c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf610cd96@group.calendar.google.com"
    },
    {
      "id": "5598834049",
      "name": "English Y8",
      "descriptionHeading": "English Y8",
      "ownerId": "102261900644294993185",
      "creationTime": "2017-08-18T04:45:10.632Z",
      "updateTime": "2017-08-24T10:34:15.798Z",
      "enrollmentCode": "yjl28k",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5ODgzNDA0OVpa",
      "teacherGroupEmail": "English_Y8_teachers_6ae296ab@hope.edu.kh",
      "courseGroupEmail": "English_Y8_e6c89b8d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_8Jhws4eciYfnI1UXhSMzN0TzNjcUZGRl9iLWhJeDV6TmZaNnpnR1JrVUJGMjRoem9IcGc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom661412ff@group.calendar.google.com"
    },
    {
      "id": "5598753742",
      "name": "English Y7",
      "descriptionHeading": "English Y7",
      "ownerId": "102261900644294993185",
      "creationTime": "2017-08-18T04:44:41.481Z",
      "updateTime": "2017-08-24T10:33:12.914Z",
      "enrollmentCode": "dvspyd",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5ODc1Mzc0Mlpa",
      "teacherGroupEmail": "English_Y7_teachers_08de8c1a@hope.edu.kh",
      "courseGroupEmail": "English_Y7_57fc3ce3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_8Jhws4eciYflptQ0tXc2RnN0JhTTZubVlrU3VnYWVYWjc1bUxFVjJ2VXVfYjk3UV95ZEE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom63f58d11@group.calendar.google.com"
    },
    {
      "id": "5598879007",
      "name": "English Y6",
      "descriptionHeading": "English Y6",
      "ownerId": "102261900644294993185",
      "creationTime": "2017-08-18T04:44:01.956Z",
      "updateTime": "2017-08-24T08:26:41.083Z",
      "enrollmentCode": "4bdfig",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NTU5ODg3OTAwN1pa",
      "teacherGroupEmail": "English_Y6_teachers_73fcf90a@hope.edu.kh",
      "courseGroupEmail": "English_Y6_39e903b8@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_8Jhws4eciYflVrMmEtZ1YwaXU3SEZ2TWM3dUpCYThPbVVLT1pIYWNoTkx3VkVqZ0UtZTg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome9d924a1@group.calendar.google.com"
    },
    {
      "id": "7076351368",
      "name": "Devotions Y6",
      "descriptionHeading": "Devotions Y6",
      "ownerId": "102261900644294993185",
      "creationTime": "2017-08-18T04:43:13.569Z",
      "updateTime": "2017-08-18T04:43:12.681Z",
      "enrollmentCode": "evv1sp",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA3NjM1MTM2OFpa",
      "teacherGroupEmail": "Devotions_Y6_teachers_2a236361@hope.edu.kh",
      "courseGroupEmail": "Devotions_Y6_830d0d8b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_8Jhws4eciYfm1xUVBPNFB2SS0tT2lRU2U2dHFJLXZOV3BQcTRBSVZHNmJIVzVHR2JMaWM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom05a17103@group.calendar.google.com"
    },
    {
      "id": "7076395308",
      "name": "IB Environmental Systems and Societies 2018",
      "descriptionHeading": "IB Environmental Systems and Societies 2018",
      "ownerId": "100362126255417413706",
      "creationTime": "2017-08-18T03:52:45.953Z",
      "updateTime": "2018-06-16T09:54:54.654Z",
      "enrollmentCode": "rxuomt",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA3NjM5NTMwOFpa",
      "teacherGroupEmail": "IB_Environmental_Systems_and_Societies_2018_teachers_e1c8a406@hope.edu.kh",
      "courseGroupEmail": "IB_Environmental_Systems_and_Societies_2018_d7fe01b7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXflBpUjQtcUhVWFAwT3pIUWo5MlZZSUpkUS13Zi13TnRzRnRGQ0REeVkzUU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3ecf07ff@group.calendar.google.com"
    },
    {
      "id": "7072971321",
      "name": "Y7 ICT",
      "descriptionHeading": "HNY07 IT",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-18T02:21:32.772Z",
      "updateTime": "2018-08-13T18:43:40.433Z",
      "enrollmentCode": "14yo1a",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA3Mjk3MTMyMVpa",
      "teacherGroupEmail": "HNY07_IT_teachers_d8099ae8@hope.edu.kh",
      "courseGroupEmail": "HNY07_IT_61316e33@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfm5sWmlkOVJiaGZDN0ZDSjRjVWtFc0JMMTRWYTdlc1BlYmVQeVV1N1dOU28"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf8f3a124@group.calendar.google.com"
    },
    {
      "id": "7063485677",
      "name": "Y6 Art",
      "descriptionHeading": "Y7 Art",
      "ownerId": "103117887730131250473",
      "creationTime": "2017-08-17T09:09:04.310Z",
      "updateTime": "2018-09-12T15:12:50.274Z",
      "enrollmentCode": "lqfdilw",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA2MzQ4NTY3N1pa",
      "teacherGroupEmail": "Y7_Art_teachers_7e870e5e@hope.edu.kh",
      "courseGroupEmail": "Y7_Art_0882de69@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fmVxdF9rcFBQMFdhTE9LQWdaUTlpZEJaZVBJLXlYQU1mU292SFdueVVGMTA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom423d3e85@group.calendar.google.com"
    },
    {
      "id": "7064797381",
      "name": "Grade 8 Geography",
      "descriptionHeading": "Grade 8 Geography",
      "ownerId": "109845242716981282366",
      "creationTime": "2017-08-17T07:57:40.958Z",
      "updateTime": "2017-08-17T07:57:40.173Z",
      "enrollmentCode": "c7tprdg",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA2NDc5NzM4MVpa",
      "teacherGroupEmail": "Grade_8_Geography_teachers_28b1bd5a@hope.edu.kh",
      "courseGroupEmail": "Grade_8_Geography_cb03f7ce@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fnhaY1Z5aFhrVkJ2OUZzalNOTkhMSkJKQWxYV0UzTzJreWlfVTNTQXFTTkk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1a73dc82@group.calendar.google.com"
    },
    {
      "id": "7064841541",
      "name": "Y8 Art",
      "descriptionHeading": "Y8 Art",
      "ownerId": "112022231024540234956",
      "creationTime": "2017-08-17T07:10:59.270Z",
      "updateTime": "2018-09-12T15:12:45.220Z",
      "enrollmentCode": "dz0u9x",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA2NDg0MTU0MVpa",
      "teacherGroupEmail": "Y8_Art_teachers_87b3dc01@hope.edu.kh",
      "courseGroupEmail": "Y8_Art_c88a702d@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fmc1VDlZVTRBSlVUOTg5dmYweTRSWVJoN2lWZTd2V3pQa200M08xRkkyVTA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom16a0321e@group.calendar.google.com"
    },
    {
      "id": "7063537500",
      "name": "Y6 ICT",
      "descriptionHeading": "HNY06 ICT",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-17T04:27:50.980Z",
      "updateTime": "2018-08-13T18:45:40.436Z",
      "enrollmentCode": "fwbxood",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA2MzUzNzUwMFpa",
      "teacherGroupEmail": "HNY06_teachers_619e09cd@hope.edu.kh",
      "courseGroupEmail": "HNY06_8387b84f@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnJNVjlKTTE0LVpzaW11azY4Z2xaUVVNTHNpampTRGVCeHZnVnZBakdSa2M"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom053ba86c@group.calendar.google.com"
    },
    {
      "id": "7065165225",
      "name": "Y8 2017-2018",
      "section": "Language",
      "descriptionHeading": "Y8 2017-2018 Language",
      "ownerId": "110575928947711158789",
      "creationTime": "2017-08-17T04:13:44.012Z",
      "updateTime": "2018-08-22T07:56:23.350Z",
      "enrollmentCode": "sl1rk0",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA2NTE2NTIyNVpa",
      "teacherGroupEmail": "Y8_2017_2018_Language_teachers_dd744e4a@hope.edu.kh",
      "courseGroupEmail": "Y8_2017_2018_Language_f262b365@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfk1XMlR6M3NUbjdnZzNwbk11a3FaWXltTzZrZUFhcUJWZlRWLWZTUW1BSTg"
      },
      "courseMaterialSets": [
        {
          "title": "\u003c토론 글쓰기\u003e 요령 (출처: 서상훈선생님)",
          "materials": [
            {
              "driveFile": {
                "id": "1BmI77j2htZmI-7SYn6XfWhqPUyNiNuGs-bNN3WW36nw",
                "title": "토론 문제를 위한 전략",
                "alternateLink": "https://drive.google.com/open?id=1BmI77j2htZmI-7SYn6XfWhqPUyNiNuGs-bNN3WW36nw",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1BmI77j2htZmI-7SYn6XfWhqPUyNiNuGs-bNN3WW36nw&sz=s200"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8d992d2f@group.calendar.google.com"
    },
    {
      "id": "7063757189",
      "name": "Y9 ICT",
      "descriptionHeading": "HNY09 CS",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-17T01:50:25.450Z",
      "updateTime": "2018-08-13T18:44:10.041Z",
      "enrollmentCode": "hurjmb",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA2Mzc1NzE4OVpa",
      "teacherGroupEmail": "HNY9_CS_teachers_e623e7c5@hope.edu.kh",
      "courseGroupEmail": "HNY9_CS_d71ab75c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmctZWFmZUtNVWhvcFZ5OWU1WWhGS3ZLTWRROGJBN3hiVmZwMFM5Vzdkbmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7bec44b8@group.calendar.google.com"
    },
    {
      "id": "7056014537",
      "name": "Year 12 HL Geography",
      "descriptionHeading": "Year 12 HL Geography",
      "ownerId": "103551314133091140944",
      "creationTime": "2017-08-16T04:09:53.034Z",
      "updateTime": "2018-08-17T07:26:35.395Z",
      "enrollmentCode": "35te6b",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA1NjAxNDUzN1pa",
      "teacherGroupEmail": "Year_12_HL_Geography_teachers_2b5e7665@hope.edu.kh",
      "courseGroupEmail": "Year_12_HL_Geography_cca27341@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefnBuTUpEclIzUi14eGJuZHlodEI0YVhna0hPa1lHc3VtdHdhYWdZT2RPaVk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom093717c6@group.calendar.google.com"
    },
    {
      "id": "7055456678",
      "name": "Y2019 IB English A HL",
      "descriptionHeading": "Y2019 IB English A: Language and LIterature HL RB",
      "ownerId": "106412644954351339427",
      "creationTime": "2017-08-16T02:08:00.963Z",
      "updateTime": "2019-02-02T07:21:08.871Z",
      "enrollmentCode": "cpwfr8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA1NTQ1NjY3OFpa",
      "teacherGroupEmail": "11_12_IB_A_English_2017_2019_teachers_14585f0c@hope.edu.kh",
      "courseGroupEmail": "11_12_IB_A_English_2017_2019_56673e05@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxINKwxqyzJJfmZkT2tOLTl3UmRZdXJ3eWJoRzFiWmROd0tqUDRiVlh4MlVJZGVURzdiTEE",
        "title": "11-12  IB A English 2017-2019",
        "alternateLink": "https://drive.google.com/drive/folders/0BxINKwxqyzJJfmZkT2tOLTl3UmRZdXJ3eWJoRzFiWmROd0tqUDRiVlh4MlVJZGVURzdiTEE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomaa274b93@group.calendar.google.com"
    },
    {
      "id": "7048384610",
      "name": "Year 9 IGCSE English 2017-19",
      "descriptionHeading": "Year 9-10 IGCSE English 2017-19",
      "ownerId": "115986378965778821966",
      "creationTime": "2017-08-15T10:11:16.125Z",
      "updateTime": "2017-08-24T02:41:13.134Z",
      "enrollmentCode": "jngigas",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA0ODM4NDYxMFpa",
      "teacherGroupEmail": "Year_9_10_IGCSE_English_2017_19_teachers_86676469@hope.edu.kh",
      "courseGroupEmail": "Year_9_10_IGCSE_English_2017_19_5dcb7083@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfks3NnJpT0dSSXV3TGJUek1rLXdRMVBWaFVsRFJKOXo1V2FvQjNTNnM0VUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom1d3eb7ad@group.calendar.google.com"
    },
    {
      "id": "7048640013",
      "name": "Year 9-10 IGCSE English 2017-19",
      "descriptionHeading": "Year 9-10 IGCSE English 2017-19",
      "ownerId": "115986378965778821966",
      "creationTime": "2017-08-15T10:11:09.058Z",
      "updateTime": "2017-08-15T10:11:08.144Z",
      "enrollmentCode": "r0dav4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA0ODY0MDAxM1pa",
      "teacherGroupEmail": "Year_9_10_IGCSE_English_2017_19_teachers_e05934d5@hope.edu.kh",
      "courseGroupEmail": "Year_9_10_IGCSE_English_2017_19_22afdd8b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfjBONXNlNFNmMTAyeUE1anFUc1gzcFBLRWtYQnNNVXBHa2gzMmljeDFIa1E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf5ec9b46@group.calendar.google.com"
    },
    {
      "id": "7048452308",
      "name": "Y9 Design",
      "descriptionHeading": "Y9 Design",
      "ownerId": "112022231024540234956",
      "creationTime": "2017-08-15T07:56:49.718Z",
      "updateTime": "2018-08-07T07:43:20.261Z",
      "enrollmentCode": "icg1hmh",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0ODQ1MjMwOFpa",
      "teacherGroupEmail": "Y9_Design_teachers_a2da39a2@hope.edu.kh",
      "courseGroupEmail": "Y9_Design_53ea808c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fjhvVTRyY1JWY2RpSk05NlFKTmhTSWRWanpnc25IeXFQNDRlMlE4Q2hXVGM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc64d95b3@group.calendar.google.com"
    },
    {
      "id": "7047730778",
      "name": "Y10 ICT",
      "descriptionHeading": "HNY10 CS",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-15T04:39:07.769Z",
      "updateTime": "2018-08-13T18:44:38.484Z",
      "enrollmentCode": "b9udln",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0NzczMDc3OFpa",
      "teacherGroupEmail": "HNY10_CS_teachers_f996395d@hope.edu.kh",
      "courseGroupEmail": "HNY10_CS_71295394@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfkc1MXNLbVI4Z29CalZNWXltVzB1OF92UEFsdWV6bHExdHpGaWQtVzVTYkE"
      },
      "courseMaterialSets": [
        {
          "title": "Cambridge IGCSE Computer Science (0478)",
          "materials": [
            {
              "link": {
                "url": "http://www.cie.org.uk/programmes-and-qualifications/cambridge-igcse-computer-science-0478/",
                "title": "\n        Cambridge IGCSE Computer Science (0478)\n    ",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.cie.org.uk/programmes-and-qualifications/cambridge-igcse-computer-science-0478/&a=AIYkKU_r7Rrd9z6LgitKqiIPOh2lhaK2Fw"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom0c749b3b@group.calendar.google.com"
    },
    {
      "id": "7047603100",
      "name": "Year 10 IGCSE Geography",
      "descriptionHeading": "Year 10 IGCSE Geography",
      "ownerId": "103551314133091140944",
      "creationTime": "2017-08-15T03:41:39.274Z",
      "updateTime": "2018-08-17T07:26:58.142Z",
      "enrollmentCode": "2a3tpc",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0NzYwMzEwMFpa",
      "teacherGroupEmail": "Year_10_IGCSE_Geography_teachers_d662a4a4@hope.edu.kh",
      "courseGroupEmail": "Year_10_IGCSE_Geography_15715e4e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefkZNR0pHeVNIVWctdlNRcFhZaWhDVjZRaTFIOXVLUmd6VldpVENneVZYZXM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomaf5f6e32@group.calendar.google.com"
    },
    {
      "id": "7047630357",
      "name": "Year 11 HL Geography",
      "descriptionHeading": "Year 12 HL Geography",
      "ownerId": "115976931584272436878",
      "creationTime": "2017-08-15T03:40:10.926Z",
      "updateTime": "2018-08-19T07:44:31.209Z",
      "enrollmentCode": "dnqpks",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA0NzYzMDM1N1pa",
      "teacherGroupEmail": "Year_11_HL_Geography_teachers_8f76e7aa@hope.edu.kh",
      "courseGroupEmail": "Year_11_HL_Geography_bfaa31b5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefjRQRkNCamdPdGhXSTNzWFV5T1g0SHBub25tOWJJZGZ1TVgxRm5RRUZuNUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom00245a9d@group.calendar.google.com"
    },
    {
      "id": "7042538558",
      "name": "Y9 IGCSE CS",
      "descriptionHeading": "IGCSE Computer Science",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-14T16:10:10.663Z",
      "updateTime": "2018-09-04T07:11:34.900Z",
      "enrollmentCode": "6oevk87",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0MjUzODU1OFpa",
      "teacherGroupEmail": "IGCSE_Computer_Science_teachers_b34e67f3@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Computer_Science_07163acf@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmxSaDNTUmtFU3JBYXZ6alpZTzNhWUVTVVlQUmVDQ0IyOGNFdGF6d3VxZDA"
      },
      "courseMaterialSets": [
        {
          "title": "iKnowIT All",
          "materials": [
            {
              "driveFile": {
                "id": "1rAze_sHovl0QT85w4SLOVNgzhlNd1GtXqBwzY-kA6IA",
                "alternateLink": "https://drive.google.com/open?id=1rAze_sHovl0QT85w4SLOVNgzhlNd1GtXqBwzY-kA6IA"
              }
            }
          ]
        },
        {
          "title": "Cambridge IGCSE Computer Science.pdf",
          "materials": [
            {
              "driveFile": {
                "id": "0ByUSUXY3mRrIMThXdVJvZ0wyVEU",
                "title": "Cambridge IGCSE Computer Science eBook.pdf",
                "alternateLink": "https://drive.google.com/open?id=0ByUSUXY3mRrIMThXdVJvZ0wyVEU",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0ByUSUXY3mRrIMThXdVJvZ0wyVEU&sz=s200"
              }
            }
          ]
        },
        {
          "title": "iKnow IT",
          "materials": [
            {
              "driveFile": {
                "id": "1Aowzl5-cWU46OsbZSkLy6-fDdQTCkyxfoxFhzSU8GSc",
                "title": "iKnow IT 2019",
                "alternateLink": "https://drive.google.com/open?id=1Aowzl5-cWU46OsbZSkLy6-fDdQTCkyxfoxFhzSU8GSc",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1Aowzl5-cWU46OsbZSkLy6-fDdQTCkyxfoxFhzSU8GSc&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Flippy Fingers",
          "materials": [
            {
              "driveFile": {
                "id": "1WPDgxFfFQDP2ck2U7_jm0pQvRP1r7TDH3sCV3RmxVdo",
                "title": "Flippy Bit Fingers",
                "alternateLink": "https://drive.google.com/open?id=1WPDgxFfFQDP2ck2U7_jm0pQvRP1r7TDH3sCV3RmxVdo",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1WPDgxFfFQDP2ck2U7_jm0pQvRP1r7TDH3sCV3RmxVdo&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Cambridge MOOC",
          "materials": [
            {
              "link": {
                "url": "https://www.cambridgegcsecomputing.org/courses/new-course",
                "title": "Restricted access",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cambridgegcsecomputing.org/courses/new-course&a=AIYkKU-Noxh3Si-DZ7w7lRfj6tOa1u8GLQ"
              }
            }
          ]
        },
        {
          "title": "2017-2019 Syllabus",
          "materials": [
            {
              "link": {
                "url": "http://www.cie.org.uk/images/203951-2017-2019-syllabus.pdf",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.cie.org.uk/images/203951-2017-2019-syllabus.pdf&a=AIYkKU_i4GBGM5zZrr9KOjQkMMdjZ48QcA"
              }
            }
          ]
        },
        {
          "title": "Cambridge IGCSE Computer Science (0478)",
          "materials": [
            {
              "link": {
                "url": "http://www.cie.org.uk/programmes-and-qualifications/cambridge-igcse-computer-science-0478/",
                "title": "\n        Cambridge IGCSE Computer Science (0478)\n    ",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.cie.org.uk/programmes-and-qualifications/cambridge-igcse-computer-science-0478/&a=AIYkKU_r7Rrd9z6LgitKqiIPOh2lhaK2Fw"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7b19b91a@group.calendar.google.com"
    },
    {
      "id": "7042020247",
      "name": "Y11 IB VA 2017-2018",
      "descriptionHeading": "Y11 IB Visual Art",
      "description": "Visual arts (From: IB Visual Arts Guide 2017)\n\nThe visual arts are an integral part of everyday life, permeating all levels of human creativity, expression, communication and understanding. They range from traditional forms embedded in local and wider communities, societies and cultures, to the varied and divergent practices associated with new, emerging and contemporary forms of visual language. They may have sociopolitical impact as well as ritual, spiritual, decorative and functional value; they can be persuasive and subversive in some instances, enlightening and uplifting in others. We celebrate the visual arts not only in the way we create images and objects, but also in the way we appreciate, enjoy, respect and respond to the practices of art-making by others from around the world. Theories and practices in visual arts are dynamic and ever-changing, and connect many areas of knowledge and human experience through individual and collaborative exploration, creative production and critical interpretation.\n\nThe IB Diploma Programme visual arts course encourages students to challenge their own creative and cultural expectations and boundaries. It is a thought-provoking course in which students develop analytical skills in problem-solving and divergent thinking, while working towards technical proficiency and confidence as art-makers. In addition to exploring and comparing visual arts from different perspectives and in different contexts, students are expected to engage in, experiment with and critically reflect upon a wide range of contemporary practices and media. The course is designed for students who want to go on to study visual arts in higher education as well as for those who are seeking lifelong enrichment through visual arts.\n\nSupporting the International Baccalaureate mission statement and learner profile, the course encourages students to actively explore the visual arts within and across a variety of local, regional, national, international and intercultural contexts. Through inquiry, investigation, reflection and creative application, visual arts students develop an appreciation for the expressive and aesthetic diversity in the world around them, becoming critically informed makers and consumers of visual culture.\n\nThe arts aims (From: IB Visual Arts Guide 2017)\nThe aims of the arts subjects are to enable students to:\n\n1. enjoy lifelong engagement with the arts\n2. become informed, reflective and critical practitioners in the arts\n3. understand the dynamic and changing nature of the arts\n4. explore and value the diversity of the arts across time, place and cultures\n5. express ideas with confidence and competence\n6. develop perceptual and analytical skills.\n\nVisual arts aims (From: IB Visual Arts Guide 2017)\nIn addition, the aims of the visual arts course at SL and HL are to enable students to:\n\n7. make artwork that is influenced by personal and cultural contexts\n8. become informed and critical observers and makers of visual culture and media\n9. develop skills, techniques and processes in order to communicate concepts and ideas.",
      "room": "S1",
      "ownerId": "112022231024540234956",
      "creationTime": "2017-08-14T14:17:14.063Z",
      "updateTime": "2018-10-10T10:02:22.126Z",
      "enrollmentCode": "z00kzgg",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0MjAyMDI0N1pa",
      "teacherGroupEmail": "Y11_IB_Visual_Art_teachers_7cb98bd9@hope.edu.kh",
      "courseGroupEmail": "Y11_IB_Visual_Art_71695f37@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5flhoOTUzbjFIdUs5YkR4Z0JNT0Y5R1lWb1Q2cDlEc3Y1dFZ6VzJhRWhlUDA"
      },
      "courseMaterialSets": [
        {
          "title": "Y11/12 IB VA HL Assessment Overview",
          "materials": [
            {
              "driveFile": {
                "id": "1w_t7sDR4ZiGP-jLZTabG60IMMZXt7dH7Z5WDZaKc7k4",
                "alternateLink": "https://drive.google.com/open?id=1w_t7sDR4ZiGP-jLZTabG60IMMZXt7dH7Z5WDZaKc7k4"
              }
            }
          ]
        },
        {
          "title": "IB VA Assessment Venn Diagram",
          "materials": [
            {
              "driveFile": {
                "id": "0ByTPkAZtJDZ5bmVqRE5WUmlwTkk",
                "alternateLink": "https://drive.google.com/open?id=0ByTPkAZtJDZ5bmVqRE5WUmlwTkk"
              }
            }
          ]
        },
        {
          "title": "IB Visual Arts Guide 2017",
          "materials": [
            {
              "driveFile": {
                "id": "0ByTPkAZtJDZ5dlhuaFZMM2tQQ1U",
                "alternateLink": "https://drive.google.com/open?id=0ByTPkAZtJDZ5dlhuaFZMM2tQQ1U"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom786d60bd@group.calendar.google.com"
    },
    {
      "id": "7041880951",
      "name": "Literacy on Computers",
      "section": "345",
      "descriptionHeading": "Literacy on Computers 345",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-08-14T10:27:59.310Z",
      "updateTime": "2017-11-23T08:46:55.725Z",
      "enrollmentCode": "992yzod",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0MTg4MDk1MVpa",
      "teacherGroupEmail": "Literacy_on_Computers_345_teachers_6858c303@hope.edu.kh",
      "courseGroupEmail": "Literacy_on_Computers_345_a06a2e46@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fk4xZmFHdXBKZVQ0bmJOY09tODQtbTFfMHpYdHVjTjFMLVd5dzBrbC02QWc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf0338793@group.calendar.google.com"
    },
    {
      "id": "7041316480",
      "name": "English 0486 Year 10 2017-8",
      "descriptionHeading": "English 0486 Year 10 2017-8",
      "ownerId": "115986378965778821966",
      "creationTime": "2017-08-14T05:49:36.010Z",
      "updateTime": "2017-08-14T05:49:35.011Z",
      "enrollmentCode": "agawnb2",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzA0MTMxNjQ4MFpa",
      "teacherGroupEmail": "English_0486_Year_10_2017_8_teachers_000b0f2e@hope.edu.kh",
      "courseGroupEmail": "English_0486_Year_10_2017_8_82651a14@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCflhxcUFveU50UzduRmR6b09SdkUyZmRZOVduR3JuSmtxeFJYN21haEtRVWc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom37d5d5f3@group.calendar.google.com"
    },
    {
      "id": "7040483032",
      "name": "SR678 ICT",
      "descriptionHeading": "Grade 6/7/8 SR IT",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-08-14T02:55:29.099Z",
      "updateTime": "2018-08-13T18:44:50.468Z",
      "enrollmentCode": "32b3dm",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzA0MDQ4MzAzMlpa",
      "teacherGroupEmail": "Grade_6_7_8_SR_IT_teachers_2a07475e@hope.edu.kh",
      "courseGroupEmail": "Grade_6_7_8_SR_IT_0e604d43@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmdlQTloQWIxU0w5d2Q4cHA2b3lCemgyMElEQ051Y2s3TGR2WWJuZTUzN2s"
      },
      "courseMaterialSets": [
        {
          "title": "Year 6-7-8 IT Sch 17-18.doc",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MeXJ1RUVTVldjaDg",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MeXJ1RUVTVldjaDg"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MSVV2bXQ4eVo5aEU",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MSVV2bXQ4eVo5aEU"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8d59fe37@group.calendar.google.com"
    },
    {
      "id": "7038755121",
      "name": "IB Biology 2019",
      "descriptionHeading": "IB Biology 2019",
      "ownerId": "100362126255417413706",
      "creationTime": "2017-08-13T12:59:45.272Z",
      "updateTime": "2017-08-13T13:00:15.676Z",
      "enrollmentCode": "5wzjekp",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAzODc1NTEyMVpa",
      "teacherGroupEmail": "IB_Biology_2019_teachers_17c5d0da@hope.edu.kh",
      "courseGroupEmail": "IB_Biology_2019_e5a888f9@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfjFHenRZcjVYakxlNklZZGdGbWlKaU90NEk3eldyRVhoYjF5dFFTbTg4aEE",
        "title": "IB Biology 2019",
        "alternateLink": "https://drive.google.com/drive/folders/0B_c4Ytt8TOwXfjFHenRZcjVYakxlNklZZGdGbWlKaU90NEk3eldyRVhoYjF5dFFTbTg4aEE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9936de4d@group.calendar.google.com"
    },
    {
      "id": "7037429476",
      "name": "Grade 8 Christian Perspectives",
      "descriptionHeading": "Grade 8 Christian Perspectives",
      "ownerId": "116427367394120829285",
      "creationTime": "2017-08-12T16:05:11.388Z",
      "updateTime": "2018-01-09T08:11:34.620Z",
      "enrollmentCode": "8fvyhzb",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAzNzQyOTQ3Nlpa",
      "teacherGroupEmail": "Grade_8_Christian_Perspectives_teachers_97c86f8b@hope.edu.kh",
      "courseGroupEmail": "Grade_8_Christian_Perspectives_06a91e5b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfmRrVDA1Y1lBd1ZybHJ5NWdHbWhZWVlRZFN0eGVjMFFlakZZVXVreFpWcGM"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MNTE3ZHFuZzFsb0E",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MNTE3ZHFuZzFsb0E"
              }
            },
            {
              "driveFile": {
                "id": "1qMhwKIdRo0m0lbomUZUY4qvrBltCCT-S",
                "alternateLink": "https://drive.google.com/open?id=1qMhwKIdRo0m0lbomUZUY4qvrBltCCT-S"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomcb1678f8@group.calendar.google.com"
    },
    {
      "id": "7037590680",
      "name": "Grade 9/10 Combined Science",
      "descriptionHeading": "Grade 9/10 Combined Science",
      "ownerId": "116427367394120829285",
      "creationTime": "2017-08-12T15:48:32.118Z",
      "updateTime": "2018-05-07T12:14:17.358Z",
      "enrollmentCode": "o66xad",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzNzU5MDY4MFpa",
      "teacherGroupEmail": "Grade_9_10_Combined_Science_teachers_a0eadd5d@hope.edu.kh",
      "courseGroupEmail": "Grade_9_10_Combined_Science_d66c5a98@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MflRveTFUbVZTaVROQ01BTkktRG84azZ1NV8ta0VqUUtwYkJoTTFtQXA1RHM"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "1h7TE6T4hj8oXvJ3Eyfj2NgUsCL2tpAUA",
                "alternateLink": "https://drive.google.com/open?id=1h7TE6T4hj8oXvJ3Eyfj2NgUsCL2tpAUA"
              }
            },
            {
              "driveFile": {
                "id": "1hVqmLTmFl_ZxfZXGWLhTj-3ISxqdveZv",
                "alternateLink": "https://drive.google.com/open?id=1hVqmLTmFl_ZxfZXGWLhTj-3ISxqdveZv"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7b761cc7@group.calendar.google.com"
    },
    {
      "id": "7037592008",
      "name": "Grade 8 Science",
      "descriptionHeading": "Grade 8 Science",
      "ownerId": "108951450081736118120",
      "creationTime": "2017-08-12T15:37:14.375Z",
      "updateTime": "2018-06-11T04:28:05.388Z",
      "enrollmentCode": "l5plvd7",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAzNzU5MjAwOFpa",
      "teacherGroupEmail": "Grade_8_Science_teachers_126ed23d@hope.edu.kh",
      "courseGroupEmail": "Grade_8_Science_a46320cc@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfkhleXBUS19JOGduUi1zV0Z4b2MwaUlWbUtOMjYtLUJCMWJYYV9FWGxvM3c"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MZVpaWEJJOG1ZQ28",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MZVpaWEJJOG1ZQ28"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MNVpLZkU2Rklzam8",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MNVpLZkU2Rklzam8"
              }
            },
            {
              "driveFile": {
                "id": "1dbmAR1sCIgVZCaFAQ8PExDw2H6cXnKC9",
                "alternateLink": "https://drive.google.com/open?id=1dbmAR1sCIgVZCaFAQ8PExDw2H6cXnKC9"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4d72d2ba@group.calendar.google.com"
    },
    {
      "id": "7037342952",
      "name": "Y2019 IB English B HL",
      "descriptionHeading": "Y11 IB English B",
      "ownerId": "117957340856753443265",
      "creationTime": "2017-08-12T11:17:10.448Z",
      "updateTime": "2019-02-02T00:02:02.330Z",
      "enrollmentCode": "te0zlw6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAzNzM0Mjk1Mlpa",
      "teacherGroupEmail": "Y11_IB_English_B_teachers_141336a6@hope.edu.kh",
      "courseGroupEmail": "Y11_IB_English_B_668e0cb6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fjNYM2JCbkhob3ZCZW5tWGNCZGkyS0lxZEtLa2ExbExrX3d4bVFjSjE2OUE",
        "title": "Y11 IB English B",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3fjNYM2JCbkhob3ZCZW5tWGNCZGkyS0lxZEtLa2ExbExrX3d4bVFjSjE2OUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3b316954@group.calendar.google.com"
    },
    {
      "id": "7037411995",
      "name": "Y2019 IB French SL IP",
      "descriptionHeading": "Y12 IB French",
      "ownerId": "117957340856753443265",
      "creationTime": "2017-08-12T11:15:09.553Z",
      "updateTime": "2019-01-08T08:20:34.271Z",
      "enrollmentCode": "98jwiv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAzNzQxMTk5NVpa",
      "teacherGroupEmail": "Y11_IB_French_teachers_015756de@hope.edu.kh",
      "courseGroupEmail": "Y11_IB_French_75d45bca@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fnZZZlo2bWVrV3lQMElVb1lZTFcyOXVtaEE5NkFhTTdYcWpKS3g3c0lQQ2s",
        "title": "Y11 IB French",
        "alternateLink": "https://drive.google.com/drive/folders/0B59W88EQIOX3fnZZZlo2bWVrV3lQMElVb1lZTFcyOXVtaEE5NkFhTTdYcWpKS3g3c0lQQ2s"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomaa6a5cf1@group.calendar.google.com"
    },
    {
      "id": "7037483137",
      "name": "Les jaunes Y7",
      "section": "French",
      "descriptionHeading": "Les jaunes Y6",
      "ownerId": "117957340856753443265",
      "creationTime": "2017-08-12T11:05:49.876Z",
      "updateTime": "2018-08-21T07:28:37.690Z",
      "enrollmentCode": "8x7hjbs",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzNzQ4MzEzN1pa",
      "teacherGroupEmail": "Les_jaunes_Y6_teachers_65bc8f0e@hope.edu.kh",
      "courseGroupEmail": "Les_jaunes_Y6_77b70bbb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fmExVkhJUFdjWmJyRDFXTmF6MWtQU1dzem5lMlphcmlWcjZkckZlYWpGaUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf94ff9da@group.calendar.google.com"
    },
    {
      "id": "7037491375",
      "name": "IGCSE Geography 2017-2019",
      "descriptionHeading": "IGCSE Geography 2017-2019",
      "ownerId": "100362126255417413706",
      "creationTime": "2017-08-12T08:40:47.910Z",
      "updateTime": "2018-09-19T05:22:07.182Z",
      "enrollmentCode": "6un11f",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzNzQ5MTM3NVpa",
      "teacherGroupEmail": "IGCSE_Geography_2017_2019_teachers_e9ca116d@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Geography_2017_2019_66fb597a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXflVCMW5pVTVtM0s5eFA5UGFWb2FFeU9FdVhuYnBSa3FEZHA2aTFiQThaeEk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma7945793@group.calendar.google.com"
    },
    {
      "id": "7031241312",
      "name": "CP Y9 (2017-2018)",
      "descriptionHeading": "Y9 (2017-2018)",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-08-11T05:06:40.646Z",
      "updateTime": "2018-02-09T05:54:48.906Z",
      "enrollmentCode": "p1gwmp5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzMTI0MTMxMlpa",
      "teacherGroupEmail": "Y9_2017_2018_teachers_23ff71c8@hope.edu.kh",
      "courseGroupEmail": "Y9_2017_2018_b4b7a138@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfk5UME0zVlliNXFablBJYjZZZDVWLW1xbTBjNEZxYWhKV2JRaXJ4NThEODA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb11c00c4@group.calendar.google.com"
    },
    {
      "id": "7031794318",
      "name": "CP Y10 (2017-18)",
      "descriptionHeading": "Y10 (2017-18)",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-08-11T04:58:56.410Z",
      "updateTime": "2018-02-09T05:54:42.605Z",
      "enrollmentCode": "5t77su5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzMTc5NDMxOFpa",
      "teacherGroupEmail": "Y10_2017_18_teachers_cee88c46@hope.edu.kh",
      "courseGroupEmail": "Y10_2017_18_2021a0dd@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfjFNcGZaTV9tX1hyVk1KeUdCSEJpYWF2Ymk4cnlmVEVtaHZLMV9OcUpyc3M"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb6e57df4@group.calendar.google.com"
    },
    {
      "id": "7032244696",
      "name": "CP Y11 (2017-18)",
      "descriptionHeading": "Y11 (2017-18)",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-08-11T04:51:17.881Z",
      "updateTime": "2018-02-09T05:54:37.458Z",
      "enrollmentCode": "cpu3pp0",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzMjI0NDY5Nlpa",
      "teacherGroupEmail": "Y11_2017_18_teachers_fbb0bfaa@hope.edu.kh",
      "courseGroupEmail": "Y11_2017_18_5513ed6f@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfjdyckRHZDdtVGtfdnlNeVZ3R0VoMTBzdTg4MHBvakhNV2xPRGhYdGM4N1E"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9f3e0c99@group.calendar.google.com"
    },
    {
      "id": "7031239293",
      "name": "CP Y12 (2017-18)",
      "descriptionHeading": "Y12 (2017-18)",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-08-11T04:40:39.387Z",
      "updateTime": "2018-02-09T05:54:32.835Z",
      "enrollmentCode": "y70enzf",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAzMTIzOTI5M1pa",
      "teacherGroupEmail": "Y12_2017_18_teachers_0d19b5c9@hope.edu.kh",
      "courseGroupEmail": "Y12_2017_18_6bf190ff@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfjE2RFpPeDJpd255LWNlQVctNFBxQ2FMYnFiTnY0WHFkZWhEanYxT2xWeU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9c10856c@group.calendar.google.com"
    },
    {
      "id": "7025911787",
      "name": "Christian living 8/9/10",
      "descriptionHeading": "Christian living 8/9/10 (2017 -2018)",
      "ownerId": "109845242716981282366",
      "creationTime": "2017-08-10T08:18:58.642Z",
      "updateTime": "2017-08-10T08:29:07.108Z",
      "enrollmentCode": "fg5rdkj",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAyNTkxMTc4N1pa",
      "teacherGroupEmail": "Christian_living_8_9_10_teachers_dd053a72@hope.edu.kh",
      "courseGroupEmail": "Christian_living_8_9_10_381dc8f9@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fl83Rjl4S0xFbWxqa2JNSktUWmJMZkJRSzhnTjRsZk1FMjE4SEp5OXhDR1E"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome4a9380c@group.calendar.google.com"
    },
    {
      "id": "7025479548",
      "name": "Khmer9",
      "descriptionHeading": "Khmer 9/10",
      "ownerId": "108280369740508645862",
      "creationTime": "2017-08-10T08:17:17.698Z",
      "updateTime": "2017-08-10T08:18:00.715Z",
      "enrollmentCode": "2a3c7s1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAyNTQ3OTU0OFpa",
      "teacherGroupEmail": "Khmer9_teachers_bae3186e@hope.edu.kh",
      "courseGroupEmail": "Khmer9_265c10eb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9zGeMQgmevNfkF3cFQ5MmtyYzRUazcwNzZuWVJSbUxGMDY3TTJhbHlqU0ZuREZDS3lLVVk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3831b254@group.calendar.google.com"
    },
    {
      "id": "7025664401",
      "name": "Khmer Year  7 & 8",
      "descriptionHeading": "Khmer Year 7 & 8",
      "ownerId": "109713625823007827127",
      "creationTime": "2017-08-10T07:49:08.698Z",
      "updateTime": "2017-08-13T03:41:44.288Z",
      "enrollmentCode": "gctqlv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAyNTY2NDQwMVpa",
      "teacherGroupEmail": "Khmer_Year_6_7_teachers_20687217@hope.edu.kh",
      "courseGroupEmail": "Khmer_Year_6_7_f6331536@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5x5WRaNn1CSfms4Ni0tYTVIUUVsSXFQaHFlSDdjRDJycWxfRlFlRDJ1UG9BRlA5RnBwbDQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4687bda9@group.calendar.google.com"
    },
    {
      "id": "7025777166",
      "name": "Khmer 6/7/8",
      "descriptionHeading": "Khmer 6/7/8",
      "ownerId": "108280369740508645862",
      "creationTime": "2017-08-10T07:48:58.467Z",
      "updateTime": "2017-08-10T07:48:57.594Z",
      "enrollmentCode": "1i62lq",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAyNTc3NzE2Nlpa",
      "teacherGroupEmail": "Khmer_6_7_8_teachers_ac7571c4@hope.edu.kh",
      "courseGroupEmail": "Khmer_6_7_8_3c0f4678@hope.edu.kh",
      "teacherFolder": {
        "id": "0B9zGeMQgmevNfmItUWdoVWxDUkFLQnFuZ3RUamNrWnhEb0RwOEN4Y2FUdzJtMTlXT3NoTzQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom2f27bcd0@group.calendar.google.com"
    },
    {
      "id": "7025803697",
      "name": "6/ 7",
      "descriptionHeading": "Christian Living 6/7",
      "ownerId": "116578485452286869249",
      "creationTime": "2017-08-10T07:46:48.423Z",
      "updateTime": "2017-08-23T11:38:25.892Z",
      "enrollmentCode": "3rqyhwq",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAyNTgwMzY5N1pa",
      "teacherGroupEmail": "6_7_teachers_31255b6f@hope.edu.kh",
      "courseGroupEmail": "6_7_f6c4e7a1@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByPh_Mh6h4eMfk81ZlBmMEQwMjU1YWo5Z04xdzNhM183UjMtaVlmYnRaRXF0QzV4NXhmS2M"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4e7f2376@group.calendar.google.com"
    },
    {
      "id": "7015323799",
      "name": "Year 8 MUSIC",
      "descriptionHeading": "Year 8 MUSIC",
      "ownerId": "110760563115232207760",
      "creationTime": "2017-08-08T14:27:57.045Z",
      "updateTime": "2018-08-14T06:58:17.635Z",
      "enrollmentCode": "5m8hyl",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAxNTMyMzc5OVpa",
      "teacherGroupEmail": "Year_8_MUSIC_teachers_e8c12eda@hope.edu.kh",
      "courseGroupEmail": "Year_8_MUSIC_b224a0f9@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufm5VSElXdUZKc2FzUWFFVXNDRWxXM2VCcXpFbnoxbTd3VjZNR2Rmc2E2ZW8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3e119e27@group.calendar.google.com"
    },
    {
      "id": "7014975436",
      "name": "Year 7 MUSIC",
      "descriptionHeading": "Year 7 MUSIC",
      "ownerId": "110760563115232207760",
      "creationTime": "2017-08-08T14:11:00.545Z",
      "updateTime": "2018-08-14T06:58:24.401Z",
      "enrollmentCode": "vxy5y",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAxNDk3NTQzNlpa",
      "teacherGroupEmail": "Year_7_MUSIC_teachers_81a5ea7e@hope.edu.kh",
      "courseGroupEmail": "Year_7_MUSIC_4c5ae036@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufmUzYl9kVGVtZThveURMWHpaUHlsLWhCaURUQlkwS0NVX3ZPSFVPc0hVY3M"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb2b90c13@group.calendar.google.com"
    },
    {
      "id": "7014642262",
      "name": "Year 6 CL",
      "descriptionHeading": "Year 6 CL",
      "ownerId": "109452503110193009866",
      "creationTime": "2017-08-08T07:26:41.290Z",
      "updateTime": "2017-08-24T02:15:10.563Z",
      "enrollmentCode": "tdxo6mf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAxNDY0MjI2Mlpa",
      "teacherGroupEmail": "Year_6_CL_teachers_42d5a978@hope.edu.kh",
      "courseGroupEmail": "Year_6_CL_e66848a2@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwXY8Ah2LuXhflFrdHRhZkZBVnJJdlhqMUVmOUgyNmpDUE1iWm1ybzF5VVJEeDF1RjFHcHM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma5342d8f@group.calendar.google.com"
    },
    {
      "id": "7013703939",
      "name": "Year 6 Pastoral Care",
      "section": "Year 6",
      "descriptionHeading": "Year 6 Pastoral Care Year 6",
      "ownerId": "109452503110193009866",
      "creationTime": "2017-08-08T07:23:51.338Z",
      "updateTime": "2017-08-08T07:23:50.434Z",
      "enrollmentCode": "krcn0n",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAxMzcwMzkzOVpa",
      "teacherGroupEmail": "Year_6_Pastoral_Care_Year_6_teachers_655fe920@hope.edu.kh",
      "courseGroupEmail": "Year_6_Pastoral_Care_Year_6_ad64504f@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwXY8Ah2LuXhfm45TndPdFp0Q1VVZHRQSWNLVmFLNDJrMmtCeFYwbVB6UVhJNEFuUGpmczA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom90e7e55c@group.calendar.google.com"
    },
    {
      "id": "7009558145",
      "name": "8 History 17-18",
      "descriptionHeading": "8 History",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-08-07T08:44:21.041Z",
      "updateTime": "2018-08-16T10:33:44.348Z",
      "enrollmentCode": "sn7d1k",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAwOTU1ODE0NVpa",
      "teacherGroupEmail": "8_History_teachers_594681cf@hope.edu.kh",
      "courseGroupEmail": "8_History_d756e4cc@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fjEyM3c0N0NsYlNVcTd2RjcxdF9HQXhwcmN6TFFfcy1lTFNkSnJDeWk2enM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomcae81bac@group.calendar.google.com"
    },
    {
      "id": "7008863739",
      "name": "6/7 Social Studies 17-18",
      "descriptionHeading": "6/7 Social Studies",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-08-07T08:41:12.696Z",
      "updateTime": "2018-08-16T10:33:37.587Z",
      "enrollmentCode": "kpyr3u",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAwODg2MzczOVpa",
      "teacherGroupEmail": "6_7_Social_Studies_teachers_f3840bea@hope.edu.kh",
      "courseGroupEmail": "6_7_Social_Studies_a2b3a463@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_flRmdUcyYUw0bTlvSmoyelFjYm5FWkdPamVBcnN5UWlNUHJ1NV8yY3FBMXc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd33ea669@group.calendar.google.com"
    },
    {
      "id": "7009727322",
      "name": "9 History",
      "section": "IGCSE",
      "descriptionHeading": "9 History IGCSE",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-08-07T08:35:27.918Z",
      "updateTime": "2018-08-16T10:32:22.193Z",
      "enrollmentCode": "6k48u9s",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzAwOTcyNzMyMlpa",
      "teacherGroupEmail": "9_History_IGCSE_teachers_473af2eb@hope.edu.kh",
      "courseGroupEmail": "9_History_IGCSE_7af31286@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fkNtUFR5c25wWk9qUGV0WklRWk90R0tRN015RUJRVmZZWmpHbTZ3SFZIbWc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom371b87eb@group.calendar.google.com"
    },
    {
      "id": "7003507638",
      "name": "Khmer class",
      "descriptionHeading": "Khmer class",
      "ownerId": "109713625823007827127",
      "creationTime": "2017-08-04T08:20:27.019Z",
      "updateTime": "2017-08-04T08:21:27.626Z",
      "enrollmentCode": "oyoclv2",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzAwMzUwNzYzOFpa",
      "teacherGroupEmail": "Khmer_class_teachers_b343a190@hope.edu.kh",
      "courseGroupEmail": "Khmer_class_4334ad81@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5x5WRaNn1CSfjdOTnhpWE1rb0Z6X2ozc0t1RTlYb05SckxLSmw3bkxKX2Vhb2kxN1lrSFk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom39039d77@group.calendar.google.com"
    },
    {
      "id": "6985983668",
      "name": "Y9 IGCSE Art (2017-2018)",
      "descriptionHeading": "Y9 IGCSE Art",
      "ownerId": "112022231024540234956",
      "creationTime": "2017-07-28T07:15:59.601Z",
      "updateTime": "2018-09-12T15:10:48.986Z",
      "enrollmentCode": "j2x68x",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njk4NTk4MzY2OFpa",
      "teacherGroupEmail": "Y10_IGCSE_Art_teachers_f4e0a0a7@hope.edu.kh",
      "courseGroupEmail": "Y10_IGCSE_Art_8548fb4c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByTPkAZtJDZ5fktVcEtPX2Z1X2laMFlmSVFfSUlYRnpNSHBtRy1WT09ydDI1RVM0NVd4X0E"
      },
      "courseMaterialSets": [
        {
          "title": "Syllabus IGCSE Art & Design 0400 2020-2022.pdf",
          "materials": [
            {
              "driveFile": {
                "id": "1sfx_e1SSf37HP-P_2JhvcNTteec38vqJ",
                "alternateLink": "https://drive.google.com/open?id=1sfx_e1SSf37HP-P_2JhvcNTteec38vqJ"
              }
            }
          ]
        },
        {
          "title": "Links to Helpful Examples",
          "materials": [
            {
              "link": {
                "url": "http://studentartguide.com",
                "title": "Welcome",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://studentartguide.com&a=AIYkKU-8D39LdQwnr4gLJPuUHw6C2I0Lag"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd9eb4c5e@group.calendar.google.com"
    },
    {
      "id": "6985526625",
      "name": "English 7",
      "descriptionHeading": "English 7",
      "ownerId": "101376001376489767934",
      "creationTime": "2017-07-28T01:56:13.388Z",
      "updateTime": "2017-07-28T02:00:33.750Z",
      "enrollmentCode": "j0th2gk",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njk4NTUyNjYyNVpa",
      "teacherGroupEmail": "English_7_teachers_29e09557@hope.edu.kh",
      "courseGroupEmail": "English_7_1899a40b@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByfnHSpTdBOBfnM5Q3NYejFZQzFVSGRxVXBNM2VNOHVjNzZFamlTUlU0Q281aDhocU5LeUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3909b8b5@group.calendar.google.com"
    },
    {
      "id": "6985681365",
      "name": "National History 2017-2018",
      "descriptionHeading": "National History 2017-2018",
      "ownerId": "101376001376489767934",
      "creationTime": "2017-07-28T01:55:35.790Z",
      "updateTime": "2018-08-17T07:26:24.117Z",
      "enrollmentCode": "i0olk4y",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njk4NTY4MTM2NVpa",
      "teacherGroupEmail": "National_History_2017_2018_teachers_d854d329@hope.edu.kh",
      "courseGroupEmail": "National_History_2017_2018_a99810ac@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByfnHSpTdBOBfkJWT2dzb0Ezcl91UDRKcDRHUUZxZC1CV0ZaWXp0TE5GQXZNZWcyT3B5RWc"
      },
      "courseMaterialSets": [
        {
          "title": "The Agricultural Revolution: Crash Course World History #1 Video",
          "materials": [
            {
              "youTubeVideo": {
                "id": "Yocja_N5s1I",
                "title": "The Agricultural Revolution: Crash Course World History #1",
                "alternateLink": "https://www.youtube.com/watch?v=Yocja_N5s1I",
                "thumbnailUrl": "https://i.ytimg.com/vi/Yocja_N5s1I/default.jpg"
              }
            }
          ]
        },
        {
          "title": "APA Style Blog",
          "materials": [
            {
              "link": {
                "url": "http://blog.apastyle.org/apastyle/",
                "title": "APA Style Blog",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://blog.apastyle.org/apastyle/&a=AIYkKU_0cp6iOxpE4ykXi7SX9HYV-KaUyQ"
              }
            }
          ]
        },
        {
          "title": "United Nations Group of \n\n      Experts on Geographical Names (UNGEGN) website link",
          "materials": [
            {
              "link": {
                "url": "https://unstats.un.org/UNSD/geoinfo/UNGEGN/countrylinks.html",
                "title": "UNGEGN - United Nations Group of Experts on Geographical Names",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://unstats.un.org/UNSD/geoinfo/UNGEGN/countrylinks.html&a=AIYkKU9uj4rqfETJg_Bp-04BlrowM8QJUg"
              }
            }
          ]
        },
        {
          "title": "The Man Who Built Cambodia",
          "materials": [
            {
              "youTubeVideo": {
                "id": "OE3VLLgjydI",
                "alternateLink": "https://www.youtube.com/watch?v=OE3VLLgjydI"
              }
            }
          ]
        },
        {
          "title": "Link for Sample APA Paper",
          "materials": [
            {
              "link": {
                "url": "http://bowvalleycollege.libguides.com/ld.php?content_id=32092211",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://bowvalleycollege.libguides.com/ld.php?content_id%3D32092211&a=AIYkKU-mF7h_VcMwf232pXdnTk1pxXvBSg"
              }
            }
          ]
        },
        {
          "title": "Link for Finding and Citing Images APA Style",
          "materials": [
            {
              "link": {
                "url": "https://bowvalleycollege.libguides.com/ld.php?content_id=24566958",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://bowvalleycollege.libguides.com/ld.php?content_id%3D24566958&a=AIYkKU8nN983ub2xnXt6katUe7Siqk8a2g"
              }
            }
          ]
        },
        {
          "title": "Quick Start Guide to APA Style Citation",
          "materials": [
            {
              "link": {
                "url": "https://bowvalleycollege.libguides.com/ld.php?content_id=11499305",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://bowvalleycollege.libguides.com/ld.php?content_id%3D11499305&a=AIYkKU_D0KzDT9ISQHM8sF8T2KahM8CChQ"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7644c457@group.calendar.google.com"
    },
    {
      "id": "6984016852",
      "name": "Science Y6",
      "descriptionHeading": "Science Y6",
      "ownerId": "105047164691301773564",
      "creationTime": "2017-07-27T09:18:21.092Z",
      "updateTime": "2018-08-30T02:38:09.927Z",
      "enrollmentCode": "3cebxvo",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njk4NDAxNjg1Mlpa",
      "teacherGroupEmail": "Science_Y6_teachers_398d3428@hope.edu.kh",
      "courseGroupEmail": "Science_Y6_f8553195@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfkxWN09id0ZhelduT1VfUUI3UnRvMWpOTjlOZTJKd2lNQURfaXZISkcwcTA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom89ae94f7@group.calendar.google.com"
    },
    {
      "id": "6984163146",
      "name": "Physics Y10 2017-18",
      "descriptionHeading": "Physics Y10",
      "ownerId": "105047164691301773564",
      "creationTime": "2017-07-27T09:17:25.602Z",
      "updateTime": "2018-08-20T15:27:40.870Z",
      "enrollmentCode": "cus19ga",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njk4NDE2MzE0Nlpa",
      "teacherGroupEmail": "Physics_Y10_teachers_6f29ba68@hope.edu.kh",
      "courseGroupEmail": "Physics_Y10_be8ce3ab@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfndaTzh1dUt2dW42eEJOMzJRUnhJdnJGQTgzYXdHRUpFeGZaOUNUN19mdlk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4178e7f6@group.calendar.google.com"
    },
    {
      "id": "6870212321",
      "name": "2018 IB Physics SL",
      "descriptionHeading": "2018 IB Physics SL",
      "ownerId": "112644773599177931542",
      "creationTime": "2017-06-05T06:32:06.940Z",
      "updateTime": "2018-08-17T07:18:57.137Z",
      "enrollmentCode": "ir17l5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njg3MDIxMjMyMVpa",
      "teacherGroupEmail": "2018_IB_Physics_SL_teachers_35a62979@hope.edu.kh",
      "courseGroupEmail": "2018_IB_Physics_SL_f1491218@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fk8xYzZzTWRfZWd2czFMS1dDdTM5M0xqUDVuS1JyOFVFb1IzanphVndMZ2M"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7389d118@group.calendar.google.com"
    },
    {
      "id": "6869532273",
      "name": "7EW",
      "section": "7EW",
      "descriptionHeading": "7EW 7EW",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-06-05T02:38:23.850Z",
      "updateTime": "2017-06-05T02:38:22.903Z",
      "enrollmentCode": "yfvlqjv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Njg2OTUzMjI3M1pa",
      "teacherGroupEmail": "7EW_7EW_teachers_14d4f7ce@hope.edu.kh",
      "courseGroupEmail": "7EW_7EW_599605a7@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfk9obFg2VGJHem5sV0UwNEoxU1pnNVIxWWZhUktqU2RZVXBwVDZhdXVZT1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom33949173@group.calendar.google.com"
    },
    {
      "id": "6869596308",
      "name": "CP8",
      "section": "8PR, 8RSM",
      "descriptionHeading": "CP8",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-06-05T02:25:54.948Z",
      "updateTime": "2018-04-03T07:04:31.864Z",
      "enrollmentCode": "b0yav5s",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njg2OTU5NjMwOFpa",
      "teacherGroupEmail": "CP8_8PR_teachers_c3017cdc@hope.edu.kh",
      "courseGroupEmail": "CP8_8PR_bb67fad0@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfkVBaEd2anNrYWYtVTZGQ2JLeVJkSTVjMjRVLW1JeS00SWdJczVlV2ttanM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb70670ec@group.calendar.google.com"
    },
    {
      "id": "6841789617",
      "name": "PE Yr 8",
      "descriptionHeading": "PE Y8",
      "ownerId": "106622560452336024633",
      "creationTime": "2017-05-30T07:56:29.199Z",
      "updateTime": "2018-08-23T01:27:59.408Z",
      "enrollmentCode": "dnd6b1",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Njg0MTc4OTYxN1pa",
      "teacherGroupEmail": "PE_Y7_teachers_a84fb72c@hope.edu.kh",
      "courseGroupEmail": "PE_Y7_781e26de@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-fjgzQklCYXNFVjlLR1RuTmdPcHZYSEhjWXU2V3BBUUNFaHZhRnNYcklVUTQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom3222e07c@group.calendar.google.com"
    },
    {
      "id": "6841417964",
      "name": "PE Y7",
      "descriptionHeading": "PE Y7",
      "ownerId": "105666599265309194719",
      "creationTime": "2017-05-30T04:30:09.033Z",
      "updateTime": "2017-08-23T02:38:44.694Z",
      "enrollmentCode": "t27ed3n",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Njg0MTQxNzk2NFpa",
      "teacherGroupEmail": "PE_Y6_teachers_befcc07d@hope.edu.kh",
      "courseGroupEmail": "PE_Y6_98f58bb7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-fmtTR3VkMGpFSWJ6djc0TEZTRFM2U2Y5emRXUVNJbjJ2djJwZWRnMmNsdkk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombe5f9f59@group.calendar.google.com"
    },
    {
      "id": "6814487312",
      "name": "Year 9 GEO Class - 2016-17",
      "section": "High School",
      "descriptionHeading": "Year 9 GEO Class - 2016-17 High School",
      "ownerId": "106227117103566014299",
      "creationTime": "2017-05-24T08:11:50.824Z",
      "updateTime": "2017-05-24T08:11:49.878Z",
      "enrollmentCode": "4mvppk",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjgxNDQ4NzMxMlpa",
      "teacherGroupEmail": "Year_9_GEO_Class_2016_17_High_School_teachers_185d6e30@hope.edu.kh",
      "courseGroupEmail": "Year_9_GEO_Class_2016_17_High_School_3fdb548b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0uDhIphprWUfndhZGZvWDUxVWxyNHNCcmhhcWY3eV9QSE9MV2FDd2lDUmdXOWNUNmU0a2s"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma9c12e45@group.calendar.google.com"
    },
    {
      "id": "6804092634",
      "name": "2018 IB Maths SL",
      "descriptionHeading": "2018 IB Maths SL",
      "ownerId": "112644773599177931542",
      "creationTime": "2017-05-23T06:55:22.164Z",
      "updateTime": "2018-08-17T07:19:02.322Z",
      "enrollmentCode": "p7eft0p",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjgwNDA5MjYzNFpa",
      "teacherGroupEmail": "2018_IB_Maths_SL_teachers_f5c14f4c@hope.edu.kh",
      "courseGroupEmail": "2018_IB_Maths_SL_35d3f998@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fmtDaWt1Y3VyZW9GWnREYnBIOHpEaWZaUmxDb08zQU4yM3VKdkFMdElLdE0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom14f5ce29@group.calendar.google.com"
    },
    {
      "id": "6419665932",
      "name": "TOK 12",
      "descriptionHeading": "TOK 11",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-05-11T06:07:02.460Z",
      "updateTime": "2017-11-16T08:02:51.489Z",
      "enrollmentCode": "l9mta3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjQxOTY2NTkzMlpa",
      "teacherGroupEmail": "TOK_11_teachers_0371a3fb@hope.edu.kh",
      "courseGroupEmail": "TOK_11_c5ca0b80@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpflA3cDh1bXJSMmd5SkxIUXpiMGlWeEk0b2FHZzZHR1FMWVB3dDdQZlNSOWs"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombfdeafe3@group.calendar.google.com"
    },
    {
      "id": "6355224600",
      "name": "Worship Team",
      "descriptionHeading": "Worship Team",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-05-04T08:11:14.652Z",
      "updateTime": "2018-04-03T07:04:55.279Z",
      "enrollmentCode": "x4kz4i",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjM1NTIyNDYwMFpa",
      "teacherGroupEmail": "Worship_Team_teachers_ba26b52e@hope.edu.kh",
      "courseGroupEmail": "Worship_Team_59c59923@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpfi05SFJibmYyS3FmZktEb1BQUWpwTDhrZFNOaDlXMWItaU1fVU9OdC1lWmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome989712b@group.calendar.google.com"
    },
    {
      "id": "6355201857",
      "name": "6IP CL",
      "descriptionHeading": "Year 6IP CL",
      "ownerId": "110760563115232207760",
      "creationTime": "2017-05-04T06:22:10.399Z",
      "updateTime": "2017-08-17T11:27:37.635Z",
      "enrollmentCode": "avh2wrm",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjM1NTIwMTg1N1pa",
      "teacherGroupEmail": "Year_6_CL_teachers_1a3b8ca5@hope.edu.kh",
      "courseGroupEmail": "Year_6_CL_b6106680@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufnE3dDZYVkdJeTd2TVUyLS1YdFhkVThTYi03Ums3MjNqazFOUXRwODl0MEk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7dda41d8@group.calendar.google.com"
    },
    {
      "id": "6329913922",
      "name": "Youth Alpha Q and A",
      "descriptionHeading": "Youth Alpha Q and A",
      "ownerId": "109452503110193009866",
      "creationTime": "2017-05-02T03:29:52.182Z",
      "updateTime": "2017-05-02T04:06:20.515Z",
      "enrollmentCode": "yd5rn8z",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjMyOTkxMzkyMlpa",
      "teacherGroupEmail": "Youth_Alpha_Q_and_A_teachers_15f2da4e@hope.edu.kh",
      "courseGroupEmail": "Youth_Alpha_Q_and_A_4071a68b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwXY8Ah2LuXhfjZwQldpZk5TZi12REdYU1daMjd0VkNfVUMzMFZtRWFVQm5sSjRoR1RSUUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom740c5a18@group.calendar.google.com"
    },
    {
      "id": "6299884609",
      "name": "Fake Class",
      "descriptionHeading": "Fake Class",
      "ownerId": "118196766757121885917",
      "creationTime": "2017-04-28T00:42:17.059Z",
      "updateTime": "2017-04-28T00:42:15.792Z",
      "enrollmentCode": "cfk0oj",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjI5OTg4NDYwOVpa",
      "teacherGroupEmail": "Fake_Class_teachers_86c4daa1@hope.edu.kh",
      "courseGroupEmail": "Fake_Class_a5f8c06a@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bxye1VxKveOlfndSWHJzN1QxM014ZE4ycEFlM1ZoUEtGeXVhNlBwXzVhQ0pFZWFFU01HM0k"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom93222625@group.calendar.google.com"
    },
    {
      "id": "6274574039",
      "name": "CP6",
      "descriptionHeading": "CP6",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-04-26T08:21:09.547Z",
      "updateTime": "2018-04-03T07:04:49.583Z",
      "enrollmentCode": "aq7559",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjI3NDU3NDAzOVpa",
      "teacherGroupEmail": "CP6_teachers_f4597438@hope.edu.kh",
      "courseGroupEmail": "CP6_cb355048@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2Rpflp4T3lUQXp2Rk43UnM5ZFVUQUR3bUlkMk9IbXgwd1dISWZ2SDNNMzAxaEU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc54c7b07@group.calendar.google.com"
    },
    {
      "id": "6274339739",
      "name": "Year 6 MUSIC",
      "descriptionHeading": "Year 6 MUSIC",
      "ownerId": "110760563115232207760",
      "creationTime": "2017-04-26T08:17:09.709Z",
      "updateTime": "2018-08-14T06:58:30.062Z",
      "enrollmentCode": "bqrnsu",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjI3NDMzOTczOVpa",
      "teacherGroupEmail": "Year_6_MUSIC_teachers_1ebd551f@hope.edu.kh",
      "courseGroupEmail": "Year_6_MUSIC_2fda9ec1@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiuflNvMEpyTmxnUFB0d2oza05TWjJiSjl5blBJb3Rmd0N3M1ZyRjM5T2RzdjA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom80dbac7e@group.calendar.google.com"
    },
    {
      "id": "6274468535",
      "name": "Training",
      "descriptionHeading": "Training",
      "ownerId": "102003547718393718946",
      "creationTime": "2017-04-26T08:14:45.103Z",
      "updateTime": "2017-04-26T11:57:36.516Z",
      "enrollmentCode": "ng1dls",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjI3NDQ2ODUzNVpa",
      "teacherGroupEmail": "Training_teachers_9b9f5c2b@hope.edu.kh",
      "courseGroupEmail": "Training_7b50fa35@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfmpEVWdxemVXUDBHakljZDlUa3lqb2F4OUhGZUFhRFdNNEowQ0tfc3ktNG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4a8cc020@group.calendar.google.com"
    },
    {
      "id": "6274636992",
      "name": "practice class",
      "section": "pp",
      "descriptionHeading": "practice class pp",
      "ownerId": "111511272712109869545",
      "creationTime": "2017-04-26T08:14:21.132Z",
      "updateTime": "2017-04-26T08:14:19.717Z",
      "enrollmentCode": "vdljzh4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjI3NDYzNjk5Mlpa",
      "teacherGroupEmail": "practice_class_pp_teachers_eb2fc327@hope.edu.kh",
      "courseGroupEmail": "practice_class_pp_c2878766@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2bblCzLbPVOflFEV05ka3FtVnJ6Wlo4SnQ5OTVsMGVJclBLMm1ud3o5MXRablZLXzd0VXc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2285e2c4@group.calendar.google.com"
    },
    {
      "id": "6274492750",
      "name": "Fake class",
      "descriptionHeading": "Fake class",
      "ownerId": "106227117103566014299",
      "creationTime": "2017-04-26T08:12:49.917Z",
      "updateTime": "2017-04-26T08:12:48.431Z",
      "enrollmentCode": "u9sxp8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjI3NDQ5Mjc1MFpa",
      "teacherGroupEmail": "Fake_class_teachers_96ff0620@hope.edu.kh",
      "courseGroupEmail": "Fake_class_4e07bc84@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0uDhIphprWUflVGaTJrYTg1a0w1dDhxZ0h0LUFxY240YmV2dWU2UWJqdmhweGRyY3VqbUE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc1f437c7@group.calendar.google.com"
    },
    {
      "id": "6274375265",
      "name": "Pseudo class training",
      "descriptionHeading": "Pseudo class training",
      "ownerId": "115587463545633093027",
      "creationTime": "2017-04-26T08:12:41.058Z",
      "updateTime": "2017-04-26T08:12:39.721Z",
      "enrollmentCode": "nwxi2yr",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjI3NDM3NTI2NVpa",
      "teacherGroupEmail": "Pseudo_class_training_teachers_644c4a95@hope.edu.kh",
      "courseGroupEmail": "Pseudo_class_training_2a5a7479@hope.edu.kh",
      "teacherFolder": {
        "id": "0B__ejNZ_YZSJfkNBQ2ZnV1gtTWxnY09HWXVlTGlLbXNTRnFFcXhZMnJCUlhfYlNPNTR6OUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomae43eb81@group.calendar.google.com"
    },
    {
      "id": "6274667980",
      "name": "CP7",
      "section": "7CK, 7EW",
      "descriptionHeading": "Year 7 1",
      "ownerId": "105682420620679346959",
      "creationTime": "2017-04-26T08:12:18.316Z",
      "updateTime": "2018-04-03T07:04:42.892Z",
      "enrollmentCode": "mux7no",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjI3NDY2Nzk4MFpa",
      "teacherGroupEmail": "Year_7_1_teachers_829c5a94@hope.edu.kh",
      "courseGroupEmail": "Year_7_1_13839c46@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzV9BTf3s2RpfnNXSVJXNE5yaW8waHhwaFNWUS1hREwwNlBlbmxudTNBdlNsQzM5WEM0MU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome6f9278a@group.calendar.google.com"
    },
    {
      "id": "6274579642",
      "name": "Mrs Cath",
      "descriptionHeading": "Mrs Cath",
      "ownerId": "116366543913951172958",
      "creationTime": "2017-04-26T08:12:00.545Z",
      "updateTime": "2017-04-26T08:11:59.052Z",
      "enrollmentCode": "w9apnw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjI3NDU3OTY0Mlpa",
      "teacherGroupEmail": "Mrs_Cath_teachers_1c65051d@hope.edu.kh",
      "courseGroupEmail": "Mrs_Cath_82db38ff@hope.edu.kh",
      "teacherFolder": {
        "id": "0B13JpIzcWjBwfmF5S0hUcFNjcF9ESTJjV0toOENIak5TUE10VW9Velg3VUltc3BiZHQtWmM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom07abb0d4@group.calendar.google.com"
    },
    {
      "id": "6274599630",
      "name": "FAKE",
      "descriptionHeading": "FAKE",
      "ownerId": "110575928947711158789",
      "creationTime": "2017-04-26T08:10:49.345Z",
      "updateTime": "2017-08-17T03:37:10.805Z",
      "enrollmentCode": "myjhqz5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjI3NDU5OTYzMFpa",
      "teacherGroupEmail": "FAKE_teachers_be603d53@hope.edu.kh",
      "courseGroupEmail": "FAKE_1c62dfca@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfmh0TzJPM21LVDV6Qjg0a2N1eV9udnZfT19USGF5MUd3N2lPRE52Tm9ZZXc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc944d4d8@group.calendar.google.com"
    },
    {
      "id": "6274635516",
      "name": "Class Awesome",
      "descriptionHeading": "Class Awesome",
      "ownerId": "113917612521896405543",
      "creationTime": "2017-04-26T08:10:16.965Z",
      "updateTime": "2017-08-18T10:41:01.343Z",
      "enrollmentCode": "fejy5p",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjI3NDYzNTUxNlpa",
      "teacherGroupEmail": "Class_Awesome_teachers_99dd6eaf@hope.edu.kh",
      "courseGroupEmail": "Class_Awesome_ab1203f2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B8Gv9E_yA4T2fmtybGY5RmUtalVEemc0T0JBUkRabjdOaURaWnI3WVlOMDRJSnAzQTNLTlU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom40c45d00@group.calendar.google.com"
    },
    {
      "id": "6079015031",
      "name": "PD",
      "descriptionHeading": "PD Wednesdays Management",
      "ownerId": "105047164691301773564",
      "creationTime": "2017-04-04T01:54:26.004Z",
      "updateTime": "2017-08-24T08:04:04.171Z",
      "enrollmentCode": "n6465q",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NjA3OTAxNTAzMVpa",
      "teacherGroupEmail": "PD_Wednesdays_Management_teachers_94a9cb2b@hope.edu.kh",
      "courseGroupEmail": "PD_Wednesdays_Management_0413b1e1@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfm9VREJyTFN3S1NxU1Ryejh5STBpN0hJbkRMdU5BOW1xMFFIS1NiUU5qeEU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom06af4cd3@group.calendar.google.com"
    },
    {
      "id": "6063493076",
      "name": "2345 SOSE",
      "descriptionHeading": "2345 SOSE",
      "ownerId": "102901680215958631694",
      "creationTime": "2017-04-03T03:38:42.772Z",
      "updateTime": "2017-04-03T03:38:41.302Z",
      "enrollmentCode": "zyfnva",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NjA2MzQ5MzA3Nlpa",
      "teacherGroupEmail": "2345_SOSE_teachers_e52bef4b@hope.edu.kh",
      "courseGroupEmail": "2345_SOSE_ccdfe31c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fnJvU0lQN3RUdHNwUWVFQ0t2VGJtNUJSdVJJeDhhQS1tdjVhcDFqQVota2c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom05a4c649@group.calendar.google.com"
    },
    {
      "id": "4900364911",
      "name": "4-5 Extension",
      "descriptionHeading": "4-5 Extension",
      "description": "Integrated Studies - Extreme Earth!",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-03-21T08:54:11.906Z",
      "updateTime": "2017-08-07T08:31:11.413Z",
      "enrollmentCode": "za8dhx",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDkwMDM2NDkxMVpa",
      "teacherGroupEmail": "4_5_Extension_teachers_e309b1f3@hope.edu.kh",
      "courseGroupEmail": "4_5_Extension_2c0944ed@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fmFWYUhmVnhrNnIxUXJEZm9TdzRoR25rWVg4MllnR0VsTmhlOEp2TWxnVTg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma1ebbfe1@group.calendar.google.com"
    },
    {
      "id": "4798085408",
      "name": "8PR Christian living",
      "descriptionHeading": "8PR Christian living",
      "ownerId": "109452503110193009866",
      "creationTime": "2017-03-09T04:21:48.332Z",
      "updateTime": "2017-08-08T07:20:25.982Z",
      "enrollmentCode": "vbi4n96",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDc5ODA4NTQwOFpa",
      "teacherGroupEmail": "8PR_Christian_living_teachers_b281a635@hope.edu.kh",
      "courseGroupEmail": "8PR_Christian_living_094b3df5@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwXY8Ah2LuXhfkxqT3lnZmllRlpMNVE3eXZWaFc3NGF5TWdyNV8zb0ZCTUVuMGxGOEZLQUk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom55b28aca@group.calendar.google.com"
    },
    {
      "id": "4797390082",
      "name": "Science Y5",
      "descriptionHeading": "Science Y5",
      "ownerId": "105666599265309194719",
      "creationTime": "2017-03-09T01:50:42.786Z",
      "updateTime": "2017-11-07T03:06:48.431Z",
      "enrollmentCode": "3k2eq",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDc5NzM5MDA4Mlpa",
      "teacherGroupEmail": "Science_Y5_teachers_8d3ff11c@hope.edu.kh",
      "courseGroupEmail": "Science_Y5_9b29539e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2ysEPszWrU-fl9ubGdVek9aemZ5MTkxd3A1SHI2SkJ1dkQ2Y2FDQkk0Wm9WLV9tSlZweEE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom61c9395e@group.calendar.google.com"
    },
    {
      "id": "4770639217",
      "name": "CPY12",
      "descriptionHeading": "CPY12-2017",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-03-07T04:00:39.911Z",
      "updateTime": "2017-08-24T07:58:52.914Z",
      "enrollmentCode": "xua6aas",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDc3MDYzOTIxN1pa",
      "teacherGroupEmail": "CPY12_teachers_82670ec0@hope.edu.kh",
      "courseGroupEmail": "CPY12_c6cfdf57@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXflRIV2JCamtDQ0tmNEgwR0FpX1k3NE5KR1JIMjk3SkxWM09YUW9GRjRCeU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom2dbdc1fc@group.calendar.google.com"
    },
    {
      "id": "4770632946",
      "name": "CPY11",
      "descriptionHeading": "CPY12-2017-18",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-03-07T04:00:18.523Z",
      "updateTime": "2017-08-24T07:59:00.452Z",
      "enrollmentCode": "8hwy3s",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDc3MDYzMjk0Nlpa",
      "teacherGroupEmail": "CPY11_teachers_6a72b98f@hope.edu.kh",
      "courseGroupEmail": "CPY11_f82c8c10@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfkh1RHNPWVl2TjF5MzlfOExhY2MxMTRFcnB6VEtOeldUYkRJN2k1djJOajQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome315c1dd@group.calendar.google.com"
    },
    {
      "id": "4770698754",
      "name": "CPY10",
      "descriptionHeading": "CPY10",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-03-07T03:59:44.063Z",
      "updateTime": "2017-08-24T07:59:09.903Z",
      "enrollmentCode": "7lsxwt",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDc3MDY5ODc1NFpa",
      "teacherGroupEmail": "CPY10_teachers_0fd1d82d@hope.edu.kh",
      "courseGroupEmail": "CPY10_aaaecf00@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfktMZzl1RFk2LUVjNWd0NEx1VFZCSkgxV3ZTSzBab0p3eVRna25jd204bkU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomcf49c70c@group.calendar.google.com"
    },
    {
      "id": "1022997096",
      "name": "CPY9",
      "descriptionHeading": "CPY9",
      "ownerId": "106362883448493695223",
      "creationTime": "2017-03-07T03:53:47.596Z",
      "updateTime": "2017-08-24T07:59:15.738Z",
      "enrollmentCode": "g1ddijk",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTAyMjk5NzA5Nlpa",
      "teacherGroupEmail": "CPY9_teachers_d0132f2d@hope.edu.kh",
      "courseGroupEmail": "CPY9_8a6a7526@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzDyp0EkmJOXfklDRUFjamoya1J4bWwtbGhzZ0FFN1hzazhGWDZocmFrU243bmQzZzFnbDg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7c14cbf8@group.calendar.google.com"
    },
    {
      "id": "4753005879",
      "name": "English 9",
      "section": "Mrs Boring",
      "descriptionHeading": "English 9 Mrs Boring",
      "ownerId": "101376001376489767934",
      "creationTime": "2017-03-05T08:20:09.782Z",
      "updateTime": "2017-08-15T21:45:40.201Z",
      "enrollmentCode": "2h0afqk",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDc1MzAwNTg3OVpa",
      "teacherGroupEmail": "English_9_Mrs_Boring_teachers_999dd4ea@hope.edu.kh",
      "courseGroupEmail": "English_9_Mrs_Boring_986acea1@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByfnHSpTdBOBfjFLV3pCakJ6TzI0YXBDYnlnV1NHR3h1WXhIdmJQMDhReDdBQld6S1J2TW8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome0a02d8a@group.calendar.google.com"
    },
    {
      "id": "4686334066",
      "name": "English Years 6, 7 and 8",
      "descriptionHeading": "English Years 6, 7 and 8",
      "ownerId": "115986378965778821966",
      "creationTime": "2017-02-27T04:17:23.719Z",
      "updateTime": "2017-02-27T04:17:21.768Z",
      "enrollmentCode": "agchnz",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NDY4NjMzNDA2Nlpa",
      "teacherGroupEmail": "English_Years_6_7_and_8_teachers_fb275e06@hope.edu.kh",
      "courseGroupEmail": "English_Years_6_7_and_8_7e8059ea@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfjdyUy1ZZmlwSXZRaFdmRHBLOUM1Y0hQcjRlMDlLNGM4NkR1QXY1ZVRCMjA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom31056e83@group.calendar.google.com"
    },
    {
      "id": "4646628436",
      "name": "Y5 Reading Challenge",
      "descriptionHeading": "Y5 Reading Challenge",
      "ownerId": "112059668510514241292",
      "creationTime": "2017-02-22T13:29:19.136Z",
      "updateTime": "2017-02-22T13:29:17.163Z",
      "enrollmentCode": "frjf4u",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NDY0NjYyODQzNlpa",
      "teacherGroupEmail": "Y5_Reading_Challenge_teachers_4120928f@hope.edu.kh",
      "courseGroupEmail": "Y5_Reading_Challenge_cb0bd8aa@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fkhnVE14R1ZoVEZqWlVhUXF6akdOdnpXMWNLRFJ2dHEzaGFYS01fVWM4a2M"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9e168311@group.calendar.google.com"
    },
    {
      "id": "4014694092",
      "name": "SR910 ICT",
      "descriptionHeading": "Grade 9/10 SR IT",
      "room": "https://hangouts.google.com/group/64PiFQf24pzPwHXs1",
      "ownerId": "107554112463094781867",
      "creationTime": "2017-01-22T12:36:52.475Z",
      "updateTime": "2018-08-13T18:44:55.543Z",
      "enrollmentCode": "bookyx",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NDAxNDY5NDA5Mlpa",
      "teacherGroupEmail": "SR_IT_teachers_b4e6b0f6@hope.edu.kh",
      "courseGroupEmail": "SR_IT_226e572b@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfkF0NktyN0tJMDZHU05NbHhXdjk2MTNVblp1cThZb2dlRGV0WHlBWmQ0N1U"
      },
      "courseMaterialSets": [
        {
          "title": "Hangout for SR IT 910",
          "materials": [
            {
              "link": {
                "url": "https://hangouts.google.com/group/64PiFQf24pzPwHXs1",
                "title": "Google Hangouts",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://hangouts.google.com/group/64PiFQf24pzPwHXs1&a=AIYkKU-gCRyd7dXqr6abmdU3H5LlfhU-hA"
              }
            }
          ]
        },
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6McC1wU2hRNTJaeG8",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6McC1wU2hRNTJaeG8"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MZTNLU3FhZ0xOeWc",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MZTNLU3FhZ0xOeWc"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8f62d534@group.calendar.google.com"
    },
    {
      "id": "3888254210",
      "name": "10 History",
      "section": "IGCSE",
      "descriptionHeading": "9 History",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-01-06T07:11:05.696Z",
      "updateTime": "2018-08-06T08:57:31.518Z",
      "enrollmentCode": "gnhp1v",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Mzg4ODI1NDIxMFpa",
      "teacherGroupEmail": "9_History_teachers_a7eb68a8@hope.edu.kh",
      "courseGroupEmail": "9_History_de42d710@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_flJKXzVHZHdZOU02cVJ4OGRSSHhnZHhwNkZjUHVZTUNQVXR5ZnVsNWwwYmc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf899a5fe@group.calendar.google.com"
    },
    {
      "id": "3887694058",
      "name": "10 History 16-17",
      "descriptionHeading": "10 History",
      "ownerId": "113635599462006979888",
      "creationTime": "2017-01-06T06:30:20.874Z",
      "updateTime": "2017-08-07T08:32:25.343Z",
      "enrollmentCode": "vs9npzk",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/Mzg4NzY5NDA1OFpa",
      "teacherGroupEmail": "10_History_teachers_185bf0c2@hope.edu.kh",
      "courseGroupEmail": "10_History_06169373@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fjIxNlNSblBvYkxRQWxkV1hJV0xua1pHSF9jdVJLRl8yYXZRQzlybGNiUDQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom24dc1cf2@group.calendar.google.com"
    },
    {
      "id": "3308280023",
      "name": "Vision in Action 2016-7",
      "descriptionHeading": "Vision in Action 2016-7",
      "description": "To encourage students to understand themselves better and to explore possible career options and ministry giftings.",
      "ownerId": "106106420441507218344",
      "creationTime": "2016-12-07T09:17:13.618Z",
      "updateTime": "2016-12-09T06:43:53.695Z",
      "enrollmentCode": "be4zgh4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MzMwODI4MDAyM1pa",
      "teacherGroupEmail": "Vision_in_Action_2016_7_teachers_16e5944d@hope.edu.kh",
      "courseGroupEmail": "Vision_in_Action_2016_7_1bb742fb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-KPUbsFLZ7hfnRMRkxCNXVsZC1tbExFcXB5aDVfaHk4T2tiZXFOQXZMVWtEdjBXbkU2OUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9c37110e@group.calendar.google.com"
    },
    {
      "id": "3308168677",
      "name": "VIA Service",
      "descriptionHeading": "VIA Service",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-12-07T04:13:04.085Z",
      "updateTime": "2016-12-07T04:25:18.241Z",
      "enrollmentCode": "f65q1b",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzMwODE2ODY3N1pa",
      "teacherGroupEmail": "VIA_Service_teachers_a4559a4f@hope.edu.kh",
      "courseGroupEmail": "VIA_Service_204191f6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MflZqSVlYUGxvV0NzOTNWeTFWVkItS2c2ckFjZVMxeE1Gajc1SmFvdmsxUUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd30ecb12@group.calendar.google.com"
    },
    {
      "id": "3410183932",
      "name": "IB Biology 2018",
      "descriptionHeading": "IB Biology 2018",
      "ownerId": "100362126255417413706",
      "creationTime": "2016-11-07T07:54:35.524Z",
      "updateTime": "2018-08-16T06:16:31.828Z",
      "enrollmentCode": "ipzct9",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzQxMDE4MzkzMlpa",
      "teacherGroupEmail": "IB_Biology_2018_teachers_a57c7472@hope.edu.kh",
      "courseGroupEmail": "IB_Biology_2018_99f95a12@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfnJYRzRZVU9KMjFQT2xNUERVX3E5TDJuaGFUbGVXSnRDSGVBZExwc0hfZ00"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4cdeae22@group.calendar.google.com"
    },
    {
      "id": "2866851295",
      "name": "Math 6",
      "descriptionHeading": "Math 6",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-10-26T14:40:24.179Z",
      "updateTime": "2016-10-26T14:40:22.441Z",
      "enrollmentCode": "6rld6d",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjg2Njg1MTI5NVpa",
      "teacherGroupEmail": "Math_6_teachers_e6e4802f@hope.edu.kh",
      "courseGroupEmail": "Math_6_43464a75@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fklqYzdMMTFuRU5pR0Q0aDJQOENBdmcwRElaeWxpQm9FRklmV1dfTnY3WTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom89ddff91@group.calendar.google.com"
    },
    {
      "id": "2822656986",
      "name": "Maths Y7",
      "descriptionHeading": "Maths Y7",
      "ownerId": "118196766757121885917",
      "creationTime": "2016-10-21T07:02:03.078Z",
      "updateTime": "2016-10-21T07:02:01.271Z",
      "enrollmentCode": "nxqd0lr",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjgyMjY1Njk4Nlpa",
      "teacherGroupEmail": "Maths_Y7_teachers_d4e8fa0c@hope.edu.kh",
      "courseGroupEmail": "Maths_Y7_7bc51b24@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bxye1VxKveOlfjdaT3F6RDVKUk9VSVk1dTRBdnh4b2FfQ3pWMVFmOGxleEVLLTY4cE9QSVU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf79bbfa8@group.calendar.google.com"
    },
    {
      "id": "2800355698",
      "name": "8910 Christian Living",
      "descriptionHeading": "8910 Christian Living",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-10-19T09:40:39.290Z",
      "updateTime": "2016-10-19T10:11:12.754Z",
      "enrollmentCode": "o6z61v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjgwMDM1NTY5OFpa",
      "teacherGroupEmail": "8910_Christian_Living_teachers_7d2c4b0e@hope.edu.kh",
      "courseGroupEmail": "8910_Christian_Living_b38b5f49@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fkpPcnpNaF9mS0VuWnZ4elFuR2l1dEpHWDVFUmE4cVp4bmJXclVrUDVDSEE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom8b93139a@group.calendar.google.com"
    },
    {
      "id": "2786542917",
      "name": "History 67",
      "descriptionHeading": "History 67",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-10-18T05:32:08.299Z",
      "updateTime": "2016-10-18T05:35:02.859Z",
      "enrollmentCode": "aaifevi",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc4NjU0MjkxN1pa",
      "teacherGroupEmail": "History_67_teachers_3ca8195d@hope.edu.kh",
      "courseGroupEmail": "History_67_7fa2ddb0@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fnFvZ0F3REFlZTZXU3ZMOHpWcWwyaXVZOEFqUEZHdGo1TlZ4YmpQZDBVQ0k"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom29621074@group.calendar.google.com"
    },
    {
      "id": "2786614725",
      "name": "Geography 67",
      "descriptionHeading": "Geography 67",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-10-18T05:30:43.456Z",
      "updateTime": "2016-11-18T01:02:09.994Z",
      "enrollmentCode": "m3jha71",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Mjc4NjYxNDcyNVpa",
      "teacherGroupEmail": "Geography_67_teachers_e37087ca@hope.edu.kh",
      "courseGroupEmail": "Geography_67_105bee9a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fmhuZ0JDZTRZdkMxT0tCMHZaa1cwMnhNXzE5Y3F0WHVVZkFJOEZXV09tRDg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom0222b4fa@group.calendar.google.com"
    },
    {
      "id": "2722828568",
      "name": "Year 10 History",
      "descriptionHeading": "Year 10 History",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-10-11T06:45:26.245Z",
      "updateTime": "2017-08-07T08:31:02.295Z",
      "enrollmentCode": "nqj1lj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjcyMjgyODU2OFpa",
      "teacherGroupEmail": "Year_10_History_teachers_70ae4faf@hope.edu.kh",
      "courseGroupEmail": "Year_10_History_6c8659a6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fmNNZV83bkNuaThYRVVtYXg4YUxKc3Z6dDV0anRRUUFvWTNpMlExb0d4cnM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb43f82ac@group.calendar.google.com"
    },
    {
      "id": "2674289451",
      "name": "Year 10 Travel & Tourism",
      "descriptionHeading": "Year 10 Travel & Tourism",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-10-05T07:19:15.245Z",
      "updateTime": "2016-11-02T04:28:12.498Z",
      "enrollmentCode": "p7s6f3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY3NDI4OTQ1MVpa",
      "teacherGroupEmail": "Year_10_Travel_Tourism_teachers_2daa97d4@hope.edu.kh",
      "courseGroupEmail": "Year_10_Travel_Tourism_faea83b3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fjBoMjNfQ1NlLUFDTUdES0RvYUNNbklzOU94elYyYmItMFRZcWdqR1ZGaXM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9c2fce3d@group.calendar.google.com"
    },
    {
      "id": "2673749506",
      "name": "Year 8 Geography",
      "descriptionHeading": "Year 8 Geography",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-10-05T01:38:25.429Z",
      "updateTime": "2016-10-05T01:38:23.955Z",
      "enrollmentCode": "pw8eu1w",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY3Mzc0OTUwNlpa",
      "teacherGroupEmail": "Year_8_Geography_teachers_2c270ca3@hope.edu.kh",
      "courseGroupEmail": "Year_8_Geography_452fc5da@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31flNZTHNzNC0tWnpoSm9oczl1b2JkaFEtRDRSV1ZIUVlleW5QRjVzSVRJUk0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom19bb6298@group.calendar.google.com"
    },
    {
      "id": "2619518451",
      "name": "Global Perspectives 10",
      "descriptionHeading": "Global Perspectives 10",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-09-29T04:31:00.285Z",
      "updateTime": "2016-09-29T04:30:58.866Z",
      "enrollmentCode": "a7nxvxa",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjYxOTUxODQ1MVpa",
      "teacherGroupEmail": "Global_Perspectives_10_teachers_26d11aee@hope.edu.kh",
      "courseGroupEmail": "Global_Perspectives_10_2cb653cd@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fjBVSnJGV1BqNk9HcExCenBBbXFlT2E0S2FielhGY0ZKV2tKOGJfWHRUTjA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomedfe27a8@group.calendar.google.com"
    },
    {
      "id": "2592422642",
      "name": "History 9",
      "descriptionHeading": "History 9",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-09-27T04:54:11.217Z",
      "updateTime": "2016-11-18T00:54:18.914Z",
      "enrollmentCode": "uodzjs",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjU5MjQyMjY0Mlpa",
      "teacherGroupEmail": "History_9_teachers_1cfd6e08@hope.edu.kh",
      "courseGroupEmail": "History_9_52259cad@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31fmFXVUVmcGxpN1pDUHRBNHJnbDAtSkYyMVp5MGxwUWpnd0xxdHRCMEV4Nkk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomb9304d65@group.calendar.google.com"
    },
    {
      "id": "2572554758",
      "name": "CP & CL",
      "descriptionHeading": "CP & CL",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-09-24T14:35:34.968Z",
      "updateTime": "2016-09-24T14:35:33.209Z",
      "enrollmentCode": "frup1i",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjU3MjU1NDc1OFpa",
      "teacherGroupEmail": "CP_CL_teachers_15c3c758@hope.edu.kh",
      "courseGroupEmail": "CP_CL_5c549a7b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfmNMdnBfaFZ6UE4wR3d5TTlvR0tHcURHRnhLcUhkWFg1UVRCX2UwS29NSkk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome3b504d1@group.calendar.google.com"
    },
    {
      "id": "2562343266",
      "name": "Year 8 History",
      "descriptionHeading": "Year 8 History",
      "ownerId": "102901680215958631694",
      "creationTime": "2016-09-23T03:38:46.468Z",
      "updateTime": "2016-11-02T04:20:03.493Z",
      "enrollmentCode": "dfgqy63",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjU2MjM0MzI2Nlpa",
      "teacherGroupEmail": "Year_8_History_teachers_fc4178bc@hope.edu.kh",
      "courseGroupEmail": "Year_8_History_8aed77da@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6XhUXCeSJ31flpKcUw4aWdSMHlCWGNBZ1NnSXpsYk1HZjJpOXBVM2ltdHdfWmw0UERXRVE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6c371900@group.calendar.google.com"
    },
    {
      "id": "2549620526",
      "name": "FORMAL COMMITTEE",
      "descriptionHeading": "FORMAL COMMITTEE",
      "room": "S14",
      "ownerId": "110627498288637945705",
      "creationTime": "2016-09-22T06:12:49.772Z",
      "updateTime": "2017-04-26T08:06:17.811Z",
      "enrollmentCode": "jwcs8iw",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjU0OTYyMDUyNlpa",
      "teacherGroupEmail": "FORMAL_COMMITTEE_teachers_ecc6f448@hope.edu.kh",
      "courseGroupEmail": "FORMAL_COMMITTEE_4ad9a592@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfjA1V3FZb0hxaUx4bXFNQjZVWFVWNG9CeHJGSmdGeXNKZ0RVanREVkRVQTA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom8268275f@group.calendar.google.com"
    },
    {
      "id": "2521369985",
      "name": "Year 5 North",
      "descriptionHeading": "Year 5 North",
      "ownerId": "118056716687842774738",
      "creationTime": "2016-09-20T06:28:03.994Z",
      "updateTime": "2016-09-20T08:02:18.619Z",
      "enrollmentCode": "oq2ory",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjUyMTM2OTk4NVpa",
      "teacherGroupEmail": "Year_5_North_teachers_86a64bbb@hope.edu.kh",
      "courseGroupEmail": "Year_5_North_97058a44@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bzr3ZvcHDw0ufnNFNDlUSTVPMUszdGh4SzBqNF9jSmp1UzYxLVcyNDk2Q1dzQ25sb0dYQkk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom209f7bfd@group.calendar.google.com"
    },
    {
      "id": "2507235099",
      "name": "Grade 10 Geography",
      "descriptionHeading": "Grade 10 Geography Coursework",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-09-19T12:56:03.928Z",
      "updateTime": "2018-05-07T12:16:19.037Z",
      "enrollmentCode": "354tsc",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjUwNzIzNTA5OVpa",
      "teacherGroupEmail": "Geography_Coursework_teachers_f6e97e22@hope.edu.kh",
      "courseGroupEmail": "Geography_Coursework_758eed13@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfmhTUGZpNHM0b2RqdS1ZYWFuY1Ytck55NzEtajAxNVNmYWZVMHgtQkd2bUU"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts for Geography Second Semester",
          "materials": [
            {
              "driveFile": {
                "id": "1dG5hRRx6cAPEBbvNgg2Z7ELJbXP7K5c8",
                "alternateLink": "https://drive.google.com/open?id=1dG5hRRx6cAPEBbvNgg2Z7ELJbXP7K5c8"
              }
            },
            {
              "driveFile": {
                "id": "1zjr1AUBRtsXPIKi3eUSfcpeT2DYazpis",
                "alternateLink": "https://drive.google.com/open?id=1zjr1AUBRtsXPIKi3eUSfcpeT2DYazpis"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom48b4f004@group.calendar.google.com"
    },
    {
      "id": "2201614344",
      "name": "6JKw CL",
      "descriptionHeading": "6JKw CL",
      "ownerId": "107554112463094781867",
      "creationTime": "2016-09-13T13:55:42.491Z",
      "updateTime": "2017-08-17T11:27:30.234Z",
      "enrollmentCode": "ocjow7t",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjIwMTYxNDM0NFpa",
      "teacherGroupEmail": "6JKw_CL_teachers_f52f58a4@hope.edu.kh",
      "courseGroupEmail": "6JKw_CL_08169b5f@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIflMydVBHTWpNV3RYM29uUlRudzFfd2VPWjFFUDZrZk9ERHlmXzVvT0RyMFk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomf2e8a23f@group.calendar.google.com"
    },
    {
      "id": "2198978163",
      "name": "23/45 IT",
      "descriptionHeading": "23/45 IT",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-09-13T08:01:25.392Z",
      "updateTime": "2017-08-10T08:25:43.111Z",
      "enrollmentCode": "80mxn7v",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjE5ODk3ODE2M1pa",
      "teacherGroupEmail": "23_45_IT_teachers_c6bd12cf@hope.edu.kh",
      "courseGroupEmail": "23_45_IT_964ebace@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fjJwaG4ydHhlZXdiTkVpbkhVMWpnNUNzQXprR0RaLXdqQUJZOGNmV3phVkE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma6077724@group.calendar.google.com"
    },
    {
      "id": "2181461229",
      "name": "English Year 8 (2016-7)",
      "descriptionHeading": "English Year 8 (2016-7)",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-09-11T03:15:06.312Z",
      "updateTime": "2016-09-11T03:15:04.800Z",
      "enrollmentCode": "nqwrdnl",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjE4MTQ2MTIyOVpa",
      "teacherGroupEmail": "English_Year_8_2016_7_teachers_55a9ce73@hope.edu.kh",
      "courseGroupEmail": "English_Year_8_2016_7_d23aeaf3@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfjNhSmpUQjhFeExnSHN3THBUcWx3SFFWVXU5SlRrTlgtNWM2LVZHWHlqVlk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom5112362d@group.calendar.google.com"
    },
    {
      "id": "2181513657",
      "name": "Christina English 10 (2016-18)",
      "descriptionHeading": "English 9 (2016-18)",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-09-11T01:39:22.645Z",
      "updateTime": "2017-08-25T02:46:02.116Z",
      "enrollmentCode": "17oih8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjE4MTUxMzY1N1pa",
      "teacherGroupEmail": "English_9_2016_18_teachers_e3a679f1@hope.edu.kh",
      "courseGroupEmail": "English_9_2016_18_b31594e4@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfkNSdDBrVFA3bUpiSXJTeDlfdlJCWkw0REpBblNmZUN0UThkRHd3dGFGRlk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom19bf135d@group.calendar.google.com"
    },
    {
      "id": "2181026106",
      "name": "Global Perspectives (2016-18)",
      "section": "Years 9 - 10",
      "descriptionHeading": "Global Perspectives (2016-18) Years 9 - 10",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-09-10T10:59:09.399Z",
      "updateTime": "2016-09-10T10:59:07.872Z",
      "enrollmentCode": "wd1mba",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjE4MTAyNjEwNlpa",
      "teacherGroupEmail": "Global_Perspectives_2016_18_Years_9_10_teachers_5e5602d8@hope.edu.kh",
      "courseGroupEmail": "Global_Perspectives_2016_18_Years_9_10_7a6fa356@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfkpOQnllLWxDMGdQekNMTzlSZmt0N0NyRDdvY1E3QXVMblFRQVpScnQtMkE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroombb382070@group.calendar.google.com"
    },
    {
      "id": "2161840617",
      "name": "Year 345",
      "descriptionHeading": "Year 3-4-5",
      "ownerId": "113635599462006979888",
      "creationTime": "2016-09-08T10:59:36.629Z",
      "updateTime": "2018-08-06T08:59:46.261Z",
      "enrollmentCode": "wdv1la0",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjE2MTg0MDYxN1pa",
      "teacherGroupEmail": "Grade_2_Math_teachers_fbf6b410@hope.edu.kh",
      "courseGroupEmail": "Grade_2_Math_c8dadc95@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-EgokMYTPW_fmFTLTNYM3RDMHpBbGhPWm9FQk1vU3lNVFZEeXNoRjhzdFRvV2JKaWt0NmM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom86848974@group.calendar.google.com"
    },
    {
      "id": "2140349733",
      "name": "Y9/Y10 Travel and Tourism",
      "descriptionHeading": "Y9 Travel and Tourism",
      "ownerId": "102003547718393718946",
      "creationTime": "2016-09-06T11:02:30.009Z",
      "updateTime": "2017-04-25T08:49:38.462Z",
      "enrollmentCode": "g69xsw",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjE0MDM0OTczM1pa",
      "teacherGroupEmail": "Y9_Travel_and_Tourism_teachers_aaea0324@hope.edu.kh",
      "courseGroupEmail": "Y9_Travel_and_Tourism_cf87234f@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfjRrcEdwclpwMjJDVTJEVGZIc2RZdzlfU3l6ODFYd2hPckNsWmE3NzdabzA"
      },
      "courseMaterialSets": [
        {
          "title": "Unit 4 Travel and tourism products and services",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbMXpUM1R0anBzdTQ",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbMXpUM1R0anBzdTQ"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbdmdjYTNad0d1TDQ",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbdmdjYTNad0d1TDQ"
              }
            }
          ]
        },
        {
          "title": "Unit 3 Customer Care and working procedures",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbNDU1RkRZTDczWXM",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbNDU1RkRZTDczWXM"
              }
            }
          ]
        },
        {
          "title": "UNIT 2 Features of worldwide destinations",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbdlFNNEZHLVdDUUk",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbdlFNNEZHLVdDUUk"
              }
            }
          ]
        },
        {
          "title": "UNIT 5 Marketing Promotion",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbaXZ6a040cEFTcXM",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbaXZ6a040cEFTcXM"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbVUxURzFwaXdwa00",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbVUxURzFwaXdwa00"
              }
            }
          ]
        },
        {
          "title": "Unit 1: The travel and tourism industry",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbSm1YTnF6UDBtNzA",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbSm1YTnF6UDBtNzA"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbdjM3QWtUQXFFOW8",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbdjM3QWtUQXFFOW8"
              }
            },
            {
              "youTubeVideo": {
                "id": "Su5WKbaqbDA",
                "title": "Fabien Cousteau Presents: Bimini - Paradise in Peril",
                "alternateLink": "https://www.youtube.com/watch?v=Su5WKbaqbDA",
                "thumbnailUrl": "https://i.ytimg.com/vi/Su5WKbaqbDA/default.jpg"
              }
            }
          ]
        },
        {
          "title": "IGCSE Travel and Tourism Syllabus",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbRGFSN0diNUlWN3c",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbRGFSN0diNUlWN3c"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9c68798e@group.calendar.google.com"
    },
    {
      "id": "2136495066",
      "name": "Year2 2018",
      "descriptionHeading": "Year2AG",
      "ownerId": "107789813925514121686",
      "creationTime": "2016-09-05T04:25:16.751Z",
      "updateTime": "2018-09-18T02:36:59.506Z",
      "enrollmentCode": "iwk4kn",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjEzNjQ5NTA2Nlpa",
      "teacherGroupEmail": "Year2AG_teachers_b6e0102d@hope.edu.kh",
      "courseGroupEmail": "Year2AG_111e0564@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByZ2aD20k-xwfkdubUZYZG5lTVRYck9PYkhsVWhTZGx4c3Zidi1sQTlPc1RDdEJaV1QwUUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc4f0c9e3@group.calendar.google.com"
    },
    {
      "id": "2135218951",
      "name": "Survival Island",
      "descriptionHeading": "Survival Island",
      "ownerId": "107554112463094781867",
      "creationTime": "2016-09-04T01:50:39.545Z",
      "updateTime": "2017-08-03T15:49:10.401Z",
      "enrollmentCode": "l267olo",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjEzNTIxODk1MVpa",
      "teacherGroupEmail": "Survival_Island_teachers_ba6c9b16@hope.edu.kh",
      "courseGroupEmail": "Survival_Island_5c2c38fb@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfnNxQ0k3cjBNWmNSbEtFZ09uUU83cHUtZ216aktpTVJSLV9XZGZObWhGLUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4b8d0cfa@group.calendar.google.com"
    },
    {
      "id": "2109773596",
      "name": "Year 2/3 South",
      "section": "BP",
      "descriptionHeading": "Year 2/3 South BP",
      "ownerId": "118056716687842774738",
      "creationTime": "2016-08-31T01:41:54.530Z",
      "updateTime": "2016-08-31T01:41:53.077Z",
      "enrollmentCode": "ds7q2g",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjEwOTc3MzU5Nlpa",
      "teacherGroupEmail": "Year_2_3_South_BP_teachers_f0f49a72@hope.edu.kh",
      "courseGroupEmail": "Year_2_3_South_BP_303053ef@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bzr3ZvcHDw0ufi1VbkJtRlVUWGIxSEtmOExfcll4bmZkeGw5Y3ppWXJoRlZsbk9zcUdlZnc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfb13e8bb@group.calendar.google.com"
    },
    {
      "id": "2109563540",
      "name": "Year 4/5",
      "section": "DL",
      "descriptionHeading": "Year 4/5 DL",
      "ownerId": "118056716687842774738",
      "creationTime": "2016-08-31T01:38:12.718Z",
      "updateTime": "2016-08-31T01:38:11.125Z",
      "enrollmentCode": "n4gu0q6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjEwOTU2MzU0MFpa",
      "teacherGroupEmail": "Year_4_5_DL_teachers_3aaa9b26@hope.edu.kh",
      "courseGroupEmail": "Year_4_5_DL_f6e47600@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bzr3ZvcHDw0ufmM5T2puajJEYXEyQVlwSUVLRW94SWNZTkJ6OGExenpPM1BuT293QmxwRGs"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6d96df38@group.calendar.google.com"
    },
    {
      "id": "2100734381",
      "name": "Student Council (Highschool)",
      "descriptionHeading": "Student Council (Highschool)",
      "ownerId": "110627498288637945705",
      "creationTime": "2016-08-30T10:49:46.437Z",
      "updateTime": "2017-08-25T02:44:42.787Z",
      "enrollmentCode": "cb68s7",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjEwMDczNDM4MVpa",
      "teacherGroupEmail": "Student_Council_Highschool_teachers_33f94dfd@hope.edu.kh",
      "courseGroupEmail": "Student_Council_Highschool_426d1155@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfmx3bVJjWkxCVVRzOEpsRFdIWDJPb2xtbDNWSlFrZWc3U3EwUGVDaEZrY0U"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom5ab831d4@group.calendar.google.com"
    },
    {
      "id": "2101322327",
      "name": "Student Council (Middle School)",
      "descriptionHeading": "School Council (Middle School)",
      "ownerId": "110627498288637945705",
      "creationTime": "2016-08-30T10:38:46.075Z",
      "updateTime": "2017-08-25T02:44:52.557Z",
      "enrollmentCode": "o0xqlpd",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjEwMTMyMjMyN1pa",
      "teacherGroupEmail": "School_Council_Middle_School_teachers_d0a1628b@hope.edu.kh",
      "courseGroupEmail": "School_Council_Middle_School_cd6bb47c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfk41dzA3bXVBY2d1bDNwUFA4bkFRRk1rd1Bxd0kzWEVaM19JUGkyTjNoYms"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4aa64742@group.calendar.google.com"
    },
    {
      "id": "2088326639",
      "name": "Y2019 IB Business Management HL JA",
      "descriptionHeading": "Year 12 Business Management",
      "ownerId": "102003547718393718946",
      "creationTime": "2016-08-27T05:34:54.860Z",
      "updateTime": "2019-01-29T03:15:19.412Z",
      "enrollmentCode": "knu6on",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjA4ODMyNjYzOVpa",
      "teacherGroupEmail": "Year_12_Business_Management_teachers_20d1c75a@hope.edu.kh",
      "courseGroupEmail": "Year_12_Business_Management_4918099d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfjlKaUI4eTk4djE5QV9tS0pFZEdpa3kxVWJBY0RnalUwVFZYWFVXdlRSREE",
        "title": "Year 12 Business Management",
        "alternateLink": "https://drive.google.com/drive/folders/0B6KfBVM7lPEbfjlKaUI4eTk4djE5QV9tS0pFZEdpa3kxVWJBY0RnalUwVFZYWFVXdlRSREE"
      },
      "courseMaterialSets": [
        {
          "title": "IA on promotion mix",
          "materials": [
            {
              "driveFile": {
                "id": "1lCQaXgurMnS-dCEj0Tyv1eymh7PyEIaP",
                "title": "HL IA sample B.pdf",
                "alternateLink": "https://drive.google.com/open?id=1lCQaXgurMnS-dCEj0Tyv1eymh7PyEIaP",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1lCQaXgurMnS-dCEj0Tyv1eymh7PyEIaP&sz=s200"
              }
            }
          ]
        },
        {
          "title": "IB Exam Case Studies",
          "materials": [
            {
              "driveFile": {
                "id": "10ubgEzfXO-4CCYEAQC_b92hjuPmHZ-8z",
                "title": "Case study P1 Nov 2016..pdf",
                "alternateLink": "https://drive.google.com/open?id=10ubgEzfXO-4CCYEAQC_b92hjuPmHZ-8z",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=10ubgEzfXO-4CCYEAQC_b92hjuPmHZ-8z&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1XvrNquf-ibz1TtSAldGXVr8wnLLK8C_W",
                "title": "Case study P1 May 2016.pdf",
                "alternateLink": "https://drive.google.com/open?id=1XvrNquf-ibz1TtSAldGXVr8wnLLK8C_W",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1XvrNquf-ibz1TtSAldGXVr8wnLLK8C_W&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Unit 4.8 E-commerce",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbREUteUdWVFZqZEk",
                "title": "Unit 4.8 E-commerce.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbREUteUdWVFZqZEk",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbREUteUdWVFZqZEk&sz=s200"
              }
            },
            {
              "link": {
                "url": "http://knowledge.wharton.upenn.edu/article/will-walmarts-google-partnership-give-online-boost/",
                "title": "Will Walmart’s Partnership with Google Give It an Online Boost? - Knowledge@Wharton",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://knowledge.wharton.upenn.edu/article/will-walmarts-google-partnership-give-online-boost/&a=AIYkKU-mvbKlGJLjHiBYHHrmcZi3djQmtQ"
              }
            },
            {
              "link": {
                "url": "https://www.cbinsights.com/research/amazon-alibaba-physical-retail/",
                "title": "Amazon And Alibaba Have Already Conquered Online Retail. Now They're Coming For Offline.",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cbinsights.com/research/amazon-alibaba-physical-retail/&a=AIYkKU8PQYcijKfpzv2YXxG-N7SuIw87Og"
              }
            },
            {
              "link": {
                "url": "https://www.cnbc.com/2018/04/02/the-5-billion-south-korean-start-up-thats-an-amazon-killer.html",
                "title": "The $5 billion South Korean start-up that's an Amazon killer",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cnbc.com/2018/04/02/the-5-billion-south-korean-start-up-thats-an-amazon-killer.html&a=AIYkKU-m0ScbqfyPRXTgn4mYYLmjdHSuMg"
              }
            }
          ]
        },
        {
          "title": "Unit 4.5 The Four Ps - product, price, promotion and place",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbUFB3T3d2SmV6a0U",
                "title": "Unit 4_5 The Four Ps..pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbUFB3T3d2SmV6a0U",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbUFB3T3d2SmV6a0U&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.marketingweek.com/2016/04/18/how-the-tesco-brand-bounced-back-from-crisis/",
                "title": "How the Tesco brand recovered from crisis – Marketing Week",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.marketingweek.com/2016/04/18/how-the-tesco-brand-bounced-back-from-crisis/&a=AIYkKU_ah4tl__Q3R6Fz1rrYACRAQWvPbw"
              }
            },
            {
              "youTubeVideo": {
                "id": "fGaVFRzTTP4",
                "title": "Tesco Homeplus Virtual Subway Store in South Korea",
                "alternateLink": "https://www.youtube.com/watch?v=fGaVFRzTTP4",
                "thumbnailUrl": "https://i.ytimg.com/vi/fGaVFRzTTP4/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "PBuWXfP9B9E",
                "title": "The Best & The Cheapest Viral Marketing Ever",
                "alternateLink": "https://www.youtube.com/watch?v=PBuWXfP9B9E",
                "thumbnailUrl": "https://i.ytimg.com/vi/PBuWXfP9B9E/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "6NPF0A_vGC4",
                "title": "KLM Economy Comfort Product with Ramana at Manchester Airport T2",
                "alternateLink": "https://www.youtube.com/watch?v=6NPF0A_vGC4",
                "thumbnailUrl": "https://i.ytimg.com/vi/6NPF0A_vGC4/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "qMOuF8oskRU",
                "title": "Guerilla Marketing Example - Coca-Cola Happiness Vending Machine",
                "alternateLink": "https://www.youtube.com/watch?v=qMOuF8oskRU",
                "thumbnailUrl": "https://i.ytimg.com/vi/qMOuF8oskRU/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "f1dFyj1QzG0",
                "title": "Dyson Product Development",
                "alternateLink": "https://www.youtube.com/watch?v=f1dFyj1QzG0",
                "thumbnailUrl": "https://i.ytimg.com/vi/f1dFyj1QzG0/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.reuters.com/article/us-olympics-mcdonalds/mcdonalds-ends-olympics-sponsorship-deal-early-idUSKBN1971HB",
                "title": "\n                McDonald's ends Olympics sponsorship deal early | Reuters",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.reuters.com/article/us-olympics-mcdonalds/mcdonalds-ends-olympics-sponsorship-deal-early-idUSKBN1971HB&a=AIYkKU-zBfwoc278902Q6xfLCvEq9CrheA"
              }
            },
            {
              "link": {
                "url": "http://www.bbc.com/news/business-41559756",
                "title": "Ikea to sell online on third-party sites - BBC News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.bbc.com/news/business-41559756&a=AIYkKU-sXqiqEgVzN0KAHr8aEakOchfzkQ"
              }
            },
            {
              "youTubeVideo": {
                "id": "GCmiNBZXgBo",
                "title": "Everlane CEO on strategy behind opening physical stores",
                "alternateLink": "https://www.youtube.com/watch?v=GCmiNBZXgBo",
                "thumbnailUrl": "https://i.ytimg.com/vi/GCmiNBZXgBo/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://www.theadvertisingclub.net/index.php/features/editorial/3256-difference-between-above-the-line-and-below-the-line-advertising",
                "title": "Difference between ‘above the line’ and ‘below the line’ advertising",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.theadvertisingclub.net/index.php/features/editorial/3256-difference-between-above-the-line-and-below-the-line-advertising&a=AIYkKU84-PLLZf6UWw3Csft4Ob1sR9Zebw"
              }
            },
            {
              "youTubeVideo": {
                "id": "Ugd1HexwjeM",
                "title": "Heineken- Guerilla Marketing - Real Madrid vs AC Milan.mp4",
                "alternateLink": "https://www.youtube.com/watch?v=Ugd1HexwjeM",
                "thumbnailUrl": "https://i.ytimg.com/vi/Ugd1HexwjeM/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Paper 1 Case Study - For use in May 2017",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbY3ZKaVJMLUtPUVk",
                "title": "OCC_d_3_busmt_css_1705_1_e.pdf",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbY3ZKaVJMLUtPUVk",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbY3ZKaVJMLUtPUVk&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbM25QamZSenJXM3c",
                "title": "Utopia_Revision_kit.docx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbM25QamZSenJXM3c",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbM25QamZSenJXM3c&sz=s200"
              }
            }
          ]
        },
        {
          "title": "UNIT 4.6 The extended marketing mix of seven Ps (HL only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbWmkyd1N0aU5NWW8",
                "title": "Unit4_6 Extended MKTG Mix.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbWmkyd1N0aU5NWW8",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbWmkyd1N0aU5NWW8&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "GhFpvXsmBXY",
                "title": "Service marketing mix explained with Example",
                "alternateLink": "https://www.youtube.com/watch?v=GhFpvXsmBXY",
                "thumbnailUrl": "https://i.ytimg.com/vi/GhFpvXsmBXY/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://forbes.com/sites/carminegallo/2012/05/16/apple-stores-secret-sauce-5-steps-of-service-video/#2a454c025332",
                "title": "Apple Store's Secret Sauce: 5 Steps of Service [video]",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://forbes.com/sites/carminegallo/2012/05/16/apple-stores-secret-sauce-5-steps-of-service-video/%232a454c025332&a=AIYkKU9RWNioCyvka6eqXc_DSJgDBgsSSQ"
              }
            }
          ]
        },
        {
          "title": "Unit 4.4 Market research",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbbkhSUGlaU1RZcmM",
                "title": "Unit 4_4 Market research.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbbkhSUGlaU1RZcmM",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbbkhSUGlaU1RZcmM&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "be9e-Q-jC-0",
                "title": "Sampling: Simple Random, Convenience, systematic, cluster, stratified - Statistics Help",
                "alternateLink": "https://www.youtube.com/watch?v=be9e-Q-jC-0",
                "thumbnailUrl": "https://i.ytimg.com/vi/be9e-Q-jC-0/default.jpg"
              }
            }
          ]
        },
        {
          "title": "UNIT 4.7 International Marketing (HL)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbdzVoRXJvUTlGY2M",
                "title": "UNIT 4_7 International Marketing.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbdzVoRXJvUTlGY2M",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbdzVoRXJvUTlGY2M&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "aoFwuQgyyCE",
                "title": "Dominos   Cutural Adjustment",
                "alternateLink": "https://www.youtube.com/watch?v=aoFwuQgyyCE",
                "thumbnailUrl": "https://i.ytimg.com/vi/aoFwuQgyyCE/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.ft.com/content/3221dd2e-52ee-11e5-9497-c74c95a1a7b1",
                "title": "Tesco set to close door on South Korean success story | Financial Times",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.ft.com/content/3221dd2e-52ee-11e5-9497-c74c95a1a7b1&a=AIYkKU-hr5nLrbfpjFM6tozVRZPdYf9Z0Q"
              }
            },
            {
              "youTubeVideo": {
                "id": "TebeNC-_VjA",
                "title": "Australia Tourism - Where the bloody hell are you?",
                "alternateLink": "https://www.youtube.com/watch?v=TebeNC-_VjA",
                "thumbnailUrl": "https://i.ytimg.com/vi/TebeNC-_VjA/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "fGaVFRzTTP4",
                "title": "Tesco Homeplus Virtual Subway Store in South Korea",
                "alternateLink": "https://www.youtube.com/watch?v=fGaVFRzTTP4",
                "thumbnailUrl": "https://i.ytimg.com/vi/fGaVFRzTTP4/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://www.sbs.com.au/news/thefeed/story/why-starbucks-just-cant-crack-australian-market",
                "title": "Why Starbucks just can't crack the Australian market | SBS News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.sbs.com.au/news/thefeed/story/why-starbucks-just-cant-crack-australian-market&a=AIYkKU_4HPX4q-yTZPMpN4VTzxL7RagAYg"
              }
            },
            {
              "link": {
                "url": "http://www.abc.net.au/news/2008-08-07/32188",
                "title": "Starbucks in Australia: Where did it go wrong? - ABC News (Australian Broadcasting Corporation)",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.abc.net.au/news/2008-08-07/32188&a=AIYkKU-4hVt6TiCrEROINnXgRO8g-BB6Hw"
              }
            },
            {
              "link": {
                "url": "http://www.baristainstitute.com/blog/karin-stenback/february-2017/5-things-you-should-know-about-australian-coffee-culture",
                "title": "5 Things You Should Know About Australian Coffee Culture",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.baristainstitute.com/blog/karin-stenback/february-2017/5-things-you-should-know-about-australian-coffee-culture&a=AIYkKU--9gjB76cf4YJ4iePN6s8GLK9sRA"
              }
            },
            {
              "link": {
                "url": "http://knowledge.wharton.upenn.edu/article/dolce-gabbana-mistakes-in-china/",
                "title": "Can Dolce & Gabbana Recover from Its Mistakes in China? - Knowledge@Wharton",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://knowledge.wharton.upenn.edu/article/dolce-gabbana-mistakes-in-china/&a=AIYkKU9jC1Osc8ZfO-iQz-HOY7rdrilwkw"
              }
            }
          ]
        },
        {
          "title": "4.2 Marketing Planning",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbNkZfUTM3VlRwWWc",
                "title": "UNIT4_2 Marketing Planning.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbNkZfUTM3VlRwWWc",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbNkZfUTM3VlRwWWc&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbVWV6ZFppOENhbFk",
                "title": "IMG_2752.JPG",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbVWV6ZFppOENhbFk",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbVWV6ZFppOENhbFk&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "o3CizbLkV8Q",
                "title": "Product Positioning",
                "alternateLink": "https://www.youtube.com/watch?v=o3CizbLkV8Q",
                "thumbnailUrl": "https://i.ytimg.com/vi/o3CizbLkV8Q/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.webpagefx.com/blog/marketing/9-niche-marketing-examples/",
                "title": "9 Niche Marketing Examples",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.webpagefx.com/blog/marketing/9-niche-marketing-examples/&a=AIYkKU-qlCPAA7bYYmSKBLTp6RqAQQ0gWA"
              }
            }
          ]
        },
        {
          "title": "UNIT 4.3 Sales Forecasting (HL)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbdTdVR0NPcG5yZGM",
                "title": "UNIT 4_3 Sales Forecasting.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbdTdVR0NPcG5yZGM",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbdTdVR0NPcG5yZGM&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbSEpVQnNQbnZRdmc",
                "title": "SalesForecasting.xlsx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbSEpVQnNQbnZRdmc",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbSEpVQnNQbnZRdmc&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://prezi.com/w0sanpisqovk/43-sales-forecasting-2014-syllabus/",
                "title": "4.3 Sales Forecasting 2014 Syllabus by Deborah Kelly on Prezi",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://prezi.com/w0sanpisqovk/43-sales-forecasting-2014-syllabus/&a=AIYkKU_qpddz9UTQmLOo3EC3CA7epG_XJg"
              }
            }
          ]
        },
        {
          "title": "UNIT 4.1 The Role of Marketing Slides",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbZVlESGd5UHlGb0U",
                "title": "UNIT 4 Role of MKTG.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbZVlESGd5UHlGb0U",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbZVlESGd5UHlGb0U&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "qlsyjfwkIwU",
                "title": "Coca Cola's unethical practices in India - HRM project",
                "alternateLink": "https://www.youtube.com/watch?v=qlsyjfwkIwU",
                "thumbnailUrl": "https://i.ytimg.com/vi/qlsyjfwkIwU/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "2jVUtC018LQ",
                "title": "Unethical Practices of Coca-Cola Co.",
                "alternateLink": "https://www.youtube.com/watch?v=2jVUtC018LQ",
                "thumbnailUrl": "https://i.ytimg.com/vi/2jVUtC018LQ/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "zhDl5PUzZiI",
                "title": "TOMS Shoes Story",
                "alternateLink": "https://www.youtube.com/watch?v=zhDl5PUzZiI",
                "thumbnailUrl": "https://i.ytimg.com/vi/zhDl5PUzZiI/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "TvVIe_W9epI",
                "title": "TOMS: The Business of Footwear and Philanthropy | Forbes",
                "alternateLink": "https://www.youtube.com/watch?v=TvVIe_W9epI",
                "thumbnailUrl": "https://i.ytimg.com/vi/TvVIe_W9epI/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "5xrQjqjvhQc",
                "title": "Everlane CEO: Retail Transparency | Mad Money | CNBC",
                "alternateLink": "https://www.youtube.com/watch?v=5xrQjqjvhQc",
                "thumbnailUrl": "https://i.ytimg.com/vi/5xrQjqjvhQc/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Business Management syllabus guide.pdf",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbM3NpTENBWjJNZkE",
                "title": "Business Management syllabus guide (1).pdf",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbM3NpTENBWjJNZkE",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbM3NpTENBWjJNZkE&sz=s200"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7ac4b9d6@group.calendar.google.com"
    },
    {
      "id": "2087755377",
      "name": "Y2020 IB Business Management HL JA",
      "descriptionHeading": "Year 11 Business Management",
      "ownerId": "102003547718393718946",
      "creationTime": "2016-08-27T01:18:56.399Z",
      "updateTime": "2019-01-29T03:13:03.611Z",
      "enrollmentCode": "qngphs",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjA4Nzc1NTM3N1pa",
      "teacherGroupEmail": "Year_11_Business_Management_teachers_afdafbdc@hope.edu.kh",
      "courseGroupEmail": "Year_11_Business_Management_9e7aab1a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6KfBVM7lPEbfnZsQkp0Y2NpbUNUZG8yb3hoTXhDaVlxTzlFbllXQ3BOOVRFTFdSRzU0ckk",
        "title": "Year 11 Business Management",
        "alternateLink": "https://drive.google.com/drive/folders/0B6KfBVM7lPEbfnZsQkp0Y2NpbUNUZG8yb3hoTXhDaVlxTzlFbllXQ3BOOVRFTFdSRzU0ckk"
      },
      "courseMaterialSets": [
        {
          "title": "Extended Essay - Business Management",
          "materials": [
            {
              "link": {
                "url": "https://ibpublishing.ibo.org/extendedessay/apps/dpapp/guidance.html?doc=d_0_eeyyy_gui_1602_1_e&part=4&chapter=2",
                "title": "Home",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://ibpublishing.ibo.org/extendedessay/apps/dpapp/guidance.html?doc%3Dd_0_eeyyy_gui_1602_1_e%26part%3D4%26chapter%3D2&a=AIYkKU-1Ejvlhp-jH6BK6nkqm9TcuyMKyQ"
              }
            },
            {
              "link": {
                "url": "https://www.ibmastery.com/blog/how-to-write-your-extended-essay-getting-started",
                "title": "\n      \n        How to Write Your Extended Essay (Getting Started)\n      \n    ",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.ibmastery.com/blog/how-to-write-your-extended-essay-getting-started&a=AIYkKU-c7JZE6fSwF1WsRMaI4tsxiaNzkQ"
              }
            },
            {
              "driveFile": {
                "id": "1PQoipHIdhejEJNG8BzdF4b4y1roXJPgh",
                "title": "Business EE",
                "alternateLink": "https://drive.google.com/drive/folders/1PQoipHIdhejEJNG8BzdF4b4y1roXJPgh"
              }
            },
            {
              "driveFile": {
                "id": "1dQvoIXueyMHRy-TTXKGDLh7MLxKo6LSm",
                "title": "Netflix",
                "alternateLink": "https://drive.google.com/drive/folders/1dQvoIXueyMHRy-TTXKGDLh7MLxKo6LSm"
              }
            },
            {
              "youTubeVideo": {
                "id": "2fuOs6nJSjY",
                "title": "Netflix culture deck via Reed Hastings",
                "alternateLink": "https://www.youtube.com/watch?v=2fuOs6nJSjY",
                "thumbnailUrl": "https://i.ytimg.com/vi/2fuOs6nJSjY/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "FZiuKziFI5w",
                "title": "Patty McCord, former Chief Talent Officer, Netflix",
                "alternateLink": "https://www.youtube.com/watch?v=FZiuKziFI5w",
                "thumbnailUrl": "https://i.ytimg.com/vi/FZiuKziFI5w/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.inc.com/rohini-venkatraman/why-netflix-ceo-reed-hastings-takes-pride-in-every-decision-he-doesnt-make.html",
                "title": "Why Netflix CEO Reed Hastings Takes Pride in Every Decision He Doesn't Make | Inc.com",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.inc.com/rohini-venkatraman/why-netflix-ceo-reed-hastings-takes-pride-in-every-decision-he-doesnt-make.html&a=AIYkKU-zz7HF6Na1xW28DYXDm56sd5poDQ"
              }
            },
            {
              "link": {
                "url": "https://www.forbes.com/sites/stephaniedenning/2018/04/30/incubating-culture-how-netflix-is-winning-the-war-for-talent/#4df5fb3e3a78",
                "title": "Incubating Culture: How Netflix Is Winning The War For Talent",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.forbes.com/sites/stephaniedenning/2018/04/30/incubating-culture-how-netflix-is-winning-the-war-for-talent/%234df5fb3e3a78&a=AIYkKU_RpAqK7ihkJf918_75ZHPoZZ7Ckg"
              }
            },
            {
              "link": {
                "url": "https://www.mindtools.com/pages/article/newLDR_66.htm",
                "title": "Hofstede's Cultural Dimensions - From MindTools.com",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.mindtools.com/pages/article/newLDR_66.htm&a=AIYkKU9gZ5jF-4JVVlbCrExgLxKvF_St0w"
              }
            },
            {
              "youTubeVideo": {
                "id": "ZKrtUB-kMJc",
                "title": "Netflix Business Model: How Innovation makes Netflix succeed",
                "alternateLink": "https://www.youtube.com/watch?v=ZKrtUB-kMJc",
                "thumbnailUrl": "https://i.ytimg.com/vi/ZKrtUB-kMJc/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "K3v6B_70r9s",
                "title": "Vision & Strategy - Epiphanies of a Netflix Leader",
                "alternateLink": "https://www.youtube.com/watch?v=K3v6B_70r9s",
                "thumbnailUrl": "https://i.ytimg.com/vi/K3v6B_70r9s/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Unit 5.6 Research and development (HL & Innovation Concept)\nUnit 5.7 Crisis management and Contingency Planning (HL Only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbc3I5Y2JGSnRnTDQ",
                "title": "Unit 5_6 R & D_ Unit 5_7 Crisis MGT.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbc3I5Y2JGSnRnTDQ",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbc3I5Y2JGSnRnTDQ&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "5TL80_8ACPc",
                "title": "How Amazon Arranges Its Warehouses",
                "alternateLink": "https://www.youtube.com/watch?v=5TL80_8ACPc",
                "thumbnailUrl": "https://i.ytimg.com/vi/5TL80_8ACPc/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://hbr.org/2009/09/innovating-a-turnaround-at-lego",
                "title": "Innovating a Turnaround at LEGO",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://hbr.org/2009/09/innovating-a-turnaround-at-lego&a=AIYkKU9zCxKOnGtWA-00FcosWCvWv2Aixw"
              }
            },
            {
              "link": {
                "url": "http://www.afr.com/technology/in-1975-this-kodak-employee-invented-the-digital-camera-his-bosses-made-him-hide-it-20150813-k9zo8",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.afr.com/technology/in-1975-this-kodak-employee-invented-the-digital-camera-his-bosses-made-him-hide-it-20150813-k9zo8&a=AIYkKU9xnUKJjc5F_sGhhwZEhGRB1B6SjA"
              }
            },
            {
              "youTubeVideo": {
                "id": "AMgeNjXtYx4",
                "title": "Dyson - A Story of Innovation (HD)",
                "alternateLink": "https://www.youtube.com/watch?v=AMgeNjXtYx4",
                "thumbnailUrl": "https://i.ytimg.com/vi/AMgeNjXtYx4/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "n0Xod5pK3Uk",
                "title": "Failure to See Unmet Needs (Kodak) | UC Berkeley Executive Education",
                "alternateLink": "https://www.youtube.com/watch?v=n0Xod5pK3Uk",
                "thumbnailUrl": "https://i.ytimg.com/vi/n0Xod5pK3Uk/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.fastcodesign.com/3057837/the-man-behind-ikeas-world-conquering-flat-pack-design",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.fastcodesign.com/3057837/the-man-behind-ikeas-world-conquering-flat-pack-design&a=AIYkKU96XgqzJB8xJpCEuLnozQEJBoB1Bw"
              }
            },
            {
              "link": {
                "url": "https://www.amazon.com/p/feature/tv76jef8gz289rm",
                "title": "Innovation",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.amazon.com/p/feature/tv76jef8gz289rm&a=AIYkKU809nSsNS7noZnI1LtODcdjQFvhmw"
              }
            },
            {
              "driveFile": {
                "id": "1pULPabFnwAlrO5cjIYSD4dSaFpRzj-fF",
                "title": "The Innovation Mindset in Action_ 3M Corporation.pdf",
                "alternateLink": "https://drive.google.com/open?id=1pULPabFnwAlrO5cjIYSD4dSaFpRzj-fF",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1pULPabFnwAlrO5cjIYSD4dSaFpRzj-fF&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Unit 2.2 Organisational structure 2.3 Leadership and management",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbN0JySWxFczhCM0k",
                "title": "Unit 2_2 Organisational structure.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbN0JySWxFczhCM0k",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbN0JySWxFczhCM0k&sz=s200"
              }
            },
            {
              "link": {
                "url": "http://www.bbc.com/news/business-39104585",
                "title": "Tesco to replace 1,700 managers with lower-paid staff - BBC News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.bbc.com/news/business-39104585&a=AIYkKU8FJgGu5jVkDDrtGiLz_7U9yuCn0A"
              }
            },
            {
              "link": {
                "url": "https://www.thestar.com/business/2017/09/26/ceo-satya-nadella-aims-to-reshape-microsoft-culture-with-focus-on-empathy.html",
                "title": "CEO Satya Nadella aims to reshape Microsoft culture with focus on empathy | The Star",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.thestar.com/business/2017/09/26/ceo-satya-nadella-aims-to-reshape-microsoft-culture-with-focus-on-empathy.html&a=AIYkKU-sJmySe6cXc9ZiCIs6mTYBXgfvEQ"
              }
            },
            {
              "link": {
                "url": "https://www.ft.com/content/82e6ff92-46c6-11e6-8d68-72e9211e86ab",
                "title": "Microsoft has become richer through its culture shift | Financial Times",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.ft.com/content/82e6ff92-46c6-11e6-8d68-72e9211e86ab&a=AIYkKU_nvJMmj_a1GUaQ-tTc-MNK25KdyQ"
              }
            },
            {
              "youTubeVideo": {
                "id": "FRsJbpppvEU",
                "title": "Best Practice HR Tips from Liane Hornsey, Google VP Operations | MeetTheBoss",
                "alternateLink": "https://www.youtube.com/watch?v=FRsJbpppvEU",
                "thumbnailUrl": "https://i.ytimg.com/vi/FRsJbpppvEU/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.forbes.com/sites/kevinkruse/2016/09/05/netflix-has-no-rules-because-they-hire-great-people/#7e1e343d59bc",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.forbes.com/sites/kevinkruse/2016/09/05/netflix-has-no-rules-because-they-hire-great-people/%237e1e343d59bc&a=AIYkKU-styXEwLNQRhRlYO7KHUM46nCa-A"
              }
            },
            {
              "youTubeVideo": {
                "id": "7g-BLzjEbXU",
                "title": "Corporate Culture",
                "alternateLink": "https://www.youtube.com/watch?v=7g-BLzjEbXU",
                "thumbnailUrl": "https://i.ytimg.com/vi/7g-BLzjEbXU/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://www.cbc.ca/news/canada/british-columbia/td-tellers-desperate-to-meet-increasing-sales-goals-1.4006743",
                "title": "'I will do anything I can to make my goal': TD teller says customers pay price for 'unrealistic' sales targets | CBC News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.cbc.ca/news/canada/british-columbia/td-tellers-desperate-to-meet-increasing-sales-goals-1.4006743&a=AIYkKU8QdMWzP1j6G119gUAcan0B7547Ug"
              }
            },
            {
              "youTubeVideo": {
                "id": "wO_-MtWejRM",
                "title": "What is organizational structure?",
                "alternateLink": "https://www.youtube.com/watch?v=wO_-MtWejRM",
                "thumbnailUrl": "https://i.ytimg.com/vi/wO_-MtWejRM/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.huffingtonpost.com/adam-hanft/microsofts-massive-reorga_b_3619736.html",
                "title": "Microsoft's Massive Reorganization -- All Structure, No Culture | HuffPost",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.huffingtonpost.com/adam-hanft/microsofts-massive-reorga_b_3619736.html&a=AIYkKU-vEIOjcagtfRWKYeRI3q9kJsSZkA"
              }
            },
            {
              "driveFile": {
                "id": "1KZP6K9dC5nw7scLsbIwDq09wIWqjJipu",
                "title": "The Volkswagen scandal shows.pdf",
                "alternateLink": "https://drive.google.com/open?id=1KZP6K9dC5nw7scLsbIwDq09wIWqjJipu",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1KZP6K9dC5nw7scLsbIwDq09wIWqjJipu&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1CNd7QtQJS67wgICtvW7rLtS3W42xz9cV",
                "title": "Fear & respect VW's culture.docx",
                "alternateLink": "https://drive.google.com/open?id=1CNd7QtQJS67wgICtvW7rLtS3W42xz9cV",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1CNd7QtQJS67wgICtvW7rLtS3W42xz9cV&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1G8jC_d2FxEC17gJejeTxOCX28m69Mqem",
                "title": "The Biggest Lesson from Volkswagen.pdf",
                "alternateLink": "https://drive.google.com/open?id=1G8jC_d2FxEC17gJejeTxOCX28m69Mqem",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1G8jC_d2FxEC17gJejeTxOCX28m69Mqem&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Unit 5.4 Location (HL), 5.5 Production Planning (HL)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbRlVPYUUzSi10UWs",
                "title": "Unit 5_5 Production Planning.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbRlVPYUUzSi10UWs",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbRlVPYUUzSi10UWs&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbdVhRQUxheGt2eDg",
                "title": "Unit 5.4 Location.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbdVhRQUxheGt2eDg",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbdVhRQUxheGt2eDg&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.bloomberg.com/gadfly/articles/2017-06-29/why-the-iphone-still-isn-t-made-in-america",
                "title": "Why the IPhone (Still) Isn't Made in America - Bloomberg",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.bloomberg.com/gadfly/articles/2017-06-29/why-the-iphone-still-isn-t-made-in-america&a=AIYkKU-jpzWtmLaCAVRC3_Blpq6cK9nfsQ"
              }
            },
            {
              "youTubeVideo": {
                "id": "HL7lh-Jyo5Q",
                "title": "How US businesses lost faith in globalisation",
                "alternateLink": "https://www.youtube.com/watch?v=HL7lh-Jyo5Q",
                "thumbnailUrl": "https://i.ytimg.com/vi/HL7lh-Jyo5Q/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Unit 5.3 Lean Production and quality management (HL)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbczVtTjZfY1VYR1E",
                "title": "Unit 5.3 Lean Production.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbczVtTjZfY1VYR1E",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbczVtTjZfY1VYR1E&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "fcBXtwGexNc",
                "title": "Kaizen The Secret behind Japanese Productivity",
                "alternateLink": "https://www.youtube.com/watch?v=fcBXtwGexNc",
                "thumbnailUrl": "https://i.ytimg.com/vi/fcBXtwGexNc/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "tum1lLwy6gE",
                "title": "Kanban Explanation",
                "alternateLink": "https://www.youtube.com/watch?v=tum1lLwy6gE",
                "thumbnailUrl": "https://i.ytimg.com/vi/tum1lLwy6gE/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "Mdyyyu41dZ4",
                "title": "Kanban and Pull Concept: A Pizza Example",
                "alternateLink": "https://www.youtube.com/watch?v=Mdyyyu41dZ4",
                "thumbnailUrl": "https://i.ytimg.com/vi/Mdyyyu41dZ4/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "Yi46P5E4D60",
                "title": "How we use Andon to ensure world class quality in Ensto",
                "alternateLink": "https://www.youtube.com/watch?v=Yi46P5E4D60",
                "thumbnailUrl": "https://i.ytimg.com/vi/Yi46P5E4D60/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "cAUXHJBB5CM",
                "title": "Just in Time by Toyota: The Smartest Production System in The World",
                "alternateLink": "https://www.youtube.com/watch?v=cAUXHJBB5CM",
                "thumbnailUrl": "https://i.ytimg.com/vi/cAUXHJBB5CM/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Unit 2.1 Functions and evolution of human resource management",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbOE1OU25CUGhFVUk",
                "title": "Unit 2_1 Functions Evolution of HRM.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbOE1OU25CUGhFVUk",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbOE1OU25CUGhFVUk&sz=s200"
              }
            }
          ]
        },
        {
          "title": "5.1 The role of operation management\n5.2 Production methods",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbR0xPTUJDR0t2bGM",
                "title": "Unit 5_1 Role of Operations MGT.ppt",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbR0xPTUJDR0t2bGM",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbR0xPTUJDR0t2bGM&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "7BRGj0DwYwA",
                "title": "Sustainable Palm oil production",
                "alternateLink": "https://www.youtube.com/watch?v=7BRGj0DwYwA",
                "thumbnailUrl": "https://i.ytimg.com/vi/7BRGj0DwYwA/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "qhIaEEW63Sc",
                "title": "Ship Breakers | Bangladesh",
                "alternateLink": "https://www.youtube.com/watch?v=qhIaEEW63Sc",
                "thumbnailUrl": "https://i.ytimg.com/vi/qhIaEEW63Sc/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "3PBtb-UDhEc",
                "title": "Formula for Disaster: UNICEF documentary (FULL VIDEO)",
                "alternateLink": "https://www.youtube.com/watch?v=3PBtb-UDhEc",
                "thumbnailUrl": "https://i.ytimg.com/vi/3PBtb-UDhEc/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "3xq0xwlb_s0",
                "title": "Luxury Watches   How its made   YouTube",
                "alternateLink": "https://www.youtube.com/watch?v=3xq0xwlb_s0",
                "thumbnailUrl": "https://i.ytimg.com/vi/3xq0xwlb_s0/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "2NzUm7UEEIY",
                "title": "How It's Made - Hot Dogs",
                "alternateLink": "https://www.youtube.com/watch?v=2NzUm7UEEIY",
                "thumbnailUrl": "https://i.ytimg.com/vi/2NzUm7UEEIY/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "xapH_FkXFZo",
                "title": "Glass Bottle Beer Filling Machine",
                "alternateLink": "https://www.youtube.com/watch?v=xapH_FkXFZo",
                "thumbnailUrl": "https://i.ytimg.com/vi/xapH_FkXFZo/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "3a_kkZLnIaE",
                "title": "Dr. Martens - The Art of Industrial Manufacture",
                "alternateLink": "https://www.youtube.com/watch?v=3a_kkZLnIaE",
                "thumbnailUrl": "https://i.ytimg.com/vi/3a_kkZLnIaE/default.jpg"
              }
            }
          ]
        },
        {
          "title": "3.7 Cash flow\n3.8 Investment appraisal (NPV HL only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbZXlfczVUaXRDTVE",
                "title": "Unit 3_7 Cash flow 3_8 Inv appraisal.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbZXlfczVUaXRDTVE",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbZXlfczVUaXRDTVE&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "MhvjCWfy-lw",
                "title": "The time value of money - German Nande",
                "alternateLink": "https://www.youtube.com/watch?v=MhvjCWfy-lw",
                "thumbnailUrl": "https://i.ytimg.com/vi/MhvjCWfy-lw/default.jpg"
              }
            }
          ]
        },
        {
          "title": "3.5 Profitability and liquidity ratio analysis\n3.6 Efficiency ratio analysis (HL only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbSldvUGlCZExRQTA",
                "title": "Unit 3_5 n 6 Financial Ratios.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbSldvUGlCZExRQTA",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbSldvUGlCZExRQTA&sz=s200"
              }
            },
            {
              "link": {
                "url": "http://fortune.com/2016/08/29/inventory-turnover-ratio-formula/",
                "title": "If You Don’t Know Your Company’s Inventory Turnover Ratio, You’re in Trouble | Fortune",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://fortune.com/2016/08/29/inventory-turnover-ratio-formula/&a=AIYkKU8ZLMWg7IdWlzazLhHR8SlK3guxMA"
              }
            }
          ]
        },
        {
          "title": "3.4 Final accounts",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbQXg3LWpkRG05Y28",
                "title": "Unit 3_4 Final Accounts.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbQXg3LWpkRG05Y28",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbQXg3LWpkRG05Y28&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "Zr4CLcAYu80",
                "title": "Investopedia Video: Intro To The Balance Sheet",
                "alternateLink": "https://www.youtube.com/watch?v=Zr4CLcAYu80",
                "thumbnailUrl": "https://i.ytimg.com/vi/Zr4CLcAYu80/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.edmunds.com/car-buying/how-fast-does-my-new-car-lose-value-infographic.html",
                "title": "Depreciation Infographic: How Fast Does My New Car Lose Value? on Edmunds.com",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.edmunds.com/car-buying/how-fast-does-my-new-car-lose-value-infographic.html&a=AIYkKU-Xzovo3z0DrA5qc7I4X8RZNXrBtg"
              }
            },
            {
              "youTubeVideo": {
                "id": "cUQiA4LtkmQ",
                "title": "Lehman Brothers fraud explained by Dylan Ratigan, 03-12-10",
                "alternateLink": "https://www.youtube.com/watch?v=cUQiA4LtkmQ",
                "thumbnailUrl": "https://i.ytimg.com/vi/cUQiA4LtkmQ/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.accaglobal.com/my/en/student/sa/features/tesco-scandal.html",
                "title": "Tesco scandal | Student Accountant | Students | ACCA Global",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.accaglobal.com/my/en/student/sa/features/tesco-scandal.html&a=AIYkKU_41xXeBo2zB_veaj9gVqF1eyBDOA"
              }
            }
          ]
        },
        {
          "title": "3.9 Budgets (HL only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbY1RnMk9iMzM5RWs",
                "title": "3_9 Budgetis.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbY1RnMk9iMzM5RWs",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbY1RnMk9iMzM5RWs&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "6Ib-bdko5cE",
                "title": "Budgeting",
                "alternateLink": "https://www.youtube.com/watch?v=6Ib-bdko5cE",
                "thumbnailUrl": "https://i.ytimg.com/vi/6Ib-bdko5cE/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Unit 3.1 Sources of Finance, 3.2 Costs & Revenues, 3.3 Break-even analysis",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbZXI4X3JpQmd0VWc",
                "title": "Unit 3_1 Sources of Finance.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbZXI4X3JpQmd0VWc",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbZXI4X3JpQmd0VWc&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.forbes.com/sites/nathanvardi/2017/09/19/the-big-investment-firms-that-lost-1-3-billion-on-the-toys-r-us-bankruptcy/#185caaf1308f",
                "title": "The Big Investment Firms That Lost $1.3 Billion In The Toys \"R\" Us Bankruptcy",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.forbes.com/sites/nathanvardi/2017/09/19/the-big-investment-firms-that-lost-1-3-billion-on-the-toys-r-us-bankruptcy/%23185caaf1308f&a=AIYkKU_njzF_DN8cudxBVd1RYOv9LTsoMQ"
              }
            },
            {
              "youTubeVideo": {
                "id": "_2Kt4moES0U",
                "title": "How the Stock Market Works for Dummies",
                "alternateLink": "https://www.youtube.com/watch?v=_2Kt4moES0U",
                "thumbnailUrl": "https://i.ytimg.com/vi/_2Kt4moES0U/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "O2IiwstF_UE",
                "title": "What is a Bond?",
                "alternateLink": "https://www.youtube.com/watch?v=O2IiwstF_UE",
                "thumbnailUrl": "https://i.ytimg.com/vi/O2IiwstF_UE/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.reuters.com/article/us-twitter-ipo-investors/many-investors-look-past-twitters-losses-for-now-idUSBRE99G00120131017",
                "title": "\n                Many investors look past Twitter's losses, for now | Reuters",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.reuters.com/article/us-twitter-ipo-investors/many-investors-look-past-twitters-losses-for-now-idUSBRE99G00120131017&a=AIYkKU_Ax9y8doHn3eudQVsy_FB9xnNFCQ"
              }
            },
            {
              "link": {
                "url": "https://www.ft.com/video/0892afbb-efe2-4764-8dd0-719766f1f946",
                "title": "Debt v Equity: shifting moods of finance | Financial Times",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.ft.com/video/0892afbb-efe2-4764-8dd0-719766f1f946&a=AIYkKU9iAoDW91KDwJ2gIwGz7O7zfW_9DA"
              }
            },
            {
              "youTubeVideo": {
                "id": "a4aUX5u90oA",
                "title": "If You Know Nothing About Venture Capital, Watch This First | Forbes",
                "alternateLink": "https://www.youtube.com/watch?v=a4aUX5u90oA",
                "thumbnailUrl": "https://i.ytimg.com/vi/a4aUX5u90oA/default.jpg"
              }
            }
          ]
        },
        {
          "title": "UNIT 1.6 Growth and evolution",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbaHBLTThpX0xsaDA",
                "title": "1_6 Growth n Evolution.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbaHBLTThpX0xsaDA",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbaHBLTThpX0xsaDA&sz=s200"
              }
            },
            {
              "link": {
                "url": "http://uk.reuters.com/article/uk-booker-group-m-a/booker-to-buy-two-grocery-chains-in-push-for-local-shoppers-idUKKBN0O60M420150521",
                "title": "\n                Booker to buy two grocery chains in push for local shoppers | Reuters",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://uk.reuters.com/article/uk-booker-group-m-a/booker-to-buy-two-grocery-chains-in-push-for-local-shoppers-idUKKBN0O60M420150521&a=AIYkKU_CgczLgtu7A9bkr3j3OgWg1RxbXQ"
              }
            },
            {
              "link": {
                "url": "https://www.ft.com/content/c49977ca-e460-11e6-8405-9e5580d6e5fb",
                "title": "Tesco swoops on food supplier Booker in �3.7bn deal | Financial Times",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.ft.com/content/c49977ca-e460-11e6-8405-9e5580d6e5fb&a=AIYkKU90mqKQ5540FzFpEBfPpR4n44kneQ"
              }
            },
            {
              "link": {
                "url": "http://www.bbc.com/news/business-40488135",
                "title": "Sandwich chain Subway plans expansion in High Street war - BBC News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.bbc.com/news/business-40488135&a=AIYkKU-4OmIg7kWXMmXjHJhb9m3Sx0mdbg"
              }
            },
            {
              "link": {
                "url": "http://www.reuters.com/article/us-airasia-china/airasia-to-launch-new-chinese-low-cost-carrier-idUSKCN18A0TL",
                "title": "\n                AirAsia to launch new Chinese low cost carrier | Reuters",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.reuters.com/article/us-airasia-china/airasia-to-launch-new-chinese-low-cost-carrier-idUSKCN18A0TL&a=AIYkKU8zLG1bDpWiviP8Xf_rnL-kp9VuDA"
              }
            },
            {
              "link": {
                "url": "http://www.bbc.com/news/business-39116672",
                "title": "Meg Whitman: Why I decided to shrink Hewlett-Packard - BBC News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.bbc.com/news/business-39116672&a=AIYkKU_J3TaJ-OJbvTLBea71f3UHV0eOUw"
              }
            },
            {
              "youTubeVideo": {
                "id": "hH-LbsecNfA",
                "title": "Franchising 101 – The Ultimate Guide to Buying a Franchise",
                "alternateLink": "https://www.youtube.com/watch?v=hH-LbsecNfA",
                "thumbnailUrl": "https://i.ytimg.com/vi/hH-LbsecNfA/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://edition.cnn.com/videos/cnnmoney/2017/08/25/samsung-surprising-facts-mxb-lon-orig.cnnmoney",
                "title": "Samsung: 5 stunning stats - CNN Video",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://edition.cnn.com/videos/cnnmoney/2017/08/25/samsung-surprising-facts-mxb-lon-orig.cnnmoney&a=AIYkKU96aHOQboAOu-LFOxgEIJUSkO2imQ"
              }
            },
            {
              "link": {
                "url": "https://www.businesstoday.in/magazine/lbs-case-study/how-ikea-adapted-its-strategies-to-expand-in-china/story/196322.html",
                "title": "How IKEA adapted its strategies to expand and become profitable in China",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.businesstoday.in/magazine/lbs-case-study/how-ikea-adapted-its-strategies-to-expand-in-china/story/196322.html&a=AIYkKU9zUJgRJi9I0aTVtbjauewzAY0yEA"
              }
            }
          ]
        },
        {
          "title": "UNIT 2.6 Industrial relations (HL only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbSTZuZjZVQjdOclU",
                "title": "Unit 2_6 Industrial Relations.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbSTZuZjZVQjdOclU",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbSTZuZjZVQjdOclU&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.thestar.com/yourtoronto/education/2016/05/12/toronto-catholic-elementary-teachers-to-launch-work-to-rule.html",
                "title": "Toronto Catholic elementary teachers to launch work-to-rule | The Star",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.thestar.com/yourtoronto/education/2016/05/12/toronto-catholic-elementary-teachers-to-launch-work-to-rule.html&a=AIYkKU867iCRjPts4nZbpb1nrIdEC0eOIw"
              }
            },
            {
              "youTubeVideo": {
                "id": "5F2GhLE8bkQ",
                "title": "Qantas Grounding - Special Edition 7.30 Report-Part 1",
                "alternateLink": "https://www.youtube.com/watch?v=5F2GhLE8bkQ",
                "thumbnailUrl": "https://i.ytimg.com/vi/5F2GhLE8bkQ/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "k69i_yAhEcQ",
                "title": "McKinsey on Change Management",
                "alternateLink": "https://www.youtube.com/watch?v=k69i_yAhEcQ",
                "thumbnailUrl": "https://i.ytimg.com/vi/k69i_yAhEcQ/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "9yysOwXbzRA",
                "title": "Change Management (Overview)",
                "alternateLink": "https://www.youtube.com/watch?v=9yysOwXbzRA",
                "thumbnailUrl": "https://i.ytimg.com/vi/9yysOwXbzRA/default.jpg"
              }
            },
            {
              "link": {
                "url": "https://www.youtube.com/watch?time_continue=10&v=0t5A5g-lV2s",
                "title": "Teachers union threatens to extend go-slow - YouTube",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.youtube.com/watch?time_continue%3D10%26v%3D0t5A5g-lV2s&a=AIYkKU-VYVHkf7h7WoOkSxvqG8VSoWZ7Mg"
              }
            }
          ]
        },
        {
          "title": "UNIT 1.4 Stakeholders",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbd3VqN21DMnlhN1U",
                "title": "UNIT 1_4 Stakeholders.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbd3VqN21DMnlhN1U",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbd3VqN21DMnlhN1U&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Unit 1.3 Organisational Objectives",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbZXkyOVh6VlRVTTg",
                "title": "Unit1_3 Organisational Objectives.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbZXkyOVh6VlRVTTg",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbZXkyOVh6VlRVTTg&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.cnbc.com/2017/04/20/joel-peterson-heres-how-to-set-the-right-goals-for-your-team.html",
                "title": "Joel Peterson: Here’s how to set the right goals for your team",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cnbc.com/2017/04/20/joel-peterson-heres-how-to-set-the-right-goals-for-your-team.html&a=AIYkKU-rKkl9jDDRhzjkS7zjUL56LgS2cg"
              }
            },
            {
              "link": {
                "url": "https://www.cosmeticsbusiness.com/news/article_page/The_Body_Shop_aims_to_be_the_worlds_most_ethical_and_sustainable_business/115595",
                "title": "The Body Shop aims to be \"the worlds most ethical and sustainable business\"",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cosmeticsbusiness.com/news/article_page/The_Body_Shop_aims_to_be_the_worlds_most_ethical_and_sustainable_business/115595&a=AIYkKU_V7zSA1F8LPGnZVVYsQnJJmmNpEg"
              }
            },
            {
              "link": {
                "url": "https://www.forbes.com/sites/adamhartung/2017/03/28/ge-needs-a-new-strategy-and-a-new-ceo/#4bb1518a4ad2",
                "title": "GE Needs A New Strategy And A New CEO",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.forbes.com/sites/adamhartung/2017/03/28/ge-needs-a-new-strategy-and-a-new-ceo/%234bb1518a4ad2&a=AIYkKU9dvESUfZYoeHHzlG2mx-GkMEvR6w"
              }
            },
            {
              "link": {
                "url": "http://www.sbs.com.au/news/thefeed/story/why-starbucks-just-cant-crack-australian-market",
                "title": "Why Starbucks just can't crack the Australian market | SBS News",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.sbs.com.au/news/thefeed/story/why-starbucks-just-cant-crack-australian-market&a=AIYkKU_4HPX4q-yTZPMpN4VTzxL7RagAYg"
              }
            }
          ]
        },
        {
          "title": "2.5 Organisational culture (HL & Culture Concept)",
          "materials": [
            {
              "youTubeVideo": {
                "id": "Rd0kf3wd120",
                "title": "What is Organisational Culture ? Why Culture Matters To Your Organization",
                "alternateLink": "https://www.youtube.com/watch?v=Rd0kf3wd120",
                "thumbnailUrl": "https://i.ytimg.com/vi/Rd0kf3wd120/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://www.meaning.ca/archives/archive/art_lessons-from-enron_P_Wong.htm",
                "title": "Articles",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.meaning.ca/archives/archive/art_lessons-from-enron_P_Wong.htm&a=AIYkKU-bGTcSEi9JHrvpfUeigxR-5pI4gQ"
              }
            },
            {
              "link": {
                "url": "https://www.cnbc.com/2017/04/10/wells-fargo-report-shows-culture-that-crushed-banks-reputation.html",
                "title": "Wells Fargo report shows culture that crushed bank's reputation",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cnbc.com/2017/04/10/wells-fargo-report-shows-culture-that-crushed-banks-reputation.html&a=AIYkKU86k54OU55A4O7C04tDnTyE4qyEMw"
              }
            },
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbVFJFdENRc1VXSjQ",
                "title": "Zappos Case.pdf",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbVFJFdENRc1VXSjQ",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbVFJFdENRc1VXSjQ&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.ft.com/content/263c811c-d8e4-11e6-944b-e7eb37a6aa8e",
                "title": "The Volkswagen scandal shows that corporate culture matters | Financial Times",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.ft.com/content/263c811c-d8e4-11e6-944b-e7eb37a6aa8e&a=AIYkKU8x6SsYbJHfQxZO3j7mKEgHY44xmA"
              }
            },
            {
              "link": {
                "url": "https://hbr.org/2018/01/the-culture-factor#the-leaders-guide-to-corporate-culture",
                "title": "The Culture Factor",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://hbr.org/2018/01/the-culture-factor%23the-leaders-guide-to-corporate-culture&a=AIYkKU_jsLxsZyAEu7AN_daO_lQ_tsWy6Q"
              }
            },
            {
              "link": {
                "url": "https://www.slideshare.net/BarbaraGill3/netflix-culture-deck",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.slideshare.net/BarbaraGill3/netflix-culture-deck&a=AIYkKU_Dl8S46syYmksyzR3EkUIpPX8GHg"
              }
            },
            {
              "driveFile": {
                "id": "1CsuVu18mS9kLruk6wmg13hNnK82DCQF1",
                "title": "UNIT2_5 Organisational culture.pptx",
                "alternateLink": "https://drive.google.com/open?id=1CsuVu18mS9kLruk6wmg13hNnK82DCQF1",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1CsuVu18mS9kLruk6wmg13hNnK82DCQF1&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Unit 1.2 Types of Organisations",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbRld1dVBTOGZtbk0",
                "title": "Unit 1_2 Types of Organisations.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbRld1dVBTOGZtbk0",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbRld1dVBTOGZtbk0&sz=s200"
              }
            },
            {
              "link": {
                "url": "https://www.cnbc.com/2016/02/22/a-co-op-that-delivers-on-the-american-dream.html",
                "title": "A co-op that delivers on the American dream",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.cnbc.com/2016/02/22/a-co-op-that-delivers-on-the-american-dream.html&a=AIYkKU9etn-df0Yts7mbJ9Vqnh7bzayLdA"
              }
            },
            {
              "youTubeVideo": {
                "id": "tenKnIx4ouY",
                "title": "NRECA: The Electric Cooperative Story",
                "alternateLink": "https://www.youtube.com/watch?v=tenKnIx4ouY",
                "thumbnailUrl": "https://i.ytimg.com/vi/tenKnIx4ouY/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "JzF6thf5GqA",
                "title": "'India's Microfinance Meltdown' for BBC Newsnight",
                "alternateLink": "https://www.youtube.com/watch?v=JzF6thf5GqA",
                "thumbnailUrl": "https://i.ytimg.com/vi/JzF6thf5GqA/default.jpg"
              }
            },
            {
              "link": {
                "url": "http://www.winnipegsun.com/2017/08/24/why-not-sell-crown-corporations",
                "title": "\nWhy not sell crown corporations? | Winnipeg Sun",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.winnipegsun.com/2017/08/24/why-not-sell-crown-corporations&a=AIYkKU-J7Ph67D76aym_aq0iQrXNQhoNtw"
              }
            },
            {
              "link": {
                "url": "http://www.circ.in/pdf/ER_Case_Study_14.pdf",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://www.circ.in/pdf/ER_Case_Study_14.pdf&a=AIYkKU-PQSv6e5FWCJ9HsjIdOcYdrnVZNA"
              }
            },
            {
              "link": {
                "url": "http://smateria.com/about/",
                "title": "Story - Smateria",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://smateria.com/about/&a=AIYkKU-PUHVutxFVVWZKvYfArpHEAB1ZMQ"
              }
            },
            {
              "link": {
                "url": "https://www.amnesty.org/en/",
                "title": "Home | Amnesty International",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.amnesty.org/en/&a=AIYkKU9xc2PlcMw1zokOkPuPARhAdAMDww"
              }
            }
          ]
        },
        {
          "title": "1.7 Organisational planning tools (HL only)",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbblFQNWxSUi04WUE",
                "title": "UNIT1_7 Planning.pptx",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbblFQNWxSUi04WUE",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbblFQNWxSUi04WUE&sz=s200"
              }
            },
            {
              "youTubeVideo": {
                "id": "BW4qvULMJjs",
                "title": "What is a Fish bone diagram ?",
                "alternateLink": "https://www.youtube.com/watch?v=BW4qvULMJjs",
                "thumbnailUrl": "https://i.ytimg.com/vi/BW4qvULMJjs/default.jpg"
              }
            },
            {
              "youTubeVideo": {
                "id": "ADK58IRPKh8",
                "title": "What is a Gantt Chart in Project Management? — Episode 5",
                "alternateLink": "https://www.youtube.com/watch?v=ADK58IRPKh8",
                "thumbnailUrl": "https://i.ytimg.com/vi/ADK58IRPKh8/default.jpg"
              }
            }
          ]
        },
        {
          "title": "1.1 Introduction to Business Management",
          "materials": [
            {
              "link": {
                "url": "https://www.economist.com/blogs/freeexchange/2015/03/american-manufacturing",
                "title": "The two worlds of deindustrialisation - American manufacturing",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.economist.com/blogs/freeexchange/2015/03/american-manufacturing&a=AIYkKU-SkD9KvUmZBpmIFqR5_FHbsXBGIQ"
              }
            },
            {
              "youTubeVideo": {
                "id": "6UhrIEUjtwI",
                "title": "Amazon's Retail Revolution Business Boomers   BBC Full documentary 2014",
                "alternateLink": "https://www.youtube.com/watch?v=6UhrIEUjtwI",
                "thumbnailUrl": "https://i.ytimg.com/vi/6UhrIEUjtwI/default.jpg"
              }
            },
            {
              "driveFile": {
                "id": "1_ssASak3oYBoDVOg07RUZ_ml9W8udAOs",
                "title": "Unit 1_1 Intro to Biz MGT.pptx",
                "alternateLink": "https://drive.google.com/open?id=1_ssASak3oYBoDVOg07RUZ_ml9W8udAOs",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1_ssASak3oYBoDVOg07RUZ_ml9W8udAOs&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Business Management Syllabus",
          "materials": [
            {
              "driveFile": {
                "id": "0B6KfBVM7lPEbZjlTV0V2VGU0bE0",
                "title": "Business Management syllabus guide (1).pdf",
                "alternateLink": "https://drive.google.com/open?id=0B6KfBVM7lPEbZjlTV0V2VGU0bE0",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0B6KfBVM7lPEbZjlTV0V2VGU0bE0&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1KDqB8YJp5MvERo-GE7W4tMXSaUd5ndVn",
                "title": "OCC_d_3_busmt_inf_1605_1_e.pdf",
                "alternateLink": "https://drive.google.com/open?id=1KDqB8YJp5MvERo-GE7W4tMXSaUd5ndVn",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1KDqB8YJp5MvERo-GE7W4tMXSaUd5ndVn&sz=s200"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom093e7f69@group.calendar.google.com"
    },
    {
      "id": "1976502963",
      "name": "learning google",
      "descriptionHeading": "learning google",
      "ownerId": "115741573306212348757",
      "creationTime": "2016-08-25T04:51:38.354Z",
      "updateTime": "2016-08-25T04:51:37.005Z",
      "enrollmentCode": "7ezfqd",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk3NjUwMjk2M1pa",
      "teacherGroupEmail": "learning_google_teachers_b9bba1b3@hope.edu.kh",
      "courseGroupEmail": "learning_google_37a45f60@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6GAi_AwzKgNfjBOa0FvWGNBMnJIV3FTQ3BYZGFWUy1NcHlGbm5ZSzNveGRELURheUhCMUE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfee44a92@group.calendar.google.com"
    },
    {
      "id": "1968300064",
      "name": "PE IGCSE 2016 - 2018",
      "descriptionHeading": "2016 - 2018 IGCSE PE 1",
      "ownerId": "106622560452336024633",
      "creationTime": "2016-08-24T04:55:19.022Z",
      "updateTime": "2018-08-23T01:26:34.040Z",
      "enrollmentCode": "tzmpvt",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTk2ODMwMDA2NFpa",
      "teacherGroupEmail": "2016_2018_IGCSE_PE_1_teachers_0bab902b@hope.edu.kh",
      "courseGroupEmail": "2016_2018_IGCSE_PE_1_f21250de@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxS6qtLdI0JLfndva1dkZzhYM0EzdTE3Q0xVZk1IY0E4UTZNZ0xkbS14Mml1LTNVbWFTSHc"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomffb9ed98@group.calendar.google.com"
    },
    {
      "id": "1954386595",
      "name": "Y 7 Art Class",
      "section": "Hope International School",
      "descriptionHeading": "Y 7 Art Class Hope International School",
      "ownerId": "109973518741915177521",
      "creationTime": "2016-08-22T00:45:03.432Z",
      "updateTime": "2017-03-27T06:38:56.928Z",
      "enrollmentCode": "qtkbau",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk1NDM4NjU5NVpa",
      "teacherGroupEmail": "Y_7_Art_Class_Hope_International_School_teachers_7d6253ef@hope.edu.kh",
      "courseGroupEmail": "Y_7_Art_Class_Hope_International_School_417e2da9@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKfnowcEYyZHpYYXdYalRiTGFBTVVtZVk1eXNOMFR1anRpVDBXYWlnNW90dWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd114bf6e@group.calendar.google.com"
    },
    {
      "id": "1952783772",
      "name": "Y6 IP Art",
      "descriptionHeading": "Y6 IP Art",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-08-20T03:19:11.655Z",
      "updateTime": "2016-08-20T03:22:54.967Z",
      "enrollmentCode": "gvl0nd",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk1Mjc4Mzc3Mlpa",
      "teacherGroupEmail": "Y6_IP_Art_teachers_3ca2cddd@hope.edu.kh",
      "courseGroupEmail": "Y6_IP_Art_aafa6743@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2flpSam5KM0hiNVh6U3BoekxtNlUwbEEycV9aVFpiMG01NGJMVHVRUUg1S2s"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom8520341c@group.calendar.google.com"
    },
    {
      "id": "1952422578",
      "name": "Y7 Art",
      "descriptionHeading": "Y6 JKW Art",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-08-20T03:18:19.884Z",
      "updateTime": "2018-09-13T00:09:17.123Z",
      "enrollmentCode": "xlbee7",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTk1MjQyMjU3OFpa",
      "teacherGroupEmail": "Y6_JKW_Art_teachers_e0a6d85e@hope.edu.kh",
      "courseGroupEmail": "Y6_JKW_Art_21e71a1d@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fjQtU3d3WjdONFN1aXl6XzNKSVpDcnZ1aVFIZmx0dEpBWG9DVUVmVFhrYlU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom21549045@group.calendar.google.com"
    },
    {
      "id": "1947910188",
      "name": "English 7 Mrs. Boring",
      "descriptionHeading": "English 7",
      "description": "Mrs. Boring's Year 7 English class",
      "room": "S.20",
      "ownerId": "101376001376489767934",
      "creationTime": "2016-08-19T06:00:52.895Z",
      "updateTime": "2018-06-06T01:15:52.077Z",
      "enrollmentCode": "w5n864",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk0NzkxMDE4OFpa",
      "teacherGroupEmail": "English_6IP_teachers_cda4b27f@hope.edu.kh",
      "courseGroupEmail": "English_6IP_6305a7b2@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByfnHSpTdBOBflp0MkNLeEZIRVBlUS1vN2Juc1lVWHp5NVVZNDBfQ3d6dWJxT1U3YjFTM1U"
      },
      "courseMaterialSets": [
        {
          "title": "The Bronze Bow Quizlet: follow link and click learn to quiz yourself",
          "materials": [
            {
              "link": {
                "url": "https://quizlet.com/12247009/the-bronze-bow-study-guide-flash-cards/",
                "title": "The Bronze Bow Study Guide Flashcards | Quizlet",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://quizlet.com/12247009/the-bronze-bow-study-guide-flash-cards/&a=AIYkKU9qXAw4-gbc8yaE62iG3iCbXsK6aQ"
              }
            }
          ]
        },
        {
          "title": "Here is the article about how they created the image of what Jesus might have looked like",
          "materials": [
            {
              "link": {
                "url": "https://www.popularmechanics.com/science/health/a234/1282186/",
                "title": "The Real Face Of Jesus - What Did Jesus Look Like?",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.popularmechanics.com/science/health/a234/1282186/&a=AIYkKU9b_tosI0bZ79qcQWp8n1lo_KTbBg"
              }
            }
          ]
        },
        {
          "title": "Malala Day Speech UN 12 July 2013",
          "materials": [
            {
              "youTubeVideo": {
                "id": "QRh_30C8l6Y",
                "title": "Girl Shot in Head by Taliban, Speaks at UN: Malala Yousafzai United Nations Speech 2013",
                "alternateLink": "https://www.youtube.com/watch?v=QRh_30C8l6Y",
                "thumbnailUrl": "https://i.ytimg.com/vi/QRh_30C8l6Y/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Martin Luther King, Jr. \"I Have a Dream\" Speech transcript",
          "materials": [
            {
              "driveFile": {
                "id": "1oLV-rWgxytlCHSafwNuoEPqOwleW06wIc1uxkd8c6ls",
                "title": "Martin Luther King - I have a dream script",
                "alternateLink": "https://drive.google.com/open?id=1oLV-rWgxytlCHSafwNuoEPqOwleW06wIc1uxkd8c6ls",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1oLV-rWgxytlCHSafwNuoEPqOwleW06wIc1uxkd8c6ls&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Martin Luther King, Jr. \"I Have a Dream\" Speech link",
          "materials": [
            {
              "youTubeVideo": {
                "id": "3vDWWy4CMhE",
                "title": "Martin Luther King, Jr. I Have A Dream Speech",
                "alternateLink": "https://www.youtube.com/watch?v=3vDWWy4CMhE",
                "thumbnailUrl": "https://i.ytimg.com/vi/3vDWWy4CMhE/default.jpg"
              }
            }
          ]
        },
        {
          "title": "World Wildlife Fund Species Search page (use search box in top right corner)",
          "materials": [
            {
              "link": {
                "url": "https://www.worldwildlife.org/species-categories/marine-animals/species/directory",
                "title": "Species List | Protecting Wildlife | WWF",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.worldwildlife.org/species-categories/marine-animals/species/directory&a=AIYkKU98xqjRGU2Cw-8PX2L1_yJQXSmkxw"
              }
            }
          ]
        },
        {
          "title": "Links",
          "materials": [
            {
              "link": {
                "url": "https://owlcation.com/stem/List-of-Top-10-Endangered-Species-in-Asia",
                "title": "List of Top 10 Endangered Animal Species in Asia | Owlcation",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://owlcation.com/stem/List-of-Top-10-Endangered-Species-in-Asia&a=AIYkKU99znSk42GRx2vJuIUUAfbTMVcPaw"
              }
            }
          ]
        },
        {
          "title": "Link to Giant Bicycle page",
          "materials": [
            {
              "link": {
                "url": "https://www.giant-bicycles.com/int",
                "title": "Giant Bicycles - The World’s Largest Manufacturer of Men’s Bikes",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.giant-bicycles.com/int&a=AIYkKU9-aYByw84MpweTrpQJ8HGSV5aLNQ"
              }
            }
          ]
        },
        {
          "title": "ProCon.org Euthanasia main page",
          "materials": [
            {
              "link": {
                "url": "https://euthanasia.procon.org/",
                "title": "Euthanasia - ProCon.org",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://euthanasia.procon.org/&a=AIYkKU9myexEJ3ZoZKgyyguZgu8DdoqnQg"
              }
            }
          ]
        },
        {
          "title": "Euthanasia and Physician Assisted Suicide laws around the world\n Link 1 below is a summary of laws for these two practices outside of the US.\nLink 2 below is information about the Death with Dignity Act in the state of Oregon in the US (Isaac's home state).",
          "materials": [
            {
              "link": {
                "url": "https://euthanasia.procon.org/view.resource.php?resourceID=000136",
                "title": "Euthanasia & Physician-Assisted Suicide (PAS) around the World - Euthanasia - ProCon.org",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://euthanasia.procon.org/view.resource.php?resourceID%3D000136&a=AIYkKU_K4fGI8nkUubEOd0e4uX4-Q0HZ3A"
              }
            },
            {
              "link": {
                "url": "https://euthanasia.procon.org/view.answers.php?questionID=001289",
                "title": "404 Not Found - 404 Not Found - ProCon.org",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://euthanasia.procon.org/view.answers.php?questionID%3D001289&a=AIYkKU_s-D0FzfgeD13_sxlCueRZrNfZIA"
              }
            }
          ]
        },
        {
          "title": "Film Link: A State of Mind (North Korean gymnasts) 1 of 10",
          "materials": [
            {
              "youTubeVideo": {
                "id": "_Nd-iSCy1og",
                "title": "A State of Mind 01 [Eng subtitle]",
                "alternateLink": "https://www.youtube.com/watch?v=_Nd-iSCy1og",
                "thumbnailUrl": "https://i.ytimg.com/vi/_Nd-iSCy1og/default.jpg"
              }
            }
          ]
        },
        {
          "title": "pathos ethos logos TV ads",
          "materials": [
            {
              "link": {
                "url": "https://www.youtube.com/watch?list=PLUt_PBZQzj_D7wPfnSX-m9Ho1pfcq_CgG&v=SfAxUpeVhCg",
                "title": "quit smoking commercial - YouTube",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://www.youtube.com/watch?list%3DPLUt_PBZQzj_D7wPfnSX-m9Ho1pfcq_CgG%26v%3DSfAxUpeVhCg&a=AIYkKU_3bJtwZhLnthvYA4ekxkkJaOl8_Q"
              }
            }
          ]
        },
        {
          "title": "Got Milk? Cookies TV ad",
          "materials": [
            {
              "youTubeVideo": {
                "id": "eph6_fz49rc",
                "title": "Got Milk? - Heaven or Hell",
                "alternateLink": "https://www.youtube.com/watch?v=eph6_fz49rc",
                "thumbnailUrl": "https://i.ytimg.com/vi/eph6_fz49rc/default.jpg"
              }
            }
          ]
        },
        {
          "title": "Got Milk? Salma Hayak TV ad",
          "materials": [
            {
              "youTubeVideo": {
                "id": "eeeLbyAopy4",
                "title": "SALMA HAYEK  Got Milk commercial",
                "alternateLink": "https://www.youtube.com/watch?v=eeeLbyAopy4",
                "thumbnailUrl": "https://i.ytimg.com/vi/eeeLbyAopy4/default.jpg"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1391e1c7@group.calendar.google.com"
    },
    {
      "id": "1941802988",
      "name": "Year 5",
      "descriptionHeading": "Year 5",
      "ownerId": "100198951541497055035",
      "creationTime": "2016-08-18T09:09:09.149Z",
      "updateTime": "2016-08-18T09:13:12.941Z",
      "enrollmentCode": "3ctnfz9",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk0MTgwMjk4OFpa",
      "teacherGroupEmail": "Year_5_teachers_17b5bde9@hope.edu.kh",
      "courseGroupEmail": "Year_5_f65f270d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B53oVZGL9MRPfm9MbGVJX05tVUVGTTJuSlVwSldNaGxZZHVOSFdzcVZ2ekNnMTc3a2R3OG8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom754add31@group.calendar.google.com"
    },
    {
      "id": "1942780294",
      "name": "Kindergarten 2016",
      "descriptionHeading": "Kindergarten 2016",
      "ownerId": "107482957847789615709",
      "creationTime": "2016-08-18T08:59:57.626Z",
      "updateTime": "2016-08-18T08:59:56.120Z",
      "enrollmentCode": "opxme21",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTk0Mjc4MDI5NFpa",
      "teacherGroupEmail": "Kindergarten_2016_teachers_1baea550@hope.edu.kh",
      "courseGroupEmail": "Kindergarten_2016_721010d2@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxXK0BozN9xGfktkMm0xVG01TW1jVVJwYmhyQ2hiYlFzN2dQWm1Sb2NXMVhkVjM0clo1VTg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom23a5252e@group.calendar.google.com"
    },
    {
      "id": "1942666318",
      "name": "Year 10 IGCSE History",
      "descriptionHeading": "Year 9 IGCSE History",
      "ownerId": "103551314133091140944",
      "creationTime": "2016-08-18T06:12:13.504Z",
      "updateTime": "2018-08-17T07:26:52.655Z",
      "enrollmentCode": "2w37ymx",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTk0MjY2NjMxOFpa",
      "teacherGroupEmail": "Year_9_IGCSE_History_teachers_a194d0c4@hope.edu.kh",
      "courseGroupEmail": "Year_9_IGCSE_History_b08b0475@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefnhKSUVUaVQyaElWWlFNZFJVRkVRUHFSS1lsbC0xcTFZYV83VjJBWVB6WWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma04e14c9@group.calendar.google.com"
    },
    {
      "id": "1937850678",
      "name": "Y10 IGCSE Art (Old)",
      "section": "Hope International School Y10 IGCSE",
      "descriptionHeading": "Y10 IGCSE Art Hope International School Y9 IGCSE",
      "ownerId": "109973518741915177521",
      "creationTime": "2016-08-17T06:51:35.282Z",
      "updateTime": "2016-08-19T06:43:58.094Z",
      "enrollmentCode": "ho89kw4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkzNzg1MDY3OFpa",
      "teacherGroupEmail": "Y9_IGCSE_Art_Hope_International_School_Y9_IGCSE_teachers_2967fdab@hope.edu.kh",
      "courseGroupEmail": "Y9_IGCSE_Art_Hope_International_School_Y9_IGCSE_21d5b32c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKfkRSSzdmUFBERGJpQm1zeUtuaWNmazR3dnlZQzdFMGtraFpWelMxZURTVVE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4cb0b658@group.calendar.google.com"
    },
    {
      "id": "1933427027",
      "name": "Year 9 National History",
      "descriptionHeading": "Year 9 National History",
      "ownerId": "103551314133091140944",
      "creationTime": "2016-08-16T11:12:43.848Z",
      "updateTime": "2017-08-15T03:38:27.726Z",
      "enrollmentCode": "20vlaem",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkzMzQyNzAyN1pa",
      "teacherGroupEmail": "Year_9_National_History_teachers_2bb6e19c@hope.edu.kh",
      "courseGroupEmail": "Year_9_National_History_3921a35e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoeflVQbGdEWXNwWG1WY3NwLUl6bVlnME9hYTdjVXFJZFpCUWJDdTBEZFJBR2c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7b9b0bb9@group.calendar.google.com"
    },
    {
      "id": "1929906703",
      "name": "Year 9 Global Perspectives 2016-2017",
      "descriptionHeading": "Year 9 Global Perspectives 2016-2017",
      "ownerId": "103551314133091140944",
      "creationTime": "2016-08-16T11:05:21.749Z",
      "updateTime": "2017-08-15T03:38:39.874Z",
      "enrollmentCode": "fe44qkz",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyOTkwNjcwM1pa",
      "teacherGroupEmail": "Year_9_Global_Perspectives_2016_2017_teachers_7bd1fff6@hope.edu.kh",
      "courseGroupEmail": "Year_9_Global_Perspectives_2016_2017_7b986adb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefmlrRjh3QVNxRVRXSVNLUWR5RFZkekpwXy02YnlzcEx6MlQ1ME9Oc3g3ZnM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf9bcedaf@group.calendar.google.com"
    },
    {
      "id": "1933054627",
      "name": "Year 12 IB HL History",
      "descriptionHeading": "Year 11 IB HL History",
      "ownerId": "103551314133091140944",
      "creationTime": "2016-08-16T04:18:30.709Z",
      "updateTime": "2018-08-17T07:27:04.225Z",
      "enrollmentCode": "wesc30",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkzMzA1NDYyN1pa",
      "teacherGroupEmail": "Year_11_IB_HL_History_teachers_348020ee@hope.edu.kh",
      "courseGroupEmail": "Year_11_IB_HL_History_44f9bbab@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6PDxPU9zcoefnFNR1J5ckVHTHY1b3NxV29zSWJXeFN1N0ZIdnpzX1dDRnBKVEFwemNaZU0"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroombc1bbfc6@group.calendar.google.com"
    },
    {
      "id": "1932195145",
      "name": "Y2019 IB Korean SL SM",
      "section": "IB Korean",
      "descriptionHeading": "Y12 2017-2019 IB",
      "description": "IB Korean: Language & Literature SL",
      "room": "S28",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-08-16T02:50:29.676Z",
      "updateTime": "2019-01-31T07:06:20.717Z",
      "enrollmentCode": "8xu2tj",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkzMjE5NTE0NVpa",
      "teacherGroupEmail": "Y10_2016_2017_IGCSE_Korean_teachers_7a05a2b7@hope.edu.kh",
      "courseGroupEmail": "Y10_2016_2017_IGCSE_Korean_cff5f902@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfjRnQUlDbXA0c3NnWkMyeFE3UGxOOHR1b0l4VmFBaWFqWWp4Tmo3VkJhRWs",
        "title": "IB 2017-2019 IB Korean",
        "alternateLink": "https://drive.google.com/drive/folders/0BzBsM2bdtMnzfjRnQUlDbXA0c3NnWkMyeFE3UGxOOHR1b0l4VmFBaWFqWWp4Tmo3VkJhRWs"
      },
      "courseMaterialSets": [
        {
          "title": "\u003c맞춤법 검사기\u003e\n\n그래봤자 컴퓨터기에 이 검사기를 100% 의지할 수는 없지만 그래도 기본적인 스펠링은 미리 체크하고 제출하도록 하자.",
          "materials": [
            {
              "link": {
                "url": "http://speller.cs.pusan.ac.kr/PnuWebSpeller/",
                "title": "한국어 맞춤법/문법 검사기",
                "thumbnailUrl": "https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=http://speller.cs.pusan.ac.kr/PnuWebSpeller/&a=AIYkKU_B69nnGWWPxcAFFivM60VU7AkyDw"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomda304e2b@group.calendar.google.com"
    },
    {
      "id": "1930482536",
      "name": "North 3NG",
      "section": "School Year 2016-2017 Semester 1",
      "descriptionHeading": "North 3NG School Year 2016-2017 Semester 1",
      "ownerId": "106981731167984742403",
      "creationTime": "2016-08-15T15:05:21.195Z",
      "updateTime": "2016-08-31T01:19:36.884Z",
      "enrollmentCode": "2s4bh3",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkzMDQ4MjUzNlpa",
      "teacherGroupEmail": "North_3NG_School_Year_2016_2017_Semester_1_teachers_2f76a4d3@hope.edu.kh",
      "courseGroupEmail": "North_3NG_School_Year_2016_2017_Semester_1_2ea63e95@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5Z-c5soe_gcfk9iSVRhTGZ2bjBtSFRIT2hOa080dEd0SmxMUnVpcGxkYmZQcmN4UFg4MVU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7d538155@group.calendar.google.com"
    },
    {
      "id": "1929756035",
      "name": "Y12 2017-2018",
      "section": "IB Korean",
      "descriptionHeading": "IB Korean 2016-2018 Korean",
      "room": "S28",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-08-15T09:58:57.906Z",
      "updateTime": "2018-08-16T13:13:49.292Z",
      "enrollmentCode": "zo0u37",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyOTc1NjAzNVpa",
      "teacherGroupEmail": "IB_Korean_2016_2018_Korean_teachers_df9dbc4f@hope.edu.kh",
      "courseGroupEmail": "IB_Korean_2016_2018_Korean_53c41256@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfnpXMUtKYlM3dV9wU3l5RTlqYUFRa2JEWm1HaXVKMEM3RUtjblhPWW16SFk"
      },
      "courseMaterialSets": [
        {
          "title": "2016May_HL_P1.pdf",
          "materials": [
            {
              "driveFile": {
                "id": "16kmYiNz8ay0TNQgkBo7fN4sGuy7lXYGS",
                "alternateLink": "https://drive.google.com/open?id=16kmYiNz8ay0TNQgkBo7fN4sGuy7lXYGS"
              }
            },
            {
              "driveFile": {
                "id": "1f4CPRDwvvrdXFs5bEfM8IIkMoG-sVB9a",
                "alternateLink": "https://drive.google.com/open?id=1f4CPRDwvvrdXFs5bEfM8IIkMoG-sVB9a"
              }
            },
            {
              "driveFile": {
                "id": "1biNCJBpK07OOcfSL9xxlrQfPMN2DSchG",
                "alternateLink": "https://drive.google.com/open?id=1biNCJBpK07OOcfSL9xxlrQfPMN2DSchG"
              }
            },
            {
              "driveFile": {
                "id": "1YMXbNEpNz8v32-UHUyLn6x5y1gyY2g_B",
                "alternateLink": "https://drive.google.com/open?id=1YMXbNEpNz8v32-UHUyLn6x5y1gyY2g_B"
              }
            },
            {
              "driveFile": {
                "id": "1wPVXTinDjBAmgzl0gDMpUHKw62grk47O",
                "alternateLink": "https://drive.google.com/open?id=1wPVXTinDjBAmgzl0gDMpUHKw62grk47O"
              }
            }
          ]
        },
        {
          "title": "Paper 1_planning sheet_May2014_Text2",
          "materials": [
            {
              "driveFile": {
                "id": "1ydOKzNcX8vgXqtVQ4UW5odXGTohmTqHjo3wjto04aJ0",
                "title": "Paper 1_planning sheet_May2014_Text2",
                "alternateLink": "https://drive.google.com/open?id=1ydOKzNcX8vgXqtVQ4UW5odXGTohmTqHjo3wjto04aJ0",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1ydOKzNcX8vgXqtVQ4UW5odXGTohmTqHjo3wjto04aJ0&sz=s200"
              }
            }
          ]
        },
        {
          "title": "EA Assessment Criteria",
          "materials": [
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzWEtVMDdVbU5rVnc",
                "title": "EA assessment criteria.pdf",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzWEtVMDdVbU5rVnc",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0BzBsM2bdtMnzWEtVMDdVbU5rVnc&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Paper 1_planning sheet_May2014_Text1.docx",
          "materials": [
            {
              "driveFile": {
                "id": "1bc5Ffrgif6us346UxyTQX93eOZhjcgwIufOMPnxkMOQ",
                "title": "Paper 1_planning sheet_May2014_Text1.docx",
                "alternateLink": "https://drive.google.com/open?id=1bc5Ffrgif6us346UxyTQX93eOZhjcgwIufOMPnxkMOQ",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1bc5Ffrgif6us346UxyTQX93eOZhjcgwIufOMPnxkMOQ&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Markscheme_May 2017 text 1 & text 2 / May 2013 text 1",
          "materials": [
            {
              "driveFile": {
                "id": "1BazxaS6vkO0Lu44zFJytFXcVVpp-NrBbMhJHygf_CCY",
                "title": "Paper 1_planning sheet_May2017_text 1",
                "alternateLink": "https://drive.google.com/open?id=1BazxaS6vkO0Lu44zFJytFXcVVpp-NrBbMhJHygf_CCY",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1BazxaS6vkO0Lu44zFJytFXcVVpp-NrBbMhJHygf_CCY&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1yGGip-v3OQQSMa5T4FNYQ0yNk9H9AXDdT_F4Z5fkJBY",
                "title": "Paper 1_planning sheet_May2013_Text1.docx",
                "alternateLink": "https://drive.google.com/open?id=1yGGip-v3OQQSMa5T4FNYQ0yNk9H9AXDdT_F4Z5fkJBY",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1yGGip-v3OQQSMa5T4FNYQ0yNk9H9AXDdT_F4Z5fkJBY&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1sgorhtZKPbXPbtNykOFc2CiBovjnwUDR6fG88wIdIDU",
                "title": "Paper 1_planning sheet_May2017_text2.docx",
                "alternateLink": "https://drive.google.com/open?id=1sgorhtZKPbXPbtNykOFc2CiBovjnwUDR6fG88wIdIDU",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1sgorhtZKPbXPbtNykOFc2CiBovjnwUDR6fG88wIdIDU&sz=s200"
              }
            }
          ]
        },
        {
          "title": "Paper 1 planning sheet",
          "materials": [
            {
              "driveFile": {
                "id": "1zRQONfGg8IDowakt1NaOcdxYTeuYfSCQM4HEjiPG-qU",
                "title": "Paper 1_planning sheet_template",
                "alternateLink": "https://drive.google.com/open?id=1zRQONfGg8IDowakt1NaOcdxYTeuYfSCQM4HEjiPG-qU",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1zRQONfGg8IDowakt1NaOcdxYTeuYfSCQM4HEjiPG-qU&sz=s200"
              }
            }
          ]
        },
        {
          "title": "WT Rationale 작성요령",
          "materials": [
            {
              "driveFile": {
                "id": "1WiEzWTtEzHatSLMLY6Dx1onF2FFEngeZnzMNUjlM-FY",
                "alternateLink": "https://drive.google.com/open?id=1WiEzWTtEzHatSLMLY6Dx1onF2FFEngeZnzMNUjlM-FY"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd1a8e8cd@group.calendar.google.com"
    },
    {
      "id": "1928590076",
      "name": "Y9 Design Class",
      "descriptionHeading": "Y9 Design Class",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-08-14T10:10:51.468Z",
      "updateTime": "2016-08-14T10:11:19.177Z",
      "enrollmentCode": "3juy5gv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyODU5MDA3Nlpa",
      "teacherGroupEmail": "Y9_Design_Class_teachers_8ee75123@hope.edu.kh",
      "courseGroupEmail": "Y9_Design_Class_96baab19@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fmlIbVdRaW1xdkVua2pTMUlWVTlWSE9PVHFlMGJ1N0lIc19XUUJrQjkzczg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1dc05889@group.calendar.google.com"
    },
    {
      "id": "1928133250",
      "name": "Test",
      "section": "Test",
      "descriptionHeading": "Test Test",
      "ownerId": "115993602016821544514",
      "creationTime": "2016-08-14T08:24:40.006Z",
      "updateTime": "2016-08-14T08:24:38.649Z",
      "enrollmentCode": "9r3442h",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyODEzMzI1MFpa",
      "teacherGroupEmail": "Test_Test_teachers_d4cd8236@hope.edu.kh",
      "courseGroupEmail": "Test_Test_43d95c25@hope.edu.kh",
      "teacherFolder": {
        "id": "0B7t5FM73sMZyfmtySDVGdFJTa1QwLTNOclB5dW1zbklBb3hvRkhrNlBheXBPc2d2Y25OcjA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom35d2aeb5@group.calendar.google.com"
    },
    {
      "id": "1928425790",
      "name": "Y10 IGCSE Art",
      "descriptionHeading": "Y10 IGCSE Art",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-08-14T08:10:18.686Z",
      "updateTime": "2016-08-14T08:10:41.467Z",
      "enrollmentCode": "m9zp64",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyODQyNTc5MFpa",
      "teacherGroupEmail": "Y10_IGCSE_Art_teachers_334ecdfc@hope.edu.kh",
      "courseGroupEmail": "Y10_IGCSE_Art_960320a6@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fjQzRTdVRXNVU3BXTjJDb2lGM2otVEJtVW9zRlE0ZXNyLV93RHdjUG1YX1E"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd00ff701@group.calendar.google.com"
    },
    {
      "id": "1928037034",
      "name": "Year 10 IGCSE 2016/17 Language",
      "descriptionHeading": "Year 10 IGCSE 2016/17 Language",
      "ownerId": "110627498288637945705",
      "creationTime": "2016-08-13T08:12:04.684Z",
      "updateTime": "2017-08-25T02:45:07.188Z",
      "enrollmentCode": "omzwdl",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyODAzNzAzNFpa",
      "teacherGroupEmail": "Year_10_IGCSE_2016_17_Literature_teachers_1c376396@hope.edu.kh",
      "courseGroupEmail": "Year_10_IGCSE_2016_17_Literature_c4a2e4ee@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrflVPMTAwQ2kxOGthOTdkNHVNVzZ0S0lEbHcxNkl3TjZmRE5TZzVaUXoyWDA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom2e624f69@group.calendar.google.com"
    },
    {
      "id": "1925192089",
      "name": "North 4SL",
      "section": "School Year 2016-2017 Semester 1",
      "descriptionHeading": "North 4SL School Year 2016-2017",
      "ownerId": "106981731167984742403",
      "creationTime": "2016-08-12T05:47:50.919Z",
      "updateTime": "2017-05-24T04:41:46.046Z",
      "enrollmentCode": "u8sk8n",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyNTE5MjA4OVpa",
      "teacherGroupEmail": "North_4SL_School_Year_2016_2017_Semester_1_teachers_e677a0f5@hope.edu.kh",
      "courseGroupEmail": "North_4SL_School_Year_2016_2017_Semester_1_82b3e23d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5Z-c5soe_gcfjVES1F4bkZjQ1lxVGNNVGZfd0V1VjdoWkFQb2RVRFJ4Y2NzMjBxWlgwT1E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6872c603@group.calendar.google.com"
    },
    {
      "id": "1925314053",
      "name": "Year 9 IGCSE 2016/17",
      "descriptionHeading": "Year 9 IGCSE 2016/17",
      "description": "Amazing incredible learnings of English ....",
      "ownerId": "110627498288637945705",
      "creationTime": "2016-08-12T02:59:34.196Z",
      "updateTime": "2017-08-25T02:45:02.653Z",
      "enrollmentCode": "0gvstl4",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyNTMxNDA1M1pa",
      "teacherGroupEmail": "Year_9_IGCSE_2016_17_teachers_259ddb8e@hope.edu.kh",
      "courseGroupEmail": "Year_9_IGCSE_2016_17_6d78216b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrflVrelZqTjJJR3ZwZE9xdG1ETU81ZVpRdnIxcVBaNk96R0REeHRFcExpXzg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom44a9acf8@group.calendar.google.com"
    },
    {
      "id": "1922494447",
      "name": "Y2021 IGCSE Korean SM",
      "section": "IGCSE Korean",
      "descriptionHeading": "Y2021 IGCSE Korean SM",
      "description": "IGCSE First Language: Korean",
      "room": "S28",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-08-11T07:12:05.595Z",
      "updateTime": "2019-01-31T07:09:27.250Z",
      "enrollmentCode": "nkcfp8n",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyMjQ5NDQ0N1pa",
      "teacherGroupEmail": "Y8_2016_2017_Korean_teachers_a8e653d9@hope.edu.kh",
      "courseGroupEmail": "Y8_2016_2017_Korean_ca3d3efa@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfkR0enN1dmdlQXo2Qlpja1dGYlU3Z0s3cGt5UEFHMXcxM24xRW1PUGI5NDA",
        "title": "Y9 2017-2019 IGCSE Korean",
        "alternateLink": "https://drive.google.com/drive/folders/0BzBsM2bdtMnzfkR0enN1dmdlQXo2Qlpja1dGYlU3Z0s3cGt5UEFHMXcxM24xRW1PUGI5NDA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8c53373f@group.calendar.google.com"
    },
    {
      "id": "1922072313",
      "name": "Christian Perspectives 6/7",
      "descriptionHeading": "6/7 Christian Perspectives (2016-2017)",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:09:40.836Z",
      "updateTime": "2017-11-10T07:29:13.614Z",
      "enrollmentCode": "4tbgma",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyMjA3MjMxM1pa",
      "teacherGroupEmail": "Christian_Perspectives_6_7_teachers_9172ad79@hope.edu.kh",
      "courseGroupEmail": "Christian_Perspectives_6_7_78b51fc8@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fk1GVll6YTJQaC1rNFNMdGpBYXpySHNvbExHckVmU25BU1hLcHBLb3NwaVk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6ace0055@group.calendar.google.com"
    },
    {
      "id": "1922216575",
      "name": "IT 10",
      "descriptionHeading": "IT 10",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:09:05.331Z",
      "updateTime": "2017-08-10T08:25:54.613Z",
      "enrollmentCode": "f1lw2z",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjIxNjU3NVpa",
      "teacherGroupEmail": "IT_10_teachers_c13960c2@hope.edu.kh",
      "courseGroupEmail": "IT_10_2ec1b848@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fmFpSmMxWWdMeWJ0MEZUWmFXWVM4aTdxN1A4dE12cGJFZk1VTkhQYjVZWDQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb7b8b7e5@group.calendar.google.com"
    },
    {
      "id": "1922332402",
      "name": "IT 9",
      "descriptionHeading": "IT 9",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:08:43.512Z",
      "updateTime": "2017-08-10T08:26:03.518Z",
      "enrollmentCode": "ifa6593",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjMzMjQwMlpa",
      "teacherGroupEmail": "IT_9_teachers_db18ee9b@hope.edu.kh",
      "courseGroupEmail": "IT_9_8bc52c3e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fmx6Z2QtNEhQalpmcVNXZzhhMWhSN3p2M1pDbE1SQVU2UEhraVZVNDV0QzA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom1b65506e@group.calendar.google.com"
    },
    {
      "id": "1922491030",
      "name": "Chae Eun & Esther",
      "descriptionHeading": "Chae Eun Kim",
      "ownerId": "105047164691301773564",
      "creationTime": "2016-08-11T07:08:08.531Z",
      "updateTime": "2017-07-27T05:58:27.516Z",
      "enrollmentCode": "6jla8h",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjQ5MTAzMFpa",
      "teacherGroupEmail": "Chae_Eun_Kim_teachers_284d9442@hope.edu.kh",
      "courseGroupEmail": "Chae_Eun_Kim_9fd1ed6d@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfmZkeTZzNU9CU0RFRGw0aHkzN2x1eUN2V0ttMWxfMWVQRVhmbTNVREM3Rzg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb59f89e8@group.calendar.google.com"
    },
    {
      "id": "1922244102",
      "name": "IT 8",
      "descriptionHeading": "IT 8",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:07:53.171Z",
      "updateTime": "2017-08-10T08:26:21.422Z",
      "enrollmentCode": "ek5ztiv",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjI0NDEwMlpa",
      "teacherGroupEmail": "IT_8_teachers_d20ef606@hope.edu.kh",
      "courseGroupEmail": "IT_8_a00a6b77@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fmx2VHJ6bDRqSFEwQWstSjZ4VFh5eTdWTGozellQQThKQ09ibTBMVENvd2s"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom31b500d2@group.calendar.google.com"
    },
    {
      "id": "1922426427",
      "name": "IT 6/7",
      "descriptionHeading": "IT 6/7",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:07:12.953Z",
      "updateTime": "2017-08-10T08:26:29.493Z",
      "enrollmentCode": "yiyw7z1",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjQyNjQyN1pa",
      "teacherGroupEmail": "IT_6_7_teachers_17dcb15c@hope.edu.kh",
      "courseGroupEmail": "IT_6_7_d48808c2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fksxcHpZcDZYWFIyU0ljby12WUVRV05IZHExOFFFMjExcjY4bVpXbUJPZms"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom92f97eaa@group.calendar.google.com"
    },
    {
      "id": "1922329497",
      "name": "Math 7",
      "descriptionHeading": "Math 6/7",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:06:28.875Z",
      "updateTime": "2016-10-26T14:40:11.393Z",
      "enrollmentCode": "mrdygf8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyMjMyOTQ5N1pa",
      "teacherGroupEmail": "Math_6_7_teachers_64229bd6@hope.edu.kh",
      "courseGroupEmail": "Math_6_7_ad352b60@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fkFueGZMTGg1SlZQaTFjREtaeUpoN0dieThYbWNMWjJaVlZJajJBOHpveEE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroome02aec37@group.calendar.google.com"
    },
    {
      "id": "1922162089",
      "name": "Math 8",
      "descriptionHeading": "Math 8",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:06:10.675Z",
      "updateTime": "2017-08-17T12:41:05.010Z",
      "enrollmentCode": "23t56u",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyMjE2MjA4OVpa",
      "teacherGroupEmail": "Math_8_teachers_f43913c2@hope.edu.kh",
      "courseGroupEmail": "Math_8_ee893e7b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fkQyNll2eS1MN0wwbEJBM2l4aC1ObE9RVUgyTmhmS3B3Y1N6TG9wT1FzZWM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom11ce8516@group.calendar.google.com"
    },
    {
      "id": "1922224811",
      "name": "Math 9",
      "descriptionHeading": "Math 9",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:05:51.079Z",
      "updateTime": "2016-08-11T07:05:49.675Z",
      "enrollmentCode": "l703et",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyMjIyNDgxMVpa",
      "teacherGroupEmail": "Math_9_teachers_2e6784a9@hope.edu.kh",
      "courseGroupEmail": "Math_9_f78f0268@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-flUxS2JmWkttejFnR1JjTENab0JtV2ZpRDJ0N2pjZ2N3b1VzQW1SLU02TUk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6a8353db@group.calendar.google.com"
    },
    {
      "id": "1922363133",
      "name": "Math 10",
      "descriptionHeading": "Math 10",
      "ownerId": "109845242716981282366",
      "creationTime": "2016-08-11T07:05:10.902Z",
      "updateTime": "2017-08-17T12:36:16.927Z",
      "enrollmentCode": "xewq98",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkyMjM2MzEzM1pa",
      "teacherGroupEmail": "Math_10_teachers_ad00e7b7@hope.edu.kh",
      "courseGroupEmail": "Math_10_a86f4b88@hope.edu.kh",
      "teacherFolder": {
        "id": "0B75XByaxgv2-fkliTVg0TEoxZUFLSTBqTEltSkZwbHJoOVRKUjNfRjVjbWltYzNwMU5JVHM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom71a01892@group.calendar.google.com"
    },
    {
      "id": "1922363533",
      "name": "Y10 2017-2018",
      "section": "IGCSE Korean",
      "descriptionHeading": "Y10 2017-2018 IGCSE First Language Korean",
      "room": "S28",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-08-11T06:36:40.246Z",
      "updateTime": "2018-08-16T13:15:14.178Z",
      "enrollmentCode": "hbf0t9",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjM2MzUzM1pa",
      "teacherGroupEmail": "Y8_2016_2017_Korean_teachers_44e7e18f@hope.edu.kh",
      "courseGroupEmail": "Y8_2016_2017_Korean_2dee8e2e@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfkZZS0taSFdDdnlZWm9yQlRSS0ZCQjFKY09RMjU4Q1BZVzFfXzhDUmJyd2c"
      },
      "courseMaterialSets": [
        {
          "title": "채점기준_한국어 버전.pdf",
          "materials": [
            {
              "driveFile": {
                "id": "1oaK1u3IPZfMxfyh79kndV310C_tLy1pj",
                "alternateLink": "https://drive.google.com/open?id=1oaK1u3IPZfMxfyh79kndV310C_tLy1pj"
              }
            }
          ]
        },
        {
          "title": "[Paper 2] Pastpapers (2007-2017)",
          "materials": [
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzcG1SSVA3OTdzLU0",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzcG1SSVA3OTdzLU0"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzczRxVHZoeDhTRlE",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzczRxVHZoeDhTRlE"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzUWw1RHFvY1VCM00",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzUWw1RHFvY1VCM00"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzclFYQ3hpN2NtdVU",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzclFYQ3hpN2NtdVU"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzUkhkQ0RpMkllamc",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzUkhkQ0RpMkllamc"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnza1RFbVNnbHZRVlE",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnza1RFbVNnbHZRVlE"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzUDFnVF9GU3YwR0U",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzUDFnVF9GU3YwR0U"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzQlNDT1dpYk9xNTA",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzQlNDT1dpYk9xNTA"
              }
            },
            {
              "driveFile": {
                "id": "1T7bFYA0Di6iDeo3bOJZCgRYkhkVkFEy0",
                "alternateLink": "https://drive.google.com/open?id=1T7bFYA0Di6iDeo3bOJZCgRYkhkVkFEy0"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzTXJZbU92X21XdTQ",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzTXJZbU92X21XdTQ"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzdGM0aTB5Q04xRTQ",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzdGM0aTB5Q04xRTQ"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzQnNIQ09rQ3lpVmM",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzQnNIQ09rQ3lpVmM"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzUDgzaWpuRldJaTg",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzUDgzaWpuRldJaTg"
              }
            },
            {
              "driveFile": {
                "id": "1qCOPfT5JduokFJAZ6Kb3uD4FMT55wHLq",
                "alternateLink": "https://drive.google.com/open?id=1qCOPfT5JduokFJAZ6Kb3uD4FMT55wHLq"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzOWxvSUd6OVctQmc",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzOWxvSUd6OVctQmc"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzazlOWndYVGYyV0k",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzazlOWndYVGYyV0k"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzVWtHS0hyd2pHR2c",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzVWtHS0hyd2pHR2c"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzd29uMWVjRFBHSDg",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzd29uMWVjRFBHSDg"
              }
            },
            {
              "driveFile": {
                "id": "1RlEs5ilzVGThi_4IqjUQQCO0G4nkNCFp",
                "alternateLink": "https://drive.google.com/open?id=1RlEs5ilzVGThi_4IqjUQQCO0G4nkNCFp"
              }
            }
          ]
        },
        {
          "title": "[Paper 1] Markschemes (2007-2017)",
          "materials": [
            {
              "driveFile": {
                "id": "1SYdXxtlT2gHPgU9BSll8yzsvOWVwREIaJ4BXrEkBYk4",
                "alternateLink": "https://drive.google.com/open?id=1SYdXxtlT2gHPgU9BSll8yzsvOWVwREIaJ4BXrEkBYk4"
              }
            },
            {
              "driveFile": {
                "id": "12FkXr9faLc-cemdkODDGVQoMKJnPhRGLLNA007Lw3Bk",
                "alternateLink": "https://drive.google.com/open?id=12FkXr9faLc-cemdkODDGVQoMKJnPhRGLLNA007Lw3Bk"
              }
            },
            {
              "driveFile": {
                "id": "1js9lc_L_K9GR_2aNOmH0ApoI5mhkyH6j",
                "alternateLink": "https://drive.google.com/open?id=1js9lc_L_K9GR_2aNOmH0ApoI5mhkyH6j"
              }
            },
            {
              "driveFile": {
                "id": "1oU6ge6mNdVMkBRE9p8f3CLtmsxTXOiTyMaxtTjATbrk",
                "alternateLink": "https://drive.google.com/open?id=1oU6ge6mNdVMkBRE9p8f3CLtmsxTXOiTyMaxtTjATbrk"
              }
            },
            {
              "driveFile": {
                "id": "1Wqh35qN-vo7oqaNYsNGUuvCcaaWRt7RBE20N5nEBW9c",
                "title": "IGCSE_May 2011_P1-R_markscheme.docx",
                "alternateLink": "https://drive.google.com/open?id=1Wqh35qN-vo7oqaNYsNGUuvCcaaWRt7RBE20N5nEBW9c",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1Wqh35qN-vo7oqaNYsNGUuvCcaaWRt7RBE20N5nEBW9c&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "14T_fwjA97w5R7aefwzbA-ii5yvQI3_2GiVRxWXoD2LQ",
                "alternateLink": "https://drive.google.com/open?id=14T_fwjA97w5R7aefwzbA-ii5yvQI3_2GiVRxWXoD2LQ"
              }
            },
            {
              "driveFile": {
                "id": "1u3aZvot4Q9Mkh0xJ-gzN1fHunPWN24kryX5FM8fVB88",
                "alternateLink": "https://drive.google.com/open?id=1u3aZvot4Q9Mkh0xJ-gzN1fHunPWN24kryX5FM8fVB88"
              }
            },
            {
              "driveFile": {
                "id": "1kZ7vLfAvXgCJLcMRet0eSQz2uelGpDXv5J0iln3GSJ8",
                "title": "IGCSE_Oct 2007_P1-R_markscheme.docx",
                "alternateLink": "https://drive.google.com/open?id=1kZ7vLfAvXgCJLcMRet0eSQz2uelGpDXv5J0iln3GSJ8",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1kZ7vLfAvXgCJLcMRet0eSQz2uelGpDXv5J0iln3GSJ8&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1TmvlB99qgk5cyMXcNQz773QsN7QtWxRr6A6WTgH1QWE",
                "alternateLink": "https://drive.google.com/open?id=1TmvlB99qgk5cyMXcNQz773QsN7QtWxRr6A6WTgH1QWE"
              }
            },
            {
              "driveFile": {
                "id": "1wX7RmcC1SHcEekdX2LbstawQrse5pIwjW4eYOMchhuQ",
                "alternateLink": "https://drive.google.com/open?id=1wX7RmcC1SHcEekdX2LbstawQrse5pIwjW4eYOMchhuQ"
              }
            },
            {
              "driveFile": {
                "id": "1U9b3018aM9x-TIAyvnblMt1zZkSfuHaesdmlS3AXm0M",
                "alternateLink": "https://drive.google.com/open?id=1U9b3018aM9x-TIAyvnblMt1zZkSfuHaesdmlS3AXm0M"
              }
            },
            {
              "driveFile": {
                "id": "1nBEmxSdUylAkMKbV1kNlEzUCiVtz4NdcCy5FUub8fTQ",
                "alternateLink": "https://drive.google.com/open?id=1nBEmxSdUylAkMKbV1kNlEzUCiVtz4NdcCy5FUub8fTQ"
              }
            },
            {
              "driveFile": {
                "id": "1Q1ezW6QFbca0t2aUdYQlfT9-9xQi_J2kt8NgRdOD1Ac",
                "title": "IGCSE_May 2014_P1-R_markscheme.docx",
                "alternateLink": "https://drive.google.com/open?id=1Q1ezW6QFbca0t2aUdYQlfT9-9xQi_J2kt8NgRdOD1Ac",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1Q1ezW6QFbca0t2aUdYQlfT9-9xQi_J2kt8NgRdOD1Ac&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "1s5bknX5kWMvO6O_uMZ2sdGdC2nbETD9YkMPk4k8hU80",
                "alternateLink": "https://drive.google.com/open?id=1s5bknX5kWMvO6O_uMZ2sdGdC2nbETD9YkMPk4k8hU80"
              }
            },
            {
              "driveFile": {
                "id": "15Z1abwuNdeZedMsDQ7fwT138kRmFCr5kI29OFTmqNT8",
                "alternateLink": "https://drive.google.com/open?id=15Z1abwuNdeZedMsDQ7fwT138kRmFCr5kI29OFTmqNT8"
              }
            },
            {
              "driveFile": {
                "id": "1tufLwg3qvaUFM2vIYEsNE8-TqejwCKjs_LvQmGcSKMU",
                "alternateLink": "https://drive.google.com/open?id=1tufLwg3qvaUFM2vIYEsNE8-TqejwCKjs_LvQmGcSKMU"
              }
            },
            {
              "driveFile": {
                "id": "1QJwwV-GMXTbTXnXqGGe4aNs0Ml4tJSY7bUtwMeo_j6M",
                "alternateLink": "https://drive.google.com/open?id=1QJwwV-GMXTbTXnXqGGe4aNs0Ml4tJSY7bUtwMeo_j6M"
              }
            },
            {
              "driveFile": {
                "id": "1QYGAdE4RUTrUISsIo4GL-xPwYybaIyWlnXgOtuie1Fs",
                "title": "IGCSE_May 2009_P1-R_markscheme.docx",
                "alternateLink": "https://drive.google.com/open?id=1QYGAdE4RUTrUISsIo4GL-xPwYybaIyWlnXgOtuie1Fs",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=1QYGAdE4RUTrUISsIo4GL-xPwYybaIyWlnXgOtuie1Fs&sz=s200"
              }
            }
          ]
        },
        {
          "title": "[Paper 1] Pastpapers (2007~2017)",
          "materials": [
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzcjE1a2xTdUtvU0U",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzcjE1a2xTdUtvU0U"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzbnRDUGRkdlMwc1k",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzbnRDUGRkdlMwc1k"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzMk9uMWxVT2kxMUE",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzMk9uMWxVT2kxMUE"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzcThMeG1aTGpWSnM",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzcThMeG1aTGpWSnM"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzZFROc1pWWWZseTA",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzZFROc1pWWWZseTA"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzRkxhZktDQlA3VXc",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzRkxhZktDQlA3VXc"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzNG56eG9TTkdpRk0",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzNG56eG9TTkdpRk0"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzZWtHdm5JdnhwLXc",
                "title": "2007Oct_R.pdf",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzZWtHdm5JdnhwLXc",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0BzBsM2bdtMnzZWtHdm5JdnhwLXc&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzMExiSnE4VHlDM1E",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzMExiSnE4VHlDM1E"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzZnZWc3phLUFZaFE",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzZnZWc3phLUFZaFE"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzLTU4a3lxVDk4WWc",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzLTU4a3lxVDk4WWc"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzMWswNDZWeEh2UzA",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzMWswNDZWeEh2UzA"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzN3paMWFBSzRDS2c",
                "title": "2011May_R.pdf",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzN3paMWFBSzRDS2c",
                "thumbnailUrl": "https://drive.google.com/thumbnail?id=0BzBsM2bdtMnzN3paMWFBSzRDS2c&sz=s200"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzSkFKNUs1OHFlWU0",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzSkFKNUs1OHFlWU0"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzZFdxcTJacmtWbkE",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzZFdxcTJacmtWbkE"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzaFctbkhYOXo4N0k",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzaFctbkhYOXo4N0k"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzbTFsTUR6R0FMeU0",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzbTFsTUR6R0FMeU0"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzTzN3aE04OXhXMzQ",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzTzN3aE04OXhXMzQ"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzcXhLVndkbVhjVVU",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzcXhLVndkbVhjVVU"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzdU13UTk1RnlLbkk",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzdU13UTk1RnlLbkk"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzeUh6d19jREVDYnM",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzeUh6d19jREVDYnM"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzMjRDVTU1TVctVEU",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzMjRDVTU1TVctVEU"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzbVZ5c0wycEw0RWM",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzbVZ5c0wycEw0RWM"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzQ1Q1U3NyWGt6Tnc",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzQ1Q1U3NyWGt6Tnc"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzb181b2xfT3ZSWVk",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzb181b2xfT3ZSWVk"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzbHFIcFljd2twdjA",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzbHFIcFljd2twdjA"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzMzRidW1VVWpWY1E",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzMzRidW1VVWpWY1E"
              }
            },
            {
              "driveFile": {
                "id": "1Ttw34KDUhl-q7eJl5bDEg7PWsJrJQzx-",
                "alternateLink": "https://drive.google.com/open?id=1Ttw34KDUhl-q7eJl5bDEg7PWsJrJQzx-"
              }
            },
            {
              "driveFile": {
                "id": "1er8l2zO5si5IDc2iosC9TpmiFV0vgGfZ",
                "alternateLink": "https://drive.google.com/open?id=1er8l2zO5si5IDc2iosC9TpmiFV0vgGfZ"
              }
            },
            {
              "driveFile": {
                "id": "1LWHf-oF4pxA7Xcw6c1Xv9hXmIo2d-q-G",
                "alternateLink": "https://drive.google.com/open?id=1LWHf-oF4pxA7Xcw6c1Xv9hXmIo2d-q-G"
              }
            },
            {
              "driveFile": {
                "id": "17gDd1jikeCWIiwJdn2VLNMmkqj19OG9-",
                "alternateLink": "https://drive.google.com/open?id=17gDd1jikeCWIiwJdn2VLNMmkqj19OG9-"
              }
            },
            {
              "driveFile": {
                "id": "1UhV_H-jslLmsHY6zlaRlCDTv4ryJYntR",
                "alternateLink": "https://drive.google.com/open?id=1UhV_H-jslLmsHY6zlaRlCDTv4ryJYntR"
              }
            },
            {
              "driveFile": {
                "id": "1uQT6-EqXOnMOSOMIjFSelvDimrttjA0X",
                "alternateLink": "https://drive.google.com/open?id=1uQT6-EqXOnMOSOMIjFSelvDimrttjA0X"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzT2ZYa1dxQVdrS00",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzT2ZYa1dxQVdrS00"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnza2gxZDZQczc3Rzg",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnza2gxZDZQczc3Rzg"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzV2hhMHFtM3B1TTA",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzV2hhMHFtM3B1TTA"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzbm9Bc1ZLbHlvZDg",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzbm9Bc1ZLbHlvZDg"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzQ0NKb1FQQ0dYUUE",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzQ0NKb1FQQ0dYUUE"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzR0lkS0QxQXNBZk0",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzR0lkS0QxQXNBZk0"
              }
            },
            {
              "driveFile": {
                "id": "0BzBsM2bdtMnzb3ZQUWZOMjJhcVU",
                "alternateLink": "https://drive.google.com/open?id=0BzBsM2bdtMnzb3ZQUWZOMjJhcVU"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom98bd8f85@group.calendar.google.com"
    },
    {
      "id": "1922520452",
      "name": "Physics Y10",
      "descriptionHeading": "10 Physics",
      "ownerId": "105047164691301773564",
      "creationTime": "2016-08-11T06:26:55.170Z",
      "updateTime": "2017-09-18T03:57:56.072Z",
      "enrollmentCode": "4c6s7lv",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkyMjUyMDQ1Mlpa",
      "teacherGroupEmail": "10_Physics_teachers_a3087be6@hope.edu.kh",
      "courseGroupEmail": "10_Physics_d2968072@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfjhLVmNheGNSd1d6U2F3X3NfenBvLW5OdlA0WlpVZmpyUTFhMjNyaDcyRTg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma09e654f@group.calendar.google.com"
    },
    {
      "id": "1919765802",
      "name": "Y10  (2016-17)",
      "section": "S2",
      "descriptionHeading": "Y10  (2016-17)",
      "ownerId": "116366543913951172958",
      "creationTime": "2016-08-10T05:48:52.546Z",
      "updateTime": "2017-02-10T12:40:28.066Z",
      "enrollmentCode": "7fivhjf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxOTc2NTgwMlpa",
      "teacherGroupEmail": "Y10_2016_17_S2_teachers_c43e19ea@hope.edu.kh",
      "courseGroupEmail": "Y10_2016_17_S2_1612f71d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B13JpIzcWjBwfmY5MEFiUF9sVmtOOWd4RVdmZzJWTXo0cFJQZmRhQ2NvVzJyLU16el9jSGc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc70a4c7e@group.calendar.google.com"
    },
    {
      "id": "1919822148",
      "name": "Y8 (2016-17)",
      "section": "S1",
      "descriptionHeading": "Y8 (2016-17) S1",
      "ownerId": "116366543913951172958",
      "creationTime": "2016-08-10T05:48:16.715Z",
      "updateTime": "2016-08-10T05:48:15.254Z",
      "enrollmentCode": "xsm645",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxOTgyMjE0OFpa",
      "teacherGroupEmail": "Y8_2016_17_S1_teachers_6e5db23b@hope.edu.kh",
      "courseGroupEmail": "Y8_2016_17_S1_87d317a6@hope.edu.kh",
      "teacherFolder": {
        "id": "0B13JpIzcWjBwfmR1Wk1ka01aeklYdzZKNnhEZDUxc3laYjVxZFhWRG1BX3VXeEtWRk1iQlU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomdf957096@group.calendar.google.com"
    },
    {
      "id": "1919704041",
      "name": "Y6 (2016-17)",
      "section": "S1",
      "descriptionHeading": "Y6 (2016-17)",
      "ownerId": "116366543913951172958",
      "creationTime": "2016-08-10T05:47:45.742Z",
      "updateTime": "2017-02-10T12:40:06.246Z",
      "enrollmentCode": "4m9d1w1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxOTcwNDA0MVpa",
      "teacherGroupEmail": "Y6_2016_17_S1_teachers_f2e432a2@hope.edu.kh",
      "courseGroupEmail": "Y6_2016_17_S1_016393ef@hope.edu.kh",
      "teacherFolder": {
        "id": "0B13JpIzcWjBwfmk0SER4TmppZXdLWmdvWWt5YXhCZmF0Mlp2QkpQaEZ0SU00ZEo5cW9Ec2c"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom1c8820b1@group.calendar.google.com"
    },
    {
      "id": "1919630368",
      "name": "Y7 Maths (2016-17)",
      "section": "S1",
      "descriptionHeading": "Y7 Maths (2016-17)",
      "ownerId": "116366543913951172958",
      "creationTime": "2016-08-10T05:03:34.885Z",
      "updateTime": "2017-01-19T06:09:41.629Z",
      "enrollmentCode": "swfa8gq",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxOTYzMDM2OFpa",
      "teacherGroupEmail": "Y7_Maths_2016_17_S1_teachers_4b797d73@hope.edu.kh",
      "courseGroupEmail": "Y7_Maths_2016_17_S1_aa195a8a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B13JpIzcWjBwfl9rNUo5Mm1zX2doMWFfdGJkdV9Vc2pEV3dlN29aZWkycHB6MVUyM3R6cEE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd24237ae@group.calendar.google.com"
    },
    {
      "id": "1919680379",
      "name": "Y9 Maths (2016-17)",
      "section": "S2",
      "descriptionHeading": "Y9 Maths S2",
      "ownerId": "116366543913951172958",
      "creationTime": "2016-08-10T03:42:58.766Z",
      "updateTime": "2016-08-22T04:45:51.450Z",
      "enrollmentCode": "6kyev0a",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxOTY4MDM3OVpa",
      "teacherGroupEmail": "Y9_Maths_S2_teachers_c2d73b5c@hope.edu.kh",
      "courseGroupEmail": "Y9_Maths_S2_2ebbca8c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B13JpIzcWjBwflVwaFJPS05McThQWmlWU29CbHB6azlnSkxKT2VpbDdia0NvUkFhZkxOTVk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom188f7e11@group.calendar.google.com"
    },
    {
      "id": "1919335798",
      "name": "2016-17 Yr 11 Careers and Colleges",
      "section": "HOPE",
      "descriptionHeading": "2016-17 Yr 11 Careers and Colleges HOPE",
      "ownerId": "110239118059801274010",
      "creationTime": "2016-08-10T02:36:25.649Z",
      "updateTime": "2016-08-10T02:37:15.674Z",
      "enrollmentCode": "vol6fv",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxOTMzNTc5OFpa",
      "teacherGroupEmail": "2016_17_Yr_11_Careers_and_Colleges_HOPE_teachers_367883e8@hope.edu.kh",
      "courseGroupEmail": "2016_17_Yr_11_Careers_and_Colleges_HOPE_fdd7c079@hope.edu.kh",
      "teacherFolder": {
        "id": "0B51FVYb1vITcfjhiOTg1UUhGWG9IRklpMU9pTXpFMGhzNHBoU2hmSkJmQTdmNHNNS3REVDg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfe007b0e@group.calendar.google.com"
    },
    {
      "id": "1918252884",
      "name": "South 2/3 BP",
      "section": "School Year 2016-2017",
      "descriptionHeading": "South 2/3 BP School Year 2016-2017",
      "ownerId": "106981731167984742403",
      "creationTime": "2016-08-09T16:17:32.901Z",
      "updateTime": "2016-09-28T00:55:23.505Z",
      "enrollmentCode": "qg9k47h",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkxODI1Mjg4NFpa",
      "teacherGroupEmail": "South_2_3_BP_School_Year_2016_2017_teachers_6027c139@hope.edu.kh",
      "courseGroupEmail": "South_2_3_BP_School_Year_2016_2017_74b67226@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5Z-c5soe_gcfnoxMjlQMDNsU3BlSzJmaFRzb0hOVGQ3eUlNSVIxdjUtU0ZGV1ZnOUZVUUk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom21a562c0@group.calendar.google.com"
    },
    {
      "id": "1917800600",
      "name": "6IP IT",
      "descriptionHeading": "6IP IT",
      "ownerId": "107554112463094781867",
      "creationTime": "2016-08-09T14:57:06.127Z",
      "updateTime": "2017-08-17T11:27:11.679Z",
      "enrollmentCode": "g13odt",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkxNzgwMDYwMFpa",
      "teacherGroupEmail": "6IP_IT_teachers_a38ce9c1@hope.edu.kh",
      "courseGroupEmail": "6IP_IT_340e9bf2@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfk4zQS1WZGR6QUk2REtDZ1BZUGozWjBGRW43MFV0TzNWTm83Yll3YXk4QW8"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom436c584c@group.calendar.google.com"
    },
    {
      "id": "1917816472",
      "name": "6JKw IT",
      "descriptionHeading": "6JKw IT",
      "ownerId": "107554112463094781867",
      "creationTime": "2016-08-09T13:42:27.058Z",
      "updateTime": "2017-08-17T11:27:25.435Z",
      "enrollmentCode": "pmv6rv",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkxNzgxNjQ3Mlpa",
      "teacherGroupEmail": "6JKw_IT_teachers_c9fdb8d6@hope.edu.kh",
      "courseGroupEmail": "6JKw_IT_aeb0029c@hope.edu.kh",
      "teacherFolder": {
        "id": "0ByUSUXY3mRrIfmUzcTJjOFdNcU12M1pMbzFaZlFBQzJ5c3U0bHFFSmV2UEJ2RDdCa001d1U"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7503d0aa@group.calendar.google.com"
    },
    {
      "id": "1917886903",
      "name": "Grade 8/9/10 Christian Perspectives",
      "descriptionHeading": "Grade 8/9/10 CP",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-08-09T13:42:23.155Z",
      "updateTime": "2017-08-12T16:04:18.701Z",
      "enrollmentCode": "t192p2",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNzg4NjkwM1pa",
      "teacherGroupEmail": "Grade_8_CP_teachers_17435a57@hope.edu.kh",
      "courseGroupEmail": "Grade_8_CP_b241a275@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfjhmeG5oeGZmazZYTnllcXpXSTBQUXBWekZJVVlROWJvN2Y4czVYYmU2LWc"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MeDg4eV9uWGh0dVE",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MeDg4eV9uWGh0dVE"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MeUtpN3hLc3ZuMTA",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MeUtpN3hLc3ZuMTA"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MVTQwSTNiRUlZb28",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MVTQwSTNiRUlZb28"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom670b9015@group.calendar.google.com"
    },
    {
      "id": "1915216759",
      "name": "Global Perspectives Year 9",
      "section": "2016 - 17",
      "descriptionHeading": "Global Perspectives Year 9 2016 - 17",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-08-08T07:03:46.432Z",
      "updateTime": "2016-08-08T07:03:44.876Z",
      "enrollmentCode": "fuhw8z",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNTIxNjc1OVpa",
      "teacherGroupEmail": "Global_Perspectives_Year_9_2016_17_teachers_025c458c@hope.edu.kh",
      "courseGroupEmail": "Global_Perspectives_Year_9_2016_17_415b5fb7@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfk5LRWxvNXAtemp5RXZpRWY4ZE91LWllVHVKRTZCS0JuZmVESTlRZDczb0k"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom645b7cff@group.calendar.google.com"
    },
    {
      "id": "1914942823",
      "name": "Y2022 IGCSE DRAMA JLK",
      "section": "Year 9",
      "descriptionHeading": "Y 9 Drama with Ms Jeri",
      "description": "Year 9 Drama with Ms Jeri",
      "ownerId": "111511272712109869545",
      "creationTime": "2016-08-08T01:29:43.963Z",
      "updateTime": "2019-01-31T09:37:28.853Z",
      "enrollmentCode": "2i31x9d",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNDk0MjgyM1pa",
      "teacherGroupEmail": "Y_9_Drama_with_Ms_Jeri_teachers_7049491b@hope.edu.kh",
      "courseGroupEmail": "Y_9_Drama_with_Ms_Jeri_332ae7ef@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2bblCzLbPVOfkdxd2I1MGxfcWstaFlYZUluc3o1UmFDczlYVXF5UU9vM2ZBV0UwWWx6VUk",
        "title": "Y 9 Drama with Ms Jeri",
        "alternateLink": "https://drive.google.com/drive/folders/0B2bblCzLbPVOfkdxd2I1MGxfcWstaFlYZUluc3o1UmFDczlYVXF5UU9vM2ZBV0UwWWx6VUk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom00e1573e@group.calendar.google.com"
    },
    {
      "id": "1914923927",
      "name": "Y2023 DRAMA JLK",
      "section": "Year 8",
      "descriptionHeading": "Y 8 Drama with Ms Jeri",
      "description": "Y 8 Drama with Ms Jeri",
      "ownerId": "111511272712109869545",
      "creationTime": "2016-08-08T01:24:44.891Z",
      "updateTime": "2019-01-31T09:37:49.841Z",
      "enrollmentCode": "tltwkht",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNDkyMzkyN1pa",
      "teacherGroupEmail": "Y_8_Drama_with_Ms_Jeri_teachers_25a4f79c@hope.edu.kh",
      "courseGroupEmail": "Y_8_Drama_with_Ms_Jeri_bb63e981@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2bblCzLbPVOfjhuOWVZeEdhV3lQOW9VSTVXVV9mQ1lIMkN1SFNGblJhYU1pUmNDb0c4LVk",
        "title": "Y 8 Drama with Ms Jeri",
        "alternateLink": "https://drive.google.com/drive/folders/0B2bblCzLbPVOfjhuOWVZeEdhV3lQOW9VSTVXVV9mQ1lIMkN1SFNGblJhYU1pUmNDb0c4LVk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom7b0263f1@group.calendar.google.com"
    },
    {
      "id": "1914843158",
      "name": "Y2025 DRAMA JLK",
      "section": "Year 6",
      "descriptionHeading": "Y 6 Drama with Ms Jeri",
      "description": "Year 6 Drama with Ms Jeri",
      "room": "Drama Hall",
      "ownerId": "111511272712109869545",
      "creationTime": "2016-08-08T01:19:27.976Z",
      "updateTime": "2019-01-31T09:39:11.126Z",
      "enrollmentCode": "c89iku",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNDg0MzE1OFpa",
      "teacherGroupEmail": "Y_6_Drama_with_Ms_Jeri_teachers_ab53610c@hope.edu.kh",
      "courseGroupEmail": "Y_6_Drama_with_Ms_Jeri_74b961aa@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2bblCzLbPVOfjRXdzlKV2pPMmJIWW5fcDdDYmpQMUVqdXBWRU5WaTNZSVlZMWlrWVh3RlE",
        "title": "Y 6 Drama with Ms Jeri",
        "alternateLink": "https://drive.google.com/drive/folders/0B2bblCzLbPVOfjRXdzlKV2pPMmJIWW5fcDdDYmpQMUVqdXBWRU5WaTNZSVlZMWlrWVh3RlE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8719c86a@group.calendar.google.com"
    },
    {
      "id": "1915035947",
      "name": "Y2024 DRAMA JLK",
      "section": "Year 7",
      "descriptionHeading": "Y 7 Drama with Ms Jeri",
      "description": "Y 7 Drama with Ms Jeri",
      "ownerId": "111511272712109869545",
      "creationTime": "2016-08-08T01:01:37.024Z",
      "updateTime": "2019-01-31T09:38:34.771Z",
      "enrollmentCode": "ijw3tt",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNTAzNTk0N1pa",
      "teacherGroupEmail": "Y_7_Drama_with_Ms_Jeri_teachers_772bcfdd@hope.edu.kh",
      "courseGroupEmail": "Y_7_Drama_with_Ms_Jeri_f0e174fa@hope.edu.kh",
      "teacherFolder": {
        "id": "0B2bblCzLbPVOfnl1blJLUWhNRVd4cVM1YkgwQWhFeVZ2T2luSWV1czN1ZGdmcUFrUkNCMWM",
        "title": "Y 7 Drama with Ms Jeri",
        "alternateLink": "https://drive.google.com/drive/folders/0B2bblCzLbPVOfnl1blJLUWhNRVd4cVM1YkgwQWhFeVZ2T2luSWV1czN1ZGdmcUFrUkNCMWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomb03ca4f7@group.calendar.google.com"
    },
    {
      "id": "1913614091",
      "name": "Saludos",
      "section": "No  1",
      "descriptionHeading": "7xhbdsr",
      "ownerId": "106764436087764054484",
      "creationTime": "2016-08-06T10:25:07.209Z",
      "updateTime": "2016-08-06T10:26:22.187Z",
      "enrollmentCode": "iekmys",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxMzYxNDA5MVpa",
      "teacherGroupEmail": "7xhbdsr_teachers_fc08207d@hope.edu.kh",
      "courseGroupEmail": "7xhbdsr_c93d7c7d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6ZQeT5ezgjrfm10a0Z4dTNsbDFnVDdiTlFzNjlGS0FzM2tNSXRKMzBqbDBWMm5sTFZ4cW8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomeb518621@group.calendar.google.com"
    },
    {
      "id": "1914121982",
      "name": "7xhbdsr",
      "descriptionHeading": "7xhbdsr",
      "ownerId": "104957496341494154774",
      "creationTime": "2016-08-06T05:22:22.450Z",
      "updateTime": "2016-08-06T05:22:20.987Z",
      "enrollmentCode": "0yt0xin",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxNDEyMTk4Mlpa",
      "teacherGroupEmail": "7xhbdsr_teachers_2f6724d1@hope.edu.kh",
      "courseGroupEmail": "7xhbdsr_0eb10519@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxkWbUfEdVf8fkl3Y2FRQXNzUUNPVHYtaTJFS2tqbkZzc3FNeGJLUzZ3X2ZlelNkYU9jblE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomfa8d74fc@group.calendar.google.com"
    },
    {
      "id": "1911273206",
      "name": "Year N1",
      "descriptionHeading": "Year N1",
      "ownerId": "111797779665101241728",
      "creationTime": "2016-08-04T13:00:29.493Z",
      "updateTime": "2016-08-04T13:00:27.973Z",
      "enrollmentCode": "vbdgf4",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxMTI3MzIwNlpa",
      "teacherGroupEmail": "Year_N1_teachers_fd9509ce@hope.edu.kh",
      "courseGroupEmail": "Year_N1_d5431ef6@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bylq7tV25oTZflhRTXFHbzZDQlRHZUxHd1FkMVlrQXIwTmlxT3RfRy00ZDhiQjNkUTVxeUE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd527bc88@group.calendar.google.com"
    },
    {
      "id": "1911676596",
      "name": "Year 10 IGCSE 2016/17 Literature",
      "descriptionHeading": "Year 10 IGCSE 2016/17 Language",
      "ownerId": "110627498288637945705",
      "creationTime": "2016-08-04T08:39:39.487Z",
      "updateTime": "2017-08-25T02:44:57.004Z",
      "enrollmentCode": "iakoyj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkxMTY3NjU5Nlpa",
      "teacherGroupEmail": "Year_10_IGCSE_2016_17_teachers_aab67ab3@hope.edu.kh",
      "courseGroupEmail": "Year_10_IGCSE_2016_17_c7b8eb80@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0UdooaZgUJrfnA3WGhSQjB0TTFpYXhROUtqdFNGWkM3cEIxZ2FMQ0lEYjFSRU9nYkpfbmc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom3673b6ec@group.calendar.google.com"
    },
    {
      "id": "1911396710",
      "name": "CP11",
      "descriptionHeading": "CP11",
      "ownerId": "113412054715145003943",
      "creationTime": "2016-08-04T07:00:37.492Z",
      "updateTime": "2016-08-04T07:00:35.773Z",
      "enrollmentCode": "7vyoda6",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTkxMTM5NjcxMFpa",
      "teacherGroupEmail": "CP11_teachers_0a5eaca0@hope.edu.kh",
      "courseGroupEmail": "CP11_55bad3de@hope.edu.kh",
      "teacherFolder": {
        "id": "0B-VOy2o84icCfmIyRFF3NGh3aHJkT3FsLWJVV18wclhWcy1VWW00X1VPXzludUkxS0pkazg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom0d8a2381@group.calendar.google.com"
    },
    {
      "id": "1907393390",
      "name": "English 10",
      "descriptionHeading": "English 10",
      "description": "IGCSE English Language 0500 and Literature 0486",
      "room": "MB",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-08-01T14:03:45.481Z",
      "updateTime": "2018-08-20T02:01:44.472Z",
      "enrollmentCode": "1c0gw5",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkwNzM5MzM5MFpa",
      "teacherGroupEmail": "English_10_teachers_1c37ca73@hope.edu.kh",
      "courseGroupEmail": "English_10_c9b673ee@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfmlwbUp4cFBGY2pmTEQwVml3WjRQSFFqRzk1VlBpdUE2N084S0hJak03Wk0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom57bb26c1@group.calendar.google.com"
    },
    {
      "id": "1907624000",
      "name": "Science Y7",
      "descriptionHeading": "6IP",
      "ownerId": "105047164691301773564",
      "creationTime": "2016-08-01T11:30:52.250Z",
      "updateTime": "2017-08-24T08:04:12.603Z",
      "enrollmentCode": "d91kqwj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkwNzYyNDAwMFpa",
      "teacherGroupEmail": "6IP_teachers_ee6b8472@hope.edu.kh",
      "courseGroupEmail": "6IP_8aa29db0@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfmgzWWNZUEFyZGZrbno5bFlxSXZtTEdxWjhkai0yWl9vNmJkclRESmo1Unc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom301619dc@group.calendar.google.com"
    },
    {
      "id": "1907557654",
      "name": "6JKw",
      "descriptionHeading": "6JKw",
      "ownerId": "105047164691301773564",
      "creationTime": "2016-08-01T11:29:45.489Z",
      "updateTime": "2016-08-15T06:13:19.462Z",
      "enrollmentCode": "dldcol9",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTkwNzU1NzY1NFpa",
      "teacherGroupEmail": "6JKw_teachers_efe2cf81@hope.edu.kh",
      "courseGroupEmail": "6JKw_f2416c71@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwKWzM7NHNXFfmFKOUNsenlWU0VIeUZ5Njg5ZGhyamVQb0pKbHh1aW1iRVhqUWdEU0l1cVE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomf5e043de@group.calendar.google.com"
    },
    {
      "id": "1894584628",
      "name": "Grade 10 Science",
      "descriptionHeading": "IGCSE Integrated Science - Grade 10",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-07-13T14:05:34.988Z",
      "updateTime": "2017-08-12T15:19:34.165Z",
      "enrollmentCode": "sth5ys",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTg5NDU4NDYyOFpa",
      "teacherGroupEmail": "Grade_10_Science_teachers_3df5f671@hope.edu.kh",
      "courseGroupEmail": "Grade_10_Science_589931b5@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfkExY2J0cGw0ZktKNVMtbnJrQUR6dU53OXl6ZTRfTkc0XzA0dWs1MEpPVDQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classrooma6604a59@group.calendar.google.com"
    },
    {
      "id": "1894564445",
      "name": "Grade 9 Science",
      "descriptionHeading": "Grade 9 Science",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-07-13T14:00:50.538Z",
      "updateTime": "2018-08-23T03:45:50.281Z",
      "enrollmentCode": "sc3aqf",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTg5NDU2NDQ0NVpa",
      "teacherGroupEmail": "Grade_9_Science_teachers_246a0f1a@hope.edu.kh",
      "courseGroupEmail": "Grade_9_Science_8e84c927@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfjN3SmhEVkdVcnpOQ21SVXd1dVNaSWhqQmJVUnMwMV9SQkZ1ZVU1SHFCdTQ"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MQzVUbXZOYkxCSjg",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MQzVUbXZOYkxCSjg"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MRUd5NzVnQnZhZEU",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MRUd5NzVnQnZhZEU"
              }
            },
            {
              "driveFile": {
                "id": "1rsc3wTJJbUF-HDgSMsOUX-BTLiaEFTwy",
                "alternateLink": "https://drive.google.com/open?id=1rsc3wTJJbUF-HDgSMsOUX-BTLiaEFTwy"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom8394ce5b@group.calendar.google.com"
    },
    {
      "id": "1894825394",
      "name": "Grade 10 Science",
      "descriptionHeading": "Grade 10 Science",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-07-13T13:51:07.623Z",
      "updateTime": "2018-08-23T03:45:40.336Z",
      "enrollmentCode": "2g1d68",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTg5NDgyNTM5NFpa",
      "teacherGroupEmail": "Grade_8_Science_teachers_823f21cc@hope.edu.kh",
      "courseGroupEmail": "Grade_8_Science_79cd460a@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MflRaa0lfSjF1TUROVVlIS3ZyWHRWQUJ4YVg5TkVjQ3N2OUVYeklieHJxQUE"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MQ0R4QllIS1dRdlU",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MQ0R4QllIS1dRdlU"
              }
            },
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MVHc0Q2VuTjIycHc",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MVHc0Q2VuTjIycHc"
              }
            },
            {
              "driveFile": {
                "id": "1wiNp5AXRyDbVobwrigVnWFiSDX8Z-KH2",
                "alternateLink": "https://drive.google.com/open?id=1wiNp5AXRyDbVobwrigVnWFiSDX8Z-KH2"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfc4b2ad1@group.calendar.google.com"
    },
    {
      "id": "1894519231",
      "name": "Grade 6/7 Science",
      "descriptionHeading": "Grade 6/7 Science",
      "ownerId": "108951450081736118120",
      "creationTime": "2016-07-13T13:16:41.846Z",
      "updateTime": "2018-06-11T04:27:31.197Z",
      "enrollmentCode": "knnm3j",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTg5NDUxOTIzMVpa",
      "teacherGroupEmail": "Grade_6_7_Science_teachers_24e7ba00@hope.edu.kh",
      "courseGroupEmail": "Grade_6_7_Science_a0dad1e2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfkR3Q3F6V3pGYzljRlIxMDhScnY0U1dob0dGSl9fZHBYa1pieGRGY3drOHM"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts",
          "materials": [
            {
              "driveFile": {
                "id": "0B5GafGLqLC6MLURfc0Fsdm5uZkE",
                "alternateLink": "https://drive.google.com/open?id=0B5GafGLqLC6MLURfc0Fsdm5uZkE"
              }
            },
            {
              "driveFile": {
                "id": "1seCbKY56Ck44pKRdg_nAGh1-MhQRcRyg",
                "alternateLink": "https://drive.google.com/open?id=1seCbKY56Ck44pKRdg_nAGh1-MhQRcRyg"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom85682bff@group.calendar.google.com"
    },
    {
      "id": "1894852557",
      "name": "Grade 9 Geography",
      "descriptionHeading": "Grade 9 Geography",
      "ownerId": "116427367394120829285",
      "creationTime": "2016-07-13T13:04:36.352Z",
      "updateTime": "2018-10-30T08:02:08.162Z",
      "enrollmentCode": "xumk2t",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTg5NDg1MjU1N1pa",
      "teacherGroupEmail": "Grade_9_10_Biology_teachers_3b4103e3@hope.edu.kh",
      "courseGroupEmail": "Grade_9_10_Biology_bf7b1c7e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5GafGLqLC6MfmJaSnBwUHZTQUhTaXJfTWR5N2t5ckktSzJNR3h0YkJ6dU9TdHFsVFNWUU0"
      },
      "courseMaterialSets": [
        {
          "title": "First Day Handouts for Geography Second Semester",
          "materials": [
            {
              "driveFile": {
                "id": "1mvEToax54sA2MXGQ-5RAByeZ289GT7j4",
                "alternateLink": "https://drive.google.com/open?id=1mvEToax54sA2MXGQ-5RAByeZ289GT7j4"
              }
            },
            {
              "driveFile": {
                "id": "1SXksqVielqW8EJGR-zUJjAqVm4VYNiut",
                "alternateLink": "https://drive.google.com/open?id=1SXksqVielqW8EJGR-zUJjAqVm4VYNiut"
              }
            }
          ]
        }
      ],
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom36204cd5@group.calendar.google.com"
    },
    {
      "id": "1531012479",
      "name": "Math8",
      "ownerId": "100244746883503873064",
      "creationTime": "2016-05-19T08:09:20.787Z",
      "updateTime": "2016-05-19T08:09:19.218Z",
      "enrollmentCode": "pyna0pf",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTUzMTAxMjQ3OVpa",
      "teacherGroupEmail": "Math8_teachers_d8d1489f@hope.edu.kh",
      "courseGroupEmail": "Math8_203d6afb@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0EhRrxGbgOnfjB3VFJGTGE0ajB3YlpMS25xbjhrWVNIakx4dnVLaXZIUWZGdlZhX2xvVzA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4972e7af@group.calendar.google.com"
    },
    {
      "id": "1530865810",
      "name": "Y12 IB French B",
      "ownerId": "117957340856753443265",
      "creationTime": "2016-05-19T04:37:21.542Z",
      "updateTime": "2018-08-15T08:37:17.726Z",
      "enrollmentCode": "g8ojn6",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTUzMDg2NTgxMFpa",
      "teacherGroupEmail": "Y11_IB_French_B_teachers_17e4a8eb@hope.edu.kh",
      "courseGroupEmail": "Y11_IB_French_B_b5a0b2a2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fmIzTmNBcVE1NXBKYUxHUFdrd2ttNHh0eVV3Sm8wU19jenFjSTRJWVFCZEE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom97cd3bed@group.calendar.google.com"
    },
    {
      "id": "1508489544",
      "name": "Les blancs Y8",
      "section": "French",
      "room": "S25",
      "ownerId": "117957340856753443265",
      "creationTime": "2016-05-10T04:50:51.063Z",
      "updateTime": "2018-08-21T07:23:39.984Z",
      "enrollmentCode": "w0pquw2",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTUwODQ4OTU0NFpa",
      "teacherGroupEmail": "Y6_French_teachers_6db5ff76@hope.edu.kh",
      "courseGroupEmail": "Y6_French_f5adebaa@hope.edu.kh",
      "teacherFolder": {
        "id": "0B59W88EQIOX3fjhxZzRRQUJYRi1OMWxDYmthSDU3TGtFOUpRUVBJTnZVUFQ0NVhzTHFYRnM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom6e168810@group.calendar.google.com"
    },
    {
      "id": "1128852970",
      "name": "2RS Literacy Club",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-05-03T13:25:25.364Z",
      "updateTime": "2016-08-02T10:41:57.583Z",
      "enrollmentCode": "g8s9n12",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTEyODg1Mjk3MFpa",
      "teacherGroupEmail": "2RS_Literacy_b_teachers_6932c46a@hope.edu.kh",
      "courseGroupEmail": "2RS_Literacy_b_55fc362b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fi10STd0X0M5Y2pDNTVFaERHaklidHdzWGY4S01Xb2ZZUzNuZ0N1alFnclk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom994ae006@group.calendar.google.com"
    },
    {
      "id": "1377751386",
      "name": "KWB ICT",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-04-22T04:56:00.976Z",
      "updateTime": "2016-08-02T10:42:55.488Z",
      "enrollmentCode": "fwrskr3",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTM3Nzc1MTM4Nlpa",
      "teacherGroupEmail": "KWB_ICT_teachers_28a5d3a0@hope.edu.kh",
      "courseGroupEmail": "KWB_ICT_1b26336e@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fjc1dWM3cjdYM1ZrQkFsZkJsOGdiOXJmZlhGbHB3V1ZIQi1YTGpvSXFUa1E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom426cc5f6@group.calendar.google.com"
    },
    {
      "id": "1372849966",
      "name": "45",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-04-20T08:33:17.110Z",
      "updateTime": "2016-08-02T10:43:02.959Z",
      "enrollmentCode": "q68ock",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTM3Mjg0OTk2Nlpa",
      "teacherGroupEmail": "45_teachers_7634cfd8@hope.edu.kh",
      "courseGroupEmail": "45_c87195b6@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fjZTeGhDQ3Q0LTZiQk14bVRmQmlGU3g0Sy1HZWcyWXd6T21UNV84NFl0ZVU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroombe3b2e8e@group.calendar.google.com"
    },
    {
      "id": "1367239714",
      "name": "2RS Literacy Booster",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-04-18T06:08:37.975Z",
      "updateTime": "2016-08-02T10:43:08.570Z",
      "enrollmentCode": "68tyfi",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTM2NzIzOTcxNFpa",
      "teacherGroupEmail": "2RS_Spelling_teachers_1cbc98fb@hope.edu.kh",
      "courseGroupEmail": "2RS_Spelling_c3051316@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2flJGN2ZjVTE1OG1aNkQ4d2ZDWmQ2LVp6N0VSdkZGVWFVZ3FjMGs5bjJjeFU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom98426659@group.calendar.google.com"
    },
    {
      "id": "1344992106",
      "name": "Kindergarten 2015 - 2016",
      "ownerId": "107482957847789615709",
      "creationTime": "2016-04-06T02:25:47.512Z",
      "updateTime": "2016-08-02T10:42:18.255Z",
      "enrollmentCode": "j4bcwnr",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTM0NDk5MjEwNlpa",
      "teacherGroupEmail": "Kindergarten_2015_2016_teachers_f23a7411@hope.edu.kh",
      "courseGroupEmail": "Kindergarten_2015_2016_3a0cb865@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxXK0BozN9xGfjVPREhnNUdmcUNqcElRbmlHcHhlWGhwOEsyQzgxOF93ekpnQ3Nzak9pNW8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomaabbdc54@group.calendar.google.com"
    },
    {
      "id": "1330717520",
      "name": "2RS Maths A3",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-03-31T10:29:16.579Z",
      "updateTime": "2016-08-02T10:43:15.763Z",
      "enrollmentCode": "let8x4",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTMzMDcxNzUyMFpa",
      "teacherGroupEmail": "2RS_Maths_A3_teachers_acf7af58@hope.edu.kh",
      "courseGroupEmail": "2RS_Maths_A3_3e9dd9fc@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fnZoQ01tQjBxTVl0bmtBR2E3RDNsdnp1QngtVnA5enZ5ZDV4WHF4d3dHRk0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc74d7966@group.calendar.google.com"
    },
    {
      "id": "1330725187",
      "name": "2RS Maths A2",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-03-31T10:28:42.479Z",
      "updateTime": "2016-08-02T10:43:21.262Z",
      "enrollmentCode": "uq9x1nj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTMzMDcyNTE4N1pa",
      "teacherGroupEmail": "2RS_Maths_A2_teachers_22127dfd@hope.edu.kh",
      "courseGroupEmail": "2RS_Maths_A2_9cc718c5@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fnBaVjFZcUZidE10ZC1XYVFHbWwyOWFOWkVib2JPZ0ljVl9hNTZUV2toTGc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomeb0c8fd1@group.calendar.google.com"
    },
    {
      "id": "1330726167",
      "name": "2RS Maths A1",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-03-31T10:25:50Z",
      "updateTime": "2016-08-02T10:43:27.415Z",
      "enrollmentCode": "cctvpaj",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTMzMDcyNjE2N1pa",
      "teacherGroupEmail": "2RS_Maths_Skills_HOPE_teachers_50af6c44@hope.edu.kh",
      "courseGroupEmail": "2RS_Maths_Skills_HOPE_7400051c@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fm1CY2FEQ1Frbkl2SmU4RTdaanNxTDVsLUZjZTdVLVMxUWNHLWdyeEZLTzA"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom02311649@group.calendar.google.com"
    },
    {
      "id": "1330682513",
      "name": "Y12 2016-2017",
      "section": "IB Korean",
      "descriptionHeading": "IB Korean Language & Literature SL 2015-2017",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-03-31T07:45:11.879Z",
      "updateTime": "2017-08-24T07:54:18.114Z",
      "enrollmentCode": "n7nnz08",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTMzMDY4MjUxM1pa",
      "teacherGroupEmail": "IB_Korean_2015_2017_teachers_afc8002a@hope.edu.kh",
      "courseGroupEmail": "IB_Korean_2015_2017_69c0b1d0@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzflFvdmFnVVo2aFVXQ1hVTmZ1cWtBbVdFbW1iX2ZFYmRCZ1BPQVM2OUY4UTQ"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom9ae2c089@group.calendar.google.com"
    },
    {
      "id": "1207027023",
      "name": "HISTORY YEAR 8",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-03-17T05:08:15.094Z",
      "updateTime": "2016-03-17T05:08:13.770Z",
      "enrollmentCode": "g7k419",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTIwNzAyNzAyM1pa",
      "teacherGroupEmail": "HISTORY_YEAR_8_teachers_313df1c3@hope.edu.kh",
      "courseGroupEmail": "HISTORY_YEAR_8_1f8f3229@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfmJiT2NkNG9sM0Mtc2RkTXVBb203emg4UUstaVdxNVVRdHRRV2hUQzNjams"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom66284861@group.calendar.google.com"
    },
    {
      "id": "1198009444",
      "name": "Geography Years 6 & 7",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-03-14T14:37:18.014Z",
      "updateTime": "2016-03-14T14:37:16.611Z",
      "enrollmentCode": "t4pqmzl",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTE5ODAwOTQ0NFpa",
      "teacherGroupEmail": "Geography_Years_6_7_teachers_a4c948f3@hope.edu.kh",
      "courseGroupEmail": "Geography_Years_6_7_5b532e18@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfnBsTFQzaFFHM2Z5dXk3MmV3enJxSHFSb3o5UFh3azJQRG83NmhydzNzOW8"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7afe4a0a@group.calendar.google.com"
    },
    {
      "id": "1186690658",
      "name": "GEOGRAPHY YEAR 8",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-03-07T06:14:43.197Z",
      "updateTime": "2016-05-18T08:01:11.420Z",
      "enrollmentCode": "d5sdohb",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MTE4NjY5MDY1OFpa",
      "teacherGroupEmail": "GEGRAPHY_YEAR_8_teachers_cf00a446@hope.edu.kh",
      "courseGroupEmail": "GEGRAPHY_YEAR_8_07f19ac0@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfmd0c2V3NTV0S0Y0NGdMYjZqV1pScTRVOHg4dXEyenVhVzk2Qk1CQTd4TkE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4b3ed63d@group.calendar.google.com"
    },
    {
      "id": "960422237",
      "name": "Travel and Tourism",
      "descriptionHeading": "Travel and Tourism",
      "room": "Extension 3",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-02-13T11:43:39.760Z",
      "updateTime": "2017-08-10T08:25:25.304Z",
      "enrollmentCode": "hr8ktp",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/OTYwNDIyMjM3",
      "teacherGroupEmail": "Travel_and_Tourism_teachers_92073193@hope.edu.kh",
      "courseGroupEmail": "Travel_and_Tourism_51ec350b@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfkRCX0FCenJsb2tBWWQ0R1FtYlJNRnFNZHY4dTlEdEVlWTQ2OHpvaF9pZWM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom4022296e@group.calendar.google.com"
    },
    {
      "id": "898361455",
      "name": "HISTORY YEARS 6 AND 7",
      "section": "7 students",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-02-08T14:10:22.269Z",
      "updateTime": "2016-02-08T14:25:32.690Z",
      "enrollmentCode": "x87a24v",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/ODk4MzYxNDU1",
      "teacherGroupEmail": "HISTORY_YEARS_6_AND_7_7_students_teachers_ecf161fa@hope.edu.kh",
      "courseGroupEmail": "HISTORY_YEARS_6_AND_7_7_students_94254b91@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfjZtSnFYVk9uSFc3SkdLXzBtN2dlejk1U0NxRXd1WkRwVVM0QWE2ZWVRUVk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma467f13d@group.calendar.google.com"
    },
    {
      "id": "869963334",
      "name": "English Y8 Combined 2016",
      "section": "Secondary",
      "ownerId": "106412644954351339427",
      "creationTime": "2016-01-22T06:35:08.450Z",
      "updateTime": "2017-08-24T07:56:28.045Z",
      "enrollmentCode": "33bcam",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/ODY5OTYzMzM0",
      "teacherGroupEmail": "Y7RSm_English_Secondary_teachers_ed5e36ce@hope.edu.kh",
      "courseGroupEmail": "Y7RSm_English_Secondary_cc294643@hope.edu.kh",
      "teacherFolder": {
        "id": "0BxINKwxqyzJJfmc2c1VHblhnZWxjNElXVXFsMkNCWWFhdXBEQkp3dXVmWmlRNHVHc2prRFE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomfb06e1ce@group.calendar.google.com"
    },
    {
      "id": "868234780",
      "name": "PERFORMING ARTS (Drama) 2016",
      "section": "Years 6 - 8",
      "ownerId": "115986378965778821966",
      "creationTime": "2016-01-21T08:17:09.343Z",
      "updateTime": "2016-01-21T08:18:38.607Z",
      "enrollmentCode": "jd71syb",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/ODY4MjM0Nzgw",
      "teacherGroupEmail": "PERFORMING_ARTS_Drama_2016_Years_6_8_teachers_8165072f@hope.edu.kh",
      "courseGroupEmail": "PERFORMING_ARTS_Drama_2016_Years_6_8_6e339ce3@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzCcAMlnn9qCfmZCQXktS3JVazBMT0EwSURaWURmOWRBTWhPT0ZOV2ZQbUszWnVJM1A0OE0"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom9875d999@group.calendar.google.com"
    },
    {
      "id": "867952365",
      "name": "Y9 IGCSE Art",
      "section": "Hope International School",
      "descriptionHeading": "Y9 now Y 10 IGCSE Art 2016-2017",
      "ownerId": "109973518741915177521",
      "creationTime": "2016-01-21T00:44:28.401Z",
      "updateTime": "2016-10-17T07:52:25.229Z",
      "enrollmentCode": "bpkw1w",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/ODY3OTUyMzY1",
      "teacherGroupEmail": "Y9_IGCSE_Art_Hope_International_School_teachers_14453e01@hope.edu.kh",
      "courseGroupEmail": "Y9_IGCSE_Art_Hope_International_School_8b9947ed@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKfms5Z3IwMzN0eGRLS1o4QW9Pd2lwVkhpS2tudTVZTk1PT013US1faFNIbUE"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom78327cd6@group.calendar.google.com"
    },
    {
      "id": "778259209",
      "name": "YEAR 10 (HOPE LIT.) Mr Rossouw",
      "section": "Group 2",
      "ownerId": "105789256034016666660",
      "creationTime": "2016-01-20T04:06:02.939Z",
      "updateTime": "2016-01-20T04:06:01.638Z",
      "enrollmentCode": "hdbyjs",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Nzc4MjU5MjA5",
      "teacherGroupEmail": "YEAR_10_HOPE_LIT_Mr_Rossouw_Group_2_teachers_afaa1bda@hope.edu.kh",
      "courseGroupEmail": "YEAR_10_HOPE_LIT_Mr_Rossouw_Group_2_ab369559@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwHbCPLDfDBUfmxBQ0p2dUJNeFZRSmdtQUpfUnloOEgxZmtXOUl6dW1SbnZ5MFZHcTNCWUU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom5fcc4f0b@group.calendar.google.com"
    },
    {
      "id": "774747369",
      "name": "YEAR 9 Christian Perspectives",
      "ownerId": "105789256034016666660",
      "creationTime": "2016-01-16T23:19:32.458Z",
      "updateTime": "2016-01-16T23:20:51.780Z",
      "enrollmentCode": "2p300v1",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/Nzc0NzQ3MzY5",
      "teacherGroupEmail": "YEAR_9_Christian_Perspectives_teachers_def380ed@hope.edu.kh",
      "courseGroupEmail": "YEAR_9_Christian_Perspectives_8d786d71@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwHbCPLDfDBUfm80eDJSOGhyZ1BlWWtsaE1qa1dyOWlRNnkydTJ3c2k2VFQxX0w3MFVuVTQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroome4156ba1@group.calendar.google.com"
    },
    {
      "id": "769673402",
      "name": "3N ICT",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-01-13T12:53:16.607Z",
      "updateTime": "2017-04-26T07:56:04.201Z",
      "enrollmentCode": "jcpobq3",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzY5NjczNDAy",
      "teacherGroupEmail": "3N_ICT_teachers_0a3c725d@hope.edu.kh",
      "courseGroupEmail": "3N_ICT_7df967e2@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzflgzaDdBQ09ueEVfT0RBemJnemgzNGdmLVRpODVpYnJvQTdNWlhXSGJWaWs"
      },
      "guardiansEnabled": false
    },
    {
      "id": "767708291",
      "name": "Math10",
      "section": "Probability",
      "ownerId": "100244746883503873064",
      "creationTime": "2016-01-12T13:08:07.447Z",
      "updateTime": "2016-01-12T13:08:44.195Z",
      "enrollmentCode": "e9hbto",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzY3NzA4Mjkx",
      "teacherGroupEmail": "Math10_Probability_teachers_d26e55a0@hope.edu.kh",
      "courseGroupEmail": "Math10_Probability_b7677f97@hope.edu.kh",
      "teacherFolder": {
        "id": "0B0EhRrxGbgOnfno0eXBsRUtIbHEtMm1GaDYySVpERWFGcURRVm5faS0xT3hLaF9Hd1VLVnc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom79e4fa56@group.calendar.google.com"
    },
    {
      "id": "763135262",
      "name": "Vision Into Action 9",
      "ownerId": "111257355176914715372",
      "creationTime": "2016-01-08T02:39:32.972Z",
      "updateTime": "2016-01-08T02:40:39.142Z",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzYzMTM1MjYy",
      "teacherGroupEmail": "Vision_Into_Action_9_teachers_3742e391@hope.edu.kh",
      "courseGroupEmail": "Vision_Into_Action_9_6c23dd44@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6ELViyXqmahfnJHdldRNDNpX05KZU5sUnRIZEo2M3RPWUwtVURMbng2QWxuVkp6SXJ1WEU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom4fe6d662@group.calendar.google.com"
    },
    {
      "id": "759613053",
      "name": "Global Perspectives 9",
      "ownerId": "111257355176914715372",
      "creationTime": "2016-01-06T06:25:48.313Z",
      "updateTime": "2016-01-06T06:26:29.798Z",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzU5NjEzMDUz",
      "teacherGroupEmail": "Global_Perspectives_9_teachers_516f713f@hope.edu.kh",
      "courseGroupEmail": "Global_Perspectives_9_f220726d@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6ELViyXqmahfkYzNG1nMUZmUWxvLXFKZ2dLeEw3UXFjc1VkTDRJLXQwMG04REttZ2lKT2M"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom36d1b740@group.calendar.google.com"
    },
    {
      "id": "756443780",
      "name": "5N ICT",
      "ownerId": "110575928947711158789",
      "creationTime": "2016-01-04T07:13:41.992Z",
      "updateTime": "2017-04-26T07:55:57.686Z",
      "enrollmentCode": "1nfxta",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzU2NDQzNzgw",
      "teacherGroupEmail": "5N_ICT_teachers_14ecb632@hope.edu.kh",
      "courseGroupEmail": "5N_ICT_9204fbe7@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzBsM2bdtMnzfmVSNHAxcWZuQVhvYzJhY3BLRWZNRmRsSkJyOWNMTDZIaWFiU1dMSHM4dmM"
      },
      "guardiansEnabled": false
    },
    {
      "id": "756411277",
      "name": "Y2RS",
      "ownerId": "112059668510514241292",
      "creationTime": "2016-01-04T06:57:28.254Z",
      "updateTime": "2016-08-02T10:43:43.116Z",
      "enrollmentCode": "xxczrh4",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/NzU2NDExMjc3",
      "teacherGroupEmail": "Y2RS_teachers_e69e52a2@hope.edu.kh",
      "courseGroupEmail": "Y2RS_2e3fec55@hope.edu.kh",
      "teacherFolder": {
        "id": "0BzbCx96G-HA2fjFVbTdZT096YllTUHJjU0E2a04xMnpJR1E0QjdybWtWS2d4U0k5LW5CeXM"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom74f77627@group.calendar.google.com"
    },
    {
      "id": "750109924",
      "name": "Y9 Design",
      "section": "Hope International School",
      "descriptionHeading": "Y 9 DESIGN",
      "description": "Your advertisement is to be submitted here & your commercial!",
      "room": "S1",
      "ownerId": "109973518741915177521",
      "creationTime": "2015-12-14T01:04:45.417Z",
      "updateTime": "2016-04-26T09:50:08.716Z",
      "enrollmentCode": "6ep038i",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/NzUwMTA5OTI0",
      "teacherGroupEmail": "Y9_Design_Hope_International_School_teachers_2909bbc6@hope.edu.kh",
      "courseGroupEmail": "Y9_Design_Hope_International_School_8d5d720c@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKfmpLWEh3U0JXUzI0Z1NWYklWdzNqdVRWb2VIN3VENjVWS3JjNUlNN2RiVUk"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomd01c325e@group.calendar.google.com"
    },
    {
      "id": "339046974",
      "name": "8TP CL",
      "ownerId": "110760563115232207760",
      "creationTime": "2015-11-11T03:46:53.864Z",
      "updateTime": "2017-04-26T08:09:33.530Z",
      "enrollmentCode": "9285to3",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzM5MDQ2OTc0",
      "teacherGroupEmail": "8TP_CL_teachers_29c60337@hope.edu.kh",
      "courseGroupEmail": "8TP_CL_f945b6fb@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufmJPaFh0VWpwd25ZaUN3ajlDSENpZmE1MnJvRGZZdHNMRXhDS011YXF5Z1U"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd54e5222@group.calendar.google.com"
    },
    {
      "id": "315331238",
      "name": "7PR Music",
      "ownerId": "110760563115232207760",
      "creationTime": "2015-11-02T04:01:47.031Z",
      "updateTime": "2017-04-26T08:09:15.652Z",
      "enrollmentCode": "61q05w",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzE1MzMxMjM4",
      "teacherGroupEmail": "7PR_Music_teachers_ef3ceee1@hope.edu.kh",
      "courseGroupEmail": "7PR_Music_8529b255@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufnBoM3Y1bFNTdW0tQ0prdHlmekY1VTB0RF80NVJNX1gxMEs4d3ZQQVktYlU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom873b5149@group.calendar.google.com"
    },
    {
      "id": "315321896",
      "name": "7RSm Music",
      "ownerId": "110760563115232207760",
      "creationTime": "2015-11-02T03:57:28.214Z",
      "updateTime": "2017-04-26T08:09:08.975Z",
      "enrollmentCode": "1r1vb7i",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzE1MzIxODk2",
      "teacherGroupEmail": "7RSm_Music_teachers_dbcde776@hope.edu.kh",
      "courseGroupEmail": "7RSm_Music_a9b0e875@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bz2WH4eYFAiufkY3aTE2bFo5RUF0Rzk3TjZLQWpMWVRxektOUU1Mczd1ODFQclB0X3M1d1k"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomd1c86a94@group.calendar.google.com"
    },
    {
      "id": "271836863",
      "name": "Y8 Korean ",
      "ownerId": "110614462475185435439",
      "creationTime": "2015-10-27T07:37:57.144Z",
      "updateTime": "2015-10-29T14:45:17.996Z",
      "enrollmentCode": "bzucj2",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjcxODM2ODYz",
      "teacherGroupEmail": "Y8_Korean_teachers_d91ca3fe@hope.edu.kh",
      "courseGroupEmail": "Y8_Korean_ff25d5cc@hope.edu.kh",
      "teacherFolder": {
        "id": "0B3PeI0PAR64OflNxT2xBRzNWUlVPYXhSR0ZzeFQ4Y2pOdmtxM3lQcGVRcGVIVnRjdE8xcDQ"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom82dccff4@group.calendar.google.com"
    },
    {
      "id": "271757625",
      "name": "IGCSE Science 2016 Core",
      "ownerId": "100362126255417413706",
      "creationTime": "2015-10-27T03:51:15.531Z",
      "updateTime": "2018-06-16T09:55:43.800Z",
      "enrollmentCode": "citnvk",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjcxNzU3NjI1",
      "teacherGroupEmail": "IGCSE_Science_2016_Core_teachers_90c62d1b@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Science_2016_Core_9192c140@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfnJvamxUQUVaNzN1UEdvVm15MTRsampqMlBFZGJKNlhZZFZUTUhOZWZMUUU"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroomc0b30006@group.calendar.google.com"
    },
    {
      "id": "270204920",
      "name": "Y6 Art & Drama",
      "descriptionHeading": "Y6 Art & Drama",
      "ownerId": "109973518741915177521",
      "creationTime": "2015-10-23T02:38:13.199Z",
      "updateTime": "2018-02-10T13:39:05.203Z",
      "enrollmentCode": "zicekd",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjcwMjA0OTIw",
      "teacherGroupEmail": "Y_6_Art_Hope_International_School_Art_Class_Year_6_teachers_f145cc04@hope.edu.kh",
      "courseGroupEmail": "Y_6_Art_Hope_International_School_Art_Class_Year_6_ae449c4e@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKfnUyYzkxVWx0Ym0tci1STWd3dkNxMzE0MDJfMkZfeko3c0lkQ3FiYTV5d0E"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom019ebadc@group.calendar.google.com"
    },
    {
      "id": "269208892",
      "name": "8910CL",
      "section": "Semester 1",
      "ownerId": "108951450081736118120",
      "creationTime": "2015-10-22T02:33:18.678Z",
      "updateTime": "2015-10-22T02:33:17.232Z",
      "enrollmentCode": "55rtzy",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY5MjA4ODky",
      "teacherGroupEmail": "8910CL_Semester_1_teachers_c9cebb86@hope.edu.kh",
      "courseGroupEmail": "8910CL_Semester_1_60da27a2@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfmNWT3lVMHBKUWF6amdnY082TlFScjZ4UWN2S1QyLTE5OU5zeU01X0RUNlU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom6dccbc52@group.calendar.google.com"
    },
    {
      "id": "269197684",
      "name": "67CL",
      "section": "Semester 2 2016",
      "descriptionHeading": "Christian Living",
      "description": "Grade 67",
      "room": "Upstairs 1 (US1)",
      "ownerId": "108951450081736118120",
      "creationTime": "2015-10-22T02:13:56.951Z",
      "updateTime": "2016-01-24T07:58:35.778Z",
      "enrollmentCode": "d0oo6y",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY5MTk3Njg0",
      "teacherGroupEmail": "67CL_Semester_1_teachers_604eed00@hope.edu.kh",
      "courseGroupEmail": "67CL_Semester_1_503cfc87@hope.edu.kh",
      "teacherFolder": {
        "id": "0B5dpQmfTG9HjfkVxbF9rRm1kLWVjVWZRcDNiRTdadC1VUFF0UEpJR2VEVDVqYXc5V2o4Qnc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom86365b3d@group.calendar.google.com"
    },
    {
      "id": "304161902",
      "name": "Y 9 Drama- Hope International School",
      "section": "Year 9 Drama Class",
      "ownerId": "109973518741915177521",
      "creationTime": "2015-10-20T08:26:48.359Z",
      "updateTime": "2018-02-10T13:54:36.161Z",
      "enrollmentCode": "o76v8p",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MzA0MTYxOTAy",
      "teacherGroupEmail": "Y_9_Drama_Hope_International_School_Year_9_Drama_Class_teachers_634cfad4@hope.edu.kh",
      "courseGroupEmail": "Y_9_Drama_Hope_International_School_Year_9_Drama_Class_9d1fed1b@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKflZ1RU5lbnpMb281WGJfaXBUNTNEeGpQVEdIcFFJSmNhRGxjcmpWLTBiNzA"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom65f8a2af@group.calendar.google.com"
    },
    {
      "id": "267791852",
      "name": "Y10 Drama",
      "ownerId": "109973518741915177521",
      "creationTime": "2015-10-20T03:12:23.956Z",
      "updateTime": "2016-08-19T02:01:42.544Z",
      "enrollmentCode": "yquz3g",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjY3NzkxODUy",
      "teacherGroupEmail": "Y10_DRAMA_Hope_International_School_Y_10_Drama_Class_teachers_730ec7b0@hope.edu.kh",
      "courseGroupEmail": "Y10_DRAMA_Hope_International_School_Y_10_Drama_Class_67de39db@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6nc7LGBl1UKfkRDMUtvSzdXM09Vc2RmSUhDRXctd3BiaVV1V0s3VHc0TG44cF9tUTQ4UFU"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom7593e9e0@group.calendar.google.com"
    },
    {
      "id": "267051607",
      "name": "Yr 9( (3) ENGLISH",
      "ownerId": "105789256034016666660",
      "creationTime": "2015-10-19T03:34:57.547Z",
      "updateTime": "2015-10-19T03:34:56.095Z",
      "enrollmentCode": "2vcxo8",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY3MDUxNjA3",
      "teacherGroupEmail": "Yr_9_3_ENGLISH_teachers_7e91db4d@hope.edu.kh",
      "courseGroupEmail": "Yr_9_3_ENGLISH_65d5be57@hope.edu.kh",
      "teacherFolder": {
        "id": "0BwHbCPLDfDBUfmtWRDloMDk0SDZ2ZU9McFN1Y01QZHZzdjJxazJZN2VTRldFc1ZscDZmU0U"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom63124e12@group.calendar.google.com"
    },
    {
      "id": "266780125",
      "name": "Physical Education 6-10",
      "descriptionHeading": "Year 6-10 Physical Education",
      "ownerId": "111257355176914715372",
      "creationTime": "2015-10-18T11:52:56.924Z",
      "updateTime": "2015-10-18T11:56:57.080Z",
      "courseState": "ACTIVE",
      "alternateLink": "https://classroom.google.com/c/MjY2NzgwMTI1",
      "teacherGroupEmail": "Physical_Education_6_10_teachers_e0beef51@hope.edu.kh",
      "courseGroupEmail": "Physical_Education_6_10_35a439a3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6ELViyXqmahfmhPYlFtWEg3c1VoRnNpYWhKWDI0bHVuZjBmcURGalhQZHFiZ2ZLYjNUUzg"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroom15dda190@group.calendar.google.com"
    },
    {
      "id": "265965065",
      "name": "Y6 ESL",
      "ownerId": "115973731579234221936",
      "creationTime": "2015-10-16T04:02:01.915Z",
      "updateTime": "2017-08-24T06:01:29.454Z",
      "enrollmentCode": "e1mxgp",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MjY1OTY1MDY1",
      "teacherGroupEmail": "Y6_ESL_teachers_b29401a3@hope.edu.kh",
      "courseGroupEmail": "Y6_ESL_663f4d6d@hope.edu.kh",
      "teacherFolder": {
        "id": "0Bwl4QBVG3IXJfjEzYVF6NXlsNVhMVVRNeVFWWVJLVlo1dHg0bE9ocFVZbWx4ZS1vUWxUUFk"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomc1b08f08@group.calendar.google.com"
    },
    {
      "id": "300847120",
      "name": "IGCSE Science 2018",
      "ownerId": "100362126255417413706",
      "creationTime": "2015-10-15T07:57:34.887Z",
      "updateTime": "2018-08-16T10:28:32.587Z",
      "enrollmentCode": "ud8jxt",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzAwODQ3MTIw",
      "teacherGroupEmail": "IGCSE_Science_2017_teachers_588206f6@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Science_2017_aa9da978@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfkVvMzIyS04xNDNWLTN6TUxwazVKOE1sTG9fa05taFM3UG5xay1kY3MtRkE"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classrooma9fcd78f@group.calendar.google.com"
    },
    {
      "id": "300849844",
      "name": "IGCSE Science 2016",
      "ownerId": "100362126255417413706",
      "creationTime": "2015-10-15T07:56:14.141Z",
      "updateTime": "2018-08-16T06:17:08.424Z",
      "enrollmentCode": "x9clz0",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzAwODQ5ODQ0",
      "teacherGroupEmail": "IGCSE_Science_2016_teachers_fd6696b9@hope.edu.kh",
      "courseGroupEmail": "IGCSE_Science_2016_2c18fc37@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfkdkUFZkUEdQMDY5ZVhGMG5QT1pxdkxnMXpESHl5UWh6MUFnZFVmTlRrMXM"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom73b08e76@group.calendar.google.com"
    },
    {
      "id": "300816625",
      "name": "Lee Kim's test classroom",
      "ownerId": "112644773599177931542",
      "creationTime": "2015-10-15T05:04:49.153Z",
      "updateTime": "2017-08-24T08:37:50.662Z",
      "enrollmentCode": "w97z7jw",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MzAwODE2NjI1",
      "teacherGroupEmail": "Lee_Kim_s_test_classroom_teachers_3a7e4faa@hope.edu.kh",
      "courseGroupEmail": "Lee_Kim_s_test_classroom_b6f7f1b7@hope.edu.kh",
      "teacherFolder": {
        "id": "0B6aeU8sX9ah_fnRDWkpSVGFvYzN1Y2MzU0p4TUFIZGdYWlhYSXFTS2FGU0hQS2pYb3FVSmc"
      },
      "guardiansEnabled": false,
      "calendarId": "hope.edu.kh_classroomee151e4c@group.calendar.google.com"
    },
    {
      "id": "161598903",
      "name": "IB Biology 2016",
      "ownerId": "100362126255417413706",
      "creationTime": "2015-10-15T04:58:20.632Z",
      "updateTime": "2017-08-13T12:59:06.504Z",
      "enrollmentCode": "ila47py",
      "courseState": "ARCHIVED",
      "alternateLink": "https://classroom.google.com/c/MTYxNTk4OTAz",
      "teacherGroupEmail": "IB_Biology_2016_teachers_61be41a0@hope.edu.kh",
      "courseGroupEmail": "IB_Biology_2016_9372c7f3@hope.edu.kh",
      "teacherFolder": {
        "id": "0B_c4Ytt8TOwXfkxmZnZHRFpJTTZWWWpMVlloOGFmeVNFOU9HMFhDWkNnajRDSDVRR0pOeDg",
        "title": "IB Biology 2017",
        "alternateLink": "https://drive.google.com/drive/folders/0B_c4Ytt8TOwXfkxmZnZHRFpJTTZWWWpMVlloOGFmeVNFOU9HMFhDWkNnajRDSDVRR0pOeDg"
      },
      "guardiansEnabled": true,
      "calendarId": "hope.edu.kh_classroom78ed55d7@group.calendar.google.com"
    }
  ],
  "nextPageToken": "CioKKBImCJDJ2OmKLRIdCg5iDAjs5PywBRCAnK6tAgoLCICAgICAsuHZ7QE="
}

*/