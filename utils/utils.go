package utils

// ParseID convertit une chaîne en entier de manière simple
func ParseID(id string) int {
	var result int
	for _, c := range id {
		if c >= '0' && c <= '9' {
			result = result*10 + int(c-'0')
		}
	}
	return result
}
