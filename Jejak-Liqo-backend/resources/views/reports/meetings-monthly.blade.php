<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Pertemuan Bulanan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .top-mentors { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Pertemuan Bulanan</h1>
        <h2>{{ DateTime::createFromFormat('!m', $month)->format('F') }} {{ $year }}</h2>
    </div>

    <div class="stats">
        <div class="stat-box">
            <h3>{{ $stats['total'] }}</h3>
            <p>Total Pertemuan</p>
        </div>
        <div class="stat-box">
            <h3>{{ $stats['online'] }}</h3>
            <p>Online</p>
        </div>
        <div class="stat-box">
            <h3>{{ $stats['offline'] }}</h3>
            <p>Offline</p>
        </div>
        <div class="stat-box">
            <h3>{{ $stats['assignment'] }}</h3>
            <p>Assignment</p>
        </div>
    </div>

    <div class="top-mentors">
        <h3>Top 3 Mentor Aktif</h3>
        <ol>
            @foreach($topMentors as $mentor)
                <li>{{ $mentor['mentor'] }} - {{ $mentor['count'] }} pertemuan</li>
            @endforeach
        </ol>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kelompok</th>
                <th>Mentor</th>
                <th>Topik</th>
                <th>Tempat</th>
                <th>Tipe</th>
            </tr>
        </thead>
        <tbody>
            @foreach($meetings as $index => $meeting)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $meeting->meeting_date }}</td>
                    <td>{{ $meeting->group->name ?? '-' }}</td>
                    <td>{{ $meeting->mentor->profile->full_name ?? '-' }}</td>
                    <td>{{ $meeting->topic }}</td>
                    <td>{{ $meeting->place }}</td>
                    <td>{{ $meeting->meeting_type }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>