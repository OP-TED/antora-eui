window.addEventListener('scroll', function () {
  const nav = document.querySelector('.nav')
  const navMenu = document.querySelector('.nav-panel-menu')
  const toolbar = document.querySelector('.toolbar')
  const screenHeight = window.innerHeight

  // Calculate the height of the div based on its top position
  var divTop = nav.getBoundingClientRect().top

  const drawerHeight = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--drawer-height'))
  console.log('DRAWER', drawerHeight)

  // If the width of the page is less than 1024px, change the top of the nav
  if (window.matchMedia('(max-width: 1023.5px)').matches) {
    divTop = divTop - toolbar.getBoundingClientRect().height
  }
  const divHeight = screenHeight - divTop

  const divMenuHeight = divHeight - drawerHeight
  // Ensure height is non-negative
  const calculatedHeight = Math.max(0, divHeight)

  console.log('DIV HEIGHT', divHeight)
  console.log('SCREEN', screenHeight)
  console.log('TOP', divTop)

  // Apply the calculated height to the div
  nav.style.height = calculatedHeight + 'px'
  navMenu.style.height = divMenuHeight + 'px'
})
