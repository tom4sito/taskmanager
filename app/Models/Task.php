<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;
    protected $table = 'task';

    public function projectInfo()
    {
        return $this->belongsTo('App\Models\Project', 'project_id');
    }
}
