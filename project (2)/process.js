
let readyQueue = [];
let blockedQueue = [];
let runningProcess = null;
let ganttData = [];

function updateProcessTable() {
  const tbody = document.querySelector('#process-table tbody');
  tbody.innerHTML = '';
  processes.forEach(proc => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${proc.id}</td>
      <td>${proc.name}</td>
      <td>${proc.priority}</td>
      <td>${proc.status}</td>
      <td>${proc.id}</td>
      <td>${proc.burst}</td>
      <td>${proc.arrival}</td>
    `;
    tbody.appendChild(row);
  });
}

function updateQueues() {
  document.getElementById('ready-queue').textContent = readyQueue.map(p => p.id).join(', ') || 'None';
  document.getElementById('blocked-queue').textContent = blockedQueue.map(p => p.id).join(', ') || 'None';
  document.getElementById('running-process').textContent = runningProcess ? runningProcess.id : 'None';
}
function runScheduler() {
  const algo = document.getElementById('scheduler-select').value;
  let quantum = 2;

  if (algo === 'rr') {
    const inputQuantum = parseInt(document.getElementById('time-quantum').value);
    if (!isNaN(inputQuantum)) quantum = inputQuantum;
  }

  if (readyQueue.length === 0) {
    showNotification('proc-notification', 'No processes to schedule.');
    return;
  }
  ganttData.length = 0;
  updateQueues();
  updateProcessTable();

  if (algo === 'fcfs') {
    simulateFCFS();
    readyQueue = readyQueue.filter(p => p.remaining > 0);

  } else if (algo === 'rr') {
    simulateRoundRobin(quantum);
    readyQueue = readyQueue.filter(p => p.remaining > 0);

  } else if (algo === 'sjf') {
  runSJFNonPreemptive();
}
 else if (algo === 'PriorityP') {
    runPrioritySchedulingPreemptive();
    readyQueue = readyQueue.filter(p => p.remaining > 0);

  } else {
    showNotification('proc-notification', 'Unsupported scheduling algorithm.');
  }
}
function drawGanttChart() {
  const chart = document.getElementById('gantt-chart');
  chart.innerHTML = '';
  const colorMap = {};
  let currentTime = 0;

  ganttData.forEach(entry => {
    const div = document.createElement('div');

    // Assign consistent color per process ID
    if (!colorMap[entry.id]) {
      colorMap[entry.id] = '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    div.style.width = (entry.duration * 40) + 'px';
    div.style.height = '40px';
    div.style.backgroundColor = colorMap[entry.id];
    div.style.color = 'white';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.border = '1px solid #333';

    div.innerHTML = `
      <strong>${entry.id}</strong>
      <small>${currentTime} - ${currentTime + entry.duration}</small>
    `;

    currentTime += entry.duration;
    chart.appendChild(div);
  });

  showProcessMetrics();
}

function showProcessMetrics() {
  const metricsContainer = document.getElementById('process-metrics');
  if (!metricsContainer) return;

  const table = document.createElement('table');
  table.className = 'table';

  const header = `
    <thead>
      <tr>
        <th>Process ID</th>
        <th>Burst Time</th>
        <th>Arrival Time</th>
        <th>Completion Time</th>
        <th>Turnaround Time</th>
        <th>Waiting Time</th>
      </tr>
    </thead>
    <tbody>
  `;

  let currentTime = 0;
  const rows = processes.map(p => {
    const completionTime = ganttData
      .filter(entry => entry.id === p.id)
      .reduce((acc, entry) => acc + entry.duration, 0) + p.arrival;

    const tat = completionTime - p.arrival;
    const wt = tat - p.burst;

    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.burst}</td>
        <td>${p.arrival}</td>
        <td>${completionTime}</td>
        <td>${tat}</td>
        <td>${wt}</td>
      </tr>
    `;
  }).join('');

  table.innerHTML = header + rows + '</tbody>';
  metricsContainer.innerHTML = '<h4>Process Metrics</h4>';
  metricsContainer.appendChild(table);
}


function isProcessIdUnique(id) {
  return !processes.some(p => p.id === id);
}

function createProcess() {
  const name = document.getElementById('proc-name').value.trim();
  const priority = parseInt(document.getElementById('proc-priority').value);
  const id = document.getElementById('processId').value.trim();
  const burst = parseInt(document.getElementById('burstTime').value);
  const arrival = parseInt(document.getElementById('arrivalTime').value);

  if (!id || !name || isNaN(priority) || isNaN(burst) || isNaN(arrival)) {
    alert("Please fill all fields correctly.");
    return;
  }

  if (!isProcessIdUnique(id)) {
    alert("Process ID must be unique.");
    return;
  }

  const newProcess = {
    id,
    name,
    priority,
    burst,
    arrival,
    remaining: burst,
    status: "Ready"
  };

  processes.push(newProcess);
  readyQueue.push(newProcess);
  updateProcessTable();
  updateQueues();
  showNotification('proc-notification', `Process ${id} created.`);
}

// Additional process functions
function dispatchProcess() {
  if (readyQueue.length === 0) {
    showNotification('proc-notification', 'No processes to dispatch.');
    return;
  }
  const proc = readyQueue.shift();
  proc.status = 'Running';
  runningProcess = proc;
  updateProcessTable();
  updateQueues();
  showNotification('proc-notification', `Process ${proc.id} dispatched.`);
}

function blockProcess() {
  const id = prompt("Enter Process ID to block:");
  const proc = processes.find(p => p.id === id);
  if (!proc || (proc.status !== 'Ready' && proc.status !== 'Running')) {
    showNotification('proc-notification', 'Process not found or not in valid state.');
    return;
  }
  proc.status = 'Blocked';
  readyQueue = readyQueue.filter(p => p.id !== id);
  if (runningProcess?.id === id) runningProcess = null;
  blockedQueue.push(proc);
  updateProcessTable();
  updateQueues();
}

function wakeupProcess() {
  const id = prompt("Enter Process ID to wakeup:");
  const proc = processes.find(p => p.id === id);
  if (!proc || proc.status !== 'Blocked') {
    showNotification('proc-notification', 'Only blocked processes can be woken up.');
    return;
  }
  proc.status = 'Ready';
  blockedQueue = blockedQueue.filter(p => p.id !== id);
  readyQueue.push(proc);
  updateProcessTable();
  updateQueues();
}

function changePriority() {
  const id = prompt("Enter Process ID to change priority:");
  const proc = processes.find(p => p.id === id);
  if (!proc) {
    showNotification('proc-notification', 'Process not found.');
    return;
  }
  const newPriority = parseInt(prompt(`Enter new priority for Process ${id}:`));
  if (isNaN(newPriority)) {
    showNotification('proc-notification', 'Invalid priority entered.');
    return;
  }
  proc.priority = newPriority;
  updateProcessTable();
  updateQueues();
  showNotification('proc-notification', `Priority of Process ${id} updated to ${newPriority}.`);
}

function suspendProcess() {
  const id = prompt("Enter Process ID to suspend:");
  const proc = processes.find(p => p.id === id);
  if (!proc || (proc.status !== 'Ready' && proc.status !== 'Running')) {
    showNotification('proc-notification', 'Only Ready or Running processes can be suspended.');
    return;
  }
  proc.status = 'Suspended';
  readyQueue = readyQueue.filter(p => p.id !== id);
  if (runningProcess?.id === id) runningProcess = null;
  updateProcessTable();
  updateQueues();
}

function resumeProcess() {
  const id = prompt("Enter Process ID to resume:");
  const proc = processes.find(p => p.id === id);
  if (!proc || proc.status !== 'Suspended') {
    showNotification('proc-notification', 'Only suspended processes can be resumed.');
    return;
  }
  proc.status = 'Ready';
  readyQueue.push(proc);
  updateProcessTable();
  updateQueues();
}

function terminateProcess() {
  const id = prompt("Enter Process ID to terminate:");
  const proc = processes.find(p => p.id === id);
  if (!proc) {
    showNotification('proc-notification', 'Process not found.');
    return;
  }

  readyQueue = readyQueue.filter(p => p.id !== id);
  blockedQueue = blockedQueue.filter(p => p.id !== id);
  if (runningProcess?.id === id) runningProcess = null;

  proc.status = 'Terminated';
  updateProcessTable();
  updateQueues();
}

function resetSimulation() {
  processes.length = 0;
  readyQueue.length = 0;
  blockedQueue.length = 0;
  ganttData.length = 0;
  runningProcess = null;

  const tbody = document.querySelector('#process-table tbody');
  if (tbody) tbody.innerHTML = '';

  document.getElementById('ready-queue').textContent = 'None';
  document.getElementById('blocked-queue').textContent = 'None';
  document.getElementById('running-process').textContent = 'None';
  document.getElementById('gantt-chart').innerHTML = '';

  showNotification('proc-notification', 'Simulation reset successfully.');
}

// Global bindings
window.createProcess = createProcess;
window.dispatchProcess = dispatchProcess;
window.blockProcess = blockProcess;
window.wakeupProcess = wakeupProcess;
window.changePriority = changePriority;
window.resumeProcess = resumeProcess;
window.suspendProcess = suspendProcess;
window.terminateProcess = terminateProcess;
window.resetAllProcesses = resetSimulation;
window.runScheduler = runScheduler;

function simulateRoundRobin(quantum) {
  let queue = [...readyQueue];
  let index = 0;

  function next() {
    if (queue.every(p => p.remaining <= 0)) {
      runningProcess = null;
      updateQueues();
      updateProcessTable();
      drawGanttChart();
      showNotification('proc-notification', 'Round Robin scheduling complete.');
      return;
    }

    const proc = queue[index % queue.length];
    index++;

    if (proc.remaining <= 0) {
      next();
      return;
    }

    proc.status = 'Running';
    runningProcess = proc;
    updateProcessTable();
    updateQueues();

    const timeSlice = Math.min(quantum, proc.remaining);

    setTimeout(() => {
      proc.remaining -= timeSlice;
      ganttData.push({ id: proc.id, duration: timeSlice });

      proc.status = proc.remaining > 0 ? 'Ready' : 'Terminated';
ganttData.push({ id: proc.id, duration: X });

      runningProcess = null;
      updateProcessTable();
      updateQueues();
      drawGanttChart();
      next();
    }, timeSlice * 1000);
  }

  next();
}

function runPrioritySchedulingNonPreemptive(index = 0) {
  readyQueue.sort((a, b) => b.priority - a.priority); // Higher value = higher priority

  if (index >= readyQueue.length) {
    runningProcess = null;
    updateQueues();
    updateProcessTable();
    drawGanttChart();
    showNotification('proc-notification', 'Non-preemptive priority scheduling complete.');
    return;
  }

  const proc = readyQueue[index];
  proc.status = 'Running';
  runningProcess = proc;
  updateProcessTable();
  updateQueues();

  setTimeout(() => {
    proc.status = 'Terminated';
    ganttData.push({ id: proc.id, duration: proc.burst });
    runningProcess = null;
    updateProcessTable();
    updateQueues();
    drawGanttChart();
    runPrioritySchedulingNonPreemptive(index + 1);
  }, proc.burst * 1000);
}

function runPrioritySchedulingPreemptive() {
  let queue = [...readyQueue];
  let time = 0;

  function nextStep() {
    queue = queue.filter(p => p.remaining > 0);

    if (queue.length === 0) {
      runningProcess = null;
      updateQueues();
      updateProcessTable();
      drawGanttChart();
      showNotification('proc-notification', 'Preemptive priority scheduling complete.');
      return;
    }

    // Sort: higher priority value gets precedence
    queue.sort((a, b) => b.priority - a.priority);
    const proc = queue[0];

    proc.status = 'Running';
    runningProcess = proc;
    updateProcessTable();
    updateQueues();

    setTimeout(() => {
      proc.remaining -= 1;
      ganttData.push({ id: proc.id, duration: 1 });

      proc.status = proc.remaining > 0 ? 'Ready' : 'Terminated';
      ganttData.push({ id: proc.id, duration: X });
      runningProcess = null;
      updateProcessTable();
      updateQueues();
      drawGanttChart();
      nextStep();
    }, 1000);
  }

  nextStep();
}

function simulateFCFS(index = 0) {
  readyQueue.sort((a, b) => a.arrival - b.arrival);

  if (index >= readyQueue.length) {
    runningProcess = null;
    updateQueues();
    updateProcessTable();
    drawGanttChart();
    showNotification('proc-notification', 'FCFS scheduling complete.');
    return;
  }

  const proc = readyQueue[index];
  proc.status = 'Running';
  runningProcess = proc;
  updateProcessTable();
  updateQueues();

  setTimeout(() => {
    proc.status = 'Terminated';
    ganttData.push({ id: proc.id, duration: proc.burst });
    runningProcess = null;
    updateProcessTable();
    updateQueues();
    drawGanttChart();
    simulateFCFS(index + 1);
  }, proc.burst * 1000);
}
function runSJFNonPreemptive(index = 0) {
  readyQueue.sort((a, b) => a.burst - b.burst); // Sort by burst time

  if (index >= readyQueue.length) {
    runningProcess = null;
    updateQueues();
    updateProcessTable();
    drawGanttChart();
    showNotification('proc-notification', 'SJF scheduling complete.');
    return;
  }

  const proc = readyQueue[index];
  proc.status = 'Running';
  runningProcess = proc;
  updateProcessTable();
  updateQueues();

  setTimeout(() => {
    proc.status = 'Terminated';
    ganttData.push({ id: proc.id, duration: proc.burst });
    runningProcess = null;
    updateProcessTable();
    updateQueues();
    drawGanttChart();
    runSJFNonPreemptive(index + 1);
  }, proc.burst * 1000);
}
