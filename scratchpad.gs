function falsey() {
  // falsy values
  if (false) Logger.log("True!");
  if (null) Logger.log("True!");
  if (undefined) Logger.log("True!");
  if (0) Logger.log("True!");
  if (NaN) Logger.log("True!");
  if ('') Logger.log("True!");
  if ("") Logger.log("True!");
  if ([]) Logger.log("Empty array => true!");
  if ({}) Logger.log("Empty object => true!");
  
  student = {}
  Logger.log(! student.email);
}



function checkBackup(tabName) {
  return tabName.indexOf("_backup") == -1;
}

function filterList() {
  var tabs = ["fish_backup", "loaf", "cow_backup", "pig"];
  Logger.log(tabs.filter(checkBackup));
}

// Old scale: SCI Y07 Reportbook - done
// Old scale: MAT Y06 Reportbook - done
// Old scale: ENG A 2018 Y07 Reportbook - done
// Old scale: DRA Y06 Reportbook - done
// Old scale: DRA Y07 Reportbook - done
// Old scale: DRA Y08 Reportbook - done
// Old scale: DRA Y09 Reportbook - done
// Old scale: MAT SL Y12 Reportbook
// Old scale: PED Y06 Reportbook - done
// Old scale: PED Y08 Reportbook
// Old scale: PED Y09 Reportbook
// Old scale: PED Y10 Reportbook
// Old scale: ENG IB A 2018-20 Y11 Reportbook
// Old scale: ENG IB A 2019-20 Y12 Reportbook
// Old scale: MUS Y06 Reportbook
// Old scale: MUS Y07 Reportbook
// Old scale: CPE Y10 Reportbook

//function dataValidationTest() {
//  var aaa = "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y";
//  // Set the data-validation rule for cell A3 to require a value from B1:B10.
//  var ss = SpreadsheetApp.openById(aaa);
//  var sheet = ss.getSheetByName("Grades");
//  var cell = sheet.getRange('A3');
//  var valuesRange = sheet.getRange('D7:D33');
//  var namesValidation = SpreadsheetApp
//  .newDataValidation()
//  .requireValueInRange(valuesRange)
//  .build();
//
//  var checkboxValidation = SpreadsheetApp
//  .newDataValidation()
//  .requireCheckbox("Y", "N")
//  .build();
//
//  cell.setDataValidation(namesValidation); 
//  sheet.getRange("AB7:AB").setDataValidation(checkboxValidation); 
//}
//
//

