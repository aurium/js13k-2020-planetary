"use strict";

var gameCtx = null
var winW = window.innerWidth
var winH = window.innerHeight
var divScreen = 1
var FPS = 30
var stars1 = [], stars2 = [], stars3 = []
var frameNow

const mkCanvas = (w,h)=> {
  let el = mkEl('canvas', body)
  el.width = w
  el.height = h
  return el
}
// <canvas id="gameCanvas"></canvas>
// <canvas id="radarCanvas" width="400" height="400"></canvas>
// <canvas id="canvBG3" width="2048" height="2048"></canvas>
// <canvas id="canvShip1" width="300" height="300"></canvas>
// <canvas id="canvShip2" width="300" height="300"></canvas>
const canvBG1 = mkCanvas()
const canvBG2 = mkCanvas()
const canvBG3 = mkCanvas(2048, 2048)
const canvBG4 = mkCanvas()
const canvShip1 = mkCanvas(300, 300)
const canvShip2 = mkCanvas(300, 300)
const gameCanvas = mkCanvas()
const radarCanvas = mkCanvas(400, 400)
gameCanvas.id = 'gameCanvas'
radarCanvas.id = 'radar'

function setQuality(newQuality, force) {
  //if (force) notify('Force screen reset')
  if (quality !== newQuality || force) {
    let name = Object.entries(QUALITY).find(([k,v])=> v === newQuality)[0]
    // if (quality !== 0 && quality < newQuality) {
    //   notify(msg+` Great! Render quality up to "${name.toLowerCase()}".`)
    // }
    // if (quality !== 0 && quality > newQuality) {
    //   notify(msg+` Render quality down to "${name.toLowerCase()}".`)
    // }
    quality = newQuality
    divScreen = 5 - quality
    debug(`Current render quality: ${name} (${quality})`)
    debug(`Divide screen by: ${divScreen}`)

    winW = round(window.innerWidth/divScreen)
    winH = round(window.innerHeight/divScreen)

    gameCanvas.width = winW
    gameCanvas.height = winH

    gameCtx = gameCanvas.getContext('2d')
    gameCtx.fS('#000')
    gameCtx.fR(0, 0, winW, winH)

    canvBG1.width = canvBG2.width = canvBG4.width = round(winW/3)*2
    canvBG1.height = canvBG2.height = canvBG4.height = round(winH/3)*2
    debug('Create BG 1 (stars)')
    drawStars(canvBG1, stars1, 7)
    debug('Create BG 2 (stars)')
    drawStars(canvBG2, stars2, 5)
    debug('Create BG 4 (stars)')
    drawStars(canvBG4, stars3, 2)
    if (DEBUG_MODE) {
      canvBG1.getContext('2d').fillStyle = 'green'
      canvBG1.getContext('2d').fillText('Stars 1', 50, 50)
      canvBG2.getContext('2d').fillStyle = 'green'
      canvBG2.getContext('2d').fillText('Stars 2', 50, 50)
      canvBG4.getContext('2d').fillStyle = 'green'
      canvBG4.getContext('2d').fillText('Stars 3', 50, 50)
    }
  }
}

window.addEventListener('resize', ()=> setQuality(quality, true))

/*var hideMouseTimeout = null
body.addEventListener('mousemove', ()=> {
  bodyClass.add('mouse-alive')
  clearTimeout(hideMouseTimeout)
  hideMouseTimeout = setTimeout(()=> bodyClass.remove('mouse-alive'), 1000)
})*/

if (navigator.userAgent.match(/Firefox\//)) bodyClass.add('firefox')

function plotBgTile(canvas, tileX, tileY, scale) {
  let w = canvas.width
  let h = canvas.height
  let ws = w * scale
  let hs = h * scale
  tileX /= divScreen
  tileY /= divScreen
  tileX %= ws; if (tileX > 0) tileX -= ws
  tileY %= hs; if (tileY > 0) tileY -= hs
  for (let x = tileX; x < winW; x += ws) {
    for (let y = tileY; y < winH; y += hs) {
      gameCtx.dI(canvas, 0, 0, w, h, x, y, ws, hs)
    }
  }
}

function updateBg() {
  const {x, y, velX, velY} = mySelf

  gameCtx.gCO('source-over')
  gameCtx.fS(`#000`)
  gameCtx.fR(0, 0, winW, winH)

  // Plot level 3 stars
  gameCtx.gCO('screen')
  plotBgTile(canvBG4, -x/15, -y/15, 1)

  // Plot Nebulas
  //gameCtx.gCO('lighten')
  plotBgTile(canvBG3, -(x+9000)/9, -(y+7000)/9, 2/divScreen)

  // Plot level 2 stars
  //gameCtx.gCO('screen')
  plotBgTile(canvBG2, -x/6, -y/6, 1)

  // Plot level 1 stars
  plotBgTile(canvBG1, -x/3, -y/3, 1)
}

function relativeObjPos({x, y}) {
  return [
    winW/2 + (x-mySelf.x)*zoom / divScreen,
    winH/2 + (y-mySelf.y)*zoom / divScreen
  ]
}

var frameCounter = 0
var fpsDelay = 0
var lastUpdate = Date.now()
var alertFPS = 0
const framesToCompute = 10 // number of frames between FPS calculation
function updateGameCanvas() {
  window.requestAnimationFrame(updateGameCanvas)
  //setTimeout(updateGameCanvas, 500)
  frameCounter++
  frameNow = Date.now()
  updateEntities()

  // Update zoom
  zoom = (zoom*targetZoomDelay + targetZoom) / (targetZoomDelay+1)
  if (1 < zoom && zoom < 1.001) zoom = 1

  updateBg()
  gameCtx.gCO('source-over')
  boxes.forEach(plotBox)
  booms.forEach(plotExplosion)
  missiles.forEach(plotMissile)
  planets.forEach(plotPlanet)
  users.filter(p=>p.life).forEach(plotShip)
  updateSun()
  if ((frameCounter%updateRadarRate)==0) updateRadar()
  if (frameCounter%framesToCompute === 0) {
    let delay = frameNow - lastUpdate
    FPS = round(framesToCompute*1000/delay)
    if (FPS > 33) {
      alertFPS++
    } else if ((!gameStarted || quality < QUALITY.MEDIUM) && FPS > 22) {
      alertFPS++
    } else if (FPS < (gameStarted ? 20 : 12)) {
      alertFPS--
      if (gameStarted && FPS < 12) alertFPS -= 5
      debug('FPS Merda', alertFPS)
    } else {
      alertFPS /= 2
    }
    lastUpdate = frameNow
    if (alertFPS < -2) {
      if (quality > 1) setQuality(quality - 1)
      alertFPS = 0
    }
    if (alertFPS > 600/framesToCompute) {
      if (quality < QUALITY.HIGH) setQuality(quality + 1)
      alertFPS = 0
    }
  }
}

function initDrawer() {
  setQuality(QUALITY.HIGH)
  gameCtx.iSE(true)
  gameCtx.imageSmoothingQuality = 'low'
  debug('Create BG 3 (Nebulas)')
  drawPlasma()
  updateGameCanvas()
}
