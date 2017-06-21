const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

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
