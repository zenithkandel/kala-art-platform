/**
 * Modern Artists Page Functionality
 * Complete interactive features for the dedicated artists page
 */

class ArtistsPage {
    constructor() {
        this.artists = [];
        this.filteredArtists = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentView = 'grid';
        this.currentSort = 'name';
        this.currentFilters = {
            search: '',
            specialty: 'all'
        };
        this.init();
    }

    async init() {
        console.log('Initializing ArtistsPage...');
        this.setupEventListeners();
        this.setupAnimations();
        await this.loadArtists();
        this.renderResults();
        console.log('ArtistsPage initialization complete');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('artistSearch');
        const searchClear = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                this.currentFilters.search = '';
                this.applyFilters();
            });
        }

        // Sort filters
        document.querySelectorAll('.sort-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sort-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSort = btn.dataset.sort;
                this.applyFilters();
            });
        });

        // Specialty filters
        document.querySelectorAll('.specialty-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.specialty-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilters.specialty = btn.dataset.specialty;
                this.applyFilters();
            });
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.renderResults();
            });
        });

        // Load more
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderResults(true);
            });
        }

        // Export functionality
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportArtists());
        }
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Hero stats animation
        this.animateHeroStats();
    }

    async loadArtists() {
        try {
            console.log('Loading artists from API...');
            const response = await fetch('/api/artists');
            console.log('API response status:', response.status);
            
            if (!response.ok) throw new Error('Failed to fetch artists');
            
            this.artists = await response.json();
            console.log('Loaded artists:', this.artists.length, this.artists);
            
            this.filteredArtists = [...this.artists];
            this.updateHeroStats();
            
        } catch (error) {
            console.error('Error loading artists:', error);
            this.showError('Failed to load artists. Please try again.');
        }
    }

    applyFilters() {
        let filtered = [...this.artists];

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(artist => 
                artist.name.toLowerCase().includes(searchTerm) ||
                artist.specialty.toLowerCase().includes(searchTerm) ||
                (artist.bio && artist.bio.toLowerCase().includes(searchTerm))
            );
        }

        // Apply specialty filter
        if (this.currentFilters.specialty !== 'all') {
            filtered = filtered.filter(artist => 
                artist.specialty.toLowerCase() === this.currentFilters.specialty.toLowerCase()
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'artworks':
                    return (b.artwork_count || 0) - (a.artwork_count || 0);
                case 'sales':
                    return (b.total_sales || 0) - (a.total_sales || 0);
                case 'recent':
                    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                default:
                    return 0;
            }
        });

        this.filteredArtists = filtered;
        this.currentPage = 1;
        this.renderResults();
    }

    renderResults(append = false) {
        const grid = document.getElementById('artistsGrid');
        const resultsInfo = document.getElementById('resultsInfo');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (!grid) return;

        // Update view class
        grid.className = `artists-grid ${this.currentView}-view`;

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const artistsToShow = this.filteredArtists.slice(0, endIndex);
        const artistsThisPage = this.filteredArtists.slice(startIndex, endIndex);

        // Update results info
        if (resultsInfo) {
            resultsInfo.textContent = `Showing ${artistsToShow.length} of ${this.filteredArtists.length} artists`;
        }

        // Render artists
        if (!append) {
            grid.innerHTML = '';
        }

        artistsThisPage.forEach((artist, index) => {
            const card = this.createArtistCard(artist);
            grid.appendChild(card);

            // Animate card entrance
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);

            // Add to intersection observer
            this.observer.observe(card);
        });

        // Update load more button
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex >= this.filteredArtists.length ? 'none' : 'block';
        }
    }

    createArtistCard(artist) {
        const card = document.createElement('div');
        card.className = 'artist-card-modern';
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

        const artworkCount = artist.artwork_count || 0;
        const totalSales = artist.total_sales || 0;
        const avgRating = artist.avg_rating || 0;

        // Create a unique image element with proper error handling
        const imageUrl = artist.profile_image ? 
            `http://localhost:3000/public/uploads/artists/${artist.profile_image}` : 
            'http://localhost:3000/public/img/placeholder-avatar.png';

        card.innerHTML = `
            <div class="artist-card-modern__image">
                <img src="${imageUrl}" 
                     alt="${artist.name}"
                     loading="lazy"
                     onerror="this.src='http://localhost:3000/public/img/placeholder-avatar.png'; this.onerror=null;">
                <div class="artist-card-modern__overlay">
                    <button class="artist-card-modern__btn artist-card-modern__btn--primary" 
                            onclick="window.location.href='/artist/${artist.id}'">
                        <i class="fas fa-eye"></i>
                        View Profile
                    </button>
                </div>
            </div>
            <div class="artist-card-modern__content">
                <div class="artist-card-modern__header">
                    <h3 class="artist-card-modern__name">${artist.name}</h3>
                    <p class="artist-card-modern__specialty">${artist.specialty}</p>
                </div>
                
                ${artist.bio ? `
                    <p class="artist-card-modern__bio">${artist.bio}</p>
                ` : ''}
                
                <div class="artist-card-modern__stats">
                    <div class="artist-card-modern__stat">
                        <span class="artist-card-modern__stat-number">${artworkCount}</span>
                        <span class="artist-card-modern__stat-label">Artworks</span>
                    </div>
                    <div class="artist-card-modern__stat">
                        <span class="artist-card-modern__stat-number">$${totalSales.toLocaleString()}</span>
                        <span class="artist-card-modern__stat-label">Sales</span>
                    </div>
                    <div class="artist-card-modern__stat">
                        <span class="artist-card-modern__stat-number">${avgRating.toFixed(1)}</span>
                        <span class="artist-card-modern__stat-label">Rating</span>
                    </div>
                </div>
                
                <div class="artist-card-modern__actions">
                    <button class="artist-card-modern__btn artist-card-modern__btn--primary"
                            onclick="window.location.href='/artist/${artist.id}'">
                        <i class="fas fa-user"></i>
                        View Profile
                    </button>
                    <button class="artist-card-modern__btn artist-card-modern__btn--secondary"
                            onclick="this.toggleContact && this.toggleContact(${artist.id})">
                        <i class="fas fa-envelope"></i>
                        Contact
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    updateHeroStats() {
        const totalArtists = document.getElementById('totalArtists');
        const totalArtworks = document.getElementById('totalArtworks');
        const totalSpecialties = document.getElementById('totalSpecialties');

        console.log('Updating hero stats with artists:', this.artists.length);

        if (totalArtists) {
            totalArtists.textContent = this.artists.length;
        }

        if (totalArtworks) {
            const artworkCount = this.artists.reduce((sum, artist) => sum + (artist.artwork_count || 0), 0);
            totalArtworks.textContent = artworkCount;
            console.log('Total artworks:', artworkCount);
        }

        if (totalSpecialties) {
            const specialties = [...new Set(this.artists.map(artist => artist.specialty))];
            totalSpecialties.textContent = specialties.length;
            console.log('Total specialties:', specialties.length, specialties);
        }
    }

    animateHeroStats() {
        const stats = document.querySelectorAll('.hero-stat__number');
        stats.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/\D/g, ''));
            if (target) {
                this.animateNumber(stat, 0, target, 2000);
            }
        });
    }

    animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            
            const formatted = element.textContent.includes('$') 
                ? `$${Math.floor(current).toLocaleString()}`
                : Math.floor(current).toString();
            element.textContent = formatted;
        }, 16);
    }

    toggleContact(artistId) {
        // Implement contact modal or redirect
        console.log('Contact artist:', artistId);
        // You can implement a modal or redirect to contact form
    }

    exportArtists() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'artists-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['Name', 'Specialty', 'Artworks', 'Total Sales', 'Rating'];
        const rows = this.filteredArtists.map(artist => [
            artist.name,
            artist.specialty,
            artist.artwork_count || 0,
            artist.total_sales || 0,
            artist.avg_rating || 0
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    showError(message) {
        const grid = document.getElementById('artistsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    color: #ff5c7c;
                    font-size: 1.1rem;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
                    ${message}
                </div>
            `;
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ArtistsPage');
    
    // Check if required elements exist
    const requiredElements = ['totalArtists', 'totalArtworks', 'totalSpecialties', 'artistsGrid'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }
    
    try {
        new ArtistsPage();
    } catch (error) {
        console.error('Error initializing ArtistsPage:', error);
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});
