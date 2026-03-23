;(function () {
  'use strict'

  var defined_code_blocks = document.querySelectorAll('code.language-mermaid')
  if (!defined_code_blocks.length) return

  var script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'
  script.onload = function () {
    var diagramDivs = []
    defined_code_blocks.forEach(function (block) {
      var container = block.closest('.listingblock')
      var div = document.createElement('div')
      div.className = 'mermaid'
      div.textContent = block.textContent
      container.parentNode.replaceChild(div, container)
      diagramDivs.push(div)
    })
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    mermaid.run({ nodes: diagramDivs })
  }
  document.head.appendChild(script)
})()
