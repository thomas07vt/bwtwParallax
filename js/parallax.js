// Equations driving this parallax library
//
// The SpeedFactor(Sf) can be defined by the user.
// As long as it is within the allowable Sf range,
// then we use that number, otherwise, default to a
// defineable range.
//
// Sfmax = 1
// Sfmin = 1 - (Bh/Vh)
// Fh = Vh - (Vh - Bh)/Sf 
// Offset = (Fh * Sf) - Bh
//
// Where
// Sfmax = Maximum allowable speed factor
// Sfmin = Minimum allowable speed factor
//
//
// 
// Written by John Thomas 
// @hashtagJohnT
//
//////////////////////////////////////////////////
// The MIT License (MIT)

// Copyright (c) 2015 John Thomas

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//////////////////////////////////////////////////


var bwtwParallax = (function() {
  // Setting default variables.
  var vHeight = 0;
  var vWidth = 0;
  var parallaxImages = [];
  var parallaxCount = 0;
  var latestKnownScrollY = 0;
  var ticking = false;


  function initialize(className) {
    // On Startup, we need to find all of our parllax items
    // and store their info
    vHeight = getViewportHeight();
    vWidth = getViewporWidth();

    parallaxImages = [];
    var parallaxElements = document.getElementsByClassName(className);
    parallaxCount = parallaxElements.length;

    for (var i = 0; i < parallaxCount; i++) {

      // Set constant variables.
      var parallaxImage = {};
      parallaxImage.element = parallaxElements[i];
      parallaxImage.speedfactor = parseFloat(parallaxElements[i].dataset.speedfactor);
      parallaxImage.iSpeedfactor = (1 - parallaxImage.speedfactor);
      parallaxImage.ratio = parseFloat(parallaxElements[i].dataset.ratio);

      // Set dynamic variables. Will change on page resize.
      setDynamicVars(parallaxImage);

      parallaxImages.push(parallaxImage);
    }

    // Add scroll and resize event listener
    window.addEventListener('scroll', bwtwParallax.bwtwScroll, false);
    window.addEventListener('resize', bwtwParallax.resize, false);

    // Run the 'bwtwScroll' function to set any visible elements.
    bwtwScroll();

  }

  function getViewportHeight() {
    return document.documentElement.clientHeight;
  }

  function getViewporWidth() {
    return document.documentElement.clientWidth;
  }

  function setDynamicVars(parallaxImage) {

    parallaxImage.elementTop = parallaxImage.element.offsetTop;
    setBgImageHeight(parallaxImage);

    validateSpeedFactor(parallaxImage);
    setNewElementHeight(parallaxImage);
    setInitialOffset(parallaxImage);
    setVisibleRange(parallaxImage);
    setNewOffsetContant(parallaxImage);

  }

  function setBgImageHeight(pImage) {
    // Get element's width and set the bg image's height
    // based on the ratio
    var eWidth = pImage.element.offsetWidth;
    pImage.height = Math.round(eWidth / pImage.ratio);

    pImage.element.style.backgroundSize="100% " + pImage.height + "px";
  }

  function validateSpeedFactor(pImage) {
    // Check to see if the speed factor is inside the allowable range
    var speedFactorMin = (1 - (pImage.height/vHeight));

    if (pImage.speedfactor > 1 || pImage.speedfactor < speedFactorMin ) {
      pImage.speedfactor = parseFloat(((1 + speedFactorMin) / 2 ).toFixed(2));
      pImage.iSpeedfactor = (1 - pImage.speedfactor);
    }

  }

  function setNewElementHeight(pImage) {
    pImage.eHeight = (vHeight - ((vHeight - pImage.height) / pImage.speedfactor));
    pImage.element.style.height = pImage.eHeight + "px";
  }

  function setInitialOffset(pImage) {
    pImage.offset =  Math.round((pImage.eHeight * pImage.speedfactor) - pImage.height);
    pImage.element.style.backgroundPosition = "0 " + pImage.offset + "px";

  }

  function setVisibleRange(pImage) {

    // Do these computations on startup b/c they are constant
    var lowerBound = parseFloat(pImage.elementTop - vHeight)        // > latestKnownScrollY then false
    var upperBound = parseFloat(pImage.elementTop + pImage.eHeight) // < latestKnownScrollY then false

    pImage.visible = function(scrollY) {
      return (upperBound > scrollY && scrollY > lowerBound)
    }

  }

  function setNewOffsetContant(pImage) {
    // This is to calculate the new offset when we scroll.
    // This should be constant, so we can extract it out to a variable rather than
    // calculating it each time.
    pImage.newOffsetConstant = (pImage.offset) + (pImage.iSpeedfactor * (vHeight - pImage.elementTop))
  }

  function getParallaxImages() {
    return parallaxImages;
  }

  function bwtwScroll() {
    latestKnownScrollY = window.scrollY;
    // requestTick();
    parallaxIt();
  }

  // // I get worse performance with rAF for some reason
  // function requestTick() {
  //   if(!ticking) {
  //     requestAnimationFrame(parallaxIt);
  //   }
  //   ticking = true;
  // }


  function parallaxIt() {
    // ticking = false;

    // Loop through each element, and check to see if they are visible
    for (var i = 0; i < parallaxCount; i++) {
      var pImage = parallaxImages[i];
      // Check if totally above or totally below viewport
      if (pImage.visible(latestKnownScrollY)) {
        var newOffset = Math.round(pImage.newOffsetConstant + (latestKnownScrollY * pImage.iSpeedfactor)) ;
        pImage.element.style.backgroundPosition = "0 " + newOffset + "px";
      }

    }

  }

  function resize() {
    // Get new screen size dimensions
    vHeight = getViewportHeight();
    vWidth = getViewporWidth();

    // Loop through all the parallaxImages and set the dynamic vars,
    // based on the new DOM.
    for (var i = 0; i < parallaxCount; i++) {
      // Set dynamic variables. Will change on page resize.
      setDynamicVars(parallaxImages[i]);
    }

    // Run the 'bwtwScroll' function to set any visible elements.
    bwtwScroll();
  }


  //// PUBLIC METHODS
  return {
    initialize: function(className) {
      return initialize(className);
    },
    resize: function() {
      return resize();
    },
    parallaxIt: function() {
      return parallaxIt();
    },
    getParallaxImages: function() {
      return getParallaxImages();
    },
    bwtwScroll: function () {
      return bwtwScroll();
    }
  }


})();

