/* eslint-env browser */
window.antoraLunr = (function (lunr) {
  const scriptAttrs = document.getElementById('search-script').dataset
  const basePath = scriptAttrs.basePath
  const pagePath = scriptAttrs.pagePath
  var currentComponent
  var searchFilter
  var debouncedSearch
  var searchResultFrame

  var searchInput = document.getElementById('search-input')
  var searchResult = document.createElement('div')
  searchResult.classList.add('search-result-dropdown-menu')
  searchInput.parentNode.appendChild(searchResult)

  function createSearchResultFrame() {
    var element = document.createElement('div')
    element.classList.add('search-result-frame')
    return element;
  }

  function createSearchFilter(store) {
    var searchFilterEl = document.createElement('div')
    searchFilterEl.classList.add('search-filter')

    var searchFilterSpan

    var searchAllSpan = document.createElement('span')
    searchAllSpan.classList.add('search-filter-component')
    searchAllSpan.innerText="Search in:"
    searchFilterEl.appendChild(searchAllSpan)

    var searchFilterInput
    var searchFilterLabel

    var allComponents = Object.keys(store)
      .map(key => ({ name: store[key].component, version: store[key].version, title: store[key].componentTitle}))
      .filter(component => component.name != 'home')
    var uniqueComponents = []

    allComponents.forEach(function(component) {
      if(!uniqueComponents.some(c => c.name == component.name)) {
        uniqueComponents.push(component)

        searchFilterEl.appendChild(createSearchFilterLabel(component.title, 'search_filter_' + component.name, currentComponent.name == component.name || currentComponent.name == 'home'))
      }
    })

    searchFilterEl.appendChild(createSearchFilterLabel('Everywhere', 'search_filter_all', currentComponent.name == 'home'))

    return searchFilterEl

    function createSearchFilterInput(id, checked) {
      var inp = document.createElement('input')
      inp.type = 'checkbox'
      inp.id = id
      inp.name = 'search_filter'
      inp.checked = checked
      inp.addEventListener('mousedown', function (e) {
        e.preventDefault()
      })
      return inp
    }

    function createSearchFilterLabel(text, id, checked) {

      var input = createSearchFilterInput(id, checked);

      var label = document.createElement('label')
      label.classList.add('search-filter-component')
      label.appendChild(input)
      label.insertAdjacentText('beforeend', text)
      label.setAttribute('for', id)
      label.addEventListener('mousedown', function (e) {
        e.preventDefault()
      })
      label.addEventListener('click', function (e) {
        if (this === e.target) {
          e.preventDefault(); // prevent focus and click
          this.control && this.control.click(); // call click on the labeled control
      }
      })

      return label
    }
  }

  function highlightText (doc, position) {
    var hits = []
    var start = position[0]
    var length = position[1]

    var text = doc.text
    var highlightSpan = document.createElement('span')
    highlightSpan.classList.add('search-result-highlight')
    highlightSpan.innerText = text.substr(start, length)

    var end = start + length
    var textEnd = text.length - 1
    var contextOffset = 50
    var contextAfter = end + contextOffset > textEnd ? textEnd : end + contextOffset
    var contextBefore = start - contextOffset < 0 ? 0 : start - contextOffset
    if (start === 0 && end === textEnd) {
      hits.push(highlightSpan)
    } else if (start === 0) {
      hits.push(highlightSpan)
      hits.push(document.createTextNode(text.substr(end, contextAfter)))
    } else if (end === textEnd) {
      hits.push(document.createTextNode(text.substr(0, start)))
      hits.push(highlightSpan)
    } else {
      hits.push(document.createTextNode('...' + text.substr(contextBefore, start - contextBefore)))
      hits.push(highlightSpan)
      hits.push(document.createTextNode(text.substr(end, contextAfter - end) + '...'))
    }
    return hits
  }

  function highlightTitle (hash, doc, position) {
    var hits = []
    var start = position[0]
    var length = position[1]

    var highlightSpan = document.createElement('span')
    highlightSpan.classList.add('search-result-highlight')
    var title
    if (hash) {
      title = doc.titles.filter(function (item) {
        return item.id === hash
      })[0].text
    } else {
      title = doc.title
    }
    highlightSpan.innerText = title.substr(start, length)

    var end = start + length
    var titleEnd = title.length - 1
    if (start === 0 && end === titleEnd) {
      hits.push(highlightSpan)
    } else if (start === 0) {
      hits.push(highlightSpan)
      hits.push(document.createTextNode(title.substr(length, titleEnd)))
    } else if (end === titleEnd) {
      hits.push(document.createTextNode(title.substr(0, start)))
      hits.push(highlightSpan)
    } else {
      hits.push(document.createTextNode(title.substr(0, start)))
      hits.push(highlightSpan)
      hits.push(document.createTextNode(title.substr(end, titleEnd)))
    }
    return hits
  }

  function highlightHit (metadata, hash, doc) {
    var hits = []
    for (var token in metadata) {
      var fields = metadata[token]
      for (var field in fields) {
        var positions = fields[field]
        if (positions.position) {
          var position = positions.position[0] // only higlight the first match
          if (field === 'title') {
            hits = highlightTitle(hash, doc, position)
          } else if (field === 'text') {
            hits = highlightText(doc, position)
          }
        }
      }
    }
    return hits
  }

  function sortObjectDescending(obj) {
    return Object.keys(obj)
      .sort()
      .reverse()
      .reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
  }

  function isSection(url) {
    return url.includes('#')
  }

  function createSearchResult(result, store, searchResultDataset) {
    var groups={}

    result.forEach(function (item) {
        var url=item.ref
        var hash
        if (isSection(url)) {
          hash = url.substring(url.indexOf('#') + 1)
          url = url.replace('#' + hash, '')
        }
    
        var doc = store[url] 
        var groupName = doc.componentTitle + ' ' + (doc.version == 'master' ? '' : doc.version )
        if (! (groupName in groups)) {
            groups[groupName] = []
        }

        var metadata = item.matchData.metadata
        var hits = highlightHit(metadata, hash, doc)

        groups[groupName].push({ 'doc': doc, 'url': item.ref, 'hits': hits })
    })

    for (let group in sortObjectDescending(groups)) {
        searchResultDataset.appendChild(createSearchResultGroup(group, groups[group]))
    }
  }

  function createSearchResultGroup(groupName, groupItems) {
    var searchResultGroup = document.createElement('div')

    var searchResultGroupName = document.createElement('div')
    searchResultGroupName.classList.add('search-result-group', 'sticky')
    searchResultGroupName.innerText = groupName
    searchResultGroup.appendChild(searchResultGroupName)

    groupItems.forEach(function(item) {
        searchResultGroup.appendChild(createSearchResultItem(item.doc, item.url, item.hits))
    })    

    return searchResultGroup
  }

  function createSearchResultItem (doc, url, hits) {
    var documentTitle = document.createElement('div')
    documentTitle.classList.add('search-result-document-title')
    documentTitle.innerText = doc.title
    var documentHitLink = document.createElement('a')
    var documentHit = document.createElement('div')
    documentHit.classList.add('search-result-document-hit')
    if (isSection(url)) {
      documentHit.classList.add('search-result-document-hit-section')
    }

    var documentHitLink = document.createElement('a')
    var rootPath = basePath
    documentHitLink.href = rootPath + url
    documentHit.appendChild(documentHitLink)
    hits.forEach(function (hit) {
      documentHitLink.appendChild(hit)
    })
    var searchResultItem = document.createElement('div')
    searchResultItem.classList.add('search-result-item')
    searchResultItem.appendChild(documentTitle)
    searchResultItem.appendChild(documentHit)
    searchResultItem.addEventListener('mousedown', function (e) {
      e.preventDefault()
    })
    return searchResultItem
  }

  function createNoResult (text) {
    var searchResultItem = document.createElement('div')
    searchResultItem.classList.add('search-result-item')
    var documentHit = document.createElement('div')
    documentHit.classList.add('search-result-document-hit')
    var message = document.createElement('strong')
    message.innerText = 'No results found for query "' + text + '"'
    documentHit.appendChild(message)
    searchResultItem.appendChild(documentHit)
    return searchResultItem
  }

  function search (index, text) {
    // execute an exact match search
    var result = index.search(text)
    if (result.length > 0) {
      return result
    }
    // no result, use a begins with search
    result = index.search(text + '*')
    if (result.length > 0) {
      return result
    }
    // no result, use a contains search
    result = index.search('*' + text + '*')
    return result
  }

  function searchInComponents(index, store, text, components) {
    var result = search(index, text)

    return result.filter(function(item) {
      item = store[item.ref]
      return components.reduce(
        (found, component) => found || (item && item.component == component.name),
        false
      )
    })
  }

  function searchIndex (index, store, text) {
    // reset search result
    while (searchResultFrame.firstChild) {
      searchResultFrame.removeChild(searchResultFrame.firstChild)
    }
    while (searchResult.firstChild) {
      searchResult.removeChild(searchResult.firstChild)
    }

    searchResult.appendChild(searchResultFrame)
    searchResultFrame.appendChild(searchFilter)
    document.getElementsByName('search_filter').forEach(function(el) {
      el.addEventListener('change', function(e) {
        if(e.currentTarget.id == 'search_filter_all') {
          document.getElementsByName('search_filter').forEach(sf => sf.checked = e.currentTarget.checked)
        } else {
          document.getElementById('search_filter_all').checked = false
        }

        debouncedSearch()
      })

      el.addEventListener('mousedown', function (e) {
        e.preventDefault()
      })
    })

    if (text.trim() === '') {
      return
    }

    targetComponents = []
    document.getElementsByName('search_filter').forEach(sf => sf.checked && targetComponents.push({name: sf.id.replace(/^search_filter_/,'')}))
    var result = searchInComponents(index, store, text, targetComponents)
    var searchResultDataset = document.createElement('div')
    searchResultDataset.classList.add('search-result-dataset')
    searchResultFrame.appendChild(searchResultDataset)
    if (result.length > 0) {
      createSearchResult(result, store, searchResultDataset)
    } else {
      searchResultDataset.appendChild(createNoResult(text))
    }
  }

  function debounce (func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  function init (data) {
    currentComponent = { name: data.store[pagePath].component, version: data.store[pagePath].version }

    var index = Object.assign({index: lunr.Index.load(data.index), store: data.store})
    debouncedSearch = debounce(function () {
      searchIndex(index.index, index.store, searchInput.value)
    }, 100)
    searchInput.addEventListener('keydown', debouncedSearch)

    // this is prevented in case of mousedown attached to SearchResultItem
    searchInput.addEventListener('blur', function (e) {
      while (searchResultFrame.firstChild) {
        searchResultFrame.removeChild(searchResultFrame.firstChild)
      }
      while (searchResult.firstChild) {
        searchResult.removeChild(searchResult.firstChild)
      }
    })

    searchResultFrame = createSearchResultFrame()
    searchFilter = createSearchFilter(data.store)
  }

  return {
    init: init,
  }
})(window.lunr)
