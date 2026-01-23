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
	PaymentID    string   `json:"paymentId"`
}

type BankAccount struct {
	ID            string `json:"id"`
	AccountHolder string `json:"accountHolder"`
	IBAN          string `json:"iban"`
	BIC           string `json:"bic"`
	BankName      string `json:"bankName"`
	Currency      string `json:"currency"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
	IsDefault     bool   `json:"isDefault"`
}

type Payment struct {
	ID            string  `json:"id"`
	OrderID       string  `json:"orderId"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	Status        string  `json:"status"`        // "pending", "completed", "failed"
	PaymentMethod string  `json:"paymentMethod"` // "bank_transfer", "card"
	BankAccountID string  `json:"bankAccountId"`
	CreatedAt     string  `json:"createdAt"`
	CompletedAt   string  `json:"completedAt"`
}
