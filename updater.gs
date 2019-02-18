// updater.gs ==================================================
// 1. add columns to teacher RBs (Comments, Date, Tabs, ExportYN
// 2. update formulas in teacher RBs and student portfolios
// =============================================================



function updateReportbooks() {
  var rbIds = getRbIds();
  
  var aaa_testerbook = "1cLCGk3RBa-Y5zqf7CT8GEwDRD-GtJBOka7_41NUsi5U";
  var phy09copy = "1dQra-gLWOZ0oLiUCsGXPGeGNnZQaqI2rEynAYbstdS8";
  var englit09 = "1qvEbFGLUMEAxGfk0Bmfnb1Y5nvUGMICWPdNcCXQ9__E";
  var csc10 = "1jI0UpPD9Imz9SUXwcRUI8CaucrHuKhOg_Mi5GQJKJFI";
  //var rbIds = [csc10];
  
  for (var i=0; i < rbIds.length; i++) {
    
    // SAFETY CATCH =============================
    
    //if (i>10) break; // stop after two reportbooks
    
    // END SAFETY CATCH =========================
    
    id = rbIds[i];
    var ss = SpreadsheetApp.openById(id);
    //console.info("Updating " + ss.getName());
    
    var overviewSubjectTeacher = ss.getSheetByName(top.SHEETS.OVERVIEW)
    .getRange("B1:B2").getValues();
    console.log("[%s] %s", ss.getName(), overviewSubjectTeacher);
    
    //    updateCommentsColumn(ss);
    //    updateExportColumns(ss);
    //    updateFreezeRows(ss);
    //    updateRBFormulas(ss);
    //    updateDeleteUnusedDatesAndTitles(ss);
    // updateGradeScale(ss);
    // updateConditionalFormatting(ss); // doesn't work in this scope :(
    
    //   sheet(report)
    //     // display comment
    //     .insertFormula(I4, 
    //      =iferror(index(Grades!$D$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0),22),"")
    //     .chartType(scatter)
    //     .trendLines(false)
    
    SpreadsheetApp.flush();
  }
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

function updateConditionalFormatting(ss) {
  var conditionalFormatRules = ss.getActiveSheet().getConditionalFormatRules();
  
  ss.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
  conditionalFormatRules = ss.getActiveSheet().getConditionalFormatRules();
  conditionalFormatRules.splice(conditionalFormatRules.length - 1, 1, SpreadsheetApp.newConditionalFormatRule()
  .setRanges([ss.getRange('Z7:Z46')])
  .whenTextEqualTo('y')
  .setBackground('#FF00FF')
  .build());
  ss.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
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
      Logger.log("Checking cell["+r+"]["+c+"]=" + cellValue);
      for (var v = 0; v < oldValues.length; v++) {
        if (cellValue == oldValues[v]) {
          data[r][c] = newValues[v];
          Logger.log("Updated cellValue from " + oldValues[v] + " to " + newValues[v]);
        }
      }
    }
  }
  sheet.getRange(rangeA1).setValues(data);
}



function test_updatePortfolios() {
  // convert the attributes table to full sentences
  var testEmail = "bobby.tables@students.hope.edu.kh";
  testEmail = "johannes.christensen@students.hope.edu.kh";
  testEmail = "nawin.vong@students.hope.edu.kh";
  var student = getStudentByEmail(testEmail);
  var pf = SpreadsheetApp.openById(student.fileid);
  updatePortfolioWrapExtraCurricular(pf);
}

function updateAllPortfolios() {
  
  var students = getStudents();
  for (var s = 0; s < students.length; s++) {
    //if (s > 2) break;
    
    var student = students[s];
    console.log("%s %s", student.fullname, student.fileid); 
    var pf = SpreadsheetApp.openById(student.fileid);
    
    //updatePortfolioAttributes(pf);
    updatePortfolioWrapExtraCurricular(pf);    
  }
}

function updatePortfolioWrapExtraCurricular(pf) {
  var pastoralSheet = pf.getSheetByName(top.SHEETS.PASTORAL);
  pastoralSheet.getRange("B12")
  .setHorizontalAlignment("left")
  .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
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

function updatePortfolioFormulas() {
  
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
      "formula": '=UPPER(A2) & ", " & B2 & " (Sem 1 2018 Report)"',
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
  
  var rb = SpreadsheetApp.openById(top.rbTrackerId);
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
  
  var formulas = [
    {
      // F6=if(istext(A6), index(Grades, match($G6*100,GradeRange,-1), 1),"")
      "desc": "if the Last name column is empty, don't display a grade (eg E-)",
      "sheet": "Grades", 
      "cell": "F6", 
      "range": "F7:F", 
      "formula": '=if(istext(A6), index(Grades, match($G6*100,GradeRange,-1), 1),"")'
    },
    {
      // G6=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H6:$X6, "<>", $H$1:$X$1)) * (H6:X6 / $H$4:$X$4))))
      "desc": "if the grade is blank, don't include it in the weighting denominator",
      "sheet": "Grades", 
      "cell": "G6", 
      "range": "G7:G", 
      "formula": '=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H6:$X6, "<>", $H$1:$X$1)) * (H6:X6 / $H$4:$X$4))))'
    },
    {
      "desc": "if the grade is blank, don't include it in the graph",
      "sheet": "Individual report",
      "cell": "F8",
      "range": "",
      "formula": '=arrayformula(if(index(Grades!$H$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0)) = "", "", iferror(index(Grades!$H$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0))/PointValues)))'
    },
    {"desc": "replace REP20% with weighting 20%",
     "sheet": "Individual report",
     "cell": "B6",
     "range": "",
     "formula": '=arrayformula(REGEXREPLACE({Grades!D3:X3}, " REP ?([0-9]*%?)\\z", " weighting $1"))'
    } 
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