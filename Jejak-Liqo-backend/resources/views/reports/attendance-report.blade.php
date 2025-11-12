<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kehadiran Mentee - {{ $period }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 10px; }
        .header { text-align: center; margin-bottom: 20px; }
        .stats { display: flex; justify-content: space-around; margin: 15px 0; }
        .stat-box { text-align: center; padding: 8px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 9px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-center { text-align: center; }
        .mb-15 { margin-bottom: 15px; }
        .status-present { color: green; font-weight: bold; }
        .status-sick { color: orange; font-weight: bold; }
        .status-permission { color: blue; font-weight: bold; }
        .status-absent { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN KEHADIRAN MENTEE</h2>
        <h4>Periode: {{ $period }}</h4>
        <p>Tanggal Cetak: {{ date('d/m/Y H:i:s') }}</p>
    </div>

    <div class="stats mb-15">
        <div class="stat-box">
            <h4>Total Kehadiran</h4>
            <h3>{{ $stats['total_attendance'] ?? 0 }}</h3>
        </div>
        <div class="stat-box">
            <h4>Hadir</h4>
            <h3>{{ $stats['present'] ?? 0 }}</h3>
        </div>
        <div class="stat-box">
            <h4>Sakit</h4>
            <h3>{{ $stats['sick'] ?? 0 }}</h3>
        </div>
        <div class="stat-box">
            <h4>Izin</h4>
            <h3>{{ $stats['permission'] ?? 0 }}</h3>
        </div>
        <div class="stat-box">
            <h4>Alfa</h4>
            <h3>{{ $stats['absent'] ?? 0 }}</h3>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="8%">ID Mentor</th>
                <th width="15%">Nama Mentor</th>
                <th width="18%">Nama Lengkap Mentee</th>
                <th width="12%">Kelas Mentee</th>
                <th width="12%">Bulan</th>
                <th width="10%">Keterangan Hadir</th>
                <th width="10%">Tipe Meeting</th>
                <th width="10%">Judul Meeting</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $attendance)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center">{{ $attendance->meeting->mentor_id ?? '-' }}</td>
                <td>{{ $attendance->meeting->mentor->email ?? '-' }}</td>
                <td>{{ $attendance->mentee->full_name ?? '-' }}</td>
                <td>{{ $attendance->mentee->activity_class ?? '-' }}</td>
                <td>{{ date('F Y', strtotime($attendance->meeting->meeting_date)) }}</td>
                <td class="text-center status-{{ strtolower($attendance->status) }}">
                    {{ $attendance->status ?? '-' }}
                </td>
                <td class="text-center">{{ $attendance->meeting->meeting_type ?? '-' }}</td>
                <td>{{ $attendance->meeting->topic ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" class="text-center">Tidak ada data kehadiran</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 20px; font-size: 8px; color: #666;">
        <p>Laporan ini dibuat secara otomatis oleh sistem Jejak Liqo</p>
        <p>Keterangan Status: Hadir (Present), Sakit (Sick), Izin (Permission), Alfa (Absent)</p>
    </div>
</body>
</html>