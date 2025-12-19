// Script pour la carte interactive des concerts
document.addEventListener('DOMContentLoaded', function() {
    const locationsData = document.getElementById('locations-data');
    if (!locationsData) return;

    const locationItems = locationsData.querySelectorAll('.location-item');
    if (locationItems.length === 0) return;

    // Initialiser la carte centrée sur le monde
    const map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([20, 0], 2);

    // Ajouter le fond de carte (thème sombre moderne)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Icône personnalisée pour les marqueurs
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin"></div>',
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -42]
    });

    const markers = [];
    const markerCoords = [];
    let geocodeQueue = [];
    
    // Fonction pour géocoder une adresse
    async function geocodeLocation(locationName) {
        try {
            // Nettoyer le nom de la location (retirer les underscores et formatter)
            const cleanLocation = locationName.replace(/_/g, ' ').replace(/-/g, ' ');
            
            // Utiliser l'API Nominatim d'OpenStreetMap pour le géocodage
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanLocation)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'GroupieTracker/1.0'
                    }
                }
            );
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    displayName: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error('Erreur de géocodage pour', locationName, ':', error);
            return null;
        }
    }

    // Fonction pour ajouter un marqueur
    function addMarker(location, coords, dates, index) {
        const marker = L.marker([coords.lat, coords.lon], { icon: customIcon }).addTo(map);
        markerCoords.push({ lat: coords.lat, lon: coords.lon, index: index });
        
        // Créer le contenu du popup avec images et design enrichi
        const datesArray = dates.split(',');
        const datesHtml = datesArray.map(date => `
            <li class="popup-date-item">
                <span class="date-icon">🎸</span>
                <span class="date-text">${date}</span>
            </li>
        `).join('');
        
        const popupContent = `
            <div class="map-popup">
                <div class="popup-header">
                    <h3>📍 ${location.replace(/_/g, ' ').replace(/-/g, ' ')}</h3>
                </div>
                <div class="popup-dates">
                    <strong>🎵 Concerts prévus:</strong>
                    <ul class="popup-dates-list">${datesHtml}</ul>
                </div>
                <div class="popup-footer">
                    <span class="popup-count">${datesArray.length} concert${datesArray.length > 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup enhanced-popup'
        });
        
        markers.push(marker);
        
        // Animation du marqueur
        marker.on('add', function() {
            setTimeout(() => {
                marker.getElement().classList.add('marker-animate');
            }, 100 * index);
        });
    }

    // Traiter toutes les locations
    async function processLocations() {
        const locations = Array.from(locationItems);
        
        for (let i = 0; i < locations.length; i++) {
            const item = locations[i];
            const location = item.dataset.location;
            const dates = item.dataset.dates;
            
            // Délai entre les requêtes pour respecter les limites de l'API
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const coords = await geocodeLocation(location);
            
            if (coords) {
                addMarker(location, coords, dates, i);
            }
        }
        
        // Tracer des lignes entre les concerts (tournée chronologique)
        if (markerCoords.length > 1) {
            const tourLine = markerCoords.map(coord => [coord.lat, coord.lon]);
            L.polyline(tourLine, {
                color: '#6366f1',
                weight: 2,
                opacity: 0.6,
                dashArray: '10, 10',
                className: 'tour-line'
            }).addTo(map);
        }
        
        // Ajuster la vue pour afficher tous les marqueurs
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Lancer le traitement
    processLocations();

    // Ajouter un loader pendant le chargement
    const mapElement = document.getElementById('map');
    const loader = document.createElement('div');
    loader.className = 'map-loader';
    loader.innerHTML = '<div class="loader-spinner"></div><p>Chargement de la carte...</p>';
    mapElement.appendChild(loader);

    // Retirer le loader après 2 secondes
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }, 2000);
});
