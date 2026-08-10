# BaanDee Platform Architecture

## System Overview

BaanDee is a full-stack real estate rental platform targeting the Thai market with multi-language support (TH/EN/CN). The platform connects Users, Agents, Owners, and Admins through a comprehensive property search and transaction system.

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod
- **AI**: Genkit AI (Google Gemini)

### Backend
- **Authentication**: Firebase Auth (LINE, Google, Email, Phone)
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Cloudinary (Images, Videos, 360° Tours)
- **Serverless**: Next.js API Routes / Firebase Cloud Functions

### External APIs
- **Payment**: Omise (PromptPay QR, Cards, Escrow)
- **Messaging**: LINE Messaging API + Rich Menu
- **Maps**: Google Maps Platform (4 APIs)
- **Identity**: NDID (Thai citizens) + NFC Passport (expats)
- **SMS**: Twilio / THAIBULKSMS
- **Email**: SendGrid / AWS SES

### Infrastructure
- **Hosting**: Vercel / Firebase App Hosting
- **CDN**: Cloudinary + Vercel Edge Network
- **Monitoring**: Datadog / New Relic
- **CI/CD**: GitHub Actions

---

## Database Schema (Firestore)

### Collections Structure

#### 1. users
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email?: string;
  phone?: string;
  lineUserId?: string;
  googleId?: string;
  
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    dateOfBirth?: Timestamp;
    nationality?: string;
  };
  
  role: 'user' | 'agent' | 'owner' | 'admin' | 'superadmin';
  language: 'th' | 'en' | 'cn';
  currency: 'THB' | 'USD' | 'CNY';
  
  // Verification
  verified: {
    email: boolean;
    phone: boolean;
    ndid: boolean;
    agent: boolean;
  };
  
  // Agent-specific
  agentProfile?: {
    companyName?: string;
    licenseNumber?: string;
    zones: GeoJSON[];            // Polygon zones
    specialties: PropertyType[];
    rating: number;
    totalDeals: number;
    responseTimeAvg: number;     // minutes
    approvalStatus: 'pending' | 'approved' | 'rejected';
  };
  
  // Owner-specific
  ownerProfile?: {
    properties: string[];        // Property IDs
    rating: number;
    totalProperties: number;
  };
  
  // Security
  twoFactorEnabled: boolean;
  sessions: Array<{
    sessionId: string;
    device: string;
    lastActive: Timestamp;
    ip: string;
  }>;
  
  // Preferences
  notifications: {
    email: boolean;
    sms: boolean;
    line: boolean;
    push: boolean;
    savedSearch: boolean;
    priceChange: boolean;
  };
  
  // PDPA Consent
  consents: Array<{
    type: string;
    granted: boolean;
    timestamp: Timestamp;
  }>;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
}
```

#### 2. properties
```typescript
interface Property {
  id: string;
  
  // Basic Info
  name: {
    th: string;
    en: string;
    cn: string;
  };
  
  type: 'condo' | 'house' | 'apartment' | 'villa' | 'townhouse';
  
  // Pricing
  price: number;                 // THB per month
  deposit: number;               // Usually 2 months
  commonFee?: number;
  utilities: {
    electric: 'included' | 'metered';
    water: 'included' | 'metered';
    internet: 'included' | 'separate';
  };
  
  // Location
  location: {
    address: {
      th: string;
      en: string;
      cn: string;
    };
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
    coordinates: GeoPoint;
    nearestBTS?: string;
    nearestMRT?: string;
    distanceToBTS?: number;       // meters
  };
  
  // Details
  details: {
    bedrooms: number;
    bathrooms: number;
    sqm: number;
    floor?: number;
    totalFloors?: number;
    furnished: boolean;
    petFriendly: boolean;
    smokingAllowed: boolean;
  };
  
  // Amenities
  amenities: Array<
    'pool' | 'gym' | 'parking' | 'security' | 'wifi' | 
    'aircon' | 'kitchen' | 'washing' | 'balcony' | 'elevator'
  >;
  
  // Media
  media: {
    photos: string[];             // Cloudinary URLs
    videos?: string[];
    virtualTour360?: string;
    thumbnailUrl: string;
  };
  
  // Ownership
  ownerId: string;                // User ID
  agentId?: string;               // Agent ID (if managed)
  
  // Status
  status: 'available' | 'rented' | 'reserved' | 'maintenance' | 'draft';
  availableFrom?: Timestamp;
  
  // Verification
  verified: boolean;
  verifiedBy?: string;            // Admin ID
  verifiedAt?: Timestamp;
  
  // Engagement
  views: number;
  saves: number;
  inquiries: number;
  
  // Boosting
  boosted: boolean;
  boostedUntil?: Timestamp;
  featuredUntil?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  expiresAt?: Timestamp;          // Auto-hide if not renewed
  lastRenewed?: Timestamp;
}
```

#### 3. listings (Active rental listings)
```typescript
interface Listing {
  id: string;
  propertyId: string;
  
  // Listing-specific pricing (can override property)
  monthlyRent: number;
  leaseTerm: {
    min: number;                  // months
    max: number;
  };
  
  // Availability
  availableDate: Timestamp;
  moveInChecklist?: {
    completed: boolean;
    completedAt?: Timestamp;
    pdfUrl?: string;
  };
  
  // Current tenant
  currentTenant?: {
    userId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    contractId: string;
  };
  
  status: 'active' | 'pending' | 'rented' | 'archived';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4. inquiries (Lead management)
```typescript
interface Inquiry {
  id: string;
  
  // Parties
  userId: string;                 // Prospective tenant
  propertyId: string;
  ownerId: string;
  agentId?: string;               // Assigned agent
  
  // Inquiry details
  message: string;
  preferredMoveInDate?: Timestamp;
  leaseDuration?: number;         // months
  budget?: {
    min: number;
    max: number;
  };
  
  // Status
  status: 'new' | 'contacted' | 'showing_scheduled' | 'showing_completed' | 
          'negotiating' | 'contract_pending' | 'closed_won' | 'closed_lost';
  
  // Agent dispatch
  dispatchedAt?: Timestamp;
  acceptedAt?: Timestamp;
  agentAcceptDeadline?: Timestamp;
  
  // Showing appointment
  showing?: {
    scheduledAt: Timestamp;
    confirmedAt?: Timestamp;
    completedAt?: Timestamp;
    notes?: string;
  };
  
  // Follow-up
  lastContactAt?: Timestamp;
  followUpAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  closedAt?: Timestamp;
}
```

#### 5. contracts
```typescript
interface Contract {
  id: string;
  
  // Parties
  tenantId: string;
  ownerId: string;
  agentId?: string;
  propertyId: string;
  
  // Contract details
  startDate: Timestamp;
  endDate: Timestamp;
  monthlyRent: number;
  deposit: number;
  
  // E-signature
  signatures: {
    tenant: {
      signed: boolean;
      signedAt?: Timestamp;
      ipAddress?: string;
    };
    owner: {
      signed: boolean;
      signedAt?: Timestamp;
      ipAddress?: string;
    };
    agent?: {
      signed: boolean;
      signedAt?: Timestamp;
      ipAddress?: string;
    };
  };
  
  // Documents
  documents: {
    contractPdfUrl: string;
    moveInChecklistUrl?: string;
    tenantIdUrl: string;
    ownerIdUrl: string;
  };
  
  // Status
  status: 'draft' | 'pending_signatures' | 'active' | 'expired' | 'terminated';
  
  // Renewal
  renewalNotificationSent?: boolean;
  renewedContractId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 6. payments
```typescript
interface Payment {
  id: string;
  
  // Transaction details
  type: 'deposit' | 'rent' | 'commission' | 'credit_purchase' | 'boost_listing';
  amount: number;                 // THB
  currency: 'THB';
  
  // Parties
  payerId: string;                // User ID
  recipientId?: string;           // Owner/Agent ID
  propertyId?: string;
  contractId?: string;
  
  // Payment gateway
  gateway: 'omise' | 'promptpay' | 'credit_card' | 'bank_transfer';
  gatewayTransactionId?: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'escrowed';
  
  // Escrow
  escrow?: {
    releaseCondition: string;
    releasedAt?: Timestamp;
    releasedTo?: string;
    disputeId?: string;
  };
  
  // QR Payment
  qrCode?: {
    url: string;
    expiresAt: Timestamp;
    scannedAt?: Timestamp;
  };
  
  // Metadata
  idempotencyKey: string;         // Prevent duplicates
  webhookEvents: Array<{
    event: string;
    timestamp: Timestamp;
    data: any;
  }>;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

#### 7. notifications
```typescript
interface Notification {
  id: string;
  
  // Target
  userId: string;
  
  // Notification details
  type: 'appointment' | 'payment' | 'contract' | 'inquiry' | 'listing_expiry' | 'system';
  title: {
    th: string;
    en: string;
    cn: string;
  };
  message: {
    th: string;
    en: string;
    cn: string;
  };
  
  // Channels
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    line: boolean;
  };
  
  // Status
  read: boolean;
  readAt?: Timestamp;
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
  
  // Delivery status
  deliveryStatus: {
    inApp: 'sent' | 'delivered' | 'read';
    email?: 'sent' | 'delivered' | 'opened' | 'failed';
    sms?: 'sent' | 'delivered' | 'failed';
    line?: 'sent' | 'delivered' | 'failed';
  };
  
  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  createdAt: Timestamp;
}
```

#### 8. chats
```typescript
interface Chat {
  id: string;
  
  // Participants
  participants: string[];         // User IDs
  participantRoles: Record<string, 'user' | 'agent' | 'owner' | 'admin'>;
  
  // Context
  propertyId?: string;
  inquiryId?: string;
  
  // Last message
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  
  // Status
  unreadCount: Record<string, number>;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 9. messages (Subcollection of chats)
```typescript
interface Message {
  id: string;
  chatId: string;
  
  senderId: string;
  text: string;
  
  // Translations
  translatedText?: {
    th?: string;
    en?: string;
    cn?: string;
  };
  
  // Attachments
  attachments?: Array<{
    type: 'image' | 'document' | 'qr_code';
    url: string;
  }>;
  
  // Status
  read: boolean;
  readAt?: Timestamp;
  
  createdAt: Timestamp;
}
```

#### 10. agent_zones
```typescript
interface AgentZone {
  id: string;
  agentId: string;
  
  // Geographic zone
  polygon: GeoJSON;               // Polygon coordinates
  radius?: number;                // meters (if circular)
  centerPoint?: GeoPoint;
  
  // Specialization
  propertyTypes: PropertyType[];
  priceRange: {
    min: number;
    max: number;
  };
  
  // Performance in zone
  leadsReceived: number;
  leadsAccepted: number;
  leadsRejected: number;
  dealsCompleted: number;
  
  // Auto-adjustment
  autoShrink: boolean;            // Shrink if >60% rejection
  
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 11. reviews
```typescript
interface Review {
  id: string;
  
  // Target
  targetType: 'property' | 'agent' | 'owner';
  targetId: string;
  
  // Reviewer
  reviewerId: string;
  
  // Review content
  rating: number;                 // 1-5
  title: string;
  comment: string;
  
  // Verification (only reviewers with completed transaction)
  verified: boolean;
  transactionId?: string;
  
  // Response
  response?: {
    text: string;
    responderId: string;
    respondedAt: Timestamp;
  };
  
  // Moderation
  flagged: boolean;
  flagReason?: string;
  moderatedBy?: string;
  
  helpful: number;                // Upvotes
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 12. credits
```typescript
interface Credit {
  id: string;
  userId: string;
  
  // Balance
  balance: number;
  
  // Transactions
  transactions: Array<{
    id: string;
    type: 'purchase' | 'usage' | 'refund' | 'bonus';
    amount: number;
    description: string;
    timestamp: Timestamp;
  }>;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 13. saved_searches
```typescript
interface SavedSearch {
  id: string;
  userId: string;
  
  // Search criteria
  query?: string;
  filters: {
    propertyType?: PropertyType[];
    priceMin?: number;
    priceMax?: number;
    location?: {
      province?: string;
      district?: string;
      nearBTS?: boolean;
      radius?: number;
    };
    bedrooms?: number;
    amenities?: Amenity[];
  };
  
  // Alerts
  alertEnabled: boolean;
  lastAlertSent?: Timestamp;
  newMatchCount: number;
  
  name: string;                   // User-defined name
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 14. audit_logs
```typescript
interface AuditLog {
  id: string;
  
  // Actor
  userId: string;
  userRole: string;
  
  // Action
  action: string;                 // e.g., 'user.login', 'property.update', 'payment.refund'
  resource: string;               // e.g., 'property', 'user', 'payment'
  resourceId: string;
  
  // Changes
  changes?: {
    before: any;
    after: any;
  };
  
  // Context
  ipAddress: string;
  userAgent: string;
  
  // Result
  success: boolean;
  errorMessage?: string;
  
  timestamp: Timestamp;
}
```

---

## API Structure

### Next.js API Routes

#### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (Email/Phone/Social)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-phone` - Phone OTP verification
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `GET /api/auth/sessions` - Get active sessions
- `DELETE /api/auth/sessions/:id` - Revoke session

#### Properties (`/api/properties`)
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (Owner/Agent)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/boost` - Boost listing
- `POST /api/properties/:id/renew` - Renew listing
- `POST /api/properties/:id/save` - Save to wishlist
- `POST /api/properties/:id/report` - Report property

#### Search (`/api/search`)
- `POST /api/search/smart` - AI smart search
- `GET /api/search/autocomplete` - Location autocomplete
- `POST /api/search/saved` - Save search
- `GET /api/search/saved` - Get saved searches
- `GET /api/search/nearby-bts` - Search near BTS/MRT

#### Inquiries (`/api/inquiries`)
- `POST /api/inquiries` - Create inquiry
- `GET /api/inquiries` - List inquiries
- `GET /api/inquiries/:id` - Get inquiry details
- `PUT /api/inquiries/:id/status` - Update status
- `POST /api/inquiries/:id/schedule-showing` - Schedule viewing
- `POST /api/inquiries/:id/assign-agent` - Assign agent

#### Agents (`/api/agents`)
- `POST /api/agents/apply` - Apply to be agent
- `GET /api/agents` - List agents (public)
- `GET /api/agents/:id` - Get agent profile
- `PUT /api/agents/:id/zones` - Update agent zones
- `POST /api/agents/:id/accept-lead` - Accept inquiry
- `GET /api/agents/dashboard` - Agent dashboard data
- `GET /api/agents/performance` - Performance metrics

#### Payments (`/api/payments`)
- `POST /api/payments/create-charge` - Create payment charge
- `POST /api/payments/qr-code` - Generate QR code
- `POST /api/payments/webhook` - Payment webhook
- `GET /api/payments/history` - Payment history
- `POST /api/payments/refund` - Request refund
- `POST /api/payments/payout` - Payout to agent/owner
- `POST /api/payments/escrow/release` - Release escrow

#### Contracts (`/api/contracts`)
- `POST /api/contracts` - Create contract
- `GET /api/contracts/:id` - Get contract
- `POST /api/contracts/:id/sign` - Sign contract
- `POST /api/contracts/:id/checklist` - Submit move-in checklist
- `GET /api/contracts/active` - Get active contracts

#### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `PUT /api/notifications/settings` - Update notification preferences

#### Chat (`/api/chat`)
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/:id` - Get conversation messages
- `POST /api/chat/:id/messages` - Send message
- `POST /api/chat/:id/translate` - Translate message

#### LINE OA (`/api/line`)
- `POST /api/line/webhook` - LINE webhook
- `POST /api/line/send-notification` - Send LINE notification
- `POST /api/line/send-qr` - Send QR code via LINE
- `POST /api/line/broadcast` - Broadcast message

#### Admin (`/api/admin`)
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/status` - Update user status
- `PUT /api/admin/agents/:id/approve` - Approve agent
- `GET /api/admin/reports` - Get reports
- `POST /api/admin/reports/:id/resolve` - Resolve report
- `GET /api/admin/dashboard` - Admin dashboard

#### Credits (`/api/credits`)
- `GET /api/credits/balance` - Get credit balance
- `POST /api/credits/purchase` - Purchase credits
- `POST /api/credits/use` - Use credits
- `GET /api/credits/history` - Transaction history

#### Maps (`/api/maps`)
- `GET /api/maps/geocode` - Geocode address
- `GET /api/maps/reverse-geocode` - Reverse geocode
- `GET /api/maps/distance-matrix` - Calculate commute time
- `GET /api/maps/nearby-bts` - Find nearby BTS/MRT

---

## Microservices Architecture (Future Phase)

### Service Decomposition

1. **Auth Service**
   - User authentication
   - Session management
   - 2FA
   - NDID integration

2. **Property Service**
   - Property CRUD
   - Search & filtering
   - Boosting & featuring

3. **Agent Service**
   - Agent management
   - Zone management
   - Lead dispatch
   - Performance tracking

4. **Payment Service**
   - Payment processing
   - Escrow management
   - Payout handling
   - Webhook processing

5. **Notification Service**
   - Multi-channel notifications
   - LINE OA integration
   - Email/SMS sending
   - Push notifications

6. **Contract Service**
   - Contract generation
   - E-signature
   - Document management

7. **Chat Service**
   - Real-time messaging
   - Translation
   - Message history

8. **Search Service**
   - AI smart search
   - Autocomplete
   - Saved searches
   - Geospatial queries

---

## Security Architecture

### Authentication Flow
1. Multi-provider auth (Firebase Auth)
2. JWT tokens (Access: 15min, Refresh: 30 days)
3. Token rotation on refresh
4. Session management (multi-device)
5. Optional 2FA (TOTP/SMS)

### Authorization (RBAC)
- **Guest**: Browse listings, search
- **User**: Save listings, inquire, chat, book
- **Agent**: Manage listings, receive leads, close deals
- **Owner**: Post properties, manage rentals
- **Admin**: Moderate content, approve agents, resolve disputes
- **SuperAdmin**: System configuration, security, analytics

### Data Security
- **Encryption at rest**: Firestore encryption
- **Encryption in transit**: HTTPS/TLS 1.3
- **PII Protection**: Encrypt sensitive fields (NDID data, documents)
- **PDPA Compliance**: Consent management, data retention policies
- **API Security**: Rate limiting, CORS, CSRF protection

### Payment Security
- **PCI DSS**: Omise handles card data (SAQ-A compliance)
- **Idempotency**: Prevent duplicate charges
- **Webhook verification**: HMAC signature validation
- **Escrow**: Platform holds funds until conditions met

---

## Scalability & Performance

### Database Optimization
- **Indexing**: Compound indexes for common queries
- **Denormalization**: Store user names in messages for faster display
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Redis for hot data (search results, user sessions)

### Frontend Performance
- **Code splitting**: Dynamic imports for routes
- **Image optimization**: Next.js Image, Cloudinary transformations
- **Lazy loading**: Below-the-fold content
- **CDN**: Edge caching for static assets
- **SSG/ISR**: Pre-render popular pages

### API Performance
- **Rate limiting**: 100 req/min per user
- **Response caching**: Cache-Control headers
- **Database connection pooling**: Reuse connections
- **Background jobs**: Queue for notifications, email

### Monitoring
- **APM**: Datadog / New Relic
- **Error tracking**: Sentry
- **Uptime**: Pingdom / UptimeRobot
- **Logs**: Centralized logging (CloudWatch / Stackdriver)

---

## Deployment Strategy

### Environments
- **Development**: Local + Firebase Emulators
- **Staging**: Vercel Preview + Firebase Staging Project
- **Production**: Vercel Production + Firebase Production Project

### CI/CD Pipeline
1. **Code push** → GitHub
2. **Automated tests** → Jest, Playwright
3. **Build** → Next.js build
4. **Deploy** → Vercel (automatic)
5. **Smoke tests** → Post-deployment checks

### Rollback Strategy
- Vercel instant rollback
- Database migrations with down scripts
- Feature flags for gradual rollout

---

## Development Phases

### Phase 1 (MVP - 3 months)
- ✅ Basic authentication (Email, Google, LINE)
- ✅ Property listing & search
- ✅ Basic filtering
- ✅ Property details modal
- ✅ Wishlist
- 🔄 User profiles
- 🔄 Agent onboarding
- 🔄 Basic inquiry system
- 🔄 Payment integration (Omise)
- 🔄 LINE OA notifications

### Phase 2 (Growth - 6 months)
- Smart agent matching
- E-signature & contracts
- Move-in checklist
- Commission splitting
- Review system
- Advanced search (BTS, polygon)
- Credit system
- Boost/featured listings

### Phase 3 (Scale - 12 months)
- NDID integration
- Multi-language chat translation
- Agent team pools
- Automated billing
- Analytics dashboard
- Mobile app (React Native)
- API for third-party integrations

---

## Cost Optimization Strategies

1. **Google Maps**: Cache geocoding results, use Static API for thumbnails
2. **Cloudinary**: Auto-optimization, archive old images
3. **SMS**: Smart retry (switch to email OTP if SMS fails)
4. **LINE OA**: Use Light plan (฿235) for Phase 1, Standard (฿1,500) for Phase 2+
5. **Infrastructure**: Reserved instances for DB (30-40% savings)

---

## Compliance & Legal

### PDPA (Thailand)
- Consent management
- Right to access data
- Right to deletion
- Data retention policies
- Breach notification procedures

### Terms of Service
- Platform liability limits
- Agent verification disclaimers
- Payment terms
- Dispute resolution

### Privacy Policy
- Data collection & usage
- Third-party services
- Cookie policy
- User rights

---

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure Firestore security rules
3. Set up Omise account & test keys
4. Register LINE OA account
5. Set up Google Maps API keys
6. Create Cloudinary account
7. Implement authentication flows
8. Build property management system
9. Integrate payment gateway
10. Deploy MVP to staging
