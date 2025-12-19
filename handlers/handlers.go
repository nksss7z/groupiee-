package handlers

import (
	"html/template"
	"net/http"

	"groupieee/api"
	"groupieee/models"
	"groupieee/utils"
)

// Home affiche la page d'accueil avec la liste des artistes
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

// Artist affiche la page de détail d'un artiste
func Artist(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	var artist *models.Artist
	var artistRelation *models.Relation

	// Rechercher l'artiste
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

	// Récupérer les relations
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
