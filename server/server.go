package server

import (
	"fmt"
	"net/http"
	"path/filepath"

	"groupieee/handlers"
	"groupieee/utils"
)

// Start configure les routes et démarre le serveur HTTP
func Start(port string) error {
	// Configuration des routes
	http.HandleFunc("/", handlers.Home)
	http.HandleFunc("/artist", handlers.Artist)

	// Routes API pour le système de réservation
	http.HandleFunc("/api/order", handlers.CreateOrder)
	http.HandleFunc("/api/payment", handlers.ProcessPayment)

	// Servir les fichiers statiques
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Servir les fichiers assets (musique, etc.)
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))

	// Certificats de développement auto-signés (générés si manquants)
	certPath := filepath.FromSlash("certs/localhost.pem")
	keyPath := filepath.FromSlash("certs/localhost-key.pem")
	if err := utils.EnsureDevCert(certPath, keyPath); err != nil {
		// En cas d'échec, retomber en HTTP pour ne pas bloquer le dev
		fmt.Println("[WARN] TLS indisponible, bascule en HTTP:", err)
		fmt.Println("http://localhost" + port)
		return http.ListenAndServe(port, nil)
	}

	fmt.Println("https://localhost" + port)
	return http.ListenAndServeTLS(port, certPath, keyPath, nil)
}
