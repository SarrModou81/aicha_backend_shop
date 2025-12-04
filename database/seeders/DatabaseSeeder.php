<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            DeliveryZoneSeeder::class,
            ProductSeeder::class,
        ]);

        $this->command->info('🎉 Database seeded successfully!');
        $this->command->info('');
        $this->command->info('📧 Admin credentials:');
        $this->command->info('   Email: admin@aichashop.sn');
        $this->command->info('   Password: password123');
        $this->command->info('');
        $this->command->info('📧 Seller credentials:');
        $this->command->info('   Email: fatou@aichashop.sn');
        $this->command->info('   Password: password123');
        $this->command->info('');
        $this->command->info('📧 Client credentials:');
        $this->command->info('   Email: client1@example.com');
        $this->command->info('   Password: password123');
    }
}
