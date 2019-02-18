// test all functions

function testTester() {
  testTracker();
  testExport();
}

function testExport() {
  textAAAExport();
  testupdateGradeFormulas();
}

function testTracker() {
  testGetStudentByEmail(); 
  testCreateStudentFullInfo();
  //testCreateStudentFromSheet();
}




function logIt(msg, meta, dest_override) {
  var redirectAll = ""; // or "" 
  
  if (meta === undefined) meta = {tag: "???", "dest": "L"};
  if (meta.dest === undefined) metadest = "L";
  if (dest_override !== undefined) meta.dest = dest_override;
  
  var output = {};
  output.text = meta.tag + "> " + msg; 
  output.dest = meta.dest;

  if (redirectAll != false) {
    output.dest = redirectAll;
  }
  
  if (output.dest == "L") {
    Logger.log(output.text);
  }
  
  if (output.dest == "C") {
    console.info(output.text);
  }
  
  return output;
}

function testLogIt() {
  var meta = {'tag': arguments.callee.name, "dest": "L"};
  var m = "Message";
  
  var answer, test;

  test = "(m) => Logger(m)";
  answer = logIt(m);
  if ( answer.dest != "L" ) throw "(m) => Logger"; 
  if ( answer.text != "???> Message" ) throw test; 
  
  test = "intentional fnTag";
  answer = logIt(m, meta);
  if ( answer.dest != "L" ) throw "(m) => Logger"; 
  if ( answer.text != "testLogIt> Message" ) throw test; 
  
  test = "output to Logger";
  answer = logIt(m, meta);
  if ( answer.dest != "L" ) throw "(m) => Logger"; 
  if ( answer.text != "testLogIt> Message" ) throw test; 
  
  test = "override to console";
  answer = logIt(m, meta, "C");
  if ( answer.dest != "C" ) throw "(m) => Logger"; 
  if ( answer.text != "testLogIt> Message" ) throw test; 
  
}

