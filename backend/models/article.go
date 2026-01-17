package models

import "time"

type Article struct {
	Slug        string    `json:"slug"`
	Title       string    `json:"title"`
	Excerpt     string    `json:"excerpt"`
	Content     string    `json:"content,omitempty"`
	CoverImage  string    `json:"coverImage"`
	PublishedAt time.Time `json:"publishedAt"`
	ReadingTime int       `json:"readingTime"`
}

type ArticleListResponse struct {
	Articles   []Article  `json:"articles"`
	Pagination Pagination `json:"pagination"`
}

type ArticleResponse struct {
	Article Article `json:"article"`
}

type Pagination struct {
	Page       int  `json:"page"`
	Limit      int  `json:"limit"`
	Total      int  `json:"total"`
	TotalPages int  `json:"totalPages"`
	HasNext    bool `json:"hasNext"`
	HasPrev    bool `json:"hasPrev"`
}
