# Firebase Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in your project root with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## 2. Firestore Database Setup

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a new collection called `users`
4. The collection will automatically be created when the first user joins the waitlist

## 3. Firestore Security Rules

Update your Firestore security rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These rules are permissive for development. In production, implement proper authentication and authorization.

## 4. Features Implemented

### Waitlist Modal
- Email input validation
- Role selection (Influencer/Business)
- Success/error states
- Automatic form reset

### Admin Dashboard
- URL: `/admin/devou@jetfluenz`
- Real-time stats (total users, influencers, businesses)
- Complete user list with timestamps
- CSV export functionality
- Responsive design

### Data Structure
Each user document contains:
```javascript
{
  email: "user@example.com",
  role: "influencer" | "business",
  status: "waitlist",
  createdAt: serverTimestamp(),
  submittedAt: "2024-01-01T12:00:00.000Z"
}
```

## 5. Usage

1. Users click "Join Waitlist" buttons throughout the site
2. Modal opens with email and role selection
3. Data is submitted to Firestore `users` collection
4. Admin can view all submissions at `/admin/devou@jetfluenz`
5. Admin can export data as CSV

## 6. Next Steps

1. Add your Firebase configuration to `.env.local`
2. Test the waitlist functionality
3. Access the admin panel to view submissions
4. Consider adding authentication for the admin panel in production
