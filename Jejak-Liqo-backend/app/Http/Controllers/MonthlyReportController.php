<?php

namespace App\Http\Controllers;

use App\Http\Requests\MonthlyReportRequest;
use App\Models\Group;
use App\Models\Meeting;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MonthlyReportController extends Controller
{
    public function getReport(MonthlyReportRequest $request)
    {
        $month = $request->month;
        $year = $request->year;
        $groupIds = $request->group_ids ?? null; // Array of group IDs, optional for bulk select

        // Get groups based on selection or all if none specified
        $query = Group::with([
            'mentor.profile',
            'mentees' => function($q) {
                $q->where('status', 'Aktif');
            },
            'meetings' => function($q) use ($month, $year) {
                $q->whereMonth('meeting_date', $month)
                  ->whereYear('meeting_date', $year)
                  ->with(['attendances.mentee']);
            }
        ]);

        if ($groupIds) {
            $query->whereIn('id', $groupIds);
        }

        $groups = $query->get();

        // Structure the data for frontend
        $reportData = $groups->map(function($group) {
            // Determine group type based on mentees' gender
            $groupType = $this->determineGroupType($group->mentees);

            $meetingsData = $group->meetings->map(function($meeting) {
                return [
                    'id' => $meeting->id,
                    'meeting_date' => $meeting->meeting_date,
                    'place' => $meeting->place,
                    'topic' => $meeting->topic,
                    'notes' => $meeting->notes,
                    'meeting_type' => $meeting->meeting_type,
                    'attendances' => $meeting->attendances->map(function($attendance) {
                        return [
                            'mentee_id' => $attendance->mentee_id,
                            'mentee_name' => $attendance->mentee->full_name,
                            'activity_class' => $attendance->mentee->activity_class,
                            'status' => $attendance->status,
                            'notes' => $attendance->notes,
                        ];
                    })
                ];
            });

            return [
                'group_id' => $group->id,
                'group_name' => $group->group_name,
                'group_type' => $groupType,
                'mentor_name' => $group->mentor->profile->full_name ?? 'Unknown',
                'mentees' => $group->mentees->map(function($mentee) {
                    return [
                        'id' => $mentee->id,
                        'full_name' => $mentee->full_name,
                        'activity_class' => $mentee->activity_class,
                        'gender' => $mentee->gender,
                    ];
                }),
                'meetings' => $meetingsData,
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Monthly report data fetched successfully',
            'data' => $reportData,
            'period' => Carbon::create($year, $month)->format('F Y'),
        ]);
    }

    private function determineGroupType($mentees)
    {
        $genders = $mentees->pluck('gender')->unique()->filter();

        if ($genders->contains('Ikhwan') && !$genders->contains('Akhwat')) {
            return 'Laporan Kelompok Ikhwan';
        } elseif ($genders->contains('Akhwat') && !$genders->contains('Ikhwan')) {
            return 'Laporan Kelompok Akhwat';
        } else {
            return 'Laporan Kelompok Campuran';
        }
    }
}
