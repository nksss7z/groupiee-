package handlers

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"

	"groupieee/api"
	"groupieee/models"
	"groupieee/utils"
)

func Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, "Erreur de chargement de la page", http.StatusInternalServerError)
		return
	}

	data := struct {
		Artists []models.Artist
	}{
		Artists: api.Artists,
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Erreur d'affichage", http.StatusInternalServerError)
	}
}

func Artist(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	var artist *models.Artist
	var artistRelation *models.Relation

	artistID := utils.ParseID(id)
	for i := range api.Artists {
		if api.Artists[i].ID == artistID {
			artist = &api.Artists[i]
			break
		}
	}

	if artist == nil {
		http.NotFound(w, r)
		return
	}

	if rel, ok := api.Relations[artist.ID]; ok {
		artistRelation = &rel
	}

	tmpl, err := template.ParseFiles("templates/artist.html")
	if err != nil {
		http.Error(w, "Erreur de chargement de la page", http.StatusInternalServerError)
		return
	}

	data := struct {
		Artist   *models.Artist
		Relation *models.Relation
	}{
		Artist:   artist,
		Relation: artistRelation,
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Erreur d'affichage", http.StatusInternalServerError)
	}
}

var orders = make(map[string]models.Order)

func CreateOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var order models.Order
	err := json.NewDecoder(r.Body).Decode(&order)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	order.ID = fmt.Sprintf("ORD-%d", time.Now().Unix())
	order.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	order.Status = "pending"

	totalPrice := 0.0
	for _, ticket := range order.Tickets {
		totalPrice += ticket.Price
	}
	order.TotalPrice = totalPrice

	orders[order.ID] = order

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

func ProcessPayment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var paymentData struct {
		OrderID    string `json:"orderId"`
		CardNumber string `json:"cardNumber"`
		CardExpiry string `json:"cardExpiry"`
		CardCVV    string `json:"cardCvv"`
	}

	err := json.NewDecoder(r.Body).Decode(&paymentData)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	order, exists := orders[paymentData.OrderID]
	if !exists {
		http.Error(w, "Commande introuvable", http.StatusNotFound)
		return
	}

	if len(paymentData.CardNumber) != 16 || len(paymentData.CardCVV) != 3 {
		http.Error(w, "Données de carte invalides", http.StatusBadRequest)
		return
	}

	order.Status = "completed"
	orders[paymentData.OrderID] = order

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Paiement effectué avec succès",
		"order":   order,
	})
}

func ProcessPayPalPayment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var paymentData struct {
		OrderID       string                 `json:"orderId"`
		PayPalOrderID string                 `json:"paypalOrderId"`
		PayPalDetails map[string]interface{} `json:"paypalDetails"`
	}

	err := json.NewDecoder(r.Body).Decode(&paymentData)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	order, exists := orders[paymentData.OrderID]
	if !exists {
		http.Error(w, "Commande introuvable", http.StatusNotFound)
		return
	}

	if paymentData.PayPalOrderID == "" {
		http.Error(w, "ID de transaction PayPal manquant", http.StatusBadRequest)
		return
	}

	order.Status = "completed"
	orders[paymentData.OrderID] = order

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Paiement PayPal effectué avec succès",
		"order":   order,
	})
}

// Gestion des comptes bancaires
var bankAccounts = make(map[string]models.BankAccount)

func SetupBankAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var bankAccount models.BankAccount
	err := json.NewDecoder(r.Body).Decode(&bankAccount)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	if bankAccount.IBAN == "" || bankAccount.AccountHolder == "" {
		http.Error(w, "IBAN et nom du titulaire requis", http.StatusBadRequest)
		return
	}

	bankAccount.ID = utils.GenerateID()
	bankAccount.CreatedAt = time.Now().Format(time.RFC3339)
	bankAccount.UpdatedAt = time.Now().Format(time.RFC3339)

	if bankAccount.Currency == "" {
		bankAccount.Currency = "EUR"
	}

	bankAccounts[bankAccount.ID] = bankAccount

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Compte bancaire configuré avec succès",
		"account": bankAccount,
	})
}

func GetBankAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	if len(bankAccounts) == 0 {
		http.Error(w, "Aucun compte bancaire configuré", http.StatusNotFound)
		return
	}

	var account models.BankAccount
	for _, acc := range bankAccounts {
		if acc.IsDefault {
			account = acc
			break
		}
	}

	if account.ID == "" {
		for _, acc := range bankAccounts {
			account = acc
			break
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(account)
}

// Gestion des paiements
var payments = make(map[string]models.Payment)

func ProcessBankTransfer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		OrderID string `json:"orderId"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	order, exists := orders[req.OrderID]
	if !exists {
		http.Error(w, "Commande non trouvée", http.StatusNotFound)
		return
	}

	if len(bankAccounts) == 0 {
		http.Error(w, "Aucun compte bancaire configuré", http.StatusInternalServerError)
		return
	}

	var account models.BankAccount
	for _, acc := range bankAccounts {
		account = acc
		break
	}

	payment := models.Payment{
		ID:            utils.GenerateID(),
		OrderID:       req.OrderID,
		Amount:        order.TotalPrice,
		Currency:      account.Currency,
		Status:        "pending",
		PaymentMethod: "bank_transfer",
		BankAccountID: account.ID,
		CreatedAt:     time.Now().Format(time.RFC3339),
	}

	payments[payment.ID] = payment
	order.PaymentID = payment.ID
	orders[req.OrderID] = order

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Paiement par virement bancaire initié",
		"payment": payment,
		"bankAccount": map[string]string{
			"iban":           account.IBAN,
			"bic":            account.BIC,
			"accountHolder":  account.AccountHolder,
			"bankName":       account.BankName,
			"amount":         fmt.Sprintf("%.2f", order.TotalPrice),
			"currency":       account.Currency,
			"orderReference": req.OrderID,
		},
	})
}

func ConfirmBankTransfer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		PaymentID string `json:"paymentId"`
		OrderID   string `json:"orderId"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	payment, exists := payments[req.PaymentID]
	if !exists {
		http.Error(w, "Paiement non trouvé", http.StatusNotFound)
		return
	}

	payment.Status = "completed"
	payment.CompletedAt = time.Now().Format(time.RFC3339)
	payments[req.PaymentID] = payment

	order, exists := orders[req.OrderID]
	if exists {
		order.Status = "completed"
		orders[req.OrderID] = order
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Paiement confirmé avec succès",
		"payment": payment,
	})
}
