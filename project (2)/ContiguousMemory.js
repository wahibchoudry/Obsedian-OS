// ================== SWITCH PANEL ===================
function switchPartitioningType() {
  const type = document.getElementById('partitioningType').value;
  document.getElementById('fixed-panel').style.display = (type === 'fixed') ? 'block' : 'none';
  document.getElementById('variable-panel').style.display = (type === 'variable') ? 'block' : 'none';

  if (type === 'variable') renderVariableMemory();
  else renderFixedBlock();
}

// ================== FIXED PARTITIONING ===================
let fixedBlocks = [];
let memoryBlockSize = 0;
let remainingMemory = 0;

let processes = [];

function initializeBlock() {
  const input = parseInt(document.getElementById("block-size").value);
  const msg = document.getElementById("fixed-notify");
  if (isNaN(input) || input <= 0) {
    msg.textContent = "Enter a valid total memory size.";
    return;
  }

  memoryBlockSize = input;
  remainingMemory = memoryBlockSize;
  fixedBlocks = []; // clear blocks
  msg.textContent = `Memory of ${memoryBlockSize}MB initialized. Now you can create memory blocks.`;
  renderFixedBlock();
}
function createBlock() {
  const size = parseInt(document.getElementById("custom-block-size").value);
  const msg = document.getElementById("fixed-notify");

  if (isNaN(size) || size <= 0) {
    msg.textContent = "Enter a valid block size.";
    return;
  }

  if (size > remainingMemory) {
    msg.textContent = `Not enough memory left. Only ${remainingMemory}MB available.`;
    return;
  }

  fixedBlocks.push({ used: false, size: size, process: null });
  remainingMemory -= size;
  msg.textContent = `Block of ${size}MB created. Remaining memory: ${remainingMemory}MB`;
  renderFixedBlock();
}


function renderFixedBlock() {
  const container = document.getElementById("fixed-memory-visual");
  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "fixed-memory-row";
  container.appendChild(row);

  fixedBlocks.forEach((block, index) => {
    const div = document.createElement("div");
    div.className = "memory-block";
    div.style.width = (block.size / memoryBlockSize * 100) + "%";
 // proportional width
    div.style.backgroundColor = block.used ? "#4caf50" : "#ccc";
    div.innerHTML = block.used
  ? `<strong>${block.process}</strong><br><small>Block ${index + 1}</small>`
  : `<strong>Free (${block.size}MB)</strong><br><small>Block ${index + 1}</small>`;

div.title = `${block.used ? block.process : 'Free'} (${block.size}MB)`;

    row.appendChild(div);
  });
}


function allocateFixedWithStrategy() {
  const size = parseInt(document.getElementById("process-size-fixed").value);
  const strategy = document.getElementById("fixed-strategy").value;
  const msg = document.getElementById("fixed-notify");

  if (isNaN(size) || size <= 0) {
    msg.textContent = "Enter a valid process size.";
    return;
  }

  const pid = "P" + Math.floor(Math.random() * 1000);
  let bestIndex = -1;

  if (strategy === "first") {
    bestIndex = fixedBlocks.findIndex(b => !b.used && b.size >= size);
  } else if (strategy === "best") {
    let minSize = Infinity;
    fixedBlocks.forEach((b, i) => {
      if (!b.used && b.size >= size && b.size < minSize) {
        minSize = b.size;
        bestIndex = i;
      }
    });
  } else if (strategy === "worst") {
    let maxSize = -1;
    fixedBlocks.forEach((b, i) => {
      if (!b.used && b.size >= size && b.size > maxSize) {
        maxSize = b.size;
        bestIndex = i;
      }
    });
  }

  if (bestIndex === -1) {
    msg.textContent = "No suitable block found.";
    return;
  }

  const block = fixedBlocks[bestIndex];
const remaining = block.size - size;
fixedBlocks.splice(bestIndex, 1, 
  { used: true, size: size, process: pid }, 
  ...(remaining > 0 ? [{ used: false, size: remaining, process: null }] : [])
);

  msg.textContent = `Allocated ${pid} using ${strategy.toUpperCase()} Fit strategy.`;
  renderFixedBlock();
}

function resetFixedBlock() {
  fixedBlocks = [];
  memoryBlockSize = 0;
  document.getElementById("fixed-notify").textContent = "Fixed memory reset.";
  renderFixedBlock();
}

// ================== VARIABLE-SIZED PARTITIONING ===================
let totalVariableMemory = 0;
let variableMemory = [];

function initVariableMemory() {
  const input = parseInt(document.getElementById("variable-total").value);
  const notify = document.getElementById("variable-message");
  if (isNaN(input) || input <= 0) {
    notify.textContent = "Enter valid total memory.";
    return;
  }
  totalVariableMemory = input;
  variableMemory = [{ start: 0, size: totalVariableMemory, free: true, process: null }];
  notify.textContent = `Variable memory of ${totalVariableMemory}MB initialized.`;
  renderVariableMemory();
}

function allocateVariableMemory() {
  
  const pid = document.getElementById("variable-process-id").value.trim();
  const size = parseInt(document.getElementById("variable-process-size").value);
  const msg = document.getElementById("variable-message");

  if (!pid || isNaN(size) || size <= 0) {
    msg.textContent = "Please enter valid process ID and size.";
    return;
  }

  // Try to find the first large enough hole (no strategy, just first fit style)
  for (let i = 0; i < variableMemory.length; i++) {
    const block = variableMemory[i]; 
    if (!block.occupied && block.size >= size) {
      const remaining = block.size - size;
      block.occupied = true;
      block.pid = pid;
      block.size = size;

      if (remaining > 0) {
        variableMemory.splice(i + 1, 0, { size: remaining, occupied: false });
      }

      msg.textContent = `Allocated ${size} KB to process ${pid}.`;
      renderVariableMemory();
      return;
    }
  }

  msg.textContent = "Not enough memory to allocate.";
}




function renderVariableMemory() {
  const visual = document.getElementById("variable-visual");
  visual.innerHTML = ''; // Clear previous blocks

  variableMemory.forEach(block => {
    const div = document.createElement("div");
    div.className = "memory-block-inner";
    div.classList.toggle("free", !block.occupied);
div.textContent = block.occupied ? `${block.pid} (${block.size}MB)` : `Free (${block.size}MB)`;

    div.style.width = (block.size / totalVariableMemory * 100) + "%";
    div.textContent = block.free ? `Free (${block.size}MB)` : `${block.pid} (${block.size}MB)`;

    visual.appendChild(div);
  });
}



function resetVariableMemory() {
  variableMemory = [{ start: 0, size: totalVariableMemory, free: true, process: null }];
  document.getElementById("variable-message").textContent = "Variable memory reset.";
  renderVariableMemory();
}

window.onload = () => {
  renderFixedBlock();
  renderVariableMemory();
};

outer.innerHTML = ""; // Clear previous

allocations.forEach(block => {
  const div = document.createElement("div");
  div.className = "memory-block-inner";
  div.style.width = `${(block.size / totalMemory) * 100}%`;
  div.style.backgroundColor = "green";
  div.textContent = `P${block.pid} (${block.size}MB)`;
  outer.appendChild(div);
});
