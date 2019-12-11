// updater.gs ==================================================
// 1. add columns to teacher RBs (Comments, Date, Tabs, ExportYN
// 2. update formulas in teacher RBs and student portfolios
// =============================================================



function updateReportbooks() {
  var makeChanges = false; // if false, just log mismatch
  
  logMe("START: Pre-check Reportbooks");
  
  var rbRows = getRbRows();
  
  for (var row = 0; row < rbRows.length; row++) {
    var rbRow = rbRows[row];
    var id = rbRow.rbId;
    var geo2019sl = "1HV01YukUG42Gytg1Ve6fO1veFSudRCdKsU0Q9ph6_Xw";
    
    // skip empty rbIds
    if (! id || id.length < 2) { 
      continue;
    }
    
    logMe("UPDATE: " + rbRow.courseName);

    // SAFETY CATCH =============================
    
    //if (row > 10) break; // stop after 10 reportbooks
    
    // END SAFETY CATCH =========================
    
    var ss = SpreadsheetApp.openById(id);
    //logMe("Updating " + ss.getName() );
    var rbSubject = rbRow["Subject Name in Report"];
    var rbTeacher = rbRow["ownerName"];
    
    var overviewSubjectTeacher = ss.getSheetByName(top.SHEETS.OVERVIEW)
    .getRange("B1:B2").getValues();
    var overviewSubject = overviewSubjectTeacher[0][0];
    var overviewTeacher = overviewSubjectTeacher[1][0];
    
    console.log( "fileName: %s", ss.getName() );
    var updateMeta = false;
    if (rbSubject != overviewSubject) {
      updateMeta = true;
      logMe("WARN: Mismatched SUBJECT: Overview=" + overviewSubject + " but Reportbook=" + rbSubject + ' in ' + ss.getName(), 'warn');
    }
    if (rbTeacher != overviewTeacher) {
      updateMeta = true;
      logMe("WARN: Mismatched TEACHER: Overview=" + overviewTeacher + " but Reportbook=" + rbTeacher + ' in ' + ss.getName(), 'warn');
    }
    
    if (makeChanges && updateMeta) {
      // FIXME: Need to pull subjectName, teacherName from Reportbooks tab
      updateReportbookMetadata(id, rbSubject, rbTeacher);
    }
    
    //    updateCommentsColumn(ss);
    //    updateExportColumns(ss);
    //    updateFreezeRows(ss);
    updateRBFormulas(ss);
    updateIBPercentages(ss);
    //    updateDeleteUnusedDatesAndTitles(ss);
    //updateGradeScale(ss);
    //updateConditionalFormatting(ss); // doesn't work in this scope :(
    
    //   sheet(report)
    //     // display comment
    //     .insertFormula(I4, 
    //      =iferror(index(Grades!$D$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0),22),"")
    //     .chartType(scatter)
    //     .trendLines(false)
    
    Utilities.sleep(1000);
  }
}

function TEST_updateIBPercentages() {
  var id = '1AkMktNVONfzThEL69Uxed7RKJwCDaLCirUVXHmJ0rdM';
  var ss = SpreadsheetApp.openById(id);
  updateIBPercentages(ss);
}

function updateIBPercentages(ss) {
 var sheet = ss.getSheetByName(top.SHEETS.INDREP);
  sheet.getRange("D7:D11")
  .setNumberFormat('#');
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

function formatIds() {
  var ids = [
    "1Dg5XAajl09uAnt0ijwPf2NJ-M58N7ZfUuxpq6l4n5L4",
    "1ePg0Ng5nA7MQEx1uFFr8CFnmRqy7jpjYBdqRZr5Y2b8",
    "1AkMktNVONfzThEL69Uxed7RKJwCDaLCirUVXHmJ0rdM",
    "1PTNjm6KTtpfhU4VN0PW1OFAsIrO-1H2GU8C1c9lYywk",
    "1OHURnCeY08ylTvgx6noktNB60BgG-5lVIh6mEqe0XMY",
    "1MSa2HJ0Ra5G1xzZ3SMXy5D2pcWgwnx37iejM6WGvD1w",
    "1lZ9VB9DRCXR3bQmJOg6NkoEU90ynXAAn5BtH25I5Wc4",
    "1vVsBjidfFYhl8pCRsrA5yiWhbq9o_Kp-Xds7rZP0Jgs",
    "1BpuffXlk0k7JlqFquOaSFliy1B_X6Elcsc5988yhYQ4",
    "1gKLRYZ7GyUKMByzsbmurg9FOLPEIZQICgYOzBCrXvYg",
    "1VbHpc06I32Rwi4L_i-M4Oe6qY0PhCuky6Y-uBoUBZj8",
    "1heCACUFeN5pG8oqnhbX64l48MJW3nonZUuVBfrGd_Gg",
    "1_G7EJoM0lAZ76P5BG1riQb6Q2bTLgN_waQmiNjkJBpE",
    "1Rsv0rDcBIYULsp-Z9T5D1bQaHS6olwZywNKE0y-ONr4",
    "1EnLA-BHOH0CIGtmbx4snrL7Bp3OhlCE6dkWH5GDe8cQ",
    "1xJ1xhyzhak5Rdgo7G3ASHIFd8nFj4oBqo2vFc9xkviI",
    "12Pke2Nd6lGE4WePMQbV5gwH4DjeBXNEbFKlG-ML4zew",
    "1Su8GKqEvYiLizuqkGV7EKKu7NhdptHSYgYPKdf597OY",
    "1vBMlQF5BzOCQJ6Xerx6QuQeYoZlt9_y7qNSmTRDeoLQ",
    "1ELqlsDKxYhR62mf2NJmPkGoMtCDe4YgiEBnl3YyzrmE",
    "1qgWSJ7zQUbBC7B51ZrMJSqVfGUk7EoopxEPXb7RQJUg",
    "105tm9zBlXMKmb_6v2HCjFhQqr3Y2DkIY5lW-_lghFtg",
    "1tLV-GFce1AxInXjxLbZZIZzeZ3e-AjIdyNMf5ZSJuFw",
    "1Myd-qZyIsJyswuDiimpfcJyvJqtJqmZkWvwhW5UcyHc",
    "1q_YG_UMAnWEdzAt9FzcOlBmRvv6qlG_6Cdxdl3mObJQ",
    "1l01bxEfdFIVL9iOlfQzRqKltqSKBqkn7VqUFpae_3QE",
    "1XmKWJNzhOjYVtZD-cAySlse8mG-WHbSt38Xbtj7ZMnI",
    "1OQddd98kHio3TstaMH406oZhRu7JVBPEWMX3PVUleDE",
    "1hyj8e6sJUGjI7XsWYJfy1XqwtcQFKy6D9c1_Xcl6G4M",
    "11-UQgxGj3dErrRIhauD2EqhkCP7Vr69ZQNc0SDd4Kqc",
    "1CFCiIXJMelLNn-K5n46D7TWDAKIspEEziikscGsQDy0",
    "1IDobHI3lWNVWRqK_W5r8IDlCXvOLkF9sQCs7gn0ebYw",
    "1h-bvvWtKa7dsrC2sTyoqKcSJ5JNpLUB6sIkpfdgL6_8",
    "1sliFwHYoZpvNfgoa0mShAv8Tsj92keRvnevw9X6gZ1g",
    "1vxxmMie8ZmN89XtYFe4TqaZ5q7NAKnmFJbDoOrhLi3Q",
    "1YNE1UF8bCm1elp3J1CjiI4DFTZ9xfCTtbtwfN8M2Deo",
    "12-12QzVR2aD4SCryro1KWnTTtT3BiKcBI-2NRnx9OEo",
    "12nSqpwnIM-sZhpbFrY5y59VKLbD9_P8naLvo-384JgQ",
    "1dfrov-kQ95WSFK4h2MpWWEW2SDeANaJRY3xQVqff43g",
    "1QUd1SKqBXaMxAnIxQzKbGrtFpzDlhnhttYyi1k6t9eY",
    "1orC9daXCToF2JKK1Q4ZEiKCsnnPvFEX4toydIcb0Z04",
    "1B8a_ZAmCWfvcDhDj7rwn20gRS5R_uAyJ6RzyA8STs6Q",
    "1eUOwzbi9QVHMblbuQhFbmqORAIoM3orfeVnXAp9A63s",
    "1YJsn2H41DFVudEcyE38N-pO_eFG6TaK8IwEl0RwzR2U",
    "1RbpI9_G8K6BO-hPtjWlCmlyMroRJzUOUxFBs37PrtQ0",
    "1eBREDsUFt6hbthRLX30Qh5JKmhxqrs_B4nstTZxCaXQ",
    "1_ryi4f6_HwGhGgcZjU_11hn2tq4t4tPwWM2UU1e8y2w",
    "19hSozeXXxsAOCQ__lwpd9mdjYpgM1V1kwHozXxPZ2bg",
    "18Yg6PQGN0viT_2c9KKipPsNH5uKWrd0leWnhfX36654",
    "1fDOMqMMHN44su_jU6EOArOlKAJvlrLaBSM0OBK3oRo0",
    "1R9bzHTtfeBSIFZx-XE-1JRYrJ2WB8nBpJgOgrtdE3dw",
    "1JNmxBFHKs_qf1Bo6I974dF-U-BsnHW6oHrXVB60bmI0",
    "1GyTkWqcgCbqRv-e_CvOK86CrkMxaybb3zSfPocCmkWo",
    "1TYGdHi11Geu_0VvjBpubgQ-MLcuQocsL1QkamRnADcc",
    "1rYkpBkFGUMOQ5OMlYkrBoQIJ07WVEf4jUXhSFdSjW68",
    "1_TrDiK38dnwcw-5R8u7ADO6VcixjTnjApb84jI3upMw",
    "1UteHHjOOFgXclmJKKkUHhRHdxtaPEnXhrP_fpqfiGUM",
    "1P9sHJrxwieVpKnk77-x3Fm8pP8Fh33fuC8PD26Gl9AM",
    "1UnzkPK_WhXRFC77tpmPK1QEEWVMk2FlDqsnKBZfBzSA",
    "1At0DbFMhbgOXXD4IQ-WIuRpEInM1ioFqh0h0mBu_l-I",
    "1KVEebER8oAGgm2dg-xX1R_MZwXN3ezi9Wl-XFsBWLAE",
    "1WuAx7FBXWH9SLbbXKH8TTPxFR2KxOWfC-NDzsl4Zc-Q",
    "1IOxK-CkdNly6bkw4s0_WAsGR_CsDd7TV2J4PPNTmNcI",
    "1MGEw3cNHkI_Sk2zGVZrAbKoyBUpnb_pAoHS955fKfdw",
    "1c1eRD45o9G_kSIMxAz-gfXeEwktp07m1aMLFF2AJlyU",
    "1Dp6qiq1KfzVzMPT2FS9Kss1qZUpoSIhpZB-KmpOh7Hw",
    "10xxuiVVV0h8WbfIDSpDh1ulkkbPsWtTTo1EKJgZQuHo",
    "109M9kXLiTXvuw3zKI6EnuPodKTM-65CBLIhfjQ8p_6Y",
    "1gh74KMqA0vepuw9mCKHGQiCQG2ki4wJS4evETMZgf6s",
    "1-Cki4SQV3RsXR3k0i_7lm_zfYPn_FT60or9PcLX5RO8",
    "1BI5nCzdF_cuUZQW0zL_7KV-GAef5_kFf58T1wZ0A_7Y",
    "1W0o-SXSnJZe7IHDSO7Y0PEMW5VS3BabQA8f-SYB3lLY",
    "1q8OlYwriKClZmi6nf1QtBGVMcml2YKF4RA68svUEpXo",
    "14lx3CwcD3wlw7rS9KmkXJ4gMSZyySxbuAEc1GiGu6AU",
    "1G2dHA9t2fcAGgjU_ecpsPsVbMLQfnCM44kFvWFde54o",
    "1HcRDVwDSrGmOit0h71A24qFyoRfgMM6kM2KrgoYUNVM",
    "1PnLQykw_wswQe1HLkPZaR7nN6otvhyto_ZWcggLjBM8",
    "1prf7pbNIJCFTi-sbad4gb3wh1a_D22FvzYs-1b07uXs",
    "1sQq2QK4F4uBKF0y-UmAcq-fXHdE1eNy9fikaCbkjMRE",
    "1CpexW5R-G0UDZCKMOdVT1w2cwQEB7wetM49C0zcQNOU",
    "1mTZ1Ak58Xgo-Iyypeok-sajvU9W8Q_JvKwVF3NEXG2o",
    "1sJPAnXv1OKG0w8FQnn4XER9YI3E5iWRpR9S__ZD2Aic",
    "1Nc26A9F5nKVQUmTHFq6Pn23zZjmIqbX-8Fp8YJ6nPvo",
    "17zZSqJvCMlKs4JUqdsXGBrDmOQ-OfarxyuG0F-K25vk",
    "1kHFmWIbGTPH2mmwwMCwZBEX_4Z78Cf-CSqVmUKCDP1o",
    "1WiHsRiuPUSFVhuEz3cj2vbFU_awDk3tA35BLVvyz59Q",
    "1qZbcmNwFR7djtlGAH5W6leke53WF26pMXUWotlh0ly4",
    "1JHU87z6shsytlNev3YzUbsSaPXstSEpKlNBQyEIaI6I",
    "1zX8HJdWzJWJD6C9T5JAOoQzcpnkIEKWjqt5UoVC9u8M",
    "1XM_0fvlecqohzyNZ5g6w4GkHWe0W9CuR6219eXkoChk",
    "1GdOqc6qQhA7xP-C2QTrEvDadGptTkWIdXOHJwuU71ws",
    "1B9XLn9qRaukUA_4M2Z-FPo5F_8UCUfPBliO8eKmV4_E",
    "1CrwCSV2m2ajtGzQyGxGmalsQ0w1-XSTQKgRUgzabpNI",
    "1S2TSufjrbLHo-RTR464wOPjpVFuMzBDPGfIt6PcoCxA",
    "1DvwTRViQpJAwBDzWEuxkXJFqw_YcRA2iHvuTfK2g_OQ",
    "1gDnV7RErgjMajU2e5xXEyeBl31LpRGRt3mrElPuOVQ8",
    "1T7elJh8wlEq42MNBmW3NR0yp4FMcPQb65HNHjDWDWA8",
    "1lPymZGlDGBTIaeAvk3qSsYxmm4WeII4vm4Ru8F5N48s",
    "1r4e7PNy6FYm6gRbtUTF1Qa0qvsYwAKyZ0idJxNHcngw",
    "1fs4wdNauQqhiK4zZH8Dbjjsi98lq_Prr-pe4Bxv0YCA",
    "1SkPn4kIPz69qQzY5N_doTGEfPv75X4CrK0YYiDhPvwI",
    "1rJ9059XlJKP2auPx9FkVG6VmVQ2PFw53w741wvjSvkA",
    "1p6eMwRFlwf8JD5FCUK1EcFGKf4-0KUOtOT5mpCl59Jk",
    "13tR62LtHfh0eKC3Hv1kRxXUTTDK1UUaLdIs6QFyVz3M",
    "1TDITg_X3pioqCiSt5dikO-Lvux2cPfpSDBQKBrGxLXw",
    "1_ThtHCMZy_RzFCjhUYJ20TUz3NKNj1KqxthhtLxCbko",
    "1jLzQwDe9AtvbZG9T0Fm2YtUonLgYsi6mVKFvcogrPAY",
    "11_AbxedbaWFThP9Y2QEdDOOqf-yipZ6p5o0tTm_2_uU",
    "1VwjqqXzSWZ6nE5BG6drhu-Q3FyQr8ZEX5_DkzmueEVM",
    "1cNZG0_ZzSIlynJJFt8D-8aDuQS4KVfxXKrL1lZl7PA8",
    "1gGxtRTsnPegsZ_-RTjcqniF5-kxzrWYTeJrwPDuoNG4",
    "1opo3DQuB-bvtjd7aOQ4FMIe0g1ix5gNIHFCz70Zvih4",
    "1rl_WwGc3lz8I0jbZWEwa3mdzgYO_IH1XmxYIRYxtycY",
    "1_rnhZI2yJidsrZGusCdojH0X6B2CLhtXhrLhfJ1A2DE",
    "1F-dTzFi-h3xhB4evmfLFPZSiVT6EaMx4ovwrO9uMu08",
    "1G0pV8WaBXgc6pkBLK_xj28gHkk8dSpy-yGuT7IgJBog",
    "1JJOoknrlhS3zz2k1gncrKv2pnYL46WkVWO203-JZFvM",
    "1-GOGtTTTTi9P3DnFSQi_bqXvzKKbqsEiWVSD6BAMP1M",
    "144hhthaxDR-ZNszaGxGk7f5tBzvGdjGpIG_bS50y2j0",
    "1CAzhqx5kEgFov8Q5wnAa9JBaehXPu1EdcIi0pRX11Zs",
    "1i5EP6iYojBAGfofNvQ9RLuX1GDrvd0sNoFAnSao8Pis",
    "1MDV8719xgbFgwehVBnvignh9sGpVm8fagmEFG0VLkt0",
    "12Yg-XcfaXRdyCsCBWc8JISDftD51_Gcl3H8jV6bLdLc",
    "1qjVP9byVILkJan1O3p3R4TZH7g0kvqEALgMxrNUgjtM",
    "1wC8K9iJsi9R93ObnoFiY5mt_rIzpbODtqt0FsHUZ1Jo",
    "1ViM1VKKIXgOTY9KwL4CXTRlWJLVXY4RGbqqsLaxD1o4",
    "1AfNzU0SwwHnnbtG9xBckDDIpDVLcX70LBBjnHpSq_A4",
    "1hTH0yXlUSopGEJ7r8I9K4hyGDieZpGdzuyQhB0m-frM",
    "1CN_mymV4eHx19or-_FZtNEn84_PhfXo10P_J_9a1B8A",
    "1-m8oIWKhsO6eji1Vws41a04o47N5J_iMDFkJNZocfXw",
    "1De3dfNykR62VU8lUP_Bl9aXN7ikU0qAAdfE-oOCDfZU",
    "1gfxFbFcxlw1ptNgMsqpoDEKESFsnh-RJOVD1gr3L_Wg",
    "1k56TmfK9s6DpMdL_L6cKkDghxZoaKcH4ljBuu4xz-0M",
    "1HVR7wKKK7PWTfIcHoK-zLofpzKr1dFFbd2LGvTTMHbg",
    "1vkg85EzsMTYvnGamgIxE2YUs3o6rrR7EdLv674Q1W80",
    "1xDVnlFwxJmsAPP10n2sEwNyTqpjy4KEN_uASWcrfY54",
    "1-zOYaDpM5TbwnZmYELh6mHP8oMxdyr_uwxZ7deEq_I8",
    "1-kWd7-t6OK1HoHWn1NLJ6I3qNf5PCeXaBdtTZHDIosI",
    "1pAxakiPL3dRgK240HF33sJbUM3OuGG3psgjhaJGuSQY",
    "1uFGX2xSFQP-auiGSa8Dy4GLXqOd1IGR9oi52O1iOrN0",
    "13oWqo2_z1jGoM6j65vyQ1B1XmNQQtUzrvuKaJQRkumI",
    "1lRPLl-GnX29ef61ZiRUZI3hu1B0DrrRvgw-6kFMe5lo",
    "1RDPaWTU1JiOKPK3VzPpOR_yMb9Wt9mj2J7PFcVGpuck",
    "1S0xCK9MMH_Azd_9N0Vv7R1KsnbQ5SHT9tW_fBh2dTiA",
    "1uyHXPVA1EhWgPtV4HSGVHQTJnK9W3cs2N9965SZPhQw",
    "1vWfvQTlw90nQ5McbeandbBAzubVeHFD8DZBpfjUGDAY",
    "1xfsIpms3QDMu5XeywYHoLgqgFjx_nQtH4axO72CWRYE",
    "1y5mTAThIblZ8PM5op9M6LkwbeAtmT59tmXjk-0_fdPQ",
    "1arixKt0wJvs5I6NAbcjcQBmeMe4Tla9XBEuVPFObKLQ",
    "1XQeyEsrm160W_YYbOHhwq_o5TmDCPRE0zbn7pn3-Fg4",
    "1Pyx69dVaj6FgZTf22YDabNxnXNJvR-Tpb-Wycmyv-dw",
    "1ti-bn5ZIu3ZJQjm5jvqsT-O_o0cKqhmcZZEvd6uP5yQ",
    "10fvIHaRNEf2LWOcx41pg6aSgMk8Dj6QEk79FJ91TDY4",
    "1QW-UmSd5s0rwm07MQXkzK9yBkxLBaZNgKSC0w3J-n0E",
    "1Ur4xiKOT034i-GvpGeSlXOERgJQ1V806Bwm_JfVs6Cc",
    "1NGiythwrjMsg0xhASPf_gRq0xjgD09GI1VrTh4LfC0c",
    "1kp9hKGWQGQGlnodb1gvJ61GdUsEhv_6nUA2kyADGb8I",
    "1MKax2ZtcWOhhuT4zpxKqOXAndIZ8KzWUevgvHiZi1kk",
    "19qPRIrnpuF73Zpf0H0Jcu79U1ge4o__TVatYtvTXDEA",
    "1GNResG8plq4fOhy5PUiZsYQsDRiy8zl2OPn6cf6RNP8",
    "1t-Fofa-4-VtOT91cYCQ6G5lyRVWntX9mVErp11DxGH0",
    "1EgsM0bdLI0BfT_dLxvE4QJAKy5bSWn0qo-FtM0CSxw8",
    "1Eo81uC_nxGxaltLk2m9c_EnL6r8Toj2hPnlT2JZTcN4",
    "1LsqfKlg0ZQUtgVDvtdMoo_26LgnW8iiWvmoSNtCHa3E",
    "1UIEIAA5uDhOZKANdHMtKyZ6Zn1yuBXw2nYZqwQ_uqeg",
    "1z3AjmCEi1M4F9zyhYg0HfxlF7_YZuc_CXt9nr0txbeo",
    "10pcHKnmwPsVw-pFK7Rx8PCrDCv5eV7e1s1QxBwJOEK0",
    "1a0iTzX_alknhxjTwZcVJCgXCrLx2h3Q8nRGxTh18FEw",
    "1dHXH95BUJ-cv43d90MTHrqgdl_i8pMnM9s_UeAvni4c"
    ];

  for (var i=0; i<ids.length; i++) {
    id = ids[i];
    var ss = SpreadsheetApp.openById(id);
    updateConditionalFormatting(ss);
   // if (i > 2) break;
  };
}

function updateConditionalFormatting(ss) {
  var sheet = ss.getSheetByName("Grades");
  var rules = sheet.getConditionalFormatRules();
  while (rules.length > 0) {
    Logger.log(rules);
    rules.pop();
  }
  
  // color title cells
  // if they are REP okay
  var range = sheet.getRange("H3:W3");
 
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=regexmatch(H3, " REP[0-9% ]*\\z")')
  .setBackground("#33691e")
  .setFontColor("#FFFFFF")
  .setRanges([range])
  .build();
  rules.push(rule);

  // color extracted REP cells (top row)
  var range = sheet.getRange("H1:W1");
 
  // if title is blank, make REP fg=bg
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=isblank(H3)')
  .setBackground("#2a3990")
  .setFontColor("#2a3990")
  .setRanges([range])
  .build();
  rules.push(rule);
  
  // if class avg is blank, make REP bg grey
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=isblank(H6)')
  .setBackground("#666666")
  .setFontColor("#FFFFFF")
  .setRanges([range])
  .build();
  rules.push(rule);

  
  // Adds conditional format rules to the Grades sheet 
  // that causes imported grades to turn different colors
  // if they satisfy A/B/C/D/E conditions based on 
  // the thresholds in the Overview sheet 
  var range = sheet.getRange("H7:W45");

  // 0 (red)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=if(isnumber(H7), H7/H$4 = 0, "")')
  .setBackground("#FF0000")
  .setFontColor("#FFFFFF")
  .setRanges([range])
  .build();
  rules.push(rule);

  // Missing (grey)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=isblank(H7)')
  .setBackground("#d9d9d9")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);

  // A (dark green)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=(H7/H$4 >= indirect("Overview!B10")/100)')
  .setBackground("#6aa84f")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // B (light green)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 >= indirect("Overview!B13")/100')
  .setBackground("#b6d7a8")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // C (light yellow)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 >= indirect("Overview!B16")/100')
  .setBackground("#fff2cc")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // D (light orange)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 >= indirect("Overview!B19")/100')
  .setBackground("#f9cb9c")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // E (salmon)
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=H7/H$4 < indirect("Overview!B19")/100')
  .setBackground("#ea9999")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  // color alternate lines grey
  var range = sheet.getRange("H1:W1");
  
  var rule = SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=iseven(row())')
  .setBackground("#f9f9f9")
  .setFontColor("#000000")
  .setRanges([range])
  .build();  
  rules.push(rule);
  
  sheet.setConditionalFormatRules(rules);
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
      //Logger.log("Checking cell["+r+"]["+c+"]=" + cellValue);
      for (var v = 0; v < oldValues.length; v++) {
        if (cellValue == oldValues[v]) {
          data[r][c] = newValues[v];
          //Logger.log("Updated cellValue from " + oldValues[v] + " to " + newValues[v]);
        }
      }
    }
  }
  sheet.getRange(rangeA1).setValues(data);
}



function test_updatePortfolios() {
  // convert the attributes table to full sentences
  var testEmail;
  testEmail = "bobby.tables@students.hope.edu.kh";
  testEmail = "johannes.christensen@students.hope.edu.kh";
  testEmail = "tom.kershaw@students.hope.edu.kh";
  var student = getStudentByEmail(testEmail);
  var pf = SpreadsheetApp.openById(student.fileid);
  updatePortfolioMergeAndWrapExtraCurricular(pf);
}



function updateAllPortfolios() {
  
  var students = getStudents();
  for (var s = 0; s < students.length; s++) {
    // if (s > 3) break;
    
    var student = students[s];
    logMe("UPDATE: Tidying Portfolio for " + student.fullname); 
    var pf = SpreadsheetApp.openById(student.fileid);
    
    // updatePortfolioAttributes(pf);
    updatePortfolioMergeAndWrapExtraCurricular(pf);    
  }
}



function updatePortfolioMergeAndWrapExtraCurricular(pf) {
  Logger.log("updatePortfolioMergeAndWrapExtraCurricular for file id %s", pf.getName());

  var pastoralSheet = pf.getSheetByName(top.SHEETS.PASTORAL);
  
  // make extracurricular 3 lines long & text-wrapped
  pastoralSheet.getRange("B12:B14")
  .merge()
  .setHorizontalAlignment("left")
  .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  // delete the 'always / mostly' that sit to the right of the merged field
  pastoralSheet.getRange("C15:C23")
  .clearContent();
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
      "formula": '=UPPER(A2) & ", " & B2 & " (' + top.META.SEM + ' Report)"',
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
  
  var rb = SpreadsheetApp.openById(top.FILES.RBTRACKER);
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
  logMe("FORMAT: Skip blanks, REP > weighting " + ss.getName(), 'log' );
  
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

