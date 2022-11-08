window.antoraAlgolia = (function () {
  const scriptAttrs = document.getElementById('search-script').dataset
  const apiKey = scriptAttrs.apiKey
  const apiId = scriptAttrs.apiId
  const indexName = scriptAttrs.indexName

  var search = docsearch({
    apiKey: apiKey,
    appId: apiId,
    indexName: indexName,
    inputSelector: '#search-input',
    autocompleteOptions: { hint: false, keyboardShortcuts: ['s'] }
  }).autocomplete

  search.on('autocomplete:closed', function () { search.autocomplete.setVal() })
})()
