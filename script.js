const canvas = document.querySelector('#glCanvas')
const gl = canvas.getContext('webgl')

let bufferId = gl.createBuffer() // point/vertex buffer
let cBufferId = gl.createBuffer() // color buffer

let x, y
let shapeIdx = 0 // selected shape; 0: line, 1: square, 2: rectangle, 3: polygon
let size = 0.5 // selected size
let color = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0] // selected color
var mouseClick = false
let isMoveMode = false // move mode
let isMoved = false // prevent click event from firing when moving
let selectedMovePointIdx = -1 // closest point to be moved
let selectedMoveShapeIdx = -1 // closest shape to be moved
let selectedMovePolygonIdx = -1 // closest polygon to be moved

let linePoints = []
let lineColors = []

var squarePoints = []
var squareColors = []
var arrayOfSquarePoints = []
var arrayOfSquareColors = []

var rectanglePoints = []
var rectangleColors = []
var arrayOfRectanglePoints = []
var arrayOfRectangleColors = []
var arrayFirst = []


let polygonPoints = []
let polygonColors = []
let currNumPoly = 0
let arrPolygonPoints = []
let arrPolygonColors = []
let arrNumPoly = []

const MAX_NUM_VERTICES = 20000
const CLOSEST_POINT_THRESHOLD = 0.02

const resizeCanvas = (gl) => {
  gl.canvas.width = (9 / 12) * window.innerWidth
  gl.canvas.height = (9 / 12) * window.innerWidth
}

const getCoordinate = (e) => {
  x = (2 * e.clientX) / canvas.width - 1
  y = (2 * (canvas.height - e.clientY)) / canvas.height - 1
}

const getClosestPointFrom = (x, y) => {
  // Get closest point to (x, y)
  console.log(`Get Closest Point From: ${x}, ${y}`)

  let closestDistance = Infinity
  let nonPolygonPoints = [linePoints, squarePoints]

  for (let i = 0; i < nonPolygonPoints.length; i++) {
    for (let j = 0; j < nonPolygonPoints[i].length; j += 2) {
      currPoint = [nonPolygonPoints[i][j], nonPolygonPoints[i][j + 1]]
      dx = Math.abs(currPoint[0] - x)
      dy = Math.abs(currPoint[1] - y)
      if (isCandidatePoint(dx, dy, closestDistance)) {
        closestDistance = dx + dy
        selectedMovePointIdx = j
        selectedMoveShapeIdx = i
        console.log(`Selected move point idx: ${selectedMovePointIdx}`)
      }
    }
  }

  for (let i = 0; i < arrPolygonPoints.length; i++) {
    for (let j = 0; j < arrPolygonPoints[i].length; j += 2) {
      currPoint = [arrPolygonPoints[i][j], arrPolygonPoints[i][j + 1]]
      dx = Math.abs(currPoint[0] - x)
      dy = Math.abs(currPoint[1] - y)
      if (isCandidatePoint(dx, dy, closestDistance)) {
        closestDistance = dx + dy
        selectedMovePointIdx = j
        selectedMovePolygonIdx = i
        selectedMoveShapeIdx = 3
        console.log(`Selected move point idx: ${selectedMovePointIdx}`)
      }
    }
  }
}

const isCandidatePoint = (dx, dy, closestDistance) => {
  return (
    dx < CLOSEST_POINT_THRESHOLD &&
    dy < CLOSEST_POINT_THRESHOLD &&
    dx + dy < closestDistance
  )
}

const moveNonPolygonPoints = (nonPolygonPoints) => {
  nonPolygonPoints[selectedMovePointIdx] = x
  nonPolygonPoints[selectedMovePointIdx + 1] = y
}

const movePolygonPoints = () => {
  arrPolygonPoints[selectedMovePolygonIdx][selectedMovePointIdx] = x
  arrPolygonPoints[selectedMovePolygonIdx][selectedMovePointIdx + 1] = y
}

const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  }
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

  let colorSelector = document.getElementById('color-picker')
  colorSelector.addEventListener('change', (e) => {
    let { r, g, b } = hexToRgb(e.target.value)
    color = [r, g, b, 1.0, r, g, b, 1.0]
  })

  let sizeSelector = document.getElementById('size-selector')
  sizeSelector.addEventListener('change', (e) => {
    // Scale size to 0.01-1
    size = parseInt(e.target.value) / 100 || 0.01
    console.log(`Selected size: ${size}`)
  })

  let drawModeSelector = document.getElementById('draw-mode')
  drawModeSelector.addEventListener('change', (e) => {
    isMoveMode = !e.target.checked
    console.log(`Move mode: ${isMoveMode}`)
  })

  let moveModeSelector = document.getElementById('move-mode')
  moveModeSelector.addEventListener('change', (e) => {
    isMoveMode = e.target.checked
    console.log(`Move mode: ${isMoveMode}`)
  })

  //Move object
  canvas.addEventListener('mousedown', (e) => {
    mouseClick = true
    if (isMoveMode) {
      isMoved = false
      getCoordinate(e)
      getClosestPointFrom(x, y)
    }
    if (shapeIdx == 1 || shapeIdx == 2) {
      arrayFirst = []
      getCoordinate(e)
      arrayFirst.push(x)
      arrayFirst.push(y)
    }
  })

  canvas.addEventListener('mousemove', (e) => {
    if (isMoveMode) {
      isMoved = true
    }
    if(mouseClick){
      getCoordinate(e)
      if (shapeIdx == 1) {
        var temp = Math.max((arrayFirst[0] - x), (arrayFirst[1] - y))
  
        squarePoints.push(arrayFirst[0]);
        squarePoints.push(arrayFirst[1]);
  
        squarePoints.push(arrayFirst[0] + temp);
        squarePoints.push(arrayFirst[1]);
  
        squarePoints.push(arrayFirst[0] + temp);
        squarePoints.push(arrayFirst[1] - temp);
  
        squarePoints.push(arrayFirst[0]);
        squarePoints.push(arrayFirst[1] - temp);
  
        squareColors.push(color);
        squareColors.push(color);
  
        arrayOfSquarePoints.push(squarePoints);
        arrayOfSquareColors.push(squareColors);
      
        render()
        squarePoints = []
        squareColors = []
        arrayOfSquareColors.pop()
        arrayOfSquarePoints.pop()
      }

      if (shapeIdx == 2) {
        var temp_x = (arrayFirst[0] - x) * -1
        var temp_y = arrayFirst[1] - y
        rectanglePoints.push(arrayFirst[0]);
        rectanglePoints.push(arrayFirst[1]);
  
        rectanglePoints.push(arrayFirst[0] + temp_x);
        rectanglePoints.push(arrayFirst[1]);
  
        rectanglePoints.push(arrayFirst[0] + temp_x);
        rectanglePoints.push(arrayFirst[1] - temp_y);
  
        rectanglePoints.push(arrayFirst[0]);
        rectanglePoints.push(arrayFirst[1] - temp_y);
  
        rectangleColors.push(color);
        rectangleColors.push(color);
  
        arrayOfRectanglePoints.push(rectanglePoints);
        arrayOfRectangleColors.push(rectangleColors);
      
        render()
        rectanglePoints = []
        rectangleColors = []
        arrayOfRectangleColors.pop()
        arrayOfRectanglePoints.pop()
      }

    }
    
  })

  canvas.addEventListener('mouseup', (e) => {
    mouseClick = false
    if (isMoveMode && isMoved) {
      getCoordinate(e)
      if (selectedMoveShapeIdx === 0) moveNonPolygonPoints(linePoints)
      if (selectedMoveShapeIdx === 1) moveNonPolygonPoints(squarePoints)
      // if (selectedMoveShapeIdx === 2) moveNonPolygonPoints() // TODO
      if (selectedMoveShapeIdx === 3) movePolygonPoints()
      render()
    }
    if (shapeIdx == 1) {
      getCoordinate(e)
      var temp = Math.max((arrayFirst[0] - x), (arrayFirst[1] - y))

      squarePoints.push(arrayFirst[0]);
      squarePoints.push(arrayFirst[1]);

      squarePoints.push(arrayFirst[0] + temp);
      squarePoints.push(arrayFirst[1]);

      squarePoints.push(arrayFirst[0] + temp);
      squarePoints.push(arrayFirst[1] - temp);

      squarePoints.push(arrayFirst[0]);
      squarePoints.push(arrayFirst[1] - temp);

      squareColors.push(color);
      squareColors.push(color);

      arrayOfSquarePoints.push(squarePoints);
      arrayOfSquareColors.push(squareColors);
    
      render()
    }
    else if (shapeIdx == 2) {

    }
  })

  //When canvas is clicked and not in move mode
  canvas.addEventListener('click', (e) => {
    if (!isMoveMode) {
      getCoordinate(e)
      if (shapeIdx == 0) {
        console.log(`Current X: ${x}`)
        console.log(`Current Y: ${y}`)
        linePoints.push(x, y, x + size, y)
        console.log(`Line Points: ${linePoints}`)
        lineColors.push(color)
        console.log(`Line Colors: ${lineColors}`)
      } 
      else if (shapeIdx == 2) {
        //rectangle
      } else if (shapeIdx == 3) {
        //polygon
        let numPoly = parseInt(document.getElementById('number-nodes').value)
        console.log(numPoly)

        polygonPoints.push(x, y)
        polygonColors.push(color, color)
        if (currNumPoly < numPoly - 1) {
          //not last node
          currNumPoly += 1
        } else {
          //last polygon node
          arrPolygonPoints.push(polygonPoints)
          arrPolygonColors.push(polygonColors)
          arrNumPoly.push(numPoly)
          polygonPoints = []
          polygonColors = []
          currNumPoly = 0
          // console.log(arrPolygonPoints)
          // console.log(arrPolygonColors)
          //Save polygon and reset
        }
      } else {
      }

      render()
    }
  })

  // Set canvas context
  gl.viewport(0, 0, canvas.width, canvas.height) // set viewport
  gl.clearColor(0.6, 0.75, 0.9, 1) // background color
  gl.clear(gl.COLOR_BUFFER_BIT) // remove old drawing

  // Initialize shaders
  let program = initShaders(gl)
  gl.useProgram(program)

  // Initialize position and color buffers. Buffers move vertex and other data to the GPU.
  // gl.bindBuffer   : sets that buffer as the buffer to be worked on
  // gl.bufferData   : copies data into the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId)
  gl.bufferData(gl.ARRAY_BUFFER, 8 * MAX_NUM_VERTICES, gl.STATIC_DRAW)
  let vPos = gl.getAttribLocation(program, 'vPosition')
  gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vPos)

  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId)
  gl.bufferData(gl.ARRAY_BUFFER, 16 * MAX_NUM_VERTICES, gl.STATIC_DRAW)
  let vColor = gl.getAttribLocation(program, 'vColor')
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vColor)
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT)

  // START: Draw line
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(linePoints))
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(lineColors))

  for (let i = 0; i < linePoints.length / 2 - 1; i++) {
    gl.drawArrays(gl.LINES, 2 * i, 2)
  }
  // END: Draw line

  // START: Draw Square
  for (var j = 0; j < arrayOfSquarePoints.length; j++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfSquarePoints[j]));
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfSquareColors[j]));
    if (arrayOfSquarePoints[j].length != 0) {
      for (var i = 0; i < arrayOfSquarePoints[j].length / 4 - 1; i++) {
        gl.drawArrays(gl.LINE_LOOP, 4 * i, 4);
      }
    }
  }
  // END: Draw Square

  // START: Draw Rectangle
  for (var j = 0; j < arrayOfRectanglePoints.length; j++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfRectanglePoints[j]));
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrayOfRectangleColors[j]));
    if (arrayOfRectanglePoints[j].length != 0) {
      for (var i = 0; i < arrayOfRectanglePoints[j].length / 4 - 1; i++) {
        gl.drawArrays(gl.LINE_LOOP, 4 * i, 4);
      }
    }
  }
  // END: Draw Rectangle

  // START: Draw Polygon
  for (let i = 0; i < arrPolygonPoints.length; i++) {
    //Draw each polygon
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrPolygonPoints[i]))

    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arrPolygonColors[i]))
    if (arrPolygonPoints[i].length != 0) {
      gl.drawArrays(gl.LINE_LOOP, 0, arrNumPoly[i])
    }
  }
  // END: Draw Polygon
}

function initShaders(gl) {
  // Vertex shader program
  let vertElmt = document.getElementById('vertex-shader')
  let vertShdr = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertShdr, vertElmt.text)
  gl.compileShader(vertShdr)

  // Fragment shader program
  let fragElmt = document.getElementById('fragment-shader')
  let fragShdr = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragShdr, fragElmt.text)
  gl.compileShader(fragShdr)

  // Attach shader to program and link program to WebGL
  let program = gl.createProgram()
  gl.attachShader(program, vertShdr)
  gl.attachShader(program, fragShdr)
  gl.linkProgram(program)

  return program
}

function flatten(v) {
  // Create a flat (1D) Float32Array from list of vertices/colors
  let flatArr

  if (Array.isArray(v[0])) {
    flatArr = new Float32Array(v.length * v[0].length)
    let idxFlatArr = 0

    for (let i = 0; i < v.length; i++) {
      for (let j = 0; j < v[i].length; j++) {
        flatArr[idxFlatArr] = v[i][j]
        idxFlatArr += 1
      }
    }
  } else {
    flatArr = new Float32Array(v.length)
    for (let i = 0; i < v.length; i++) {
      flatArr[i] = v[i]
    }
  }

  return flatArr
}

//Help button
var modal = document.getElementById('modal')
var btn = document.getElementById('help-btn')
var span = document.getElementsByClassName('close')[0]
btn.onclick = function () {
  modal.style.display = 'block'
}
span.onclick = function () {
  modal.style.display = 'none'
}
