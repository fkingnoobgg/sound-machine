const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module to handle messages sent from renderer processes (web pages)
const ipcMain = electron.ipcMain
// for makeing shortcuts/accelerators
const globalShortcut = electron.globalShortcut
// our custom module that we made
const configuration = require('./configuration');
// to make menus for electron apps
const Menu = electron.Menu
// for making server requests, e.g. calling api.github.com
const rp = require('request-promise');
// for native notifications
const notifier = require('node-notifier');
const path = require('path');

let mainWindow = null;
let settingsWindow = null;
let aboutAppWindow = null;

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

    setGlobalShortcuts();

    setAppMenu();

    getRemoteVersion();

});

/*
* Handling messages from renderer proce
*/

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
        height: 220,
        resizable: false,
        width: 200
    });

    settingsWindow.loadURL('file://' + __dirname + '/app/settings.html');

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
});

ipcMain.on('open-aboutApp-window', () => {
    createAboutAppWindow()
})

ipcMain.on('close-settings-window', () => {
    if (settingsWindow) {
        settingsWindow.close();
    }
})

ipcMain.on('close-aboutApp-window', () => {
    if (aboutAppWindow) {
        aboutAppWindow.close();
    }
})

ipcMain.on('set-global-shortcuts', () => {
    setGlobalShortcuts();
});


/*
* Functions that need to run during app setup
*/
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

function setAppMenu() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}


/*
* Template for App menu
*/

let template = [{
  label: 'View',
  submenu: [{
    label: 'Toggle Developer Tools',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }, {
    type: 'separator'
  }, {
    label: 'Display dialog box :)',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        const options = {
          type: 'info',
          title: 'Application Menu Demo',
          buttons: ['Ok'],
          message: 'This is a dialog box'
        }
        electron.dialog.showMessageBox(focusedWindow, options, function () {})
      }
    }
  }]
},{
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal('http://github.com/fkingnoobgg')
    }
  }]
}]

const appName = electron.app.getName()
template.unshift({
  label: appName,
  submenu: [{
    label: `About ${appName}`,
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        createAboutAppWindow()
      }
    }
  }, {
    label: 'Version ' + electron.app.getVersion(),
    enabled: false
  }, {
    type: 'separator'
  }, {
    label: 'Services',
    role: 'services',
    submenu: []
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'Command+Q',
    click: function () {
      app.quit()
    }
  }]
})

function createAboutAppWindow() {
  // preventing multiple settings windows to open
  if (aboutAppWindow) {
      return;
  }

  aboutAppWindow = new BrowserWindow({
      frame: false,
      height: 200,
      resizable: false,
      width: 200
  });

  aboutAppWindow.loadURL('file://' + __dirname + '/app/aboutApp.html');

  aboutAppWindow.on('closed', () => {
      aboutAppWindow = null;
  });
}


/*
* Making remote calls to check version
*/
function getRemoteVersion() {
  let remoteVersion = null;
  const clientVersion = app.getVersion();

  var options = {
      uri: 'https://api.github.com/repos/fkingnoobgg/sound-machine/contents/package.json',
      headers: {
          'User-Agent': 'Request-Promise',
          'Accept': 'application/vnd.github.VERSION.raw'
      },
  };

  rp(options)
      .then(function (res) {
          remoteVersion = JSON.parse(res).version
          // when the remote version is different to local version then a new update is
          // available therefore notify the user of this
          if (remoteVersion != clientVersion){
            notifier.notify({
              title: 'Version Update',
              message: 'New version available!',
              icon: path.join(__dirname, 'app/img/app-icon.ico'),
              sound: true, // Only Notification Center or Windows Toasters
              wait: true // Wait with callback, until user action is taken against notification
            }, function (err, response) {
              // Response is response from notification
            });
            notifier.on('click', function (notifierObject, options) {
              electron.shell.openExternal('http://github.com/fkingnoobgg/sound-machine')// Triggers if `wait: true` and user clicks notification
            });
          }
      })
      .catch(function (err) {
          notifier.notify("Couldn't connect to api.github.com please check \
          your internet connection");
      });
}
