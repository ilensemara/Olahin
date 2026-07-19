<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Inventory;
use App\Models\CookingLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RecipeController extends Controller
{
    public function matchRecipes()
    {
        // 1. Get current stock in fridge
        $stock = Inventory::all()->mapWithKeys(function ($item) {
            return [strtolower(trim($item->name)) => $item];
        })->all();

        // 2. Get all recipes with ingredients
        $recipes = Recipe::with('ingredients')->get();
        $matchedRecipes = [];

        foreach ($recipes as $recipe) {
            $totalIngredients = $recipe->ingredients->count();
            if ($totalIngredients === 0) continue;

            $matchCount = 0;
            $matchedList = [];
            $missingList = [];
            $minExpiryDays = 9999;

            foreach ($recipe->ingredients as $recipeIng) {
                $ingNameLower = strtolower(trim($recipeIng->name));
                
                if (isset($stock[$ingNameLower])) {
                    $stockItem = $stock[$ingNameLower];
                    
                    // We count as a match if the ingredient exists in stock
                    // Optional check: whether quantity in stock is sufficient
                    $matchCount++;
                    $matchedList[] = [
                        'name' => $recipeIng->name,
                        'qty_needed' => $recipeIng->quantity,
                        'qty_available' => $stockItem->quantity,
                        'unit' => $recipeIng->unit,
                        'expiry_date' => $stockItem->expiry_date->toDateString(),
                        'days_until_expiry' => Carbon::today()->diffInDays($stockItem->expiry_date, false)
                    ];

                    $expiryDays = Carbon::today()->diffInDays($stockItem->expiry_date, false);
                    if ($expiryDays < $minExpiryDays) {
                        $minExpiryDays = $expiryDays;
                    }
                } else {
                    $missingList[] = [
                        'name' => $recipeIng->name,
                        'qty_needed' => $recipeIng->quantity,
                        'unit' => $recipeIng->unit
                    ];
                }
            }

            // Calculate match percentage
            $matchPercentage = round(($matchCount / $totalIngredients) * 100);

            // Filter: Matching Engine >= 50%
            if ($matchPercentage >= 50) {
                $matchedRecipes[] = [
                    'id' => $recipe->id,
                    'title' => $recipe->title,
                    'description' => $recipe->description,
                    'prep_time' => $recipe->prep_time,
                    'calories' => $recipe->calories,
                    'carbs' => $recipe->carbs,
                    'protein' => $recipe->protein,
                    'fat' => $recipe->fat,
                    'steps' => $recipe->steps,
                    'match_percentage' => $matchPercentage,
                    'min_expiry_days' => $minExpiryDays == 9999 ? null : $minExpiryDays,
                    'matched_ingredients' => $matchedList,
                    'missing_ingredients' => $missingList
                ];
            }
        }

        // Sort: 1st by match_percentage DESC, 2nd by min_expiry_days ASC (expiry alerts priority)
        usort($matchedRecipes, function ($a, $b) {
            if ($b['match_percentage'] === $a['match_percentage']) {
                $daysA = $a['min_expiry_days'] ?? 9999;
                $daysB = $b['min_expiry_days'] ?? 9999;
                return $daysA <=> $daysB; // lower expiry days comes first
            }
            return $b['match_percentage'] <=> $a['match_percentage'];
        });

        return response()->json([
            'success' => true,
            'data' => $matchedRecipes
        ]);
    }

    public function cookRecipe(Request $request)
    {
        $request->validate([
            'recipe_id' => 'required|exists:recipes,id'
        ]);

        $recipe = Recipe::with('ingredients')->findOrFail($request->recipe_id);
        $stock = Inventory::all()->mapWithKeys(function ($item) {
            return [strtolower(trim($item->name)) => $item];
        })->all();

        $wastePreventedKg = 0;
        $totalCostSaved = 0;

        foreach ($recipe->ingredients as $recipeIng) {
            $ingNameLower = strtolower(trim($recipeIng->name));

            if (isset($stock[$ingNameLower])) {
                $stockItem = $stock[$ingNameLower];
                
                // 1. Calculate waste prevention stats
                // If the ingredient is nearing expiry (<= 3 days)
                $expiryDays = Carbon::today()->diffInDays($stockItem->expiry_date, false);
                if ($expiryDays <= 3) {
                    // Estimate weight in kg (for simple stats, convert gr/ml to kg/liter, pcs counted as 0.1kg each)
                    $weightKg = 0;
                    $qtyUsed = min($recipeIng->quantity, $stockItem->quantity);
                    
                    if (in_array(strtolower($stockItem->unit), ['gr', 'g'])) {
                        $weightKg = $qtyUsed / 1000;
                    } elseif (in_array(strtolower($stockItem->unit), ['ml', 'l'])) {
                        $weightKg = $qtyUsed / 1000; // 1ml ≈ 1g
                    } else { // pcs, butir, etc.
                        $weightKg = $qtyUsed * 0.1; // 1 piece ≈ 100g
                    }
                    $wastePreventedKg += $weightKg;
                }

                // 2. Auto-Deduct inventory
                $newQty = $stockItem->quantity - $recipeIng->quantity;
                if ($newQty <= 0) {
                    $stockItem->delete();
                } else {
                    $stockItem->update(['quantity' => $newQty]);
                }
            }
        }

        // Calculate Cost Savings: estimate Rp 20.000 per kg of food waste prevented, minimum Rp 10.000
        $totalCostSaved = round($wastePreventedKg * 20000);
        if ($wastePreventedKg > 0 && $totalCostSaved < 5000) {
            $totalCostSaved = 10000; // minimum savings feel-good factor
        }

        // Always register some cost saved if cooked successfully
        if ($totalCostSaved == 0) {
            $totalCostSaved = 15000; // flat estimate
            $wastePreventedKg = 0.5; // flat estimate
        }

        // 3. Create cooking log
        $log = CookingLog::create([
            'recipe_id' => $recipe->id,
            'recipe_title' => $recipe->title,
            'waste_prevented_kg' => round($wastePreventedKg, 2),
            'cost_saved_rp' => $totalCostSaved,
            'cooked_at' => Carbon::now()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Selamat! Memasak {$recipe->title} selesai. Stok kulkas telah diperbarui otomatis.",
            'data' => [
                'log' => $log,
                'waste_prevented_kg' => round($wastePreventedKg, 2),
                'cost_saved_rp' => $totalCostSaved
            ]
        ]);
    }
}
