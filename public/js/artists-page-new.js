// Artists Page functionality
class ArtistsPage {
  constructor() {
    this.artists = [];
    this.filteredArtists = [];
    this.currentSort = 'name';
    this.currentSpecialty = 'all';
    this.searchQuery = '';
    this.itemsPerPage = 12;
    this.currentPage = 1;
    
    this.init();
  }
  
  async init() {
    await this.loadArtists();
    this.setupEventListeners();
    this.updateStats();
    this.renderResults();
  }
  
  async loadArtists() {
    try {
      const response = await fetch('/api/artists');
      if (!response.ok) throw new Error('Failed to fetch artists');
      
      this.artists = await response.json();
      this.filteredArtists = [...this.artists];
      console.log('Artists loaded:', this.artists.length);
    } catch (error) {
      console.error('Error loading artists:', error);
      this.artists = [];
      this.filteredArtists = [];
    }
  }
  
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('artistSearch');
    const searchClear = document.getElementById('searchClear');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
        
        if (searchClear) {
          searchClear.style.display = this.searchQuery ? 'inline-block' : 'none';
        }
      });
    }
    
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        searchClear.style.display = 'none';
        this.applyFilters();
      });
    }
    
    // Sort buttons
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSort = btn.dataset.sort;
        this.applyFilters();
      });
    });
    
    // Specialty buttons
    document.querySelectorAll('[data-specialty]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-specialty]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSpecialty = btn.dataset.specialty;
        this.applyFilters();
      });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshResults');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refresh();
      });
    }
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMore();
      });
    }
  }
  
  applyFilters() {
    let filtered = [...this.artists];
    
    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(this.searchQuery) ||
        artist.specialty.toLowerCase().includes(this.searchQuery) ||
        (artist.bio && artist.bio.toLowerCase().includes(this.searchQuery))
      );
    }
    
    // Apply specialty filter
    if (this.currentSpecialty !== 'all') {
      filtered = filtered.filter(artist => 
        artist.specialty.toLowerCase().includes(this.currentSpecialty.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'popular':
          return (b.artwork_count || 0) - (a.artwork_count || 0);
        case 'artworks':
          return (b.artwork_count || 0) - (a.artwork_count || 0);
        default:
          return 0;
      }
    });
    
    this.filteredArtists = filtered;
    this.currentPage = 1;
    this.renderResults();
  }
  
  updateStats() {
    // Update total artists
    const totalArtistsEl = document.getElementById('totalArtists');
    if (totalArtistsEl) {
      totalArtistsEl.textContent = this.artists.length;
    }
    
    // Update total artworks
    const totalArtworks = this.artists.reduce((sum, artist) => sum + (artist.artwork_count || 0), 0);
    const totalArtworksEl = document.getElementById('totalArtworks');
    if (totalArtworksEl) {
      totalArtworksEl.textContent = totalArtworks;
    }
    
    // Update total specialties
    const specialties = [...new Set(this.artists.map(artist => artist.specialty))];
    const totalSpecialtiesEl = document.getElementById('totalSpecialties');
    if (totalSpecialtiesEl) {
      totalSpecialtiesEl.textContent = specialties.length;
    }
  }
  
  renderResults() {
    const grid = document.getElementById('artistsGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    const resultsInfo = document.getElementById('resultsInfo');
    const loadMoreSection = document.getElementById('loadMoreSection');
    
    if (!grid) return;
    
    // Hide loading spinner
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    // Update results info
    if (resultsInfo) {
      const showing = Math.min(this.currentPage * this.itemsPerPage, this.filteredArtists.length);
      resultsInfo.textContent = `Showing ${showing} of ${this.filteredArtists.length} artists`;
    }
    
    // Show/hide empty state
    if (emptyState) {
      emptyState.style.display = this.filteredArtists.length === 0 ? 'block' : 'none';
    }
    
    // Show/hide load more button
    if (loadMoreSection) {
      const hasMore = this.currentPage * this.itemsPerPage < this.filteredArtists.length;
      loadMoreSection.style.display = hasMore ? 'block' : 'none';
    }
    
    // Clear and populate grid
    grid.innerHTML = '';
    
    const itemsToShow = this.filteredArtists.slice(0, this.currentPage * this.itemsPerPage);
    
    itemsToShow.forEach(artist => {
      const card = this.createArtistCard(artist);
      grid.appendChild(card);
    });
  }
  
  createArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const imageUrl = artist.profile_image && !artist.profile_image.includes('placeholder') 
      ? `/public/uploads/profiles/${artist.profile_image}`
      : '/public/img/placeholder-avatar.png';
    
    card.innerHTML = `
      <div class="card__image">
        <img src="${imageUrl}" 
             alt="${artist.name}"
             loading="lazy"
             onerror="this.src='/public/img/placeholder-avatar.png'">
        <div class="card__overlay">
          <button class="btn btn--secondary" onclick="viewArtist(${artist.id})">
            <i class="fas fa-eye"></i> View Profile
          </button>
        </div>
      </div>
      <div class="card__content">
        <h3 class="card__title">${artist.name}</h3>
        <p class="card__subtitle">${artist.specialty}</p>
        ${artist.bio ? `<p class="card__description">${artist.bio.substring(0, 100)}${artist.bio.length > 100 ? '...' : ''}</p>` : ''}
        
        <div class="card__stats">
          <div class="stat-item">
            <span class="stat-value">${artist.artwork_count || 0}</span>
            <span class="stat-label">Artworks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${artist.sales_count || 0}</span>
            <span class="stat-label">Sales</span>
          </div>
        </div>
        
        <div class="card__actions">
          <button class="btn btn--primary" onclick="viewArtist(${artist.id})">
            <i class="fas fa-user"></i> View Artist
          </button>
          <button class="btn btn--secondary" onclick="viewArtworks(${artist.id})">
            <i class="fas fa-palette"></i> Artworks
          </button>
        </div>
      </div>
    `;
    
    return card;
  }
  
  loadMore() {
    this.currentPage++;
    this.renderResults();
  }
  
  async refresh() {
    const refreshBtn = document.getElementById('refreshResults');
    if (refreshBtn) {
      const originalText = refreshBtn.innerHTML;
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      refreshBtn.disabled = true;
    }
    
    await this.loadArtists();
    this.updateStats();
    this.applyFilters();
    
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      refreshBtn.disabled = false;
    }
  }
}

// Global functions for card actions
window.viewArtist = function(artistId) {
  window.location.href = `/artist/${artistId}`;
};

window.viewArtworks = function(artistId) {
  window.location.href = `/artworks?artist=${artistId}`;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ArtistsPage();
});
