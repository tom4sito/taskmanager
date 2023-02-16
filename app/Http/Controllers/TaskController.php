<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Project;
use \stdClass;

class TaskController extends Controller
{
    public function create(Request $request){
        $data = json_decode($request->getContent());
        $getTask = (isset($data->task))?$data->task:NULL;

        $returnObj = new stdClass();
        $returnObj->error = false;
        $returnObj->saved = false;
        $returnObj->status = 200;

        if(empty($getTask)){
            $returnObj->status = 400;
            $returnObj->error = true;
            $returnObj->errorMessage = 'bad request, possibly missing parameters';
            return response()->json($returnObj)->setStatusCode(400);
        }

        $newTask = new Task;
        $newTask->project_id = $getTask->project_id;
        $newTask->name = $getTask->task_name;
        $newTask->priority = $getTask->task_priority;
        $newTask->project = $getTask->project_name;
        $newTask->save();

        if($newTask){
            $returnObj->saved = true;
        }

        $returnTask = new stdClass();
        $returnTask->id = $newTask->id;
        $returnTask->name = $getTask->task_name;
        $returnTask->priority = $getTask->task_priority;
        $returnTask->project_id = intval($getTask->project_id);

        $returnObj->data = [$returnTask];

        return response()->json($returnObj);
    }

    public function delete(Request $request){
        $data = json_decode($request->getContent());
        $getTask = (isset($data->task))?$data->task:NULL;

        $returnObj = new stdClass();
        $returnObj->error = false;
        $returnObj->errorMessage = "";
        $returnObj->deleted = false;
        $returnObj->status = 200;

        if(empty($getTask)){
            $returnObj->status = 400;
            $returnObj->error = true;
            $returnObj->errorMessage = 'bad request, possibly missing parameters';
            return response()->json($returnObj)->setStatusCode(400);
        }

        $deleteQuery = Task::destroy($getTask->id);
        if($deleteQuery){
            $returnObj->deleted = true;
            $allTasks = Task::where(['project_id'=>$getTask->project_id])->orderBy('priority', 'asc')->get();
            foreach ($allTasks as $key => $task) {
                $allTasks[$key]->priority = $key + 1;
                Task::where('id', $allTasks[$key]->id)->update(['priority' => $key + 1]);
            }
            $returnObj->data = $allTasks;
        }
        else{
            $returnObj->error = true;
            $returnObj->errorMessage = "record could not be deleted";
            $returnObj->status = 400;
        }
        return response()->json($returnObj);
    }

    // takes an array of the tasks to be updated, every element of the array
    // must contain an object like the following: {'id':int, 'priority': int}
    public function updatePriority(Request $request){
        $data = json_decode($request->getContent());
        $getTasks = (isset($data->tasks))?$data->tasks:NULL;

        $returnObj = new stdClass();
        $returnObj->error = false;
        $returnObj->status = 200;

        if(empty($getTasks)){
            $returnObj->status = 400;
            $returnObj->error = true;
            $returnObj->errorMessage = 'bad request, possibly missing parameters';
            return response()->json($returnObj)->setStatusCode(400);
        }

        foreach($getTasks as $key => $task) {
            Task::where('id', $task->id)->update(['priority' => $task->priority]);
        }

        $returnObj->tasks = $data->tasks;
        return response()->json($returnObj);
    }

    // takes a task object to be updated, every element of the array
    // must contain an object like the following: {'id':int, 'priority': int}
    public function updateName(Request $request){
        $data = json_decode($request->getContent());
        $getTask = (isset($data->task))?$data->task:NULL;

        $returnObj = new stdClass();
        $returnObj->error = false;
        $returnObj->status = 200;

        if(empty($getTask)){
            $returnObj->status = 400;
            $returnObj->error = true;
            $returnObj->errorMessage = 'bad request, possibly missing parameters';
            return response()->json($returnObj)->setStatusCode(400);
        }

        Task::where('id', $getTask->id)->update(['name' => $getTask->name]);

        $returnObj->task = $getTask;
        return response()->json($returnObj);
    }

    public function getTasksByProject(Request $request){
        $project = $request->query('project');

        $returnObj = new stdClass();
        $returnObj->error = false;
        $returnObj->status = 200;

        if(empty($project)){
            $returnObj->status = 400;
            $returnObj->error = true;
            $returnObj->errorMessage = 'bad request, possibly missing parameters';
            return response()->json($returnObj)->setStatusCode(400);
        }

        $tasksByProject = Task::where(['project'=>$project])->orderBy('priority', 'asc')->get();

        $returnObj->data = $tasksByProject;
        return response()->json($returnObj);
    }

    public function getAllProjects(Request $request){
        $projectArr = Project::all();

        $returnObj = new stdClass();
        $returnObj->error = false;
        $returnObj->status = 200;
        $returnObj->data = $projectArr;

        return response()->json($returnObj);
    }
}
