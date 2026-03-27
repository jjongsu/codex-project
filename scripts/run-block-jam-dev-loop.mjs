import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const args = process.argv.slice(2);
const scenarioArgIndex = args.indexOf('--scenario');
const headed = args.includes('--headed');

const scenario =
  scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]
    ? args[scenarioArgIndex + 1]
    : 'midgame';

const codexHome = process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex');
const clientPath = path.join(
  codexHome,
  'skills/develop-web-game/scripts/web_game_playwright_client.js',
);
const localClientPath = path.join(
  cwd,
  'scripts/.generated/web_game_playwright_client.mjs',
);
const actionsFile = path.join(
  cwd,
  'src/features/games/block-jam-blitz/testing',
  `${scenario}.actions.json`,
);
const screenshotDir = path.join(cwd, 'output/web-game/block-jam-blitz', scenario);
const url =
  process.env.BLOCK_JAM_TEST_URL ??
  `http://127.0.0.1:3000/game/block-jam-blitz?automation=1&scenario=${scenario}`;
const clickSelector = process.env.BLOCK_JAM_CLICK_SELECTOR ?? 'body';

fs.mkdirSync(path.dirname(localClientPath), { recursive: true });
const rawClientSource = fs.readFileSync(clientPath, 'utf8');
const patchedClientSource = rawClientSource
  .replace(
    'const page = await browser.newPage();',
    'const page = await browser.newPage({ viewport: { width: 960, height: 1320 } });',
  )
  .replace(
    '  await page.waitForTimeout(500);\n  await page.evaluate(() => {\n    window.dispatchEvent(new Event("resize"));\n  });\n',
    '  await page.waitForTimeout(900);\n  await page.waitForFunction(() => typeof window.render_game_to_text === "function" || document.querySelectorAll("canvas").length > 0, { timeout: 10000 }).catch(() => null);\n  await page.evaluate(() => {\n    window.dispatchEvent(new Event("resize"));\n  });\n  await page.waitForTimeout(250);\n',
  )
  .replace(
    '  let base64 = canvas ? await captureCanvasPngBase64(canvas) : "";',
    '  let base64 = "";',
  );
fs.writeFileSync(localClientPath, patchedClientSource);

const clientArgs = [
  localClientPath,
  '--url',
  url,
  '--actions-file',
  actionsFile,
  '--iterations',
  '1',
  '--pause-ms',
  '250',
  '--screenshot-dir',
  screenshotDir,
];

if (clickSelector !== 'none') {
  clientArgs.push('--click-selector', clickSelector);
}

if (headed) {
  clientArgs.push('--headless', 'false');
}

const child = spawn(process.execPath, clientArgs, {
  cwd,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
