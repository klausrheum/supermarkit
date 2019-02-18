function rename(tmpName) {
    var ss = SpreadsheetApp.getActive()
    ss.setName(ss.getSheetByName('Individual Report').getRange('C3:C4').getDisplayValues().reverse().toString().replace(/,/g, "_"))
    createPdf(ss, 2);
}

function export_pdf() {
    var ss = SpreadsheetApp.getActive()
    var studentName = ss.getSheetByName('Individual Report').getRange('B4').getDisplayValues()
    //ss.setName(ss.getSheetByName('Individual Report').getRange('C3:C4').getDisplayValues().reverse().toString().replace(/,/g, "_"))
    createPdf(ss, 2, studentName);
}

//function createPdf(ss, sheetNum, studentName) {
//  if (studentName === undefined) {
//    studentName = "Student";
//  }
//  var sheets = ss.getSheets();
//  
//  // hide all the sheets we DON'T want in the export
//  sheets.forEach(function (s, i) {
//    if(i !== sheetNum) s.hideSheet()
//      });
//  
//  var url = DriveApp.Files.get(ss.getId())
//  .exportLinks['application/pdf'];
//  url = url + '&size=a4' + //paper size
//    '&portrait=false' + //orientation, false for landscape
//      '&fitw=true' + //fit to width, false for actual size
//        '&sheetnames=false&printtitle=false&pagenumbers=false' + //hide optional
//          '&gridlines=false' + //false = hide gridlines
//            '&fzr=false'; //do not repeat row headers (frozen rows) on each page
//  
//  var token = ScriptApp.getOAuthToken();
//  var fileName = ss.getName();
//  fileName = fileName.replace("Reportbook", studentName);
//  
//  var pdfCreated = false;
//  do {
//    
//    try {
//      
//      var response = UrlFetchApp.fetch(url, {
//        headers: {
//          'Authorization': 'Bearer ' + token
//        }
//      });
//      Logger.log(response.getResponseCode());
//      
//      DriveApp.createFile(response.getBlob()).setName(fileName);
//      pdfCreated = true;
//    } 
//    
//    catch (error) {
//      Logger.log(error);
//    }
//    
//  } while (! pdfCreated);
//  
//  
//  // unhide the sheets
//  sheets.forEach(function (s) {
//    s.showSheet();
//  })
//  
//}

function ExportStudentsToPdf() {
  var ss = SpreadsheetApp.getActive();
  ss.setActiveSheet(ss.getSheetByName('Grades'), true);
  var rawNames = ss.getRange('D7:D46').getValues();
  Logger.log(rawNames);
  var studentNames = [];
  for each (var n in rawNames) {
    var name = n[0]    
    if (name.length > 1) {
      studentNames.push(name); 
    }
  }
  
  var namesCount = studentNames.length;
  //var names_count = 3; // whilst testing
  
  for (var i = 0; i < namesCount; i++) {
    var studentName = studentNames[i];
    Logger.log(studentName);

    ss.setActiveSheet(ss.getSheetByName('Individual Report'), true);
    ss.getRange('B4').activate();
    
    ss.getCurrentCell()
    .setRichTextValue(
      SpreadsheetApp.newRichTextValue()
      .setText(studentName)
      .build()
    );
    
    createPdf(ss, 2, studentName);
    
    Utilities.sleep(200);
    SpreadsheetApp.flush();
  }
}
