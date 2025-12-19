// Génère les rubans d'images d'artistes en arrière-plan
(function() {
    const container = document.querySelector('.api-ribbons');
    if (!container) return;

    const ribbons = Array.from(container.querySelectorAll('.api-ribbon'));
    if (!ribbons.length) return;

    const source = document.getElementById('artist-names');
    const rawImages = (source && source.dataset.images) ? source.dataset.images.split('|').map(s => s.trim()).filter(Boolean) : [];
    const fallback = [
        'https://via.placeholder.com/400x500.png?text=Artist',
        'https://via.placeholder.com/400x500.png?text=Band',
        'https://via.placeholder.com/400x500.png?text=Live',
        'https://via.placeholder.com/400x500.png?text=Tour'
    ];
    const images = rawImages.length ? rawImages : fallback;

    ribbons.forEach((ribbon) => {
        ribbon.innerHTML = '';

        // Crée deux pistes pour un défilement continu
        for (let i = 0; i < 2; i++) {
            const track = document.createElement('div');
            track.className = 'ribbon-track';
            if (i === 1) track.style.top = '100%';

            images.forEach((src) => {
                const img = document.createElement('img');
                img.className = 'ribbon-img';
                img.src = src;
                img.alt = 'Artist image';
                track.appendChild(img);
            });

            ribbon.appendChild(track);
        }

        // Ajuster la vitesse selon les classes
        const tracks = ribbon.querySelectorAll('.ribbon-track');
        if (ribbon.classList.contains('fast')) {
            tracks.forEach(t => t.style.animationDuration = '12s');
        } else if (ribbon.classList.contains('slow')) {
            tracks.forEach(t => t.style.animationDuration = '22s');
        }
        if (ribbon.classList.contains('reverse')) {
            tracks.forEach(t => t.style.animationName = 'api-scroll-rev');
        }
    });
})();
