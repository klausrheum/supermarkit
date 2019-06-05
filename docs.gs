// docs.gs =====================================================
// idea for copying data to a Google Doc rather than a Sheet,
// but doesn't look like this will be necessary (export to PDF)
// =============================================================


function createDoc(studentEmail) {
  var doc = DocumentApp.create(studentEmail);
  Logger.log(doc.getUrl());
  Logger.log(doc.getId());
}

function createDemoDoc() {
  createDoc();
}


function openDoc(docId) {
  var doc = DocumentApp.openById(docId);
}

function openDemoDoc() {
  openDoc(demoDocId);
}

function copyToTable(ssId, studentName) {
 var ss = DocumentApp.openById(ssId);
}

var demoEmail = "john.chung@students.hope.edu.kh";
var demoName = "John Chung";
var demoDocId = "1tDyQaxej77DlwmimdHoxY4Gn_daiavs09KyMM6Mq3nw";
var demoSsId = "1UV9BysLHpyz4_ycPaV9QO1LxumJYW02umDGQXU2RG-s";

// copyToTable(demoSsId, demoName);
