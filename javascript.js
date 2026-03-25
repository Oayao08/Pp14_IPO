console.log("Funciona correctament");

let tasks = [];
let streak = 0;
let time = 1500;
let interval;

console.log(tasks);
console.log(streak);
console.log(time);

// Afegir tasca
function addTask() {
  let text = document.getElementById("taskInput").value;
  let priority = document.getElementById("priority").value;

  if (!text) return;

  tasks.push({ text, priority, done: false });
  renderTasks();
}

// Renderitzar tasques
function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      ${task.text} (${task.priority})
      <button onclick="completeTask(${index})">✔</button>
      <button onclick="deleteTask(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  updateSummary();
}

// Completar tasca
function completeTask(i) {
  tasks[i].done = true;
  updateSummary();
}

// Eliminar tasca
function deleteTask(i) {
  tasks.splice(i, 1);
  renderTasks();
}

// Resum diari
function updateSummary() {
  let completed = tasks.filter((t) => t.done).length;
  document.getElementById("resum").innerText =
    `Has completat ${completed} tasques avui.`;
}

// Pomodoro
function startPomodoro() {
  clearInterval(interval);

  interval = setInterval(() => {
    time--;
    let min = Math.floor(time / 60);
    let sec = time % 60;

    document.getElementById("timer").innerText =
      `${min}:${sec < 10 ? "0" : ""}${sec}`;

    if (time <= 0) {
      clearInterval(interval);
      alert("Descans!");
      time = 1500;
    }
  }, 1000);
}

// Hàbits
function addHabit() {
  streak++;
  document.getElementById("streak").innerText = streak;
}

// Mode focus
let focus = false;

function toggleFocus() {
  focus = !focus;

  let msg = document.getElementById("focusMsg");

  if (focus) {
    msg.innerText = "🚫 Xarxes bloquejades. Mantén el focus!";
    document.body.style.background = "#d8f3dc";
  } else {
    msg.innerText = "";
    document.body.style.background = "#eef7f6";
  }
}

