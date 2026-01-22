// Langue courante
let currentBioLang = localStorage.getItem('preferredLang') || 'fr';

// Fonction pour afficher la biographie d'un artiste
function showBio(button) {
    const artistName = button.dataset.artist;
    const members = button.dataset.members.split(',').filter(m => m.trim());
    const year = button.dataset.year;
    
    populateBioModal(artistName, members, year);
}

// Nouvelle fonction pour afficher bio depuis le nom
function showBioFromName(name, membersString, year) {
    console.log('showBioFromName called:', name, membersString, year);
    const members = membersString.split(',').filter(m => m.trim());
    populateBioModal(name, members, year);
}

// Fonction pour afficher bio depuis le clic sur la carte
function showBioFromCard(element) {
    const card = element.closest('.artist-card');
    const name = card.dataset.name;
    const membersString = card.dataset.members;
    const year = card.dataset.creation;
    
    console.log('showBioFromCard called:', name, membersString, year);
    const members = membersString.split(',').filter(m => m.trim());
    populateBioModal(name, members, year);
}

// Fonction commune pour remplir la modal
function populateBioModal(artistName, members, year) {
    
    // Générer une biographie dynamique
    const bio = generateBio(artistName, year, members.length);
    
    // Remplir la modal
    document.getElementById('bioArtistName').textContent = artistName;
    document.getElementById('bioText').textContent = bio;
    
    // Traduire "Formé en" selon la langue
    const formedText = currentBioLang === 'en' ? `Formed in ${year}` : `Formé en ${year}`;
    document.getElementById('bioYear').textContent = formedText;
    
    // Remplir la liste des membres
    const membersList = document.getElementById('bioMembers');
    membersList.innerHTML = '';
    members.forEach(member => {
        if (member.trim()) {
            const li = document.createElement('li');
            li.textContent = member.trim();
            membersList.appendChild(li);
        }
    });
    
    // Afficher la modal
    const modal = document.getElementById('bioModal');
    modal.style.display = 'flex';
    
    // Animation d'entrée
    setTimeout(() => {
        modal.querySelector('.bio-modal-content').classList.add('show');
    }, 10);
}

// Générer une biographie dynamique basée sur l'artiste
function generateBio(name, year, memberCount) {
    const bios = {
        fr: {
            "Queen": `Queen est un groupe de rock britannique formé en 1970 à Londres. Avec Freddie Mercury au chant, Brian May à la guitare, Roger Taylor à la batterie et John Deacon à la basse, le groupe est devenu l'un des plus grands de l'histoire du rock. Leurs performances scéniques légendaires et leurs tubes intemporels comme "Bohemian Rhapsody", "We Will Rock You" et "We Are the Champions" ont marqué plusieurs générations.`,
            
            "Pink Floyd": `Pink Floyd est un groupe de rock progressif britannique formé en 1965 à Londres. Pionniers du rock psychédélique et progressif, ils sont connus pour leurs albums conceptuels comme "The Dark Side of the Moon" et "The Wall". Leurs spectacles visuels révolutionnaires et leur approche expérimentale de la musique en ont fait l'un des groupes les plus influents de tous les temps.`,
            
            "Soja": `SOJA (Soldiers of Jah Army) est un groupe de reggae américain formé en 1997 à Arlington, Virginie. Le groupe mélange reggae roots, rock et des influences latines. Connus pour leurs messages positifs et leur engagement social, ils ont tourné dans le monde entier et collaboré avec de nombreux artistes reggae légendaires.`,
            
            "Scorpions": `Scorpions est un groupe de hard rock allemand formé en 1965 à Hanovre. Pionniers du heavy metal européen, ils sont surtout connus pour leurs power ballades comme "Wind of Change" et leurs hymnes rock comme "Rock You Like a Hurricane". Le groupe a vendu plus de 100 millions d'albums dans le monde.`,
            
            "Gorillaz": `Gorillaz est un groupe formé en 1998. Composé de 3 membres, le groupe a marqué l'industrie musicale avec son style unique et ses performances mémorables. Au fil des années, ils ont conquis le cœur de millions de fans à travers le monde grâce à leur musique authentique et leurs concerts énergiques.`,
            
            "default": `${name} est ${memberCount === 1 ? 'un artiste' : 'un groupe'} formé en ${year}. ${memberCount > 1 ? `Composé de ${memberCount} membres, le groupe` : 'L\'artiste'} a marqué l'industrie musicale avec son style unique et ses performances mémorables. Au fil des années, ${memberCount > 1 ? 'ils ont' : 'il a'} conquis le cœur de millions de fans à travers le monde grâce à ${memberCount > 1 ? 'leur' : 'sa'} musique authentique et ${memberCount > 1 ? 'leurs' : 'ses'} concerts énergiques.`
        },
        en: {
            "Queen": `Queen is a British rock band formed in 1970 in London. With Freddie Mercury on vocals, Brian May on guitar, Roger Taylor on drums and John Deacon on bass, the band became one of the greatest in the history of rock. Their legendary stage performances and timeless hits like "Bohemian Rhapsody", "We Will Rock You" and "We Are the Champions" marked several generations.`,
            
            "Pink Floyd": `Pink Floyd is a British progressive rock band formed in 1965 in London. Pioneers of psychedelic and progressive rock, they are known for their concept albums like "The Dark Side of the Moon" and "The Wall". Their revolutionary visual shows and experimental approach to music made them one of the most influential bands of all time.`,
            
            "Soja": `SOJA (Soldiers of Jah Army) is an American reggae band formed in 1997 in Arlington, Virginia. The band blends roots reggae, rock and Latin influences. Known for their positive messages and social commitment, they have toured worldwide and collaborated with many legendary reggae artists.`,
            
            "Scorpions": `Scorpions is a German hard rock band formed in 1965 in Hanover. Pioneers of European heavy metal, they are best known for their power ballads like "Wind of Change" and rock anthems like "Rock You Like a Hurricane". The band has sold over 100 million albums worldwide.`,
            
            "Gorillaz": `Gorillaz is a band formed in 1998. Composed of 3 members, the group has marked the music industry with its unique style and memorable performances. Over the years, they have won the hearts of millions of fans around the world through their authentic music and energetic concerts.`,
            
            "default": `${name} is ${memberCount === 1 ? 'an artist' : 'a band'} formed in ${year}. ${memberCount > 1 ? `Composed of ${memberCount} members, the band` : 'The artist'} has marked the music industry with its unique style and memorable performances. Over the years, ${memberCount > 1 ? 'they have' : 'they have'} won the hearts of millions of fans around the world through ${memberCount > 1 ? 'their' : 'its'} authentic music and ${memberCount > 1 ? 'their' : 'its'} energetic concerts.`
        }
    };
    
    const lang = currentBioLang === 'en' ? 'en' : 'fr';
    const biosByLang = bios[lang];
    
    return biosByLang[name] || biosByLang.default;
}

// Fermer la modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bioModal');
    const closeBtn = document.querySelector('.bio-close');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            const content = modal.querySelector('.bio-modal-content');
            content.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        };
    }
    
    // Fermer en cliquant en dehors de la modal
    window.onclick = function(event) {
        if (event.target === modal) {
            const content = modal.querySelector('.bio-modal-content');
            content.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    };
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            const content = modal.querySelector('.bio-modal-content');
            content.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
});

// Mettre à jour la langue quand le bouton de langue est cliqué
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentBioLang = localStorage.getItem('preferredLang') || 'fr';
        });
    }
});