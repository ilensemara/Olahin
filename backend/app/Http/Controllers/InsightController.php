<?php

namespace App\Http\Controllers;

use App\Models\CookingLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InsightController extends Controller
{
    public function getWeeklyStats()
    {
        $now = Carbon::now();
        $startOfWeek = $now->copy()->subDays(6)->startOfDay(); // last 7 days including today

        // 1. Get daily log statistics
        $dailyLogs = CookingLog::where('cooked_at', '>=', $startOfWeek)
            ->select(
                DB::raw("DATE(cooked_at) as date"),
                DB::raw("SUM(waste_prevented_kg) as total_waste_kg"),
                DB::raw("SUM(cost_saved_rp) as total_cost_saved")
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');

        // Fill all 7 days with data (even if 0) so the chart has consistent days
        $chartData = [];
        $dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        
        for ($i = 6; $i >= 0; $i--) {
            $dateString = $now->copy()->subDays($i)->toDateString();
            // Get Indonesian day name
            $dayOfWeek = $now->copy()->subDays($i)->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
            $label = $dayNames[$dayOfWeek - 1];

            if ($dailyLogs->has($dateString)) {
                $log = $dailyLogs->get($dateString);
                $chartData[] = [
                    'date' => $dateString,
                    'day' => $label,
                    'waste_kg' => round($log->total_waste_kg, 2),
                    'cost_saved' => (int) $log->total_cost_saved
                ];
            } else {
                $chartData[] = [
                    'date' => $dateString,
                    'day' => $label,
                    'waste_kg' => 0.0,
                    'cost_saved' => 0
                ];
            }
        }

        // 2. Calculate summary metrics
        $totalWasteSaved = CookingLog::sum('waste_prevented_kg');
        $totalCostSaved = CookingLog::sum('cost_saved_rp');
        $mealsCookedCount = CookingLog::count();
        
        // Estimate carbon emission reduction (1 kg of food waste saved ≈ 2.5 kg CO2 avoided)
        $carbonReductionKg = round($totalWasteSaved * 2.5, 2);

        return response()->json([
            'success' => true,
            'summary' => [
                'total_waste_saved_kg' => round($totalWasteSaved, 2),
                'total_cost_saved_rp' => (int) $totalCostSaved,
                'meals_cooked_count' => $mealsCookedCount,
                'carbon_reduction_kg' => $carbonReductionKg
            ],
            'chart_data' => $chartData
        ]);
    }
}
