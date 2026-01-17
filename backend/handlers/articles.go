package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/tomandrieu/blog-api/models"
	"github.com/tomandrieu/blog-api/services"
)

// validSlugPattern matches only safe slug characters (lowercase alphanumeric and hyphens)
var validSlugPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$`)

type ArticleHandler struct {
	service *services.ArticleService
}

func NewArticleHandler(service *services.ArticleService) *ArticleHandler {
	return &ArticleHandler{service: service}
}

func (h *ArticleHandler) ListArticles(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 50 {
		limit = 6
	}

	// Get language filter from query param, default to "fr"
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "fr"
	}

	response := h.service.GetArticles(page, limit, lang)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	slug = strings.TrimSuffix(slug, "/")

	// Get language from query param, default to "fr"
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "fr"
	}

	article := h.service.GetArticle(slug, lang)
	if article == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Article not found"})
		return
	}

	response := models.ArticleResponse{Article: *article}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ArticleHandler) ServeImage(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	filename := chi.URLParam(r, "filename")

	slug = strings.TrimSuffix(slug, "/")
	filename = filepath.Base(filename)

	// Validate slug contains only safe characters (prevents path traversal)
	if !validSlugPattern.MatchString(slug) {
		http.NotFound(w, r)
		return
	}

	imagePath := h.service.GetImagePath(slug, filename)

	// Path containment check: ensure resolved path is within articles directory
	absPath, err := filepath.Abs(imagePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	absArticlesDir, err := filepath.Abs(h.service.GetArticlesDir())
	if err != nil {
		http.NotFound(w, r)
		return
	}

	// Ensure the path starts with the articles directory (with separator to prevent prefix attacks)
	if !strings.HasPrefix(absPath, absArticlesDir+string(filepath.Separator)) {
		http.NotFound(w, r)
		return
	}

	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		http.NotFound(w, r)
		return
	}

	ext := strings.ToLower(filepath.Ext(filename))
	contentTypes := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
		".svg":  "image/svg+xml",
	}

	if ct, ok := contentTypes[ext]; ok {
		w.Header().Set("Content-Type", ct)
	}

	w.Header().Set("Cache-Control", "public, max-age=31536000")
	http.ServeFile(w, r, imagePath)
}

func (h *ArticleHandler) RefreshCache(w http.ResponseWriter, r *http.Request) {
	if err := h.service.RefreshCache(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "cache refreshed"})
}
