<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ClientService;
use App\Models\Message;
use App\Models\Document;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class LoadTestSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate tables for fresh start
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('users')->truncate();
        DB::table('client_services')->truncate();
        DB::table('messages')->truncate();
        DB::table('documents')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $password = Hash::make('password');
        $services = ['payroll', 'accounts', 'corporation_tax', 'vat', 'self_assessment'];

        // Create Accountant
        User::create([
            'name' => 'Accountant',
            'email' => 'accountant@test.com',
            'password' => $password,
            'role' => 'accountant',
            'setup_completed' => true,
        ]);

        $users = [];
        for ($i = 1; $i <= 500; $i++) {
            $users[] = [
                'name' => "Client $i",
                'email' => "client{$i}@test.com",
                'password' => $password,
                'role' => 'client',
                'setup_completed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Bulk insert users
        foreach (array_chunk($users, 100) as $chunk) {
            DB::table('users')->insert($chunk);
        }

        // Get IDs
        $clientIds = User::where('role', 'client')->pluck('id');

        // Create Services & Messages
        $serviceData = [];
        $messages = [];
        
        foreach ($clientIds as $id) {
            // Random services
            foreach ($services as $svc) {
                if (rand(0, 1)) {
                    $serviceData[] = [
                        'user_id' => $id,
                        'service' => $svc,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // Create 5 dummy messages per client
            for ($k = 0; $k < 5; $k++) {
                $messages[] = [
                    'sender_id' => $id,
                    'receiver_id' => 1, // Accountant (ID 1), technically created first
                    'content' => "This is a load test message $k for client $id",
                    'type' => 'text',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Bulk insert services
        foreach (array_chunk($serviceData, 500) as $chunk) {
            DB::table('client_services')->insert($chunk);
        }

        // Bulk insert messages
        foreach (array_chunk($messages, 500) as $chunk) {
            DB::table('messages')->insert($chunk);
        }
    }
}
