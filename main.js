const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module to handle messages sent from renderer processes (web pages)
const ipcMain = electron.ipcMain
const globalShortcut = electron.globalShortcut
const configuration = require('./configuration');

let mainWindow;
let settingsWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 700,
        width: 368,
        resizable: false
    });

    if (!configuration.readSettings('shortcutKeys')) {
        configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
    }

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.webContents.openDevTools();

    setGlobalShortcuts();
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

ipcMain.on('set-global-shortcuts', () => {
    setGlobalShortcuts();
});

function setGlobalShortcuts() {
    globalShortcut.unregisterAll();

    var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
    var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';

    globalShortcut.register(shortcutPrefix + '1', function () {
        mainWindow.webContents.send('global-shortcut', 0);
    });
    globalShortcut.register(shortcutPrefix + '2', function () {
        mainWindow.webContents.send('global-shortcut', 1);
    });
    globalShortcut.register(shortcutPrefix + '3', function () {
        mainWindow.webContents.send('global-shortcut', 2);
    });
    globalShortcut.register(shortcutPrefix + '4', function () {
        mainWindow.webContents.send('global-shortcut', 3);
    });
}
