// files.gs ====================================================
// imports files newly shared to Klaus, adds them to the tracker
// =============================================================

// wrapper to move newly shared files to Reportbooks folder 
// then add them to the Reportbook Tracker
function listReportbooks() {
  Logger.log("Moving any newly shared reportbooks into the Reportbooks folder");
  movedFiles = moveSharedReportbooks();
  if (movedFiles.length > 0) {
    Logger.log(movedFiles);
  }
  
  Logger.log("Copying list of files in Reportbooks folder to Reportbooks Tracker spreadsheet");
  listOfRBs = listFolderIntoSheet('Reportbooks');
  
  copyReportbooksDataToTracker();
}

// generates a spreadsheet containing id, title, URL and owner for each item in the Reportbooks folder (top-level)
function listFolderIntoSheet(foldername) {
  // var foldername = '';
  var filename = 'list ' + foldername;
  var folderID =  folderRB;
  var folder = DriveApp.getFolderById(folderID);
  var contents = folder.getFiles();
  var src_id = "1EAW-XHHtA1gIFoXe3sruqTHXtKi07xBxP4oXbWObCgU";
  
  try {
    var ss = SpreadsheetApp.openById(src_id);
    Logger.log('Successfully opened file ' + src_id);
    }
  
  catch (err) {
    Logger.log(err)
    var ss = SpreadsheetApp.create(filename);
    var src_id = ss.getId();
    Logger.log('Created new listing file: ' + src_id);
  }
  
  var fileId = ss.getId();
  Logger.log('fileId: ' + fileId);
  
  var sheets = ss.getSheets();
  var sheet = ss.setActiveSheet(sheets[0]);
  sheet.clearContents();
    
  var id, file, title, link, owner, name;
  var row;
  var cells = [];
  
  while(contents.hasNext()) {
    file = contents.next();
    id = file.getId();
    title = file.getName();
    link = file.getUrl();
    owner = file.getOwner().getName();
    name = file.getOwner().getEmail();
    
    cells.push([id, title, link, owner, name]);
  }

  cells.sort(Comparator);
  cells = [['id', 'title', 'link', 'owner', 'email']].concat(cells);
  
  Logger.log("Got the cells");
  //Logger.log(cells);
  sheet.getRange(1, 1, cells.length, cells[0].length).setValues(cells);

  return true;

};



// copy & paste columns A-D from 'list Reportbooks' to 'Reportbooks Tracker'
function copyReportbooksDataToTracker() {
  var src_id = "1EAW-XHHtA1gIFoXe3sruqTHXtKi07xBxP4oXbWObCgU";
  var src = SpreadsheetApp.openById(src_id);
  var dev_dest_id = "155iI_z7IuBsjodEWBPFPgzW9QcbiwYqA3yrI8BP55-w";
  var dest_id = "1D3OEcKrRIWpJmopP07u-KWh6sQHae2Q3dSTzo6uMFVc";
  
  if (testing) {
    dest_id = dev_dest_id; 
  }
  Logger.log('dest_id: ' + dest);
  
  // copy cells
  var cells = src.getRange("A1:D").getValues();  
  Logger.log(cells);
  
  var dest = SpreadsheetApp.openById(dest_id);
  Logger.log(dest.getName());

  var sheets = dest.getSheets();
  var sheet = dest.setActiveSheet(sheets[0]);

  // paste cells
  sheet.getRange(1, 1, cells.length, cells[0].length).setValues(cells);
}


function test_killSheets() {
  var lisa = "1-L0dJ5d0ZE3QaVtR-6dTlAJVLVvc4cgWb_Twu5Zby-A"; 
  var ss = SpreadsheetApp.openById(lisa);
  killSheets(ss, [/.*_backup/]);
}

function killUnwantedPortfolioSheets() {
  var students = getStudents();
  for (var i=0; i<students.length; i++) {
    var ss = SpreadsheetApp.openById(students[i].fileid);
    console.warn("[%s] Checking for unwanted sheets to kill", students[i].fullname);
    killSheets(ss, [/.*_backup/, /English L/, /English Li/]);
    //if (i > 2) break;
  }
}

function killSheets(ss, killPatterns) {
  if (killPatterns === undefined) {
    return;
  }
  
  var sheets = ss.getSheets();
  // kill all the sheets we DON'T want any more
  sheets.forEach(function (s, i) {
    var sheetName = s.getName();
    
    killPatterns.forEach(function (pattern, j) {
      
      if(sheetName.match(pattern) ) {
        ss.deleteSheet(s);  // UNCOMMENT THIS LINE TO USE
        console.log ("[%s] '%s' found in sheetName '%s', killing", ss.getName(), pattern, sheetName);
        
      } else {
        // Logger.log ("'%s' not found in sheetName '%s', skipping", pattern, sheetName); 
      }
    });
  });
}


function generateAllPortfolioPDFs() {
  var students = getStudents();
  var pdfYears = ['Y10'];
  
  for (var s = 0; s < students.length; s++) {
    //if (s > 5) break;
    
    var student = students[s];
    
    // if (student.firstname != "Hahun") continue;
    
    var skipPDF = pdfYears.indexOf(student.year) == -1;
    if (skipPDF) {
      console.log("Skipping PDF export for %s in %s", student.fullname, student.year);
      continue;
    }
    console.log("Export PDF for %s", student.fullname); 
    var pf = SpreadsheetApp.openById(student.fileid);

    createPdf(pf, student.guardianemail, [/^Admin$/, /.*_backup/], [/^Admin$/]);
  }
  
}

function test_createPdf() {
  var student = getStudentByEmail("tom.kershaw@students.hope.edu.kh"); 
  var pf = SpreadsheetApp.openById(student.fileid);

  Logger.log(pf.getName());

  createPdf(pf, student.guardianemail, [/^Admin$/, /.*_backup/], [/^Admin$/]);
}

function createPdf(ss, guardianEmail, hideBeforePatterns, showAfterPatterns) {
  if (hideBeforePatterns === undefined) {
    hideBeforePatterns = [];
  }
  if (showAfterPatterns === undefined) {
    showAfterPatterns = [];
  }
  
  var sheets = ss.getSheets();
  
  // hide all the sheets we DON'T want in the export
  sheets.forEach(function (s, i) {
    var sheetName = s.getName();
    
    hideBeforePatterns.forEach(function (pattern, j) {
      
      if(sheetName.match(pattern) ) {
        s.hideSheet();
        //Logger.log ("'%s' found in sheetName '%s', hiding", 
        //            pattern, sheetName);
      } else {
        //Logger.log ("'%s' not found in sheetName '%s', skipping", 
        //            pattern, sheetName); 
      }
    });
  });
  
  Logger.log("Export the PDF!");
  
  // savePDFs( ss, optSheetName , optOutputName, optEmail );

  savePDF( ss, guardianEmail );
  
  // show all the sheets we want visible again after PDFing
  sheets.forEach(function (s, i) {
    var sheetName = s.getName();
    
    showAfterPatterns.forEach(function (pattern, j) {
      if(sheetName.match(pattern)) {
        s.showSheet();
        //Logger.log ("'%s' found in sheetName '%s', showing", pattern, sheetName);
      } else {
        //Logger.log ("'%s' not found in sheetName '%s', skipping", pattern, sheetName);
      }
    });
  });
}


function savePDF( ss, optEmail) {
  var outputName = ss.getName(); 
  console.log("Exporting PDF %s", outputName);
  
  // Get folder containing spreadsheet, for later export
  var parents = DriveApp.getFileById(ss.getId()).getParents();
  if (parents.hasNext()) {
    var folder = parents.next();
  }
  else {
    folder = DriveApp.getRootFolder();
  }

  var url_base = ss.getUrl().replace(/edit$/,'');

  //additional parameters for exporting the sheet as a pdf
  var url_ext = 'export?exportFormat=pdf&format=pdf'   //export as pdf

      // Print either the entire Spreadsheet or the specified sheet if optSheetId is provided
      + '&id=' + ss.getId()      // Print either the entire Spreadsheet or the specified sheet if optSheetId is provided
      // following parameters are optional...
      + '&size=a4'          // paper size WAS letter
      + '&portrait=false'   // orientation, false for landscape WAS true
      + '&scale=4'          //1= Normal 100% / 2= Fit to width / 3= Fit to height / 4= Fit to Page
      //+ '&fitw=true'       // fit to width, false for actual size WAS true
      + '&sheetnames=false&printtitle=false&pagenumbers=false'  //hide optional headers and footers
      + '&gridlines=false'  // hide gridlines
      + '&fzr=false';       // do not repeat row headers (frozen rows) on each page

  /*
  &format=pdf                   //export format
  &size=a4                      //A3/A4/A5/B4/B5/letter/tabloid/legal/statement/executive/folio
  &portrait=false               //true= Potrait / false= Landscape
  &scale=1                      //1= Normal 100% / 2= Fit to width / 3= Fit to height / 4= Fit to Page
  &top_margin=0.00              //All four margins must be set!
  &bottom_margin=0.00           //All four margins must be set!
  &left_margin=0.00             //All four margins must be set!
  &right_margin=0.00            //All four margins must be set!
  &gridlines=false              //true/false
  &printnotes=false             //true/false
  &pageorder=2                  //1= Down, then over / 2= Over, then down
  &horizontal_alignment=CENTER  //LEFT/CENTER/RIGHT
  &vertical_alignment=TOP       //TOP/MIDDLE/BOTTOM
  &printtitle=false             //true/false
  &sheetnames=false             //true/false
  &fzr=false                    //true/false
  &fzc=false                    //true/false
  &attachment=false             //true/false
  */
  var options = {
    headers: {
      'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken(),
    }
  }
  var response = UrlFetchApp.fetch(url_base + url_ext, options);
  var blob = response.getBlob().setName((outputName)+ '.pdf');
  folder.createFile(blob);
  
  if (optEmail) {
    GmailApp.sendEmail(optEmail, "School Report for " + outputName, "Dear Parents,\nPlease contact the subject teacher if you have subject specific questions.\n\nWarm regards,\nMongkul\nPA to the Principal.", {attachments:blob});
  }
} 



// [START reportbooks_export_grades_page_to_pdf]
/**
 * Export a PDF of the Grades tab for each Sheet in Reportbooks folder.
 * @param {string} folderId The folder ID to save PDFs into.
 */
function exportGradesToPDF(srcFolderId, sheetName, destFolderId) {
  // var srcFiles = listFiles(srcFolderId);
  var srcFileIds = [
    //'1KeLj6BLp_-_sJZ5FUtuR477C9N9Do1audaQ_Py73iI0',
    //'1La0LBYqGgeHLB0ABaCf3KeGtEjdFeirJzi2T3xD1EJo',
    //'1FHNn2CbsB7ozBsTzIqjU94YxevRM-5O2yx-fUnAb1Fk',
    '1UV9BysLHpyz4_ycPaV9QO1LxumJYW02umDGQXU2RG-s'];
  
  var studentNames = [
      'Shaleem Abid',
      'Elizabeth Jayne Bennett',
      'Lily Blair',
      'Abigail Bryce',
      ];
    
  for (var i in srcFileIds) { // filesInReportbookFolder) {
    var id = srcFileIds[i];
    var file = DriveApp.getFileById(id);
    Logger.log (file.getName());
    var ss = SpreadsheetApp.open(file);
    
    createPdf(ss, 2, studentNames);
  }   
};
// [END apps_script_sheets_write_range]


function exportStudentsToPDF(sourceFolder, sheetName, folderId) {
  // var filesInReportbookFolder = list of files in Reportbooks folder;
  // 
  // foreach (rb in filesInReportbookFolder) {
  //   open rb;
  //   var studentNames = get list of names from grades tab
  //   foreach (rb in studentNames) {
  //     showSheets(["Individual Report"]);
  //     exportToPDF();
  //     showSheets([]);
  //   }
  // }
};



function ExportStudents() {
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


// new wrapper - TODO???
function updateTracker() {
  // var filesInRBFolder = list of files in Reportbooks folder
  // var sharedRBs = list of files containing 'Reportbooks', owner != 'Klaus'
  // foreach (rb in sharedRBs) {
  //   if (rb not in fileInRBFolder) {
  //     moveFile(rb, rbFolder);
  //   }
  // }
}




// Log the name of every file in the user's Drive.
function listMatchingFiles() {
  var files = DriveApp.searchFiles('title contains "Reportbook"');
  while (files.hasNext()) {
    var file = files.next();
    Logger.log(file.getName());
  }
}

function moveSharedReportbooks() {
  var destFolder = DriveApp.getFolderById(folderRB); 
  var destFolderName = destFolder.getName();
  
  var matches = sharedWithMe('reportbook');
  var fileId, file, name, owner; 
  var parents, parent, alreadyInRBFolder;
  var movedFiles = [];
  var trackerRBs = getRbIds();
  
  for (var i in matches) {
    if (i > 10) break;
    
    fileId = matches[i];
    Logger.log(DriveApp.getFileById(fileId) + ": " + trackerRBs.indexOf(fileId));
    if (typeof fileId != 'undefined' && trackerRBs.indexOf(fileId) == -1) {
      file = DriveApp.getFileById(fileId);
      name = file.getName();
      owner = file.getOwner().getName()
      
      Logger.log("Checking " + name + " owned by " + owner);
  
      if (owner != klaus.name) {
          Logger.log("Moving " + name);
          destFolder.addFile(file);
          movedFiles.push(file);
        
      }
    }
  }
  return movedFiles;
}

function sharedWithMe(s) {
  var files = DriveApp.searchFiles(
    'sharedWithMe');
  var word = s.toLowerCase();
  var matches = [];
  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    if (typeof file != 'undefined' && name.toLowerCase().indexOf(word) > -1) {
      matches.push(file.getId());
    }
  }
  return matches;
}


// Log the name of every folder in the user's Drive.
function listFolders() {
  var folders = DriveApp.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    Logger.log(folder.getName());
  }
}

// sort by columns
function Comparator(arrayA, arrayB) {
  var sort1 = 3;
  var sort2 = 1;
  
  if (arrayA[sort1] < arrayB[sort1]) return -1;
  if (arrayA[sort1] > arrayB[sort1]) return 1;
  
  // sort1 = same
  if (arrayA[sort2] < arrayB[sort2]) return -1;
  if (arrayA[sort2] > arrayB[sort2]) return 1;
  
  // both columns match (same same)
  return 0;
}






