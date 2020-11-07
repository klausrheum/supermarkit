// files.gs ====================================================
// imports files newly shared to Klaus, adds them to the tracker (replaced by Import Courses)
// killByName for removing duplicate/broken Portfolio sheets
// exports finished portfolios to pdf & emails
// =============================================================

function killByName() {
  /*
  WHAT: Remove bad / misnamed / duplicate sheets matched by killPatterns in Portfolios ticked for 'Export'
  WHY1: When the exportAll script copies the SUB sheet to a Portfolio, it then
        tries to rename it. If the name already exists, you'll be left with 'Copy of SUB'
  WHY2: If a teacher changes the name of the subject in the Overview tab of their Reportbook
        AFTER the tabs have been generated, you'll end up with two near-identical tabs.
        
  HOW:  Enter the name of the unwanted tab in the killPatterns regex. If you don't understand regex, go learn, I'll wait.
        Patterns are case-sensitive, so 'art' will match '' but not 'Art'
        To lock to the start of the sheetname, put ^ at the beginning, eg /^IGCSE/ will kill any sheet starting with 'IGCSE'
        To lock to the end of the sheetname, put $ at the end, eg /HL$/ will kill all sheets ending with 'HL'
        
        Unless locked, patterns will match ANYWHERE in the sheet name, so 
        /Art/ will match 'Visual Arts', but /Visual Art$/ won't
        /Theory/ will match 'IB Theory of Knowledge', but /^Theory/ won't
        
  */
  
  // Test your regex before deploying! https://regex101.com/r/PjK1bJ/1
  
  logMe("START killByName()");
  
  // kill everything except Admin & Pastoral
  var managers = ["Cheryl", "Mike", "Cath", "Eric"];
  
  var keepPatterns = [/(Admin|Pastoral)/];
  var killPatterns = [/(^Copy of SUB|Subject Year 00|Select a student)/];
  
  var forReal = true; // set true to actually delete the sheets matched, false to view them
  
  return keepKillPortfolioSheets(keepPatterns, killPatterns, forReal);  
  logMe("END killByName()");
}


function keepAdminPastoralKillAllSubjects() {
  console.log("START keepAdminPastoralKillAllSubjects()");
  
  // kill everything except Admin & Pastoral
  var keepPatterns = [/(Admin|Pastoral)/];
  var killPatterns = [/.*/];
  var forReal = false; // set true to actually delete the sheets matched, false to view them
  
  return keepKillPortfolioSheets(keepPatterns, killPatterns, forReal);
}

function keepKillPortfolioSheets(keepPatterns, killPatterns, forReal) {
  if (forReal === undefined) {
    forReal = false;
  }
  
  //logMe("START keepKillPortfolioSheets keep: " + keepPatterns + ", kill: " + killPatterns + " forReal: " + forReal);
  
  var students = getStudents();
  var selectedStudentEmails = getEmailsToUpdate();
  
  var sheetsKilled = [];
  
  for (var i = 0; i < students.length; i++) {
    if (selectedStudentEmails.indexOf( students[i].email ) == -1) continue;

    var ss = SpreadsheetApp.openById( students[i].fileid );
    console.warn("[%s] Checking for unwanted sheets to kill", students[i].fullname);
    
    console.warn("keepSheets: %s, killSheets:", keepPatterns, killPatterns);
    var thisSheetKills = keepKillSheets(ss, keepPatterns, killPatterns, forReal);
    
    // is this sheet in the 'killed' list?
    thisSheetKills.forEach(function (sheetName, j) {
      if (sheetsKilled.indexOf(sheetName) == -1) {
        sheetsKilled.push(sheetName);
      }
    });
    grabPortfolioTabsAndGrades(students[i]);
  }
  if (sheetsKilled.length == 0) {
    logMe("SUMMARY: No sheets deleted.");
  } else {
    if (forReal) {
      logMe("SUMMARY: deleted " + sheetsKilled.join(", "));
    } else {
      logMe("SUMMARY: found " + sheetsKilled.join(", "));
    }
  }
  console.log("END keepKillPortfolioSheets()");
  
  return sheetsKilled;
}


function TEST_keepKillSheets() {
  console.log("TEST_keepKillSheets()");
  
  var lisa = "1sS-WJZI3uBvQCx396gQPJNoxok9i9OERAFm8OSqohqg"; 
  var ss = SpreadsheetApp.openById(lisa);
  var forReal = false;
  
  keepKillSheets(ss, [/.*_backup/], forReal); // incorrect parameters, should fail
  keepKillSheets(ss, [/(Admin|Pastoral)/], [/.*/], forReal); // correct parameters, should pass
  
  console.log("END TEST_keepKillSheets()");

}


function keepKillSheets(ss, keepPatterns, killPatterns, forReal) {
  if (keepPatterns === undefined || killPatterns === undefined) {
    console.error("keepKillSheets called with incorrect parameters - aborted");
    return false;
  }
  
  if (forReal === undefined) {
    forReal = false; 
  }
  
  var sheets = ss.getSheets();
  
  var sheetsKilled = [];
  
  // kill all the sheets we DON'T want, unless they match keepPatterns
  sheets.forEach(function (s, i) {
    var sheetName = s.getName();
    var keep = false;
    var kill = false; 
    
    keepPatterns.forEach(function (pattern, j) {
      
      if(sheetName.match(pattern) ) {
        keep = true;
        console.log ("[%s] '%s' found in sheetName '%s', adding KEEP tag", ss.getName(), pattern, sheetName);
        
      } else {
        console.log ("'%s' not found in sheetName '%s', no KEEP tag", pattern, sheetName); 
      }
    });
    
    if (! keep) {
    
      killPatterns.forEach(function (pattern, j) {
        
        if(sheetName.match(pattern) ) {
          kill = true;
          console.log ("'%s' found in sheetName '%s', adding KILL tag", pattern, sheetName); 
        } else {
          console.log ("'%s' not found in sheetName '%s', no KILL tag", pattern, sheetName); 
        }
        
      });
    }
    
    if (kill && ! keep) {
      sheetsKilled.push(sheetName);
      
      if (forReal) {
        ss.deleteSheet(s);  // (UN) COMMENT THIS LINE TO (USE) TEST
        logMe ("DELETED sheet " + sheetName + " in file " + ss.getName());
      } else {
        logMe ("FOUND sheet " + sheetName + " in file " + ss.getName()); 
      }
    }
    
  });
  
  return sheetsKilled;
}




/**
 * Generate PDFs from Portfolios 
 * @param {string} rbTrackerId
 * @return {array} list of created rbIds
 */
function generateSelectedPortfolioPDFs(sendEmails) {
  if (sendEmails === undefined) {
    sendEmails = false;
  }

  logMe("START generateAllPortfolioPDFs()", 'warn');
  
  var students = getStudents();  
  var selectedStudentEmails = getEmailsToUpdate();  

  //var pdfYears = ['Y10','Y12'];
  var countOfPdfs = 0;
  
  for (var s = 0; s < students.length; s++) {
    if (countOfPdfs > 1) break; // SAFETY CATCH
    
    var student = students[s];
    if (selectedStudentEmails.indexOf(student.email) > -1) {
      Logger.log(student.year);
      
      // if (student.firstname == "Hahun") continue;
      
      logMe("PDF: Exporting " + student.fullname); 
      var pf = SpreadsheetApp.openById(student.fileid);
      
      var guardianEmail = sendEmails ? student.guardianemail : "";
      
      createPdf(pf, guardianEmail, [/^Admin$/, /.*_backup/], [/^Admin$/]);
    }
  }
  logMe("END generateAllPortfolioPDFs()", 'warn');
}

function test_createPdf() {
  var student = getStudentByEmail("tom.kershaw@students.hope.edu.kh"); 
  var pf = SpreadsheetApp.openById(student.fileid);

  Logger.log(pf.getName());

  createPdf(pf, student.guardianemail, [/^Admin$/, /.*_backup/], [/^Admin$/]);
}

/**
 * Generate a PDF from a Portfolio, optionally emailing to guardian 
 * @param {object} ss reference to portfolio
 * @param {string} [guardianEmail]
 * @return {array} [hideBeforePatterns] list of sheet names that should be hidden prior to PDFing (regex patterns)
 * @return {array} [showAfterPatterns]  list of sheet names that should be shown again after PDFing (regex patterns)
 * @return {} doesn't return anything (but probably should!)
 */
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
  logMe("Exporting PDF " + outputName);
  
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
    logMe("Guardian email: " + optEmail); 

    console.log("Sending email");
    var body = "Dear Parents,\nPlease find attached your child's report. Please contact the subject teacher if you have subject-specific questions.\n\nWarm regards,\nSecondary Principal.";
    
    //body = "Dear Parents,\nPlease find attached an UPDATED version of your child's report. A geography score had been omitted.\n\nWarm regards,\nMongkul\nPA to the Principal.";

    GmailApp.sendEmail(optEmail, "School Report for " + outputName, body, {attachments:blob});
  } else {
    console.log("Skipping email");
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

function TEST_listFolderIds() {
  var rbFolder = "1SsaWNoBpdX0y5yyJtETU1xEzkpYfX18l";
  Logger.log(listFolderIds(rbFolder));
}

function TEST_listFolderNames() {
  var rbFolder = "1SsaWNoBpdX0y5yyJtETU1xEzkpYfX18l";
  Logger.log(listFolderNames(rbFolder));
}

function TEST_listFolderNamesMyDrive() {
  // no folderId should list files in My Drive
  Logger.log(listFolderNames());
}

function listFolderIds(folderId) {
  return listFolderIdsAndNames(folderId)["ids"];
}

function listFolderNames(folderId) {
  return listFolderIdsAndNames(folderId)["names"];
}

// Log the name of every folder in the user's Drive.
function listFolderIdsAndNames(folderId) {
  var folderIds = [];
  var folderNames = [];
  
  var folders;
  if (! folderId) {
    folders = DriveApp.getFolders();
  } else {
    folders = DriveApp.getFolderById(folderId).getFolders();
  }
  
  while (folders.hasNext()) {
    var folder = folders.next();
    folderIds.push(folder.getId());
    var folderName = folder.getName();
    //Logger.log(folderName);
    folderNames.push(folderName);
  }
  return {"ids": folderIds, "names": folderNames};
}

function copyFolder(srcFolderId, dstFolderId) {
  var srcFolder = DriveApp.getFolderById(srcFolderId);
  var dstFolder = DriveApp.getFolderById(dstFolderId);
  var files = srcFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var f = file.makeCopy(dstFolder);
    if (file.getMimeType() == MimeType.GOOGLE_APPS_SCRIPT) {
      Drive.Files.update({"parents": [{"id": dstFolderId}]}, f.getId());
    }
  }
}

function run() {
  var srcFolderId = "### folder ID with source files ###";
  var dstFolderId = "### destination folder ID ###";
  copyFolder(srcFolderId, dstFolderId);
}



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


