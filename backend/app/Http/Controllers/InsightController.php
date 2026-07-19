<?php

namespace App\Http\Controllers;

use App\Models\CookingLog;
use App\Models\DailyLog;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InsightController extends Controller
{
    public function getWeeklyStats(Request $request)
    {
        $now = Carbon::now();
        $startOfWeek = $now->copy()->subDays(6)->startOfDay(); // last 7 days including today
        $user = $request->user() ?? User::first();

        // 1. Get daily waste & cost stats
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

        // 2. Get daily calorie tracker stats
        $dailyCalories = [];
        if ($user) {
            $dailyCalories = DailyLog::where('user_id', $user->id)
                ->where('date', '>=', $startOfWeek->toDateString())
                ->get()
                ->keyBy(function($item) {
                    return $item->date->toDateString();
                });
        }

        // Fill all 7 days with data
        $chartData = [];
        $dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        
        for ($i = 6; $i >= 0; $i--) {
            $dateString = $now->copy()->subDays($i)->toDateString();
            $dayOfWeek = $now->copy()->subDays($i)->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
            $label = $dayNames[$dayOfWeek - 1];

            $wasteKg = 0.0;
            $costSaved = 0;
            $calories = 0;
            $carbs = 0;
            $protein = 0;
            $fat = 0;

            if ($dailyLogs->has($dateString)) {
                $log = $dailyLogs->get($dateString);
                $wasteKg = round($log->total_waste_kg, 2);
                $costSaved = (int) $log->total_cost_saved;
            }

            if (isset($dailyCalories[$dateString])) {
                $calLog = $dailyCalories[$dateString];
                $calories = $calLog->calories_consumed;
                $carbs = $calLog->carbs_consumed;
                $protein = $calLog->protein_consumed;
                $fat = $calLog->fat_consumed;
            }

            $chartData[] = [
                'date' => $dateString,
                'day' => $label,
                'waste_kg' => $wasteKg,
                'cost_saved' => $costSaved,
                'calories' => $calories,
                'carbs' => $carbs,
                'protein' => $protein,
                'fat' => $fat
            ];
        }

        // 3. Calculate summary metrics
        $totalWasteSaved = CookingLog::sum('waste_prevented_kg');
        $totalCostSaved = CookingLog::sum('cost_saved_rp');
        $mealsCookedCount = CookingLog::count();
        $carbonReductionKg = round($totalWasteSaved * 2.5, 2);

        // 4. Get today's logs for daily ring
        $todayCalories = 0;
        $todayCarbs = 0;
        $todayProtein = 0;
        $todayFat = 0;
        
        if ($user) {
            $todayStr = Carbon::today()->toDateString();
            if (isset($dailyCalories[$todayStr])) {
                $todayLog = $dailyCalories[$todayStr];
                $todayCalories = $todayLog->calories_consumed;
                $todayCarbs = $todayLog->carbs_consumed;
                $todayProtein = $todayLog->protein_consumed;
                $todayFat = $todayLog->fat_consumed;
            }
        }

        return response()->json([
            'success' => true,
            'user' => $user,
            'today_nutrition' => [
                'calories' => $todayCalories,
                'carbs' => $todayCarbs,
                'protein' => $todayProtein,
                'fat' => $todayFat
            ],
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
