console.log("Funciona correctament!");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let streak = JSON.parse(localStorage.getItem("streak")) || 0;
let lastHabitDate = localStorage.getItem("lastHabitDate") || null;

let time = 1500;
let isBreak = false;
let interval;


function addTask() {
  const text = document.getElementById("taskInput").value;
  const priority = document.getElementById("priority").value;

  if (!text) return;

  tasks.push({
    text,
    priority,
    done: false
  });

  saveData();
  renderTasks();
  document.getElementById("taskInput").value = "";
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  // Ordenar per prioritat
  const priorityOrder = { "Alta": 1, "Mitjana": 2, "Baixa": 3 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span style="${task.done ? 'text-decoration:line-through' : ''}">
        ${task.text} (${task.priority})
      </span>
      <button onclick="completeTask(${index})">✔</button>
      <button onclick="deleteTask(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  updateSummary();
}

function completeTask(i) {
  tasks[i].done = !tasks[i].done;
  saveData();
  renderTasks();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  saveData();
  renderTasks();
}


function updateSummary() {
  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;

  document.getElementById("resum").innerText =
    `✔ ${completed}/${total} tasques completades avui`;
}

// Reset diari
function dailyReset() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem("lastVisit");

  if (lastVisit !== today) {
    tasks = [];
    saveData();
    localStorage.setItem("lastVisit", today);
  }
}

function startPomodoro() {
  clearInterval(interval);

  interval = setInterval(() => {
    time--;

    const min = Math.floor(time / 60);
    const sec = time % 60;

    document.getElementById("timer").innerText =
      `${min}:${sec < 10 ? "0" : ""}${sec}`;

    if (time <= 0) {
      clearInterval(interval);

      if (!isBreak) {
        alert("💪 Bona feina! Descans de 5 minuts");
        time = 300;
        isBreak = true;
        startPomodoro();
      } else {
        alert("⏳ Tornem a la feina!");
        time = 1500;
        isBreak = false;
      }
    }
  }, 1000);
}

function addHabit() {
  const today = new Date().toDateString();

  if (lastHabitDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastHabitDate === yesterday.toDateString()) {
    streak++;
  } else {
    streak = 1;
  }

  lastHabitDate = today;

  saveData();
  updateHabitUI();
}

function updateHabitUI() {
  document.getElementById("streak").innerText = streak;
}

let focus = false;

const frases = [
  "Centra't, el teu futur t'ho agrairà",
  "Menys scroll, més control",
  "Estàs construint disciplina",
  "Un petit esforç avui = gran resultat demà"
];

function toggleFocus() {
  focus = !focus;

  const msg = document.getElementById("focusMsg");

  if (focus) {
    document.body.style.background = "#d8f3dc";
    msg.innerText = frases[Math.floor(Math.random() * frases.length)];

    // Simulació bloqueig
    alert("🚫 Evita xarxes socials mentre estàs en mode focus!");
  } else {
    document.body.style.background = "#eef7f6";
    msg.innerText = "";
  }
}

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("streak", JSON.stringify(streak));
  localStorage.setItem("lastHabitDate", lastHabitDate);
}

dailyReset();
renderTasks();
updateHabitUI();