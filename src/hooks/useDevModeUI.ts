import Logger from "@webfoot/core/logger";
import { GameLoop } from "@webfoot/core/models";

async function downloadLogs() {
  const lines: string[] = [];
  const logs = await Logger.getAll();
  for (const log of logs) {
    lines.push(JSON.stringify(log));
  }
  // @ts-expect-error
  const blob = new Blob([lines.join("\n"), { type: "text/plain" }]);
  const invisibleLink = document.createElement("a");
  invisibleLink.href = URL.createObjectURL(blob);
  invisibleLink.download = `logs-${GameLoop.getCurrentSave()!}.txt`;
  invisibleLink.click();
}

export default function useDevModeUI() {
  const devMode = GameLoop.getDevMode();

  if (devMode) {
    const footer = document.getElementsByTagName("footer")[0];
    if (footer.children.length > 0) return;
    const button = document.createElement("button");
    button.classList.add("focus:outline-none");
    button.innerText = "Download Logs";
    button.onclick = downloadLogs;
    footer.appendChild(button);
  }
}
