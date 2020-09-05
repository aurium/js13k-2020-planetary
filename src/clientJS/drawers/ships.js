"use strict";

const shipCanvasSize = 300

function drawShipFire(quarter) {
  let grad = gameCtx.createRadialGradient(-quarter*1.1,0, 2, -quarter*1.2,0, quarter/3)
  grad.addColorStop(0, '#8FF')
  grad.addColorStop(1, '#08F')
  gameCtx.fillStyle = grad
  gameCtx.beginPath()
  const wav = 1.15
  gameCtx.moveTo(-quarter*.8, 0)
  gameCtx.bezierCurveTo(
    -quarter*wav, -quarter*.6,
    -quarter*wav, -quarter*.1,
    -quarter*(2 + sin( (frameNow/30) % PI2 ) / 20), 0
  )
  gameCtx.bezierCurveTo(
    -quarter*wav, quarter*.1,
    -quarter*wav, quarter*.6,
    -quarter*.8, 0
  )
  gameCtx.fill()
}
function drawShipRotJet(quarter, dir) {
  gameCtx.beginPath()
  gameCtx.moveTo( quarter*.75, -quarter*.65*dir)
  gameCtx.lineTo( quarter*.5,  -quarter*1.5*dir)
  gameCtx.moveTo(-quarter*.75,  quarter*.65*dir)
  gameCtx.lineTo(-quarter*.5,   quarter*1.5*dir)
  const grad = gameCtx.createRadialGradient(0,0, quarter*.8, 0,0, quarter*1.5)
  grad.addColorStop(0, 'rgba(255,255,255,0.5)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  gameCtx.strokeStyle = grad
  gameCtx.lineWidth = 2
  gameCtx.stroke()
}

function drawShip(canvas, isMySelf) {
  var grad
  const quarter = shipCanvasSize/4
  const ctx = canvas.getContext('2d')
  ctx.translate(quarter*2, quarter*2)
  ctx.rotate(PI/2)
  if (DEBUG_MODE) {
    //ctx.fillStyle = isMySelf ? 'rgba(0,80,255,0.2)' : 'rgba(255,0,0,0.2)'
    //ctx.fillRect(-quarter*2, -quarter*2, shipCanvasSize, shipCanvasSize)
  }

  // Nacele Esq
  function mkNacele(side) {
    ctx.beginPath()
    let ini = PI*(5-side*2)/10
    ctx.moveTo(cos(ini)*quarter, -sin(ini)*quarter)
    ctx.arc(0, 0, quarter, ini, PI*(5-side*8)/10, side>0)
    ctx.closePath()
    grad = ctx.createLinearGradient(quarter*side,0, quarter*side*.6,0)
    grad.addColorStop( 0, '#BBB')
    grad.addColorStop(.5, isMySelf ? '#369' : '#943')
    grad.addColorStop( 1, '#222')
    ctx.fillStyle = grad
    ctx.fill()
  }
  mkNacele(-1) // Left
  mkNacele(+1) // Right

  // wing support
  //ctx.fillRect(-quarter*0.7, 0, quarter*1.4, quarter/2)
  ctx.beginPath()
  ctx.moveTo(-quarter*0.6, 0)
  ctx.lineTo( quarter*0.6, 0)
  ctx.bezierCurveTo(
    quarter*0.8, 0,
    quarter*0.8, quarter/2,
    quarter*0.6, quarter/2
  )
  ctx.lineTo(-quarter*0.6, quarter/2)
  ctx.bezierCurveTo(
    -quarter*0.8, quarter/2,
    -quarter*0.8, 0,
    -quarter*0.6, 0
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(0,0, 0,quarter/2)
  grad.addColorStop(0.0, '#333')
  grad.addColorStop(0.5, '#999')
  grad.addColorStop(1.0, '#333')
  ctx.fillStyle = grad
  ctx.fill()

  // Main Body
  ctx.beginPath()
  ctx.moveTo(0, -quarter*1.2)
  ctx.bezierCurveTo(
    quarter*0.4, -quarter,
    quarter*0.4, -quarter/2,
    quarter*0.4, 0
  )
  ctx.lineTo( quarter*0.4, quarter)
  ctx.lineTo(-quarter*0.4, quarter)
  ctx.lineTo(-quarter*0.4, 0)
  ctx.bezierCurveTo(
    -quarter*0.4, -quarter/2,
    -quarter*0.4, -quarter,
    0           , -quarter*1.2
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(-quarter/2,0, quarter/2,0)
  grad.addColorStop(0.0, '#444')
  grad.addColorStop(0.5, '#BBB')
  grad.addColorStop(1.0, '#444')
  ctx.fillStyle = grad
  ctx.fill()

  // Glass
  ctx.beginPath()
  ctx.moveTo(0, -quarter)
  ctx.bezierCurveTo(
    quarter*0.3, -quarter,
    quarter*0.3, -quarter/2,
    quarter*0.3, -quarter/2
  )
  ctx.lineTo(-quarter*0.3, -quarter/2)
  ctx.bezierCurveTo(
    -quarter*0.3, -quarter/2,
    -quarter*0.3, -quarter,
    0           , -quarter
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(-quarter*.3,0, quarter*.3,0)
  grad.addColorStop(0.0, '#222')
  grad.addColorStop(0.4, '#888')
  grad.addColorStop(0.6, '#888')
  grad.addColorStop(1.0, '#222')
  ctx.fillStyle = grad
  ctx.fill()

  // Color
  ctx.globalCompositeOperation = 'multiply'
  ctx.beginPath()
  let lim = quarter*0.39
  repeat(3, (i)=> {
    ctx.moveTo(-lim, quarter-(14*i)-14)
    ctx.lineTo( lim, quarter-(14*i)-14)
  })
  function mkLLine(side) {
    ctx.moveTo(side*lim        ,  quarter-56)
    ctx.lineTo(side*quarter*0.1,  quarter-56)
    ctx.lineTo(side*quarter*0.1,  quarter*.05)
    ctx.moveTo(side*quarter*0.1, -quarter*.04)
    ctx.lineTo(side*quarter*0.1, -quarter*.16)
    ctx.moveTo(side*quarter*0.1, -quarter*.25)
    ctx.lineTo(side*quarter*0.1, -quarter*.33)
  }
  mkLLine(-1)
  mkLLine(+1)

  ctx.strokeStyle = isMySelf ? 'rgba(0,100,255,0.4)' : 'rgba(255,60,0,0.4)'
  ctx.lineWidth = 8
  ctx.stroke()
}
drawShip(canvShip1, true)
drawShip(canvShip2)

function plotShip(player) {
  const [x, y] = relativeObjPos(player)
  const totSize = shipRadiusWithFire * 2 * zoom / divScreen
  const quarter = totSize / 4
  const radius = shipRadius*zoom/divScreen
  const canvas = player.isMySelf ? canvShip1 : canvShip2
  gameCtx.save()
  gameCtx.translate(x, y)
  gameCtx.fillStyle = 'rgba(255,255,255,0.6)'
  gameCtx.font = `normal ${8/divScreen+5}px sans-serif`
  gameCtx.textAlign = 'center'
  gameCtx.fillText(player.userID, 0, -radius - 16/divScreen)
  gameCtx.rotate(player.rot)
  if (player.fireIsOn) drawShipFire(quarter)
  if (player.rotJet!=0) drawShipRotJet(quarter, player.rotJet)
  gameCtx.drawImage(
    canvas,
    0, 0, shipCanvasSize, shipCanvasSize,
    -totSize/2, -totSize/2, totSize, totSize
  )
  gameCtx.restore()
  if (DEBUG_MODE) {
    gameCtx.strokeStyle = 'rgba(0,255,0,.75)'
    gameCtx.lineWidth = 0.6
    gameCtx.beginPath()
    gameCtx.moveTo(x+radius, y)
    gameCtx.arc(x, y, radius, 0, PI2)
    gameCtx.stroke()
  }
}

function plotMissile(missile) {
  const radius = (shipRadius/2)*zoom/divScreen
  const [x, y] = relativeObjPos(missile)
  gameCtx.save()
  gameCtx.translate(x, y)
  gameCtx.rotate(missile.rot)
  // Fire
  let grad = gameCtx.createRadialGradient(-radius*1.1,0, 1, -radius*1.2,0, radius/3)
  grad.addColorStop(0, '#8FF')
  grad.addColorStop(1, '#08F')
  gameCtx.fillStyle = grad
  gameCtx.beginPath()
  const bazierX = -radius*1.1
  gameCtx.moveTo(-radius*.9, 0)
  gameCtx.bezierCurveTo(
    bazierX, -radius*.3,
    bazierX, -radius*.1,
    -radius*2, 0
  )
  gameCtx.bezierCurveTo(
    bazierX, radius*.1,
    bazierX, radius*.3,
    -radius*.9, 0
  )
  gameCtx.fill()
  // Wings and head
  gameCtx.beginPath()
  gameCtx.moveTo(-radius, 0)
  gameCtx.lineTo(-radius*.6, -radius/3)
  gameCtx.lineTo(0, 0)
  gameCtx.lineTo(-radius*.6,  radius/3)
  gameCtx.moveTo(radius, 0)
  gameCtx.arc(radius*.8, 0, radius*.2, 0, PI2)
  gameCtx.fillStyle = '#888'
  gameCtx.fill()
  // Body
  gameCtx.fillStyle = '#BBB'
  gameCtx.fillRect(-radius, -radius*.1, radius*1.6, radius*.2)
  gameCtx.restore()
  if (DEBUG_MODE) {
    gameCtx.strokeStyle = 'rgba(0,255,0,.75)'
    gameCtx.lineWidth = 0.6
    gameCtx.beginPath()
    gameCtx.moveTo(x+radius, y)
    gameCtx.arc(x, y, radius, 0, PI2)
    const a = missile.velY/missile.velX
    const b = y - a*x
    gameCtx.moveTo(0, a*0 + b)
    gameCtx.lineTo(3000, a*3000 + b)
    gameCtx.stroke()
  }
}

function plotExplosion(boom) {
  const [x, y] = relativeObjPos(boom)
  const radius = boom.radius
  const viewRadius = (shipRadius/4) + radius*zoom/divScreen
  gameCtx.beginPath()
  gameCtx.arc(x, y, viewRadius, 0, PI2)
  gameCtx.closePath()
  gameCtx.strokeStyle = `rgba(255,${255-radius},0,${1-(radius/255)**2})`
  gameCtx.lineWidth = viewRadius*2 / (1+((radius/2)<shipRadius ? 0 : ((radius/2)-shipRadius)/4))
  gameCtx.stroke()
  gameCtx.lineWidth = 1
}
