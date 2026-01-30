// Simple PDF creation script for testing
// This creates a minimal PDF-like structure for testing purposes

const fs = require('fs')

// Create a minimal PDF structure (this is a simplified approach)
// In a real scenario, you'd use a proper PDF library like jsPDF or PDFKit

const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(TEST CV - John Doe) Tj
0 -20 Td
(Software Developer) Tj
0 -40 Td
(This is a test CV file for Firebase upload testing.) Tj
0 -20 Td
(Created on: January 26, 2026) Tj
0 -40 Td
(Skills: JavaScript, React, Node.js, Firebase) Tj
0 -20 Td
(Experience: 5+ years in web development) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000526 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
625
%%EOF`

// Write the PDF content to a file
fs.writeFileSync('test-cv.pdf', pdfHeader)

console.log('✅ Test PDF created successfully: test-cv.pdf')
console.log('📁 File size:', fs.statSync('test-cv.pdf').size, 'bytes')
console.log('🧪 You can now use this file to test the CV upload system!')
console.log('')
console.log('Next steps:')
console.log('1. Go to http://localhost:3000/admin-portal-x7k9m2p/profile')
console.log('2. Upload the test-cv.pdf file')
console.log('3. Check http://localhost:3000/about for the download button')
