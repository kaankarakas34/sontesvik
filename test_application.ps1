# Test script for application creation
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Mjc3ZjczLWE2YzItNGY1Yy1iMjQ5LTM3NjU2YjQ1N2Y2NCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzI4OTAxMzgwLCJleHAiOjE3Mjg5ODc3ODB9.QQdMQVdJA3H4E6Cs-zY5dzVQK-_jqGgFPL2dHeLYjk0"

# First, get available incentives
Write-Host "Getting available incentives..."
try {
    $incentives = Invoke-RestMethod -Uri "http://localhost:5002/api/incentive-selection/incentives" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Incentives response:"
    $incentives | ConvertTo-Json -Depth 10
    
    if ($incentives.incentives.Count -gt 0) {
        $incentiveId = $incentives.incentives[0].id
        Write-Host "Using incentive ID: $incentiveId"
        
        # Create application with the first available incentive
        $body = @{
            applicationData = @{
                projectTitle = "Test Project"
                projectDescription = "Test project description"
                requestedAmount = 100000
                currency = "TRY"
                priority = "medium"
                sectorId = "Yazılım"
                completionPercentage = 0
                notes = "Test notes"
            }
            incentiveIds = @($incentiveId)
        } | ConvertTo-Json -Depth 10
        
        Write-Host "Creating application..."
        $response = Invoke-RestMethod -Uri "http://localhost:5002/api/incentive-selection/applications/with-incentives" -Method POST -Headers @{"Authorization"="Bearer $token";"Content-Type"="application/json"} -Body $body
        Write-Host "Application created successfully:"
        $response | ConvertTo-Json -Depth 10
    } else {
        Write-Host "No incentives available"
    }
} catch {
    Write-Host "Error: $_"
    Write-Host "Exception details: $($_.Exception)"
}