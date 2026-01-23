# Guide - Configuration des Paiements par Virement Bancaire

## Vue d'ensemble

Ce système permet aux artistes de configurer un compte bancaire pour recevoir les paiements des clients via virement bancaire.

## Architecture

### Modèles

#### 1. **BankAccount** - Compte bancaire
```json
{
  "id": "unique-id",
  "accountHolder": "Nom du titulaire",
  "iban": "FR7628233000018469873551525",
  "bic": "SOFRFRPP",
  "bankName": "Société Générale",
  "currency": "EUR",
  "isDefault": true,
  "createdAt": "2026-01-23T10:00:00Z",
  "updatedAt": "2026-01-23T10:00:00Z"
}
```

#### 2. **Payment** - Détails du paiement
```json
{
  "id": "payment-id",
  "orderId": "order-id",
  "amount": 150.00,
  "currency": "EUR",
  "status": "pending",
  "paymentMethod": "bank_transfer",
  "bankAccountId": "bank-account-id",
  "createdAt": "2026-01-23T10:00:00Z",
  "completedAt": null
}
```

#### 3. **Order** - Commande mise à jour
```json
{
  "id": "order-id",
  "customerName": "Client",
  "email": "client@example.com",
  "tickets": [...],
  "totalPrice": 150.00,
  "status": "pending",
  "paymentId": "payment-id",
  "createdAt": "2026-01-23T10:00:00Z"
}
```

## API Endpoints

### 1. Configuration du Compte Bancaire

**POST** `/api/bank-account/setup`

Ajouter ou configurer un compte bancaire.

**Request:**
```json
{
  "accountHolder": "Nom du titulaire",
  "iban": "FR1420041010050500013M02606",
  "bic": "SOFRFRPP",
  "bankName": "Société Générale",
  "currency": "EUR",
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compte bancaire configuré avec succès",
  "account": {
    "id": "123456",
    "accountHolder": "Nom du titulaire",
    "iban": "FR1420041010050500013M02606",
    "bic": "SOFRFRPP",
    "bankName": "Société Générale",
    "currency": "EUR",
    "isDefault": true,
    "createdAt": "2026-01-23T10:00:00Z",
    "updatedAt": "2026-01-23T10:00:00Z"
  }
}
```

---

### 2. Récupérer le Compte Bancaire

**GET** `/api/bank-account`

Récupère le compte bancaire par défaut ou le premier compte configuré.

**Response:**
```json
{
  "id": "123456",
  "accountHolder": "Nom du titulaire",
  "iban": "FR1420041010050500013M02606",
  "bic": "SOFRFRPP",
  "bankName": "Société Générale",
  "currency": "EUR",
  "isDefault": true,
  "createdAt": "2026-01-23T10:00:00Z",
  "updatedAt": "2026-01-23T10:00:00Z"
}
```

---

### 3. Initier un Virement Bancaire

**POST** `/api/payment/bank-transfer`

Crée une demande de paiement par virement bancaire.

**Request:**
```json
{
  "orderId": "order-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Paiement par virement bancaire initié",
  "payment": {
    "id": "payment-001",
    "orderId": "order-12345",
    "amount": 150.00,
    "currency": "EUR",
    "status": "pending",
    "paymentMethod": "bank_transfer",
    "bankAccountId": "123456",
    "createdAt": "2026-01-23T10:00:00Z",
    "completedAt": null
  },
  "bankAccount": {
    "iban": "FR1420041010050500013M02606",
    "bic": "SOFRFRPP",
    "accountHolder": "Nom du titulaire",
    "bankName": "Société Générale",
    "amount": "150.00",
    "currency": "EUR",
    "orderReference": "order-12345"
  }
}
```

---

### 4. Confirmer un Virement Bancaire

**POST** `/api/payment/confirm-transfer`

Confirme que le virement a été effectué.

**Request:**
```json
{
  "paymentId": "payment-001",
  "orderId": "order-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Paiement confirmé avec succès",
  "payment": {
    "id": "payment-001",
    "orderId": "order-12345",
    "amount": 150.00,
    "currency": "EUR",
    "status": "completed",
    "paymentMethod": "bank_transfer",
    "bankAccountId": "123456",
    "createdAt": "2026-01-23T10:00:00Z",
    "completedAt": "2026-01-23T10:05:00Z"
  }
}
```

---

## Flux Complet

### 1. Configuration Initiale (une seule fois)

```bash
curl -X POST https://localhost:8080/api/bank-account/setup \
  -H "Content-Type: application/json" \
  -d '{
    "accountHolder": "Artist Name",
    "iban": "FR1420041010050500013M02606",
    "bic": "SOFRFRPP",
    "bankName": "Société Générale",
    "currency": "EUR",
    "isDefault": true
  }'
```

### 2. Client Crée une Commande

Le client achète des tickets et crée une commande via `/api/order`.

### 3. Client Demande le Paiement par Virement

```bash
curl -X POST https://localhost:8080/api/payment/bank-transfer \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-12345"
  }'
```

Le client reçoit les coordonnées bancaires et la référence de commande.

### 4. Client Effectue le Virement

Le client effectue le virement avec:
- **IBAN**: FR1420041010050500013M02606
- **BIC**: SOFRFRPP
- **Bénéficiaire**: Artist Name
- **Montant**: 150.00 EUR
- **Libellé**: Référence de commande (ex: order-12345)

### 5. Confirmation du Paiement

Après réception du virement, confirmer:

```bash
curl -X POST https://localhost:8080/api/payment/confirm-transfer \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment-001",
    "orderId": "order-12345"
  }'
```

---

## Schéma de Stockage

Les données sont stockées en mémoire (maps Go):
- `bankAccounts`: Stocke les comptes bancaires configurés
- `payments`: Stocke l'historique des paiements
- `orders`: Stocke les commandes avec statut de paiement

**Pour une mise en production**, intégrez une base de données (PostgreSQL, MongoDB, etc.)

---

## Sécurité

### À Implémenter

1. **Authentification**: Ajouter une authentification pour sécuriser les endpoints de configuration bancaire
2. **Chiffrement**: Chiffrer l'IBAN en base de données
3. **Validation**: Valider les IBAN avec des règles internacionales
4. **Logs**: Logger tous les paiements pour l'audit
5. **HTTPS**: Utilisé par défaut dans ce projet

---

## Exemple d'Intégration Frontend

```javascript
// 1. Récupérer les coordonnées bancaires
async function getPaymentDetails(orderId) {
  const response = await fetch('/api/payment/bank-transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  });
  return response.json();
}

// 2. Afficher les détails au client
function displayBankTransferInfo(payment) {
  console.log(`Virement vers: ${payment.bankAccount.accountHolder}`);
  console.log(`IBAN: ${payment.bankAccount.iban}`);
  console.log(`BIC: ${payment.bankAccount.bic}`);
  console.log(`Montant: ${payment.bankAccount.amount} ${payment.bankAccount.currency}`);
  console.log(`Référence: ${payment.bankAccount.orderReference}`);
}

// 3. Confirmer après virement
async function confirmTransfer(paymentId, orderId) {
  const response = await fetch('/api/payment/confirm-transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, orderId })
  });
  return response.json();
}
```

---

## Statuts de Paiement

- **pending**: Paiement en attente de confirmation
- **completed**: Paiement confirmé reçu
- **failed**: Paiement échoué

---

## Améliorations Futures

1. Supporter plusieurs comptes bancaires
2. Support multi-devises
3. Intégration avec API bancaires pour confirmation automatique
4. Notifications par email
5. Historique des transactions
6. Dashboard de suivi des paiements
