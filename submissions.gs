  /**
   * Sample JavaScript code for classroom.courses.courseWork.studentSubmissions.list
   * See instructions for running APIs Explorer code samples locally:
   * https://developers.google.com/explorer-help/guides/code_samples#javascript
   */
/*
  function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.coursework.students https://www.googleapis.com/auth/classroom.coursework.students.readonly https://www.googleapis.com/auth/classroom.student-submissions.me.readonly https://www.googleapis.com/auth/classroom.student-submissions.students.readonly"})
        .then(function() { console.log("Sign-in successful"); },
              function(err) { console.error("Error signing in", err); });
  }
  function loadClient() {
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/classroom/v1/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err); });
  }
  // Make sure the client is loaded and sign-in is complete before calling this method.
  function execute() {
    return gapi.client.classroom.courses.courseWork.studentSubmissions.list({
      "courseId": "16063195662",
      "courseWorkId": "-",
      "states": [
        "RETURNED"
      ],
      "userId": "tom.kershaw@students.hope.edu.kh",
      "fields": "studentSubmissions(courseWorkId,assignedGrade)"
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
              },
              function(err) { console.error("Execute error", err); });
  }
  gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: YOUR_CLIENT_ID});
  });

*/

tom_grades_ict9 = {
  "studentSubmissions": [
    {
      "courseId": "16063195662",
      "courseWorkId": "17017362948",
      "id": "CgsIi-WWDhCEtMGyPw",
      "userId": "109260139188842571634",
      "creationTime": "2018-09-19T04:10:45.514Z",
      "updateTime": "2018-09-26T05:03:42.217Z",
      "state": "RETURNED",
      "draftGrade": 100,
      "assignedGrade": 100,
      "alternateLink": "http://classroom.google.com/c/MTYwNjMxOTU2NjJa/a/MTcwMTczNjI5NDha/submissions/student/Mjk3MzM1MTVa",
      "courseWorkType": "ASSIGNMENT",
      "assignmentSubmission": {
        "attachments": [
          {
            "driveFile": {
              "id": "11nvg7RSWWK1JR7lJbguG3WuciQ3oZ9Bl93_00T9oMl4",
              "title": "Google Drive Quiz",
              "alternateLink": "https://drive.google.com/open?id=11nvg7RSWWK1JR7lJbguG3WuciQ3oZ9Bl93_00T9oMl4",
              "thumbnailUrl": "https://drive.google.com/thumbnail?id=11nvg7RSWWK1JR7lJbguG3WuciQ3oZ9Bl93_00T9oMl4&sz=s200"
            }
          }
        ]
      },
      "submissionHistory": [
        {
          "stateHistory": {
            "state": "CREATED",
            "stateTimestamp": "2018-09-19T04:10:45.456Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "stateHistory": {
            "state": "TURNED_IN",
            "stateTimestamp": "2018-09-19T04:59:55.563Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 100,
            "maxPoints": 100,
            "gradeTimestamp": "2018-09-26T05:02:57.923Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
          }
        },
        {
          "stateHistory": {
            "state": "RETURNED",
            "stateTimestamp": "2018-09-26T05:03:42.213Z",
            "actorUserId": "107554112463094781867"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 100,
            "maxPoints": 100,
            "gradeTimestamp": "2018-09-26T05:03:42.217Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
          }
        }
      ]
    },
    {
      "courseId": "16063195662",
      "courseWorkId": "16576592952",
      "id": "CgsIi-WWDhC4-KrgPQ",
      "userId": "109260139188842571634",
      "creationTime": "2018-09-05T04:29:04.513Z",
      "updateTime": "2018-09-05T05:04:42.120Z",
      "state": "RETURNED",
      "draftGrade": 20,
      "assignedGrade": 20,
      "alternateLink": "http://classroom.google.com/c/MTYwNjMxOTU2NjJa/a/MTY1NzY1OTI5NTJa/submissions/student/Mjk3MzM1MTVa",
      "courseWorkType": "ASSIGNMENT",
      "assignmentSubmission": {},
      "submissionHistory": [
        {
          "stateHistory": {
            "state": "CREATED",
            "stateTimestamp": "2018-09-05T04:29:04.503Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 20,
            "maxPoints": 20,
            "gradeTimestamp": "2018-09-05T04:56:58.385Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 20,
            "maxPoints": 20,
            "gradeTimestamp": "2018-09-05T04:56:58.385Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
          }
        },
        {
          "stateHistory": {
            "state": "TURNED_IN",
            "stateTimestamp": "2018-09-05T04:56:58.884Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "stateHistory": {
            "state": "RETURNED",
            "stateTimestamp": "2018-09-05T05:04:42.117Z",
            "actorUserId": "107554112463094781867"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 20,
            "maxPoints": 20,
            "gradeTimestamp": "2018-09-05T05:04:42.120Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
          }
        }
      ]
    },
    {
      "courseId": "16063195662",
      "courseWorkId": "16351918886",
      "id": "CgsIi-WWDhCm9pn1PA",
      "userId": "109260139188842571634",
      "creationTime": "2018-08-29T04:10:39.564Z",
      "updateTime": "2018-10-08T08:31:58.882Z",
      "state": "RETURNED",
      "alternateLink": "http://classroom.google.com/c/MTYwNjMxOTU2NjJa/a/MTYzNTE5MTg4ODZa/submissions/student/Mjk3MzM1MTVa",
      "courseWorkType": "ASSIGNMENT",
      "assignmentSubmission": {},
      "submissionHistory": [
        {
          "stateHistory": {
            "state": "CREATED",
            "stateTimestamp": "2018-08-29T04:10:39.506Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "stateHistory": {
            "state": "TURNED_IN",
            "stateTimestamp": "2018-08-29T13:39:24.598Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "stateHistory": {
            "state": "RETURNED",
            "stateTimestamp": "2018-10-08T08:31:58.882Z",
            "actorUserId": "107554112463094781867"
          }
        }
      ]
    },
    {
      "courseId": "16063195662",
      "courseWorkId": "16063873810",
      "id": "CgsIi-WWDhCShu3rOw",
      "userId": "109260139188842571634",
      "creationTime": "2018-08-15T18:41:48.065Z",
      "updateTime": "2018-08-19T17:58:28.767Z",
      "state": "RETURNED",
      "draftGrade": 9,
      "assignedGrade": 9,
      "alternateLink": "http://classroom.google.com/c/MTYwNjMxOTU2NjJa/a/MTYwNjM4NzM4MTBa/submissions/student/Mjk3MzM1MTVa",
      "courseWorkType": "ASSIGNMENT",
      "assignmentSubmission": {},
      "submissionHistory": [
        {
          "stateHistory": {
            "state": "CREATED",
            "stateTimestamp": "2018-08-15T18:41:47.897Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "stateHistory": {
            "state": "TURNED_IN",
            "stateTimestamp": "2018-08-17T16:21:56.338Z",
            "actorUserId": "109260139188842571634"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 2,
            "maxPoints": 15,
            "gradeTimestamp": "2018-08-19T08:03:05.888Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 6,
            "maxPoints": 15,
            "gradeTimestamp": "2018-08-19T08:03:25.369Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 9,
            "maxPoints": 15,
            "gradeTimestamp": "2018-08-19T17:54:52.751Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "DRAFT_GRADE_POINTS_EARNED_CHANGE"
          }
        },
        {
          "stateHistory": {
            "state": "RETURNED",
            "stateTimestamp": "2018-08-19T17:58:28.764Z",
            "actorUserId": "107554112463094781867"
          }
        },
        {
          "gradeHistory": {
            "pointsEarned": 9,
            "maxPoints": 15,
            "gradeTimestamp": "2018-08-19T17:58:28.767Z",
            "actorUserId": "107554112463094781867",
            "gradeChangeType": "ASSIGNED_GRADE_POINTS_EARNED_CHANGE"
          }
        }
      ]
    }
  ]
}
