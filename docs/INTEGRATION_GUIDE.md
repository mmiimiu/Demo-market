# BaanDee Integration Guide

## Overview

This guide covers all external service integrations for the BaanDee platform.

---

## 1. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "BaanDee"
3. Enable Google Analytics (optional)

### Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable the following providers:
   - **Email/Password**
   - **Google**
   - **Phone** (for OTP)
   - **Anonymous** (optional)

3. For LINE Login:
   - Add LINE as custom OAuth provider
   - Use LINE Login Channel credentials

### Setup Firestore Database

1. Go to Firestore Database
2. Create database in production mode
3. Choose location: `asia-southeast1` (Singapore)
4. Deploy security rules from `docs/FIRESTORE_SECURITY_RULES.md`

### Setup Cloud Storage

1. Go to Storage
2. Get started
3. Use production mode
4. Deploy storage rules

### Get Firebase Credentials

1. Project Settings > General
2. Copy Web API Key, Project ID, etc.
3. Project Settings > Service Accounts
4. Generate new private key (for Firebase Admin)

### Environment Variables

```bash
# Client-side (safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=baandee.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=baandee
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=baandee.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Server-side (keep secret)
FIREBASE_ADMIN_PROJECT_ID=baandee
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@baandee.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 2. Omise Payment Gateway

### Create Omise Account

1. Go to [Omise Dashboard](https://dashboard.omise.co/)
2. Sign up for Thailand account
3. Complete KYC verification

### Get API Keys

1. Dashboard > API Keys
2. Copy Test keys for development
3. Copy Live keys for production

### Environment Variables

```bash
# Test keys (for development)
OMISE_PUBLIC_KEY=pkey_test_5xxxxxxxxxxxxxxxxxxxxx
OMISE_SECRET_KEY=skey_test_5xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_5xxxxxxxxxxxxxxxxxxxxx

# Live keys (for production)
# OMISE_PUBLIC_KEY=pkey_5xxxxxxxxxxxxxxxxxxxxx
# OMISE_SECRET_KEY=skey_5xxxxxxxxxxxxxxxxxxxxx
```

### Setup Webhook

1. Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Subscribe to events:
   - `charge.complete`
   - `charge.failed`
   - `transfer.create`
   - `transfer.paid`
   - `transfer.failed`

### Test Cards

```
Success: 4242424242424242
Failure: 4111111111111111
CVV: Any 3 digits
Expiry: Any future date
```

---

## 3. LINE Messaging API

### Create LINE Official Account

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create new provider
3. Create new Messaging API channel

### Get Channel Credentials

1. Channel Settings > Basic Settings
   - Copy Channel ID
   - Copy Channel Secret
   
2. Messaging API > Channel Access Token
   - Issue new token
   - Copy token (long-lived)

### Environment Variables

```bash
LINE_CHANNEL_ACCESS_TOKEN=Your_Channel_Access_Token_Here
LINE_CHANNEL_SECRET=your_channel_secret
```

### Setup Webhook

1. Messaging API > Webhook Settings
2. Webhook URL: `https://yourdomain.com/api/line/webhook`
3. Enable "Use webhook"
4. Enable "Webhook redelivery"

### Enable LINE Login

1. Create LINE Login channel (separate from Messaging API)
2. Get Login Channel ID and Secret
3. Add callback URL: `https://yourdomain.com/api/auth/callback/line`

```bash
LINE_LOGIN_CHANNEL_ID=1234567890
LINE_LOGIN_CHANNEL_SECRET=your_login_secret
```

### Rich Menu Setup

Create rich menu via LINE API or Dashboard:
- **Home**: Search properties
- **Favorites**: Saved listings
- **Messages**: Chat with agents
- **Profile**: User settings

---

## 4. Google Maps Platform

### Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Distance Matrix API
   - Maps Static API (optional, for thumbnails)

### Get API Key

1. APIs & Services > Credentials
2. Create credentials > API Key
3. Restrict key:
   - **Application restrictions**: HTTP referrers (for browser key)
   - **API restrictions**: Select enabled APIs

### Environment Variables

```bash
# Browser key (restricted to your domains)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB...

# Server key (optional, IP-restricted)
GOOGLE_MAPS_SERVER_API_KEY=AIzaSyC...
```

### Cost Optimization

1. Enable billing alerts
2. Set daily quotas
3. Cache geocoding results in Firestore
4. Use Maps Static API for property thumbnails (10x cheaper)

---

## 5. Cloudinary

### Create Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free tier
3. Upgrade to Essentials ($99/mo) when needed

### Get Credentials

1. Dashboard > Settings
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

### Environment Variables

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=baandee_properties
```

### Create Upload Preset

1. Settings > Upload
2. Add upload preset:
   - Name: `baandee_properties`
   - Signing Mode: Signed
   - Folder: `properties`
   - Auto-tagging: Enable
   - Auto-optimization: Enable (quality: auto, format: auto)

### Transformations

Use URL-based transformations:
```
https://res.cloudinary.com/{cloud_name}/image/upload/w_800,h_600,c_fill,q_auto,f_auto/{public_id}
```

---

## 6. Twilio SMS

### Create Account

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up and verify your account
3. Get a Thai phone number (for SMS OTP)

### Get Credentials

1. Dashboard > Account Info
2. Copy:
   - Account SID
   - Auth Token
   - Phone Number

### Environment Variables

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+66xxxxxxxxx
```

### Cost Optimization

- Use THAIBULKSMS for production (cheaper for Thai numbers)
- Implement smart retry: SMS → Email fallback
- Rate limit OTP: 3 attempts per 15 minutes

### Alternative: THAIBULKSMS

For production, consider Thai SMS providers:

```bash
THAIBULKSMS_API_KEY=your_api_key
THAIBULKSMS_SECRET=your_secret
```

---

## 7. SendGrid Email

### Create Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for free tier (100 emails/day)
3. Verify sender identity

### Create API Key

1. Settings > API Keys
2. Create API Key with full access
3. Copy key (shown once)

### Environment Variables

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@baandee.com
SENDGRID_FROM_NAME=BaanDee
```

### Verify Sender

1. Settings > Sender Authentication
2. Verify single sender or domain
3. Add SPF and DKIM records to DNS

### Create Email Templates (Optional)

1. Email API > Dynamic Templates
2. Create templates for:
   - Welcome email
   - Email verification
   - Password reset
   - Payment receipt

---

## 8. NDID (Phase 2)

### Register as Service Provider

1. Contact NDID Co., Ltd.
2. Submit application with business documents
3. Wait for approval (2-4 weeks)
4. Complete integration testing

### Environment Variables

```bash
NDID_API_URL=https://api.ndid.co.th
NDID_API_KEY=your_ndid_api_key
NDID_NAMESPACE=your_namespace
NDID_SERVICE_ID=your_service_id
```

### Cost

- Registration fee: ~฿50,000-100,000
- Integration fee: ~฿200,000-500,000
- Per transaction: ~฿5-20

---

## Development vs Production

### Development Environment

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Use test/sandbox keys for all services
OMISE_PUBLIC_KEY=pkey_test_...
LINE_CHANNEL_ACCESS_TOKEN=test_token
```

### Production Environment

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://baandee.com

# Use live/production keys
OMISE_PUBLIC_KEY=pkey_...
LINE_CHANNEL_ACCESS_TOKEN=live_token
```

---

## Testing Integrations

### 1. Firebase

```bash
# Install Firebase Emulators
npm install -g firebase-tools
firebase login
firebase init emulators

# Start emulators
firebase emulators:start
```

### 2. Omise

Use test mode and test cards (see Omise section above)

### 3. LINE

Create separate test channel or use webhook tester:
```bash
ngrok http 3001
# Use ngrok URL for LINE webhook
```

### 4. Google Maps

Use API key restrictions to prevent abuse:
- HTTP referrers: `localhost:3001/*`, `*.baandee.com/*`
- Daily quota: 1,000 requests/day

---

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use environment variables** for all credentials
3. **Restrict API keys** by domain/IP
4. **Enable webhook signature verification**
5. **Use HTTPS** in production
6. **Rotate keys** regularly (every 90 days)
7. **Monitor API usage** and set alerts
8. **Implement rate limiting** on all endpoints

---

## Monitoring & Alerts

### Setup Alerts

1. **Firebase**: Enable budget alerts
2. **Google Maps**: Set daily quota limits
3. **Omise**: Enable email notifications
4. **Cloudinary**: Set bandwidth alerts
5. **SendGrid**: Monitor bounce rates

### Logging

Use centralized logging:
- Development: Console logs
- Production: Cloud Logging (GCP) or Datadog

---

## Cost Summary (Monthly)

| Service | Phase 1 (MVP) | Phase 2 (Growing) | Phase 3 (Scale) |
|---------|---------------|-------------------|-----------------|
| Firebase | Free | ~฿500 | ~฿2,000 |
| Omise | ~฿22,500* | ~฿90,000* | ~฿400,000* |
| LINE OA | ฿235 | ฿1,500 | ฿1,500 |
| Google Maps | $0 (free tier) | ~$80 | ~$400 |
| Cloudinary | $0 (free tier) | $99 | $249 |
| Twilio SMS | ~฿2,380 | ~฿7,000 | ~฿15,000 |
| SendGrid | $0 (free tier) | $15 | $50 |
| **Total Fixed** | **฿3,115** | **~฿12,600** | **~฿26,200** |
| **Total with Transactions** | **~฿28,000** | **~฿110,000** | **~฿442,000** |

*Transaction fees (Omise) scale with volume

---

## Support & Documentation

- **Firebase**: https://firebase.google.com/docs
- **Omise**: https://docs.omise.co/
- **LINE**: https://developers.line.biz/en/docs/
- **Google Maps**: https://developers.google.com/maps/documentation
- **Cloudinary**: https://cloudinary.com/documentation
- **Twilio**: https://www.twilio.com/docs
- **SendGrid**: https://docs.sendgrid.com/

---

## Next Steps

1. ✅ Setup all services in test/sandbox mode
2. ✅ Test each integration independently
3. ✅ Test end-to-end flows
4. ✅ Deploy to staging environment
5. ✅ Load testing and optimization
6. ✅ Switch to production keys
7. ✅ Go live! 🚀
