Dim userValue

'Read value from Data Table
userValue = DataTable("user", dtGlobalSheet)

'Check value
If userValue = "admin" Then
    Reporter.ReportEvent micPass, "User Check", "User is admin"
Else
    Reporter.ReportEvent micFail, "User Check", "User is not admin"
End If

