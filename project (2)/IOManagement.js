let states = ["New", "Ready", "Running", "Waiting (I/O)", "Running", "Terminated"];
let currentIndex = 0;

function updateStateDisplay() {
  const currentState = states[currentIndex];
  document.getElementById("current-state").textContent = currentState;

  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  states.forEach((state, idx) => {
    const span = document.createElement("span");
    span.textContent = state;
    if (idx === currentIndex) {
      span.classList.add("active");
    }
    timeline.appendChild(span);
  });
}

function logIOEvent(message) {
  const logArea = document.getElementById("io-log");
  const time = new Date().toLocaleTimeString();
  logArea.innerHTML += `[${time}] ${message}<br/>`;
  logArea.scrollTop = logArea.scrollHeight;
}

function requestIO() {
  const pid = document.getElementById("io-proc-id").value;
  const device = document.getElementById("io-device").value;

  if (!pid || !device) {
    alert("Please enter both Process ID and Device.");
    return;
  }

  currentIndex = 1; // Ready
  updateStateDisplay();
  logIOEvent(`Process ${pid} requested I/O on device ${device}`);
  logIOEvent(`Process moved to Ready state.`);
}

function runProcess() {
  if (states[currentIndex] === "Ready") {
    currentIndex = 2; // Running
    updateStateDisplay();
    logIOEvent(`Process dispatched to CPU. Moved to Running state.`);
  } else {
    alert("Can only dispatch from Ready state.");
  }
}

function triggerIO() {
  if (states[currentIndex] === "Running") {
    currentIndex = 3; // Waiting (I/O)
    updateStateDisplay();
    logIOEvent("I/O requested. Process moved to Waiting state.");
  } else {
    alert("Can only trigger I/O from Running state.");
  }
}

function completeIO() {
  if (states[currentIndex] === "Waiting (I/O)") {
    currentIndex = 4; // Back to Running
    updateStateDisplay();
    logIOEvent("I/O completed. Process resumed running.");

    setTimeout(() => {
      currentIndex = 5; // Terminated
      updateStateDisplay();
      logIOEvent("Process terminated.");
    }, 1500);
  } else {
    alert("I/O can only complete from Waiting (I/O) state.");
  }
}

function startProcess() {
  currentIndex = 1; // Ready
  updateStateDisplay();
  logIOEvent("Process started. Moved to Ready state.");
}

window.onload = updateStateDisplay;
