window.addEventListener('scroll', function () {
  //var redDiv = document.querySelector('.red-div')
  var blueDiv = document.querySelector('.blue-div')
  var scrollPosition = window.scrollY

  // Get the height of the red div plus 1.125rem (18px)
  var stopPosition = '18px'
  blueDiv.style.zIndex = '40'

  if (scrollPosition >= stopPosition) {
    blueDiv.style.position = 'sticky'
    blueDiv.style.top = stopPosition
  } else {
    blueDiv.style.position = 'relative'
  }
})
