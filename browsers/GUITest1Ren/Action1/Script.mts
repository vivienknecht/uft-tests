Dim totalRows, i

totalRows = DataTable.GetRowCount

For i = 1 To totalRows
    DataTable.SetCurrentRow i

    username = DataTable("Username", dtGlobalSheet)
    password = DataTable("Password", dtGlobalSheet)
    expectedResult = DataTable("ExpectedResult", dtGlobalSheet)

    ' Simulate login
    If username = "admin" And password = "pass123" Then
        actualResult = "Fail"
    Else
        actualResult = "Success"
    End If

    ' Compare expected vs actual
    If actualResult = expectedResult Then
        Reporter.ReportEvent micPass, "Login verification", _
            "Row " & i & " - Username: " & username & _
            " logged in as expected (" & actualResult & ")"
    Else
        Reporter.ReportEvent micFail, "Login verification", _
            "Row " & i & " - Username: " & username & _
            " login failed. Expected: " & expectedResult & _
            ", Got: " & actualResult
    End If
Next

