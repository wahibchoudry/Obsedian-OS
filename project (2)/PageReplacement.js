function startSimulation() {
  const strategy = document.getElementById("strategy").value;
  const referenceString = document.getElementById("referenceString").value.split(',').map(Number);
  const frameCount = parseInt(document.getElementById("frameCount").value);
  const table = document.querySelector("#resultTable tbody");
  const stats = document.getElementById("stats");

  table.innerHTML = "";
  stats.textContent = "";

  let frames = [];
  let hits = 0, misses = 0;
  let recentUse = []; // For LRU and MRU

  const delay = 400;

  function insertRow(step, page, result) {
    const row = document.createElement("tr");
    row.classList.add("animate-row");

    const frameState = frames.length ? frames.join(", ") : "Empty";

    row.innerHTML = `
      <td>${step}</td>
      <td>${page}</td>
      <td>${frameState}</td>
      <td>${result}</td>
    `;

    table.appendChild(row);
  }

  async function simulate() {
    for (let i = 0; i < referenceString.length; i++) {
      const page = referenceString[i];
      let result = "Miss";

      if (frames.includes(page)) {
        hits++;
        result = "Hit";

        if (strategy === "LRU" || strategy === "MRU") {
          const index = recentUse.indexOf(page);
          if (index !== -1) recentUse.splice(index, 1);
          recentUse.push(page);
        }
      } else {
        misses++;

        if (frames.length < frameCount) {
          frames.push(page);
          if (strategy === "LRU" || strategy === "MRU") recentUse.push(page);
        } else {
          if (strategy === "FIFO") {
            frames.shift();
          } else if (strategy === "LRU") {
            const lru = recentUse.shift();
            const idx = frames.indexOf(lru);
            if (idx !== -1) frames.splice(idx, 1);
          } else if (strategy === "MRU") {
            const mru = recentUse.pop();
            const idx = frames.indexOf(mru);
            if (idx !== -1) frames.splice(idx, 1);
          } else if (strategy === "Optimal") {
            let future = referenceString.slice(i + 1);
            let toReplace = -1, farthest = -1;

            frames.forEach((f, idx) => {
              let nextUse = future.indexOf(f);
              if (nextUse === -1) {
                toReplace = idx;
                farthest = Infinity;
              } else if (nextUse > farthest) {
                toReplace = idx;
                farthest = nextUse;
              }
            });

            if (toReplace !== -1) frames.splice(toReplace, 1);
          }

          frames.push(page);
          if (strategy === "LRU" || strategy === "MRU") {
            const index = recentUse.indexOf(page);
            if (index !== -1) recentUse.splice(index, 1);
            recentUse.push(page);
          }
        }
      }

      insertRow(i + 1, page, result);
      await new Promise(res => setTimeout(res, delay));
    }

    const hitRatio = (hits / referenceString.length).toFixed(2);
    const missRatio = (misses / referenceString.length).toFixed(2);

    stats.innerHTML = `
      <strong>Total Hits:</strong> ${hits}, 
      <strong>Misses:</strong> ${misses}, 
      <strong>Hit Ratio:</strong> ${hitRatio}, 
      <strong>Miss Ratio:</strong> ${missRatio}
    `;
  }

  simulate();
}
