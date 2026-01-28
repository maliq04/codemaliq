# Firebase Admin SDK Configuration

This document explains how the Firebase Admin SDK has been configured for your project.

## 🔧 Configuration Files

### 1. Firebase Admin SDK Setup (`lib/firebase-admin.ts`)
- Initializes Firebase Admin SDK with service account credentials
- Exports `adminDb` (Firestore) and `adminAuth` (Authentication) instances
- Uses environment variables for secure credential management

### 2. Environment Variables (`.env.local`)
The following environment variables are required:

```env
FIREBASE_PROJECT_ID="codemaliq"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@codemaliq.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY]\n-----END PRIVATE KEY-----"
```

### 3. Utility Functions (`lib/firebase-utils.ts`)
Helper functions for common Firebase operations:
- `testFirebaseConnection()` - Test database connectivity
- `createDocument(collection, data)` - Create new documents
- `getDocuments(collection, limit)` - Retrieve documents

## 🚀 Testing the Configuration

### Method 1: API Route
Visit: `http://localhost:3000/api/test-firebase`

This will test the Firebase Admin SDK connection.

### Method 2: Chat Functionality
Visit: `http://localhost:3000/chat`

This tests the client-side Firebase configuration including Realtime Database.

### Method 3: Server-side Usage
```typescript
import { adminDb } from '@/lib/firebase-admin'
import { testFirebaseConnection } from '@/lib/firebase-utils'

// Test connection
const result = await testFirebaseConnection()

// Direct Firestore usage
const snapshot = await adminDb.collection('users').get()
```

## 📝 Usage Examples

### Admin Media Library (Firebase Database Storage)
The admin media library stores images as base64 in Firebase Realtime Database:

```typescript
import { uploadToFirebaseDatabase, listFirebaseDatabaseMedia, deleteFromFirebaseDatabase } from '@/lib/firebase-media'

// Upload image (max 5MB)
const buffer = Buffer.from(fileBytes)
const result = await uploadToFirebaseDatabase(buffer, 'image.jpg', 'uploads')
// Returns: { id, name, url (base64), size, contentType, created, folder }

// List all media
const mediaList = await listFirebaseDatabaseMedia()

// List media by folder
const uploads = await listFirebaseDatabaseMedia('uploads')

// Delete media
const success = await deleteFromFirebaseDatabase(mediaId)
```

**Note**: Images are stored as base64 data URLs in the database. File size limit is 5MB to prevent database bloat.

### Creating Documents
```typescript
import { createDocument } from '@/lib/firebase-utils'

const result = await createDocument('users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

### Reading Documents
```typescript
import { getDocuments } from '@/lib/firebase-utils'

const result = await getDocuments('users', 10)
if (result.success) {
  console.log(result.documents)
}
```

### Direct Firestore Operations
```typescript
import { adminDb } from '@/lib/firebase-admin'

// Add document
const docRef = await adminDb.collection('posts').add({
  title: 'My Post',
  content: 'Post content...',
  createdAt: new Date()
})

// Get document
const doc = await adminDb.collection('posts').doc(docRef.id).get()
const data = doc.data()

// Update document
await adminDb.collection('posts').doc(docRef.id).update({
  updatedAt: new Date()
})

// Delete document
await adminDb.collection('posts').doc(docRef.id).delete()
```

## 🔒 Security Notes

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Private Key**: The private key contains sensitive information
3. **Firestore Rules**: Configure proper security rules in Firebase Console
4. **Service Account**: Limit permissions to only what's needed

## 🛠️ Troubleshooting

### Common Issues:

1. **"Project ID not found"**
   - Check `FIREBASE_PROJECT_ID` in `.env.local`
   - Ensure the project exists in Firebase Console

2. **"Invalid private key"**
   - Verify the private key format includes `\n` for line breaks
   - Check for any missing characters in the key

3. **"Permission denied"**
   - **For Chat Feature**: You need to configure Firebase Realtime Database rules
   - Go to Firebase Console > Realtime Database > Rules
   - Use the rules from `firebase-database-rules.json` file
   - Make sure to click **Publish** after updating rules
   - Verify Firestore security rules (if using Firestore)
   - Check service account permissions in Firebase Console

### Testing Connection:
```bash
# Visit the test endpoint
curl http://localhost:3000/api/test-firebase
```

## 📚 Next Steps

1. **Configure Firebase Realtime Database Security Rules** (Required for Chat)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `codemaliq`
   - Navigate to **Realtime Database** > **Rules**
   - Copy the rules from `firebase-database-rules.json` and paste them
   - Click **Publish**
   
   The rules allow:
   - Anyone to read chat messages
   - Only authenticated users to write messages
   - Validation for required message fields
   - Media storage in `/media` path with validation

2. Configure Firestore security rules in Firebase Console (if using Firestore)
3. Set up proper indexes for your queries
4. Implement error handling in your application
4. Consider implementing caching for frequently accessed data

## 🔗 Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)