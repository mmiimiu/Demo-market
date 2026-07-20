# BaanDee API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://baandee.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

Get the ID token from Firebase Auth after user login.

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Authentication

#### GET /api/auth/me
Get current authenticated user profile.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "profile": {
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "displayName": "สมชาย ใจดี",
      "avatar": "https://..."
    },
    "role": "user",
    "language": "th",
    "currency": "THB",
    "verified": {
      "email": true,
      "phone": true,
      "ndid": false,
      "agent": false
    }
  }
}
```

#### PUT /api/auth/me
Update current user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "profile": {
    "firstName": "สมชาย",
    "lastName": "ใจดี"
  },
  "language": "th",
  "currency": "THB",
  "notifications": {
    "email": true,
    "sms": false,
    "line": true
  }
}
```

---

### Properties

#### GET /api/properties
List properties with filters and pagination.

**Authentication:** Optional

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Property status (default: "available")
- `type` (string): Property type (condo, house, apartment, villa, townhouse)
- `priceMin` (number): Minimum price
- `priceMax` (number): Maximum price
- `province` (string): Province name
- `district` (string): District name
- `bedrooms` (number): Minimum bedrooms
- `sqmMin` (number): Minimum square meters
- `amenities` (string): Comma-separated amenities
- `petFriendly` (boolean): Pet friendly filter
- `furnished` (boolean): Furnished filter
- `sortBy` (string): Sort field (default: "createdAt")
- `sortOrder` (string): Sort order (asc, desc)

**Example:**
```
GET /api/properties?type=condo&priceMin=10000&priceMax=30000&province=กรุงเทพมหานคร&bedrooms=2
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prop123",
      "name": {
        "th": "ลุมพินี พาร์ค ริเวอร์ไซด์ พระราม 3",
        "en": "Lumpini Park Riverside Rama 3",
        "cn": "..."
      },
      "type": "condo",
      "price": 25000,
      "deposit": 50000,
      "location": {
        "address": {...},
        "province": "กรุงเทพมหานคร",
        "coordinates": {
          "latitude": 13.7563,
          "longitude": 100.5018
        },
        "nearestBTS": "สุรศักดิ์",
        "distanceToBTS": 500
      },
      "details": {
        "bedrooms": 2,
        "bathrooms": 2,
        "sqm": 65,
        "floor": 15,
        "furnished": true,
        "petFriendly": false
      },
      "amenities": ["pool", "gym", "parking", "security"],
      "media": {
        "photos": ["https://...", "https://..."],
        "thumbnailUrl": "https://..."
      },
      "status": "available",
      "verified": true,
      "views": 1234,
      "saves": 56
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

#### POST /api/properties
Create a new property listing.

**Authentication:** Required (Owner or Agent role)

**Request Body:**
```json
{
  "name": {
    "th": "คอนโดสวยใกล้ BTS",
    "en": "Beautiful Condo Near BTS",
    "cn": "..."
  },
  "type": "condo",
  "price": 25000,
  "deposit": 50000,
  "location": {
    "address": {...},
    "province": "กรุงเทพมหานคร",
    "district": "ยานนาวา",
    "subdistrict": "ช่องนนทรี",
    "postalCode": "10120",
    "coordinates": {
      "latitude": 13.7563,
      "longitude": 100.5018
    }
  },
  "details": {
    "bedrooms": 2,
    "bathrooms": 2,
    "sqm": 65,
    "floor": 15,
    "furnished": true,
    "petFriendly": false
  },
  "amenities": ["pool", "gym", "parking"],
  "media": {
    "photos": ["https://...", "https://..."],
    "thumbnailUrl": "https://..."
  },
  "ownerId": "user123"
}
```

#### GET /api/properties/:id
Get property details by ID.

**Authentication:** Optional

**Response:** Single property object

#### PUT /api/properties/:id
Update property details.

**Authentication:** Required (Owner of property or Admin)

**Request Body:** Partial property object

#### DELETE /api/properties/:id
Delete a property.

**Authentication:** Required (Owner of property or Admin)

---

### Search

#### POST /api/search/smart
AI-powered natural language search.

**Authentication:** Optional

**Request Body:**
```json
{
  "query": "หาคอนโดใกล้ BTS ราคาไม่เกิน 20000 บาท 2 ห้องนอน",
  "language": "th"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "หาคอนโดใกล้ BTS ราคาไม่เกิน 20000 บาท 2 ห้องนอน",
    "structured": {
      "type": ["condo"],
      "priceMax": 20000,
      "bedrooms": 2,
      "location": {
        "nearBTS": true
      }
    },
    "intent": "location_search",
    "confidence": 0.85
  }
}
```

---

### Inquiries

#### GET /api/inquiries
List inquiries (filtered by user role).

**Authentication:** Required

**Query Parameters:**
- `status` (string): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inq123",
      "userId": "user123",
      "propertyId": "prop123",
      "ownerId": "owner123",
      "agentId": "agent123",
      "message": "สนใจห้องนี้ครับ สะดวกนัดดูเมื่อไหร่ครับ",
      "status": "new",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/inquiries
Create a new inquiry for a property.

**Authentication:** Required

**Request Body:**
```json
{
  "propertyId": "prop123",
  "message": "สนใจห้องนี้ครับ สะดวกนัดดูเมื่อไหร่ครับ",
  "preferredMoveInDate": "2025-02-01",
  "leaseDuration": 12,
  "budget": {
    "min": 20000,
    "max": 25000
  }
}
```

---

### Payments

#### POST /api/payments/qr
Generate PromptPay QR code for payment.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 50000,
  "description": "เงินมัดจำ - ลุมพินี พาร์ค",
  "type": "deposit",
  "propertyId": "prop123",
  "recipientId": "owner123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay123",
    "qrCodeUrl": "https://api.omise.co/charges/chrg.../qr_code.png",
    "amount": 50000,
    "currency": "THB",
    "expiresAt": "2025-01-15T11:00:00Z",
    "chargeId": "chrg_test_..."
  }
}
```

#### POST /api/payments/webhook
Handle Omise webhook events (internal use).

**Authentication:** Omise signature verification

---

## Rate Limiting

- **Default:** 100 requests per minute per user
- **Burst:** 200 requests per minute
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when the limit resets (Unix timestamp)

---

## Webhooks

### Omise Payment Webhook

**URL:** `POST /api/payments/webhook`

**Events:**
- `charge.complete` - Payment completed successfully
- `charge.failed` - Payment failed
- `charge.pending` - Payment is processing
- `transfer.create` - Transfer created
- `transfer.paid` - Transfer completed
- `transfer.failed` - Transfer failed

**Signature Verification:**
The webhook payload is signed with HMAC-SHA256 using your Omise secret key.

### LINE Webhook

**URL:** `POST /api/line/webhook`

**Events:**
- `message` - User sent a message
- `follow` - User followed the OA
- `unfollow` - User unfollowed the OA
- `join` - Bot joined a group/room
- `leave` - Bot left a group/room
- `postback` - User interacted with button

---

## Testing

### Test Credentials

**Omise Test Cards:**
```
Success: 4242424242424242
Failure: 4111111111111111
```

**Test PromptPay:**
Use Omise test environment for QR code generation.

### Example API Calls

**Using curl:**
```bash
# Get properties
curl -X GET "https://api.baandee.com/api/properties?type=condo&priceMax=30000"

# Create inquiry (with auth)
curl -X POST "https://api.baandee.com/api/inquiries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop123",
    "message": "สนใจห้องนี้ครับ"
  }'
```

**Using JavaScript:**
```javascript
// Get current user
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`
  }
});
const { data } = await response.json();
```

---

## SDK Examples

### Firebase Auth Token

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // Use token in API calls
}
```

### API Client Helper

```typescript
class BaanDeeAPI {
  private baseURL = '/api';
  
  async request(endpoint: string, options: RequestInit = {}) {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  }
  
  properties = {
    list: (params?: any) => this.request(`/properties?${new URLSearchParams(params)}`),
    get: (id: string) => this.request(`/properties/${id}`),
    create: (data: any) => this.request('/properties', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => this.request(`/properties/${id}`, { method: 'DELETE' }),
  };
}

export const api = new BaanDeeAPI();
```

---

## Support

For API support, contact:
- Email: dev@baandee.com
- Documentation: https://docs.baandee.com
- Status Page: https://status.baandee.com
