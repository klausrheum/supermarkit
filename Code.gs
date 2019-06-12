/**
 * After editing SuperMarkIt's scripts, File > Manage Versions, Create New
 * Resources > Libraries > Select new version
 */


/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  installReportbookMenu();
}

var masterUser = "classroom@hope.edu.kh";

function installReportbookMenu () {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Import Grades', functionName: 'importGrades'},
    null,
    {name: 'Create Empty Student Portfolios', functionName: 'createPortfolios'},
    {name: "Update 🗹 Portfolios from 🗹 Subjects", functionName: 'exportPortfolios'},    
    null,
    {name: 'Backup Portfolio Admin', functionName: 'backupAllPastoralAdmin'},
    null,
    {name: 'Generate PDFs for 🗹 Portfolios', functionName: 'generateSelectedPortfolioPDFs'},
    {name: 'Generate PDFs for 🗹 Portfolios and email to guardians', functionName: 'generateAndSendSelectedPortfolioPDFs'},
    null,
    {name: 'Delete ALL SUBJECTS from 🗹 Portfolios', functionName: 'keepKillPortfolioSheets'}
  ];

  spreadsheet.addMenu('Reportbook', menuItems);
}

function generateSelectedPortfolioPDFs() {
  SuperMarkIt.generateSelectedPortfolioPDFs(false);
}
    
function keepKillPortfolioSheets() {
  var ui = SpreadsheetApp.getUi();
  
  if (Session.getActiveUser().getEmail() == masterUser) {
    var result = ui.alert(
      'NUCLEAR OPTION!!!',
      'Delete ALL generated subject tabs from all ticked Portfolios?',
      ui.ButtonSet.YES_NO);
    
    if (result == ui.Button.YES) {
      // User clicked "Yes".
      SuperMarkIt.keepKillPortfolioSheets(true);
    } else {
      // User clicked "No" or X in the title bar.
      
      ui.alert('Cancelled', 'Deletion cancelled.', ui.ButtonSet.OK);
    }

  } else {
    ui.alert("Sorry, only the master user can run this script");
  }
}
    
function generateAndSendSelectedPortfolioPDFs() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'Email Guardians',
     'Portfolio PDFs will be generated for ALL ticked Portfolios and emailed out!',
     ui.ButtonSet.YES_NO);
  
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    SuperMarkIt.generateSelectedPortfolioPDFs(true);
  } else {
    // User clicked "No" or X in the title bar.
    
    ui.alert('Cancelled', 'Emails cancelled.', ui.ButtonSet.OK);
  }

}
    
function importGrades() {
  var message = Utilities.formatString("Function %s executed", "importGrades");
  SuperMarkIt.logToSheet( message );
  
  // Y2025 ICT JKw
  var rbId = "1BijeGY49S0amD3u-eePjz8iWBwH1sEc7QE_yADzVzgQ";  
  var courseId = "16052292479";
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() != "Reportbooks") {
    SpreadsheetApp.getUi().alert("ERROR: Select a course from the Reportbooks tab");
  } else {
    var selection = SpreadsheetApp.getSelection();
    //SpreadsheetApp.getUi().alert(currentRange);
    //Logger.log('Active Sheet: ' + selection.getActiveSheet().getName());
    // Current Cell: D1
    //Logger.log('Current Cell: ' + selection.getCurrentCell().getA1Notation());
    // Active Range: D1:E4
    //Logger.log('Active Range: ' + selection.getActiveRange().getA1Notation());
    // Active Ranges: A1:B4, D1:E4
    var ranges =  selection.getActiveRangeList().getRanges();
    Logger.log("selection contains %s cells", ranges.length);
    for (var i = 0; i < ranges.length; i++) {
      var row = ranges[i].getRow();
      var column = ranges[i].getColumn();
      Logger.log('row %s, column %s', row, column);
      
      var courseIdColumn = 4;
      var rbIdColumn = 1;
      var timestampColumn = 16;
      
      if (column != 2) {
        SpreadsheetApp.getUi().alert("ERROR: Select a course from column B");
      } else {
        var rbId = sheet.getRange(row, rbIdColumn).getValue();
        var courseId = sheet.getRange(row, courseIdColumn).getValue();
        if (rbId && courseId) {
          Logger.log("importGrades: rbId=%s, courseId=%s", rbId, courseId);
          SuperMarkIt.importGrades(rbId, courseId);
          sheet.getRange(row, timestampColumn).setValue(new Date()); 

        }
      }
    }
  }
}

function createFilterView() {
  var name = "Thressa Brand";
  var ss = SpreadsheetApp.getActive();
  var sheet = SpreadsheetApp.getActiveSheet();
  Logger.log(ss.getColumnFilterCriteria(18));
  if (sheet.getName() == "Reportbooks") {
   
  }
}

function createPortfolios() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'Create Spreadsheets for Student Portfolios',
     'Portfolio Documents will be generated for ALL Portfolio that do not have them (this will take a while)',
     ui.ButtonSet.YES_NO);
  
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    SuperMarkIt.createStudents();  
  } else {
    // User clicked "No" or X in the title bar.
    
    ui.alert('Cancelled', 'Export cancelled.', ui.ButtonSet.OK);
  }
}

function exportPortfolios() {
  var message = Utilities.formatString("Function %s executed", "exportPortfolios")
  SuperMarkIt.logToSheet(message);
  
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'WARNING: Export Reportbooks to Portfolios?',
     'Portfolio tabs will be (re)generated for ALL ticked Reportbook / Portfolio combinations?',
     ui.ButtonSet.YES_NO);
  
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    SuperMarkIt.exportAllRBs();
  } else {
    // User clicked "No" or X in the title bar.
    
    ui.alert('Cancelled', 'Export cancelled.', ui.ButtonSet.OK);
  }
  
}

function backupAllPastoralAdmin() {
  var message = Utilities.formatString("Function %s executed", "backupAllPastoralAdmin")

  SuperMarkIt.backupAllPastoralAdmin();
}

function showAlert(title, prompt) {
  var ui = SpreadsheetApp.getUi(); // Same variations.
  
  var result = ui.alert(
     title,
     prompt,
      ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    //ui.alert('Confirmation received.');
  } else {
    // User clicked "No" or X in the title bar.
    //ui.alert('Permission denied.');
  }
  
  return result == ui.Button.YES;
}