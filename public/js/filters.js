(function(){
  'use strict';
  
  // Filter and sort functionality
  const filterButtons = document.querySelectorAll('.grid__filters .btn');
  const artGrid = document.getElementById('artGrid');
  let currentFilter = 'all';
  let currentSort = 'newest';
  
  // Sample art data (will be replaced with real data from database)
  let artworks = [
    { id: 1, title: 'Sunset Dreams', type: 'painting', price: 150, date: '2024-01-15', artist: 'Maya Chen' },
    { id: 2, title: 'City Sketch', type: 'sketch', price: 75, date: '2024-01-10', artist: 'Raj Patel' },
    { id: 3, title: 'Portrait Study', type: 'portrait', price: 200, date: '2024-01-20', artist: 'Sofia Rodriguez' },
    { id: 4, title: 'Digital Landscape', type: 'digital', price: 120, date: '2024-01-25', artist: 'Alex Kim' },
    { id: 5, title: 'Abstract Forms', type: 'painting', price: 300, date: '2024-01-12', artist: 'Jordan Liu' },
    { id: 6, title: 'Character Design', type: 'digital', price: 180, date: '2024-01-18', artist: 'Sam Taylor' }
  ];
  
  // Initialize filters
  if (filterButtons.length > 0) {
    initializeFilters();
    renderArtworks();
  }
  
  function initializeFilters() {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Get filter/sort type
        const filter = btn.dataset.filter;
        const sort = btn.dataset.sort;
        
        if (filter) {
          currentFilter = filter;
        }
        
        if (sort) {
          currentSort = sort;
        }
        
        // Apply filters and re-render
        renderArtworks();
      });
    });
  }
  
  function filterArtworks() {
    let filtered = [...artworks];
    
    // Apply type filter
    if (currentFilter && currentFilter !== 'all') {
      filtered = filtered.filter(art => art.type === currentFilter);
    }
    
    // Apply sorting
    switch (currentSort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }
    
    return filtered;
  }
  
  function renderArtworks() {
    if (!artGrid) return;
    
    const filtered = filterArtworks();
    
    // Clear current content
    artGrid.innerHTML = '';
    
    if (filtered.length === 0) {
      artGrid.innerHTML = `
        <div class="no-results">
          <i class="fa-light fa-magnifying-glass" style="font-size: 2rem; color: var(--muted); margin-bottom: 8px;"></i>
          <p>No artworks found for the selected filters.</p>
        </div>
      `;
      return;
    }
    
    // Render filtered artworks
    filtered.forEach((artwork, index) => {
      const card = createArtworkCard(artwork);
      artGrid.appendChild(card);
      
      // Animate cards in with stagger
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }
  
  function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    const typeIcon = getTypeIcon(artwork.type);
    
    card.innerHTML = `
      <div class="card__image">
        <img src="/img/placeholder-art.jpg" alt="${artwork.title}" loading="lazy">
        <div class="card__badge">
          <i class="${typeIcon}"></i>
          <span>${artwork.type}</span>
        </div>
      </div>
      <div class="card__content">
        <h3>${artwork.title}</h3>
        <p class="card__artist">by ${artwork.artist}</p>
        <div class="card__footer">
          <span class="card__price">$${artwork.price}</span>
          <button class="btn btn--sm">
            <i class="fa-light fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }
  
  function getTypeIcon(type) {
    const icons = {
      'sketch': 'fa-light fa-pencil',
      'painting': 'fa-light fa-palette',
      'portrait': 'fa-light fa-user-tie',
      'digital': 'fa-light fa-tablet-screen-button'
    };
    return icons[type] || 'fa-light fa-image';
  }
  
  // Export for global access if needed
  window.ArtFilters = {
    renderArtworks,
    filterArtworks
  };
})();
