package main

import (
	"sync"
)

// In-memory storage (for development/demo)
// In production, use PostgreSQL or MongoDB
type Storage struct {
	subscriptions map[string][]*Subscription // userID -> subscriptions
	gmailTokens   map[string]interface{}     // userID -> token
	mu            sync.RWMutex
}

var store = &Storage{
	subscriptions: make(map[string][]*Subscription),
	gmailTokens:   make(map[string]interface{}),
}

// Store subscription
func (s *Storage) SaveSubscription(userID string, sub *Subscription) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.subscriptions[userID] == nil {
		s.subscriptions[userID] = []*Subscription{}
	}

	// Check if subscription already exists (by name)
	for _, existing := range s.subscriptions[userID] {
		if existing.Name == sub.Name {
			// Update existing
			*existing = *sub
			return
		}
	}

	// Add new subscription
	s.subscriptions[userID] = append(s.subscriptions[userID], sub)
}

// Get all subscriptions for user
func (s *Storage) GetSubscriptions(userID string) []*Subscription {
	s.mu.RLock()
	defer s.mu.RUnlock()

	subs := s.subscriptions[userID]
	if subs == nil {
		return []*Subscription{}
	}
	return subs
}

// Get single subscription
func (s *Storage) GetSubscription(userID, subID string) *Subscription {
	s.mu.RLock()
	defer s.mu.RUnlock()

	subs := s.subscriptions[userID]
	for _, sub := range subs {
		if sub.ID == subID {
			return sub
		}
	}
	return nil
}

// Delete subscription
func (s *Storage) DeleteSubscription(userID, subID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	subs := s.subscriptions[userID]
	for i, sub := range subs {
		if sub.ID == subID {
			// Remove from slice
			s.subscriptions[userID] = append(subs[:i], subs[i+1:]...)
			return true
		}
	}
	return false
}

// Store Gmail token
func (s *Storage) SaveGmailToken(userID string, token interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.gmailTokens[userID] = token
}

// Get Gmail token
func (s *Storage) GetGmailToken(userID string) interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.gmailTokens[userID]
}

// Delete Gmail token
func (s *Storage) DeleteGmailToken(userID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.gmailTokens, userID)
}
