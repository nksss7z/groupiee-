let currentBooking = {
    artistId: null,
    artistName: '',
    location: '',
    date: '',
    tickets: []
};

let currentOrderId = null;

document.addEventListener('DOMContentLoaded', function() {
    const bookButtons = document.querySelectorAll('.btn-book-ticket');
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const artistId = this.getAttribute('data-artist-id');
            const artistName = this.getAttribute('data-artist');
            const location = this.getAttribute('data-location');
            const date = this.getAttribute('data-date');
            
            openBookingModal(artistId, artistName, location, date);
        });
    });

    const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
    const ticketQuantities = document.querySelectorAll('.ticket-quantity');
    
    ticketCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const type = this.getAttribute('data-type');
            const quantity = document.querySelector(`.ticket-quantity[data-type="${type}"]`);
            if (this.checked) {
                quantity.value = 1;
            } else {
                quantity.value = 0;
            }
            updateTotalPrice();
        });
    });

    ticketQuantities.forEach(quantity => {
        quantity.addEventListener('input', function() {
            const type = this.getAttribute('data-type');
            const checkbox = document.querySelector(`.ticket-checkbox[data-type="${type}"]`);
            if (parseInt(this.value) > 0) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            updateTotalPrice();
        });
    });

    document.getElementById('proceedToPayment').addEventListener('click', function() {
        if (validateBooking()) {
            createOrder();
        }
    });

    document.getElementById('confirmPayment').addEventListener('click', function() {
        if (validatePayment()) {
            processPayment();
        }
    });

    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeAllModals();
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    formatPaymentFields();
});

function openBookingModal(artistId, artistName, location, date) {
    currentBooking.artistId = parseInt(artistId);
    currentBooking.artistName = artistName;
    currentBooking.location = location;
    currentBooking.date = date;

    document.getElementById('modalArtist').textContent = artistName;
    document.getElementById('modalLocation').textContent = location;
    document.getElementById('modalDate').textContent = date;

    document.querySelectorAll('.ticket-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.ticket-quantity').forEach(q => q.value = 0);
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    updateTotalPrice();

    document.getElementById('bookingModal').style.display = 'block';
}

function updateTotalPrice() {
    let total = 0;
    const quantities = document.querySelectorAll('.ticket-quantity');
    
    quantities.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const type = input.getAttribute('data-type');
        const checkbox = document.querySelector(`.ticket-checkbox[data-type="${type}"]`);
        const price = parseFloat(checkbox.getAttribute('data-price'));
        
        total += quantity * price;
    });

    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

function validateBooking() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const total = parseFloat(document.getElementById('totalPrice').textContent);

    if (!name) {
        alert('Veuillez entrer votre nom');
        return false;
    }

    if (!email || !email.includes('@')) {
        alert('Veuillez entrer une adresse email valide');
        return false;
    }

    if (total === 0) {
        alert('Veuillez sélectionner au moins un billet');
        return false;
    }

    return true;
}

function validatePayment() {
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();

    if (!cardNumber || cardNumber.length !== 16) {
        alert('Veuillez entrer un numéro de carte valide (16 chiffres)');
        return false;
    }

    if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        alert('Veuillez entrer une date d\'expiration valide (MM/AA)');
        return false;
    }

    if (!cardCVV || cardCVV.length !== 3) {
        alert('Veuillez entrer un CVV valide (3 chiffres)');
        return false;
    }

    return true;
}

async function createOrder() {
    const tickets = [];
    const quantities = document.querySelectorAll('.ticket-quantity');

    quantities.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            const type = input.getAttribute('data-type');
            const checkbox = document.querySelector(`.ticket-checkbox[data-type="${type}"]`);
            const price = parseFloat(checkbox.getAttribute('data-price'));

            for (let i = 0; i < quantity; i++) {
                tickets.push({
                    artistId: currentBooking.artistId,
                    artistName: currentBooking.artistName,
                    location: currentBooking.location,
                    date: currentBooking.date,
                    price: price,
                    ticketType: type
                });
            }
        }
    });

    const orderData = {
        customerName: document.getElementById('customerName').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        tickets: tickets
    };

    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            currentOrderId = order.id;
            
            document.getElementById('bookingModal').style.display = 'none';
            document.getElementById('paymentAmount').textContent = order.totalPrice.toFixed(2);
            document.getElementById('paymentModal').style.display = 'block';
        } else {
            alert('Erreur lors de la création de la commande');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

function initPayPalButtons(order) {
}

async function processPayment() {
    const paymentData = {
        orderId: currentOrderId,
        cardNumber: document.getElementById('cardNumber').value.trim(),
        cardExpiry: document.getElementById('cardExpiry').value.trim(),
        cardCvv: document.getElementById('cardCVV').value.trim()
    };

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (response.ok) {
            const result = await response.json();
            
            // Afficher la confirmation
            document.getElementById('paymentModal').style.display = 'none';
            document.getElementById('confirmEmail').textContent = result.order.email;
            document.getElementById('orderId').textContent = result.order.id;
            document.getElementById('confirmationModal').style.display = 'block';
        } else {
            alert('Erreur lors du traitement du paiement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

function closeAllModals() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'none';
    
    // Réinitialiser les champs de paiement
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCVV').value = '';
}

function formatPaymentFields() {
    // Formater automatiquement le numéro de carte
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Formater la date d'expiration
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    // Formater le CVV
    const cardCVVInput = document.getElementById('cardCVV');
    if (cardCVVInput) {
        cardCVVInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });
    }
}

