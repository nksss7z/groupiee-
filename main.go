package main

import (
	"groupieee/api"
	"groupieee/server"
)

func main() {
	api.LoadData()
	server.Start(":8080")
}
