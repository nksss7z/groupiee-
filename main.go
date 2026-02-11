package main

import (
	"flag"
	"groupieee/api"
	"groupieee/server"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {

	flag.Parse()

	// 🔥 Récupérer le port Scalingo
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // pour le local uniquement
	}

	// Initialisation API
	api := api.New()

	// Démarrage serveur
	srv := server.New(api, port)

	go func() {
		log.Println("Server running on port", port)
		if err := srv.Start(); err != nil {
			log.Fatal(err)
		}
	}()

	// Gestion arrêt propre
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down server...")
	srv.Stop()
}
