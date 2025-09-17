let semaphore = 1;
let criticalProcess = null;
const waitingQueue = [];
const allProcesses = new Set();

function logSem(msg) {
  const log = document.getElementById("sem-status");
  log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
}

function updateDisplay() {
  document.getElementById("critical-section-box").textContent = criticalProcess || "None";

  const waitingList = document.getElementById("waiting-list");
  waitingList.innerHTML = "";
  waitingQueue.forEach(pid => {
    const li = document.createElement("li");
    li.textContent = pid;
    waitingList.appendChild(li);
  });

  const allList = document.getElementById("all-processes");
  allList.innerHTML = "";
  allProcesses.forEach(pid => {
    const li = document.createElement("li");
    li.textContent = `${pid} - ${pid === criticalProcess ? "In CS" : (waitingQueue.includes(pid) ? "Waiting" : "Ready")}`;
    allList.appendChild(li);
  });
}

function enterCritical() {
  const pid = document.getElementById("sem-proc-id").value.trim();
  if (!pid) return alert("Enter a Process ID");
  allProcesses.add(pid);

  if (semaphore === 1) {
    semaphore = 0;
    criticalProcess = pid;
    logSem(`Process ${pid} entered Critical Section.`);
  } else {
    waitingQueue.push(pid);
    logSem(`Process ${pid} is blocked and added to Waiting Queue.`);
  }
  updateDisplay();
}

function leaveCritical() {
  if (semaphore === 0) {
    logSem(`Process ${criticalProcess} left Critical Section.`);
    semaphore = 1;

    if (waitingQueue.length > 0) {
      const next = waitingQueue.shift();
      criticalProcess = next;
      semaphore = 0;
      logSem(`Process ${next} entered Critical Section from queue.`);
    } else {
      criticalProcess = null;
    }
  } else {
    logSem("No process in critical section to leave.");
  }
  updateDisplay();
}
