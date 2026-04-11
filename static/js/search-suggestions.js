// Search Suggestions JS - Modern vanilla JS implementation
// Handles both desktop/mobile search inputs with shared dropdown

document.addEventListener('DOMContentLoaded', function() {
  const desktopInput = document.getElementById('search-input-desktop');
  const mobileInput = document.getElementById('search-input-mobile');
  const dropdown = document.getElementById('search-dropdown');
  
  if (!dropdown) return;
  
  let debounceTimer;
  let selectedIndex = -1;
  let isMobile = window.innerWidth < 1024;
  
  // Merge inputs array for easier handling
  const inputs = [desktopInput, mobileInput].filter(Boolean);
  const activeInput = () => document.activeElement === desktopInput ? desktopInput : mobileInput;
  
  // Debounced search function
  function debounceSearch(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(query), 300);
  }
  
  // Fetch suggestions via AJAX
  async function fetchSuggestions(query) {
    if (query.length < 2) {
      dropdown.innerHTML = '';
      dropdown.classList.add('hidden');
      return;
    }
    
    try {
      dropdown.innerHTML = '<div class="flex items-center justify-center py-4"><i class="fa-solid fa-spinner fa-spin text-blue-400"></i></div>';
      dropdown.classList.remove('hidden');
      
      const response = await fetch(`/search_suggestions/?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      renderSuggestions(data.results, query);
    } catch (error) {
      console.error('Search suggestions error:', error);
      dropdown.innerHTML = '<div class="py-4 px-4 text-xs text-slate-500">Search unavailable</div>';
    }
  }
  
  // Render dropdown items
  function renderSuggestions(results, query) {
    if (!results || results.length === 0) {
      dropdown.innerHTML = '<div class="py-4 px-4 text-xs text-slate-500 text-center">No products found</div>';
      return;
    }
    
    dropdown.innerHTML = results.map(result => `
      <a href="${result.url}" class="suggestion-item flex gap-3 p-3 hover:bg-white/10 transition-all group" data-slug="${result.slug}">
        <div class="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 group-hover:bg-blue-500/10">
          ${result.image ? `<img src="${result.image}" alt="${result.name}" class="w-full h-full object-cover" loading="lazy">` : '<i class="fa-solid fa-image text-slate-400 m-auto text-xl"></i>'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-white text-sm truncate group-hover:text-blue-300">${highlightText(result.name, query)}</div>
          <div class="text-xs text-blue-200/80">${result.category}</div>
        </div>
        <div class="text-right flex-shrink-0 ml-auto">
          <div class="font-bold text-white text-sm">$${Number(result.price).toFixed(0)}</div>
        </div>
      </a>
    `).join('');
    
    // Add keyboard navigation
    updateKeyboardNav();
  }
  
  // Simple text highlighting
  function highlightText(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black px-1 rounded">$1</mark>');
  }
  
  // Keyboard navigation
  function updateKeyboardNav() {
    const items = dropdown.querySelectorAll('.suggestion-item');
    selectedIndex = -1;
    
    dropdown.addEventListener('keydown', (e) => {
      const items = Array.from(dropdown.querySelectorAll('.suggestion-item'));
      if (items.length === 0) return;
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          updateSelection(items);
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          updateSelection(items);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            items[selectedIndex].click();
          }
          break;
        case 'Escape':
          dropdown.classList.add('hidden');
          activeInput()?.blur();
          break;
      }
    });
  }
  
  function updateSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('bg-blue-600/20', idx === selectedIndex);
      item.setAttribute('aria-selected', idx === selectedIndex);
    });
    
    if (selectedIndex >= 0) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }
  
  // Input event listeners
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      debounceSearch(e.target.value);
    });
    
    input.addEventListener('focus', () => {
      if (input.value.length >= 2) {
        debounceSearch(input.value);
      }
    });
    
    input.addEventListener('blur', () => {
      // Delay hide to allow click
      setTimeout(() => {
        if (!dropdown.matches(':hover') && !inputs.some(i => document.activeElement === i)) {
          dropdown.classList.add('hidden');
        }
      }, 150);
    });
  });
  
  
  // Global click outside handler
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-dropdown') && 
        !inputs.some(input => input.contains(e.target))) {
      dropdown.classList.add('hidden');
    }
  });
  
  // Window resize handler for mobile/desktop switch
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth < 1024;
  });
  
  // Form submit - hide dropdown
  inputs.forEach(input => {
    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        dropdown.classList.add('hidden');
      });
    }
  });
});
