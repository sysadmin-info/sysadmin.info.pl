(function () {
  // Get the language prefix for the correct index.json file
  var langPrefix = window.location.pathname.includes('/en/') ? '/en' : '/pl';

  // For main (top) search
  var mainSearchInput = document.getElementById('desktop-search-input');
  var mainSearchResults = document.getElementById('desktop-search-results');

  // For sidebar search
  var sidebarSearchInput = document.getElementById('search-sidebar');
  var sidebarSearchResults = document.getElementById('sidebar-search-results');

  // For mobile search
  var mobileSearchInput = document.getElementById('search-mobile');
  var mobileSearchResults = document.getElementById('mobile-search-results');

  // Fetch index.json for Lunr.js initialization
  fetch(`${langPrefix}/index.json`)
    .then(response => response.json())
    .then(data => {
      console.log('Fetched index data'); // Log fetched data for debugging

      // Initialize Lunr.js with the fetched data
      var idx = lunr(function () {
        this.ref('url');
        this.field('title');
        this.field('content');

        data.forEach(page => {
          this.add(page);
        });
      });

      // Function to render search results
      function renderResults(input, resultsContainer, isSidebar = false) {
        const query = input.value.trim();
        
        // If the query is empty, clear the results
        if (!query) {
          resultsContainer.innerHTML = '';
          return;
        }

        const results = idx.search(query);
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
          resultsContainer.innerHTML = '<p>No results found</p>';
          return;
        }

        const ul = document.createElement('ul');
        results.forEach(result => {
          const page = data.find(p => p.url === result.ref);

          // Enhanced logging for missing pages or fields
          if (!page || !page.url || !page.title || !page.content) {
            console.error('Page not found or missing fields for result:', {
              result,
              page,  // log the page data
              query: input.value  // log the search query
            });
            return; // Skip this iteration if the page is invalid
          }

          const li = document.createElement('li');
          li.classList.add('search-result__item');
          
          // Render differently for sidebar (in body of the page) vs other search results (dropdowns)
          li.innerHTML = `
            <a class="search-result__item--title" href="${page.url}">${page.title}</a>
            ${isSidebar ? `<div class="search-result__item--desc">${page.content.substring(0, 200)}</div>` : ''}`;
          
          ul.appendChild(li);
        });

        resultsContainer.appendChild(ul);

        // Apply additional styling for sidebar results
        if (isSidebar) {
          resultsContainer.classList.add('search-result__body');
        }
      }

      // Main search input handler (dropdown results)
      if (mainSearchInput && mainSearchResults) {
        mainSearchInput.addEventListener('input', function () {
          renderResults(mainSearchInput, mainSearchResults);
        });
      }

      // Sidebar search input handler (results displayed on the page)
      if (sidebarSearchInput && sidebarSearchResults) {
        sidebarSearchInput.addEventListener('input', function () {
          renderResults(sidebarSearchInput, sidebarSearchResults, true); // Pass true for sidebar search
        });
      }

      // Mobile search input handler
      if (mobileSearchInput && mobileSearchResults) {
        mobileSearchInput.addEventListener('input', function () {
          renderResults(mobileSearchInput, mobileSearchResults);
        });
      }

      // Function for handling search results rendering in main content area
      function renderSearchHighlightResultsMain() {
        const resultsContainer = document.querySelector('.search-result__body');

        // Debugging log to check if container is found
        if (!resultsContainer) {
          console.error('resultsContainer not found');
          return;
        }

        const parent = resultsContainer.parentNode;

        // Debugging log to check if parent is found
        if (!parent) {
          console.error('parentNode not found');
          return;
        }

        // Clear the results container
        resultsContainer.innerHTML = '';

        // Fetch the results again
        const query = sidebarSearchInput.value.trim();  // Use sidebar input as the query source
        const results = idx.search(query);

        if (results.length === 0) {
          resultsContainer.innerHTML = '<p>No results found</p>';
          return;
        }

        const ul = document.createElement('ul');
        results.forEach(result => {
          const page = data.find(p => p.url === result.ref);

          if (!page || !page.url || !page.title || !page.content) {
            console.error('Page not found or missing fields for result:', {
              result,
              page,  
              query: query  
            });
            return;
          }

          const li = document.createElement('li');
          li.classList.add('search-result__item');
          
          li.innerHTML = `
            <a class="search-result__item--title" href="${page.url}">${page.title}</a>
            <div class="search-result__item--desc">${page.content.substring(0, 200)}</div>`;
          
          ul.appendChild(li);
        });

        resultsContainer.appendChild(ul);
      }

      // Example usage or invocation of the function if needed
      if (sidebarSearchInput) {
        sidebarSearchInput.addEventListener('input', function () {
          renderSearchHighlightResultsMain();  // Call this function on search input
        });
      }
    })
    .catch(err => console.error('Error loading index.json:', err));
})();
