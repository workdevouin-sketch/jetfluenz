# Jetfluenz Meta API Documentation

This API provides endpoints for Instagram Business Discovery, Analytics, and Token Management using the Meta Graph API.

---

## 1. Instagram Business Discovery
**Endpoint:** `GET /api/meta/business-discovery`

**Description:**  
Fetches public profile data and recent media from an Instagram Business or Creator account.

**Query Parameters:**
- `username` (Required): The Instagram handle (e.g., `devou.in`).

**Response Example:**
```json
{
  "business_discovery": {
    "id": "178414...",
    "username": "devou.in",
    "name": "Devou Solutions",
    "followers_count": 60,
    "media_count": 10,
    "media": {
      "data": [
        {
          "id": "184438...",
          "caption": "...",
          "media_type": "VIDEO",
          "media_url": "https://...",
          "like_count": 5,
          "comments_count": 0,
          "timestamp": "2026-01-12T06:59:34+0000"
        }
      ]
    }
  }
}
```

---

## 2. Instagram Analytics
**Endpoint:** `GET /api/meta/analytics`

**Description:**  
Calculates performance metrics based on the user's recent media (last ~100 posts).

**Query Parameters:**
- `username` (Required): The Instagram handle (e.g., `devou.in`).

**Response Example:**
```json
{
  "engagement_rate": "12.03%",
  "conversation_rate": 1.7,
  "avg_image_likes": 6.75,
  "format_efficiency": "Video > Image",
  "posting_frequency": "6.2 Days"
}
```

**Metric Definitions:**
- **Engagement Rate**: `(Avg. (Likes + Comments) / Followers) * 100`
- **Conversation Rate**: `Avg. Comments per Post`
- **Avg. Image Likes**: `Avg. Likes on standard Image posts`
- **Format Efficiency**: Compares average engagement of Videos vs Images.
- **Posting Frequency**: Average days elapsed between posts.

---

## 3. Meta Token Refresh
**Endpoint:** `POST /api/meta/token/refresh`

**Description:**  
Exchanges the current valid access token for a newer token. Useful for automated token rotation.

**Requirements:**
- `META_APP_ID`, `META_APP_SECRET`, and `META_ACCESS_TOKEN` must be set in the server environment.

**Response Example:**
```json
{
  "access_token": "EAA...",
  "expires_in": 5184000,
  "expires_at": 1779000000000,
  "token_type": "bearer",
  "note": "IMPORTANT: Production must store this token..."
}
```

**Important:**  
This endpoint returns the **new** token. The application must save this new token to a database or secrets manager to be used for future requests. It does **not** automatically update the running environment variables.
