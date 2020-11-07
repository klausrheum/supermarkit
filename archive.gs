function ensureYearSheet(ss, year) {
  var hasSheet = false;
  var sheets = ss.getSheets();
  for (var i in sheets ) {
    if (sheets[i].getName() == year) {
      hasSheet = true;
      Logger.log('Sheet exists ' + sheets[i].getName() );
      break;
    }
  }
  
  if (! hasSheet) {
    Logger.log("Creating sheet " + year);
    var sheet = ss.insertSheet(year, sheets.length);
    var titles = [["Last name", "First name", "Email", "Full Name", "Report Filename", "Report File Id"]];
    sheet.getRange("A1:F1").setValues(titles).setFontWeight("bold");
  }
  
  return ss.getSheetByName(year);
}


function grabStuff() {
  console.info('Starting the %s function (%d arguments)', 'grabStuff', 1);

  var rb = SpreadsheetApp.openById(rbTrackerId);
  var sheet = rb.getSheetByName("Y07");
  var titles = sheet.getRange("A1:F1").getValues();
  console.info(titles);
  var formula = sheet.getRange("D2").getFormula();
  console.info(formula);
}

function measuringExecutionTime() {
  // A simple INFO log message, using sprintf() formatting.
  console.info('Timing the %s function (%d arguments)', 'myFunction', 1);

  // Log a JSON object at a DEBUG level. The log is labeled
  // with the message string in the log viewer, and the JSON content
  // is displayed in the expanded log structure under "structPayload".
  var parameters = {
    isValid: true,
    content: 'some string',
    timestamp: new Date()
  };
  console.log({message: 'Function Input', initialData: parameters});

  var label = 'myFunction() time';  // Labels the timing log entry.
  console.time(label);              // Starts the timer.
  try {
    myFunction(parameters);         // Function to time.
  } catch (e) {
    // Logs an ERROR message.
    console.error('myFunction() yielded an error: ' + e);
  }
  console.timeEnd(label);      // Stops the timer, logs execution duration.
}

// unfinished - save for Milestone 2
function importStudents() {
  var yearRBs = [
    ["Y06", "1XNiXHrW4xAj3SMdsAm4ls66bbYBEjqd3I5rE35vZbmU"],
    ["Y07", "1UV9BysLHpyz4_ycPaV9QO1LxumJYW02umDGQXU2RG-s"],
    ["Y08", "16QHaHxkb_pIRtyu9UIOPYnjZy5WXkx8i7xBv0ZH8Zmg"],
    ["Y09", "1j9G8YqSyqX1xGzzM38881HkfonDW09bSRvo8rdipcRE"],
    ["Y10", "1w5EaRpcQqyrwhx-vRXofyabchFTXlncFAt3bdrLKrjw"],
    ["Y11", ""],
    ["Y12", ""]
  ];
  
  
  for (var y in yearRBs) {
    year = yearRBs[y][0];
    yearId = yearRBs[y][1];
    var students = getStudents(year);
    for (var s in students) {
      Logger.log(students[s] + ", " + year);
      createStudentRB(students[s], year);
    }
  }
                   
  // createStudentRB(sarah, "Y09"); 
  // createStudentRB(lily, "Y07"); 
}

