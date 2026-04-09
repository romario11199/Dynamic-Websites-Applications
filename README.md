# Service Dashboard

**Assignment: API Integration & Canvas Application**

This repository contains a complete implementation of the Service Dashboard assignment, demonstrating the ability to fetch, handle, and display asynchronous data from three global providers using ES6 Async/Await patterns, along with a real-time HTML5 Canvas analog clock.

## 🎯 Assignment Requirements Met

### Part 1: API Integration & Canvas Application (60 Marks)

#### ✅ Requirement 1: Geospatial Intelligence (20 Marks)
- **Provider**: Mapbox (Geocoding API)
- **Features**:
  - Interactive map component using Mapbox GL JS
  - "Search Location" input field
  - Uses `fetch()` to convert address strings to latitude/longitude coordinates
  - Map flies to coordinates and drops custom red marker
  - Error handling for invalid locations and missing API keys

#### ✅ Requirement 2: Real-Time News Stream (20 Marks)
- **Provider**: NYTimes Article Search API
- **Features**:
  - Searchable news feed with input field
  - Results displayed in responsive grid layout
  - Each card shows headline, lead paragraph, and "Read More" button
  - "Read More" links open articles in new tabs with proper security attributes
  - Loading spinner animation during data fetching
  - Displays up to 8 articles per search

#### ✅ Requirement 3: On-Demand Media Player (20 Marks)
- **Provider**: YouTube Data API v3
- **Features**:
  - Video search utility with input field
  - Displays top 5 video thumbnails using template literals for HTML injection
  - Clicking thumbnails dynamically updates central `<iframe>` to play selected video
  - Auto-loads first video result on search completion
  - Template literals used for clean HTML generation

### Part 2: Canvas Rendering (20 Marks)

#### ✅ Real-Time Analog Clock
- **Animation Engine**: Uses `window.requestAnimationFrame()` (not `setInterval`)
- **Math Logic**: Trigonometric calculations using `Math.PI` for hand coordinates
- **UI Interaction**: Toggle button switches between Day/Light mode and Night/Dark mode
- **Animation Continuity**: Mode switching doesn't interrupt the real-time animation
- **Real-time Updates**: Clock hands move smoothly with millisecond precision

## 📁 Project Structure

```
Service Dashboard/
├── ServiceDashboard.slnx
├── README.md
└── ServiceDashboard/
    ├── Program.cs                    # ASP.NET app with static file hosting
    ├── ServiceDashboard.csproj
    ├── appsettings.json
    ├── Properties/
    │   └── launchSettings.json
    └── wwwroot/                      # Static web assets
        ├── index.html               # Main dashboard UI
        ├── styles.css               # Responsive styling with day/night themes
        ├── app.js                  # Frontend logic with JSDoc documentation
        └── config.js               # Centralized API key configuration
```

## 🚀 Setup & Installation

### Prerequisites
- .NET 8.0 or later
- Modern web browser with ES6 module support

### Configuration
1. **API Keys**: Open `ServiceDashboard/wwwroot/config.js` and replace placeholder values:
   ```javascript
   export const API_KEYS = {
     MAPBOX: "your_mapbox_api_key_here",
     NYT: "your_nytimes_api_key_here",
     YOUTUBE: "your_youtube_api_key_here"
   };
   ```

2. **Get API Keys**:
   - **Mapbox**: [mapbox.com](https://account.mapbox.com/) - Free tier available
   - **NYTimes**: [developer.nytimes.com](https://developer.nytimes.com/get-started) - Free tier available
   - **YouTube**: [Google Cloud Console](https://console.cloud.google.com/) - Free tier available

### Running the Application
1. Navigate to the `ServiceDashboard` folder
2. Run: `dotnet run`
3. Open browser to the displayed URL (typically `http://localhost:5020`)

## 🎨 Features

### Interactive Dashboard
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Day/Night Mode**: Toggle affects all UI elements including the canvas clock
- **Error Handling**: Graceful degradation when API keys are missing
- **Loading States**: Visual feedback during API calls

### Technical Implementation
- **ES6 Async/Await**: All API calls use modern asynchronous patterns
- **Modular Architecture**: Separate concerns with config, styling, and logic files
- **Security**: Proper escaping of user-generated content
- **Performance**: Efficient canvas rendering with requestAnimationFrame
- **Accessibility**: Semantic HTML with proper ARIA attributes

## 📚 Code Documentation

Every function includes comprehensive JSDoc documentation:
- `@description` - What the function does
- `@param` - Parameter types and descriptions
- `@returns` - Return value types and descriptions

Example:
```javascript
/**
 * @description Fetches latitude and longitude for a location string using Mapbox Geocoding API.
 * @param {string} location - The address or place name to geocode
 * @returns {Promise<{lng:number,lat:number}|null>} - Coordinates or null if not found
 */
```

## 🧪 Testing

The application includes:
- Input validation for all search fields
- API key presence checks
- Error handling for network failures
- Canvas compatibility detection
- Enter key support for form submission

## 📝 Notes

- The application uses ASP.NET Core for static file hosting
- All API calls are client-side using the Fetch API
- Canvas clock uses mathematical trigonometry for accurate hand positioning
- Responsive design works on desktop and mobile devices
- No external dependencies except Mapbox GL JS (loaded via CDN)

## 🎓 Academic Compliance

This implementation fully satisfies the assignment requirements:
- ✅ Three global API providers integrated
- ✅ ES6 Async/Await patterns throughout
- ✅ HTML5 Canvas with requestAnimationFrame
- ✅ Trigonometric calculations for clock hands
- ✅ State management without animation interruption
- ✅ Modular code structure with API key separation
- ✅ Comprehensive function documentation
- ✅ GitHub-ready repository structure