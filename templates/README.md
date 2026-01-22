# Groupie Tracker

Application Go qui affiche les artistes, leurs informations et une carte des concerts.

## Prérequis
- Go 1.20+

## Lancement
`ash
go run main.go
` 
Puis ouvrez: http://localhost:8080

## Structure
- api/ chargement des données
- handlers/ routes HTTP
- templates/ pages HTML
- static/ CSS & JS

## Déploiement local
Le projet est prêt pour un reverse proxy (Nginx/Caddy). En dev, utilisez simplement le serveur Go.

