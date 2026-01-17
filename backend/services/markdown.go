package services

import (
	"bytes"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/tomandrieu/blog-api/models"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"go.abhg.dev/goldmark/frontmatter"
)

type Frontmatter struct {
	Title       string `yaml:"title"`
	Excerpt     string `yaml:"excerpt"`
	CoverImage  string `yaml:"coverImage"`
	PublishedAt string `yaml:"publishedAt"`
	Draft       bool   `yaml:"draft"`
}

type ArticleService struct {
	articlesDir string
	cache       []models.Article
	cacheMu     sync.RWMutex
	md          goldmark.Markdown
}

func NewArticleService(articlesDir string) *ArticleService {
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			extension.Typographer,
			&frontmatter.Extender{},
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithHardWraps(),
			html.WithXHTML(),
			html.WithUnsafe(),
		),
	)

	svc := &ArticleService{
		articlesDir: articlesDir,
		md:          md,
	}

	svc.RefreshCache()
	return svc
}

func (s *ArticleService) RefreshCache() error {
	entries, err := os.ReadDir(s.articlesDir)
	if err != nil {
		return err
	}

	var articles []models.Article

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		slug := entry.Name()
		indexPath := filepath.Join(s.articlesDir, slug, "index.md")

		content, err := os.ReadFile(indexPath)
		if err != nil {
			continue
		}

		article, err := s.parseArticle(slug, content)
		if err != nil {
			continue
		}

		articles = append(articles, article)
	}

	sort.Slice(articles, func(i, j int) bool {
		return articles[i].PublishedAt.After(articles[j].PublishedAt)
	})

	s.cacheMu.Lock()
	s.cache = articles
	s.cacheMu.Unlock()

	return nil
}

func (s *ArticleService) parseArticle(slug string, content []byte) (models.Article, error) {
	var buf bytes.Buffer
	ctx := parser.NewContext()

	if err := s.md.Convert(content, &buf, parser.WithContext(ctx)); err != nil {
		return models.Article{}, err
	}

	fm := frontmatter.Get(ctx)
	var meta Frontmatter
	if fm != nil {
		if err := fm.Decode(&meta); err != nil {
			return models.Article{}, err
		}
	}

	if meta.Draft {
		return models.Article{}, nil
	}

	publishedAt, _ := time.Parse("2006-01-02", meta.PublishedAt)

	coverImage := ""
	if meta.CoverImage != "" {
		coverImage = "/api/articles/" + slug + "/image/" + meta.CoverImage
	}

	readingTime := calculateReadingTime(string(content))

	return models.Article{
		Slug:        slug,
		Title:       meta.Title,
		Excerpt:     meta.Excerpt,
		Content:     buf.String(),
		CoverImage:  coverImage,
		PublishedAt: publishedAt,
		ReadingTime: readingTime,
	}, nil
}

func calculateReadingTime(content string) int {
	words := 0
	inWord := false

	for _, r := range content {
		if unicode.IsLetter(r) || unicode.IsNumber(r) {
			if !inWord {
				words++
				inWord = true
			}
		} else {
			inWord = false
		}
	}

	minutes := words / 200
	if minutes < 1 {
		minutes = 1
	}
	return minutes
}

func (s *ArticleService) GetArticles(page, limit int) models.ArticleListResponse {
	s.cacheMu.RLock()
	defer s.cacheMu.RUnlock()

	total := len(s.cache)
	totalPages := (total + limit - 1) / limit

	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		return models.ArticleListResponse{
			Articles: []models.Article{},
			Pagination: models.Pagination{
				Page:       page,
				Limit:      limit,
				Total:      total,
				TotalPages: totalPages,
				HasNext:    false,
				HasPrev:    page > 1,
			},
		}
	}

	if end > total {
		end = total
	}

	articles := make([]models.Article, end-start)
	for i, article := range s.cache[start:end] {
		articles[i] = models.Article{
			Slug:        article.Slug,
			Title:       article.Title,
			Excerpt:     article.Excerpt,
			CoverImage:  article.CoverImage,
			PublishedAt: article.PublishedAt,
			ReadingTime: article.ReadingTime,
		}
	}

	return models.ArticleListResponse{
		Articles: articles,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    end < total,
			HasPrev:    page > 1,
		},
	}
}

func (s *ArticleService) GetArticle(slug string) *models.Article {
	s.cacheMu.RLock()
	defer s.cacheMu.RUnlock()

	slug = strings.TrimSuffix(slug, "/")

	for _, article := range s.cache {
		if article.Slug == slug {
			return &article
		}
	}

	return nil
}

func (s *ArticleService) GetImagePath(slug, filename string) string {
	return filepath.Join(s.articlesDir, slug, filename)
}
