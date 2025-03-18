// Selectors
const dateNow = document.getElementById("date");
const timeNow = document.getElementById("time");
const todoInput = document.getElementById("todo-input");
const todoButton = document.getElementById("add-todo-btn");
const todoList = document.querySelector(".todo-list");
const checkBox = document.querySelector(".check-btn");
const delAllButton = document.querySelector(".delete-all");
const searchInput = document.getElementById("search-task-input");




// Event Listeners
document.addEventListener("DOMContentLoaded", getTodos);
todoButton.addEventListener("click", addToDo);
todoList.addEventListener("click", deleteTodo);
todoList.addEventListener("click", editTodoText); 
delAllButton.addEventListener("click", deleteAll);
todoList.addEventListener("change", completedTodo);
searchInput.addEventListener("input", searchTodo);
todoInput.addEventListener("click", clearSearch);
todoInput.addEventListener("input", clearSearch);
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addToDo(e);
  }
});

// Display current date
const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
const today = new Date();
dateNow.innerHTML = today.toLocaleDateString("en-US", options);

// Display current time
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0"); 
    const amPm = hours >= 12 ? "PM" : "AM";
    const twelveHourFormat = hours % 12 || 12;
    timeNow.innerHTML = `${twelveHourFormat}:${minutes} ${amPm}`;
}
setInterval(updateTime, 1000);

// Functions 

// Helper function to create a todo element
function renderTodoElement(todo) {
    // Create the main li element
    const todoLi = document.createElement("li");
    todoLi.classList.add("todo");
    todoLi.setAttribute("aria-label", "todo");  
  
    // Create and append the checkbox
    const checkBox = document.createElement("input");
    checkBox.classList.add("check-btn");
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("aria-label", "checkbox");
    todoLi.appendChild(checkBox);
  
    // Create and append the div item
    const newTodo = document.createElement("div");
    newTodo.innerText = todo;
    newTodo.classList.add("todo-item");
    todoLi.appendChild(newTodo);

    // Create edit button
    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️";
    editBtn.classList.add("edit-btn");
    todoLi.appendChild(editBtn);
  
    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "❌";
    deleteBtn.classList.add("delete-btn");
    todoLi.appendChild(deleteBtn);

    // Set the data-todo attribute  
    todoLi.setAttribute("data-todo", todo);
  
    // Append the todoLi to the todoList
    todoList.appendChild(todoLi);
}

// Helper function to retrieve todos from localStorage
function getTodosFromLocalStorage() {
    const todos = localStorage.getItem("todos");
    return todos ? JSON.parse(todos) : [];
}

// Add new todo
function addToDo(e) {
   // Prevent form from submiting 
  e.preventDefault();         

   // removes before and after spaces on input
  const input = todoInput.value.trim(); 

   // alert if no input
  if (input === "") {
    alert("You have not entered anything yet.");
    return;
  }

  // Check if there is already stored
  const todos = getTodosFromLocalStorage();
  if (todos.includes(input)) {
    alert("This task is already in your list!");
    return;
  }

  // Save to local storage
  saveToLocalStorage(input);
  
  // Render the new todo element
  renderTodoElement(input);
   
   // Clear input value
  todoInput.value = "";         
}

// Delete todo with X button
function deleteTodo(e) {
  const el = e.target;

  if (el.classList[0] === "delete-btn") {
    const todo = el.parentElement;    
    todo.remove();
    removeLocalTodos(todo);
  }
}

// Save to local storage
function saveToLocalStorage(todo) {
    
  const todos = getTodosFromLocalStorage();
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
}    

// Get todos from local storage
function getTodos() {
  const todos = getTodosFromLocalStorage();
  todos.forEach(renderTodoElement);
}   

// Remove from local storage
function removeLocalTodos(todo) {
  let todos = getTodosFromLocalStorage();
  const todoText = todo.getAttribute("data-todo");
  todos = todos.filter(t => t !== todoText);
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Delete all todos
function deleteAll() {
  const todos = localStorage.getItem("todos");
  if (todos !== null) {
    localStorage.clear("todos");
    todoList.innerHTML = "";
    todoInput.value = ""; 
  } else {
      alert("Nothing found!");
  }
}

// Completed todo
function completedTodo (e) {
  const item = e.target;
  if (item.classList.contains("check-btn")) {
    const todo = item.parentElement;
    const todoText = todo.querySelector(".todo-item");
    todoText.classList.toggle("completed");
  }
}

// Function to search and filter todos based on the input value
function searchTodo() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const todos = JSON.parse(localStorage.getItem("todos") || []);
  
  todoList.innerHTML = ""; // Clear the current list

  const searchTodos = todos.filter(todo => todo.toLowerCase().includes(searchValue));
  
  searchTodos.forEach(renderTodoElement);   

  if (searchTodos.length === 0) {
    const p = document.createElement("p");  
    p.classList.add("no-task");
    p.innerText = "No task found!";
    todoList.appendChild(p);
  }  
}

function clearSearch() {
  // Clear the search input
  searchInput.value = "";

  // Clear the todo list
  todoList.innerHTML = "";

  // Re-render all todos
  getTodos();
}

function editTodoText(e) {
  const el = e.target;

  if (el.classList[0] === ("edit-btn")) {
    const todo = el.parentElement;
    const todoTextElement = todo.querySelector(".todo-item");
    const oldText = todoTextElement.textContent;

    // Replace the text with an input field
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = oldText;
    inputField.classList.add("edit-todo-item");
    todo.replaceChild(inputField, todoTextElement);

    // Focus on the input field
    inputField.focus();

    // Handle saving the updated text
    const saveHandler = () => {
      saveEditedTodo(inputField, todo, oldText);
      inputField.removeEventListener("blur", saveHandler); // Remove the blur listener
      inputField.removeEventListener("keypress", keyPressHandler); // Remove the keypress listener
      location.reload();
    };

    const keyPressHandler = (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent default behavior
        saveHandler();
      }
    };

    inputField.addEventListener("blur", saveHandler);
    inputField.addEventListener("keypress", keyPressHandler);

  }
}

function saveEditedTodo(inputField, todo, oldText) {
  
  const newText = inputField.value.trim();
  let todos = getTodosFromLocalStorage();
 
  if (newText === "") {
    alert("Todo text cannot be empty!");
    inputField.value = oldText; // Revert to the old text
    return;
  }

  if (todos.includes(newText)) {
    alert("This task is already in your list!");
    inputField.value = oldText; // Revert to the old text
    return;
  }

  // Update the DOM
  const todoTextElement = document.createElement("div");
  todoTextElement.innerText = newText;
  todoTextElement.classList.add("todo-item");
  todo.replaceChild(todoTextElement, inputField);

  // Update local storage

  todos = todos.map((newTodo) => (newTodo === oldText ? newText : newTodo));
  localStorage.setItem("todos", JSON.stringify(todos));
}