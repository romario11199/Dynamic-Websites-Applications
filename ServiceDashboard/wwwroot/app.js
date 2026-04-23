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

initializeMap();
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
 * @returns {void}
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
    // Initialize Google Map
    const mapOptions = {
      center: { lat: 18.3475, lng: -77.2975 }, // Kingston, Jamaica coordinates
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Initialize Places service for geocoding
    const service = new google.maps.places.PlacesService(map);

    console.log('Google Maps initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error);
    document.getElementById('map').innerHTML = '<p style="padding: 1rem; color: #666;">Failed to load map. Check your API key and internet connection.</p>';
  }
}

/**
 * @description Handles the input event for location search, fetches coordinates, and updates the map.
 * @returns {Promise<void>}
 */
async function handleLocationSearch() {
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
 * @description Fetches latitude and longitude for a location string using Google Maps Geocoding API.
 * @param {string} location
 * @returns {Promise<{lng:number,lat:number}|null>}
 */
async function fetchCoordinates(location) {
  if (!API_KEYS.GOOGLE_MAPS || API_KEYS.GOOGLE_MAPS === "YOUR GOOGLE MAPS API KEY HERE") {
    alert('Google Maps API key not configured. Please add your key to config.js');
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEYS.GOOGLE_MAPS}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const location = data.results[0].geometry.location;
    return { lng: location.lng, lat: location.lat };
  } catch (error) {
    console.error('Geocoding error', error);
    return null;
  }
}

/**
 * @description Moves the map to coordinates and drops a custom marker.
 * @param {{lng:number,lat:number}} coordinates
 * @returns {void}
 */
function flyToLocation(coordinates) {
  // Move map to new location
  map.setCenter({ lat: coordinates.lat, lng: coordinates.lng });
  map.setZoom(12);

  // Remove existing marker if it exists
  if (marker) {
    marker.setMap(null);
  }

  // Create new marker
  marker = new google.maps.Marker({
    position: { lat: coordinates.lat, lng: coordinates.lng },
    map: map,
    title: 'Searched Location'
  });
}

/**
 * @description Starts the analog clock animation using requestAnimationFrame.
 * @returns {void}
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
 * @param {number} timestamp
 * @returns {void}
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @returns {void}
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @returns {void}
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {Date} time
 * @param {number} radius
 * @returns {void}
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} angle
 * @param {number} length
 * @param {number} width
 * @param {string} color
 * @returns {void}
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
 * @returns {void}
 */
function toggleDayNightMode() {
  const clockSection = document.getElementById('clock-section');
  isNightMode = !isNightMode;
  clockSection.classList.toggle('night', isNightMode);
  modeToggle.textContent = isNightMode ? 'Switch to Day Mode' : 'Switch to Night Mode';
}

/**
 * @description Handles the news search action and renders cards after loading.
 * @returns {Promise<void>}
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
 * @description Fetches news articles from the NYTimes Article Search API.
 * @param {string} query
 * @returns {Promise<Array<{headline:string,leadParagraph:string,url:string}>>}
 */
async function fetchNewsArticles(query) {
  if (!API_KEYS.NYT || API_KEYS.NYT === "YOUR NYTIMES API KEY HERE") {
    alert('NYTimes API key not configured. Please add your key to config.js');
    return [];
  }
  
  const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(query)}&api-key=${API_KEYS.NYT}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.response.docs.slice(0, 8).map((doc) => ({
      headline: doc.headline?.main ?? 'Untitled',
      leadParagraph: doc.lead_paragraph ?? doc.abstract ?? 'No summary available.',
      url: doc.web_url
    }));
  } catch (error) {
    console.error('News fetch error', error);
    return [];
  }
}

/**
 * @description Renders NYTimes article cards inside the news section.
 * @param {Array<{headline:string,leadParagraph:string,url:string}>} articles
 * @returns {void}
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
 * @returns {Promise<void>}
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
 * @param {string} query - The search topic for YouTube videos
 * @returns {Promise<Array<{id:string,title:string,thumbnail:string}>>} Array of video objects with metadata
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
 * @param {{id:string,title:string,thumbnail:string}} video
 * @returns {string}
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
 * @param {string} videoId
 * @returns {void}
 */
function setVideoFrame(videoId) {
  videoFrame.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
}

/**
 * @description Escapes text to prevent HTML injection in injected templates.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
