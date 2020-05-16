function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Reports')
        .addItem("Export All Students", "ExportStudents")
        .addItem("Export Current Student", "export_pdf")
        .addToUi()
}

/**
 * Creates a trigger for when a spreadsheet opens.
 */
function createSpreadsheetOpenTrigger() {
  var ss = SpreadsheetApp.openById(top.FILES.RBTRACKER);
  ScriptApp.newTrigger('myFunction')
      .forSpreadsheet(ss)
      .onOpen()
      .create();
}

//function onOpen() {
//  var ui = SpreadsheetApp.getUi();
//  // Or DocumentApp or FormApp.
//  ui.createMenu('Custom Menu')
//      .addItem('First item', 'menuItem1')
//      .addSeparator()
//      .addSubMenu(ui.createMenu('Sub-menu')
//          .addItem('Second item', 'menuItem2'))
//      .addToUi();
//}
//
//function menuItem1() {
//  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
//     .alert('You clicked the first menu item!');
//}
//
//function menuItem2() {
//  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
//     .alert('You clicked the second menu item!');
//}