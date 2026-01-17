package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/tomandrieu/blog-api/handlers"
	"github.com/tomandrieu/blog-api/services"
)

func main() {
	articlesDir := os.Getenv("ARTICLES_DIR")
	if articlesDir == "" {
		articlesDir = "/app/articles"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Get frontend URL for CORS (supports subdomain setup)
	frontendURL := os.Getenv("FRONTEND_URL")
	allowedOrigins := []string{"http://localhost:8000", "http://localhost:3000"}
	if frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}

	articleService := services.NewArticleService(articlesDir)
	articleHandler := handlers.NewArticleHandler(articleService)

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", handlers.HealthCheck)

		r.Get("/articles", articleHandler.ListArticles)
		r.Get("/articles/{slug}", articleHandler.GetArticle)
		r.Get("/articles/{slug}/", articleHandler.GetArticle)
		r.Get("/articles/{slug}/image/{filename}", articleHandler.ServeImage)

		r.Post("/refresh", articleHandler.RefreshCache)
	})

	log.Printf("Starting server on port %s", port)
	log.Printf("Articles directory: %s", articlesDir)
	log.Printf("CORS allowed origins: %v", allowedOrigins)

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
