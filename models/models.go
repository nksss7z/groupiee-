package models

type Artist struct {
	ID           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    string   `json:"locations"`
	ConcertDates string   `json:"concertDates"`
	Relations    string   `json:"relations"`
}

type Location struct {
	ID        int      `json:"id"`
	Locations []string `json:"locations"`
	Dates     string   `json:"dates"`
}

type Dates struct {
	ID    int      `json:"id"`
	Dates []string `json:"dates"`
}

type Relation struct {
	ID             int                 `json:"id"`
	DatesLocations map[string][]string `json:"datesLocations"`
}

type Ticket struct {
	ID         string  `json:"id"`
	ArtistID   int     `json:"artistId"`
	ArtistName string  `json:"artistName"`
	Location   string  `json:"location"`
	Date       string  `json:"date"`
	Price      float64 `json:"price"`
	TicketType string  `json:"ticketType"`
}

type Order struct {
	ID           string   `json:"id"`
	CustomerName string   `json:"customerName"`
	Email        string   `json:"email"`
	Tickets      []Ticket `json:"tickets"`
	TotalPrice   float64  `json:"totalPrice"`
	Status       string   `json:"status"` // "pending", "completed", "cancelled"
	CreatedAt    string   `json:"createdAt"`
}
