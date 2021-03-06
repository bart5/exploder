// ==========================================
var centerX = 0;
var centerY = 0;
var pixelWidth = 14; //in 'px', with margin
var pW = pixelWidth; //for shortcut
var display = document.querySelector('div.display');
var displayX = display.offsetLeft;
var displayY = display.offsetTop;
var batch = []; //array of coordinates
var pixels; // Array of all the pixels
var position; // Array of pixel's positions at various points in time
var coeX = [];
var coordinates = {}; // Object for all symbols coordinates
var widths = {}; // Object for all symbols widths
var readyInput = []; // List of symbols to display
var symbolSpacing = 0.75;
var localData = {
  'settings'  : null,
  'forces' : null,
  'symbols'   : null,
}
// Objects holding data about symbols
var dictionary = [];
var coordinates = {};
var widths = {};

// ==========================================
// SETTINGS
// var keys = ['scale','rand','range','density','speed']
var keys = ['speed','duration'];
// var setup = {
//   'scale'   : 1, //
//   'rand'    : 0.15, // Probability of random movements
//   'range'   : 0.6, // How much moves pixels make
//   'density' : 1, // Pixels number multiplier
//   'speed'   : 30 // Pixel movements per second
// }
var setup = {
  'speed'   : 15, // Pixel movements per second
  'duration'   : 3, // Pixel movements per second
}
// ==========================================
// Convert server response to a more convenient format
// and aggregate it in appropariate variables.
function adaptServerData() {
  dictionary = []; // Clear dictionary
  coordinates = {}; //Clear coordinates
  widths = {};
  var data = localData.symbols;
  for (var i = 0; i < data.length; i++) {
    var coordsX = JSON.parse('[' + data[i][2] + ']');
    var coordsY = JSON.parse('[' + data[i][3] + ']');
    var coords = [];
    for (var j = 0; j < coordsX.length; j++) {
      cache = [coordsX[j],coordsY[j]];
      coords.push(cache);
    }
    var symbolCode = data[i][1];
    var width = textWidth(coords);
    // Append symbol to the dictionary
    dictionary.push(symbolCode);
    // Append symbol with its coordinates to aggregate list
    Object.defineProperty(coordinates, symbolCode, {
      value: coords
    });
    // Append symbol with its width value to aggregate list
    Object.defineProperty(widths, symbolCode, {
      value: width
    });
  }
}
// ========================================
// Scan text for known codenames of symbols
function evaluateInputText(text) {
  if (text === undefined) {
    target = document.querySelector('#textInput');
    var text = target.value;
  }
  // Deal with apostrophes
  do {
    text = text.replace("'","<aps>")
  } while (text.indexOf("'") !== -1);

  readyInput = [];
  for (var i = 0; i < text.length; i++) {
    var symbol = text[i];
    // '<' indicate code for special symbol
    // unless escaped with '<' itself
    var special = '';
    if (symbol === '<') { //Special symbol case
      var codeStart = i;
      var codeEnd = text.indexOf('>',codeStart);
      var code = text.substring(codeStart + 1,codeEnd);
      // If '>' was not found code == '', and also
      // code for special symbol can't have ' ' in it
      // so in this case '<' is just regular symbol
      if (code == '' || code.indexOf(' ') != -1) {
        special = false;
      }
      else {
        special = true;
        var index = dictionary.indexOf(code);
        readyInput.push(code);
        i = i + code.length + 1; //Skip symbols equal code length
      }
    }
    if (!special) { //Regular symbol case
      var index = dictionary.indexOf(symbol);
      readyInput.push(symbol);
    }
    // ---------
    if (symbol == ' ') {
      readyInput.push(symbol);
    }
    else if (index == -1) { //Invalid input case
      var msg = (code == 'undefined' ? symbol : code);
      var text = 'Unrecognized symbol/code: '+ msg +'.';
      inputAlert(text);
      return console.log('Unrecognized symbol/code: '+ msg +'.');
    }
  }
  // Proceed to the next operation
  createBatch(readyInput);
}
// ==========================================
// Compile all the letters into one set of
// coordinates.
// text = readyInput
function createBatch(text) {
  batch = []; //Clear batch
  var textLen = 0;
  for (var i = 0; i < text.length; i++) { //Each symbol
    if (text[i] === ' ') { // Spot space
      textLen += (3 - symbolSpacing);
      continue;
    }
    var coords = [];
    var symbol = coordinates[text[i]]; // Aggregated pixels
    for (var j = 0; j < symbol.length; j++) { //Each pixel
      coords.push([symbol[j][0],symbol[j][1]]); //save coords
      coords[j][0] += textLen; //push symbol to the end of text
    }
    batch.push.apply(batch, coords); //Append batch
    textLen += widths[text[i]] + symbolSpacing; //Bump up total width
  }
  // Call function to draw pixels
  layout(batch,-textWidth(batch)/2,-overBaseTextHeight(batch)/2);
  // layout(batch,-textWidth(batch)/2,0);
}
// ==========================================
function overBaseTextHeight(array) {
// Go through 'y' coordinates and find
// and compare their extreme values
  var maxY, minY;
  for (var i = 0; i < array.length; i++) {
    var y = array[i][1]; //First pixel, second coordinate
    if (i == 0) {maxY = y; minY = y}
    if (maxY < y) maxY = y
    if (minY > y) minY = y
  }
  var height = maxY; // <-----
  return height + 1; //y = 0 gives 1 in height
}
// ==========================================
function textHeight(array) {
// Go through 'y' coordinates and find
// and compare their extreme values.
  var maxY, minY;
  for (var i = 0; i < array.length; i++) {
    var y = array[i][1]; //First pixel, second coordinate
    if (i == 0) {maxY = y; minY = y}
    if (maxY < y) maxY = y
    if (minY > y) minY = y
  }
  var height = maxY - Math.min(minY,0); // <-----
  return height + 1; //y = 0 gives 1 in height
}
// ==========================================
function textWidth(array) {
  var maxX, minX;
  for (var i = 0; i < array.length; i++) {
    var x = array[i][0]; //First pixel, first coordinate
    if (i == 0) {maxX = x; minX = x}
    if (maxX < x) maxX = x
    if (minX > x) minX = x
  }
  var width = maxX - minX;
  return width + 1; //x = 0 gives 1 in height
}
// ==========================================
function layout(el,shift_x,shift_y) {
// Create pixels for given element based on 'el'
// and move them all to proper location defined
// in global coordinates (.display = 0,0).
  removePixels();
  for (var i = 0; i < el.length; i++) {
    // Create pixels:
    var pixel = document.createElement('div');
    // NOTE: here possibly assign some identifiers
    pixel.classList.add('pixel');
    display.appendChild(pixel);
    // Adjust position:
    var x = el[i][0] + shift_x;
    var y = el[i][1] + shift_y;
    // pixel.style.left = x*pW + 'px';
    // pixel.style.bottom = y*pW + 'px';
    var translate = 'translate(' + x*pW + 'px,' + (-y*pW) + 'px)';
    pixel.style.transform = translate;
    // pixel.style.bottom = y*pW + 'px';
  }
}
// ==========================================
function mkArray(a,b,c) {
// Create multidimensional array.
// It is helpful as it is not possible to create arrays
// in javascript in implicit way just by referencing desired
// dimension.
// a x b x c
  var array = [];

  for (var i = 0; i < a; i++) {
    array.push([]);
    for (var j = 0; j < b; j++) {
      array[i].push([]);
      if (c > 0) {
        for (var k = 0; k < c; k++) {
          array[i][j].push([]);
        }
      }
    }
    // array[i] = [];
    // if (c > 1) {
    //   for (var j = 0; j < b; j++) {
    //     array[i][j] = [];
    //   }
    // }
  }
  return array;
}
// ========================================
function applyForce(i,j,id,fps) {
  // console.log('---------------------');
  // console.log('frame: ' + i + ', pixel: ' + j);
  // console.log('Apllying force...');
  // Check if pixel is within influence area of the force
  var pixelX = position[i][j][0];
  var pixelY = position[i][j][1];
  var forceX = forces[id].position[0];
  var forceY = forces[id].position[1];
  // Pixel position in force coordinates system
  var localX = pixelX - forceX;
  var localY = pixelY - forceY;
  // console.log('localX: ' + localX + ', localY: ' + localY);
  // Perimeters of influence area
  var relAngRad1 = toRelAngle(forces[id].rad1);
  var relAngRad2 = toRelAngle(forces[id].rad2);
  // Relative angle of vector pointing to the pixel
  var angle = relativeAngle([localX, localY]);
  // Check
  if (relAngRad2 > relAngRad1) {
    if (angle < relAngRad1 || angle > relAngRad2) {
      // console.log('!! Exception1: Return !!');
      return
    }
  }
  else {
    if (angle > relAngRad2 && angle < relAngRad1) {
      // console.log('!! Exception2: Return !!');
      return
    }
  }
  // ---Conditions are met---
  // ---------------------------------
  // ----Apply force----
  var value = forces[id].value;
  // var speed = setup.speed;
  var speed = setup.speed * 3;
  if (forces[id].type === 1) { // Radial force
    var length = vectorLength([localX,localY]);
    var incrementX = localX/length*value*speed/fps;
    var incrementY = localY/length*value*speed/fps;
    // console.log('incrementX: ' + incrementX + ', incrementY: ' + incrementY);
    velocities[j][0] += incrementX;
    velocities[j][1] += incrementY;
    // console.log('velocities[0]: ' + velocities[j][0] + ', velocities[1]: ' + velocities[j][1]);
  }
  else if (forces[id].type === 2) { // One direction
    var incrementX = angToVersor(forces[id].rad3)[0]*value*speed/fps;
    var incrementY = angToVersor(forces[id].rad3)[1]*value*speed/fps;
    // console.log('incrementX: ' + incrementX + ', incrementY: ' + incrementY);
    velocities[j][0] += incrementX;
    velocities[j][1] += incrementY;
    // console.log('velocities[0]: ' + velocities[j][0] + ', velocities[1]: ' + velocities[j][1]);
  }
  else if (forces[id].type === 3) { // Vortex
    var length = vectorLength([localX, localY]);
    var angle = relativeAngle([localX, localY]);
    var angularMove = 6.28/360*value*speed/fps/length;
    // var angularMove = 6.28/360*value*speed/fps;
    var endAngle = angle + angularMove;
    var endVersor = angToVersor(endAngle);
    var x = endVersor[0]*length;
    var y = endVersor[1]*length;
    var incrementX = x - localX;
    var incrementY = y - localY;

    velocities[j][0] += incrementX;
    velocities[j][1] += incrementY;
  }
}
// ========================================
// Check force time constraints
function forceTiming(id,fps) {
  // ---Check time constraints---
  // Check delay
  var delay = forces[id].delay;
  var currentTime = frame / fps;
  if (currentTime < delay) {
    return false
  }
  // Check stop time
  var stopTime = forces[id].stopTime;
  if (currentTime > stopTime) {
    return false
  }
  // Check iterations
  var currentIteration = Math.ceil((currentTime-delay)/(interval+1));
  if (currentIteration > iterations) {
    return false
  }
  // Check interval
  // Is force in resting phase or should it be applied?
  var interval = forces[id].interval; //interval lasts 1s
  var iterations = forces[id].iterations;
  if (((currentTime-delay)-(currentIteration-1)*(interval+1))>1) {
    return false
  }
  return true
}
// ========================================
// ---Global Variables
var velocities = []; //Current speed vector of each pixel
// -----------
function simulate() {
  // console.log('simulating...');
  restore(); // Restore initial positions
  var duration = setup.duration; // when animation should stop
  var fps = 60;
  var frames = duration * fps;
  displayY = (window.innerHeight - display.offsetTop);
  // var displayX = 800;
  // var displayY = 500;
  var pixelsOut = []; // Array of off-screen pixels
  pixels = document.querySelectorAll('.pixel');
  velocities = [];
  for (var i = 0; i < pixels.length; i++) {
    velocities[i] = [0,0];
  }
  position = [];
  position = mkArray(frames+1,pixels.length,2); // Prepare array
  for (var i = 0; i < pixels.length; i++) {
    // Write initial position
    // var x = parseInt(pixels[i].style.left);
    // var y = parseInt(pixels[i].style.bottom);
    var matrix = getComputedStyle(pixels[i]).transform;
    var x = parseInt(matrix.split(',')[4]);
    var y = -parseInt(matrix.split(',')[5]);
    position[0][i] = [x,y];
  }

  // ----FRAMES-----
  for (var i = 0; i < frames; i++) {

    // ----FORCES----
    for (var k = 0; k < Object.keys(forces).length; k++) {
      // console.log('Force ' + k);
      var id = Object.keys(forces)[k];
      // var forceApplies = forceTiming(id,fps);
      var forceApplies = true;
      if (forceApplies) {
        // ----PIXELS----
        for (var j = 0; j < pixels.length; j++) {
          // Check if pixel is off-screen
          if ( (Math.abs(position[i][j][0]) > displayX*1.15 ||
              Math.abs(position[i][j][1]) > displayY*1.15) &&
              !findInAr(pixelsOut, j) ) {
            velocities[j][0] = 0;
            velocities[j][1] = 0;
            pixelsOut.push(j);
            // console.log('Pixel is off-screen.');
            continue
          }
          // console.log('Pixel is on-screen.');
          // Apply force
          // console.log('Applying force to the pixel ' + j + '.');
          applyForce(i,j,id,fps);
        }
      }
      // ----PIXELS----
      for (var j = 0; j < pixels.length; j++) {
        // Move pixel
        position[i+1][j][0] = position[i][j][0] + velocities[j][0];
        position[i+1][j][1] = position[i][j][1] + velocities[j][1];
      }
    }
    if (pixelsOut.length == pixels.length) {
      position.splice(i+1, 9999);
      return
    }
  }
  console.log('Done');
}
// ==========================================
function restore() { //POSSIBLY OBSOLETE
// Restore initial position of pixels
  window.clearTimeout(timeoutId); //stop animation

  var x,y;
  if (pixels!==undefined) {
    for (var i = 0; i < pixels.length; i++) {
      x = position[0][i][0];
      y = position[0][i][1];
      // pixels[i].style.left = x * pW + 'px';
      // pixels[i].style.bottom = y * pW + 'px';
      var style = 'translate(' + x + 'px,' + (-y) +'px)';
      pixels[i].style.transform = style;
    }
  }
}
// ==========================================
function findInAr(array,value) {
  var result = array.find(function(el){return el === value });
  var logic = result === undefined ? false : true;
  return logic
}
// ==========================================
function preparePixels() {
  for (var i = 0; i < pixels.length; i++) {
    pixels[i].classList.add('willChange');
  }
}
// ==========================================
function loosePixels() {
  for (var i = 0; i < pixels.length; i++) {
    pixels[i].classList.remove('willChange');
  }
}
// ==========================================
// Animate pixels moves according to calculated
// positions and fps settings. Play forwards (dir=1)
// or backwards (dir=-1).

function play(dir, fps) {
  // showPixels();
  window.clearTimeout(timeoutId); //stop animation
  var delay = 1000/fps;
  var skip = 60/fps; // 60-> 1, 30 -> etc.
  // var iterations = position.length;
  var z = 0; // Frame iterator
  var lastFrame = position.length;
  pixels = document.querySelectorAll('.pixel');

  preparePixels();

  setTimeout(function(){
    showPixels();
    render(delay,dir,z,lastFrame);
  },500,delay,dir,z,lastFrame);
}
// ========================================
var timeoutId; // Id of current setTimout

function render(delay,dir,z,lastFrame) {
  if (z === lastFrame) {
    if (seqIterator !== null) {
      seqIterator ++;
      setTimeout(function(){playSequence('render')}, 6*pixels.length);
    }
    loosePixels()
    return
  }
  var currentFrame = dir === 1 ? z : (lastFrame - 1 - z);
  // console.log('currentFrame: ' + currentFrame);
  for (var i = 0; i < pixels.length; i++) {
    var x = position[currentFrame][i][0];
    var y = position[currentFrame][i][1];
    var translate = 'translate(' + x + 'px,' + (-y) +'px)';
    pixels[i].style.transform = translate;
  }

  z ++;
  timeoutId = setTimeout(render,delay,  delay,dir,z,lastFrame);
}
// ========================================
// Prepare sequencePositions
var sequenceTexts = []; // Array of texts to animate
var sequenceSettings = []; // Array of settings IDs  to apply
var sequencePositions = [];

function simulateSequence() {
  sequencePositions = [];
  for (var i = 0; i < sequenceTexts.length; i++) {
    var text = sequenceTexts[i];
    // Display new text on screen
    evaluateInputText(text);
    // Load settings
    var rowIndex = sequenceSettings[i];
    var settingsId = localData.settings[rowIndex][0];
    // Load proper settings to the setup

    // Load proper settings to the form inputs
    var inputs = document.querySelectorAll('.settingsForm.sliders input');
    for (var j = 0; j < inputs.length; j++) {
      var value = parseInt(localData.settings[rowIndex][j + 3]);
      setup[Object.keys(setup)[j]] = value;
      inputs[j].value = value;
    }

    // Get forces settings
    var settingsId = localData.settings[rowIndex][0];
    // Remove any existing forces
    while (forceWrapper.children.length !== 0 ) {
      var force = forceWrapper.children[0];
      var forceIndex = force.dataset.forceIndex;
      removeForce('',forceIndex,force);
    }
    // Search for forces settings with matching id and spawn them
    for (var j = 0; j < localData.forces.length; j++) {
      if (localData.forces[j][0] === settingsId) {
        // Remove (slice) column with id
        var forceSettings = localData.forces[j].slice(1);
        // Create force
        createForce('', forceSettings);
      }
    }
    // Compute position of each pixel at each frame
    simulate();
    // Append recorded positions to the aggregate array
    sequencePositions.push([]);
    Array.prototype.push.apply(sequencePositions[i], position);
  }
  evaluateInputText('');
}
// ========================================
// Play sequencePositions
var seqIterator = null; // Iterator of sequence parts
var sequenceDirs = []; // Array of directions for each stage

function playSequence(caller) {
  if (seqIterator === sequenceTexts.length) {
    seqIterator = null;
    return
  }
  else if (seqIterator === null || caller !== 'render') {
    window.clearTimeout(timeoutId); //stop animation
    seqIterator = 0;
  }

  var k = seqIterator;

  // Display new text on screen
  hidePixels();
  evaluateInputText(sequenceTexts[k]);
  position = sequencePositions[k];

  play(sequenceDirs[k],60); // Play computed positions
}
