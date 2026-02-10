package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

type GmailService struct {
	config *oauth2.Config
}

type ConnectRequest struct {
	Email       string `json:"email" binding:"required"`
	RedirectURI string `json:"redirectUri" binding:"required"`
}

type ConnectResponse struct {
	AuthURL string `json:"authUrl"`
	State   string `json:"state"`
}

type CallbackRequest struct {
	Code  string `json:"code" binding:"required"`
	State string `json:"state" binding:"required"`
}

type CallbackResponse struct {
	Success            bool   `json:"success"`
	Email              string `json:"email"`
	SubscriptionsFound int    `json:"subscriptionsFound"`
}

func NewGmailService() *GmailService {
	config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GMAIL_REDIRECT_URL"), // http://localhost:3000/gmail-callback
		Scopes: []string{
			gmail.GmailReadonlyScope,
		},
		Endpoint: google.Endpoint,
	}

	return &GmailService{
		config: config,
	}
}

// InitiateConnection starts the Gmail OAuth flow
func (s *GmailService) InitiateConnection(c *gin.Context) {
	var req ConnectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from context (set by AuthMiddleware)
	userID := c.GetString("user_id")
	
	// Generate state token that includes user_id and email
	state := generateState(userID, req.Email)
	
	// Generate OAuth URL with backend callback
	authURL := s.config.AuthCodeURL(state, 
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)

	// Store state in session/cache for verification
	// storeState(userID, state)

	c.JSON(http.StatusOK, ConnectResponse{
		AuthURL: authURL,
		State:   state,
	})
}

// InitiateConnectionRedirect starts the Gmail OAuth flow with redirect
func (s *GmailService) InitiateConnectionRedirect(c *gin.Context) {
	// Get user from context (set by AuthMiddleware)
	// If no auth, create temporary user session
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "temp_" + generateTempID()
	}
	
	// Generate state token - no email needed, Google will provide it
	state := generateState(userID, "")
	
	// Store state in session for verification later
	c.SetCookie("gmail_state", state, 3600, "/", "", false, true)
	
	// Generate OAuth URL with backend callback
	authURL := s.config.AuthCodeURL(state, 
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)

	fmt.Printf("🔗 Redirecting to Google OAuth for user: %s\n", userID)

	// Redirect to Google OAuth
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// HandleCallbackRedirect processes the OAuth callback from Google and redirects to frontend
func (s *GmailService) HandleCallbackRedirect(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	errorParam := c.Query("error")

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	// Check for errors
	if errorParam != "" {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?error="+errorParam)
		return
	}

	if code == "" || state == "" {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?error=invalid_callback")
		return
	}

	// Verify state
	savedState, err := c.Cookie("gmail_state")
	if err != nil || savedState != state {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?error=invalid_state")
		return
	}

	// Clear the state cookie
	c.SetCookie("gmail_state", "", -1, "/", "", false, true)

	ctx := context.Background()

	// Exchange authorization code for token
	token, err := s.config.Exchange(ctx, code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?error=token_exchange_failed")
		return
	}

	// Create Gmail service
	gmailService, err := gmail.NewService(ctx, option.WithTokenSource(s.config.TokenSource(ctx, token)))
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?error=gmail_service_failed")
		return
	}

	// Get user's email
	profile, err := gmailService.Users.GetProfile("me").Do()
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?error=profile_failed")
		return
	}

	// Store token in database (for now, just log)
	// storeGmailToken(userID, token)
	fmt.Printf("✅ Gmail connected: %s\n", profile.EmailAddress)

	// Start scanning for subscriptions in background
	go s.scanAndStoreSubscriptions("temp_user", gmailService)

	// Redirect to dashboard with success
	c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app?gmail_connected=true&email="+profile.EmailAddress)
}

// HandleCallback processes the OAuth callback
func (s *GmailService) HandleCallback(c *gin.Context) {
	var req CallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")

	// Verify state token
	// if !verifyState(userID, req.State) {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state"})
	// 	return
	// }

	ctx := context.Background()

	// Exchange authorization code for token
	token, err := s.config.Exchange(ctx, req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	// Store token in database
	// storeGmailToken(userID, token)

	// Create Gmail service
	gmailService, err := gmail.NewService(ctx, option.WithTokenSource(s.config.TokenSource(ctx, token)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Gmail service"})
		return
	}

	// Get user's email
	profile, err := gmailService.Users.GetProfile("me").Do()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get profile"})
		return
	}

	// Start scanning for subscriptions in background
	go s.scanAndStoreSubscriptions(userID, gmailService)

	c.JSON(http.StatusOK, CallbackResponse{
		Success:            true,
		Email:              profile.EmailAddress,
		SubscriptionsFound: 5, // This will be updated by background job
	})
}

// ScanEmails manually triggers a Gmail scan
func (s *GmailService) ScanEmails(c *gin.Context) {
	userID := c.GetString("user_id")

	// Get stored token from database
	// token := getGmailToken(userID)
	// if token == nil {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Gmail not connected"})
	// 	return
	// }

	// For demo, return success
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Scan started",
	})
}

// Disconnect removes Gmail connection
func (s *GmailService) Disconnect(c *gin.Context) {
	userID := c.GetString("user_id")

	// Delete token from database
	// deleteGmailToken(userID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Gmail disconnected",
	})
}

// Background function to scan emails for subscriptions
func (s *GmailService) scanAndStoreSubscriptions(userID string, gmailService *gmail.Service) {
	ctx := context.Background()

	// Search queries for subscription-related emails
	queries := []string{
		"subject:(receipt OR invoice OR subscription OR renewal OR payment)",
		"from:(noreply OR no-reply OR billing OR subscriptions)",
	}

	subscriptions := make(map[string]*Subscription)

	for _, query := range queries {
		// Search emails
		messages, err := gmailService.Users.Messages.List("me").
			Q(query).
			MaxResults(100).
			Do()
		
		if err != nil {
			continue
		}

		// Process each message
		for _, msg := range messages.Messages {
			message, err := gmailService.Users.Messages.Get("me", msg.Id).
				Format("full").
				Do()
			
			if err != nil {
				continue
			}

			// Extract subscription info using AI/pattern matching
			sub := s.extractSubscriptionInfo(message)
			if sub != nil {
				subscriptions[sub.Name] = sub
			}
		}
	}

	// Store subscriptions in storage
	for _, sub := range subscriptions {
		store.SaveSubscription(userID, sub)
		fmt.Printf("✅ Found subscription: %s - $%.2f\n", sub.Name, sub.Price)
	}
	
	fmt.Printf("📧 Finished scanning Gmail. Found %d subscriptions\n", len(subscriptions))
}

// Extract subscription information from email
func (s *GmailService) extractSubscriptionInfo(message *gmail.Message) *Subscription {
	// Get email body
	var body string
	if message.Payload.Body.Data != "" {
		decoded, _ := base64.URLEncoding.DecodeString(message.Payload.Body.Data)
		body = string(decoded)
	}

	// Get subject and from
	var subject, from string
	for _, header := range message.Payload.Headers {
		if header.Name == "Subject" {
			subject = header.Value
		}
		if header.Name == "From" {
			from = header.Value
		}
	}

	// Simple pattern matching (in production, use AI/ML)
	// This is a simplified example
	subscriptionKeywords := map[string]struct {
		name     string
		category string
	}{
		"netflix":  {"Netflix", "streaming"},
		"spotify":  {"Spotify", "streaming"},
		"adobe":    {"Adobe Creative Cloud", "productivity"},
		"youtube":  {"YouTube Premium", "streaming"},
		"github":   {"GitHub", "development"},
		"chatgpt":  {"ChatGPT Plus", "ai"},
	}

	bodyLower := strings.ToLower(body + " " + subject + " " + from)
	
	for keyword, info := range subscriptionKeywords {
		if strings.Contains(bodyLower, keyword) {
			// Extract price (simplified - would use regex in production)
			// For demo, return a subscription
			return &Subscription{
				ID:              generateTempID(), // Generate unique ID
				Name:            info.name,
				Price:           9.99, // Would extract from email
				BillingCycle:    "monthly",
				NextBillingDate: time.Now().AddDate(0, 1, 0).Format("2006-01-02"),
				Category:        info.category,
				IsAutoDetected:  true,
			}
		}
	}

	return nil
}

// Helper to generate state token
func generateState(userID, email string) string {
	return base64.URLEncoding.EncodeToString(
		[]byte(fmt.Sprintf("%s:%s:%d", userID, email, time.Now().Unix())),
	)
}

// Helper to generate a temporary ID
func generateTempID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}