package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthService struct {
	googleConfig *oauth2.Config
}

type GoogleUser struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

type TokenResponse struct {
	Token string     `json:"token"`
	User  GoogleUser `json:"user"`
}

func NewAuthService() *AuthService {
	config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"), // http://localhost:3000/auth/callback
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &AuthService{
		googleConfig: config,
	}
}

// GoogleSignIn handles Google Sign-In (for Login page)
func (s *AuthService) GoogleSignIn(c *gin.Context) {
	var req struct {
		Credential string `json:"credential"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Verify Google credential token
	// In production, you would verify the JWT token from Google
	// For now, we'll mock the response
	
	user := GoogleUser{
		ID:      "123456789",
		Email:   "user@example.com",
		Name:    "Demo User",
		Picture: "https://via.placeholder.com/150",
	}

	// Generate JWT token
	token := generateJWT(user.ID, user.Email)

	c.JSON(http.StatusOK, TokenResponse{
		Token: token,
		User:  user,
	})
}

// GoogleLoginRedirect redirects to Google OAuth page
func (s *AuthService) GoogleLoginRedirect(c *gin.Context) {
	// Generate state token for CSRF protection
	state := generateRandomState()
	
	// Store state in session or database
	// For demo, we'll just pass it through

	url := s.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleLoginCallback handles the OAuth callback
func (s *AuthService) GoogleLoginCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No code provided"})
		return
	}

	// Exchange code for token
	ctx := context.Background()
	token, err := s.googleConfig.Exchange(ctx, code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	// Get user info from Google
	client := s.googleConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// Create user in database if not exists
	// ...

	// Generate JWT token
	jwtToken := generateJWT(googleUser.ID, googleUser.Email)

	// Redirect to frontend with token
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	c.Redirect(http.StatusTemporaryRedirect, 
		fmt.Sprintf("%s/app?token=%s", frontendURL, jwtToken))
}

// Helper function to generate JWT token
func generateJWT(userID, email string) string {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-this-in-production"
	}

	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

// Helper function to generate random state
func generateRandomState() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
