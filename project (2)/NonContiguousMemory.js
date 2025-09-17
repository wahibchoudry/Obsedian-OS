// Updated JavaScript logic with all required features implemented
let totalMemory = 0;
let pageSize = 0;
let frameCount = 0;
let frames = [];
let pageTables = {};

function initializePaging() {
  const memoryInput = document.getElementById("total-memory").value;
  const pageSizeInput = document.getElementById("page-size").value;
  const msg = document.getElementById("paging-message");

  totalMemory = parseInt(memoryInput);
  pageSize = parseInt(pageSizeInput);

  if (isNaN(totalMemory) || isNaN(pageSize) || totalMemory <= 0 || pageSize <= 0) {
    msg.textContent = "Enter valid positive numbers.";
    return;
  }

  if (totalMemory % pageSize !== 0) {
    msg.textContent = "Page size must divide total memory exactly.";
    return;
  }

  frameCount = totalMemory / pageSize;
  frames = new Array(frameCount).fill(null);
  pageTables = {};
  msg.textContent = `Memory initialized with ${frameCount} frames.`;
  renderFrames();
  renderPageTables();
}

function allocateProcess() {
  const pid = document.getElementById("process-id").value.trim();
  const processSize = parseInt(document.getElementById("process-size").value);
  const msg = document.getElementById("paging-message");

  if (!pid || isNaN(processSize) || processSize <= 0) {
    msg.textContent = "Enter valid process ID and size.";
    return;
  }

  const pagesNeeded = Math.ceil(processSize / pageSize);
  const freeFrames = frames.reduce((acc, val, idx) => val === null ? acc.concat(idx) : acc, []);

  if (freeFrames.length < pagesNeeded) {
    msg.textContent = "Not enough free frames.";
    return;
  }

  pageTables[pid] = [];
  for (let i = 0; i < pagesNeeded; i++) {
    const frameIdx = freeFrames[i];
    frames[frameIdx] = { pid, page: i };
    pageTables[pid].push({ page: i, frame: frameIdx });
  }

  msg.innerHTML = `<div class="status-message">Allocated ${pagesNeeded} pages to process ${pid}</div>`;
  renderFrames();
  renderPageTables();

}
function deallocateProcess() {
  const pid = document.getElementById("process-id").value.trim();
  const msg = document.getElementById("paging-message");

  if (!pid || !pageTables[pid]) {
    msg.innerHTML = `<div class="status-message" style="color: red;">Process ID not found.</div>`;
    return;
  }

  // Free all frames associated with this process
  frames = frames.map(f => (f && f.pid === pid ? null : f));
  delete pageTables[pid];

  msg.innerHTML = `<div class="status-message" style="color: red;">All pages for process ${pid} have been deallocated.</div>`;

  renderFrames();
  renderPageTables();
}


function deallocatePage() {
  const pid = document.getElementById("dealloc-process-id").value.trim();
  const pageNum = parseInt(document.getElementById("page-to-remove").value);
  const msg = document.getElementById("deallocation-result");

  if (!pid || isNaN(pageNum)) {
    msg.textContent = "Enter valid process ID and page number.";
    return;
  }

  if (!pageTables[pid]) {
    msg.textContent = "Process not found.";
    return;
  }

  const index = pageTables[pid].findIndex(entry => entry.page === pageNum);
  if (index === -1) {
    msg.textContent = "Page not found for this process.";
    return;
  }

  const frameIdx = pageTables[pid][index].frame;
  frames[frameIdx] = null;
  pageTables[pid].splice(index, 1);

  if (pageTables[pid].length === 0) delete pageTables[pid];
  msg.textContent = `Page ${pageNum} of Process ${pid} deallocated.`;

  renderFrames();
  renderPageTables();
}

function renderFrames() {
  const visual = document.getElementById("frame-visual");
  visual.innerHTML = "";
  frames.forEach((frame, i) => {
    const div = document.createElement("div");
    div.className = "frame-box";
    div.textContent = frame ? `${frame.pid}:P${frame.page}` : "Free";
    visual.appendChild(div);
  });
}

function renderPageTables() {
  const container = document.getElementById("page-tables");
  container.innerHTML = "";
  Object.entries(pageTables).forEach(([pid, entries]) => {
    const table = document.createElement("table");
    table.innerHTML = "<tr><th>Process</th><th>Page</th><th>Frame</th></tr>";
    entries.forEach(e => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${pid}</td><td>${e.page}</td><td>${e.frame}</td>`;
      table.appendChild(row);
    });
    container.appendChild(table);
  });
}

function translateLogicalAddress() {
  const logicalInput = document.getElementById("logical-address").value.trim();
  const msg = document.getElementById("paging-message");

  const [pid, logicalAddress] = logicalInput.split(":");

  if (!pid || isNaN(logicalAddress)) {
    msg.innerHTML = `<div class="status-message" style="color: red;">Enter in format: <b>p1:5</b></div>`;
    return;
  }

  const pageTable = pageTables[pid];
  if (!pageTable) {
    msg.innerHTML = `<div class="status-message" style="color: red;">Process ${pid} not found.</div>`;
    return;
  }

  const logicalAddr = parseInt(logicalAddress);
  const pageNumber = Math.floor(logicalAddr / pageSize);
  const offset = logicalAddr % pageSize;

  const mapping = pageTable.find(p => p.page === pageNumber);
  if (!mapping) {
    msg.innerHTML = `<div class="status-message" style="color: red;">Invalid logical address. Page not allocated.</div>`;
    return;
  }

  const physicalAddress = (mapping.frame * pageSize) + offset;
  msg.innerHTML = `<div class="status-message">Logical address <b>${logicalAddress}</b> maps to physical address <b>${physicalAddress}</b> (Frame ${mapping.frame}, Offset ${offset})</div>`;
}
document.getElementById("translate-btn").onclick = translateLogicalAddress;
