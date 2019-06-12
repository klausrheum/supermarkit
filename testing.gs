function myFunction() {
  var selection = SpreadsheetApp.getActiveSheet().getSelection();
  //SpreadsheetApp.getUi().alert(currentRange);
  //Logger.log('Active Sheet: ' + selection.getActiveSheet().getName());
  // Current Cell: D1
  //Logger.log('Current Cell: ' + selection.getCurrentCell().getA1Notation());
  // Active Range: D1:E4
  //Logger.log('Active Range: ' + selection.getActiveRange().getA1Notation());
  // Active Ranges: A1:B4, D1:E4
  
  // returns either a list of ranges, or a single range
  var activeRangeList = selection.getActiveRangeList();
  Logger.log (typeof(activeRangeList));
}
