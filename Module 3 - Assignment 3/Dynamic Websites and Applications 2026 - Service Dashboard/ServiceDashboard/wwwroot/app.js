import { API_KEYS } from './config.js';

const locationInput = document.getElementById('location-input');
const locationSearch = document.getElementById('location-search');
const newsInput = document.getElementById('news-input');
const newsSearch = document.getElementById('news-search');
const newsGrid = document.getElementById('news-grid');
const newsSpinner = document.getElementById('news-spinner');
const videoInput = document.getElementById('video-input');
const videoSearch = document.getElementById('video-search');
const videoFrame = document.getElementById('video-frame');
const videoThumbnails = document.getElementById('video-thumbnails');
const modeToggle = document.getElementById('mode-toggle');
const clockCanvas = document.getElementById('clock-canvas');
const clockContext = clockCanvas.getContext('2d');
const digitalClock = document.getElementById('digital-clock');

// Set canvas size to match the CSS max-width
clockCanvas.width = 420;
clockCanvas.height = 420;

let map;
let marker;
let isNightMode = false;

// Wait for Google Maps API to load before initializing
if (document.readyState === 'loading') {
  window.addEventListener('load', () => {
    setTimeout(initializeMap, 200);
  });
} else {
  setTimeout(initializeMap, 200);
}
startClock();

locationSearch.addEventListener('click', handleLocationSearch);
newsSearch.addEventListener('click', handleNewsSearch);
videoSearch.addEventListener('click', handleVideoSearch);
modeToggle.addEventListener('click', toggleDayNightMode);

// Add Enter key support for input fields
locationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleLocationSearch();
});
newsInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleNewsSearch();
});
videoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleVideoSearch();
});

/**
 * @description Initializes the Google Maps instance and sets default view.
 * @param {void} none - This function does not take any input arguments.
 * @returns {void} Does not return a value.
 */
function initializeMap() {
  if (!API_KEYS.GOOGLE_MAPS || API_KEYS.GOOGLE_MAPS === "YOUR GOOGLE MAPS API KEY HERE") {
    console.warn('Google Maps API key is missing or not configured in config.js');
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; border-radius: 18px; color: #666; text-align: center; padding: 1rem;">
        <div>
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🗺️</div>
          <p><strong>Map Unavailable</strong></p>
          <p>Add your Google Maps API key to config.js to enable the interactive map.</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Get a key at <a href="https://console.cloud.google.com/google/maps-apis" target="_blank">Google Cloud Console</a></p>
        </div>
      </div>
    `;
    return;
  }

  try {
    // Check if Google Maps API is available
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps API not loaded. Will retry.');
      setTimeout(initializeMap, 500);
      return;
    }

    // Initialize Google Map
    const mapOptions = {
      center: { lat: 18.3475, lng: -77.2975 }, // Kingston, Jamaica coordinates
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    console.log('Google Maps initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error);
    document.getElementById('map').innerHTML = '<p style="padding: 1rem; color: #666;">Failed to load map. Check your API key and internet connection.</p>';
  }
}

/**
 * @description Handles the input event for location search, fetches coordinates, and updates the map.
 * @param {void} none - This function reads the current value from the location input field.
 * @returns {Promise<void>} Resolves after handling validation, geocoding, and map update steps.
 */
async function handleLocationSearch() {
  if (!map) {
    alert('Map is still loading. Please wait a moment and try again.');
    return;
  }

  const query = locationInput.value.trim();
  if (!query) {
    alert('Please enter a location to search.');
    return;
  }

  const coordinates = await fetchCoordinates(query);
  if (!coordinates) {
    alert('Unable to locate that address. Please try another search.');
    return;
  }

  flyToLocation(coordinates);
}

/**
 * @description Fetches latitude and longitude for a location string using Google Maps JavaScript Geocoder.
 * @param {string} location - The place name or address to geocode.
 * @returns {Promise<{lng:number,lat:number}|null>} A coordinate object when found, otherwise null.
 */
async function fetchCoordinates(location) {
  if (!map || typeof google === 'undefined') {
    console.error('Google Maps not ready');
    return null;
  }

  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    
    console.log(`Geocoding location: ${location}`);
    geocoder.geocode({ address: location }, (results, status) => {
      console.log(`Geocoding status: ${status}`);
      
      if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
        const result = results[0];
        const coords = result.geometry.location;
        console.log(`Found coordinates: lat=${coords.lat()}, lng=${coords.lng()}`);
        resolve({ lat: coords.lat(), lng: coords.lng() });
      } else {
        console.error(`Geocoding failed: ${status}`);
        resolve(null);
      }
    });
  });
}

/**
 * @description Moves the map to coordinates with smooth animation and drops a custom marker.
 * @param {{lng:number,lat:number}} coordinates - The latitude and longitude to center and mark on the map.
 * @returns {void} Does not return a value.
 */
function flyToLocation(coordinates) {
  // Animate map zoom out, then pan, then zoom in for "fly" effect
  
  // Zoom out for fly effect
  map.setZoom(8);
  
  // Smooth pan to location with animation
  setTimeout(() => {
    map.panTo({ lat: coordinates.lat, lng: coordinates.lng });
  }, 200);
  
  // Zoom in to final level
  setTimeout(() => {
    map.setZoom(14);
  }, 600);

  // Remove existing marker if it exists
  if (marker) {
    marker.setMap(null);
  }

  // Create new custom marker with animation
  marker = new google.maps.Marker({
    position: { lat: coordinates.lat, lng: coordinates.lng },
    map: map,
    title: 'Searched Location',
    animation: google.maps.Animation.DROP,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#ef4444',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    }
  });

  console.log(`Marker placed at: lat=${coordinates.lat}, lng=${coordinates.lng}`);
}

/**
 * @description Starts the analog clock animation using requestAnimationFrame.
 * @param {void} none - This function does not take any input arguments.
 * @returns {void} Does not return a value.
 */
function startClock() {
  if (!clockContext) {
    console.error('Canvas context not available');
    document.getElementById('clock-canvas').style.display = 'none';
    const clockSection = document.getElementById('clock-section');
    clockSection.innerHTML += '<p style="color: #666; margin-top: 1rem;">Canvas not supported in this browser.</p>';
    return;
  }
  
  // Start the clock animation immediately
  requestAnimationFrame(drawClock);
}

/**
 * @description Draws the analog clock on canvas for the current time.
 * @param {number} timestamp - Frame timestamp provided by requestAnimationFrame.
 * @returns {void} Does not return a value.
 */
function drawClock(timestamp) {
  const radius = clockCanvas.width / 2;
  const now = new Date();
  clockContext.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
  clockContext.save();
  clockContext.translate(radius, radius);

  drawFace(clockContext, radius);
  drawNumbers(clockContext, radius);
  drawHands(clockContext, now, radius);

  clockContext.restore();

  // Update digital clock
  const timeString = now.toLocaleTimeString();
  digitalClock.textContent = timeString;

  // Continue the animation loop
  requestAnimationFrame(drawClock);
}

/**
 * @description Draws the clock face background and tick marks.
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas drawing context.
 * @param {number} radius - The base radius of the clock face.
 * @returns {void} Does not return a value.
 */
function drawFace(ctx, radius) {
  const fillStyle = isNightMode ? '#020617' : '#f8fafc';
  const strokeStyle = isNightMode ? '#94a3b8' : '#1f2937';
  const textColor = isNightMode ? '#e2e8f0' : '#1f2937';

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.lineWidth = radius * 0.02;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = textColor;
  ctx.fill();
}

/**
 * @description Draws numeric markers around the clock face.
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas drawing context.
 * @param {number} radius - The base radius used to position numbers.
 * @returns {void} Does not return a value.
 */
function drawNumbers(ctx, radius) {
  ctx.font = `${radius * 0.12}px system-ui`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = isNightMode ? '#e2e8f0' : '#1f2937';

  for (let number = 1; number <= 12; number += 1) {
    const angle = number * Math.PI / 6;
    ctx.rotate(angle);
    ctx.translate(0, -radius * 0.78);
    ctx.rotate(-angle);
    ctx.fillText(number.toString(), 0, 0);
    ctx.rotate(angle);
    ctx.translate(0, radius * 0.78);
    ctx.rotate(-angle);
  }
}

/**
 * @description Draws the hour, minute, and second hands on the clock.
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas drawing context.
 * @param {Date} time - The current date/time used to calculate hand angles.
 * @param {number} radius - The base radius used to size hand lengths.
 * @returns {void} Does not return a value.
 */
function drawHands(ctx, time, radius) {
  const hour = time.getHours() % 12;
  const minute = time.getMinutes();
  const second = time.getSeconds();
  const millisecond = time.getMilliseconds();

  const hourAngle = ((hour + minute / 60 + second / 3600) * Math.PI) / 6;
  const minuteAngle = ((minute + second / 60) * Math.PI) / 30;
  const secondAngle = ((second + millisecond / 1000) * Math.PI) / 30;

  drawHand(ctx, hourAngle, radius * 0.5, radius * 0.08, '#2563eb');
  drawHand(ctx, minuteAngle, radius * 0.72, radius * 0.06, '#475569');
  drawHand(ctx, secondAngle, radius * 0.85, radius * 0.02, '#ef4444');
}

/**
 * @description Draws a single hand on the clock with a given angle.
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas drawing context.
 * @param {number} angle - The rotation angle of the hand in radians.
 * @param {number} length - The visual length of the hand.
 * @param {number} width - The stroke width of the hand.
 * @param {string} color - The stroke color used to draw the hand.
 * @returns {void} Does not return a value.
 */
function drawHand(ctx, angle, length, width, color) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.rotate(angle);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-angle);
}

/**
 * @description Toggles between day and night mode for the clock section only.
 * @param {void} none - This function does not take any input arguments.
 * @returns {void} Does not return a value.
 */
function toggleDayNightMode() {
  const clockSection = document.getElementById('clock-section');
  isNightMode = !isNightMode;
  clockSection.classList.toggle('night', isNightMode);
  modeToggle.textContent = isNightMode ? 'Switch to Day Mode' : 'Switch to Night Mode';
}

/**
 * @description Handles the news search action and renders cards after loading.
 * @param {void} none - This function reads the current value from the news input field.
 * @returns {Promise<void>} Resolves after fetching news data and updating the UI.
 */
async function handleNewsSearch() {
  const query = newsInput.value.trim();
  if (!query) {
    alert('Please enter a search term for news.');
    return;
  }

  newsSpinner.classList.remove('hidden');
  newsGrid.innerHTML = '';

  const articles = await fetchNewsArticles(query);
  newsSpinner.classList.add('hidden');

  if (!articles.length) {
    newsGrid.innerHTML = '<p>No articles found for that search.</p>';
    return;
  }

  renderNewsCards(articles);
}

/**
 * @description Fetches news articles from the NewsData.io API.
 * @param {string} query - The search term used to request news content.
 * @returns {Promise<Array<{headline:string,leadParagraph:string,url:string}>>} A normalized list of article summaries.
 */
async function fetchNewsArticles(query) {
  if (!API_KEYS.NEWSDATA || API_KEYS.NEWSDATA === "YOUR NEWSDATA API KEY HERE") {
    alert('NewsData API key not configured. Please add your key to config.js');
    return [];
  }

  const url = `https://newsdata.io/api/1/news?apikey=${API_KEYS.NEWSDATA}&q=${encodeURIComponent(query)}&language=en&size=8`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.slice(0, 8).map((article) => ({
      headline: article.title ?? 'Untitled',
      leadParagraph: article.description ?? article.content?.substring(0, 200) + '...' ?? 'No summary available.',
      url: article.link
    }));
  } catch (error) {
    console.error('News fetch error', error);
    return [];
  }
}

/**
 * @description Renders NewsData article cards inside the news section.
 * @param {Array<{headline:string,leadParagraph:string,url:string}>} articles - The articles to render as cards.
 * @returns {void} Does not return a value.
 */
function renderNewsCards(articles) {
  newsGrid.innerHTML = articles.map((article) => `
    <article class="news-card">
      <h3>${escapeHtml(article.headline)}</h3>
      <p>${escapeHtml(article.leadParagraph)}</p>
      <a class="read-more" href="${article.url}" target="_blank" rel="noreferrer noopener">Read More</a>
    </article>
  `).join('');
}

/**
 * @description Handles the video search and populates thumbnails.
 * @param {void} none - This function reads the current value from the video input field.
 * @returns {Promise<void>} Resolves after searching videos and updating player/thumbnail UI.
 */
async function handleVideoSearch() {
  const query = videoInput.value.trim();
  if (!query) {
    alert('Please enter a topic to search for videos.');
    return;
  }

  videoThumbnails.innerHTML = '<p>Loading videos...</p>';
  const videos = await fetchYouTubeVideos(query);
  if (!videos.length) {
    videoThumbnails.innerHTML = '<p>No videos found.</p>';
    return;
  }

  videoThumbnails.innerHTML = videos.map(renderVideoThumbnail).join('');
  setVideoFrame(videos[0].id);
  document.querySelectorAll('.thumbnail').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      setVideoFrame(thumb.dataset.videoId);
    });
  });
}

/**
 * @description Fetches the top YouTube videos for a search query using YouTube Data API v3.
 * @param {string} query - The search topic for YouTube videos.
 * @returns {Promise<Array<{id:string,title:string,thumbnail:string}>>} A list of videos containing ID, title, and thumbnail URL.
 */
async function fetchYouTubeVideos(query) {
  if (!API_KEYS.YOUTUBE || API_KEYS.YOUTUBE === "YOUR YOUTUBE API KEY HERE") {
    alert('YouTube API key not configured. Please add your key to config.js');
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEYS.YOUTUBE}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url
    }));
  } catch (error) {
    console.error('YouTube fetch error', error);
    return [];
  }
}

/**
 * @description Returns an HTML string for a video thumbnail card.
 * @param {{id:string,title:string,thumbnail:string}} video - A video object used to build thumbnail markup.
 * @returns {string} The rendered HTML string for a clickable thumbnail card.
 */
function renderVideoThumbnail(video) {
  return `
    <article class="thumbnail" data-video-id="${video.id}">
      <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" />
      <div class="thumbnail-title">${escapeHtml(video.title)}</div>
    </article>
  `;
}

/**
 * @description Updates the iframe to play the selected YouTube video.
 * @param {string} videoId - The YouTube video ID to load in the embedded player.
 * @returns {void} Does not return a value.
 */
function setVideoFrame(videoId) {
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
}

/**
 * @description Escapes text to prevent HTML injection in injected templates.
 * @param {string} value - Raw text that may contain special HTML characters.
 * @returns {string} The escaped HTML-safe text string.
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
