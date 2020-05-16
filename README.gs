/*

Requires the Reportbook and RB_templates spreadsheet.
Connects to the klausrheum/reportbooks github project.

=== Steps to generate a report ===

# TIPS
Open the Stackdriver Logger to view what's happening when you run scripts:
https://console.cloud.google.com/logs/viewer?project=project-id-1083006695369336274

# PREPARATION - Before you begin
Duplicate RB Tracker, clear out Reportbooks, Portfolios, Teachers & Problems tabs

main.gs - update top.META.SEM, top.FILES.RBTRACKER

# REPORTBOOKS - Teacher gradebooks, used to generate Portfolios
classroom.gs > updateReportbookClassrooms - pull data from Classroom into Reportbooks tab
classroom.gs > getTeachersFromTracker - grab list of teachers from Classroom using ownerIds in RB Tracker
classroom.gs > createMissingReportbooks - creates a reportbook from the template for each row in RB Tracker
classroom.gs > updateReportbooks - uncomment updateRBFormulas, run once, comment out (ensures blanks are ignored)
export.gs > backupAllPastoralAdmin - copies Pastoral Comments, extracurricular & attendance to RB Tracker

# PORTFOLIOS - Student pastoral & subject sheets, used to generate & email PDFs
Copy & paste students & emails from teacher RBs (will be automated soon)

updater.gs > updateAllPortfolios - wrap extra-curricular, merge attributes & set formula

# EXPORT
In Reportbooks tab, tick 'Export' against required subjects
In Portfolios tab, tick 'Export' against required students

export.gs > exportAllRBs - For all RBs ticked 'Export', create a portfolio tab for every student ticked Export'

# GENERATE PDFS & Email to Guardians
Check Guardian emails are in 'Guardians' column of Portfolios (paste from Sycamore?)
files.gs > generateAllPortfolioPDFs

# UTILITIES - Scripts you may need to use
files.gs > keepKillUnwantedPortfolioSheets - uses regex patterns to delete unwanted sheets (DANGEROUS!)


=== manifest - what does each file do? ===

main.gs = global objects and helper functions

classroom.gs = pull teacher & course data from Classroom

files.gs = move files around, create PDFs, copy newly shared Reportbooks to the Reportbooks folder
    
export.gs = handles exporting students to individual Portfolio spreadsheets

tracker.gs = functions for manipulating the Reportbook Tracker doc 
    (adding, removing students etc)
    
tests.gs = central place to run groups of tests from each category

sidebar = was going to be how you request an export, 
    now replaced with checkboxes on each teacher's Reportbook spreadsheet
*/