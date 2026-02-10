package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Initialize Gin router
	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Initialize services
	authService := NewAuthService()
	gmailService := NewGmailService()
	subscriptionService := NewSubscriptionService()

	// Auth routes
	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/google", authService.GoogleSignIn)
		authGroup.GET("/google/login", authService.GoogleLoginRedirect)
		authGroup.GET("/google/callback", authService.GoogleLoginCallback)
	}

	// Gmail routes (protected)
	gmailGroup := r.Group("/api/gmail")
	gmailGroup.Use(AuthMiddleware())
	{
		gmailGroup.POST("/connect", gmailService.InitiateConnection)
		gmailGroup.POST("/callback", gmailService.HandleCallback)
		gmailGroup.POST("/scan", gmailService.ScanEmails)
		gmailGroup.DELETE("/disconnect", gmailService.Disconnect)
	}

	// Gmail redirect routes (no auth required for flow)
	r.GET("/api/gmail/connect/redirect", gmailService.InitiateConnectionRedirect)
	r.GET("/api/gmail/callback/redirect", gmailService.HandleCallbackRedirect)

	// Subscription routes (protected)
	subGroup := r.Group("/api/subscriptions")
	subGroup.Use(AuthMiddleware())
	{
		subGroup.GET("", subscriptionService.GetSubscriptions)
		subGroup.GET("/:id", subscriptionService.GetSubscription)
		subGroup.DELETE("/:id", subscriptionService.DeleteSubscription)
	}

	// Health check (add to /api prefix too)
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}