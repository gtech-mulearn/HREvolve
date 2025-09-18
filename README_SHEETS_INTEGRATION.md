# Google Sheets Integration Setup Guide

## 📊 Sheet Format

Create a Google Sheet with these **exact column headers** in Row 1:

| Column | Header | Required | Example |
|--------|--------|----------|---------|
| A | `title` | ✅ | "HR Leadership Summit 2024" |
| B | `date` | ✅ | "2024-12-15" (YYYY-MM-DD format) |
| C | `time` | ✅ | "10:00 AM - 4:00 PM" |
| D | `description` | ✅ | "Annual leadership conference for HR professionals" |
| E | `image_url` | ✅ | "https://example.com/image.jpg" |
| F | `linkedin_url` | ✅ | "https://linkedin.com/events/123456" |
| G | `location` | ✅ | "Kochi, Kerala" or "Virtual" |
| H | `category` | ✅ | "Workshop", "Conference", "Webinar" |
| I | `status` | ✅ | "Completed", "Upcoming", "Cancelled" |
| J | `registration_url` | ❌ | "https://forms.google.com/..." |

## 🔧 Setup Steps

### 1. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet
3. Add the column headers in Row 1 exactly as shown above
4. Add your program data starting from Row 2

### 2. Make Sheet Public
1. Click "Share" button
2. Change to "Anyone with the link can view"
3. Copy the sharing link

### 3. Get Sheet ID
From your sheet URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
Copy the `SHEET_ID` part.

### 4. Configure Environment
1. Open `.env.local` file in your project root
2. Replace `your_sheet_id_here` with your actual Sheet ID:
   ```
   NEXT_PUBLIC_GOOGLE_SHEET_ID=your_actual_sheet_id_here
   ```

### 5. Test Integration
1. Add some sample data to your sheet
2. Restart your development server: `npm run dev`
3. Visit your website and check the Programs section

## 📋 Sample Data

Here's sample data you can copy to test:

| title | date | time | description | image_url | linkedin_url | location | category | status | registration_url |
|-------|------|------|-------------|-----------|--------------|----------|----------|--------|------------------|
| HR Tech Summit 2024 | 2024-12-20 | 9:00 AM - 5:00 PM | Latest trends in HR technology | https://via.placeholder.com/400x300 | https://linkedin.com/events/test | Mumbai, India | Conference | Upcoming | https://forms.google.com/test |
| Leadership Workshop | 2024-10-15 | 2:00 PM - 4:00 PM | Building effective leadership skills | https://via.placeholder.com/400x300 | https://linkedin.com/events/test2 | Virtual | Workshop | Completed | |
| Employee Engagement Seminar | 2024-11-30 | 10:00 AM - 12:00 PM | Strategies for better engagement | https://via.placeholder.com/400x300 | https://linkedin.com/events/test3 | Bangalore, India | Seminar | Upcoming | https://forms.google.com/test2 |

## 🎨 Features

### Automatic Sorting
- **Upcoming**: Events with future dates (earliest first)
- **Past**: Events with past dates (most recent first)
- Cancelled events appear in Past section

### Visual Indicators
- "Coming Soon!" badge for events within 7 days
- "Completed" badge for past events
- Category tags for each program

### Responsive Design
- Mobile-friendly cards
- Tabbed navigation
- Loading states and error handling

### Interactive Elements
- LinkedIn redirect buttons
- Registration buttons for upcoming events
- Hover effects and animations

## 🔧 Troubleshooting

### No Data Showing
- Check if sheet is publicly accessible
- Verify Sheet ID in `.env.local`
- Ensure column headers match exactly
- Check browser console for errors

### Date Issues
- Use YYYY-MM-DD format only
- Example: 2024-12-25, not 25/12/2024

### Images Not Loading
- Use direct image URLs (ending in .jpg, .png, etc.)
- Avoid Google Drive links (use direct hosting)
- Test image URLs in browser first

## 🚀 Going Live

1. Update `.env.local` with production sheet ID
2. Deploy your site
3. Test the programs section
4. Update sheet data as needed - changes reflect immediately!

The system will automatically categorize events as Past or Upcoming based on their dates and display them accordingly!