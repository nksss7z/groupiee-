package server

import (
	"fmt"
	"net/http"
	"path/filepath"

	"groupieee/handlers"
	"groupieee/utils"
)

func Start(port string) error {
	http.HandleFunc("/", handlers.Home)
	http.HandleFunc("/artist", handlers.Artist)

	http.HandleFunc("/api/order", handlers.CreateOrder)
	http.HandleFunc("/api/payment", handlers.ProcessPayment)
	http.HandleFunc("/api/payment/paypal", handlers.ProcessPayPalPayment)

	// Servir les fichiers statiques
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))

	certPath := filepath.FromSlash("certs/localhost.pem")
	keyPath := filepath.FromSlash("certs/localhost-key.pem")
	if err := utils.EnsureDevCert(certPath, keyPath); err != nil {
		fmt.Println("[WARN] TLS indisponible, bascule en HTTP:", err)
		fmt.Println("http://localhost" + port)
		return http.ListenAndServe(port, nil)
	}

	fmt.Println("https://localhost" + port)
	return http.ListenAndServeTLS(port, certPath, keyPath, nil)
}
