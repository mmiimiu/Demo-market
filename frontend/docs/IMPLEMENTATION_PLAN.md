# PrimeRent Implementation Plan

## Table of Contents
1. [Phase 1: Foundation & Authentication](#phase-1-foundation--authentication)
2. [Phase 2: Property Listings System](#phase-2-property-listings-system)
3. [Phase 3: User Dashboards](#phase-3-user-dashboards)
4. [Phase 4: Agent-Owner Collaboration System](#phase-4-agent-owner-collaboration-system) ⭐
5. [Phase 5: Chat System](#phase-5-chat-system)
6. [Phase 6: Booking System](#phase-6-booking-system)
7. [Phase 7: Payment System](#phase-7-payment-system)
8. [Phase 8: Contract System](#phase-8-contract-system)
9. [Phase 9: KYC System](#phase-9-kyc-system)
10. [Phase 10: Rating & Review System](#phase-10-rating--review-system)
11. [Phase 11: Notification System](#phase-11-notification-system)
12. [Phase 12: Credit System](#phase-12-credit-system)
13. [Phase 13: Maintenance System](#phase-13-maintenance-system)
14. [Phase 14: Admin Dashboard](#phase-14-admin-dashboard)

---

## Phase 1: Foundation & Authentication

### 1.1 Database Schema Design
**Tables:**
- `users` - User profiles
- `roles` - User roles (renter, owner, agent, admin)
- `user_roles` - Many-to-many relationship
- `sessions` - Session management
- `refresh_tokens` - Token rotation
- `auth_providers` - Connected auth providers (Line, Google, etc.)

**Key Fields:**
```typescript
interface User {
  id: string;
  email?: string;
  phone?: string;
  line_id?: string;
  google_id?: string;
  thai_id?: string;
  password_hash?: string;
  full_name: string;
  avatar_url?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface Session {
  id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  expires_at: Date;
  created_at: Date;
  last_active: Date;
}

interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}
```

### 1.2 Authentication Flow

#### 1.2.1 Registration
**Endpoints:**
- `POST /api/auth/register/email` - Email registration
- `POST /api/auth/register/line` - Line OAuth
- `POST /api/auth/register/google` - Google OAuth
- `POST /api/auth/register/phone` - Phone registration with SMS OTP

**Flow:**
1. User submits registration data
2. Validate email/phone uniqueness
3. Rate limiting: max 3 registrations per IP per hour
4. Session delay: 2 seconds between attempts
5. Create user record with `kyc_status: pending`
6. Send verification email/SMS
7. Create session and tokens
8. Return access token (15 min) + refresh token (30 days)

**Security Measures:**
- bcrypt for password hashing (cost factor 12)
- Email verification link expires in 15 minutes
- SMS OTP expires in 5 minutes
- CAPTCHA for bot prevention

#### 1.2.2 Login
**Endpoints:**
- `POST /api/auth/login/email`
- `POST /api/auth/login/line`
- `POST /api/auth/login/google`
- `POST /api/auth/login/phone`

**Flow:**
1. Validate credentials
2. Check if account is locked (5 failed attempts = 30 min lock)
3. Generate access token (JWT, 15 min expiry)
4. Generate refresh token (30 days expiry)
5. Store session in database
6. Return tokens + user profile

**Token Rotation:**
- Refresh token used → generate new refresh token
- Old refresh token marked as revoked
- Single-use refresh tokens only

#### 1.2.3 Session Management
**Endpoints:**
- `GET /api/auth/sessions` - List all active sessions
- `DELETE /api/auth/sessions/:id` - Revoke specific session
- `DELETE /api/auth/sessions/all` - Revoke all sessions except current

**Features:**
- Multi-device session support
- Auto-refresh token via interceptor
- Session timeout warning (5 min before expiry)
- Revoke session from user dashboard

#### 1.2.4 2FA (Two-Factor Authentication)
**Trigger Conditions:**
- High-value transactions (> 50,000 THB)
- Password change
- Email/phone change
- New device login

**Methods:**
- TOTP (Google Authenticator)
- SMS OTP

**Flow:**
1. User attempts sensitive action
2. Show popup: "Confirm your identity"
3. User enters 2FA code
4. Verify code
5. Allow action if valid

#### 1.2.5 Password Reset
**Endpoints:**
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset with token

**Flow:**
1. User enters email
2. Send secure link (expires 15 min)
3. User clicks link → enters new password
4. Validate token and update password
5. Invalidate all existing sessions

### 1.3 Frontend Components
**Components:**
- `AuthModal` - Login/Register modal
- `LoginForm` - Email/password login
- `RegisterForm` - Registration form
- `ForgotPasswordForm` - Password reset
- `2FAPopup` - 2FA confirmation popup
- `SessionManager` - Session management panel

**Pages:**
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Forgot password
- `/auth/reset-password/:token` - Reset password
- `/auth/verify-email/:token` - Email verification
- `/profile/sessions` - Session management

---

## Phase 2: Property Listings System

### 2.1 Database Schema
**Tables:**
- `properties` - Property listings
- `property_images` - Property images
- `amenities` - Available amenities
- `property_amenities` - Many-to-many
- `property_views` - View tracking
- `property_saves` - Saved properties

**Key Fields:**
```typescript
interface Property {
  id: string;
  owner_id: string;
  assigned_agent_id?: string; // Agent assigned by owner
  title: string;
  description: string;
  property_type: 'studio' | '1br' | '2br' | '3br' | 'house' | 'townhouse';
  price: number;
  price_period: 'monthly' | 'yearly';
  area_sqm: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  address: string;
  latitude: number;
  longitude: number;
  nearby_bts?: string[];
  nearby_mrt?: string[];
  status: 'draft' | 'active' | 'rented' | 'inactive';
  agent_access: 'public' | 'agent_only' | 'private'; // ⭐ Agent collaboration
  agent_commission_rate?: number; // ⭐ Commission rate for agents
  created_at: Date;
  updated_at: Date;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  order: number;
  uploaded_at: Date;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface PropertySave {
  id: string;
  user_id: string;
  property_id: string;
  saved_at: Date;
}
```

### 2.2 Property Search & Filter
**Endpoints:**
- `GET /api/properties` - Search properties with filters
- `GET /api/properties/:id` - Get property details
- `GET /api/properties/nearby` - Find properties near location
- `GET /api/properties/map` - Get properties for map view

**Search Parameters:**
```typescript
interface PropertySearchParams {
  query?: string; // Natural language search
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number; // km
  min_price?: number;
  max_price?: number;
  property_type?: string[];
  bedrooms?: number;
  bathrooms?: number;
  min_sqm?: number;
  max_sqm?: number;
  nearby_bts?: string[];
  nearby_mrt?: string[];
  amenities?: string[];
  agent_access?: 'public' | 'agent_only'; // ⭐ Agent-only listings
  page: number;
  limit: number;
  sort: 'price_asc' | 'price_desc' | 'newest' | 'nearest';
}
```

**AI Search:**
- Natural language processing: "2BR near BTS under 15,000 THB"
- Extract entities: bedrooms, location, price
- Convert to structured query
- Rank results by relevance

### 2.3 Property Management (Owner)
**Endpoints:**
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/images` - Upload images
- `DELETE /api/properties/:id/images/:imageId` - Delete image
- `PUT /api/properties/:id/status` - Change status

**Features:**
- Draft mode (not visible to public)
- Auto-SEO optimization (meta tags, descriptions)
- Image compression and CDN upload
- Bulk upload images
- Duplicate property template

### 2.4 Frontend Components
**Components:**
- `PropertySearch` - Search bar with filters
- `PropertyFilterPanel` - Filter sidebar
- `PropertyCard` - Property listing card
- `PropertyMap` - Map view with markers
- `PropertyGrid` - Grid view of listings
- `PropertyDetail` - Property detail page
- `PropertyForm` - Create/edit property form
- `ImageUploader` - Multi-image upload
- `AmenitySelector` - Amenity selection

**Pages:**
- `/listings` - Property search page
- `/listings/:id` - Property detail page
- `/owner/properties` - Owner's property management
- `/owner/properties/new` - Create new property
- `/owner/properties/:id/edit` - Edit property

---

## Phase 3: User Dashboards

### 3.1 Renter Dashboard
**Features:**
- Saved properties
- Booking history
- Active rentals
- Payment history
- Contract status
- Messages

**Endpoints:**
- `GET /api/renter/dashboard` - Dashboard summary
- `GET /api/renter/saved` - Saved properties
- `GET /api/renter/bookings` - Booking history
- `GET /api/renter/rentals` - Active rentals
- `GET /api/renter/payments` - Payment history

**Components:**
- `RenterDashboard` - Main dashboard
- `SavedProperties` - Saved properties list
- `BookingHistory` - Booking timeline
- `ActiveRentals` - Current rentals
- `PaymentHistory` - Payment records

### 3.2 Owner Dashboard
**Features:**
- Property overview
- Tenant management
- Rental income dashboard
- Maintenance requests
- Contract expirations
- Agent assignments

**Endpoints:**
- `GET /api/owner/dashboard` - Dashboard summary
- `GET /api/owner/properties` - Property list
- `GET /api/owner/tenants` - Tenant list
- `GET /api/owner/income` - Income reports
- `GET /api/owner/maintenance` - Maintenance requests
- `GET /api/owner/contracts` - Contract status

**Components:**
- `OwnerDashboard` - Main dashboard
- `PropertyOverview` - Property statistics
- `TenantManagement` - Tenant list and actions
- `IncomeDashboard` - Income charts and reports
- `MaintenanceRequests` - Maintenance tracking
- `ContractStatus` - Contract expiration alerts

### 3.3 Agent Dashboard
**Features:**
- Lead management
- Commission tracking
- Assigned properties
- Active contracts
- Performance metrics

**Endpoints:**
- `GET /api/agent/dashboard` - Dashboard summary
- `GET /api/agent/leads` - Lead list
- `GET /api/agent/commissions` - Commission history
- `GET /api/agent/properties` - Assigned properties
- `GET /api/agent/contracts` - Active contracts
- `GET /api/agent/performance` - Performance metrics

**Components:**
- `AgentDashboard` - Main dashboard
- `LeadManagement` - Lead inbox and actions
- `CommissionTracking` - Commission reports
- `AssignedProperties` - Properties assigned by owners
- `ActiveContracts` - Contract management
- `PerformanceMetrics` - KPI dashboard

---

## Phase 4: Agent-Owner Collaboration System ⭐

### 4.1 Database Schema (Extended)

**New Tables:**
- `agent_assignments` - Owner assigns agent to property
- `agent_referrals` - Agent refers to another agent
- `agent_requests` - Agent requests access to property
- `owner_agent_requests` - Owner requests agent
- `agent_commission_rates` - Custom commission rates
- `agent_performance` - Agent performance tracking

**Key Fields:**
```typescript
interface AgentAssignment {
  id: string;
  property_id: string;
  owner_id: string;
  agent_id: string;
  assignment_type: 'exclusive' | 'shared' | 'referral'; // ⭐
  commission_rate: number; // % of rent
  commission_type: 'one_time' | 'recurring'; // ⭐
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  expires_at?: Date; // For time-limited assignments
  created_at: Date;
  updated_at: Date;
}

interface AgentReferral {
  id: string;
  from_agent_id: string; // Agent to refer
  to_agent_id: string; // Agent being referred to
  property_id: string;
  referral_commission: number; // % of original commission
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: Date;
  responded_at?: Date;
}

interface AgentRequest {
  id: string;
  agent_id: string;
  property_id: string;
  owner_id: string;
  message: string;
  proposed_commission?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  responded_at?: Date;
}

interface OwnerAgentRequest {
  id: string;
  owner_id: string;
  property_id: string;
  required_agent_type?: 'residential' | 'commercial' | 'luxury';
  required_location?: string;
  required_experience?: number; // years
  budget_min?: number;
  budget_max?: number;
  message: string;
  status: 'open' | 'closed' | 'filled';
  created_at: Date;
  expires_at?: Date;
}

interface AgentCommissionRate {
  id: string;
  agent_id: string;
  property_id: string;
  base_rate: number;
  bonus_conditions?: string; // e.g., "rent within 30 days = +2%"
  created_at: Date;
}

interface AgentPerformance {
  id: string;
  agent_id: string;
  total_properties_assigned: number;
  total_properties_rented: number;
  total_commission_earned: number;
  average_rental_time: number; // days
  client_satisfaction_rate: number; // 1-5
  response_time_avg: number; // hours
  period_start: Date;
  period_end: Date;
}
```

### 4.2 Use Cases

#### 4.2.1 Owner Assigns Agent to Property
**Scenario:** Owner wants to assign an agent to manage their property.

**Flow:**
1. Owner goes to property detail page
2. Clicks "Assign Agent"
3. Selects agent from list (filtered by location, experience, rating)
4. Sets assignment type:
   - **Exclusive**: Only this agent can show the property
   - **Shared**: Multiple agents can show the property
   - **Referral**: Agent can refer to other agents
5. Sets commission rate (default 50% of first month's rent)
6. Sets commission type:
   - **One-time**: Commission on successful rental only
   - **Recurring**: Monthly commission (e.g., 5% of monthly rent)
7. Sends assignment request to agent
8. Agent accepts/rejects
9. If accepted, property marked as `agent_access: 'agent_only'`
10. Agent can now view and manage the property

**Endpoints:**
- `POST /api/owner/properties/:id/assign-agent` - Create assignment
- `GET /api/owner/properties/:id/assignments` - List assignments
- `PUT /api/owner/assignments/:id` - Update assignment
- `DELETE /api/owner/assignments/:id` - Cancel assignment
- `POST /api/agent/assignments/:id/accept` - Accept assignment
- `POST /api/agent/assignments/:id/reject` - Reject assignment

**Components:**
- `AgentAssignmentForm` - Assignment creation form
- `AgentSelector` - Agent selection with filters
- `CommissionRateInput` - Commission rate input
- `AssignmentTypeSelector` - Assignment type selection
- `AssignmentStatusBadge` - Status indicator

#### 4.2.2 Agent Finds Owner Properties (Agent-Only Listings)
**Scenario:** Agent wants to find properties that owners have opened for agent management.

**Flow:**
1. Agent goes to "Find Properties" page
2. Filters by `agent_access: 'agent_only'`
3. Views properties with commission rates
4. Filters by location, property type, commission rate
5. Clicks "Request Assignment" on interested property
6. Sends message to owner with proposed commission
7. Owner reviews request
8. Owner accepts/rejects
9. If accepted, assignment created

**Endpoints:**
- `GET /api/agent/available-properties` - Get agent-only properties
- `POST /api/agent/available-properties/:id/request` - Request assignment
- `GET /api/agent/assignment-requests` - List requests
- `PUT /api/owner/agent-requests/:id/respond` - Respond to request

**Components:**
- `AgentOnlyPropertyCard` - Property card with commission info
- `AssignmentRequestForm` - Request form with message
- `AssignmentRequestList` - List of incoming requests
- `RequestResponseModal` - Accept/reject modal

#### 4.2.3 Agent Refers to Another Agent
**Scenario:** Agent A cannot handle a property and wants to refer it to Agent B.

**Flow:**
1. Agent A views assigned property
2. Clicks "Refer to Another Agent"
3. Selects Agent B from list
4. Sets referral commission (e.g., 20% of Agent A's commission)
5. Adds reason for referral
6. Sends referral request to Agent B
7. Agent B reviews referral
8. Agent B accepts/rejects
9. If accepted:
   - Property reassigned to Agent B
   - Agent A receives referral commission when property rents
   - Commission split: Agent B gets 80%, Agent A gets 20%

**Endpoints:**
- `POST /api/agent/assignments/:id/refer` - Create referral
- `GET /api/agent/referrals/sent` - Sent referrals
- `GET /api/agent/referrals/received` - Received referrals
- `POST /api/agent/referrals/:id/accept` - Accept referral
- `POST /api/agent/referrals/:id/reject` - Reject referral

**Components:**
- `ReferralForm` - Referral creation form
- `AgentSelector` - Agent selection
- `ReferralCommissionInput` - Referral commission input
- `ReferralList` - List of referrals
- `ReferralStatusBadge` - Status indicator

**Referral Commission Calculation:**
```
Original commission: 50% of first month's rent (e.g., 10,000 THB)
Referral commission: 20% of original commission (2,000 THB)

If property rents:
- Agent B (referred agent): 8,000 THB (80%)
- Agent A (referring agent): 2,000 THB (20%)
```

#### 4.2.4 Owner Finds Agent (Agent Marketplace)
**Scenario:** Owner wants to find an agent to manage their property.

**Flow:**
1. Owner goes to "Find Agent" page
2. Filters agents by:
   - Location (nearby agents)
   - Experience (years in business)
   - Specialty (residential, commercial, luxury)
   - Rating (average rating from reviews)
   - Response time (average response time)
   - Commission rate (typical commission rate)
   - Availability (currently active or not)
3. Views agent profiles with:
   - Total properties managed
   - Properties rented successfully
   - Average time to rent
   - Client satisfaction rate
   - Recent reviews
4. Clicks "Request Agent" on interested agent
5. Creates request with:
   - Property details
   - Required commission rate
   - Assignment type (exclusive/shared)
   - Message
6. Agent reviews request
7. Agent accepts/rejects
8. If accepted, assignment created

**Endpoints:**
- `GET /api/owner/agents` - Search agents
- `GET /api/owner/agents/:id` - Get agent profile
- `POST /api/owner/agents/:id/request` - Request agent
- `GET /api/owner/agent-requests` - List requests
- `PUT /api/owner/agent-requests/:id/cancel` - Cancel request

**Components:**
- `AgentSearch` - Agent search with filters
- `AgentCard` - Agent profile card
- `AgentProfile` - Detailed agent profile
- `AgentRequestForm` - Request creation form
- `AgentRequestList` - List of requests

**Agent Profile Data:**
```typescript
interface AgentProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  rating: number; // 1-5
  total_reviews: number;
  experience_years: number;
  specialties: string[];
  location: string;
  latitude: number;
  longitude: number;
  typical_commission_rate: number;
  response_time_avg: number; // hours
  total_properties_assigned: number;
  total_properties_rented: number;
  average_rental_time: number; // days
  client_satisfaction_rate: number;
  is_available: boolean;
  created_at: Date;
}
```

#### 4.2.5 Agent-to-Agent Collaboration (Co-brokering)
**Scenario:** Two agents want to collaborate on a property (co-brokering).

**Flow:**
1. Agent A has exclusive assignment to property
2. Agent A wants to collaborate with Agent B
3. Agent A sends co-broker request to Agent B
4. Sets commission split (e.g., 50/50)
5. Agent B reviews request
6. Agent B accepts/rejects
7. If accepted:
   - Both agents can show the property
   - Commission split as agreed
   - Both agents get credit for rental

**Endpoints:**
- `POST /api/agent/assignments/:id/co-broker` - Create co-broker request
- `GET /api/agent/co-broker-requests` - List co-broker requests
- `POST /api/agent/co-broker-requests/:id/accept` - Accept
- `POST /api/agent/co-broker-requests/:id/reject` - Reject

**Components:**
- `CoBrokerForm` - Co-broker request form
- `CommissionSplitInput` - Commission split input
- `CoBrokerRequestList` - List of requests

### 4.3 Commission System

#### 4.3.1 Commission Calculation
**Commission Types:**
1. **One-time Commission**: Commission on successful rental
   - Typically 50% of first month's rent
   - Paid when contract is signed

2. **Recurring Commission**: Monthly commission
   - Typically 5-10% of monthly rent
   - Paid every month for contract duration

3. **Referral Commission**: Commission for referring agent
   - Typically 20% of original commission
   - Paid when property rents

**Commission Tracking:**
```typescript
interface Commission {
  id: string;
  agent_id: string;
  property_id: string;
  contract_id: string;
  type: 'one_time' | 'recurring' | 'referral';
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  due_date: Date;
  paid_date?: Date;
  created_at: Date;
}
```

**Endpoints:**
- `GET /api/agent/commissions` - List commissions
- `GET /api/agent/commissions/:id` - Get commission details
- `POST /api/agent/commissions/:id/claim` - Claim commission
- `GET /api/agent/commissions/summary` - Commission summary

### 4.4 Frontend Components

**Agent Assignment Components:**
- `AgentAssignmentPanel` - Assignment management panel
- `AssignmentRequestModal` - Request modal
- `AssignmentStatusCard` - Status card
- `CommissionRateDisplay` - Commission rate display
- `ReferralForm` - Referral form
- `CoBrokerForm` - Co-broker form

**Agent Marketplace Components:**
- `AgentSearchPage` - Agent search page
- `AgentFilterPanel` - Agent filter sidebar
- `AgentProfileCard` - Agent profile card
- `AgentProfilePage` - Detailed agent profile
- `AgentRequestModal` - Request modal

**Commission Components:**
- `CommissionDashboard` - Commission dashboard
- `CommissionList` - Commission list
- `CommissionDetail` - Commission detail
- `CommissionClaimModal` - Claim modal

---

## Phase 5: Chat System

### 5.1 Database Schema
**Tables:**
- `chat_rooms` - Chat rooms
- `chat_participants` - Room participants
- `messages` - Chat messages
- `message_attachments` - Message attachments
- `message_reads` - Read receipts

**Key Fields:**
```typescript
interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | 'property' | 'contract';
  property_id?: string;
  contract_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'renter' | 'agent';
  joined_at: Date;
  last_read_at?: Date;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  created_at: Date;
}

interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}
```

### 5.2 Real-time Chat
**Technology:** WebSocket (Socket.io or native WebSocket)

**Events:**
- `message:send` - Send message
- `message:receive` - Receive message
- `message:read` - Mark as read
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `user:join` - User joined room
- `user:leave` - User left room

**Endpoints:**
- `GET /api/chat/rooms` - List chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:id/messages` - Get messages
- `POST /api/chat/rooms/:id/messages` - Send message
- `POST /api/chat/rooms/:id/read` - Mark as read
- `POST /api/chat/rooms/:id/typing` - Typing indicator

### 5.3 Frontend Components
**Components:**
- `ChatList` - List of chat rooms
- `ChatRoom` - Chat room view
- `MessageList` - Message list
- `MessageInput` - Message input
- `MessageBubble` - Message bubble
- `TypingIndicator` - Typing indicator
- `AttachmentUploader` - File upload

---

## Phase 6: Booking System

### 6.1 Database Schema
**Tables:**
- `bookings` - Viewing bookings
- `booking_slots` - Available time slots
- `booking_reminders` - Booking reminders

**Key Fields:**
```typescript
interface Booking {
  id: string;
  property_id: string;
  renter_id: string;
  agent_id?: string;
  scheduled_date: Date;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface BookingSlot {
  id: string;
  property_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  is_available: boolean;
}
```

### 6.2 Booking Flow
**Endpoints:**
- `GET /api/properties/:id/slots` - Get available slots
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

**Components:**
- `BookingCalendar` - Calendar view
- `BookingForm` - Booking form
- `BookingList` - Booking list
- `BookingDetail` - Booking detail

---

## Phase 7: Payment System

### 7.1 Database Schema
**Tables:**
- `payments` - Payment records
- `payment_qr_codes` - QR code records
- `payment_reminders` - Payment reminders

**Key Fields:**
```typescript
interface Payment {
  id: string;
  contract_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  payment_method: 'promptpay' | 'bank_transfer' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  due_date: Date;
  paid_date?: Date;
  qr_code_url?: string;
  reference_number?: string;
  created_at: Date;
}
```

### 7.2 PromptPay Integration
**Endpoints:**
- `POST /api/payments/qr` - Generate QR code
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments` - List payments

**Flow:**
1. Generate QR code for payment
2. User scans QR with PromptPay app
3. Payment processed via bank
4. Webhook notification received
5. Update payment status
6. Send notification to payer and receiver

### 7.3 Frontend Components
**Components:**
- `PaymentQRCode` - QR code display
- `PaymentForm` - Payment form
- `PaymentList` - Payment list
- `PaymentDetail` - Payment detail
- `PaymentReminder` - Reminder notification

---

## Phase 8: Contract System

### 8.1 Database Schema
**Tables:**
- `contracts` - Rental contracts
- `contract_versions` - Contract version history
- `contract_signatures` - E-signatures
- `contract_documents` - Contract documents

**Key Fields:**
```typescript
interface Contract {
  id: string;
  property_id: string;
  renter_id: string;
  owner_id: string;
  agent_id?: string;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  deposit_amount: number;
  status: 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
  created_at: Date;
  updated_at: Date;
}

interface ContractSignature {
  id: string;
  contract_id: string;
  signer_id: string;
  signer_role: 'renter' | 'owner' | 'agent';
  signature_data: string; // Base64 signature
  signed_at: Date;
  ip_address: string;
}

interface ContractVersion {
  id: string;
  contract_id: string;
  version_number: number;
  content: string; // JSON or PDF
  created_by: string;
  created_at: Date;
}
```

### 8.2 Contract Flow
**Endpoints:**
- `POST /api/contracts` - Create contract
- `GET /api/contracts/:id` - Get contract
- `PUT /api/contracts/:id` - Update contract
- `POST /api/contracts/:id/sign` - Sign contract
- `GET /api/contracts/:id/versions` - Get version history
- `POST /api/contracts/:id/renew` - Renew contract

**Components:**
- `ContractForm` - Contract creation form
- `ContractPreview` - Contract preview
- `ContractSignaturePad` - E-signature pad
- `ContractStatusBadge` - Status indicator
- `ContractTimeline` - Contract timeline

---

## Phase 9: KYC System

### 9.1 Database Schema
**Tables:**
- `kyc_verifications` - KYC verification records
- `kyc_documents` - KYC documents
- `kyc_attempts` - KYC attempt logs

**Key Fields:**
```typescript
interface KYCVerification {
  id: string;
  user_id: string;
  verification_method: 'ndid' | 'liveness' | 'manual';
  status: 'pending' | 'verified' | 'rejected';
  ndid_reference_id?: string;
  liveness_score?: number;
  rejection_reason?: string;
  verified_at?: Date;
  created_at: Date;
}

interface KYCDocument {
  id: string;
  verification_id: string;
  document_type: 'id_card' | 'passport' | 'driver_license' | 'other';
  document_url: string;
  extracted_data?: string; // JSON
  created_at: Date;
}
```

### 9.2 NDID Integration
**Endpoints:**
- `POST /api/kyc/ndid/initiate` - Initiate NDID verification
- `POST /api/kyc/ndid/callback` - NDID callback
- `GET /api/kyc/ndid/status/:id` - Check NDID status

### 9.3 Liveness Check
**Endpoints:**
- `POST /api/kyc/liveness/initiate` - Initiate liveness check
- `POST /api/kyc/liveness/verify` - Verify liveness
- `POST /api/kyc/liveness/upload` - Upload liveness video

### 9.4 Frontend Components
**Components:**
- `KYCInitiationForm` - KYC initiation form
- `NDIDVerification` - NDID verification flow
- `LivenessCheck` - Liveness check camera
- `DocumentUploader` - Document upload
- `KYCStatusBadge` - Status indicator

---

## Phase 10: Rating & Review System

### 10.1 Database Schema
**Tables:**
- `reviews` - User reviews
- `review_responses` - Review responses

**Key Fields:**
```typescript
interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  contract_id?: string;
  property_id?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  categories: {
    communication?: number;
    professionalism?: number;
    responsiveness?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}
```

### 10.2 Review Flow
**Endpoints:**
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List reviews
- `GET /api/reviews/:id` - Get review
- `POST /api/reviews/:id/respond` - Respond to review
- `POST /api/reviews/:id/report` - Report review

**Anti-Fraud Measures:**
- Only users with completed contracts can review
- One review per contract
- IP address tracking
- Suspicious pattern detection
- Manual review for flagged reviews

### 10.3 Frontend Components
**Components:**
- `ReviewForm` - Review creation form
- `ReviewList` - Review list
- `ReviewCard` - Review card
- `RatingStars` - Star rating input
- `ReviewResponseForm` - Response form

---

## Phase 11: Notification System

### 11.1 Database Schema
**Tables:**
- `notifications` - Notification records
- `notification_preferences` - User preferences
- `notification_logs` - Sent logs

**Key Fields:**
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'payment' | 'message' | 'contract' | 'review' | 'system';
  title: string;
  content: string;
  data?: string; // JSON
  channels: ('in_app' | 'email' | 'line' | 'push')[];
  read: boolean;
  created_at: Date;
}

interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  line_enabled: boolean;
  push_enabled: boolean;
}
```

### 11.2 LINE OA Integration
**Endpoints:**
- `POST /api/notifications/line/send` - Send LINE message
- `POST /api/notifications/line/webhook` - LINE webhook
- `GET /api/notifications/line/link` - Get LINE link token

**Notification Types:**
- New booking request
- Payment reminder
- Contract expiration
- New message
- Review received
- Commission earned

### 11.3 Frontend Components
**Components:**
- `NotificationCenter` - Notification center
- `NotificationList` - Notification list
- `NotificationBadge` - Unread badge
- `NotificationPreferences` - Preferences form
- `LINEConnectButton` - LINE connect button

---

## Phase 12: Credit System

### 12.1 Database Schema
**Tables:**
- `credits` - Credit balance
- `credit_transactions` - Transaction history
- `credit_packages` - Available packages

**Key Fields:**
```typescript
interface Credit {
  id: string;
  agent_id: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

interface CreditTransaction {
  id: string;
  credit_id: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  description: string;
  reference_id?: string;
  created_at: Date;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonus_credits?: number;
  is_active: boolean;
}
```

### 12.2 Credit Usage
**Credit Costs:**
- Boost listing: 10 credits/day
- Priority matching: 5 credits/match
- Featured listing: 20 credits/week
- Contact renter: 2 credits/contact

**Endpoints:**
- `GET /api/credits` - Get credit balance
- `GET /api/credits/transactions` - Transaction history
- `POST /api/credits/purchase` - Purchase credits
- `GET /api/credits/packages` - Available packages

### 12.3 Frontend Components
**Components:**
- `CreditBalance` - Balance display
- `CreditTransactionList` - Transaction list
- `CreditPackageCard` - Package card
- `PurchaseModal` - Purchase modal

---

## Phase 13: Maintenance System

### 13.1 Database Schema
**Tables:**
- `maintenance_requests` - Maintenance requests
- `maintenance_updates` - Request updates
- `maintenance_assignments` - Technician assignments

**Key Fields:**
```typescript
interface MaintenanceRequest {
  id: string;
  property_id: string;
  contract_id: string;
  reported_by: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'other';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
}
```

### 13.2 Maintenance Flow
**Endpoints:**
- `POST /api/maintenance` - Create request
- `GET /api/maintenance` - List requests
- `PUT /api/maintenance/:id` - Update request
- `POST /api/maintenance/:id/assign` - Assign technician
- `POST /api/maintenance/:id/complete` - Mark as complete

### 13.3 Frontend Components
**Components:**
- `MaintenanceForm` - Request form
- `MaintenanceList` - Request list
- `MaintenanceDetail` - Request detail
- `MaintenanceTimeline` - Status timeline

---

## Phase 14: Admin Dashboard

### 14.1 Database Schema
**Tables:**
- `admin_users` - Admin accounts
- `admin_actions` - Action logs
- `disputes` - Dispute records

**Key Fields:**
```typescript
interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'moderator' | 'support';
  permissions: string[];
  created_at: Date;
}

interface Dispute {
  id: string;
  type: 'payment' | 'contract' | 'property' | 'behavior';
  reporter_id: string;
  reported_id: string;
  contract_id?: string;
  property_id?: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  created_at: Date;
  resolved_at?: Date;
}
```

### 14.2 Admin Features
**User Management:**
- View all users
- Suspend/ban users
- View user activity
- Reset user passwords

**Property Management:**
- Review pending properties
- Approve/reject properties
- Flag inappropriate content
- Remove properties

**Dispute Resolution:**
- View disputes
- Investigate disputes
- Make decisions
- Communicate with parties

**System Monitoring:**
- View system metrics
- Monitor API performance
- Check error logs
- View usage statistics

### 14.3 Frontend Components
**Components:**
- `AdminDashboard` - Main dashboard
- `UserManagement` - User management
- `PropertyModeration` - Property moderation
- `DisputeResolution` - Dispute management
- `SystemMonitor` - System monitoring

---

## Implementation Priority

### Phase 1 (Week 1-2)
1. Database schema design
2. Authentication system
3. Basic user profiles

### Phase 2 (Week 3-4)
4. Property listings system
5. Property search and filter
6. Property management for owners

### Phase 3 (Week 5-6)
7. User dashboards (Renter, Owner, Agent)
8. Basic property assignment

### Phase 4 (Week 7-8) ⭐ CRITICAL
9. **Agent-Owner collaboration system**
10. Agent marketplace
11. Agent referrals
12. Commission system

### Phase 5-6 (Week 9-10)
13. Chat system
14. Booking system
15. Payment system

### Phase 7-8 (Week 11-12)
16. Contract system
17. KYC system
18. Rating & review system

### Phase 9-10 (Week 13-14)
19. Notification system
20. Credit system
21. Maintenance system

### Phase 11 (Week 15-16)
22. Admin dashboard
23. Testing and QA
24. Deployment

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Maps**: Google Maps API / Mapbox

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Refresh Tokens
- **File Storage**: AWS S3 / R2
- **Real-time**: Socket.io Server
- **Queue**: BullMQ (Redis)
- **Email**: SendGrid / AWS SES
- **SMS**: Twilio / LINE Messaging API

### Third-party Integrations
- **NDID**: Thai NDID platform
- **LINE OA**: LINE Messaging API
- **PromptPay**: Thai PromptPay API
- **Payment**: KPlus / SCB Easy API
- **Maps**: Google Maps API
- **OCR**: Google Vision API (for document extraction)

---

## Security Considerations

### Authentication & Authorization
- JWT access tokens (15 min expiry)
- Refresh token rotation (30 days)
- Rate limiting on all endpoints
- IP-based blocking for suspicious activity
- Role-based access control (RBAC)

### Data Protection
- Encryption at rest (database)
- Encryption in transit (TLS 1.3)
- PII data masking in logs
- Secure file upload validation
- SQL injection prevention (ORM parameterized queries)

### Payment Security
- PCI DSS compliance
- Secure QR code generation
- Payment verification via bank API
- Fraud detection system
- Audit trail for all transactions

### KYC Security
- NDID integration for identity verification
- Liveness check for biometric verification
- Document OCR with fraud detection
- Secure document storage
- PDPA compliance

---

## Testing Strategy

### Unit Tests
- Business logic functions
- Utility functions
- Data validation schemas
- Custom hooks

### Integration Tests
- API endpoints
- Database operations
- Third-party integrations
- Authentication flows

### E2E Tests
- Critical user flows:
  - Registration and login
  - Property search and booking
  - Payment processing
  - Contract signing
  - Agent assignment

### Performance Tests
- Load testing for high traffic
- Database query optimization
- API response time monitoring
- WebSocket connection stability

---

## Deployment Strategy

### Development
- Local development with Docker Compose
- Feature branches
- Pull request reviews
- Automated testing on PR

### Staging
- Staging environment on AWS
- Automated deployment on merge to main
- Integration testing
- Performance monitoring

### Production
- Production environment on AWS
- Blue-green deployment
- Canary releases for critical features
- Rollback capability
- 24/7 monitoring and alerting

---

## Monitoring & Observability

### Metrics
- API response times
- Database query performance
- Error rates
- User engagement metrics
- Conversion rates

### Logging
- Structured JSON logs
- Centralized log aggregation (Grafana Loki)
- Error tracking (Sentry)
- Audit logs for sensitive operations

### Alerts
- High error rate alerts
- Performance degradation alerts
- Security incident alerts
- Payment failure alerts
- System downtime alerts

---

## Documentation

### API Documentation
- OpenAPI/Swagger specification
- Endpoint documentation
- Request/response examples
- Error code reference

### User Documentation
- User guides for each role
- Video tutorials
- FAQ section
- Support contact information

### Developer Documentation
- Architecture documentation
- Database schema documentation
- Integration guides
- Deployment guides

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building the PrimeRent platform, with special emphasis on the Agent-Owner collaboration system. The phased approach allows for iterative development and testing, ensuring each module is thoroughly validated before moving to the next phase.

The Agent-Owner collaboration system (Phase 4) is highlighted as a critical differentiator, enabling:
- Owners to easily find and assign agents
- Agents to discover and request agent-only properties
- Agent-to-agent referrals for collaboration
- Transparent commission tracking
- Performance-based agent matching

By following this plan, the PrimeRent platform will be built on a solid foundation with scalability, security, and user experience as top priorities.
