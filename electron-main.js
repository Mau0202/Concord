const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { startServer } = require('./server');

const port = process.env.PORT || 3000;

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#111310',
    title: 'Concord',
    icon: path.join(__dirname, 'public', 'assets', 'concord.ico'),
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  window.removeMenu();
  window.loadURL(`http://127.0.0.1:${port}`);
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error('Não foi possível iniciar o Concord.', error);
    app.quit();
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
