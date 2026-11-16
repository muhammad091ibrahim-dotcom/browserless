import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chromium } from "playwright-core";


dotenv.config();

const app = express();

app.use(cors({
origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));

app.use(express.json());

const sessions = new Map();

app.get("/health", (req, res) => {
res.json({ status: "online" });
});

app.post("/api/session", async (req, res) => {
let browser;

try {
const endpoint = process.env.BROWSERLESS_ENDPOINT;
const token = process.env.BROWSERLESS_TOKEN;

if (!endpoint || !token) {
throw new Error("Browserless credentials missing");
}

const separator = endpoint.includes("?") ? "&" : "?";

browser = await chromium.connectOverCDP(
$DIL3$DIL4token=$DIL5
);

const page = await browser.newPage();

await page.goto("https://example.com");

const cdp = await page.context().newCDPSession(page);

const { liveURL } = await cdp.send(
"Browserless.liveURL",
{
interactable: true,
resizable: true,
showBrowserInterface: true,
timeout: 300000
}
);

if (!liveURL) {
throw new Error("Live URL creation failed");
}

const id = crypto.randomUUID();

sessions.set(id, { browser, page, cdp });

res.json({ id, liveURL });

} catch (error) {
if (browser) await browser.close().catch(() => {});

console.error(error.message);

res.status(500).json({
error: "Could not create browser session"
});
}
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
console.log("Remote browser backend online");
});
