(function(){
  'use strict';
  
  // Filter and sort functionality
  const filterButtons = document.querySelectorAll('.grid__filters .btn');
  const artGrid = document.getElementById('artGrid');
  let currentFilter = 'all';
  let currentSort = 'newest';
  
  // Art data will be loaded from server
  let artworks = [];
  
  // Track failed image loads to prevent infinite retries
  const failedImages = new Set();
  
  // Load artworks from server on page load
  async function loadArtworks() {
    try {
      const response = await fetch('/api/artworks');
      if (response.ok) {
        artworks = await response.json();
        renderArtworks();
      } else {
        console.error('Failed to load artworks');
        // Fallback to demo data if API fails
        artworks = [
          { id: 1, title: 'Sunset Dreams', type: 'painting', price: 150, date: '2024-01-15', artist: 'Maya Chen' },
          { id: 2, title: 'City Sketch', type: 'sketch', price: 75, date: '2024-01-10', artist: 'Raj Patel' },
          { id: 3, title: 'Portrait Study', type: 'portrait', price: 200, date: '2024-01-20', artist: 'Sofia Rodriguez' },
          { id: 4, title: 'Digital Landscape', type: 'digital', price: 120, date: '2024-01-25', artist: 'Alex Kim' },
          { id: 5, title: 'Abstract Forms', type: 'painting', price: 300, date: '2024-01-12', artist: 'Jordan Liu' },
          { id: 6, title: 'Character Design', type: 'digital', price: 180, date: '2024-01-18', artist: 'Sam Taylor' }
        ];
        renderArtworks();
      }
    } catch (error) {
      console.error('Error loading artworks:', error);
      // Use demo data as fallback
      artworks = [
        { id: 1, title: 'Sunset Dreams', type: 'painting', price: 150, date: '2024-01-15', artist: 'Maya Chen' },
        { id: 2, title: 'City Sketch', type: 'sketch', price: 75, date: '2024-01-10', artist: 'Raj Patel' }
      ];
      renderArtworks();
    }
  }
  
  // Initialize filters and load data
  if (filterButtons.length > 0) {
    initializeFilters();
    loadArtworks(); // Load real data instead of rendering demo data
  } else if (artGrid) {
    // If no filter buttons but artGrid exists, just load artworks
    loadArtworks();
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
    
    // Handle both database format and demo format
    const title = artwork.title || 'Untitled';
    const artist = artwork.artist_name || artwork.artist || 'Unknown Artist';
    const price = artwork.price || 0;
    const imageUrl = artwork.image_thumb || artwork.primary_image;
    const artId = artwork.art_id || artwork.id;
    
    card.innerHTML = `
      <div class="card__image">
        <img data-src="${imageUrl}" alt="${title}" loading="lazy">
        <div class="card__badge">
          <i class="${typeIcon}"></i>
          <span>${artwork.type}</span>
        </div>
      </div>
      <div class="card__content">
        <h3>${title}</h3>
        <p class="card__artist">by ${artist}</p>
        <div class="card__footer">
          <span class="card__price">NPR ${price.toLocaleString()}</span>
          <button class="btn btn--sm" onclick="viewArtwork(${artId})">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
      </div>
    `;
    
    // Smart image loading to prevent infinite retries
    const img = card.querySelector('img');
    loadImageSafely(img, imageUrl);
    
    return card;
  }
  
  // Smart image loading function that prevents infinite retries
  function loadImageSafely(imgElement, imageUrl) {
    // If this image URL has already failed, use placeholder immediately
    if (failedImages.has(imageUrl)) {
      imgElement.src = createPlaceholderImage();
      return;
    }
    
    // If no image URL provided, use placeholder
    if (!imageUrl || imageUrl.trim() === '') {
      imgElement.src = createPlaceholderImage();
      return;
    }
    
    // Try to load the image
    const testImg = new Image();
    testImg.onload = function() {
      // Image loaded successfully
      imgElement.src = imageUrl;
    };
    
    testImg.onerror = function() {
      // Mark this URL as failed to prevent future attempts
      failedImages.add(imageUrl);
      
      // Use placeholder image
      imgElement.src = createPlaceholderImage();
      
      console.warn(`Failed to load image: ${imageUrl}`);
    };
    
    // Start loading
    testImg.src = imageUrl;
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!imgElement.src || imgElement.src === '') {
        failedImages.add(imageUrl);
        imgElement.src = createPlaceholderImage();
      }
    }, 5000); // 5 second timeout
  }
  
  // Create a fallback placeholder using CSS/SVG data URI
  function createPlaceholderImage() {
    // First try the static placeholder with correct path
    const placeholderPath = '/public/img/placeholder-art.jpg';
    
    // If placeholder has failed before, create a data URI
    if (failedImages.has(placeholderPath)) {
      return createDataURIPlaceholder();
    }
    
    return placeholderPath;
  }
  
  // Create a data URI placeholder that will always work
  function createDataURIPlaceholder() {
    const svg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <circle cx="150" cy="80" r="20" fill="#ccc"/>
        <path d="M120 120 L150 100 L180 120 L210 90 L210 180 L90 180 Z" fill="#ddd"/>
        <text x="150" y="160" text-anchor="middle" fill="#999" font-family="Arial" font-size="12">
          Artwork Image
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  
  // Function to view artwork details
  function viewArtwork(artId) {
    window.location.href = `/art/${artId}`;
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
