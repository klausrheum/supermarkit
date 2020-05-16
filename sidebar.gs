function myFunction() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  //var ict07 = "1UV9BysLHpyz4_ycPaV9QO1LxumJYW02umDGQXU2RG-s";
  //ss = SpreadsheetApp.openById(ict07);
  var sheet = ss.getActiveSheet();
  
  var html = HtmlService.createHtmlOutput("<b>Hello World</b>");
  SpreadsheetApp.getUi().showSidebar(html);
  
}
