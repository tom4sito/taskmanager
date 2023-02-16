<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/create-task', [TaskController::class, 'create']);
Route::post('/update-tasks-priority', [TaskController::class, 'updatePriority']);
Route::post('/update-task-name', [TaskController::class, 'updateName']);
Route::post('/delete-task', [TaskController::class, 'delete']);
Route::get('/get-tasks-by-project', [TaskController::class, 'getTasksByProject']);
Route::get('/get-all-projects', [TaskController::class, 'getAllProjects']);
