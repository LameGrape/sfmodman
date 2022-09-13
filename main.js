const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require("electron-updater")

const fs = require("fs")
const http = require("http")
const express = require("express")
const path = require("path")

const webApp = express()
const server = http.createServer(webApp)
const io = require("socket.io")(server)

autoUpdater.checkForUpdatesAndNotify()

const createWindow = () => {
    const window = new BrowserWindow({
        width: 1100,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
    })
    window.removeMenu()
    window.loadFile('assets/index.html')
    window.webContents.on("before-input-event", (event, input) => {
        if (input.type == 'keyUp' && input.key == 'F12') {
            window.openDevTools()
        }
    });
    window.webContents.setWindowOpenHandler(function(details) {
        require('electron').shell.openExternal(details.url);
        return { action: 'deny' }
    });
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

io.on('connection', (socket) => {
    console.log('Socket connection established with client');
});

webApp.get('/', (req, res) => {
    res.sendFile(__dirname + '/assets/index.html')
})

webApp.use(express.static('assets/'))

server.listen(7219, () => {
    console.log('listening on *:7219');
});