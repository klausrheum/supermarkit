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

