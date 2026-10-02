import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.resolve(process.cwd(), "Fieasto prototype");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES = [
  {
    baseName: "01_Landing_Page",
    url: "http://localhost:3000/",
    waitFor: 2500,
    viewport: { width: 1440, height: 960 },
    fullPage: true,
  },
  {
    baseName: "02_Partner_Login_Page",
    url: "http://localhost:3000/login",
    waitFor: 2000,
    viewport: { width: 1440, height: 900 },
    fullPage: false,
  },
  {
    baseName: "03_Inventory_Hub_Dashboard",
    url: "http://localhost:3000/dashboard",
    waitFor: 2500,
    viewport: { width: 1440, height: 900 },
    fullPage: false,
  },
  {
    baseName: "04_Menu_and_Pricing_Suite",
    url: "http://localhost:3000/menu",
    waitFor: 2500,
    viewport: { width: 1440, height: 900 },
    fullPage: false,
  },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Starting Chrome in headless mode...");
  const tempProfileDir = path.resolve(process.cwd(), ".chrome-profile");
  if (!fs.existsSync(tempProfileDir)) {
    fs.mkdirSync(tempProfileDir, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${tempProfileDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "--force-device-scale-factor=1.5",
  ]);

  let cdpWsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      if (res.ok) {
        const data = await res.json();
        cdpWsUrl = data.webSocketDebuggerUrl;
        console.log("Connected to Chrome via CDP:", cdpWsUrl);
        break;
      }
    } catch (e) {
      // retry
    }
  }

  if (!cdpWsUrl) {
    console.error("Failed to connect to headless Chrome.");
    chromeProc.kill();
    process.exit(1);
  }

  // Create a new target/tab
  const newTabRes = await fetch("http://127.0.0.1:9222/json/new?about:blank", {
    method: "PUT",
  });
  const tabData = await newTabRes.json();
  const wsUrl = tabData.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand("Page.enable");
  await sendCommand("DOM.enable");
  await sendCommand("Network.enable");

  for (const pageConfig of PAGES) {
    console.log(`Navigating to ${pageConfig.url} ...`);
    
    // Set device metrics
    await sendCommand("Emulation.setDeviceMetricsOverride", {
      width: pageConfig.viewport.width,
      height: pageConfig.viewport.height,
      deviceScaleFactor: 1.5,
      mobile: false,
    });

    await sendCommand("Page.navigate", { url: pageConfig.url });
    
    // Wait for content to settle and database to finish loading
    for (let waitStep = 0; waitStep < 20; waitStep++) {
      await sleep(1000);
      try {
        const evalResult = await sendCommand("Runtime.evaluate", {
          expression: `
            (() => {
              const text = document.body.innerText || "";
              const hasLoading = text.includes("Loading live stock data...") || 
                                 text.includes("Loading pricing rules...") || 
                                 text.includes("Loading audit trail...");
              const hasTableRows = document.querySelectorAll("tbody tr").length > 0;
              const isLoginOrHome = window.location.pathname === "/" || window.location.pathname === "/login";
              return isLoginOrHome || (!hasLoading && hasTableRows);
            })()
          `,
          returnByValue: true,
        });

        if (evalResult?.result?.value) {
          console.log(`Page ${pageConfig.url} loaded completely after ${waitStep + 1}s`);
          break;
        }
      } catch (err) {
        // continue waiting
      }
    }

    // Small extra settle time for animations
    await sleep(800);

    // Capture PNG
    const pngResult = await sendCommand("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: pageConfig.fullPage,
    });

    const pngPath = path.join(OUTPUT_DIR, `${pageConfig.baseName}.png`);
    fs.writeFileSync(pngPath, Buffer.from(pngResult.data, "base64"));
    console.log(`Saved screenshot: ${pngPath}`);

    // Capture JPG
    const jpgResult = await sendCommand("Page.captureScreenshot", {
      format: "jpeg",
      quality: 95,
      captureBeyondViewport: pageConfig.fullPage,
    });

    const jpgPath = path.join(OUTPUT_DIR, `${pageConfig.baseName}.jpg`);
    fs.writeFileSync(jpgPath, Buffer.from(jpgResult.data, "base64"));
    console.log(`Saved screenshot: ${jpgPath}`);
  }

  ws.close();
  chromeProc.kill();
  console.log("All screenshots captured successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error running screenshot script:", err);
  process.exit(1);
});
