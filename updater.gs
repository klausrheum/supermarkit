// updater.gs ==================================================
// 1. add columns to teacher RBs (Comments, Date, Tabs, ExportYN
// 2. update formulas in teacher RBs and student portfolios
// =============================================================



function updateReportbooks() {
  var makeChanges = true; // if false, just log mismatch
  
  logMe("START: Pre-check Reportbooks");
  
  var rbRows = getRbRows();
  
  for (var row = 0; row < rbRows.length; row++) {
    var rbRow = rbRows[row];
    var id = rbRow.rbId;
    var sync = rbRow.Sync;
    //var geo2019sl = "1HV01YukUG42Gytg1Ve6fO1veFSudRCdKsU0Q9ph6_Xw";
    
    // only look if 'sync' checked, skip empty rbIds
    if (!sync || ! id || id.length < 2) { 
      continue;
    }
    
    logMe("UPDATE: " + rbRow.courseName);

    // SAFETY CATCH =============================
    
    //if (row > 2) break; // stop after n reportbooks
    
    // END SAFETY CATCH =========================
    
    var ss = SpreadsheetApp.openById(id);
    //logMe("Updating " + ss.getName() );
    var rbSubject = rbRow["Subject Name in Report"];
    var rbTeacher = rbRow["ownerName"];
    
    var overviewSubjectTeacher = ss.getSheetByName(top.SHEETS.OVERVIEW)
    .getRange("B1:B2").getValues();
    var overviewSubject = overviewSubjectTeacher[0][0];
    var overviewTeacher = overviewSubjectTeacher[1][0];
    
    console.log( "fileName: %s", ss.getName() );
    var updateMeta = false;
    if (rbSubject != overviewSubject) {
      updateMeta = true;
      logMe("WARN: Mismatched SUBJECT: Overview=" + overviewSubject + " but Reportbook=" + rbSubject + ' in ' + ss.getName(), 'warn');
    }
    if (rbTeacher != overviewTeacher) {
      updateMeta = true;
      logMe("WARN: Mismatched TEACHER: Overview=" + overviewTeacher + " but Reportbook=" + rbTeacher + ' in ' + ss.getName(), 'warn');
    }
    
    if (makeChanges && updateMeta) {
      // FIXME: Need to pull subjectName, teacherName from Reportbooks tab
      updateReportbookMetadata(id, rbSubject, rbTeacher);
    }
    
    //    updateCommentsColumn(ss);
    //    updateExportColumns(ss);
    //    updateFreezeRows(ss);
    updateRBFormulas(ss);
    updateIBPercentages(ss);
    //    updateDeleteUnusedDatesAndTitles(ss);
    //updateGradeScale(ss);
    //updateConditionalFormatting(ss); // doesn't work in this scope :(
    
    //   sheet(report)
    //     // display comment
    //     .insertFormula(I4, 
    //      =iferror(index(Grades!$D$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0),22),"")
    //     .chartType(scatter)
    //     .trendLines(false)
  
    Utilities.sleep(1000);
  }
}

function TEST_updateIBPercentages() {
  var id = '1AkMktNVONfzThEL69Uxed7RKJwCDaLCirUVXHmJ0rdM';
  var ss = SpreadsheetApp.openById(id);
  updateIBPercentages(ss);
}

function updateIBPercentages(ss) {
 var sheet = ss.getSheetByName(top.SHEETS.INDREP);
  sheet.getRange("D7:D11")
  .setNumberFormat('#');
}

function updateDeleteUnusedDatesAndTitles(ss) {
  var sheet = ss.getSheetByName(template.gradesSheetName);    
  updateValues(sheet, "H2:3", ["Title", "Date"], ["", ""]);
}


function updateCommentsColumn(ss) {
  var sheet = ss.getSheetByName(template.gradesSheetName);    
  sheet.setWrap
  // ensure we have 28 columns 'Comment' column
  var lastCol = sheet.getLastColumn();
  while (lastCol < 28) {
    sheet.insertColumnBefore(lastCol);
    lastCol ++;
  }
  
  // if column 25 isn't 'Comment', make it so
  var title = sheet.getRange(3, 25).getValue();
  Logger.log(title);
  if (title == "") {
    sheet.getRange("Y3:Y4").setValues([["Comment"],[""]]);
  }
  sheet.getRange("Y1:Y")
  .setHorizontalAlignment("left")
  .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  sheet.setColumnWidth(25, 250);  
}
// END updateCommentsColumn


function updateExportColumns(ss) {
  // not working in this scope, using Y/N for now :/
  //  var checkBoxes = 
  //    SpreadsheetApp
  //    .newDataValidation()
  //    .setAllowInvalid(false)
  //    .requireCheckbox()
  //    .build();
  
  var sheet = ss.getSheetByName("Grades");
  
  // add admin columns
  var lastCol = sheet.getLastColumn();
  while (lastCol < 28) {
    sheet.insertColumnAfter(sheet.getLastColumn());
    lastCol ++;
  }
  
  sheet.getRange("Y:AB")
  .setBorder(null, true, null, true, true, null, '#999999', SpreadsheetApp.BorderStyle.SOLID);
  
  sheet.getRange("Z1:AB5")
  .setBackground("#e8eaf6")
  .setFontColor("#303f9f");
  
  // Tabs
  sheet.setColumnWidth(27, 170);
  sheet.getRange('AA3').setValue('Tabs');
  
  sheet.getRange("Y1:Y5")
  .setBackground("#333333")
  .setFontColor("#FFFFFF");
  
  // Date
  sheet.setColumnWidth(26, 170);
  sheet.getRange('Z3').setValue('Last exported:');
  
  // Export
  //  var ss = SpreadsheetApp.openById(aaa);
  //  var sheet = ss.getSheetByName("Grades");
  var checkboxValidation = SpreadsheetApp
  .newDataValidation()
  .requireCheckbox("Y", "N")
  .build();
  
  sheet.getRange("AB7:AB46").setDataValidation(checkboxValidation); 
  
  sheet.setColumnWidth(28, 50);
  sheet.getRange('AB3').setValue('Export Y / N');
  
  //  Logger.log("Setting checkboxes");
  //  ss.getRange('AB7:AB')
  //  .setDataValidation(checkBoxes);
  
  sheet.getRange("Y:AA")
  .setHorizontalAlignment("left");
  
  sheet.getRange("Z7:Z")
  .setNumberFormat('h PM, ddd mmm dd');
  
  sheet.getRange("Z7:AA")      // date and tabs
  .setHorizontalAlignment("left")
  .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  sheet.getRange("AB:AB")
  .setHorizontalAlignment("center");
  
};
// END updateExportColumns

function formatIds() {
// 1-time script to enforce conditionalFormatting directly by file id!
  var ids = [
    "1dHXH95BUJ-cv43d90MTHrqgdl_i8pMnM9s_UeAvni4c"
    ];

  for (var i=0; i<ids.length; i++) {
    id = ids[i];
    var ss = SpreadsheetApp.openById(id);
    updateConditionalFormatting(ss);
   // if (i > 2) break;
  };
}

function updateConditionalFormatting(ss) {
  var sheet = ss.getSheetByName("Grades");
  var rules = sheet.getConditionalFormatRules();
  while (rules.length > 0) {
    Logger.log(rules);
    rules.pop();
  }
  
  // color title cells
  // if they are REP okay
  var range = sheet.getRange("H3:W3");
 
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=regexmatch(H3, " REP[0-9% ]*\\z")')
  .setBackground("#33691e")
  .setFontColor("#FFFFFF")
  .setRanges([range])
  .build();
  rules.push(rule);

  // color extracted REP cells (top row)
  var range = sheet.getRange("H1:W1");
 
  // if title is blank, make REP fg=bg
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=isblank(H3)')
  .setBackground("#2a3990")
  .setFontColor("#2a3990")
  .setRanges([range])
  .build();
  rules.push(rule);
  
  // if class avg is blank, make REP bg grey
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=isblank(H6)')
  .setBackground("#666666")
  .setFontColor("#FFFFFF")
  .setRanges([range])
  .build();
  rules.push(rule);

  
  // Adds conditional format rules to the Grades sheet 
  // that causes imported grades to turn different colors
  // if they satisfy A/B/C/D/E conditions based on 
  // the thresholds in the Overview sheet 
  var range = sheet.getRange("H7:W45");

  // 0 (red)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=if(isnumber(H7), H7/H$4 = 0, "")')
  .setBackground("#FF0000")
  .setFontColor("#FFFFFF")
  .setRanges([range])
  .build();
  rules.push(rule);

  // Missing (grey)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=isblank(H7)')
  .setBackground("#d9d9d9")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);

  // A (dark green)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=(H7/H$4 >= indirect("Overview!B10")/100)')
  .setBackground("#6aa84f")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // B (light green)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 >= indirect("Overview!B13")/100')
  .setBackground("#b6d7a8")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // C (light yellow)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 >= indirect("Overview!B16")/100')
  .setBackground("#fff2cc")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // D (light orange)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 >= indirect("Overview!B19")/100')
  .setBackground("#f9cb9c")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // E (salmon)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 < indirect("Overview!B19")/100')
  .setBackground("#ea9999")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // color alternate lines grey
  var range = sheet.getRange("H1:W1");
  
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=iseven(row())')
  .setBackground("#f9f9f9")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  sheet.setConditionalFormatRules(rules);
}

function updateFreezeRows(ss) {
  ss.getSheetByName(template.gradesSheetName).setFrozenRows(6);
}

function testUpdateValues() {
  var ss = SpreadsheetApp
  .openById("1cLCGk3RBa-Y5zqf7CT8GEwDRD-GtJBOka7_41NUsi5U");
  var sheet = ss.getSheetByName(template.gradesSheetName);
  updateValues(sheet, "H2:3", ["Title", "Date"], ["", ""]);
}

function updateValues(sheet, rangeA1, oldValues, newValues) {
  if (oldValues.length != newValues.length) {
    throw "newValues must be same length as oldValues";
  }
  
  var data = sheet.getRange(rangeA1).getValues();
  Logger.log("updateValues: " + data);
  for (var r = 0; r < data.length; r++) {
    for (var c = 0; c < data[0].length; c++) {
      var cellValue = data[r][c];
      //Logger.log("Checking cell["+r+"]["+c+"]=" + cellValue);
      for (var v = 0; v < oldValues.length; v++) {
        if (cellValue == oldValues[v]) {
          data[r][c] = newValues[v];
          //Logger.log("Updated cellValue from " + oldValues[v] + " to " + newValues[v]);
        }
      }
    }
  }
  sheet.getRange(rangeA1).setValues(data);
}



function test_updatePortfolios() {
  // convert the attributes table to full sentences
  var testEmail;
  testEmail = "bobby.tables@students.hope.edu.kh";
  //testEmail = "johannes.christensen@students.hope.edu.kh";
  //testEmail = "tom.kershaw@students.hope.edu.kh";
  var student = getStudentByEmail(testEmail);
  var pf = SpreadsheetApp.openById(student.fileid);
  updatePortfolioMergeAndWrapExtraCurricular(pf);
}

function updateSelectedPortfoliosFormulas() {
  var students = getStudents();  
  var selectedStudentEmails = getEmailsToUpdate();
  
  var formulas = [
    {
      // update introduction label
      "sheet": "Pastoral", 
      "cell": "B3", 
      "range": "", 
      "formula": '=if(len(B4)>1, "INDIVIDUAL REPORT FOR", "")',
      // TODO "r1c1": false
    },
    {
      // update Pastoral Comment label
      "sheet": "Pastoral", 
      "cell": "B6", 
      "range": "", 
      "formula": '=if(istext(B7), "Pastoral Comment", "")',
      // TODO "r1c1": false;
    },
    {
      // update Extra-Curricular label
      "sheet": "Pastoral", 
      "cell": "B11", 
      "range": "", 
      "formula": '=if(istext(B12), "Extra curricular activities", "")',
      // TODO "r1c1": false;
    },
    {
      // update Attendance label
      "sheet": "Pastoral",
      "cell": "B26",
      "range": "",
      "formula": '=if(isblank(C26), "", "Attendance:")',
    },
  ];
    logMe('START: Updating Pastoral formulas');
      
  for (var s = 0; s < top.students.length; s++) {
    //if (s >= 5) break; // already limited by 🗹
    
    var student = students[s];
    if (selectedStudentEmails.indexOf(student.email) > -1) {
      var pf = SpreadsheetApp.openById(student.fileid);
      logMe('Updating Pastoral formulas for ' + student.fullname);
      updateFormulas(pf, formulas);
    }
  }  
    logMe('END: Updating Pastoral formulas');

}

function updateAllPortfolios() {
  var students = getStudents();
  for (var s = 0; s < students.length; s++) {
    if (s > 3) break;
    
    var student = students[s];
    logMe("UPDATE: Tidying Portfolio for " + student.fullname); 
    var pf = SpreadsheetApp.openById(student.fileid);
    
    // updatePortfolioAttributes(pf);
    // updatePortfolioMergeAndWrapExtraCurricular(pf);    
  }
}



function updatePortfolioMergeAndWrapExtraCurricular(pf) {
  Logger.log("updatePortfolioMergeAndWrapExtraCurricular for file id %s", pf.getName());

  var pastoralSheet = pf.getSheetByName(top.SHEETS.PASTORAL);
  
  // make extracurricular 3 lines long & text-wrapped
  pastoralSheet.getRange("B12:B14")
  .merge()
  .setHorizontalAlignment("left")
  .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  // delete the 'always / mostly' that sit to the right of the merged field
  pastoralSheet.getRange("C15:C23")
  .clearContent();
}

function updatePortfolioAttributes(pf) {
  // one-shot function, probably never need again
  
  Logger.log ("Name: " + pf.getName());
  var pastoralSheet = pf.getSheetByName(top.SHEETS.PASTORAL);
  
  
  // merge attributes cells, convert to formula
  pastoralSheet.getRange("B15:C23")
  .merge();
  
  pastoralSheet.getRange("B15")
  .setFormula(
    '=regexreplace(' +
    'textjoin("\n", TRUE, arrayformula(' + 
    'if (Admin!B13:B21 <> "", ' +
    'upper(left(Admin!B13:B21)) & ' +
    'mid(Admin!B13:B21, 2, 999) & " " & ' +
    'lower(Admin!A13:A21) & ".", ""))' + 
    '), "Mostly", "Mostly")'); // was Usually
  
  console.log("Successfully updated attributes");
  
}

function updatePortfoliosSheetFormulas() {
  
  var formulas = [
    {
      // update fullname
      "sheet": "Portfolios", 
      "cell": "D2", 
      "range": "D3:D", 
      "formula": '=B2 & " " & A2',
      // TODO "r1c1": false
    },
    {
      // update filename
      "sheet": "Portfolios", 
      "cell": "F2", 
      "range": "F3:F", 
      "formula": '=UPPER(A2) & ", " & B2 & " (' + top.META.SEM + ' Report)"',
      // TODO "r1c1": false;
    },
    {
      // update link
      "sheet": "Portfolios", 
      "cell": "J2", 
      "range": "J3:J", 
      "formula": '=if(istext(G2), HYPERLINK("https://docs.google.com/spreadsheets/d/" & G2 & "/edit", F2), "")',
      // TODO "r1c1": false;
    }
  ];
  
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  updateFormulas(rb, formulas);
  
}

//function replaceInOverview() {
//  //var pf = 
//}
//
//function replaceInSS(pf) {
//  // https://stackoverflow.com/questions/42150450/google-apps-script-for-multiple-find-and-replace-in-google-sheets
//  
//  var sheets = pf.getSheets();
//  sheets.forEach(function (sheet, i) {
//    replaceInSheet(sheet);
//  });
//}
//function test_replaceInSheet() {
//  var art9 = "1w-XKwxeUhzDNNYUQ1kqzQAzwn-QivCs0qc9Imj9oVKw";
//  var ict7 = "1UV9BysLHpyz4_ycPaV9QO1LxumJYW02umDGQXU2RG-s"; 
//  var pf = SpreadsheetApp.openById(ict7);
//  var sheet = pf.getSheetByName("Overview");
//  replaceInSheet(sheet);
//}
//
//function replaceInSheet(sheet) {
//  //  get the current data range values as an array
//  //  Fewer calls to access the sheet -> lower overhead 
//  var values = sheet.getDataRange().getValues();  
//
//  // update teachers
//  replaceInValues(values, /^Mr\. Kershaw$/g, /John Kershaw/);
//
//  // update subjects
//  replaceInValues(values, / ?Reportbook$/g, "");
//
//  // replace student names
//  replaceInValues(values, /Caleb/g, /Haram/);
//
//  // Write all updated values to the sheet, at once
//  sheet.getDataRange().setValues(values);
//}

//function replaceInValues(values, to_replace, replace_with) {
//  //loop over the rows in the array
//  for (var row in values) {
//    //use Array.map to execute a replace call on each of the cells in the row.
//    var replaced_values = values[row].map(function(original_value) {
//      Logger.log("%s +> %s", original_value, typeof original_value == "string" && original_value.indexOf("=") == "-1");
//      if (typeof original_value == "string" && original_value.indexOf("=") == "-1") {
//        return original_value.replace(to_replace,replace_with);
//      } else {
//        return original_value;
//      }
//    });
//
//    //replace the original row values with the replaced values
//    //values[row] = replaced_values;
//  }
//}

function updateRBFormulas(ss) {
  logMe("FORMAT: Skip blanks, REP >> weighting " + ss.getName(), 'log' );
  
  var formulas = [
    {
      "desc": "replace REP20% with weighting 20%",
      "sheet": "Individual report",
      "cell": "B6",
      "range": "",
      "formula": '=arrayformula(REGEXREPLACE({Grades!D3:X3}, " REP ?([0-9]*%?)\\z", " weighting $1"))'
    }, 
//    {
//      // F6=if(istext(A6), index(Grades, match($G6*100,GradeRange,-1), 1),"")
//      "desc": "if the Last name column is empty, don't display a grade (eg E-)",
//      "sheet": "Grades", 
//      "cell": "F6", 
//      "range": "F7:F", 
//      "formula": '=if(istext(A6), index(Grades, match($G6*100,GradeRange,-1), 1),"")'
//    },
//    {
//      // G6=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H6:$X6, "<>", $H$1:$X$1)) * (H6:X6 / $H$4:$X$4))))
//      "desc": "if the grade is blank, don't include it in the weighting denominator",
//      "sheet": "Grades", 
//      "cell": "G6", 
//      "range": "G7:G", 
//      "formula": '=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H6:$X6, "<>", $H$1:$X$1)) * (H6:X6 / $H$4:$X$4))))'
//    },
//    {
//      "desc": "if the grade is blank, don't include it in the graph",
//      "sheet": "Individual report",
//      "cell": "F8",
//      "range": "",
//      "formula": '=arrayformula(if(index(Grades!$H$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0)) = "", "", iferror(index(Grades!$H$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0))/PointValues)))'
//    },
  ];

  updateFormulas(ss, formulas);
}

function updateFormulas(ss, formulas) {
  for (var i=0; i<formulas.length; i++) {
    var update = formulas[i];
    
    var sheet = ss.getSheetByName(update.sheet);
    
    var oldFormula = sheet.getRange(update.cell).getFormula();
    console.log(update.desc);
    
    // update to new formula
    sheet.getRange(update.cell)
    .setFormula(update.formula);
    
    // fill down?
    if (update.range != "") {
      sheet.getRange(update.cell)
      .copyTo(sheet.getRange(update.range), SpreadsheetApp.CopyPasteType.PASTE_FORMULA);
    }    
  }
}


function test_updateGradeScales() {
  // destination sheet
  Logger.log(top.FILES.AAA);
  var testSS = SpreadsheetApp.openById( top.FILES.AAA );
  Logger.log (testSS.getName() );
  var testSheet = testSS.getSheetByName( top.SHEETS.OVERVIEW );
  
  // clear scale from template SubY00 / Overview
  testSheet.getRange("B8:B22").clear();
  testSheet.getRange("D9:D22").clear();
  
  updateGradeScale(testSS);
}

function updateGradeScale(ss) {
  // source sheet
  var templateSS = SpreadsheetApp.openById( top.FILES.SUBY00 );
  var templateSheet = templateSS.getSheetByName( top.SHEETS.OVERVIEW );

  // destination sheet
  var destSheet = ss.getSheetByName( top.SHEETS.OVERVIEW );
  
  // get scale from template SubY00 / Overview
  var start_boundary = templateSheet.getRange("B8:B22").getValues();
  var end_boundary = templateSheet.getRange("D9:D22").getFormulas();
  var colors = templateSheet.getRange("B8:D22").getBackgrounds();
  var styles = templateSheet.getRange("B8:D22").getTextStyles();
  var alignments = templateSheet.getRange("B8:D22").getHorizontalAlignments();
  
  // paste to current RB / Overview
  destSheet.getRange("B8:B22").setValues(start_boundary);
  destSheet.getRange("D9:D22").setFormulas(end_boundary);
  destSheet.getRange("B8:D22").setBackgrounds(colors);
  destSheet.getRange("B8:D22").setTextStyles(styles);
  destSheet.getRange("B8:D22").setHorizontalAlignments(alignments);
}


function exportButton() {
  // sheet = "Individual report";
  // sheet.copyTo(name, B4:X11
}

