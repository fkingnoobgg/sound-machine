const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module to handle messages sent from renderer processes (web pages)
const ipcMain = electron.ipcMain

let mainWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 700,
        width: 368,
        resizable: false
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
});

ipcMain.on('close-main-window', () => {
    app.quit();
});
