# CV Upload/Download System Testing Instructions

## 🧪 Testing the CV System

Since we can't generate a PDF programmatically without additional dependencies, here are the testing steps:

### Step 1: Create a Test PDF
1. **Option A - Use any PDF creator:**
   - Open any word processor (Microsoft Word, Google Docs, etc.)
   - Create a simple CV with test content
   - Export/Save as PDF

2. **Option B - Use online PDF generator:**
   - Go to any HTML to PDF converter online
   - Use the `test-cv.html` file I created in the project root
   - Convert it to PDF and download

3. **Option C - Use browser print:**
   - Open `test-cv.html` in your browser
   - Press Ctrl+P (Print)
   - Select "Save as PDF" as destination
   - Save the file

### Step 2: Test the Upload System
1. **Access Admin Panel:**
   ```
   http://localhost:3000/admin-portal-x7k9m2p
   ```

2. **Navigate to Profile & CV:**
   - Click "Profile & CV" in the sidebar
   - You should see the CV management interface

3. **Upload Test PDF:**
   - Click "Choose File" or drag and drop
   - Select your test PDF file
   - File should upload automatically
   - You should see success message

### Step 3: Test the Download System
1. **Check About Page:**
   ```
   http://localhost:3000/about
   ```

2. **Verify CV Button:**
   - Scroll to the Career section
   - You should see "Download My CV" button
   - Button should show file size and date

3. **Test Download:**
   - Click the "Download My CV" button
   - PDF should open in new tab for preview/download

### Step 4: Test Real-time Updates
1. **Delete CV in Admin:**
   - Go back to admin panel
   - Click "Delete" button
   - Confirm deletion

2. **Check About Page:**
   - Refresh the About page
   - CV download button should disappear

3. **Re-upload CV:**
   - Upload another PDF in admin
   - Check About page - button should reappear

## 🔍 What to Look For

### ✅ Success Indicators:
- [ ] File uploads without errors
- [ ] Success message appears after upload
- [ ] CV info displays correctly (name, size, date)
- [ ] Preview button opens PDF in new tab
- [ ] Download button appears on About page
- [ ] Real-time updates work (upload/delete)
- [ ] File validation works (only PDF, max 10MB)

### ❌ Potential Issues:
- Firebase connection errors
- File upload failures
- Button not appearing on About page
- Real-time updates not working
- File validation not working

## 🛠️ Troubleshooting

### If Upload Fails:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check file size (must be < 10MB)
4. Ensure file is PDF format

### If Button Doesn't Appear:
1. Check browser console for Firebase errors
2. Verify Firebase database rules are updated
3. Check if CV data exists in Firebase console
4. Try hard refresh (Ctrl+F5)

### If Real-time Updates Don't Work:
1. Check Firebase Realtime Database connection
2. Verify database rules allow read/write
3. Check browser network tab for Firebase calls

## 📊 Expected Firebase Data Structure

After successful upload, you should see this in Firebase Realtime Database:

```json
{
  "profile_settings": {
    "cv": {
      "url": "https://firebasestorage.googleapis.com/...",
      "fileName": "test-cv.pdf",
      "fileSize": 12345,
      "uploadedAt": 1706227200000,
      "lastUpdated": 1706227200000
    }
  }
}
```

## 🎯 Test Scenarios

1. **Happy Path:** Upload → View on About → Delete → Verify removal
2. **File Validation:** Try uploading non-PDF file (should fail)
3. **Size Validation:** Try uploading large file >10MB (should fail)
4. **Replace CV:** Upload → Upload different CV (should replace)
5. **Multiple Tabs:** Upload in one tab, verify updates in another

Ready to test! The development server is running on `http://localhost:3000`