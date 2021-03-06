function mkStarData(size) {
  let r=0, g=0, b=0
  if (rnd()<0.5) {
    r=g=b = 255
  } else if (rnd()<0.5) {
    b = 255
    r = rnd()*255
    g = 127 + r/2
  } else {
    r=g = 255
    b = rnd()*255
  }
  return { x:rnd(), y:rnd(), size:rnd()*size, r,g,b }
}

for (let i=0; i< 25; i++) stars1[i] = mkStarData(7)
for (let i=0; i< 40; i++) stars2[i] = mkStarData(5)
for (let i=0; i<120; i++) stars3[i] = mkStarData(2)

// function plotPix(pixelsArr, w, x,y, r,g,b,a) {
//   let pos = (y*w + x) * 4
//   pixelsArr[pos+0] = r
//   pixelsArr[pos+1] = g
//   pixelsArr[pos+2] = b
//   pixelsArr[pos+3] = a
// }

function drawStars(canvas, stars, maxSize) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  const imgData = ctx.gID(0, 0, w, h)
  const pixels = imgData.data
  stars.forEach(({x:xPct,y:yPct,size:sizeOrig,r,g,b}) => {
    let x = round( (w-4) * xPct + 2 )
    let y = round( (h-4) * yPct + 2 )
    function plotPix(x, y, a) {
      let pos = (y*w + x) * 4
      pixels[pos+0] = r
      pixels[pos+1] = g
      pixels[pos+2] = b
      pixels[pos+3] = a
    }
    let size = sizeOrig / divScreen
    let a = (maxSize<3 && divScreen>2) ? 128 : 255;
    plotPix(x, y, a)
    for (let i=0; i<7; i++) {
      let a = (size-i)*255 / (maxSize/divScreen)
      plotPix(x+i, y, a)
      plotPix(x-i, y, a)
      plotPix(x, y+i, a)
      plotPix(x, y-i, a)
    }
  })
  ctx.pID(imgData, 0, 0)
}
