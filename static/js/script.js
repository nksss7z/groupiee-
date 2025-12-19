// Recherche et filtrage des artistes avec animations modernes
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const minYear = document.getElementById('minYear');
    const maxYear = document.getElementById('maxYear');
    const minAlbum = document.getElementById('minAlbum');
    const maxAlbum = document.getElementById('maxAlbum');
    const minMembers = document.getElementById('minMembers');
    const maxMembers = document.getElementById('maxMembers');
    const artistCards = document.querySelectorAll('.artist-card');

    // Animation initiale des cartes avec stagger effect
    artistCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50); // Décalage de 50ms entre chaque carte
    });

    // Effet de particules sur le header
    createParticles();

    function filterArtists() {
        const searchTerm = searchInput.value.toLowerCase();
        const minYearVal = parseInt(minYear.value) || 0;
        const maxYearVal = parseInt(maxYear.value) || 9999;
        const minAlbumVal = parseInt(minAlbum.value) || 0;
        const maxAlbumVal = parseInt(maxAlbum.value) || 9999;
        const minMembersVal = parseInt(minMembers.value) || 0;
        const maxMembersVal = parseInt(maxMembers.value) || 999;

        let visibleCount = 0;

        artistCards.forEach((card, index) => {
            const name = card.dataset.name.toLowerCase();
            const members = card.dataset.members.toLowerCase();
            const creation = parseInt(card.dataset.creation);
            const albumYear = parseInt(card.dataset.album.split('-')[2]); // Format: DD-MM-YYYY
            const memberCount = parseInt(card.dataset.memberCount);

            // Vérifier tous les critères
            const matchesSearch = name.includes(searchTerm) || members.includes(searchTerm);
            const matchesYear = creation >= minYearVal && creation <= maxYearVal;
            const matchesAlbum = albumYear >= minAlbumVal && albumYear <= maxAlbumVal;
            const matchesMembers = memberCount >= minMembersVal && memberCount <= maxMembersVal;

            if (matchesSearch && matchesYear && matchesAlbum && matchesMembers) {
                setTimeout(() => {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                }, visibleCount * 30);
                visibleCount++;
            } else {
                card.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    card.classList.add('hidden');
                }, 300);
            }
        });
    }

    // Écouter les événements de recherche et filtrage
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterArtists, 300));
        
        // Animation de focus sur l'input
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }

    [minYear, maxYear, minAlbum, maxAlbum, minMembers, maxMembers].forEach(input => {
        if (input) {
            input.addEventListener('input', debounce(filterArtists, 300));
        }
    });

    // Fonction debounce pour optimiser les performances
    function debounce(func, wait) {
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

    // Pas de parallax : les cartes restent droites au survol

    // Créer des particules décoratives
    function createParticles() {
        const header = document.querySelector('header');
        if (!header) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        `;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: linear-gradient(135deg, #6366f1, #ec4899);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.2};
                animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
        
        header.style.position = 'relative';
        header.insertBefore(particlesContainer, header.firstChild);
    }

    // Animation de scroll smooth
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Ajouter les styles d'animation manquants via CSS-in-JS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0);
            }
            25% {
                transform: translateY(-20px) translateX(10px);
            }
            50% {
                transform: translateY(-10px) translateX(-10px);
            }
            75% {
                transform: translateY(-25px) translateX(5px);
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
});
