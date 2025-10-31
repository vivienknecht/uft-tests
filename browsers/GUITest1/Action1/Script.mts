' Get values from the Data Table
username = DataTable("Username", dtGlobalSheet)
password = DataTable("Password", dtGlobalSheet)

' Print them to the output
Reporter.ReportEvent micDone, "Login Data", "Username: " & username & " | Password: " & password

