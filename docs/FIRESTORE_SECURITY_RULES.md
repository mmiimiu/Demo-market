# Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function isAdmin() {
      return hasRole('admin') || hasRole('superadmin');
    }
    
    function isSuperAdmin() {
      return hasRole('superadmin');
    }
    
    function isAgent() {
      return hasRole('agent');
    }
    
    function isOwnerOfProperty(propertyId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/properties/$(propertyId)).data.ownerId == request.auth.uid;
    }
    
    function isParticipant(participants) {
      return isAuthenticated() && request.auth.uid in participants;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read public user profiles
      allow read: if isAuthenticated();
      
      // Users can create their own profile
      allow create: if isOwner(userId) && 
                       request.resource.data.role in ['user', 'agent', 'owner'];
      
      // Users can update their own profile (except role)
      allow update: if isOwner(userId) && 
                       (!('role' in request.resource.data) || 
                        request.resource.data.role == resource.data.role);
      
      // Only admins can delete users
      allow delete: if isAdmin();
      
      // Admins can update any user
      allow update: if isAdmin();
      
      // Sessions subcollection
      match /sessions/{sessionId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Properties collection
    match /properties/{propertyId} {
      // Anyone can read active properties
      allow read: if resource.data.status in ['available', 'reserved'] || 
                     isOwner(resource.data.ownerId) ||
                     isAdmin();
      
      // Owners and agents can create properties
      allow create: if isAuthenticated() && 
                       (hasRole('owner') || hasRole('agent')) &&
                       request.resource.data.ownerId == request.auth.uid;
      
      // Owners can update their properties
      allow update: if isOwnerOfProperty(propertyId) || isAdmin();
      
      // Owners and admins can delete
      allow delete: if isOwnerOfProperty(propertyId) || isAdmin();
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if true; // Public listings
      allow create: if isAuthenticated() && 
                       (hasRole('owner') || hasRole('agent'));
      allow update, delete: if isAuthenticated() && 
                               (resource.data.ownerId == request.auth.uid || isAdmin());
    }
    
    // Inquiries collection
    match /inquiries/{inquiryId} {
      // Read: user who created, owner, assigned agent, admin
      allow read: if isOwner(resource.data.userId) ||
                     isOwner(resource.data.ownerId) ||
                     isOwner(resource.data.agentId) ||
                     isAdmin();
      
      // Users can create inquiries
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users, agents, owners can update
      allow update: if isOwner(resource.data.userId) ||
                       isOwner(resource.data.ownerId) ||
                       isOwner(resource.data.agentId) ||
                       isAdmin();
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Contracts collection
    match /contracts/{contractId} {
      // Read: parties involved + admin
      allow read: if isOwner(resource.data.tenantId) ||
                     isOwner(resource.data.ownerId) ||
                     isOwner(resource.data.agentId) ||
                     isAdmin();
      
      // Owners and agents can create
      allow create: if isAuthenticated() &&
                       (hasRole('owner') || hasRole('agent'));
      
      // Parties can update (for signatures)
      allow update: if isOwner(resource.data.tenantId) ||
                       isOwner(resource.data.ownerId) ||
                       isOwner(resource.data.agentId) ||
                       isAdmin();
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Payments collection
    match /payments/{paymentId} {
      // Read: payer, recipient, admin
      allow read: if isOwner(resource.data.payerId) ||
                     isOwner(resource.data.recipientId) ||
                     isAdmin();
      
      // Only backend can create payments (via service account)
      allow create: if false; // Use Admin SDK
      
      // Only backend and admin can update
      allow update: if isAdmin();
      
      // No one can delete payments (audit trail)
      allow delete: if false;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Users can only read their own notifications
      allow read: if isOwner(resource.data.userId);
      
      // Only backend can create notifications
      allow create: if false; // Use Admin SDK
      
      // Users can mark as read
      allow update: if isOwner(resource.data.userId) && 
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['read', 'readAt']);
      
      // Users can delete their notifications
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Chats collection
    match /chats/{chatId} {
      // Participants can read
      allow read: if isParticipant(resource.data.participants);
      
      // Anyone can create a chat (if they're a participant)
      allow create: if isAuthenticated() && 
                       request.auth.uid in request.resource.data.participants;
      
      // Participants can update (for unread count)
      allow update: if isParticipant(resource.data.participants);
      
      // No one can delete chats (keep history)
      allow delete: if isAdmin();
      
      // Messages subcollection
      match /messages/{messageId} {
        // Participants can read messages
        allow read: if isAuthenticated() && 
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        
        // Participants can send messages
        allow create: if isAuthenticated() && 
                         request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants &&
                         request.resource.data.senderId == request.auth.uid;
        
        // Sender can update their own messages (for read receipts)
        allow update: if isAuthenticated() && 
                         request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        
        // No one can delete messages (keep history)
        allow delete: if false;
      }
    }
    
    // Agent zones collection
    match /agent_zones/{zoneId} {
      // Anyone can read active zones (for agent matching)
      allow read: if resource.data.active == true || 
                     isOwner(resource.data.agentId) ||
                     isAdmin();
      
      // Agents can create their zones
      allow create: if isAgent() && 
                       request.resource.data.agentId == request.auth.uid;
      
      // Agents can update their own zones
      allow update: if isOwner(resource.data.agentId) || isAdmin();
      
      // Agents and admins can delete
      allow delete: if isOwner(resource.data.agentId) || isAdmin();
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      // Anyone can read non-flagged reviews
      allow read: if !resource.data.flagged || isAdmin();
      
      // Authenticated users can create reviews
      allow create: if isAuthenticated() && 
                       request.resource.data.reviewerId == request.auth.uid;
      
      // Reviewer can update their own review
      // Target can add a response
      allow update: if isOwner(resource.data.reviewerId) ||
                       isOwner(resource.data.targetId) ||
                       isAdmin();
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Credits collection
    match /credits/{userId} {
      // Users can read their own credits
      allow read: if isOwner(userId) || isAdmin();
      
      // Only backend can create/update credits
      allow create, update: if false; // Use Admin SDK
      
      // No one can delete credits
      allow delete: if false;
    }
    
    // Saved searches collection
    match /saved_searches/{searchId} {
      // Users can read their own saved searches
      allow read: if isOwner(resource.data.userId);
      
      // Users can create their own saved searches
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their own saved searches
      allow update: if isOwner(resource.data.userId);
      
      // Users can delete their own saved searches
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Audit logs collection
    match /audit_logs/{logId} {
      // Only admins can read audit logs
      allow read: if isAdmin();
      
      // Only backend can create audit logs
      allow create: if false; // Use Admin SDK
      
      // No updates or deletes (immutable)
      allow update, delete: if false;
    }
    
    // Community Q&A
    match /community_posts/{postId} {
      allow read: if true; // Public
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.authorId) || isAdmin();
      allow delete: if isOwner(resource.data.authorId) || isAdmin();
      
      match /comments/{commentId} {
        allow read: if true;
        allow create: if isAuthenticated();
        allow update: if isOwner(resource.data.authorId) || isAdmin();
        allow delete: if isOwner(resource.data.authorId) || isAdmin();
      }
    }
    
    // Reports collection
    match /reports/{reportId} {
      // Reporter and admin can read
      allow read: if isOwner(resource.data.reporterId) || isAdmin();
      
      // Authenticated users can create reports
      allow create: if isAuthenticated() && 
                       request.resource.data.reporterId == request.auth.uid;
      
      // Only admins can update/delete
      allow update, delete: if isAdmin();
    }
  }
}
```

## Index Configuration

```json
{
  "indexes": [
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "location.coordinates", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "boosted", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "inquiries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "agentId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "payerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "chatId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```
