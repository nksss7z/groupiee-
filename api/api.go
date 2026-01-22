package api

import (
	"encoding/json"
	"io"
	"net/http"
	"sort"
	"strings"

	"groupieee/models"
)

var (
	Artists   []models.Artist
	Locations map[int]models.Location
	Dates     map[int]models.Dates
	Relations map[int]models.Relation
)

func LoadData() error {
	if err := fetchArtists(); err != nil {
		return err
	}
	if err := fetchLocations(); err != nil {
		return err
	}
	if err := fetchDates(); err != nil {
		return err
	}
	if err := fetchRelations(); err != nil {
		return err
	}

	sort.Slice(Artists, func(i, j int) bool {
		return strings.ToLower(Artists[i].Name) < strings.ToLower(Artists[j].Name)
	})

	return nil
}

func fetchArtists() error {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/artists")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, &Artists)
}

func fetchLocations() error {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/locations")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var data struct {
		Index []models.Location `json:"index"`
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		return err
	}

	Locations = make(map[int]models.Location)
	for _, loc := range data.Index {
		Locations[loc.ID] = loc
	}

	return nil
}

func fetchDates() error {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/dates")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var data struct {
		Index []models.Dates `json:"index"`
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		return err
	}

	Dates = make(map[int]models.Dates)
	for _, d := range data.Index {
		Dates[d.ID] = d
	}

	return nil
}

func fetchRelations() error {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/relation")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var data struct {
		Index []models.Relation `json:"index"`
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		return err
	}

	Relations = make(map[int]models.Relation)
	for _, rel := range data.Index {
		Relations[rel.ID] = rel
	}

	return nil
}
