package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SubscriptionService struct {
	// db *sql.DB or other database connection
}

type Subscription struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Price           float64 `json:"price"`
	BillingCycle    string  `json:"billingCycle"`
	NextBillingDate string  `json:"nextBillingDate"`
	Category        string  `json:"category"`
	Color           string  `json:"color,omitempty"`
	IsAutoDetected  bool    `json:"isAutoDetected"`
}

func NewSubscriptionService() *SubscriptionService {
	return &SubscriptionService{}
}

// GetSubscriptions returns all subscriptions for a user
func (s *SubscriptionService) GetSubscriptions(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		// For demo, use temp_user
		userID = "temp_user"
	}

	// Fetch from storage
	subscriptions := store.GetSubscriptions(userID)

	c.JSON(http.StatusOK, gin.H{
		"subscriptions": subscriptions,
		"total":         len(subscriptions),
	})
}

// GetSubscription returns a single subscription
func (s *SubscriptionService) GetSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "temp_user"
	}
	subID := c.Param("id")

	subscription := store.GetSubscription(userID, subID)
	if subscription == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

// DeleteSubscription removes a subscription
func (s *SubscriptionService) DeleteSubscription(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "temp_user"
	}
	subID := c.Param("id")

	success := store.DeleteSubscription(userID, subID)
	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	fmt.Printf("🗑️  Deleted subscription: %s\n", subID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Subscription deleted",
	})
}