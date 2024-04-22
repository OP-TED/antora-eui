window.addEventListener('scroll', function () {
  const nav = document.querySelector('.nav')
  const navMenu = document.querySelector('.nav-panel-menu')
  const navExplore = document.querySelector('.nav-panel-explore')
  const toolbar = document.querySelector('.toolbar')

  const navbar = document.querySelector('.navbar')
  const screenHeight = window.innerHeight

  // It is a standard value and is set in the vars.css --globan-height
  const globanHeight = 18

  // Get the values of the CSS variables
  const navbarHeight = navbar.getBoundingClientRect().height

  // Calculate the maximum height
  const maxHeight = screenHeight - ((navbarHeight / 2) + globanHeight)
  // Calculate the height of the div based on its top position
  var divTop = nav.getBoundingClientRect().top
  const drawerHeight = navExplore.getBoundingClientRect().height

  //If the width of the page is less than 1024px, change the top of the nav
  if (window.matchMedia('(max-width: 1023.5px)').matches) {
    const toolbaBottom = toolbar.getBoundingClientRect().bottom
    divTop = toolbaBottom + 10
  }

  const divHeight = screenHeight - divTop

  if (divHeight >= maxHeight) {
    // Max height for side navigation. from this height and on must stay stable
    return
  }
  const divMenuHeight = divHeight - drawerHeight
  // Ensure height is non-negative
  const calculatedHeight = Math.max(0, divHeight)

  // Apply the calculated height to the div
  nav.style.height = calculatedHeight + 'px'
  navMenu.style.height = divMenuHeight + 'px'
})
