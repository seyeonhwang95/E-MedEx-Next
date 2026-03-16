import { app, BrowserWindow } from 'electron';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveWebBuildIndexPath() {
	const candidates = [
		process.env.WEB_DIST_PATH,
		path.resolve(__dirname, '../../web/dist/index.html'),
		path.resolve(__dirname, '../web/dist/index.html'),
		path.resolve(process.cwd(), 'apps/web/dist/index.html'),
	].filter((candidate): candidate is string => Boolean(candidate));

	const resolvedPath = candidates.find((candidate) => existsSync(candidate));
	if (!resolvedPath) {
		throw new Error('Unable to locate built web app index.html. Run "pnpm --filter @emedex/web build" first.');
	}

	return resolvedPath;
}

function createMainWindow() {
	const window = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 1024,
		minHeight: 700,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	const runningSourceMain = __filename.endsWith('.ts');
	if (!app.isPackaged && runningSourceMain) {
		const devServerUrl = process.env.WEB_DEV_URL ?? 'http://localhost:5173';
		void window.loadURL(devServerUrl);
		window.webContents.openDevTools({ mode: 'detach' });
		return;
	}

	void window.loadFile(resolveWebBuildIndexPath());
}

app.whenReady().then(() => {
	createMainWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});