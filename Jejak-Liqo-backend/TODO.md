# TODO: Implement Monthly Report Functionality

## Tasks
- [x] Create MonthlyReportController with getReport method
- [x] Create MonthlyReportRequest for validation (month, year, group_ids)
- [x] Add route for monthly report in api.php
- [x] Test the endpoint to ensure data structure matches frontend needs
- [ ] Update Meeting model if needed for additional relations

## Details
- Endpoint: GET /api/monthly-reports
- Parameters: month (required), year (required), group_ids (array, optional for bulk select)
- Data structure: Array of groups with mentor, mentees, meetings, and attendances
- Label groups as "Laporan Kelompok Ikhwan" or "Akhwat" based on mentee genders
