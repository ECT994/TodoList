let taskAddButton = document.getElementById("task-add-button");
let tasksList = document.getElementById("tasks-list");
let taskContent = document.getElementById("task-content");
let taskCategory = document.getElementById("task-category");
let counterTot = document.getElementById("task-counter");
const HTTP_STATUS_SUCCESS = 200;
const REST_API_ENDPOINT = 'http://localhost:8080';
let counter = 0;


function updateCategoriesList() {
   
    let ajaxRequest = new XMLHttpRequest();

    
    ajaxRequest.onload = function () {
        let categories = JSON.parse(ajaxRequest.response);
        for (let category of categories) {
            let newOption = document.createElement("option");
            newOption.value = category.id;
            newOption.innerText = category.name;
            taskCategory.appendChild(newOption);

        }
    }
   
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/");

  
    ajaxRequest.send();
}

updateCategoriesList();

function createTask(task) {
   
    let newTaskLine = document.createElement("div");
    newTaskLine.setAttribute("class", "task-wrap")
    newTaskLine.setAttribute("data-id", task.id);

    let colorSelect = document.createElement("span");
    colorSelect.setAttribute("class", "category-color");
    newTaskLine.appendChild(colorSelect);

    
    let newCheck = document.createElement("INPUT");
    newCheck.setAttribute("type", "checkbox");

    if (task.done) {
        newTaskLine.classList.add("done");
        newCheck.checked = true;
    }

    if (!task.done) {
        counterTot.innerText = "Task to Do : " + ++counter;
    }

    newCheck.style.marginLeft = "10px"
    newTaskLine.appendChild(newCheck);

    let newText = document.createElement("span");
    newText.classList.add("task-text");
    newText.innerText = task.name;
    newTaskLine.appendChild(newText);

    let newDate = document.createElement("span");
    newDate.classList.add("task-date");
    newDate.innerText = task.created;
    newTaskLine.appendChild(newDate);


    let edit = document.createElement("button");
    edit.style.visibility = task.done ? "hidden" : "visible";
    edit.setAttribute("class", "edit");
    edit.innerHTML = '<i class="fas fa-edit"></i>';

    newTaskLine.appendChild(edit);

    edit.addEventListener("click", function () {
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "form-control form-control-lg input-text-update")
        input.setAttribute("id", "input-edit-" + task.id);

        if (newTaskLine.classList.contains("editing")) {
            let inputEdit = document.getElementById("input-edit-" + task.id);
            let taskContent = {
                name: inputEdit.value
            };
            updateTask(task.id, taskContent, () => {
                task.name = inputEdit.value;
                newText.innerText = task.name;
                inputEdit.replaceWith(newText);
                edit.innerHTML = '<i class="fas fa-edit"></i>';
                newTaskLine.classList.remove("editing");
                newCheck.style.visibility = "visible"
            });

        } else {

            input.value = task.name;
            newText.replaceWith(input);
            edit.innerHTML = '<i class="fas fa-save"></i>';
            newTaskLine.classList.add("editing");
            newCheck.style.visibility = "hidden"
        }

    });

    let trashRemove = document.createElement("button");
    trashRemove.setAttribute("class", "bin-delete");
    trashRemove.innerHTML = '<i class="fas fa-trash"></i>';
    newTaskLine.appendChild(trashRemove);

    tasksList.appendChild(newTaskLine);
    taskContent.value = "";

    trashRemove.addEventListener("dblclick", function () {
        deleteTask(task.id, newTaskLine);

        if (!task.done) {
            counterTot.innerText = "Task to Do : " + --counter;
        }
        if (task.done) {
            counterTot.innerText = "Task to Do : " + counter;
        }
    });



    newCheck.addEventListener("click", function () {
        task.done = !task.done;

        let taskContent = {
            done: task.done
        };


        setDone(task.id, taskContent, () => {
            newTaskLine.classList.toggle("done");
            edit.style.visibility = task.done ? "hidden" : "visible";

            if (task.done) {
                counterTot.innerText = "Task to Do : " + --counter;
            } else {
                counterTot.innerText = "Task to Do : " + ++counter;
            }

        });
    })

}

function updateTasksList() {
    tasksList.innerHTML = "";
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        let tasks = JSON.parse(ajaxRequest.response);

        for (let task of tasks) {
            createTask(task);
        }
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    ajaxRequest.send();
}

updateTasksList();

function saveTask(taskToSave, succesfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            let savedTask = JSON.parse(ajaxRequest.response);
            console.log(savedTask);
            createTask(savedTask);
            succesfullCallback();
        }
    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    ajaxRequest.setRequestHeader("content-type", "application/json"); // passa dei dati in formatto Json
    let body = {
        name: taskToSave.name,
        category: {
            id: taskToSave.categoryId
        },
        created: new Date()
    };
    ajaxRequest.send(JSON.stringify(body));
}

function updateTask(taskId, taskContent, succesfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            succesfullCallback();
        }

    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}


function setDone(taskId, taskContent, succesfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            succesfullCallback();
        }

    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/set-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}


function deleteTask(taskId, taskHtmlElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            taskHtmlElement.remove();

        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send();
}

taskAddButton.addEventListener("click", function () {

    let taskContentValue = taskContent.value;
    let categoryId = taskCategory.value;

    if (taskContentValue.length < 1) {
        alert("Please write something to add !!");
        return;
    }

    if (categoryId == "Select Category") {
        alert("Please select category!!");
        return;
    }

    let task = {
        name: taskContentValue,
        categoryId: taskCategory.value
    };

    saveTask(task);

});

