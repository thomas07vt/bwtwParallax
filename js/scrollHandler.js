// Reference:::
// http://www.html5rocks.com/en/tutorials/speed/animations/
///////////////////////////////////////////////////////////

var latestKnownScrollY = 0,
var ticking = false;

function onScroll() {
  latestKnownScrollY = window.scrollY;
  requestTick();
}

function requestTick() {
  if(!ticking) {
    requestAnimationFrame(update);
  }
  ticking = true;
}

function update() {
  // reset the tick so we can
  // capture the next onScroll
  ticking = false;

  var currentScrollY = latestKnownScrollY;

  // read offset of DOM elements
  // and compare to the currentScrollY value
  // then apply some CSS classes
  // to the visible items
}


window.addEventListener('scroll', onScroll, false);

