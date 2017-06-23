const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module to handle messages sent from renderer processes (web pages)
const ipcMain = electron.ipcMain
const globalShortcut = electron.globalShortcut

let mainWindow;
let settingsWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 700,
        width: 368,
        resizable: false
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.webContents.openDevTools();

    globalShortcut.register('ctrl+shift+1', () => {
        mainWindow.webContents.send('global-shortcut', 0);
    });
    globalShortcut.register('ctrl+shift+2', () => {
        mainWindow.webContents.send('global-shortcut', 1);
    });
});

ipcMain.on('close-main-window', () => {
    app.quit();
});

ipcMain.on('open-settings-window', () => {
    // preventing multiple settings windows to open
    if (settingsWindow) {
        return;
    }

    settingsWindow = new BrowserWindow({
        frame: false,
        height: 200,
        resizable: false,
        width: 200
    });

    settingsWindow.loadURL('file://' + __dirname + '/app/settings.html');

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
});

ipcMain.on('close-settings-window', () => {
    if (settingsWindow) {
        settingsWindow.close();
    }
})
