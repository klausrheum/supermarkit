/*

=== Steps to generate a report ===
updateReportbookClassrooms() to pull data from Classroom into Reportbooks tab
getTeachersFromTracker() - grab list of teachers from Classroom using ownerIds in RB Tracker
createMissingReportbooks() - creates a reportbook from the template for each row in RB Tracker




=== manifest - what does each file do? ===

main.gs = global objects and helper functions

classroom.gs = pull teacher & course data from Classroom

files.gs = move files around, create PDFs, copy newly shared Reportbooks to the Reportbooks folder
    
export.gs = handles exporting students to individual Portfolio spreadsheets</li>

tracker.gs = functions for manipulating the Reportbook Tracker doc 
    (adding, removing students etc)
    
tests.gs = central place to run groups of tests from each category

sidebar = was going to be how you request an export, 
    now replaced with checkboxes on each teacher's Reportbook spreadsheet</li>
*/