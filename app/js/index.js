const {Menu, Tray} = require('electron').remote
const {ipcRenderer} = require('electron')
path = require('path')

let tray = null

var soundButtons = document.querySelectorAll('.button-sound');

for (var i = 0; i < soundButtons.length; i++) {
    var soundButton = soundButtons[i];
    var soundName = soundButton.attributes['data-sound'].value;

    prepareButton(soundButton, soundName);
}

function prepareButton(buttonEl, soundName) {
    buttonEl.querySelector('span').style.backgroundImage = 'url("img/icons/' + soundName + '.png")';

    var audio = new Audio(__dirname + '/wav/' + soundName + '.wav');
    buttonEl.addEventListener('click', function () {
        audio.currentTime = 0;
        audio.play();
    });
}

var closeEl = document.querySelector('.close');
closeEl.addEventListener('click', () => {
    ipcRenderer.send('close-main-window');
});

ipcRenderer.on('global-shortcut', (e, arg) => {
    var event = new MouseEvent('click');
    soundButtons[arg].dispatchEvent(event);
});

var settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', () => {
    ipcRenderer.send('open-settings-window');
});


if (process.platform === 'darwin') {
    tray = new Tray(path.join(__dirname, 'img/tray-iconTemplate.png'));
}
else {
    tray = new Tray(path.join(__dirname, 'img/tray-icon-alt.png'));
}

var trayMenuTemplate = [
    {
        label: 'Sound machine',
        enabled: false
    },
    {
        label: 'Settings',
        click: function () {
            ipcRenderer.send('open-settings-window');
        }
    },
    {
        label: 'About',
        click: function () {
            ipcRenderer.send('open-aboutApp-window');
        }
    },
    {
        type: 'separator'
    },
    {
        label: 'Quit',
        click: function () {
            ipcRenderer.send('close-main-window');
        }
    }
];
var trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
tray.setContextMenu(trayMenu);
