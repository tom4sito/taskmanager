<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use File;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Project::truncate();

        $json = File::get("database/data/project.json");
        $projects = json_decode($json);

        foreach ($projects as $key => $value) {
            Project::create([
                "name" => $value->name,
                "created_at" => $value->created_at
            ]);
        }
    }
}