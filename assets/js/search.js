// Initialize Lunr.js with data from index.json
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-result');

fetch('/index.json')
  .then(response => response.json())
  .then(data => {
    const idx = lunr(function () {
      this.ref('url');
      this.field('title');
      this.field('content');

      data.forEach(page => {
        this.add(page);
      });
    });

    searchInput.addEventListener('input', function () {
      const query = searchInput.value;
      const results = idx.search(query);
      searchResults.innerHTML = '';

      results.forEach(result => {
        const page = data.find(p => p.url === result.ref);
        const li = document.createElement('li');
        li.innerHTML = `<a href="${page.url}">${page.title}</a>`;
        searchResults.appendChild(li);
      });
    });
  })
  .catch(err => console.error(err));
