// Mode sombre/clair
function initThemeToggle() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        updateToggleIcon(toggle, theme);
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(toggle, newTheme);
        });
    }
}

function updateToggleIcon(toggle, theme) {
    toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    toggle.setAttribute('title', theme === 'dark' ? 'Mode clair' : 'Mode sombre');
}

// Animations au scroll
function initScrollAnimations() {
    const cards = document.querySelectorAll('.artist-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 50);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.classList.add('animate-ready');
        observer.observe(card);
    });
}

// Système de favoris
function initFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    document.querySelectorAll('.artist-card').forEach(card => {
        const artistId = card.querySelector('a').href.split('id=')[1];
        const favoriteBtn = createFavoriteButton(artistId, favorites.includes(artistId));
        card.querySelector('.artist-info').prepend(favoriteBtn);
    });
}

function createFavoriteButton(artistId, isFavorite) {
    const btn = document.createElement('button');
    btn.className = 'favorite-btn' + (isFavorite ? ' active' : '');
    btn.innerHTML = isFavorite ? '❤️' : '🤍';
    btn.setAttribute('data-id', artistId);
    btn.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(artistId, btn);
    });
    
    return btn;
}

function toggleFavorite(artistId, btn) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(artistId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        btn.classList.remove('active');
        btn.innerHTML = '🤍';
        btn.title = 'Ajouter aux favoris';
    } else {
        favorites.push(artistId);
        btn.classList.add('active');
        btn.innerHTML = '❤️';
        btn.title = 'Retirer des favoris';
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 600);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    updateFavoritesFilter();
}

function updateFavoritesFilter() {
    const showFavoritesOnly = document.getElementById('showFavorites')?.checked;
    if (showFavoritesOnly) {
        filterByFavorites();
    }
}

function filterByFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const cards = document.querySelectorAll('.artist-card');
    
    cards.forEach(card => {
        const artistId = card.querySelector('a').href.split('id=')[1];
        card.style.display = favorites.includes(artistId) ? '' : 'none';
    });
}

// Tri des artistes
function initSorting() {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortArtists(e.target.value);
        });
    }
}

function sortArtists(criteria) {
    const grid = document.getElementById('artistsGrid');
    const cards = Array.from(grid.querySelectorAll('.artist-card'));
    
    cards.sort((a, b) => {
        switch(criteria) {
            case 'name':
                return a.dataset.name.localeCompare(b.dataset.name);
            case 'name-desc':
                return b.dataset.name.localeCompare(a.dataset.name);
            case 'creation':
                return parseInt(a.dataset.creation) - parseInt(b.dataset.creation);
            case 'creation-desc':
                return parseInt(b.dataset.creation) - parseInt(a.dataset.creation);
            case 'album':
                return new Date(a.dataset.album) - new Date(b.dataset.album);
            case 'album-desc':
                return new Date(b.dataset.album) - new Date(a.dataset.album);
            case 'members':
                return parseInt(a.dataset.memberCount) - parseInt(b.dataset.memberCount);
            case 'members-desc':
                return parseInt(b.dataset.memberCount) - parseInt(a.dataset.memberCount);
            default:
                return 0;
        }
    });
    
    cards.forEach(card => grid.appendChild(card));
}

// Mode grille/liste
function initViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    const grid = document.getElementById('artistsGrid');
    const savedView = localStorage.getItem('viewMode') || 'grid';
    
    if (grid) {
        grid.classList.add(savedView === 'list' ? 'list-view' : 'grid-view');
    }
    
    if (viewToggle) {
        updateViewIcon(viewToggle, savedView);
        viewToggle.addEventListener('click', () => {
            const currentView = grid.classList.contains('list-view') ? 'list' : 'grid';
            const newView = currentView === 'grid' ? 'list' : 'grid';
            
            grid.classList.remove('grid-view', 'list-view');
            grid.classList.add(newView + '-view');
            localStorage.setItem('viewMode', newView);
            updateViewIcon(viewToggle, newView);
        });
    }
}

function updateViewIcon(toggle, view) {
    toggle.innerHTML = view === 'grid' ? '☰' : '⊞';
    toggle.setAttribute('title', view === 'grid' ? 'Vue liste' : 'Vue grille');
}

// Autocomplétion recherche
function initAutocomplete() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-suggestions';
    searchInput.parentNode.appendChild(autocompleteContainer);
    
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase().trim();
        
        if (value.length < 2) {
            autocompleteContainer.innerHTML = '';
            return;
        }
        
        const cards = document.querySelectorAll('.artist-card');
        const suggestions = [];
        
        cards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const members = card.dataset.members.toLowerCase();
            
            if (name.includes(value) || members.includes(value)) {
                suggestions.push({
                    name: card.dataset.name,
                    image: card.querySelector('img').src,
                    link: card.querySelector('a').href
                });
            }
        });
        
        displaySuggestions(suggestions.slice(0, 5), autocompleteContainer, searchInput);
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            autocompleteContainer.innerHTML = '';
        }
    });
}

function displaySuggestions(suggestions, container, input) {
    if (suggestions.length === 0) {
        container.innerHTML = '<div class="no-suggestions">Aucun résultat</div>';
        return;
    }
    
    container.innerHTML = suggestions.map(s => `
        <a href="${s.link}" class="autocomplete-item">
            <img src="${s.image}" alt="${s.name}">
            <span>${s.name}</span>
        </a>
    `).join('');
}

// Boutons de partage
function initShareButtons() {
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const url = window.location.href;
            const title = document.querySelector('h1').textContent;
            
            if (navigator.share) {
                navigator.share({ title, url });
            } else {
                navigator.clipboard.writeText(url);
                showToast('Lien copié !');
            }
        });
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initScrollAnimations();
    initFavorites();
    initSorting();
    initViewToggle();
    initAutocomplete();
    initShareButtons();
    initFavoritesFilter();
});

// Filtre favoris checkbox
function initFavoritesFilter() {
    const checkbox = document.getElementById('showFavorites');
    const filterLabel = document.querySelector('.favorites-filter');
    const countElement = document.getElementById('favCount');
    
    if (checkbox && countElement) {
        // Mettre à jour le compteur au chargement
        updateFavoritesCount();
        
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                filterLabel.classList.add('active');
                filterByFavorites();
            } else {
                filterLabel.classList.remove('active');
                // Réafficher toutes les cartes
                document.querySelectorAll('.artist-card').forEach(card => {
                    card.style.display = '';
                });
            }
        });
    }
}

function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const countElement = document.getElementById('favCount');
    if (countElement) {
        countElement.textContent = favorites.length;
        countElement.style.display = favorites.length > 0 ? 'inline-flex' : 'none';
    }
}
