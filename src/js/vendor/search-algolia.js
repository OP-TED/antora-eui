window.antoraAlgolia = (function () {
  const scriptAttrs = document.getElementById('search-script').dataset
  const apiKey = scriptAttrs.apiKey
  const apiId = scriptAttrs.apiId
  const indexName = scriptAttrs.indexName

  // eslint-disable-next-line no-undef
  var search = docsearch({
    apiKey: apiKey,
    appId: apiId,
    indexName: indexName,
    container: '#search-input',
    searchParameters: { facetFilters: ['language:n', 'version:1.0.0'] },
    autocompleteOptions: { hint: false, keyboardShortcuts: ['s'] },
  })
})()
