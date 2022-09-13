var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

const ngrok = window.location.href.includes('ngrok')

if(ngrok){
  var socket = io()
}
else{
  var socket = io("http://localhost:5628")
}

var cells = {}

socket.on("cell", function(msg){
  cells = msg
  for(key in cells){
    let cell = cells[key]
    let url = cell.texture
    if(ngrok){
      split = url.split('/')
      url = split[split.length - 2] + '/' + split[split.length - 1]
    }
    cells[key].texture = new Image
    cells[key].texture.src = url
  }
  console.log('Received cells from node client')
})
socket.on('disconnect', function(){
  if(ngrok){
    alert('The multiplayer session was ended by the host.')
    window.close()
  }
})

window.onresize = resizeCanvas
function resizeCanvas(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()

var cellHeight = 64
var grid = {width: 10, height: 10}
var borderWidth = 4
var camera = {x: 0, y:  0}
var panSpeed = 10

var keys = {}

function drawCell(index, gridX, gridY, rotation = 0){
  if(cellHeight <= 16){
    ctx.fillStyle = cells[Object.keys(cells)[index]].color
    ctx.fillRect(cellHeight * gridX + borderWidth,
      cellHeight * gridY + borderWidth,
      cellHeight - borderWidth,
      cellHeight - borderWidth)
    return
  }
  ctx.save()
  ctx.translate(cellHeight * gridX + borderWidth + (cellHeight / 2),
    cellHeight * gridY + borderWidth + (cellHeight / 2))
  ctx.rotate((rotation * 90) * Math.PI / 180)  
  let offset = {x: 0, y: 0}
  switch(rotation){
    case 1:
      offset.y = borderWidth
      break
    case 2:
      offset.x = borderWidth
      offset.y = borderWidth
      break
    case 3:
      offset.x = borderWidth
      break
  
  }
  ctx.drawImage(cells[Object.keys(cells)[index]].texture,
    -(cellHeight / 2) + offset.x, -(cellHeight / 2) + offset.y,
    cellHeight - borderWidth,
    cellHeight - borderWidth)
  ctx.restore()
}

function draw(){
  requestAnimationFrame(draw)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'dimgrey'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.translate(camera.x + canvas.width / 2, camera.y + canvas.height / 2)

  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = 'grey'
  for(let x = 0; x < grid.width; x++){
    for(let y = 0; y < grid.height; y++){
      ctx.fillRect(cellHeight * x + borderWidth, cellHeight * y + borderWidth, cellHeight - borderWidth, cellHeight - borderWidth)
    }
  }

  for(let i = 0; i < Object.keys(cells).length; i++){
    for(let r = 0; r < 4; r++){
      drawCell(i, i, r, r)
    }
  }

  if(keys.w) camera.y += panSpeed
  if(keys.s) camera.y -= panSpeed
  if(keys.a) camera.x += panSpeed
  if(keys.d) camera.x -= panSpeed
}
requestAnimationFrame(draw)

document.onkeydown = function(e){
  keys[e.key] = true
}
document.onkeyup = function(e){
  keys[e.key] = false
}

document.onwheel = function(e){
  cellHeight += e.deltaY / 5
  if(cellHeight < 8){
    cellHeight = 8
    return
  }
  borderWidth = (cellHeight / 64) * 4
  camera.x += (camera.x / cellHeight) * (e.deltaY / 5)
  camera.y += (camera.y / cellHeight) * (e.deltaY / 5)

}