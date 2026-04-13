import * as vscode from "vscode";

function getNonce(): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";

  for (let index = 0; index < 32; index += 1) {
    output += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return output;
}

function getCss(): string {
  return `
      :root {
        --bg: #f3efe5;
        --surface: rgba(255, 250, 240, 0.76);
        --border: rgba(95, 71, 38, 0.16);
        --text: #1c1f24;
        --muted: #6a6359;
        --accent: #0d6b61;
        --accent-strong: #06463f;
        --accent-soft: rgba(13, 107, 97, 0.14);
        --warning: #8b4c1a;
        --danger: #8f2d2d;
        --shadow: 0 20px 60px rgba(67, 50, 26, 0.10);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Avenir Next", "Segoe UI", ui-sans-serif, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(13, 107, 97, 0.16), transparent 32%),
          radial-gradient(circle at top right, rgba(187, 118, 45, 0.14), transparent 28%),
          linear-gradient(180deg, #f8f3ea 0%, var(--bg) 100%);
      }
      .shell { padding: 24px; }
      .hero {
        display: grid;
        gap: 12px;
        padding: 24px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: linear-gradient(135deg, rgba(255, 251, 244, 0.95), rgba(232, 220, 200, 0.82));
        box-shadow: var(--shadow);
      }
      .eyebrow {
        display: inline-flex;
        width: fit-content;
        gap: 8px;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-strong);
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(13, 107, 97, 0.16);
      }
      h1 {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
        font-size: clamp(36px, 5vw, 54px);
        line-height: 0.98;
        letter-spacing: -0.04em;
      }
      .subhead {
        max-width: 820px;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
      }
      .workspace-strip, .result-meta, .detail-meta, .toggle-row, .action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .chip, .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--border);
        color: var(--muted);
        font-size: 13px;
      }
      .pill {
        padding: 7px 10px;
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-size: 12px;
      }
      .muted-pill {
        background: rgba(28, 31, 36, 0.06);
        color: var(--muted);
      }
      .chip strong { color: var(--text); }
      .layout {
        display: grid;
        grid-template-columns: minmax(280px, 1.1fr) minmax(320px, 0.9fr);
        gap: 20px;
        margin-top: 24px;
      }
      .panel {
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--surface);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow);
        overflow: hidden;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 18px 20px 0;
      }
      .panel-head h2 { margin: 0; font-size: 18px; }
      .panel-body, .detail-grid { padding: 20px; }
      .detail-grid { display: grid; gap: 16px; }
      .search-form, .control-grid { display: grid; gap: 14px; }
      .search-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
      }
      input[type="text"], select {
        width: 100%;
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid rgba(28, 31, 36, 0.10);
        background: rgba(255, 255, 255, 0.82);
        color: var(--text);
        font: inherit;
      }
      button {
        border: 0;
        border-radius: 16px;
        padding: 13px 16px;
        font: inherit;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        cursor: pointer;
        transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
        box-shadow: 0 14px 30px rgba(13, 107, 97, 0.22);
      }
      button:hover { transform: translateY(-1px); }
      button.secondary {
        background: white;
        color: var(--text);
        box-shadow: none;
        border: 1px solid rgba(28, 31, 36, 0.10);
      }
      button.ghost {
        background: transparent;
        color: var(--accent-strong);
        box-shadow: none;
        border: 1px solid rgba(13, 107, 97, 0.16);
      }
      button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      .hint, .result-summary, .detail-copy {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
      }
      .status {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.58);
        border: 1px solid rgba(28, 31, 36, 0.08);
        color: var(--muted);
        font-size: 13px;
      }
      .results { display: grid; gap: 12px; }
      .result-card {
        padding: 16px;
        border-radius: 20px;
        border: 1px solid rgba(28, 31, 36, 0.08);
        background: rgba(255, 255, 255, 0.72);
        cursor: pointer;
        transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
      }
      .result-card:hover {
        transform: translateY(-2px);
        border-color: rgba(13, 107, 97, 0.24);
      }
      .result-card.active {
        border-color: rgba(13, 107, 97, 0.34);
        background: linear-gradient(135deg, rgba(13, 107, 97, 0.12), rgba(255, 255, 255, 0.92));
      }
      .result-top {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: start;
      }
      .result-name { margin: 0; font-size: 16px; font-weight: 800; }
      .section-label {
        margin: 0 0 8px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .detail-title {
        margin: 0;
        font-size: 26px;
        line-height: 1.05;
        letter-spacing: -0.03em;
      }
      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(28, 31, 36, 0.08);
        background: rgba(255, 255, 255, 0.68);
      }
      .logbox {
        min-height: 160px;
        padding: 14px;
        border-radius: 18px;
        background: #17202b;
        color: #eff4fb;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow: auto;
      }
      .empty, .notice {
        padding: 18px;
        border-radius: 18px;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.42);
      }
      .empty { border: 1px dashed rgba(28, 31, 36, 0.12); }
      .notice {
        border: 1px solid rgba(28, 31, 36, 0.08);
        background: rgba(255, 255, 255, 0.7);
      }
      .notice.warning {
        color: var(--warning);
        border-color: rgba(139, 76, 26, 0.16);
        background: rgba(139, 76, 26, 0.08);
      }
      .notice.error {
        color: var(--danger);
        border-color: rgba(143, 45, 45, 0.16);
        background: rgba(143, 45, 45, 0.08);
      }
      .notice.success {
        color: var(--accent-strong);
        border-color: rgba(13, 107, 97, 0.16);
        background: rgba(13, 107, 97, 0.08);
      }
      @media (max-width: 960px) {
        .layout { grid-template-columns: 1fr; }
        .search-row { grid-template-columns: 1fr; }
      }
  `;
}

function getScript(): string {
  return `
      const vscode = acquireVsCodeApi();
      const state = {
        workspace: null,
        results: [],
        selectedName: null,
        selectedDetail: null,
        status: "Waiting for your first query.",
        logs: "Waiting for an install run.",
        notice: null,
        searching: false,
        loadingDetail: false,
        installing: false
      };
      const queryInput = document.getElementById("queryInput");
      const searchForm = document.getElementById("searchForm");
      const searchButton = document.getElementById("searchButton");
      const workspaceStrip = document.getElementById("workspaceStrip");
      const statusLabel = document.getElementById("statusLabel");
      const resultCount = document.getElementById("resultCount");
      const resultsRoot = document.getElementById("results");
      const detailRoot = document.getElementById("detailRoot");
      const logbox = document.getElementById("logbox");
      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }
      function formatDownloads(value) {
        return value ? new Intl.NumberFormat().format(value) + "/week" : "n/a";
      }
      function formatDate(value) {
        if (!value) return "unknown publish date";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "unknown publish date";
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      }
      function renderWorkspace() {
        if (state.workspace) {
          workspaceStrip.innerHTML = [
            '<span class="chip"><strong>Workspace</strong> ' + escapeHtml(state.workspace.workspaceName) + "</span>",
            '<span class="chip"><strong>Root</strong> ' + escapeHtml(state.workspace.rootPath) + "</span>",
            '<span class="chip"><strong>package.json</strong> ' + (state.workspace.hasPackageJson ? "ready" : "missing") + "</span>"
          ].join("");
          return;
        }
        workspaceStrip.innerHTML = '<span class="chip"><strong>No workspace</strong> Search still works, install is disabled.</span>';
      }
      function renderResults() {
        resultCount.textContent = state.results.length + (state.results.length === 1 ? " result" : " results");
        if (!state.results.length) {
          resultsRoot.innerHTML = '<div class="empty">No packages on screen yet. Try an exact package name or describe the job you need done.</div>';
          return;
        }
        resultsRoot.innerHTML = state.results.map((result) => {
          const activeClass = result.name === state.selectedName ? " active" : "";
          return '<article class="result-card' + activeClass + '" data-package="' + escapeHtml(result.name) + '">' +
            '<div class="result-top"><div><p class="result-name">' + escapeHtml(result.name) + '</p><p class="result-summary">' + escapeHtml(result.summary) + '</p></div><span class="pill">' + escapeHtml(result.version) + '</span></div>' +
            '<div class="result-meta">' +
              '<span class="pill muted-pill">' + escapeHtml(formatDownloads(result.downloadsWeekly)) + '</span>' +
              '<span class="pill muted-pill">' + escapeHtml(result.license || "unknown license") + '</span>' +
              '<span class="pill muted-pill">' + escapeHtml(formatDate(result.publishedAt)) + '</span>' +
              (result.exactMatch ? '<span class="pill">Exact match</span>' : '') +
            '</div>' +
            '<p class="hint" style="margin-top: 10px;">' + escapeHtml(result.reason) + '</p>' +
          '</article>';
        }).join("");
        document.querySelectorAll(".result-card").forEach((element) => {
          element.addEventListener("click", () => {
            const packageName = element.getAttribute("data-package");
            if (!packageName) return;
            state.selectedName = packageName;
            state.loadingDetail = true;
            state.notice = null;
            renderResults();
            renderDetail();
            vscode.postMessage({ type: "loadPackage", packageName });
          });
        });
      }
      function renderDetail() {
        if (state.notice) {
          detailRoot.innerHTML = '<div class="notice ' + escapeHtml(state.notice.level) + '">' + escapeHtml(state.notice.message) + '</div>';
          return;
        }
        if (state.loadingDetail) {
          detailRoot.innerHTML = '<div class="empty">Loading package detail...</div>';
          return;
        }
        if (!state.selectedDetail) {
          detailRoot.innerHTML = '<div class="empty">Pick a package from the left to inspect versions, metadata, and install controls.</div>';
          return;
        }
        const detail = state.selectedDetail;
        const versionOptions = detail.versions.map((version) => '<option value="' + escapeHtml(version) + '">' + escapeHtml(version) + '</option>').join("");
        const keywords = detail.keywords.length ? detail.keywords.map((keyword) => '<span class="pill muted-pill">' + escapeHtml(keyword) + '</span>').join("") : '<span class="pill muted-pill">No keywords</span>';
        const trustBadges = [
          detail.trust.hasRepository ? "Repository linked" : "No repository link",
          detail.trust.hasHomepage ? "Homepage linked" : "No homepage",
          detail.trust.recentlyUpdated ? "Updated in last year" : "Not recently updated"
        ].map((label) => '<span class="pill">' + escapeHtml(label) + '</span>').join("");
        const installDisabled = !state.workspace || !state.workspace.hasPackageJson;
        detailRoot.innerHTML = '<div class="detail-grid">' +
          '<div><p class="section-label">Package</p><h3 class="detail-title">' + escapeHtml(detail.name) + '</h3><p class="detail-copy">' + escapeHtml(detail.summary) + '</p><div class="detail-meta"><span class="pill">' + escapeHtml(formatDownloads(detail.downloadsWeekly)) + '</span><span class="pill muted-pill">' + escapeHtml(detail.license || "unknown license") + '</span><span class="pill muted-pill">' + escapeHtml(formatDate(detail.publishedAt)) + '</span></div></div>' +
          '<div><p class="section-label">Trust Signals</p><div class="detail-meta">' + trustBadges + '</div></div>' +
          '<div><p class="section-label">Keywords</p><div class="detail-meta">' + keywords + '</div></div>' +
          (detail.readmeSnippet ? '<div><p class="section-label">README Snippet</p><p class="detail-copy">' + escapeHtml(detail.readmeSnippet) + '</p></div>' : '') +
          '<div class="control-grid"><div><p class="section-label">Version</p><select id="versionSelect">' + versionOptions + '</select></div>' +
          '<div><p class="section-label">Install Mode</p><div class="toggle-row"><label class="toggle"><input type="radio" name="installMode" value="dependency" checked /> dependency</label><label class="toggle"><input type="radio" name="installMode" value="devDependency" /> devDependency</label></div></div>' +
          '<div class="action-row"><button id="installButton" ' + (installDisabled || state.installing ? "disabled" : "") + '>Install into workspace</button><button id="openNpmButton" class="secondary">Open npm page</button>' + (detail.links.repository ? '<button id="openRepoButton" class="ghost">Open repository</button>' : '') + '</div>' +
          (installDisabled ? '<div class="notice warning">Open a workspace with a package.json file to enable installs.</div>' : '') +
          '</div></div>';
        const versionSelect = document.getElementById("versionSelect");
        if (versionSelect) versionSelect.value = detail.version;
        const installButton = document.getElementById("installButton");
        if (installButton) {
          installButton.addEventListener("click", () => {
            const selectedVersion = document.getElementById("versionSelect").value;
            const selectedMode = document.querySelector('input[name="installMode"]:checked').value;
            state.installing = true;
            state.logs = "Starting install...";
            renderLog();
            renderDetail();
            vscode.postMessage({ type: "install", packageName: detail.name, version: selectedVersion, installMode: selectedMode });
          });
        }
        const openNpmButton = document.getElementById("openNpmButton");
        if (openNpmButton) {
          openNpmButton.addEventListener("click", () => vscode.postMessage({ type: "openExternal", url: detail.links.npm }));
        }
        const openRepoButton = document.getElementById("openRepoButton");
        if (openRepoButton) {
          openRepoButton.addEventListener("click", () => vscode.postMessage({ type: "openExternal", url: detail.links.repository }));
        }
      }
      function renderLog() {
        logbox.textContent = state.logs;
      }
      function renderStatus() {
        statusLabel.textContent = state.status;
        searchButton.disabled = state.searching;
      }
      function renderAll() {
        renderWorkspace();
        renderStatus();
        renderResults();
        renderDetail();
        renderLog();
      }
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = queryInput.value.trim();
        if (!query) {
          state.status = "Enter a query to search npm.";
          renderStatus();
          return;
        }
        state.searching = true;
        state.status = "Searching npm registry...";
        state.notice = null;
        renderAll();
        vscode.postMessage({ type: "search", query });
      });
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.type) {
          case "workspaceState":
            state.workspace = message.workspace || null;
            renderWorkspace();
            break;
          case "searchStarted":
            state.searching = true;
            state.status = "Searching npm registry...";
            renderStatus();
            break;
          case "searchResults":
            state.searching = false;
            state.results = message.results || [];
            state.status = state.results.length ? "Search complete. Pick a package to inspect." : "No packages found for that query.";
            renderAll();
            break;
          case "searchFailed":
            state.searching = false;
            state.status = message.error || "Search failed.";
            renderStatus();
            break;
          case "packageDetailStarted":
            state.loadingDetail = true;
            renderDetail();
            break;
          case "packageDetail":
            state.loadingDetail = false;
            state.selectedDetail = message.detail;
            state.notice = null;
            renderDetail();
            break;
          case "packageDetailFailed":
            state.loadingDetail = false;
            state.notice = { level: "error", message: message.error || "Could not load package detail." };
            renderDetail();
            break;
          case "installStarted":
            state.installing = true;
            state.logs = "Running install...\\n";
            renderAll();
            break;
          case "installLog":
            state.logs += message.chunk || "";
            renderLog();
            break;
          case "installFinished":
            state.installing = false;
            state.logs += "\\n" + (message.summary || "Install complete.");
            state.notice = { level: message.success ? "success" : "error", message: message.success ? "Install completed successfully." : (message.summary || "Install failed.") };
            renderAll();
            break;
          default:
            break;
        }
      });
      vscode.postMessage({ type: "ready" });
      renderAll();
  `;
}

export function getPackPilotWebviewHtml(webview: vscode.Webview): string {
  const nonce = getNonce();
  const csp = [
    "default-src 'none'",
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `img-src ${webview.cspSource} https: data:`,
    `font-src ${webview.cspSource} https:`,
    `script-src 'nonce-${nonce}'`
  ].join("; ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PackPilot</title>
    <style>${getCss()}</style>
  </head>
  <body>
    <div class="shell">
      <section class="hero">
        <span class="eyebrow">PackPilot MVP</span>
        <h1>Search npm packages by name or intent, then install them safely.</h1>
        <p class="subhead">
          PackPilot keeps package discovery inside VS Code, surfaces trust signals before install,
          and runs a controlled local npm install flow in your current workspace.
        </p>
        <div class="workspace-strip" id="workspaceStrip"></div>
      </section>
      <section class="layout">
        <div class="panel">
          <div class="panel-head"><h2>Search</h2></div>
          <div class="panel-body">
            <form class="search-form" id="searchForm">
              <div class="search-row">
                <input id="queryInput" type="text" placeholder="Try 'http client for node' or 'zod'" />
                <button id="searchButton" type="submit">Search npm</button>
              </div>
              <p class="hint">Natural-language queries work too. PackPilot uses npm registry metadata to rank useful matches.</p>
            </form>
            <div class="status">
              <span id="statusLabel">Waiting for your first query.</span>
              <span id="resultCount">0 results</span>
            </div>
            <div class="panel-body" style="padding: 20px 0 0;">
              <div id="results" class="results"></div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Package Detail</h2></div>
          <div class="detail-grid">
            <div id="detailRoot" class="empty">Search for a package to inspect metadata, choose a version, and install into your workspace.</div>
            <div>
              <p class="section-label">Install Log</p>
              <div id="logbox" class="logbox">Waiting for an install run.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <script nonce="${nonce}">${getScript()}</script>
  </body>
</html>`;
}
