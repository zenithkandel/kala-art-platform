/*!
 * कला Platform - Artists Display Module
 * Handles fetching and displaying artists from the database
 */

(function() {
  'use strict';
  
  let currentArtists = [];
  let currentSort = 'name';
  
  // DOM elements
  const artistGrid = document.getElementById('artistGrid');
  const artistSortButtons = document.querySelectorAll('[data-artist-sort]');
  
  // Track failed images to prevent infinite loading
  const failedImages = new Set();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeArtists);
  } else {
    initializeArtists();
  }
  
  function initializeArtists() {
    if (artistGrid) {
      loadArtists();
      initializeArtistFilters();
    }
  }
  
  function initializeArtistFilters() {
    artistSortButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all buttons
        artistSortButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Get sort type
        const sort = btn.dataset.artistSort;
        currentSort = sort;
        
        // Load artists with new sorting
        loadArtists();
      });
    });
  }
  
  async function loadArtists() {
    try {
      if (artistGrid) {
        artistGrid.innerHTML = `
          <div class="loading">
            <span>Loading talented artists...</span>
          </div>
        `;
      }
      
      const response = await fetch(`/api/artists?sort=${currentSort}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const artists = await response.json();
      currentArtists = artists;
      
      // Add a small delay for smooth transition
      setTimeout(() => {
        renderArtists();
      }, 300);
      
    } catch (error) {
      console.error('Error loading artists:', error);
      if (artistGrid) {
        artistGrid.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Oops! We couldn't load our talented artists right now.</p>
            <p style="font-size: 0.875rem; margin-top: 8px; opacity: 0.7;">Please check your connection and try again.</p>
          </div>
        `;
      }
    }
  }
  
  function renderArtists() {
    if (!artistGrid) return;
    
    if (currentArtists.length === 0) {
      artistGrid.innerHTML = `
        <div class="empty-message">
          <i class="fas fa-users"></i>
          <p>No talented artists found yet.</p>
          <p style="font-size: 0.875rem; margin-top: 8px; opacity: 0.7;">Be the first to join our creative community!</p>
        </div>
      `;
      return;
    }
    
    // Limit to first 8 artists for home page
    const displayArtists = currentArtists.slice(0, 8);
    
    const artistsHTML = displayArtists.map((artist, index) => createArtistCard(artist, index)).join('');
    artistGrid.innerHTML = artistsHTML;
    
    // Add staggered animation
    setTimeout(() => {
      const cards = artistGrid.querySelectorAll('.artist-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 50);
    
    // Initialize lazy loading for artist images
    initializeArtistImageLoading();
  }
  
  function createArtistCard(artist) {
    const profileImage = artist.profile_picture || '/public/img/placeholder-avatar.png';
    const specialty = artist.specialty || 'Artist';
    const artworkCount = artist.artwork_count || 0;
    const soldCount = artist.sold_count || 0;
    const bio = artist.bio ? (artist.bio.length > 100 ? artist.bio.substring(0, 100) + '...' : artist.bio) : 'Talented emerging artist';
    const age = artist.age ? `, ${artist.age}` : '';
    const instagram = artist.instagram ? `https://instagram.com/${artist.instagram.replace('@', '')}` : null;
    
    return `
      <div class="artist-card" data-artist-id="${artist.artist_id}">
        <div class="artist-card__image">
          <img 
            src="/public/img/placeholder-avatar.png" 
            alt="${artist.full_name}" 
            data-src="${profileImage}"
            class="artist-image"
            loading="lazy"
          />
          <div class="artist-card__overlay">
            <button class="btn btn--primary btn--sm" onclick="viewArtistProfile(${artist.artist_id}, '${artist.slug || ''}')">
              <i class="fas fa-user"></i> View Profile
            </button>
          </div>
        </div>
        <div class="artist-card__content">
          <h3 class="artist-card__name">${artist.full_name}${age}</h3>
          <p class="artist-card__specialty">${specialty}</p>
          <p class="artist-card__bio">${bio}</p>
          <div class="artist-card__stats">
            <div class="artist-stat">
              <i class="fas fa-palette"></i>
              <span>${artworkCount} artwork${artworkCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="artist-stat">
              <i class="fas fa-check-circle"></i>
              <span>${soldCount} sold</span>
            </div>
          </div>
          <div class="artist-card__links">
            ${instagram ? `
              <a href="${instagram}" target="_blank" rel="noopener" class="artist-link">
                <i class="fab fa-instagram"></i>
              </a>
            ` : ''}
            <button class="artist-link" onclick="viewArtistProfile(${artist.artist_id}, '${artist.slug || ''}')" title="View Profile">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  function initializeArtistImageLoading() {
    const artistImages = document.querySelectorAll('.artist-image[data-src]');
    
    artistImages.forEach(img => {
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc && !failedImages.has(dataSrc)) {
        loadArtistImageSafely(img, dataSrc);
      }
    });
  }
  
  function loadArtistImageSafely(imgElement, imageUrl) {
    // Check if this URL has failed before
    if (failedImages.has(imageUrl)) {
      imgElement.src = createArtistPlaceholderImage();
      return;
    }
    
    // Create a test image to check if URL loads
    const testImg = new Image();
    
    testImg.onload = function() {
      // Image loaded successfully
      imgElement.src = imageUrl;
    };
    
    testImg.onerror = function() {
      // Mark this URL as failed to prevent future attempts
      failedImages.add(imageUrl);
      
      // Use placeholder image
      imgElement.src = createArtistPlaceholderImage();
      
      console.warn(`Failed to load artist image: ${imageUrl}`);
    };
    
    // Start loading
    testImg.src = imageUrl;
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!imgElement.src || imgElement.src.includes('placeholder-avatar.png')) {
        failedImages.add(imageUrl);
        imgElement.src = createArtistPlaceholderImage();
      }
    }, 5000); // 5 second timeout
  }
  
  function createArtistPlaceholderImage() {
    // First try the static placeholder
    const placeholderPath = '/public/img/placeholder-avatar.png';
    
    // If placeholder has failed before, create a data URI
    if (failedImages.has(placeholderPath)) {
      return createArtistDataURIPlaceholder();
    }
    
    return placeholderPath;
  }
  
  function createArtistDataURIPlaceholder() {
    const svg = `
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <circle cx="75" cy="75" r="75" fill="#f0f0f0"/>
        <circle cx="75" cy="50" r="20" fill="#ccc"/>
        <path d="M30 120 Q75 100 120 120 L120 150 L30 150 Z" fill="#ddd"/>
        <text x="75" y="135" text-anchor="middle" fill="#999" font-family="Arial" font-size="10">
          Artist
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  
  // Global function to view artist profile
  window.viewArtistProfile = function(artistId, slug) {
    if (slug && slug !== 'null' && slug !== '') {
      window.location.href = `/artist/${slug}`;
    } else {
      window.location.href = `/artist/${artistId}`;
    }
  };
  
  // Export for global access if needed
  window.ArtistDisplay = {
    loadArtists,
    renderArtists,
    currentArtists: () => currentArtists
  };
})();
