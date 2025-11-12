<?php

namespace App\Exports;

use App\Models\Meeting;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MeetingsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $meetings;

    public function __construct($meetings)
    {
        $this->meetings = $meetings;
    }

    public function collection()
    {
        // Get attendances with related data instead of meetings
        $query = \App\Models\Attendance::with([
            'meeting.mentor',
            'meeting.group', 
            'mentee'
        ]);
        
        // Apply filters based on meetings data
        if ($this->meetings->isNotEmpty()) {
            $meetingIds = $this->meetings->pluck('id')->toArray();
            $query->whereIn('meeting_id', $meetingIds);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'ID Mentor',
            'Nama Mentor',
            'Nama Lengkap Mentee',
            'Kelas Mentee',
            'Bulan',
            'Keterangan Hadir',
            'Tipe Meeting',
            'Judul Meeting'
        ];
    }

    public function map($attendance): array
    {
        static $no = 1;
        
        return [
            $no++,
            $attendance->meeting->mentor_id ?? '-',
            $attendance->meeting->mentor->email ?? '-',
            $attendance->mentee->full_name ?? '-',
            $attendance->mentee->activity_class ?? '-',
            date('F Y', strtotime($attendance->meeting->meeting_date)),
            $attendance->status ?? '-',
            $attendance->meeting->meeting_type ?? '-',
            $attendance->meeting->topic ?? '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}