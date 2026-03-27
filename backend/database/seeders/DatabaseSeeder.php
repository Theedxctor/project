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

        // ── Restaurants ───────────────────────────────────────────────────────
        $mainCafe = Restaurant::updateOrCreate(
            ['slug' => 'main-cafeteria'],
            [
                'name'   => 'Main Cafeteria',
                'image'  => '/images/restaurants/main-cafeteria.jpg',
                'status' => 'Open',
            ]
        );

        $javaCafe = Restaurant::updateOrCreate(
            ['slug' => 'java-heaven'],
            [
                'name'   => 'Java Heaven',
                'image'  => '/images/restaurants/java-heaven.jpg',
                'status' => 'Open',
            ]
        );

        $grill = Restaurant::updateOrCreate(
            ['slug' => 'strath-grill'],
            [
                'name'   => 'Strath Grill',
                'image'  => '/images/restaurants/strath-grill.jpg',
                'status' => 'Closed',
            ]
        );

        // ── Main Cafeteria Foods ──────────────────────────────────────────────
        $mainFoods = [
            ['name' => 'Mandazi',  'price' => 20,  'category' => 'Morning',  'image_path' => '/images/foods/mandazi.jpg'],
            ['name' => 'Uji',      'price' => 30,  'category' => 'Morning',  'image_path' => '/images/foods/uji.jpg'],
            ['name' => 'Pilau',    'price' => 150, 'category' => 'Evening',  'image_path' => '/images/foods/pilau.jpg'],
            ['name' => 'Ugali na Nyama', 'price' => 120, 'category' => 'Evening', 'image_path' => '/images/foods/ugali.jpg'],
            ['name' => 'Chapati', 'price' => 30,  'category' => 'All-day',  'image_path' => '/images/foods/chapati.jpg'],
            ['name' => 'Water (500ml)', 'price' => 50, 'category' => 'All-day', 'image_path' => '/images/foods/water.jpg'],
        ];

        foreach ($mainFoods as $food) {
            Food::updateOrCreate(
                ['restaurant_id' => $mainCafe->id, 'name' => $food['name']],
                array_merge($food, ['restaurant_id' => $mainCafe->id, 'is_available' => true])
            );
        }

        // ── Java Heaven Foods ─────────────────────────────────────────────────
        $javaFoods = [
            ['name' => 'Espresso',     'price' => 80,  'category' => 'Morning', 'image_path' => '/images/foods/espresso.jpg'],
            ['name' => 'Cappuccino',   'price' => 120, 'category' => 'Morning', 'image_path' => '/images/foods/cappuccino.jpg'],
            ['name' => 'English Breakfast', 'price' => 200, 'category' => 'Morning', 'image_path' => '/images/foods/breakfast.jpg'],
            ['name' => 'Club Sandwich','price' => 250, 'category' => 'Evening', 'image_path' => '/images/foods/sandwich.jpg'],
            ['name' => 'Brownie',      'price' => 100, 'category' => 'All-day', 'image_path' => '/images/foods/brownie.jpg'],
            ['name' => 'Fresh Juice',  'price' => 150, 'category' => 'All-day', 'image_path' => '/images/foods/juice.jpg'],
        ];

        foreach ($javaFoods as $food) {
            Food::updateOrCreate(
                ['restaurant_id' => $javaCafe->id, 'name' => $food['name']],
                array_merge($food, ['restaurant_id' => $javaCafe->id, 'is_available' => true])
            );
        }

        // ── Strath Grill Foods ────────────────────────────────────────────────
        $grillFoods = [
            ['name' => 'Beef Burger',   'price' => 350, 'category' => 'Evening', 'image_path' => '/images/foods/burger.jpg'],
            ['name' => 'Chicken Wings', 'price' => 300, 'category' => 'Evening', 'image_path' => '/images/foods/wings.jpg'],
            ['name' => 'Chips',         'price' => 100, 'category' => 'All-day', 'image_path' => '/images/foods/chips.jpg'],
            ['name' => 'Soda (330ml)',  'price' => 80,  'category' => 'All-day', 'image_path' => '/images/foods/soda.jpg'],
        ];

        foreach ($grillFoods as $food) {
            Food::updateOrCreate(
                ['restaurant_id' => $grill->id, 'name' => $food['name']],
                array_merge($food, ['restaurant_id' => $grill->id, 'is_available' => true])
            );
        }

        $this->command->info('✅ StrathFood database seeded successfully!');
        $this->command->info('   Admin:   admin@strathmore.edu / password');
        $this->command->info('   Vendor:  vendor@strathmore.edu / password');
        $this->command->info('   Student: student@strathmore.edu / password');
    }
}
