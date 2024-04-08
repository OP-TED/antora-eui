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
window.addEventListener('resize', function () {
  //var nav = document.querySelector('.nav')
  var euTenders = document.querySelector('.eu-tenders')
  var nav = document.querySelector('.nav')
  var panels = document.querySelector('.panels')

  //var navHeight = parseFloat(window.getComputedStyle(nav).height)
  var euTendersTop = parseFloat(window.getComputedStyle(euTenders).top)
  // Calculate the remaining height of the viewport
  var remainingHeight = window.innerHeight - euTendersTop + 18

  // Now you can use remainingHeight for your needs
  // For example, you can set it as a CSS variable
  document.documentElement.style.setProperty('--nav-height--desktop', `${remainingHeight}px`)
  nav.style.height = `${remainingHeight}px`
  panels.style.height = `${remainingHeight}px`
})
