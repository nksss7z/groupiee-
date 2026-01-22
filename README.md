# Groupie Tracker

Application web de consultation d'artistes et de leurs tournées.

Le site permet de parcourir une liste d'artistes musicaux avec leurs informations détaillées (membres, année de création, albums). Chaque artiste dispose d'une page dédiée affichant ses concerts sur une carte interactive. L'application propose également un système de réservation de places, un mode sombre, et la possibilité de marquer des artistes en favoris.

## Installation

```bash
git clone <votre-repo>
cd groupieee
go run main.go
```

Ouvrir https://localhost:8080

## Technologies

Go, HTML, CSS, JavaScript, Leaflet.js

## Structure

```
groupieee/
├── main.go
├── api/
├── handlers/
├── models/
├── server/
├── utils/
├── static/
├── templates/
└── certs/
```

## Notes

Le certificat SSL est auto-signé, votre navigateur affichera un avertissement de sécurité.



