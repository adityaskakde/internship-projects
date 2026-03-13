// localStorage se tasks load karte hain
let tasks = JSON.parse(localStorage.getItem("tasks")) || []

// screen par tasks render karne ka function
function renderTasks(){

const taskList = document.getElementById("taskList")

taskList.innerHTML=""

// har task ko list me add karte hain
tasks.forEach((task,index)=>{

const li = document.createElement("li")

li.innerHTML = `

<span class="${task.completed ? "completed":""}">
${task.text} - ${task.date}
</span>

<div class="actions">

<button class="complete" onclick="toggleComplete(${index})">
Done
</button>

<button class="edit" onclick="editTask(${index})">
Edit
</button>

<button class="delete" onclick="deleteTask(${index})">
Delete
</button>

</div>
`

taskList.appendChild(li)

})

// render hone ke baad progress update karte hain
updateProgress()

// tasks ko localStorage me save kar dete hain
localStorage.setItem("tasks",JSON.stringify(tasks))

}


// new task add karne ka function
function addTask(){

const text = document.getElementById("taskInput").value
const date = document.getElementById("taskDate").value

// empty task add nahi karte
if(text === "") return

tasks.push({

text:text,
date:date,
completed:false

})

// input clear karte hain
document.getElementById("taskInput").value=""

renderTasks()

}


// task delete karne ka function
function deleteTask(index){

tasks.splice(index,1)

renderTasks()

}


// task edit karne ka function
function editTask(index){

const newText = prompt("Edit task",tasks[index].text)

if(newText){

tasks[index].text = newText

renderTasks()

}

}


// task complete mark karne ka function
function toggleComplete(index){

tasks[index].completed = !tasks[index].completed

renderTasks()

}


// search functionality
function searchTask(){

const search = document.getElementById("searchInput").value.toLowerCase()

const list = document.querySelectorAll("li")

list.forEach(item=>{

const text = item.innerText.toLowerCase()

if(text.includes(search)){

item.style.display="flex"

}else{

item.style.display="none"

}

})

}


// progress bar update
function updateProgress(){

const completed = tasks.filter(t=>t.completed).length

const total = tasks.length

const percent = total === 0 ? 0 : (completed/total)*100

document.getElementById("progressBar").style.width = percent+"%"

}


// page load par tasks show karte hain
renderTasks()