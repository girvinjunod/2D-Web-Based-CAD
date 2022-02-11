const canvas = document.querySelector('#glCanvas')
const gl = canvas.getContext('webgl')

let x, y
let shapeIdx = 0
let size = 50

const resizeCanvas = (gl) => {
  gl.canvas.width = (9 / 12) * window.innerWidth
  gl.canvas.height = (9 / 12) * window.innerWidth
}

const getCoordinate = (e) => {
  x = (2 * e.clientX) / canvas.width - 1
  y = (2 * (canvas.height - e.clientY)) / canvas.height - 1
}

window.onload = function main() {
  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      'Unable to initialize WebGL. Your browser or machine may not support it.'
    )
    return
  }
  resizeCanvas(gl)
  window.addEventListener('resize', () => resizeCanvas(gl), false)

  let shapeSelector = document.getElementById('shape-selector')
  shapeSelector.addEventListener('change', (e) => {
    shapeIdx = e.target.value
    console.log(`Selected shape: ${shapeIdx}`)
  })

  let sizeSelector = document.getElementById('size-selector')
  sizeSelector.addEventListener('change', (e) => {
    size = e.target.value
    console.log(`Selected size: ${size}`)
  })

  canvas.addEventListener('click', (e) => {
    if (shapeIdx == 0) {
      coordinate = getCoordinate(e)
      console.log(`Current X: ${x}`)
      console.log(`Current Y: ${y}`)
      // draw line
      // render line
    }
  })

  gl.clearColor(0.6, 0.75, 0.9, 1)

  gl.clear(gl.COLOR_BUFFER_BIT)
}
