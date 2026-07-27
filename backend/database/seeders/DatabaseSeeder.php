<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Ingredient;
use App\Models\Recipe;
use App\Models\RecipeStep;
use App\Models\DailyLog;
use App\Models\CookingLog;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // 1. Seed Default User
        $user = User::create([
            'name' => 'Budi Santoso',
            'email' => 'user@olahin.com',
            'password' => bcrypt('password'),
            'target_calories' => 2000,
            'target_carbs' => 250,
            'target_protein' => 75,
            'target_fat' => 65,
            'weight' => 65,
            'height' => 170,
            'age' => 26,
        ]);

        // 2. Seed Refrigerator Stock (Kulkas Saya)
        $now = now();
        $fridgeItems = [
            ['name' => 'Telur', 'quantity' => 6, 'unit' => 'pcs', 'expiry_date' => $now->copy()->addDays(5)->toDateString(), 'category' => 'Daging & Telur'],
            ['name' => 'Bawang Merah', 'quantity' => 150, 'unit' => 'gr', 'expiry_date' => $now->copy()->addDays(14)->toDateString(), 'category' => 'Bumbu'],
            ['name' => 'Bawang Putih', 'quantity' => 80, 'unit' => 'gr', 'expiry_date' => $now->copy()->addDays(20)->toDateString(), 'category' => 'Bumbu'],
            ['name' => 'Cabai Merah', 'quantity' => 50, 'unit' => 'gr', 'expiry_date' => $now->copy()->addDays(2)->toDateString(), 'category' => 'Bumbu'], // Nearing expiry
            ['name' => 'Bayam', 'quantity' => 300, 'unit' => 'gr', 'expiry_date' => $now->copy()->addDays(1)->toDateString(), 'category' => 'Sayuran'], // Nearing expiry
            ['name' => 'Minyak Goreng', 'quantity' => 1000, 'unit' => 'ml', 'expiry_date' => $now->copy()->addDays(90)->toDateString(), 'category' => 'Minyak & Lemak'],
            ['name' => 'Kecap Manis', 'quantity' => 250, 'unit' => 'ml', 'expiry_date' => $now->copy()->addDays(60)->toDateString(), 'category' => 'Bumbu'],
        ];

        foreach ($fridgeItems as $item) {
            Ingredient::create($item);
        }

        // 3. Seed Recipes & Ingredients
        $recipes = [
            [
                'title' => 'Nasi Goreng Telur',
                'description' => 'Resep nasi goreng sederhana khas rumahan yang gurih dan cepat disajikan.',
                'prep_time' => 15,
                'calories' => 450,
                'carbs' => 60,
                'protein' => 12,
                'fat' => 15,
                'youtube_video_url' => 'https://www.youtube.com/watch?v=i6yHVLgrELQ',
                'youtube_id' => 'i6yHVLgrELQ',
                'ingredients' => [
                    ['name' => 'Telur', 'quantity' => 1, 'unit' => 'pcs'],
                    ['name' => 'Bawang Merah', 'quantity' => 15, 'unit' => 'gr'],
                    ['name' => 'Bawang Putih', 'quantity' => 10, 'unit' => 'gr'],
                    ['name' => 'Minyak Goreng', 'quantity' => 15, 'unit' => 'ml'],
                    ['name' => 'Kecap Manis', 'quantity' => 10, 'unit' => 'ml'],
                ],
                'steps' => [
                    "Panaskan 15ml minyak goreng di wajan dengan api sedang.",
                    "Tumis irisan bawang merah dan bawang putih hingga harum dan layu.",
                    "Masukkan telur, buat orak-arik hingga setengah matang.",
                    "Masukkan nasi putih, aduk rata dengan bumbu dan telur.",
                    "Tambahkan kecap manis dan garam secukupnya, aduk hingga matang merata."
                ]
            ],
            [
                'title' => 'Bayam Bening Segar',
                'description' => 'Sayur bayam kuah bening yang kaya serat dan sangat menyegarkan tubuh.',
                'prep_time' => 10,
                'calories' => 80,
                'carbs' => 12,
                'protein' => 4,
                'fat' => 1,
                'youtube_video_url' => 'https://www.youtube.com/watch?v=SId6rIr24O8',
                'youtube_id' => 'SId6rIr24O8',
                'ingredients' => [
                    ['name' => 'Bayam', 'quantity' => 200, 'unit' => 'gr'],
                    ['name' => 'Bawang Merah', 'quantity' => 10, 'unit' => 'gr'],
                    ['name' => 'Bawang Putih', 'quantity' => 5, 'unit' => 'gr'],
                ],
                'steps' => [
                    "Didihkan 500ml air di panci kecil.",
                    "Masukkan irisan bawang merah dan bawang putih ke dalam air mendidih.",
                    "Masukkan daun bayam yang sudah dicuci bersih.",
                    "Tambahkan garam dan sedikit gula, rebus sekitar 2-3 menit hingga bayam layu, lalu sajikan."
                ]
            ],
            [
                'title' => 'Telur Dadar Cabai',
                'description' => 'Telur dadar tebal dicampur irisan daun bawang dan cabai merah yang pedas nikmat.',
                'prep_time' => 10,
                'calories' => 210,
                'carbs' => 4,
                'protein' => 13,
                'fat' => 17,
                'youtube_video_url' => 'https://www.youtube.com/watch?v=6uKarev2O8w',
                'youtube_id' => '6uKarev2O8w',
                'ingredients' => [
                    ['name' => 'Telur', 'quantity' => 2, 'unit' => 'pcs'],
                    ['name' => 'Cabai Merah', 'quantity' => 15, 'unit' => 'gr'],
                    ['name' => 'Minyak Goreng', 'quantity' => 10, 'unit' => 'ml'],
                ],
                'steps' => [
                    "Kocok lepas 2 butir telur di mangkuk kecil.",
                    "Masukkan irisan cabai merah dan sedikit garam, kocok hingga rata.",
                    "Panaskan 10ml minyak goreng di wajan teflon.",
                    "Tuang telur kocok, masak dengan api sedang hingga kecokelatan di kedua sisi."
                ]
            ],
            [
                'title' => 'Tumis Bayam Pedas',
                'description' => 'Tumis sayur bayam praktis dengan bumbu bawang dan cabai merah.',
                'prep_time' => 12,
                'calories' => 110,
                'carbs' => 10,
                'protein' => 5,
                'fat' => 6,
                'youtube_video_url' => 'https://www.youtube.com/watch?v=tjHi6ZVWapI',
                'youtube_id' => 'tjHi6ZVWapI',
                'ingredients' => [
                    ['name' => 'Bayam', 'quantity' => 250, 'unit' => 'gr'],
                    ['name' => 'Bawang Merah', 'quantity' => 10, 'unit' => 'gr'],
                    ['name' => 'Bawang Putih', 'quantity' => 5, 'unit' => 'gr'],
                    ['name' => 'Cabai Merah', 'quantity' => 15, 'unit' => 'gr'],
                    ['name' => 'Minyak Goreng', 'quantity' => 10, 'unit' => 'ml'],
                ],
                'steps' => [
                    "Panaskan minyak goreng, tumis bawang merah, bawang putih, dan cabai merah hingga harum.",
                    "Masukkan bayam yang sudah disiangi dan dicuci.",
                    "Bumbui dengan garam dan sedikit penyedap rasa.",
                    "Tumis cepat sekitar 2 menit dengan api besar agar bayam tetap segar, lalu angkat."
                ]
            ]
        ];

        foreach ($recipes as $r) {
            $recipeModel = Recipe::create([
                'title' => $r['title'],
                'description' => $r['description'],
                'prep_time' => $r['prep_time'],
                'calories' => $r['calories'],
                'carbs' => $r['carbs'],
                'protein' => $r['protein'],
                'fat' => $r['fat'],
                'youtube_video_url' => $r['youtube_video_url'] ?? null,
                'youtube_id' => $r['youtube_id'] ?? null,
            ]);

            foreach ($r['ingredients'] as $ing) {
                $recipeModel->ingredients()->create($ing);
            }

            foreach ($r['steps'] as $idx => $stepInst) {
                $recipeModel->steps()->create([
                    'step_number' => $idx + 1,
                    'instruction' => $stepInst
                ]);
            }
        }

        // 4. Seed Daily Calorie Logs (7 Hari Terakhir)
        $dailyCalories = [
            ['date' => $now->copy()->subDays(6)->toDateString(), 'calories_consumed' => 1750, 'carbs_consumed' => 220, 'protein_consumed' => 68, 'fat_consumed' => 58],
            ['date' => $now->copy()->subDays(5)->toDateString(), 'calories_consumed' => 1920, 'carbs_consumed' => 240, 'protein_consumed' => 72, 'fat_consumed' => 62],
            ['date' => $now->copy()->subDays(4)->toDateString(), 'calories_consumed' => 1550, 'carbs_consumed' => 190, 'protein_consumed' => 60, 'fat_consumed' => 45],
            ['date' => $now->copy()->subDays(3)->toDateString(), 'calories_consumed' => 2050, 'carbs_consumed' => 260, 'protein_consumed' => 80, 'fat_consumed' => 70],
            ['date' => $now->copy()->subDays(2)->toDateString(), 'calories_consumed' => 1800, 'carbs_consumed' => 230, 'protein_consumed' => 70, 'fat_consumed' => 60],
            ['date' => $now->copy()->subDays(1)->toDateString(), 'calories_consumed' => 1650, 'carbs_consumed' => 210, 'protein_consumed' => 65, 'fat_consumed' => 55],
            ['date' => $now->copy()->toDateString(), 'calories_consumed' => 1240, 'carbs_consumed' => 160, 'protein_consumed' => 50, 'fat_consumed' => 40],
        ];

        foreach ($dailyCalories as $log) {
            DailyLog::create(array_merge(['user_id' => $user->id], $log));
        }

        // 5. Seed Cooking Logs (Laporan Limbah 7 Hari Terakhir)
        $logs = [
            ['recipe_title' => 'Sayur Sop Ayam', 'waste_prevented_kg' => 0.8, 'cost_saved_rp' => 18000, 'cooked_at' => $now->copy()->subDays(6)],
            ['recipe_title' => 'Tumis Kangkung', 'waste_prevented_kg' => 1.2, 'cost_saved_rp' => 24000, 'cooked_at' => $now->copy()->subDays(5)],
            ['recipe_title' => 'Nasi Goreng Telur', 'waste_prevented_kg' => 0.4, 'cost_saved_rp' => 12000, 'cooked_at' => $now->copy()->subDays(4)],
            ['recipe_title' => 'Bayam Bening Segar', 'waste_prevented_kg' => 1.5, 'cost_saved_rp' => 30000, 'cooked_at' => $now->copy()->subDays(3)],
            ['recipe_title' => 'Orek Tempe', 'waste_prevented_kg' => 0.6, 'cost_saved_rp' => 15000, 'cooked_at' => $now->copy()->subDays(2)],
            ['recipe_title' => 'Telur Dadar Cabai', 'waste_prevented_kg' => 1.1, 'cost_saved_rp' => 22000, 'cooked_at' => $now->copy()->subDays(1)],
            ['recipe_title' => 'Nasi Goreng Telur', 'waste_prevented_kg' => 1.9, 'cost_saved_rp' => 45000, 'cooked_at' => $now],
        ];

        foreach ($logs as $log) {
            CookingLog::create($log);
        }
    }
}

