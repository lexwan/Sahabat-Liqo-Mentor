<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Meeting - {{ $period }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-center { text-align: center; }
        .mb-20 { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN MEETING</h1>
        <h3>Periode: {{ $period }}</h3>
        <p>Tanggal Cetak: {{ date('d/m/Y H:i:s') }}</p>
    </div>

    <div class="stats mb-20">
        <div class="stat-box">
            <h4>Total Meeting</h4>
            <h2>{{ $stats['total'] }}</h2>
        </div>
        <div class="stat-box">
            <h4>Online</h4>
            <h2>{{ $stats['online'] }}</h2>
        </div>
        <div class="stat-box">
            <h4>Offline</h4>
            <h2>{{ $stats['offline'] }}</h2>
        </div>
        <div class="stat-box">
            <h4>Assignment</h4>
            <h2>{{ $stats['assignment'] }}</h2>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="12%">Tanggal</th>
                <th width="15%">Kelompok</th>
                <th width="15%">Mentor</th>
                <th width="20%">Topik</th>
                <th width="15%">Tempat</th>
                <th width="10%">Tipe</th>
                <th width="8%">Kehadiran</th>
            </tr>
        </thead>
        <tbody>
            @forelse($meetings as $index => $meeting)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ date('d/m/Y', strtotime($meeting->meeting_date)) }}</td>
                <td>{{ $meeting->group->group_name ?? '-' }}</td>
                <td>{{ $meeting->mentor->email ?? '-' }}</td>
                <td>{{ $meeting->topic ?? '-' }}</td>
                <td>{{ $meeting->place ?? '-' }}</td>
                <td class="text-center">{{ $meeting->meeting_type }}</td>
                <td class="text-center">{{ $meeting->attendances->count() }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center">Tidak ada data meeting</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 30px; font-size: 10px; color: #666;">
        <p>Laporan ini dibuat secara otomatis oleh sistem Jejak Liqo</p>
    </div>
</body>
</html>