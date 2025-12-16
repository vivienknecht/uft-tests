' ------------------------------
' Simple UFT Edge Test Example
' ------------------------------

' Read Data Table parameters (Action Sheet)
userName = DataTable("Username", dtLocalSheet)
password = DataTable("Password", dtLocalSheet)

' Launch Microsoft Edge
SystemUtil.Run "msedge.exe", "about:blank"

' Put a little wait so the browser actually launches
Wait 2

' Now verify based on data table values
If userName = "AdminUser" And password = "Admin123" Then
    Reporter.ReportEvent micPass, "Data Validation", "PASS: Good credentials for " & userName
Else
    Reporter.ReportEvent micFail, "Data Validation", "FAIL: Bad credentials for " & userName
End If

