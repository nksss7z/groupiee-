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
