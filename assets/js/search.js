document.addEventListener("DOMContentLoaded", function() {
  fetch("/searchindex.json")
    .then(response => response.json())
    .then(data => {
      const idx = lunr(function() {
        this.ref("url");
        this.field("title");
        this.field("content");
        data.forEach(function(doc) {
          this.add(doc);
        }, this);
      });

      const searchInput = document.getElementById("search");
      const searchResults = document.getElementById("search-result");

      searchInput.addEventListener("input", function() {
        const results = idx.search(this.value);
        searchResults.innerHTML = "";
        if (results.length > 0) {
          results.forEach(result => {
            const item = data.find(d => d.url === result.ref);
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = item.url;
            a.textContent = item.title;
            li.appendChild(a);
            searchResults.appendChild(li);
          });
        } else {
          searchResults.innerHTML = "<li>No results found</li>";
        }
      });
    });
});
