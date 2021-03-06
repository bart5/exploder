// ========================================
// Draw a basic part for the protoForce
function drawRange(canvas, id) {
  // Draw range
  if (!canvas) {
    var canvas = document.querySelector('#protoForce canvas.range');
  }
  canvas.width = 80;
  canvas.height = 80;
  var ctx = canvas.getContext('2d');
  var centerX = canvas.width*0.5;
  var centerY = canvas.height*0.5;
  ctx.beginPath();
  ctx.lineWidth = centerX;
  ctx.strokeStyle = 'rgba(30,155,30,0.5)';
  // Define parameter of the arc for the default force
  var radius = centerX*0.5;
  var rad1 = forces[id].rad1;
  var rad2 = forces[id].rad2;
  var start = rad1 + 2*Math.PI;
  var end = rad2;
  if (rad1 == rad2) start = end + 0.00001;
  var shift = 2*Math.PI;
  ctx.arc(centerX,centerY,radius,-start,-end, true);
  ctx.stroke();
}
// ========================================
// Draw a basic part for the protoForce
function drawValue(canvas, id) {
  // Draw value
  if (!canvas) {
    var canvas = document.querySelector('#protoForce canvas.value');
  }
  canvas.width = 350;
  canvas.height = 350;
  var ctx = canvas.getContext('2d');
  var centerX = canvas.width*0.5;
  var centerY = canvas.height*0.5;

  ctx.beginPath();

  var value = forces[id].value;
  if (value > 0) var color = 'rgba(190, 42, 42, 0.55)';
  else var color = 'rgba(88, 89, 142, 0.55)';
  ctx.strokeStyle = color;
  value = value > 0 ? value : -value;

  ctx.lineWidth = (centerX - 50) * value;

  // Define parameter of the arc for the default force
  var radius = (centerX - 50) * 0.5 * value + 50;
  var rad1 = forces[id].rad1;
  var rad2 = forces[id].rad2;
  var start = rad1 + 2*Math.PI;
  var end = rad2;
  if (rad1 == rad2) start = end + 0.00001;
  var shift = 2*Math.PI;
  ctx.arc(centerX,centerY,radius,-start,-end, true);
  ctx.stroke();
}
// ========================================
function updateRange(id, force) {
  var rangeCanvas = force.querySelector('canvas.range');
  drawRange(rangeCanvas, id);
  var valueCanvas = force.querySelector('canvas.value');
  drawValue(valueCanvas, id);
}
// ========================================
function updateValue(id, force) {
  var valueCanvas = force.querySelector('canvas.value');
  drawValue(valueCanvas, id);
}
// ========================================
function updateType(id) {
  updateRange();
  updateValue();
  updateDirection();
  updateRotation();
}
// ========================================
// position - X,Y of force placement in local coordinates of .display
// rad1 - X,Y defining first perimeter of affected space
// rad2 - X,Y defining second perimeter of affected space
// rad3 - X,Y defining direction of simpleForce
// type - (1,2 or 3) radial force, one direction force or vortex
// radialForce - force acting radlial form it's center
// simpleForce - force acting in one direction
// vortex - force which spins around
// ========================================
var forces = {};
// ========================================
var defaultForce = {
  type1 : {
    'position'  : null,
    'value'   : 0.5,
    'rad1'    : 1.60*Math.PI,
    'rad2'    : 1.40*Math.PI,
    'rad3'    : 0.5*Math.PI,
    'type'     : 1,
  },
  type2 : {
    'position'  : null,
    'value'   : 0.5,
    'rad1'    : 1.60*Math.PI,
    'rad2'    : 1.40*Math.PI,
    'rad3'    : 0.5*Math.PI,
    'type'     : 2,
  },
  type3 : {
    'position'  : null,
    'value'   : 0.5,
    'rad1'    : 1.60*Math.PI,
    'rad2'    : 1.40*Math.PI,
    'rad3'    : 0.5*Math.PI,
    'type'     : 3,
  },
};
// ========================================
// Make ready to create a new force
function addForce(target) {
  window.addEventListener('mousedown', createForce);
  target.classList.add('active');
}
// ========================================
// Create new force at clicked location.
// --Global variables--
// Index for each new force:
  var forceIndex = 0;
// Container for all currently attached handlers of
// events for force modification:
  var handlers = [];
// --Function--
function createForce(event, forceSettings) {
  var protoForce = document.querySelector('#protoForce');
  var force = protoForce.cloneNode(true);
  force.id = '';
  force.className = 'force';
  var forceWrapper = document.querySelector('#forceWrapper');
  forceWrapper.appendChild(force);
  forceIndex ++;
  force.dataset.forceIndex = forceIndex;
  // force.style.display = 'flex';
  force.classList.remove('hidden');
  // Attach listeners to manipulate force
  var rad3Element = force.querySelector('.rad3');
  var rangeElementOne = force.querySelector('div.range');
  var rangeElementTwo = force.querySelector('canvas.range');
  var valueElement = force.querySelector('.value');
  var typeElement = force.querySelector('.type');
  // Attach listeners:
  // Control direction
  rad3Element.addEventListener('mousedown', function(){
    modifyDirection(force, true);
    var handler = function(){modifyDirection(force)};
    handlers.push(handler);
    window.addEventListener('mousemove', handler);
    window.addEventListener('mouseup', stopModifying);
  });
  rangeElementOne.addEventListener('mousedown', function(){
    modifyRangeDirection(force, true);
    var handler = function(){modifyRangeDirection(force)};
    handlers.push(handler);
    window.addEventListener('mousemove', handler);
    window.addEventListener('mouseup', stopModifying);
  });
  rangeElementTwo.addEventListener('mousedown', function(){
    modifyRangeCone(force, true);
    var handler = function(){modifyRangeCone(force)};
    handlers.push(handler);
    window.addEventListener('mousemove', handler);
    window.addEventListener('mouseup', stopModifying);
  });
  // Control force value
  valueElement.addEventListener('mousedown', function(){
    if(valueElement.dataset.dbclick == true) return
    modifyValue(force, true);
    // Drag to move force:
    var handler = function(){
      modifyValue(force);
      // Do not list for db-click after draggin
      valueElement.removeEventListener('mouseup', dbClick);
    };
    handlers.push(handler);
    window.addEventListener('mousemove', handler);
    // Stop dragging behavior
    window.addEventListener('mouseup', stopModifying);
    // Allow doubleclick to change type
    valueElement.addEventListener('mouseup', dbClick);
    function dbClick() {
      valueElement.dataset.dbclick = true;
      valueElement.addEventListener('mousedown', valueSign);
      setTimeout(function(element){
        element.removeEventListener('mousedown', valueSign);
        element.dataset.dbclick = false;
      }, 250, valueElement);
      valueElement.removeEventListener('mouseup', dbClick);
    }
  });
  // Control force type and force location
  typeElement.addEventListener('mousedown', function(){
    if(typeElement.dataset.dbclick == true) return
    // Drag to move force:
    var handler = function(){moveForce(force)};
    handlers.push(handler);
    window.addEventListener('mousemove', handler);
    // Stop dragging behavior
    window.addEventListener('mouseup', stopModifying);
    // Allow doubleclick to change type
    typeElement.addEventListener('mouseup', dbClick);
    function dbClick() {
      typeElement.dataset.dbclick = true;
      typeElement.addEventListener('mousedown', modifyType);
      setTimeout(function(element){
        element.removeEventListener('mousedown', modifyType);
        element.dataset.dbclick = false;
      }, 250, typeElement);
      typeElement.removeEventListener('mouseup', dbClick);
    }
  });
  if (forceSettings === undefined) { // Settings were not provided
    // Get click position
    var globalX = event.clientX;
    var globalY = event.clientY;
    // Get position of .display center
    var centerX = display.offsetLeft;
    var centerY = display.offsetTop;
    // Get position of force in local system of the display
    var localX = globalX - centerX;
    var localY = centerY - globalY;
    // Position force in local system of the display
    force.style.left = localX + 'px';
    force.style.top = -localY + 'px';
    // Define basic properties
    Object.defineProperty(forces, forceIndex, {
      configurable: true,
      enumerable: true,
      value: {
        'position'  : [localX, localY],
        'value'   : 0.5,
        'rad1'    : 1.60*Math.PI,
        'rad2'    : 1.40*Math.PI,
        'rad3'    : 0.5*Math.PI,
        'type'     : 1,
      }
    });
    // Remove listener from window
    window.removeEventListener('mousedown', createForce);
    // Remove 'active' class from the button
    document.getElementById('addForce').classList.remove('active');
  }
  else {
    // console.log('loading force from settings');
    force.classList.add('temporary');
    // Position force in local system of the display
    var positionX = parseInt(forceSettings[0]);
    var positionY = parseInt(forceSettings[1]);
    force.style.left = positionX + 'px';
    force.style.top = -positionY + 'px';
    var type = parseInt(forceSettings[6]);
    Object.defineProperty(forces, forceIndex, {
      configurable: true,
      enumerable: true,
      value: {
        'position'  : [positionX, positionY],
        'value'     : parseFloat(forceSettings[2]),
        'rad1'      : parseFloat(forceSettings[3]),
        'rad2'      : parseFloat(forceSettings[4]),
        'rad3'      : parseFloat(forceSettings[5]),
        'type'      : type,
      }
    });
    if (forces[forceIndex].value < 0) {
      valueElement.classList.add('negative');
    }
    if (type !== 1) modifyType(type, force, forceIndex)
  }
  // Add force to the list in the force settings panel
  var list = document.querySelector('select.forcesList');
  var option = document.createElement('option');
  option.value = forceIndex;
  option.innerHTML = 'Force #' + forceIndex;
  list.appendChild(option);
  // Draw properties of the force on canvas
  updateRange(forceIndex, force);
}
// ========================================
// Remove all window event associated with
// modifying force.
function stopModifying() {
  // console.log('removing handlers');
  for (var i = 0; i < handlers.length; i++) {
    window.removeEventListener('mousemove', handlers[i]);
  }
  window.removeEventListener('mouseup', stopModifying);
  // Clear an array
  handlers = [];
}
// ========================================
// Modify existing force
// action - type of event
// start (bool) - was event just attached?
var cursorX, cursorY, cursorOldX, cursorOldY;
var refVec = [1,0]; // reference vector indicating 0' angle
// ========================================
// Register angular delta between subsequent cursor
// positions and apply to the element as rotation.
var oldPos =[];
function modifyDirection(force, start) {
  // console.log('modifyDirection');
  var id = parseInt(force.dataset.forceIndex);
  if (forces[id].type != 2) return
  var prop = forces[id];
  // Read current cursor position;
  mouseX = event.clientX;
  mouseY = event.clientY;
  // Translate cursor coordinates to local system
  var forceX = prop.position[0];
  var forceY = prop.position[1];
  var x = mouseX - (displayX + forceX);
  displayY = display.offsetTop;
  var y = displayY - forceY - mouseY;
  if (!start) {
    // Angle between the old position and reference versor
    // console.log('-------------------');
    var angOld = relativeAngle(oldPos);
    // console.log('angOld: ' + angOld);
    // Angle between current position and reference versor
    var angNew = relativeAngle([x,y]);
    // console.log('angNew: ' + angNew);
    // Delta of angles values
    var delta = angNew - angOld;
    // console.log('delta: ' + delta);
    // Delta of angles values in absolute terms (not in terms
    // of the reference versor)
    var deltaAbs = vectorAngle(oldPos, [x,y]);
    // console.log('deltaAbs: ' + deltaAbs);
    // Difference in deltas
    var diff = (1-Math.abs(deltaAbs/delta))
    // console.log('diff: ' + diff);

    // Define rotation direction and apply to the force object
    // NOTE: '-' sign is because css rotation goes clockwise,
    // contrary to convention in this script.
    var el = force.querySelector('.rad3').parentNode;
    var rotation = parseFloat(el.dataset.rotation) || 0;
    // console.log('rotation old: ' + rotation);
    if (diff > 0.5) {
      if (delta > 0) {
        rotation += -deltaAbs;
      }
      else {
        rotation -= -deltaAbs;
      }
    }
    else {
      rotation += -delta;
    }
    // console.log('rotation new: ' + rotation);
    // Apply new direction to the force
    prop.rad3 = -rotation + 6.283/4;
    // APPLY CHANGE TO THE ELEMENT STYLE
    el.dataset.rotation = rotation;
    el.style.transform = 'rotateZ(' + rotation/6.28*360 + 'deg)';
  }
  oldPos = [x,y];
}
// ========================================
var xOld, yOld, lOld ;
function modifyRangeDirection(force, start) {
  // console.log('modifyRange');
  var id = parseInt(force.dataset.forceIndex);
  var prop = forces[id];
  // Read current cursor position;
  mouseX = event.clientX;
  mouseY = event.clientY;
  // Translate cursor coordinates to local system
  var forceX = prop.position[0];
  var forceY = prop.position[1];
  var x = mouseX - (displayX + forceX);
  displayY = display.offsetTop;
  var y = displayY - forceY - mouseY;
  // console.log('x: ' + x);
  // console.log('y: ' + y);
  if (!start) {
    // Define change in direction
      // Angular distance between new point and
      // reference vector [1,0]
      relativeDeltaNew = relativeAngle([x,y]);
      // console.log('relativeDeltaNew: ' + relativeDeltaNew);
      // Angular distance between old point and r.v. [1,0]
      relativeDeltaOld = relativeAngle([xOld,yOld]);
      // console.log('relativeDeltaOld: ' + relativeDeltaOld);
      // Difference
      relativeDelta = relativeDeltaNew - relativeDeltaOld;
      angleDelta = relativeDelta;
      // console.log('angleDelta: '+ angleDelta);
      // Rotate influence borders (rad1 rad2)
      prop.rad1 += angleDelta;
      prop.rad2 += angleDelta;
      var element = force.querySelector('div.range');
      var rotation = parseFloat(element.dataset.rotation) || 0;
      rotation -= angleDelta/6.28*360;
      element.dataset.rotation = rotation;
      element.style.transform = 'rotateZ(' + rotation + 'deg)';
    // Apply change to the element graphics
    updateRange(id, force);
  }
  // Record current values;
  xOld = x;
  yOld = y;
}
function modifyRangeCone(force, start) {
  // console.log('modifyRangeCone');
  var id = parseInt(force.dataset.forceIndex);
  var prop = forces[id];
  // Read current cursor position;
  mouseX = event.clientX;
  mouseY = event.clientY;
  // Translate cursor coordinates to local system
  var forceX = prop.position[0];
  var forceY = prop.position[1];
  var x = mouseX - (displayX + forceX);
  displayY = display.offsetTop;
  var y = displayY - forceY - mouseY;
  // console.log('x: ' + x);
  // console.log('y: ' + y);
  // Calculate projection of vector
    var rad1 = prop.rad1;
    var rad2 = prop.rad2;
    // Versor which divides range on two equal parts
    // and points in direction of force influence.
      var pi = Math.PI;
      var rangeDir = (rad2-pi)+((rad1-pi)-(rad2-pi))*0.5;
      var rangeVersor = angToVersor(rangeDir);
    // Projection of vector, pointing to the cursor position,
    // on the axis collinear with rangeVersor.
      var angle = vectorAngle([x,y], rangeVersor);
      var lNewLength = vectorLength([x,y]) * Math.cos(angle);
      var lNew = [rangeVersor[0]*lNewLength,
                  rangeVersor[1]*lNewLength]
  if (!start) {
    // Define change in range (space covered)(rad1-rad2 cone)
      // Length of vector being cursor movement projection
      // on axis collinear with rangeVersor.
      var lDelta = vectorLength(lNew) - vectorLength(lOld);
      // Change range cone relative to the cursor movement
      var radDelta = prop.rad1-prop.rad2;
      if (vectorAngle(lNew,rangeVersor) < Math.PI*0.5) {
        // ---------------------------------------
        // Prevent rad1 becoming < than rad2
        // or greater than it by over full circle (6.28 rad)
        if ((radDelta >= 6.28*355/360 || radDelta+2*lDelta/40 >= 6.28*355/360) && lDelta > 0); // Do nothing
        else if ((radDelta <= 6.28*2/360 || radDelta+2*lDelta/40 <= 2/360) && lDelta < 0) {
          if (radDelta < 0.05) {
            prop.rad1 -= radDelta/2;
            prop.rad2 = prop.rad1;
          }
          else {
            prop.rad1 -= radDelta/2 * 0.5 * 0.3;
            prop.rad2 += radDelta/2 * 0.5 * 0.3;
          }
        }
        // ---------------------------------------
        else {
          prop.rad1 += lDelta/40;
          prop.rad2 -= lDelta/40;
        }
      }
      else if (vectorAngle(lNew,rangeVersor) > Math.PI*0.5){
        // ---------------------------------------
        // Prevent rad1 becoming < than rad2
        // or greater than it by over full circle (6.28 rad)
        if ((radDelta >= 6.28*355/360 || radDelta-2*lDelta/40 >= 6.28*355/360) && lDelta < 0); // Do nothing
        else if ((radDelta <= 6.28*2/360 || radDelta-2*lDelta/40 <= 2/360) && lDelta > 0) {
          if (radDelta < 0.05) {
            prop.rad1 -= radDelta/2;
            prop.rad2 = prop.rad1;
          }
          else {
            prop.rad1 -= radDelta/2 * 0.5 * 0.3;
            prop.rad2 += radDelta/2 * 0.5 * 0.3;
          }
        }
        // ---------------------------------------
        else {
          prop.rad1 -= lDelta/40;
          prop.rad2 += lDelta/40;
        }
      }
    // Apply change to the element graphics
    updateRange(id, force);
  }
  // Record current values;
  lOld = lNew;
}
// ========================================
function modifyValue(force, start) {
  // console.log('modifyValue');
  var id = parseInt(force.dataset.forceIndex);
  var prop = forces[id];
  var sign = prop.value/Math.abs(prop.value);
  // Read current cursor position;
  mouseX = event.clientX;
  mouseY = event.clientY;
  // Translate cursor coordinates to local system
  var forceX = prop.position[0];
  var forceY = prop.position[1];
  var x = mouseX - (displayX + forceX);
  displayY = display.offsetTop;
  var y = displayY - forceY - mouseY;
  // console.log('x: ' + x);
  // console.log('y: ' + y);
  // Calculate projection of vector
  if (start) {
    // Versor of reference for cursor movements
      var length = vectorLength([x,y]);
      refVersor = [x/length,y/length];
    // First projected vector colinear vector.
      var lNew = [x,y];
  }
  if (!start) {
    // Projection of vector, pointing to the cursor position,
    // on the axis collinear with rangeVersor.
      var angle = vectorAngle([x,y], refVersor);
      var lNewLength = vectorLength([x,y]) * Math.cos(angle);
      var lNew = [refVersor[0]*lNewLength,
                  refVersor[1]*lNewLength]
      // Length of vector being cursor movement projection
      // on axis collinear with rangeVersor.
      var delta = vectorLength(lNew) - vectorLength(lOld);
      // Change range cone relative to the cursor movement
      if (vectorAngle(lNew,refVersor) < Math.PI*0.5) {
        prop.value += 0.1*delta/12.8*sign;
        prop.value = Math.max(prop.value*sign, 0.1);
        prop.value = Math.min(prop.value*sign, 1.0);
      }
      else if (vectorAngle(lNew,refVersor) > Math.PI*0.5) {
        prop.value -= 0.1*delta/12.8*sign;
        prop.value = Math.max(prop.value*sign, 0.1);
        prop.value = Math.min(prop.value*sign, 1.0);
      }
    // Apply proper sign
    // prop.value *= sign;
    // Apply change to the element graphics
    updateValue(id, force);
  }
  // Record current values;
  lOld = lNew;
}
// ========================================
function modifyType(type, force, id) {
  // console.log('modifyType');
  // console.log('type: ' + type);
  if (typeof(type) !== 'number') {
  this.removeEventListener('mousedown', modifyType);
  this.dataset.dbclick = false;
  var force = this.parentNode.parentNode;
  var id = parseInt(force.dataset.forceIndex);
  var type = forces[id].type;
  type = type === 3 ? 1 : type + 1;
  }
  // Change type
  forces[id].type = type;

  var typeElement = force.querySelector('.type');
  typeElement.dataset.forceType = type;

  var rad3Element = force.querySelector('.rad3');
  if (type === 2) {
    rad3Element.style.display = 'unset';
    // rad3Element.parentNode.style.transform = '';
    // rad3Element.parentNode.dataset.rotation = 0;
    var rotation = 6.283/4  - forces[id].rad3;
    var rad3Wrapper = rad3Element.parentNode;
    rad3Wrapper.dataset.rotation = rotation;
    rad3Wrapper.style.transform = 'rotateZ(' + rotation/6.28*360 + 'deg)';
  }
  else {
    rad3Element.style.display = 'none';
  }
  // Reload graphic of the force to depict changed values
  // updateRange(id, force);
}
// ========================================
function removeForce(target,id,force) {
  var forceWrapper = document.getElementById('forceWrapper');
  // If function was invoked from the force settings panel
  if (target.tagName === "BUTTON") {
    var select = document.querySelector('select.forcesList');
    var id = select.value;
    var selector = '[data-force-index="'+ id +'"]';
    var force = forceWrapper.querySelector(selector);
  }
  // If function was invoked through listener on the force
  else if (id === undefined) {
    var force = this.parentNode.parentNode;
    var id = force.dataset.forceIndex;
    selectToDelete(); // deactivate button
  }
  // Remove element
  forceWrapper.removeChild(force); //remove from DOM
  // Remove object property
  delete forces[id]; //remove from objcet
  // Remove from forces settings list
  var list = document.querySelector('select.forcesList');
  var selector = 'option[value="'+ id +'"]';
  list.removeChild(list.querySelector(selector));
}
// ========================================
// 'click' handler on Remove Force button which
// adds or removes click listeners to the .type
// element of forces and sets Remove Force button
// class to indicate if listeners are in place.
function selectToDelete() {
  var forces = document.querySelectorAll('.force');
  var button = document.getElementById('removeForce');
  // Remove listener from forces if button is active
  if (button.classList.contains('active')) {
    for (var i = 0; i < forces.length; i++) {
      forces[i].querySelector('.type').removeEventListener('click', removeForce);
    }
    button.classList.remove('active');
  }
  // Add listener to forces if button is inactive
  else {
    button.classList.add('active');
    for (var i = 0; i < forces.length; i++) {
      forces[i].querySelector('.type').addEventListener('click', removeForce);
    }
  }
}
// ========================================
function moveForce(target) {
  var force = target;
  var forceIndex = force.dataset.forceIndex;
  // Get click position
  var globalX = event.clientX;
  var globalY = event.clientY;
  // Get position of .display center
  var centerX = display.offsetLeft;
  var centerY = display.offsetTop;
  // Get position of force in local system of the display
  var localX = globalX - centerX;
  var localY = centerY - globalY;
  // Position force in local system of the display
  force.style.left = localX + 'px';
  force.style.top = -localY + 'px';
  forces[forceIndex].position = [localX,localY];
  // Disable option to double-click to change type
  var typeElement = target.querySelector('.type');
  typeElement.removeEventListener('click', modifyType);
}
// ========================================
// Monitor cursor position and bring appropriate
// force forwards waiting for interaction.
// Rules:
// Hover over type element? - instant focus
var throttle = false;
function focusForce() {
  if (!throttle) {
    // Get click position
    var globalX = event.clientX;
    var globalY = event.clientY;
    // Get position of .display center
    var centerX = display.offsetLeft;
    var centerY = display.offsetTop;
    // Get position of force in local system of the display
    var localX = globalX - centerX;
    var localY = centerY - globalY;
    var typeElementRadius = 15;
    var found = false;
    for (var i = 0; i < Object.keys(forces).length; i++) {
      var id = Object.keys(forces)[i];
      var dist = pointsDistance(forces[id].position, [localX,localY]);
      var selector = '[data-force-index="' + id + '"]';
      var force = document.querySelector(selector);
      if (dist <= typeElementRadius && !found) {
        force.classList.add('front');
        found = true;
        i = 0;
        var omit = id;
      }
      else if (found && (id != omit)) {
        force.classList.remove('front');
      }
    }
    throttle = true;
    setTimeout(function(){
      throttle = false;
    },1000);
  }
}
// ========================================
// Reverse force value sign and change valueElement
// color
function valueSign() {
  var force = this.parentNode.parentNode;
  var id = force.dataset.forceIndex;
  forces[id].value *= (-1);
  this.classList.toggle('negative');
  drawValue(this,id);
}
// ========================================
// Show context menu if multiple forces are
// stacked on top of each other.
function forceContexMenu() {

}
// ========================================
function pointsDistance(p1,p2) {
  var distance = vectorLength([p1[0]-p2[0], p1[1]-p2[1]]);
  return distance
}
// ========================================
function vectorLength(point) {
  var length = Math.sqrt(point[0]*point[0] + point[1]*point[1]);
  return length;
}
// ========================================
// Angle between vectors 1 and 2
function vectorAngle(v1,v2) {
  var dotProd = Math.round((v1[0]*v2[0] + v1[1]*v2[1])*1000)/1000;
  // console.log('dotProd: ' + dotProd);
  var v1Len = Math.round(vectorLength(v1)*1000)/1000;
  var v2Len = Math.round(vectorLength(v2)*1000)/1000;
  // console.log('v1Len: ' + v1Len);
  // console.log('v2Len: ' + v2Len);
  var angle = Math.acos(dotProd/(v1Len*v2Len)); //radians
  return angle
}
// ========================================
// Measure angle between vector 'v' and vector [1,0]
// assuming that angles are measured always from
// [1,0] and counter-clockwise
function relativeAngle(v) {
  var dotProd = v[0];
  var vLen = vectorLength(v);
  var angle = Math.acos(dotProd/vLen); //radians
  angle = v[1] > 0 ? angle : (Math.PI*2 - angle);
  return angle
}
// ========================================
// Return coordinates of versor which creates
// with versor [1,0] given angle
function angToVersor(angle) {
  var x = Math.cos(angle);
  var y = Math.sqrt(1-x*x);
  if (toRelAngle(angle) > Math.PI) {
    y = -y;
  }
  return [x,y]
}
// ========================================
// Translate angle to contain its value within
// the range from 0 to 2*PI measuring from
// the [1,0] versor anticlockwise.
function toRelAngle(angle) {
  var pi = Math.PI;
  var newAng;
  if (angle == 0)   return angle
  else if (angle > 0) {
    angle = angle - Math.floor(Math.abs(angle)/(2*pi))*2*pi;
    return angle
  }
  else if (angle < 0) {
    angle = angle + Math.ceil(Math.abs(angle)/(2*pi))*2*pi;
    return angle
  }
}
// ========================================
function sumVector(v1,v2) {
  return [v1[0]+v2[0],v1[1]+v2[1]]
}
// ========================================
