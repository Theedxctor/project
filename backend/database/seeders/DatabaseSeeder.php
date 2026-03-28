<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@strathmore.edu'],
            [
                'name'     => 'StrathFood Admin',
                'password' => Hash::make('password'),
                'role'     => 'Admin',
            ]
        );

        // ── Vendor Staff ──────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'vendor@strathmore.edu'],
            [
                'name'     => 'Cafeteria Vendor',
                'password' => Hash::make('password'),
                'role'     => 'Vendor_Staff',
            ]
        );

        // ── Demo Student ──────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'student@strathmore.edu'],
            [
                'name'     => 'Demo Student',
                'password' => Hash::make('password'),
                'role'     => 'Student',
            ]
        );

        // ── Read from data.json ───────────────────────────────────────────────
        $dataPath = base_path('data.json');
        if (file_exists($dataPath)) {
            $data = json_decode(file_get_contents($dataPath), true);

            $restaurantIds = [];
            $firstRestaurantId = null;
            foreach ($data['restaurants'] as $rest) {
                $slug = \Illuminate\Support\Str::slug($rest['name']);
                $dbRestaurant = Restaurant::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name'   => $rest['name'],
                        'image'  => null,
                        'status' => 'Open',
                    ]
                );
                $restaurantIds[$rest['id']] = $dbRestaurant->id;
                
                if (!$firstRestaurantId) {
                    $firstRestaurantId = $dbRestaurant->id;
                }
            }

            // Bind the vendor account to the very first restaurant in data.json for demo
            User::where('email', 'vendor@strathmore.edu')->update(['restaurant_id' => $firstRestaurantId]);

            foreach ($data['menu_items'] as $item) {
                if (!isset($restaurantIds[$item['restaurant_id']])) continue;

                $dbRestId = $restaurantIds[$item['restaurant_id']];
                Food::updateOrCreate(
                    ['restaurant_id' => $dbRestId, 'name' => $item['name']],
                    [
                        'restaurant_id' => $dbRestId,
                        'name'          => $item['name'],
                        'price'         => $item['price'],
                        'category'      => $item['category'],
                        'image_path'    => null,
                        'is_available'  => true,
                    ]
                );
            }
        } else {
            $this->command->error("data.json not found at {$dataPath}");
        }

        $this->command->info('✅ StrathFood database seeded successfully from data.json!');
        $this->command->info('   Admin:   admin@strathmore.edu / password');
        $this->command->info('   Vendor:  vendor@strathmore.edu / password');
        $this->command->info('   Student: student@strathmore.edu / password');
    }
}
