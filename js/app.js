(function () {
  const STORAGE_KEY = "euroleague-2026-27-prediction";
  const teams = window.EUROLEAGUE_TEAMS_2026_27;
  const list = document.querySelector("#ranking-list");
  const exportCard = document.querySelector("#export-card");
  const downloadButton = document.querySelector("#download-button");

  let ranking = loadRanking();

  function zoneForPosition(position) {
    if (position <= 4) return "zone-home";
    if (position <= 6) return "zone-playoffs";
    if (position <= 10) return "zone-playin";
    return "zone-out";
  }

  function loadRanking() {
    const byId = new Map(teams.map((team) => [team.id, team]));
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored) && stored.length === teams.length) {
        const ids = new Set(stored);
        if (ids.size === teams.length && stored.every((id) => byId.has(id))) {
          return stored.map((id) => byId.get(id));
        }
      }
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY);
    }

    return [...teams];
  }

  function saveRanking() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranking.map((team) => team.id)));
  }

  function renderRanking() {
    list.innerHTML = ranking.map(rowTemplate).join("");
    updatePositions();
  }

  function rowTemplate(team, index) {
    const position = index + 1;
    const zone = zoneForPosition(position);
    return `
      <li class="team-row ${zone}" data-id="${team.id}" tabindex="-1">
        <span class="position">${position}</span>
        <span class="logo-wrap">
          <img class="team-logo" src="${team.logo}" alt="${team.shortName} logo" loading="eager">
        </span>
        <span class="team-name">
          <strong>${team.name}</strong>
          <span>${team.country}</span>
        </span>
        <button class="drag-handle" type="button" aria-label="Move ${team.name}" title="Drag to reorder">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M8 7h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h8v2H8v-2Z"/>
          </svg>
        </button>
      </li>
    `;
  }

  function updatePositions() {
    const rows = [...list.querySelectorAll(".team-row")];
    rows.forEach((row, index) => {
      const position = index + 1;
      row.classList.remove("zone-home", "zone-playoffs", "zone-playin", "zone-out");
      row.classList.add(zoneForPosition(position));
      row.querySelector(".position").textContent = position;
    });
  }

  function syncRankingFromDom() {
    const byId = new Map(teams.map((team) => [team.id, team]));
    ranking = [...list.querySelectorAll(".team-row")].map((row) => byId.get(row.dataset.id));
    updatePositions();
    saveRanking();
  }

  function moveTeam(id, direction) {
    const index = ranking.findIndex((team) => team.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ranking.length) return;
    [ranking[index], ranking[nextIndex]] = [ranking[nextIndex], ranking[index]];
    renderRanking();
    saveRanking();
    list.querySelector(`[data-id="${id}"] .drag-handle`)?.focus();
  }

  function buildExportCard() {
    exportCard.innerHTML = `
      <div class="export-header">
        <div>
          <h2 class="export-title">EuroLeague Standings<br>2026/27</h2>
          <p class="export-subtitle">Final regular season standings</p>
        </div>
        <div class="export-legend">
          <span><i class="legend-swatch zone-home"></i>1-4 Home Court</span>
          <span><i class="legend-swatch zone-playoffs"></i>5-6 Playoffs</span>
          <span><i class="legend-swatch zone-playin"></i>7-10 Play-In</span>
        </div>
      </div>
      <ol class="export-list">
        ${ranking.map(exportRowTemplate).join("")}
      </ol>
      <div class="export-footer">EuroLeague standings 2026/27</div>
    `;
  }

  function exportRowTemplate(team, index) {
    const position = index + 1;
    return `
      <li class="export-row ${zoneForPosition(position)}">
        <span class="export-position">${position}</span>
        <span class="export-logo-wrap">
          <img class="export-logo" src="${team.logo}" alt="">
        </span>
        <span class="export-team">${team.name}</span>
      </li>
    `;
  }

  function waitForImages(container) {
    const images = [...container.querySelectorAll("img")];
    return Promise.all(
      images.map((image) => {
        if (image.complete && image.naturalWidth) return Promise.resolve();
        return new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        });
      }),
    );
  }

  function isIosDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not create the PNG file."));
      }, "image/png");
    });
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function showIosSaveView(previewWindow, blob) {
    const url = URL.createObjectURL(blob);
    const previewDocument = previewWindow.document;
    previewDocument.title = "EuroLeague Standings 2026/27";
    previewDocument.body.innerHTML = "";
    previewDocument.body.style.cssText = "margin:0;padding:16px;background:#080c14;color:#fff;font-family:system-ui;text-align:center";

    const instruction = previewDocument.createElement("p");
    instruction.textContent = "Press and hold the image, then choose Save to Photos.";
    instruction.style.cssText = "margin:0 0 14px;font-size:16px;font-weight:700";

    const image = previewDocument.createElement("img");
    image.src = url;
    image.alt = "EuroLeague standings 2026/27";
    image.style.cssText = "display:block;width:100%;height:auto;margin:0 auto";

    previewDocument.body.append(instruction, image);
    previewWindow.addEventListener("unload", () => URL.revokeObjectURL(url), { once: true });
  }

  async function downloadPrediction() {
    const iosPreview = isIosDevice() ? window.open("", "_blank") : null;
    if (iosPreview) {
      iosPreview.document.body.style.cssText = "margin:0;padding:32px;background:#080c14;color:#fff;font-family:system-ui;text-align:center";
      iosPreview.document.body.textContent = "Creating your standings image...";
    }

    downloadButton.disabled = true;
    downloadButton.setAttribute("aria-label", "Creating PNG");
    buildExportCard();

    try {
      await waitForImages(exportCard);
      const canvas = await html2canvas(exportCard, {
        backgroundColor: null,
        scale: window.matchMedia("(max-width: 760px)").matches ? 1 : 2,
        useCORS: false,
        logging: false,
      });
      const blob = await canvasToBlob(canvas);
      const filename = "euroleague-standings-2026-27.png";

      if (iosPreview) showIosSaveView(iosPreview, blob);
      else triggerBlobDownload(blob, filename);
    } catch (error) {
      iosPreview?.close();
      window.alert("The image could not be created. Please refresh the page and try again.");
      console.error(error);
    } finally {
      downloadButton.disabled = false;
      downloadButton.setAttribute("aria-label", "Download standings as PNG");
    }
  }

  renderRanking();

  Sortable.create(list, {
    animation: 150,
    handle: ".drag-handle",
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    forceFallback: true,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    touchStartThreshold: 5,
    onEnd: syncRankingFromDom,
  });

  list.addEventListener("keydown", (event) => {
    const handle = event.target.closest(".drag-handle");
    if (!handle) return;
    const row = handle.closest(".team-row");
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTeam(row.dataset.id, -1);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTeam(row.dataset.id, 1);
    }
  });

  downloadButton.addEventListener("click", downloadPrediction);
})();
