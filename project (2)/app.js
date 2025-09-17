
function showNotification(id, msg) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = msg;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}
let processes = JSON.parse(localStorage.getItem('pcbProcesses')) || [];



function showSection(key) {
  const map = {
    process: 'process-panel',
    memory: 'memory-panel',
    io: 'io-panel',
    sync: 'sync-panel'
  };
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.style.display = 'none');

  document.getElementById(`${sectionId}-panel`).style.display = 'block';
}

  Object.values(map).forEach(id => {
    const section = document.getElementById(id);
    if (section) section.style.display = 'none';
  });

  const active = document.getElementById(map[key]);
  if (active) {
    active.style.display = 'block';
  }
}

window.onload = () => {
  showSection('process');

  const schedulerSelect = document.getElementById('scheduler-select');
  const quantumInput = document.getElementById('time-quantum');

  function toggleQuantum() {
    if (schedulerSelect.value === 'rr') {
      quantumInput.style.display = 'inline-block';
    } else {
      quantumInput.style.display = 'none';
    }
  }

  schedulerSelect.addEventListener('change', toggleQuantum);
  toggleQuantum();
};
