import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const desktopMain = path.resolve(desktopRoot, 'dist/electron.main.js');

const electronCli = require.resolve('electron/cli.js', {
  paths: [desktopRoot],
});

const child = spawn(process.execPath, [electronCli, desktopMain], {
  cwd: desktopRoot,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
