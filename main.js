const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require("electron-updater")
const fs = require("fs")

const http = require("http")
const express = require("express")
const webApp = express()
const server = http.createServer(webApp)
const io = require("socket.io")(server)

autoUpdater.checkForUpdatesAndNotify()

const createWindow = (width, height) => {
    const window = new BrowserWindow({
        width: width,
        height: height
    })
    window.removeMenu()
    window.loadFile('assets/index.html')
    window.webContents.on("before-input-event", (event, input) => {
        if (input.type == 'keyUp' && input.key == 'F12') {
            window.openDevTools()
        }
    });
}

app.whenReady().then(() => {
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.size
    createWindow(width - 800, height - 400)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(width - 400, height - 800)
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