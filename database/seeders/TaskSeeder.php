<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use File;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Task::truncate();

        $json = File::get("database/data/task.json");
        $tasks = json_decode($json);

        foreach ($tasks as $key => $value) {
            Task::create([
                "project_id" => $value->project_id,
                "name" => $value->name,
                "priority" => $value->priority,
                "project" => $value->project_name,
                "created_at" => $value->created_at
            ]);
        }
    }
}