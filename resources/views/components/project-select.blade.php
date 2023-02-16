<div id="project-select-container" class="p-2">
    <div class="text-xl font-bold">Select Project To Create Tasks</div>
    <div class="flex pb-3">
        <select name="projects" id="projects-select">
            <option disabled selected value> -- select an option -- </option>
        </select>
    </div>
    <div>
        <x-tasks />
        <div id="no-tasks-text" class="hidden text-lg font-bold">No tasks in this project!!!!</div>
        <div class="flex">
            <div class="bg-green-300 p-1 w-32 cursor-pointer hidden" id="new-task-btn">
                <span>New Task</span><span><i class="bi bi-plus"></i></span>
            </div>
            <div class="bg-red-300 p-1 w-32 ml-2 cursor-pointer hidden" id="cancel-task-btn">
                <span>Cancel Task</span><span><i class="bi bi-x"></i></span>
            </div>
        </div>
        <x-task-form />
    </div>

</div>