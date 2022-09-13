const {app, BrowserWindow} = require('electron')
const { autoUpdater } = require("electron-updater")
const fs = require("fs")

const http = require("http")
const express = require("express")
const webApp = express()
const server = http.createServer(webApp)
const io = require("socket.io")(server)

autoUpdater.checkForUpdatesAndNotify()

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
    })  
    window.removeMenu()
    window.loadFile('assets/index.html')
    window.webContents.on("before-input-event", (event, input) => {
        if(input.type == 'keyUp' && input.key == 'F12'){
            window.openDevTools()
        }
    });
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0){
            createWindow()
        }
    })
})
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

function readCells(){
    var dir = 'cells/'
    var folders = fs.readdirSync(dir, {withFileTypes: true}).filter(dirent => dirent.isDirectory())
    console.log("Found " + folders.length + " folders in directory")

    var cells = {}

    for(folder of folders){
        var cellJson = {}
        try{
            cellJson = JSON.parse(fs.readFileSync(dir + folder.name + '/cell.json'))
        }
        catch{
            console.warn("Failed to open cell.json from cells/" + folder.name + "/. Skipping this folder")
            continue
        }
        
        cells[cellJson.id] = {
            name: cellJson.name,
            description: cellJson.description,
            texture: __dirname + "/" + dir + cellJson.id + "/" + cellJson.texture,
            script: fs.readFileSync(dir + cellJson.id + "/" + cellJson.script, {encoding: 'utf-8'}),
            color: cellJson.color
        }
    }

    return cells
}

io.on('connection', (socket) => {
    console.log('Socket connection established with client');
    var cells = readCells()
    socket.emit('cell', cells)
});

webApp.get('/', (req, res) => {
    res.sendFile(__dirname + '/assets/index.html')
})

webApp.use(express.static('assets/'))
webApp.use(express.static('cells/'))

server.listen(5628, () => {
    console.log('listening on *:5628');
});