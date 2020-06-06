// export.gs ===================================================
// copy data from a student's 'Individual Report' sheet to their
// Portfolio spreadsheet (and maybe to a text report, who knows?
// =============================================================

// "ALL"  = export all, regardless
// "Y"    = export records marked Y
// "NONE" = dry run (for error log)

var exportOverride = "ALL";

function exportAllRBs() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  
  var startTime = new Date(); 
  logMe("exportAllRBs: START " + startTime, 'warn');

  var idsToExport = getRbIdsToExport();
  console.log ("%s reportbooks tagged for export", idsToExport.length);
  console.log (idsToExport);
  
  var studentsToUpdate = getEmailsToUpdate();  
  console.log ("%s students tagged for export", studentsToUpdate.length);
  console.log (studentsToUpdate);
  
//  if (studentsToUpdate != []) {
//    exportOverride = "ALL";
//  }

  var rbIds = getRbIds();
  console.log(rbIds.length);
  
  var aaa99 = "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y";
  // var rbIds = [aaa99];
  
  for (var r = 0; r<rbIds.length; r++) {
    
    // SAFETY CATCH
    
    // if (r > 15) break;
    
    // SAFETY CATCH
    
    var rbId = rbIds[r];
    // logMe(rbId);

    if (idsToExport.indexOf(rbId) > -1) {
      var rbss = SpreadsheetApp.openById(rbId);
      var rbName = rbss.getName();
      console.info("%s is ticked for export", rbName);
      exportStudentsFromRB(rbss, studentsToUpdate);
  
    } else {
      //console.log("Skipping %s", rbName);
      continue;
    
    }
  }
  
  var endTime = new Date();
  var elapsedTime = (endTime - startTime)/1000;
  
  logMe("exportAllRBs: END " + endTime + " in " + elapsedTime + " secs", 'warn');
}

function TEST_exportStudentsFromRB() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  
  var rbIds = getRbIds();
  var aaa_testerbook = "1cLCGk3RBa-Y5zqf7CT8GEwDRD-GtJBOka7_41NUsi5U";
  var rbIds = [aaa_testerbook];
  
  var rbId = rbIds[0];
  var rbss = SpreadsheetApp.openById(rbId);
  logIt("Exporting: " + rbId, meta);
  var studentsToUpdate = [
    "bobby.tables@students.hope.edu.kh"
    ];
  
  exportStudentsFromRB(rbss, studentsToUpdate);
}

function exportStudentsFromRB(rbss, studentsToUpdate) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};

  var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var pfSheet = rbTracker.getSheetByName(top.SHEETS.PORTFOLIOS);

  var srcName = rbss.getName();
  var owner = rbss.getOwner();
  var len = srcName.length;
  
  var subYear = srcName.substring(0,5);
  var tabName = rbss.getSheetByName(top.SHEETS.OVERVIEW)
  .getRange(top.RANGES.OVERVIEWSUBJECT).getValue();

  var problems = [];

  logMe('EXPORT: ' + srcName);

  var sub = tabName;
  //var students = getStudents();
  
  var gradeSheet = rbss.getSheetByName(top.SHEETS.GRADES);
  
  // TODO: v2 use these to update the portfolio directly?
  var titles = gradeSheet.getRange("A3:X3").getValues();
  var maxScores = gradeSheet.getRange("A4:X4").getValues();
  var classAverages = gradeSheet.getRange("A6:X6").getFormulas();
  
  // check for missing max & average in REP columns
  for (var c = 8; c < titles[0].length; c++) {
    var title = titles[0][c];
    var maxScore = maxScores[0][c];
    var avg = classAverages[0][c];
    
    //console.log("title: %s maxScore: %s avg: %s", title, maxScore, avg);
    if (title != "" && title.indexOf("REP") > -1) {
      if (maxScore == "") {
        logMe("[" + subYear + "] Max score required for " + title, 'warn');
      }
      if (avg == "") {
        logMe("[" + subYear + "] Average score formula required for " + title, 'warn');
      }  
    }
  }
  var rows = gradeSheet.getRange("A7:AB46").getValues();
  var replacementRows = [];
  
  var yesRows = rows.filter(
    function yes(arr) {
      return ["Y", "y"].indexOf(arr[27]) > -1;
    }
  );
  
  updateIndividualReportTab(rbss);
  
  for (var r=0; r<rows.length; r++) {
    
    var exported = false;
    
    //  open student.fileid from RB Tracker
    var row = rows[r];
    
    var rowLastname   = row[0];
    var rowFirstname  = row[1];
    var rowEmail      = row[2]; // col C, 0-based
    var rowFullname   = row[3];
    
    var rowAvgGrade   = row[5];
    var rowAvgPercent = row[6];
    var rowGrades     = row.slice(7, 23);
    
    var rowComment    = row[24]; // col Y
    var rowTimestamp  = row[25];
    var rowExportTabs = row[26];
    var rowExportYN   = row[27]; // col AB
    
    replacementRows.push([
      rowTimestamp, 
      rowExportTabs, 
      rowExportYN
    ]);
    
    
    if (rowEmail == "") {

      if (rowLastname != "") { // student has last name
        logMe("[" + subYear + "] EMAIL? missing email: " + rowFullname, 'warn');
      }
      
    } else { // row has an email
      
      // Fullname formula missing
      if (rowFirstname + " " + rowLastname != rowFullname) {
        logMe("[" + subYear + "] FULLNAME? Fullname formula missing in col C: " + rowFullname + " != " + rowFirstname + rowLastname + " in " + rowEmail, 'warn');
      }
      
      if (studentsToUpdate.length > 0) {
        if (studentsToUpdate.indexOf(rowEmail) == -1) {
          continue;
        }
      }
      
      
      if (exportOverride != "Y" || ["Y", "y"].indexOf(rowExportYN) > -1) { 
        var message = "["+subYear+"] START: " + rowFullname + " (" + tabName + ")";
        logMe(message);
        
        // count grades entered...
        var rowScores = [];
        
        for (var g = 0; g < rowGrades.length; g++) {
          if (rowGrades[g] != "") {
            rowScores.push(rowGrades[g]); 
          }
        }
        
        // ... 2 or fewer grades ?
        if (rowScores.length <= 2) {
          var message = "FEW? " + rowScores.length.toString() + ' grade(s) ' + rowFullname + " (" + tabName + ") ";
          problems.push(message);
          logMe(message, 'warn');
        }

        // ... 10 or more grades ?
        if (rowScores.length >= 10) {
          var message = 'MANY? ' + rowScores.length.toString() + ' grade(s) ' + rowFullname + " (" + tabName + ") ";
          problems.push(message);
          logMe(message, 'warn');
        }
        
        // ... average score less than 30% ?
        if (rowAvgPercent < 0.30) {
          var message = "LOW? " + rowFullname + " (" + tabName + ") " + ' graded ' + rowAvgGrade + ' (' + Math.round(rowAvgPercent*100) + ' = ' + rowScores.join(" + ") + ")";
          problems.push(message);
          logMe(message, 'warn'); 
        }

        var student = getStudentByEmail(rowEmail);
        var portfolioFile = getPortfolioFile(student);
        
        if (portfolioFile != "") {
          
          //  if not exists sheet(sub):
          var tabExists = portfolioFile.getSheetByName(tabName) != null;
          var portfolioSheet; 
          
          if (! tabExists) {
            portfolioSheet = addSubTemplate(student, tabName);
          } else {
            logIt(tabName + " already exists", meta);
            portfolioSheet = portfolioFile.getSheetByName(tabName);
          }
                    
          //logIt(rowEmail + ": before exportOverride:" + exportOverride, meta, "C"); // DELETEME
          if ( exportOverride != "NONE" ) {

            // set Full Name
            var rbRepSheet = rbss.getSheetByName(template.reportsSheetName);
            rbRepSheet.getRange("B4").setValue(student.fullname);
            
            
            // SpreadsheetApp.flush();
            
            var updated = false;
            var attempt = 0;
            while (! updated) {
              var repName = rbRepSheet.getRange("B8").getValue();
              updated =  repName == student.fullname;
              // logIt("Attempt: " + (attempt+1) + " B4: " + student.fullname + " B8:  " + repName + " so updated=" + updated, meta, "C"); // DELETEME
              Utilities.sleep(1000);
              attempt += 1;
              if (attempt > 10) {
                var message = "Name mis-match? Cannot select " + student.fullname + " in cell B4 of 'Individual Report' tab of file: " + srcName;
                logMe( message, 'warn' );
                problems.push(message);
                throw new Error(message);
              };
            }
            
            
            // copy grades data
            var titlesAndPercentages = rbRepSheet.getRange("B1:S8").getValues();
            portfolioSheet.getRange("B1:S8").setValues(titlesAndPercentages);
            
            var letterGrades = rbRepSheet.getRange("B10:S11").getValues();
            portfolioSheet.getRange("B10:S11").setValues(letterGrades);
            
            // wipe out GPA (for now)
            portfolioSheet.getRange("C6:C11").setValue("");
            
            // wipe out %age (for now)
            if (student.year == "Y11" || student.year == "Y12") {
              var containsCPE = tabName.indexOf("CPE") != -1; 
              var containsTOK = tabName.indexOf("TOK") != -1;
              if (! containsCPE && ! containsTOK) { 
                portfolioSheet.getRange("E6:E11").setValue("");
                console.log("Clearing percentages for %s", tabName);
              }
            }
            
            // is this still needed?
            wipeBlankColumns(portfolioSheet);

            // add Comment
            portfolioSheet.getRange("I4").setValue(rowComment);
            
            // clear out unused Titles otherwise arrayformula won't display
            updateValues(portfolioSheet, "F6:6", ["Title"], [""]);
            
            // merge & wrap footer area, add text
            var footer = "* Assessments marked * were completed after school closure. Given the challenges associated with distance learning and assessing, teachers are unable to validate whether missing or uncharacteristic assessment items are a consequence of technical challenges or lack of student application.";
            var a1Notation = top.RANGES.REPORTFOOTER;
            addFooter(portfolioSheet, a1Notation, footer);
            
            grabPortfolioTabsAndGrades(student);
            
            // update timestamp, uncheck YN, etc
            // add datestamp
            var newTimestamp = "" + new Date();            
            var newExportYN = exported ? "Y" : "N";
            var url = portfolioFile.getUrl();
            url += '#gid=';
            url += portfolioSheet.getSheetId();
            var newExportTabsLink = '=HYPERLINK("' + 
              url + '", "' + 
                student.fullname + " " + tabName + 
                  '")';
            
            //logIt([rowTimestamp, rowExportTabs, rowExportYN], meta);
            //console.log([r, newTimestamp, newExportTabs, newExportYN], meta);
            
            replacementRows[r] = [[
              newTimestamp, 
              newExportTabsLink,
              newExportYN
            ]];
            gradeSheet.getRange(r+7, 26, 1, 3).setValues(replacementRows[r]);
            
            // TODO (IDEA - MAYBE?) copy grade data (do the math?) and the comment
            
            
          }
          
        } else {
          var newTimestamp = "" + new Date();
          var message = "MISSING: No Portfolio file, skipping";
          problems.push(message);
          logMe(message);
          gradeSheet.getRange(r+7, 26, 1, 3).setValues([[newTimestamp, "No Portfolio, ignored", "N"]]);
        }
      }
    }
  }
  // gradeSheet.getRange("Z7:AB46").setValues(replacementRows);
  if (problems.length > 0) {
    var problemsText = " " + problems.length + " problem(s)";
    logMe("PROBLEMS: "+ srcName + problemsText);
  }
}

function TEST_wipeBlankColumns() {
  var ss = SpreadsheetApp.openById('1VVX5fjbpJWHf-_hTviAhIpFOmFlTryeDEm_sSUzJD6Y');
  var portfolioSheet = ss.getSheetByName('Mathematics');
  wipeBlankColumns(portfolioSheet);
}

function wipeBlankColumns(portfolioSheet) {
  // FIXME should shuffle columns leftwards
  
  // wipe out title & class average if grade is blank
  var gradesRange = "F6:S11";
  var values = portfolioSheet.getRange(gradesRange).getValues();
  var width = values[0].length;
  var gradeLetterRow = 5;
  
  // remove blank-grade columns, append empty column at end
  
  for (var c = width-1; c >= 0; c--) {    
    var gradeValue = values[gradeLetterRow][c];
    
    if (gradeValue === '') {
      // del blank column's empty values, add blank to end
      for (var r = 0; r < values.length; r++) {
        var part1 = values[r].slice(0,c);
        var part2 = values[r].slice(c+1);
        values[r] = part1.concat(part2, '');
      }
    }
    
  }
  portfolioSheet.getRange(gradesRange).setValues(values);
  Logger.log(values);
}            


function getRbIdsToExport() {
  // build list of RBs ticked for export
  var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var rbSheet = rbTracker.getSheetByName(top.SHEETS.REPORTBOOKS);
  var lastRow = rbSheet.getLastRow();
  
  var rawIds = rbSheet.getRange(2, top.COLS.RBIDSTOEXPORT, lastRow, 1).getValues();
  
  var idsToExport = [];
  var thisId;
  
  for (var i = 0; i < rawIds.length; i++) {
    thisId = rawIds[i][0];
    if (thisId.length > 0) {
      idsToExport.push(thisId); 
    }
  }
  return idsToExport;
}

function getEmailsToUpdate() {
  // build list of students ticked for export
  var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var pfSheet = rbTracker.getSheetByName(top.SHEETS.PORTFOLIOS);
  var lastRow = pfSheet.getLastRow();
  
  var rawIds = pfSheet.getRange(2, top.COLS.EMAILSTOEXPORT, lastRow, 1).getValues();
  Logger.log(rawIds);
  var studentsToUpdate = [];
  var thisId;
  for (var i = 0; i < rawIds.length; i++) {
    thisId = rawIds[i][0];
    if (thisId.length > 0) {
      studentsToUpdate.push(thisId); 
    }
  }
  Logger.log("studentsToUpdate");
  Logger.log(studentsToUpdate);
  return studentsToUpdate;
}



function createTestStudent() {
    createStudentFullInfo(bobby);
}

function deleteTestStudent() {
    deleteStudent(bobby);
}

function test_updateIndividualReport() {
  var aaaId = "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y";
  var mat09 = "1SQNPHhjrMYbpxJ3d7nN8vcMH4teF_DPGdsWxg4655Sc";
  var aaaSs = SpreadsheetApp.openById(aaaId);
  
  // clear B1: ICT Year 9 (Mr Kershaw)
  aaaSs
  .getSheetByName("Individual report")
  .getRange("B11").clear();
  
  // clear B10: =B7
  aaaSs
  .getSheetByName("Individual report")
  .getRange("B10").clear();
  
  updateIndividualReportTab( aaaSs );
  
  var val = aaaSs
  .getSheetByName("Individual report")
  .getRange("B10").getFormula();
  
  // B1 should now contain ICT Year 9 (Mr Kershaw)
  if (val.indexOf("(") == -1) {
    console.error("FAIL: updateGradeFormulas cell B1");
  }

  // B10 should now contain =B7 
  if (val != "=B7") {
    console.error("FAIL: updateGradeFormulas cell B10");
  }
}

function updateIndividualReportTab(ss) {
  // runs during exportStudentsFromRB
  
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  var rbName = ss.getName();
  Logger.log(rbName);
  
  var templateSs = SpreadsheetApp.openById(top.FILES.RBTEMPLATES);
  var temName = templateSs.getName();
  Logger.log(temName);
  
  // TODO DELETE var rbTemplatesFileId = "1YyMyHCQeshm4bWnfiwC3DbRSWDw48PQv9I822oXU8ys";
  
  var temSubSheet = templateSs.getSheetByName(top.SHEETS.SUB);
  var indRepSheet = ss.getSheetByName(top.SHEETS.INDREP);
  Logger.log(indRepSheet.getName());
  var formulas, styles;
  
  formulas = temSubSheet.getRange("A10:S11").getFormulas();
  indRepSheet.getRange("A10:S11").setFormulas(formulas);
  indRepSheet.getRange("B10:B11").setFormulas([["=B7"],["=B8"]])  
  Logger.log(formulas);
  
  indRepSheet.getRange("B1:B1").setFormula('=Overview!B1 & " (" & Overview!B2 & ")"');  
  
  styles = temSubSheet.getRange("B1:B1").getTextStyles();
  indRepSheet.getRange("B1:B1").setTextStyles(styles);  
  
  indRepSheet.getRange("B6:X11")
  .setHorizontalAlignment("left")
  .setVerticalAlignment("bottom");
  //SpreadsheetApp.flush();
  
  createChart(indRepSheet);
}

function getPortfolioFile(student) {
  var portfolioFile = "";
  try {
    portfolioFile = SpreadsheetApp.openById(student.fileid);
  }
  catch(e) {
    logMe(
      "[" + subYear + "] PORTFOLIO MISSING? " + student.email + ", error: " + e, 'error');           
  }
  return portfolioFile;
}

function grabPortfolioTabsAndGrades(student) {
  var portfolioFile = getPortfolioFile(student);
  if (portfolioFile) {
    
    // add average grade to tabs list
    var tabsList = [];
    tabsList = portfolioFile.getSheets().map(function(sheet) {
      var sName = sheet.getName();
      if (["Admin", "Pastoral"].indexOf(sName) > -1) {
        return sName;
      } else {
        return sName + ": " + sheet.getRange("D11").getValue() ;
      }
    });
    
    
    var newExportTabs = tabsList.filter(function(tab) {
      return tab.indexOf("_backup") == -1;
    });
    var newExportTabsString = newExportTabs.join("\n");
    
    // update list of exported tabs to Portfolios tab
    var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
    var pfSheet = rbTracker.getSheetByName(top.SHEETS.PORTFOLIOS);
    pfSheet
    .getRange(student.row, top.COLS.PORTFOLIOTABSLIST)
    .setValue(newExportTabsString);
    
    var newTimestamp = "" + new Date();
    pfSheet
    .getRange(student.row, top.COLS.PORTFOLIOLASTEXPORT)
    .setValue(newTimestamp);
  }
}


function copyPastoralToAdmin() {  
  
  for (var s = 0; s < top.students.length; s++) {
    
    //if (s >= 40) break;
    
    var student = top.students[s];
    var sheet = copyTemplateToStudent(student, "Admin", false);
    
    var ss = SpreadsheetApp.openById(student.fileid);
    var admin = ss.getSheetByName("Admin");
    var pastoral = ss.getSheetByName("Pastoral");

    admin.getRange("B5").setValue(student.firstname);
    admin.getRange("B6").setValue(student.lastname);
    admin.getRange("B7").setValue(student.email);
    
    var extra = pastoral.getRange("B7:C7").getValues()[0];
    extra = extra.join(" ");
    var extraLabel = "Extra curricular activities:";
    if (extra.indexOf(extraLabel) == 0) {
     extra = extra.slice(extraLabel.length);
    }
    admin.getRange("B9").setValue(extra.trim() );
    
    var comment = pastoral.getRange("B20").getValue();
    admin.getRange("B11").setValue(comment);
    
    var attributes = pastoral.getRange("C10:C18").getValues();
    admin.getRange("B13:B21").setValues(attributes);
  }
}



function adminFirstOnEveryStudent() {  
  for (var s = 0; s < top.students.length; s++) {
    // if (s>2) break;
    var student = top.students[s];
    var ss = SpreadsheetApp.openById(student.fileid);
    
    var sheet;
    // sheet = copyTemplateToStudent(student, "Admin", true);
    sheet = ss.getSheetByName("Admin");
    
    SpreadsheetApp.setActiveSpreadsheet(ss);
    SpreadsheetApp.setActiveSheet(sheet);
    SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(1);
    
    
  }
}

function addPastoralToEveryStudent() {  
  for (var s = 0; s < top.students.length; s++) {
    // if (s>2) break;
    var student = top.students[s];
    var sheet = copyTemplateToStudent(student, top.SHEETS.PASTORAL, false);
    console.log("Adding %s to %s", sheet.getName(), student.fullname);
    var ss = SpreadsheetApp.openById(student.fileid);
    SpreadsheetApp.setActiveSpreadsheet(ss);
    SpreadsheetApp.setActiveSheet(sheet);
    SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(2);
  }
}

function copyTemplateToStudent(student, templateName, replace) {
  if (replace === undefined) replace = false;
  
  return copySheet(top.FILES.RBTEMPLATES, student.fileid, 
               templateName, templateName, replace);
}

function copySheet(srcId, destId, srcName, destName, replace) {
  if (replace === undefined) {
    replace = false;
  }
  var srcFile = SpreadsheetApp.openById(srcId);
  var destFile = SpreadsheetApp.openById(destId); 
  var srcSheet = srcFile.getSheetByName(srcName);
  
  var destSheet = destFile.getSheetByName(destName);
  var destSheetExists = destSheet != null;
  
  if (destSheetExists) {
    if (replace) {
      console.warn("Deleting sheet %s (replace=%s)", destName, replace);
      destFile.deleteSheet(destSheet);
      //var random = randInt(10000,99999);
      //destSheet.setName(destSheet.getName() + random).hideSheet();
    } else {
      return destSheet;
    }
  }
  
  destSheet = srcSheet.copyTo(destFile);
  destSheet.setName(destName);
  return destSheet;
}

function test_addSubTemplate() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};

  var student = getStudentByEmail("thomas.norman@students.hope.edu.kh");
  var newSheet = addSubTemplate(student);
  logIt(newSheet, meta);
}


function addSubTemplate(student, tabName) {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  Logger.log(student);
  Logger.log(tabName);
  
  if (tabName === undefined) {
    tabName = "SUB"
  }

  // logIt("Adding tabName template to " + student.fullname , meta, "C");

  var portfolioFile = SpreadsheetApp.openById(student.fileid); 
  var subSheet = portfolioFile.getSheetByName(tabName);
  var tabExists = subSheet != null;
  
  var sheets = portfolioFile.getSheets();
  
  if (tabExists) {
    logIt("Tab " + tabName + " already exists, just update it", meta, "C");
    
  } else {
 
    // open the tab templates file
    // TODO DELETE var rbTemplatesId = "1YyMyHCQeshm4bWnfiwC3DbRSWDw48PQv9I822oXU8ys";
    var rbTemplateSS = SpreadsheetApp.openById(top.FILES.RBTEMPLATES);
    
    // copy the 'SUB' tab into the student portfolio
    //var subjectSheetName = "SUB";
    var subjectSheetTemplate;
    if (tabName == "ELL") {
      subjectSheetTemplate = rbTemplateSS.getSheetByName(top.SHEETS.ELL);
    } else {
      subjectSheetTemplate = rbTemplateSS.getSheetByName(top.SHEETS.SUB);
    }
    
    logIt(student.fullname + ": tab " + tabName + " does not exist. Creating...", meta, "C");
    subSheet = subjectSheetTemplate.copyTo(portfolioFile);
    //logIt(student.fullname + ": tab " + tabName + " sheet copied...", meta, "C"); // DELETEME
    subSheet.setName(tabName);
    logIt(student.fullname + ": tab " + tabName + " sheet renamed...", meta, "C"); // DELETEME
  }
  
  return subSheet;
}

function orderTabs(ss) {
  // loop through the tabs, sorting them into order
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  sortGoogleSheets(ss);
}

/* Credit: https://gist.github.com/chipoglesby/26fa70a35f0b420ffc23 */
function sortGoogleSheets(ss) {

  // Store all the worksheets in this array
  var sheetNameArray = [];
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    sheetNameArray.push(sheets[i].getName());
  }

  sheetNameArray.sort();

  // Reorder the sheets.
  for( var j = 0; j < sheets.length; j++ ) {
    ss.setActiveSheet(ss.getSheetByName(sheetNameArray[j]));
    ss.moveActiveSheet(j + 1);
  }
}

function hideSheets() {
  var postfix = "_backup";
  // for sheet in list_of_sheets:
  for (var s = 0; s < top.students.length; s++) {
    var student = top.students[s];
    var ss = SpreadsheetApp.openById(student.fileid);
    var ssName = ss.getName();
    var sheets = ss.getSheets();
    
    for (var sheet = 0; sheet < sheets.length; sheet++) {
      // delete sheet
      var thisSheet = sheets[sheet];
      var sheetName = thisSheet.getName();
      
      if (sheetName == top.SHEETS.ADMIN) {
        console.log("[%s] I'm NOT going to hide sheet %s", ssName, sheetName);
        
      } else {
        console.log("[%s] I AM going to hide sheet %s", ssName, sheetName); 
        thisSheet.setName(sheetName + postfix);
        thisSheet.hideSheet();
      }
    }    
  }
}


function backupAllPastoralAdmin() {
  var students = getStudents();  
  var selectedStudentEmails = getEmailsToUpdate();  

  for (var s = 0; s < top.students.length; s++) {
    //if (s >= 5) break; // already limited by 🗹
    
    var student = students[s];
    if (selectedStudentEmails.indexOf(student.email) > -1) {
      backupPastoralAdmin(student);
      pushExtraCurricularToPortfolio(student);
      setPastoralPageFooter(student); // NEW
      grabPortfolioTabsAndGrades(student);
    }
  }  
}

function TEST_pushExtraCurricularToPortfolio() {
  var testEmail = "bobby.tables@students.hope.edu.kh";
  var student = getStudentByEmail(testEmail);
  
  pushExtraCurricularToPortfolio(student);
}

function pushExtraCurricularToPortfolio(student) {
  logMe('PUSH ' + student.fullname + ' Extra Curricular to Pastoral Admin');
  
  var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var portfoliosSheet = rbTracker.getSheetByName(top.SHEETS.PORTFOLIOS);
  var pf = SpreadsheetApp.openById(student.fileid);
  var pfName = pf.getName();
  
  Logger.log("%s", student.fullname);
  
  var extra = portfoliosSheet
  .getRange(student.row, top.COLS.EXTRACURRICULARSUMMARY).getValue();
      
  pf.getSheetByName(top.SHEETS.ADMIN)
    .getRange(top.RANGES.ADMINEXTRACURRICULAR)
    .setValue(extra);
}

function setPastoralPageFooter(student) {
  logMe('SET ' + student.fullname + ' Pastoral Footer');
  
  var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var portfoliosSheet = rbTracker.getSheetByName(top.SHEETS.PORTFOLIOS);
  var pf = SpreadsheetApp.openById(student.fileid);
  var pfName = pf.getName();
  
  Logger.log("%s", student.fullname);
  
  var footer = portfoliosSheet
  .getRange(student.row, top.COLS.PASTORALFOOTER)
  .getValue();    
  
  var pastoralSheet = pf.getSheetByName(top.SHEETS.PASTORAL);
  var a1Notation = top.RANGES.PASTORALFOOTER; // "B29:H29";
  
  addFooter(pastoralSheet, a1Notation, footer);
}

function test_backupPastoralAdmin() {
  var testEmail = "bobby.tables@students.hope.edu.kh";
  var student = getStudentByEmail(testEmail);
  
  backupPastoralAdmin(student);
}

function backupPastoralAdmin(student) {
  var fields = [
    [top.RANGES.ADMINPASTORALTEACHER, top.COLS.PASTORALTEACHERBACKUP],
    [top.RANGES.ADMINEXTRACURRICULAR, top.COLS.EXTRACURRICULARBACKUP],
    [top.RANGES.ADMINATTENDANCETOTAL, top.COLS.ATTENDANCETOTALBACKUP],
    [top.RANGES.ADMINPASTORALCOMMENT, top.COLS.PASTORALCOMMENTBACKUP]
  ];
  
  logMe('BACKUP ' + student.fullname + ' Pastoral Admin data');
  var rbTracker = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  var portfoliosSheet = rbTracker.getSheetByName(top.SHEETS.PORTFOLIOS);
  var pf = SpreadsheetApp.openById(student.fileid);
  var pfName = pf.getName();
  
  Logger.log("%s", student.fullname);
  
  for (var f = 0; f < fields.length; f++) {
    var value = pf
    .getSheetByName(top.SHEETS.ADMIN)
    .getRange(fields[f][0])
    .getValues();
    
    console.log(".getRange(%s, %s).setValue(%s)", student.row, fields[f][1], value);
    
    portfoliosSheet
    .getRange(student.row, fields[f][1])
    .setValues(value);
    
  } // this field
  
  // copy, compress & save ATTRIBUTES
  var values = pf
  .getSheetByName(top.SHEETS.ADMIN)
  .getRange(top.RANGES.ADMINATTRIBUTES)
  .getValues();
  
  var compressedValue = [];
  values.forEach(function (v, i) {
    compressedValue.push(v[0]);
  });
  compressedValue = compressedValue.join(", ");
  Logger.log(compressedValue);
  
  portfoliosSheet
  .getRange(student.row, top.COLS.ATTRIBUTESBACKUP)
  .setValue(compressedValue);
}