package server

import (
	"fmt"
	"net/http"

	"groupieee/handlers"
)

// Start configure les routes et démarre le serveur HTTP
func Start(port string) error {
	// Configuration des routes
	http.HandleFunc("/", handlers.Home)
	http.HandleFunc("/artist", handlers.Artist)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	fmt.Println("http://localhost" + port)
	return http.ListenAndServe(port, nil)
}
