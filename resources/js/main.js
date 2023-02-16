// const { generate } = require("laravel-mix/src/BabelConfig");
var tasksState;
var currentProject = {
    name: null,
    id: null
}

// this block of code gets executed automatically when page is loaded
// it fetches all the projects and sets the draggable area for tasks
$( 
    async function(){
        let allProjects = await getAllProjects();
        allProjects.data.data.forEach(project => {
            const newOption = document.createElement('option');
            const optionText = document.createTextNode(project.name);
            newOption.appendChild(optionText);
            newOption.setAttribute('value', project.name);
            newOption.setAttribute('project_id', project.id);
            const select = document.querySelector('#projects-select');
            select.appendChild(newOption);
        });

// ############################ DRAGGABLE CODE ############################
        $( "#view-tasks-container" ).sortable({
            stop: async function( event, ui ) {
                await $('.item').each(function(idx, item){
                    let taskId = parseInt($(item).attr('taskid'));
                    tasksState.forEach((task, indice)=>{
                        if(task.id == taskId) tasksState[indice].priority = idx+1;
                    });
                });
                updateTasksPriority(tasksState);
            }
          });
    }
);

// expands the create new task panel when clicking the green "New Task" button
$('#new-task-btn').on('click', (e)=>{
    $('#form-container').removeClass('hidden');
    $('#cancel-task-btn').removeClass('hidden');
});

$('#cancel-task-btn').on('click', (e)=>{
    $('#form-container').addClass('hidden');
    $('#cancel-task-btn').addClass('hidden');
    $('#inp-task-name').val('');
});

$('#create-task-btn').on('click', (e)=>{
    if($('#inp-task-name').val() === ""){
        $('#inp-task-name').addClass('border-red-600 border-2');
        return false;
    }

    let newTask = {
        project_id: currentProject.id,
        project_name: currentProject.name,
        task_name: $('#inp-task-name').val(),
        task_priority: tasksState.length + 1
    }
    createTask(newTask);
});

// removes error red border on inputbox
$('#inp-task-name').on('keyup', (e)=>{
    $('#inp-task-name').removeClass('border-red-600 border-2');
});

$('#projects-select').on('change', async (e) => {
    let project = $('#projects-select').val();
    currentProject.id = $("#projects-select option:selected").attr("project_id");
    currentProject.name = project;
    let projectsData = await getTasksByProject(project);
    tasksState = projectsData.data.data;
    if(tasksState.length > 0) {
        $('#view-tasks-container').empty();
        $('#no-tasks-text').addClass('hidden');
        $('#view-tasks-container').removeClass('hidden');
        $('#new-task-btn').removeClass('hidden');
        renderTasks(tasksState);
    }
    else {
        $('#view-tasks-container').addClass('hidden');
        $('#no-tasks-text').removeClass('hidden');
        $('#new-task-btn').removeClass('hidden');
    }
});

// triggers event that shows task input box when clicking on task edit pen icon 
$(document).on('click', '.edit-task-btn', (e) => {
    let taskName = $($(e.currentTarget).parent().parent()).attr('name');
    $($(e.currentTarget).parent().siblings()[0]).removeClass('hidden');
    $($(e.currentTarget).parent().siblings()[0]).children().attr('placeholder', taskName);
    $($(e.currentTarget).parent().siblings()[1]).addClass('hidden');
});

$(document).on('click', '.delete-task-btn', (e) => {
    let taskId = $($(e.currentTarget).parent()).parent().attr('taskid');
    let taskName = $($(e.currentTarget).parent()).parent().attr('name');
    let taskPriority = $($(e.currentTarget).parent()).parent().attr('priority');
    $('#confirm-window, #backdrop').removeClass('hidden');
    $('#confirm-prompt').append(`<span>Do you want to delete the <span class="font-bold text-3xl">${taskName}</span> task?<span>`);

    // handles delete task cancel button
    $(document).on('click', '#confirm-no-btn, #backdrop', (b) => {
        $('#confirm-window, #backdrop').addClass('hidden');
        $('#confirm-prompt').empty();
    });

    // handles confirm delete yes button
    $(document).on('click', '#confirm-yes-btn', async (c) => {
        await deleteTask(tasksState[parseInt(taskPriority) - 1]);
        $('#confirm-window, #backdrop').addClass('hidden');
        $('#confirm-prompt').empty();
    });
});

// hides task input box after clicking edit task cancel button
$(document).on('click', '.cancel-btn', (e)=>{
    $($(e.currentTarget).parent()).addClass('hidden');
    $($(e.currentTarget).parent().siblings()[0]).removeClass('hidden');
});

//this updates a task when clicking update button
$(document).on('click', '.update-btn', async (e) => {
    let taskid = $($(e.currentTarget).parent()).attr('taskid');
    let taskname = $($(e.currentTarget).siblings()).val();
    
    if(taskname === ""){
        $($(e.currentTarget).siblings()).addClass('border-red-600 border-2');
        return false;
    }
    let task = {id: taskid, name: taskname }

    await axios({
        method: 'post',
        url: '/api/update-task-name',
        headers: {'Content-Type': 'application/json'},
        responseType: 'json',
        data: JSON.stringify({
          task: task
        }),
      })
      .then(function (response) {
        for (let index = 0; index < tasksState.length; index++) {
            const element = tasksState[index];
            if(element.id == response.data.task.id){
                tasksState[index].name = response.data.task.name;
                break;
            }
        }
        //   renderTasks(response.data.data);
      })
      .catch(function (error){
          if(error.response){
              console.log('error: ', error.response);
          }
      });
      await $('#view-tasks-container').empty();
      renderTasks(tasksState);
});

const createTask = async (task) => {
    axios({
      method: 'post',
      url: '/api/create-task',
      headers: {'Content-Type': 'application/json'},
      responseType: 'json',
      data: JSON.stringify({
        task: task
      }),
    })
    .then(async function (response) {
        await tasksState.push(response.data.data[0]);
        await $('#view-tasks-container').empty();
        renderTasks(tasksState);
    })
    .catch(function (error){
        if(error.response){
            console.log('error: ', error.response);
        }
    });
}

const getAllProjects = async () => {
    let returnData = null;
    await axios({
        method: 'get',
        url: '/api/get-all-projects',
        responseType: 'json',
    })
    .then(function (response) {
        returnData =  response;
    })
    .catch(function (error){
        returnData = error;
    });
    return returnData;
}

const getTasksByProject = async (project) => {
    let returnData = null;
    await axios({
        method: 'get',
        url: '/api/get-tasks-by-project',
        responseType: 'json',
        params: {
            'project': project
        },
    })
    .then(function (response) {
        returnData =  response;
    })
    .catch(function (error){
        returnData = error;
    });
    return returnData;
}

// receives an array of task to be rendered
const renderTasks = async (tasks) => {
    let list = document.getElementById('view-tasks-container');
    await tasks.forEach((task) => {
        let node = document.createElement('li');
        node.draggable = true;
        node.setAttribute('taskid', task.id);
        node.setAttribute('name', task.name);
        node.setAttribute('priority', task.priority);
        node.className = 'm-2 bg-gray-300 mb-3 py-3 px-2 text-slate-500 text-base font-semibold rounded-md grab item flex justify-between';

        let spanInput = document.createElement('span');
        spanInput.setAttribute('taskid', task.id);
        spanInput.setAttribute('name', task.name);
        spanInput.className = "hidden task-input-container";

        let input = document.createElement('input');
        input.type = "text";
        input.size = 14;
        input.className = "task-edit-input";
        spanInput.appendChild(input);

        let updateBtn = document.createElement('button');
        updateBtn.innerText = "update";
        updateBtn.className = "bg-green-500 mx-2 p-1 text-white update-btn";
        spanInput.appendChild(updateBtn);

        let cancelBtn = document.createElement('button');
        cancelBtn.innerText = "cancel";
        cancelBtn.className = "bg-red-500 text-white p-1 cancel-btn";
        spanInput.appendChild(cancelBtn);

        let spanName = document.createElement('span');
        spanName.innerText = task.name;

        let spanDelete = document.createElement('span');
        spanName.innerText = task.name;

        let iEdit = document.createElement('i');
        iEdit.className = "text-blue-500 text-xl mr-2 bi bi-pencil-fill cursor-pointer edit-task-btn";

        let iTrash = document.createElement('i');
        iTrash.className = "text-red-500 text-xl bi bi-trash3-fill cursor-pointer delete-task-btn";

        spanDelete.appendChild(iEdit);
        spanDelete.appendChild(iTrash);
        node.appendChild(spanInput);
        node.appendChild(spanName);
        node.appendChild(spanDelete);

        list.appendChild(node);
    });
}

// takes an array of the tasks to be updated, every element of the array
// must contain an object like the following: {'id':int, 'priority': int}
const updateTasksPriority = (tasks) => {
    axios({
        method: 'post',
        url: '/api/update-tasks-priority',
        headers: {'Content-Type': 'application/json'},
        responseType: 'json',
        data: JSON.stringify({
          tasks: tasks
        }),
      })
      .then(function (response) {
          console.log(response);
      })
      .catch(function (error){
          if(error.response){
              console.log('error1: ', error.response);
          }
      });
}

const deleteTask = async (task) => {
    axios({
        method: 'post',
        url: '/api/delete-task',
        headers: {'Content-Type': 'application/json'},
        responseType: 'json',
        data: JSON.stringify({
            task: task
        }),
    })
    .then(async(response) => {
        tasksState = await response.data.data;
        await $('#view-tasks-container').empty();
        renderTasks(tasksState)
    })
    .catch((error) => {
        if(error.response){
            console.log('error: ', error.response);
        }
    });
}