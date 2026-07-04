

const buttons = [
  document.querySelector(".today-button"),
  document.querySelector(".launch-button"),
  document.querySelector(".planets-button"),
];
 
const contents = [
  document.querySelector("#today-in-space"),
  document.querySelector("#launches"),
  document.querySelector("#planets"),
];
 
function activateTab(activeIndex) {
  buttons.forEach((button, index) => {
    const content = contents[index];
 
    if (index === activeIndex) {
      button.style.backgroundColor = "#112241";
      button.style.color = "#50A2FF";
      content.classList.remove("hidden");
    } else {
      button.style.backgroundColor = "transparent";
      button.style.color = "white";
      content.classList.add("hidden");
    }
  });
 
  
}
 
buttons.forEach((button, index) => {
  if (button) button.addEventListener("click", (e) => {
    e.preventDefault();
    activateTab(index);
  });
});
 
/* Mobile sidebar toggle */
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarEl = document.getElementById("sidebar");
if (sidebarToggle && sidebarEl) {
  sidebarToggle.addEventListener("click", () => {
    sidebarEl.classList.toggle("sidebar-open");
  });
}
  //  SHARED HELPERS

 
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
 
function setImage(id, src) {
  const image = document.getElementById(id);
  if (image) image.src = src;
}
 
function formatDateLong(dateStr) {
  // dateStr => "YYYY-MM-DD"
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
 
function formatDateShort(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
 
function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
 
  //  "View Full Details" (launch details modal).
  
 
function ensureOverlay(id) {
  let overlay = document.getElementById(id);
  if (overlay) return overlay;
 
  overlay = document.createElement("div");
  overlay.id = id;
  overlay.className = "cosmos-overlay";
  document.body.appendChild(overlay);
 
  // Close on backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay(id);
  });
 
  return overlay;
}
 
function openOverlay(id, innerHTML) {
  const overlay = ensureOverlay(id);
  overlay.innerHTML = innerHTML;
  overlay.classList.add("cosmos-overlay-open");
  document.body.style.overflow = "hidden";
 
  const closeBtn = overlay.querySelector(".cosmos-close-btn");
  if (closeBtn) closeBtn.addEventListener("click", () => closeOverlay(id));
}
 
function closeOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove("cosmos-overlay-open");
  overlay.innerHTML = "";
  document.body.style.overflow = "";
}
 
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".cosmos-overlay.cosmos-overlay-open").forEach((overlay) => {
      closeOverlay(overlay.id);
    });
  }
});
  //  1) TODAY IN SPACE 
   
const NASA_API_KEY = "DEMO_KEY";
const APOD_URL = "https://api.nasa.gov/planetary/apod";
 
const apodDateInput = document.getElementById("apod-date-input");
const apodLoadBtn = document.getElementById("load-date-btn");
const apodTodayBtn = document.getElementById("today-apod-btn");
const apodImageContainer = document.getElementById("apod-image-container");
const apodLoadingEl = document.getElementById("apod-loading");
const apodImageEl = document.getElementById("apod-image");
const apodFullResBtn = document.getElementById("apod-fullres-btn");
 
let currentApodData = null;
 
function showApodLoading(show) {
  if (!apodLoadingEl) return;
  apodLoadingEl.classList.toggle("hidden", !show);
  if (apodImageEl) apodImageEl.style.opacity = show ? "0.15" : "1";
}
 
function showApodError(message) {
  setText("apod-title", "Unable to load image");
  setText("apod-explanation", message);
  setText("apod-copyright", "");
  setText("apod-media-type", "—");
  if (apodImageEl) {
    apodImageEl.src = "./images/placeholder.webp";
  }
}
 
// Removes any previously injected <iframe> (used for video APOD entries)
function clearApodVideo() {
  const oldFrame = document.getElementById("apod-video-frame");
  if (oldFrame) oldFrame.remove();
  if (apodImageEl) apodImageEl.classList.remove("hidden");
}
 
function renderApodVideo(url) {
  clearApodVideo();
  if (apodImageEl) apodImageEl.classList.add("hidden");
  const iframe = document.createElement("iframe");
  iframe.id = "apod-video-frame";
  iframe.src = url;
  iframe.className = "w-full h-full";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "true");
  apodImageContainer.appendChild(iframe);
}
 
async function loadAPOD(dateStr) {
  showApodLoading(true);
  clearApodVideo();
 
  try {
    const res = await fetch(
      `${APOD_URL}?api_key=${NASA_API_KEY}&date=${dateStr}`
    );
 
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.msg || `Request failed (${res.status})`);
    }
 
    const data = await res.json();
    currentApodData = data;
 
    setText("apod-date", `Astronomy Picture of the Day - ${formatDateLong(data.date)}`);
    setText("apod-title", data.title || "Untitled");
    setText("apod-date-detail", data.date);
    setText("apod-explanation", data.explanation || "No description available.");
    setText("apod-copyright", data.copyright ? `© ${data.copyright}` : "Public Domain / NASA");
    setText("apod-date-info", data.date);
    setText("apod-media-type", data.media_type === "video" ? "Video" : "Image");
 
    if (data.media_type === "video") {
      renderApodVideo(data.url);
    } else {
      setImage("apod-image", data.hdurl || data.url);
    }
 
    // Keep the date picker + label in sync
    if (apodDateInput) apodDateInput.value = data.date;
    const dateLabel = document.querySelector("#apod-date-input + span");
    if (dateLabel) dateLabel.textContent = formatDateShort(new Date(data.date + "T00:00:00"));
  } catch (error) {
    console.error("APOD error:", error);
    showApodError(
      error.message && error.message.toLowerCase().includes("date")
        ? "No image is available for that date. Try another day."
        : "Couldn't reach NASA's APOD API right now. Please try again in a moment."
    );
  } finally {
    showApodLoading(false);
  }
}
 
if (apodDateInput) {
  apodDateInput.max = todayISO();
  apodDateInput.addEventListener("change", () => {
    const dateLabel = document.querySelector("#apod-date-input + span");
    if (dateLabel && apodDateInput.value) {
      dateLabel.textContent = formatDateShort(new Date(apodDateInput.value + "T00:00:00"));
    }
  });
}
 
if (apodLoadBtn) {
  apodLoadBtn.addEventListener("click", () => {
    if (apodDateInput && apodDateInput.value) {
      loadAPOD(apodDateInput.value);
    }
  });
}
 
if (apodTodayBtn) {
  apodTodayBtn.addEventListener("click", () => {
    const today = todayISO();
    if (apodDateInput) apodDateInput.value = today;
    loadAPOD(today);
  });
}
 
function openApodLightbox() {
  if (!currentApodData) return;
 
  // Videos don't have a "full resolution" image — open the video instead.
  if (currentApodData.media_type === "video") {
    window.open(currentApodData.url, "_blank", "noopener");
    return;
  }
 
  const fullUrl = currentApodData.hdurl || currentApodData.url;
 
  openOverlay(
    "apod-lightbox",
    `
      <div class="cosmos-lightbox-content">
        <button class="cosmos-close-btn"><i class="fas fa-times"></i></button>
        <img src="${fullUrl}" alt="${currentApodData.title || "APOD full resolution"}" />
        <p class="cosmos-lightbox-caption">${currentApodData.title || ""}</p>
      </div>
    `
  );
}
 
if (apodFullResBtn) {
  apodFullResBtn.addEventListener("click", openApodLightbox);
}
  //  2) LAUNCHES  
const LAUNCHES_URL =
  "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&mode=detailed";
 
const featuredLaunchEl = document.getElementById("featured-launch");
const launchesGridEl = document.getElementById("launches-grid");
 
const STATUS_COLORS = {
  Go: "#22c55e",
  TBD: "#3b82f6",
  TBC: "#eab308",
  Success: "#22c55e",
  Failure: "#ef4444",
  Hold: "#f97316",
  "In Flight": "#a855f7",
  "Partial Failure": "#f97316",
};
 
function statusColor(abbrev) {
  return STATUS_COLORS[abbrev] || "#64748b";
}
 
function daysUntil(dateStr) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}
 
function formatLaunchDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
 
function formatLaunchTime(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}
 
function renderFeaturedLaunch(launch) {
  if (!featuredLaunchEl || !launch) return;
 
  const provider = launch.launch_service_provider
    ? launch.launch_service_provider.name
    : "Unknown provider";
  const rocketName = launch.rocket && launch.rocket.configuration
    ? launch.rocket.configuration.name
    : "Unknown rocket";
  const pad = launch.pad || {};
  const location = pad.location ? pad.location.name : "Unknown location";
  const country = pad.location ? pad.location.country_code : "N/A";
  const statusAbbrev = launch.status ? launch.status.abbrev : "TBD";
  const image = launch.image || "./images/launch-placeholder.png";
  const description =
    (launch.mission && launch.mission.description) ||
    "No mission description available yet.";
  const days = daysUntil(launch.net);
 
  featuredLaunchEl.innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all fade-in">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i>
                Featured Launch
              </span>
              <span class="status-pill" style="background-color:${statusColor(statusAbbrev)}">
                ${statusAbbrev}
              </span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">${launch.name}</h3>
            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${provider}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${rocketName}</span>
              </div>
            </div>
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
              <i class="fas fa-clock text-2xl text-blue-400"></i>
              <div>
                <p class="text-2xl font-bold text-blue-400">${days >= 0 ? days : 0}</p>
                <p class="text-xs text-slate-400">Days Until Launch</p>
              </div>
            </div>
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-calendar"></i>Launch Date</p>
                <p class="font-semibold">${formatLaunchDate(launch.net)}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-clock"></i>Launch Time</p>
                <p class="font-semibold">${formatLaunchTime(launch.net)}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-map-marker-alt"></i>Location</p>
                <p class="font-semibold text-sm">${location}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-globe"></i>Country</p>
                <p class="font-semibold">${country}</p>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6">${description}</p>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <button id="featured-launch-details-btn" class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>
            <div class="icons self-end md:self-center">
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="far fa-heart"></i></button>
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="fas fa-bell"></i></button>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
            <img src="${image}" alt="${launch.name}" class="w-full h-full object-cover" onerror="this.src='./images/launch-placeholder.png'" />
            <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  `;
 
  const detailsBtn = document.getElementById("featured-launch-details-btn");
  if (detailsBtn) {
    detailsBtn.addEventListener("click", () => openLaunchDetailsModal(launch));
  }
}
 
function openLaunchDetailsModal(launch) {
  const provider = launch.launch_service_provider
    ? launch.launch_service_provider.name
    : "Unknown provider";
  const providerType =
    launch.launch_service_provider && launch.launch_service_provider.type
      ? launch.launch_service_provider.type
      : "Unknown";
  const rocketName = launch.rocket && launch.rocket.configuration
    ? launch.rocket.configuration.name
    : "Unknown rocket";
  const pad = launch.pad || {};
  const location = pad.location ? pad.location.name : "Unknown location";
  const padName = pad.name || "Unknown pad";
  const statusName = launch.status ? launch.status.name : "Unknown";
  const statusAbbrev = launch.status ? launch.status.abbrev : "TBD";
  const image = launch.image || "./images/launch-placeholder.png";
  const description =
    (launch.mission && launch.mission.description) ||
    "No mission description available yet.";
  const missionType = launch.mission && launch.mission.type ? launch.mission.type : "Unknown";
  const orbit =
    launch.mission && launch.mission.orbit ? launch.mission.orbit.name : "Unknown";
  const webcastUrl =
    launch.vidURLs && launch.vidURLs.length > 0
      ? launch.vidURLs[0].url
      : launch.infoURLs && launch.infoURLs.length > 0
      ? launch.infoURLs[0].url
      : null;
 
  openOverlay(
    "launch-details-modal",
    `
      <div class="cosmos-modal fade-in">
        <button class="cosmos-close-btn"><i class="fas fa-times"></i></button>
        <img class="cosmos-modal-image" src="${image}" alt="${launch.name}" onerror="this.src='./images/launch-placeholder.png'" />
        <div class="flex items-center gap-3 mb-3">
          <span class="status-pill" style="background-color:${statusColor(statusAbbrev)}">${statusAbbrev}</span>
          <span class="text-slate-400 text-sm">${statusName}</span>
        </div>
        <h3 class="text-2xl font-bold mb-2">${launch.name}</h3>
        <p class="text-slate-300 leading-relaxed mb-2">${description}</p>
 
        <div class="cosmos-modal-grid">
          <div class="cosmos-modal-stat"><p>Provider</p><p>${provider}</p></div>
          <div class="cosmos-modal-stat"><p>Provider Type</p><p>${providerType}</p></div>
          <div class="cosmos-modal-stat"><p>Rocket</p><p>${rocketName}</p></div>
          <div class="cosmos-modal-stat"><p>Mission Type</p><p>${missionType}</p></div>
          <div class="cosmos-modal-stat"><p>Target Orbit</p><p>${orbit}</p></div>
          <div class="cosmos-modal-stat"><p>Launch Date</p><p>${formatLaunchDate(launch.net)}</p></div>
          <div class="cosmos-modal-stat"><p>Launch Time</p><p>${formatLaunchTime(launch.net)}</p></div>
          <div class="cosmos-modal-stat"><p>Launch Pad</p><p>${padName}</p></div>
          <div class="cosmos-modal-stat"><p>Location</p><p>${location}</p></div>
        </div>
 
        ${
          webcastUrl
            ? `<a href="${webcastUrl}" target="_blank" rel="noopener" class="flex-1 inline-block w-full text-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold"><i class="fas fa-external-link-alt mr-2"></i>Watch / Official Info</a>`
            : `<p class="text-slate-500 text-sm">No official links are available for this launch yet.</p>`
        }
      </div>
    `
  );
}
 
function renderLaunchCard(launch) {
  const provider = launch.launch_service_provider
    ? launch.launch_service_provider.name
    : "Unknown provider";
  const rocketName = launch.rocket && launch.rocket.configuration
    ? launch.rocket.configuration.name
    : "Unknown rocket";
  const pad = launch.pad || {};
  const location = pad.location ? pad.location.name : "Unknown location";
  const statusAbbrev = launch.status ? launch.status.abbrev : "TBD";
  const image = launch.image || "./images/launch-placeholder.png";
 
  const card = document.createElement("div");
  card.className =
    "bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer fade-in";
  card.innerHTML = `
    <div class="relative h-48 bg-slate-900/50 overflow-hidden">
      <img src="${image}" alt="${launch.name}" class="w-full h-full object-cover" onerror="this.src='./images/launch-placeholder.png'" />
      <div class="absolute top-3 right-3">
        <span class="status-pill" style="background-color:${statusColor(statusAbbrev)}">${statusAbbrev}</span>
      </div>
    </div>
    <div class="p-5">
      <div class="mb-3">
        <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${launch.name}</h4>
        <p class="text-sm text-slate-400 flex items-center gap-2"><i class="fas fa-building text-xs"></i>${provider}</p>
      </div>
      <div class="space-y-2 mb-4">
        <div class="flex items-center gap-2 text-sm"><i class="fas fa-calendar text-slate-500 w-4"></i><span class="text-slate-300">${formatLaunchDate(launch.net)}</span></div>
        <div class="flex items-center gap-2 text-sm"><i class="fas fa-clock text-slate-500 w-4"></i><span class="text-slate-300">${formatLaunchTime(launch.net)}</span></div>
        <div class="flex items-center gap-2 text-sm"><i class="fas fa-rocket text-slate-500 w-4"></i><span class="text-slate-300">${rocketName}</span></div>
        <div class="flex items-center gap-2 text-sm"><i class="fas fa-map-marker-alt text-slate-500 w-4"></i><span class="text-slate-300 line-clamp-1">${location}</span></div>
      </div>
      <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
        <button class="launch-details-btn flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">Details</button>
        <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"><i class="far fa-heart"></i></button>
      </div>
    </div>
  `;
  // Clicking a card 
  const openAsFeatured = () => {
    renderFeaturedLaunch(launch);
    featuredLaunchEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  card.addEventListener("click", openAsFeatured);
 
  return card;
}
 
function showLaunchesError(message) {
  if (launchesGridEl) {
    launchesGridEl.innerHTML = `<div class="col-span-full cosmos-error"><i class="fas fa-triangle-exclamation"></i><span>${message}</span></div>`;
  }
}
 
async function loadLaunches() {
  try {
    const res = await fetch(LAUNCHES_URL);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();
    const launches = data.results || [];
 
    if (launches.length === 0) {
      showLaunchesError("No upcoming launches were returned right now.");
      return;
    }
 
    // Featured = first upcoming launch, grid = the rest
    renderFeaturedLaunch(launches[0]);
 
    if (launchesGridEl) {
      launchesGridEl.innerHTML = "";
      launches.slice(1).forEach((launch) => {
        launchesGridEl.appendChild(renderLaunchCard(launch));
      });
    }
 
    setText("launches-count", `${launches.length} Launches`);
    setText("launches-count-mobile", `${launches.length}`);
  } catch (error) {
    console.error("Launches error:", error);
    showLaunchesError(
      "Couldn't reach the SpaceDevs Launch Library API right now. Please try again in a moment."
    );
  }
}
  //  3) PLANETS 

 
const PLANETS_API_URL = "https://api.le-systeme-solaire.net/rest/bodies/";
 
let planets = [];
 
const planetImages = {
  mercury: "./images/mercury.png",
  venus: "./images/venus.png",
  earth: "./images/earth.png",
  mars: "./images/mars.png",
  jupiter: "./images/jupiter.png",
  saturn: "./images/saturn.png",
  uranus: "./images/uranus.png",
  neptune: "./images/neptune.png",
};
 
const descriptions = {
  mercury:
    "Mercury is the smallest planet and the closest planet to the Sun. It has no atmosphere capable of trapping heat.",
  venus:
    "Venus is the hottest planet in our Solar System because of its thick carbon dioxide atmosphere.",
  earth:
    "Earth is the third planet from the Sun and the only known planet to support life.",
  mars: "Mars is known as the Red Planet because of the iron oxide covering its surface.",
  jupiter:
    "Jupiter is the largest planet in the Solar System and is famous for the Great Red Spot.",
  saturn:
    "Saturn is well known for its spectacular ring system made of ice and rock.",
  uranus:
    "Uranus rotates on its side, making it one of the strangest planets in our Solar System.",
  neptune:
    "Neptune is the farthest planet from the Sun and has the fastest winds in the Solar System.",
};
 
const facts = {
  mercury: ["Closest planet to the Sun", "No moons", "Smallest planet", "One year = 88 days"],
  venus: ["Hottest planet", "Rotates backwards", "No moons", "Very dense atmosphere"],
  earth: ["Only known planet with life", "71% covered by water", "One moon", "Strong magnetic field"],
  mars: ["Known as the Red Planet", "Has Olympus Mons", "Two moons", "Possible ancient rivers"],
  jupiter: ["Largest planet", "Great Red Spot", "95+ moons", "Gas Giant"],
  saturn: ["Beautiful rings", "Gas Giant", "140+ moons", "Less dense than water"],
  uranus: ["Rotates sideways", "Ice Giant", "27 moons", "Blue-green color"],
  neptune: ["Fastest winds", "Ice Giant", "14 moons", "Dark blue planet"],
};
  //  Local fallback data
const FALLBACK_PLANETS_DATA = [
  {
    id: "mercury", englishName: "Mercury", isPlanet: true, moons: null,
    semimajorAxis: 57909050, perihelion: 46001200, aphelion: 69816900,
    eccentricity: 0.2056, inclination: 7.01,
    mass: { massValue: 3.285, massExponent: 23 },
    vol: { volValue: 6.083, volExponent: 10 },
    density: 5.427, gravity: 3.7, escape: 4250, meanRadius: 2439.4,
    sideralOrbit: 87.97, sideralRotation: 1407.6,
    discoveredBy: "", discoveryDate: "", axialTilt: 0.034,
    avgTemp: 440, bodyType: "Planet",
  },
  {
    id: "venus", englishName: "Venus", isPlanet: true, moons: null,
    semimajorAxis: 108208000, perihelion: 107477000, aphelion: 108939000,
    eccentricity: 0.0068, inclination: 3.39,
    mass: { massValue: 4.867, massExponent: 24 },
    vol: { volValue: 9.2843, volExponent: 11 },
    density: 5.243, gravity: 8.87, escape: 10360, meanRadius: 6051.8,
    sideralOrbit: 224.7, sideralRotation: -5832.6,
    discoveredBy: "", discoveryDate: "", axialTilt: 177.4,
    avgTemp: 737, bodyType: "Planet",
  },
  {
    id: "earth", englishName: "Earth", isPlanet: true,
    moons: [{ moon: "Moon" }],
    semimajorAxis: 149598023, perihelion: 147095000, aphelion: 152100000,
    eccentricity: 0.0167, inclination: 0.00,
    mass: { massValue: 5.972, massExponent: 24 },
    vol: { volValue: 1.08321, volExponent: 12 },
    density: 5.514, gravity: 9.8, escape: 11186, meanRadius: 6371.0,
    sideralOrbit: 365.25, sideralRotation: 23.93,
    discoveredBy: "", discoveryDate: "", axialTilt: 23.44,
    avgTemp: 288, bodyType: "Planet",
  },
  {
    id: "mars", englishName: "Mars", isPlanet: true,
    moons: [{ moon: "Phobos" }, { moon: "Deimos" }],
    semimajorAxis: 227939200, perihelion: 206700000, aphelion: 249200000,
    eccentricity: 0.0934, inclination: 1.85,
    mass: { massValue: 6.39, massExponent: 23 },
    vol: { volValue: 1.6318, volExponent: 11 },
    density: 3.933, gravity: 3.71, escape: 5030, meanRadius: 3389.5,
    sideralOrbit: 686.98, sideralRotation: 24.62,
    discoveredBy: "", discoveryDate: "", axialTilt: 25.19,
    avgTemp: 210, bodyType: "Planet",
  },
  {
    id: "jupiter", englishName: "Jupiter", isPlanet: true,
    moons: new Array(95).fill({ moon: "moon" }),
    semimajorAxis: 778570000, perihelion: 740520000, aphelion: 816620000,
    eccentricity: 0.0489, inclination: 1.303,
    mass: { massValue: 1.898, massExponent: 27 },
    vol: { volValue: 1.43128, volExponent: 15 },
    density: 1.326, gravity: 24.79, escape: 59500, meanRadius: 69911,
    sideralOrbit: 4332.59, sideralRotation: 9.93,
    discoveredBy: "", discoveryDate: "", axialTilt: 3.13,
    avgTemp: 165, bodyType: "Planet",
  },
  {
    id: "saturn", englishName: "Saturn", isPlanet: true,
    moons: new Array(146).fill({ moon: "moon" }),
    semimajorAxis: 1433530000, perihelion: 1352550000, aphelion: 1514500000,
    eccentricity: 0.0565, inclination: 2.485,
    mass: { massValue: 5.683, massExponent: 26 },
    vol: { volValue: 8.2713, volExponent: 14 },
    density: 0.687, gravity: 10.44, escape: 35500, meanRadius: 58232,
    sideralOrbit: 10759.22, sideralRotation: 10.66,
    discoveredBy: "", discoveryDate: "", axialTilt: 26.73,
    avgTemp: 134, bodyType: "Planet",
  },
  {
    id: "uranus", englishName: "Uranus", isPlanet: true,
    moons: new Array(27).fill({ moon: "moon" }),
    semimajorAxis: 2872460000, perihelion: 2741300000, aphelion: 3003620000,
    eccentricity: 0.0457, inclination: 0.773,
    mass: { massValue: 8.681, massExponent: 25 },
    vol: { volValue: 6.833, volExponent: 13 },
    density: 1.271, gravity: 8.87, escape: 21300, meanRadius: 25362,
    sideralOrbit: 30688.5, sideralRotation: -17.24,
    discoveredBy: "William Herschel", discoveryDate: "1781",
    axialTilt: 97.77, avgTemp: 76, bodyType: "Planet",
  },
  {
    id: "neptune", englishName: "Neptune", isPlanet: true,
    moons: new Array(14).fill({ moon: "moon" }),
    semimajorAxis: 4495060000, perihelion: 4444450000, aphelion: 4545670000,
    eccentricity: 0.0113, inclination: 1.77,
    mass: { massValue: 1.024, massExponent: 26 },
    vol: { volValue: 6.254, volExponent: 13 },
    density: 1.638, gravity: 11.15, escape: 23500, meanRadius: 24622,
    sideralOrbit: 60195, sideralRotation: 16.11,
    discoveredBy: "Urbain Le Verrier", discoveryDate: "1846",
    axialTilt: 28.32, avgTemp: 72, bodyType: "Planet",
  },
];
 
function showOfflineBanner() {
  const heading = document.querySelector('#planets .mb-4.md\\:mb-6, #planets .mb-6.md\\:mb-6');
  const container = document.querySelector("#planets .max-w-7xl");
  if (!container || document.getElementById("planets-offline-banner")) return;
 
  const banner = document.createElement("div");
  banner.id = "planets-offline-banner";
  banner.className = "cosmos-error mb-4";
  banner.innerHTML = `<i class="fas fa-plug-circle-exclamation"></i><span>Couldn't reach the Solar System OpenData API — showing locally saved planet data instead.</span>`;
  container.insertBefore(banner, container.firstChild);
}
 
function hideOfflineBanner() {
  const banner = document.getElementById("planets-offline-banner");
  if (banner) banner.remove();
}
 
async function getPlanets() {
  try {
    const response = await fetch(PLANETS_API_URL);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
 
    planets = data.bodies.filter((body) => body.isPlanet);
    hideOfflineBanner();
  } catch (error) {
    console.error("Planets API unavailable, using local fallback data:", error);
    planets = FALLBACK_PLANETS_DATA;
    showOfflineBanner();
  }
 
  addPlanetCardEvents();
 
  const earth = planets.find((item) => item.id === "earth");
  if (earth) {
    setActivePlanetCard("earth");
    displayPlanet(earth);
  }
}
 
function setActivePlanetCard(id) {
  document.querySelectorAll(".planet-card").forEach((card) => {
    card.classList.toggle("planet-card-active", card.dataset.planetId === id);
  });
 
  document.querySelectorAll("#planet-comparison-tbody tr").forEach((row) => {
    row.classList.toggle("comparison-row-active", row.dataset.planetId === id);
  });
}
 
function addPlanetCardEvents() {
  const cards = document.querySelectorAll(".planet-card");
 
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.planetId;
      const planet = planets.find((item) => item.id === id);
 
      if (planet) {
        setActivePlanetCard(id);
        displayPlanet(planet);
 
        // Scroll the detail panel into view so the change is obvious
        const detailSection = document.getElementById("planet-details-section");
        if (detailSection) {
          detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}
 
function showFacts(id) {
  const list = document.getElementById("planet-facts");
  if (!list) return;
 
  list.innerHTML = "";
  (facts[id] || []).forEach((fact) => {
    list.innerHTML += `
      <li class="flex items-start">
        <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
        <span class="text-slate-300">${fact}</span>
      </li>
    `;
  });
}
 
function kelvinToCelsius(k) {
  return Math.round(k - 273.15);
}
 
function displayPlanet(planet) {
  setImage("planet-detail-image", planetImages[planet.id]);
  setText("planet-detail-name", planet.englishName);
  setText("planet-detail-description", descriptions[planet.id] || "No description available.");
 
  // Semimajor axis is returned in km by this API
  setText(
    "planet-distance",
    planet.semimajorAxis ? planet.semimajorAxis.toLocaleString() + " km" : "Unknown"
  );
 
  setText("planet-radius", planet.meanRadius ? planet.meanRadius.toLocaleString() + " km" : "Unknown");
 
  if (planet.mass) {
    setText("planet-mass", `${planet.mass.massValue} × 10^${planet.mass.massExponent} kg`);
  } else {
    setText("planet-mass", "Unknown");
  }
 
  setText("planet-density", planet.density ? planet.density + " g/cm³" : "Unknown");
  setText("planet-gravity", planet.gravity ? planet.gravity + " m/s²" : "Unknown");
 
  setText(
    "planet-rotation",
    planet.sideralRotation
      ? Math.abs(planet.sideralRotation).toFixed(1) + " h" + (planet.sideralRotation < 0 ? " (retrograde)" : "")
      : "Unknown"
  );
 
  setText("planet-orbital-period", planet.sideralOrbit ? planet.sideralOrbit.toLocaleString() + " days" : "Unknown");
  setText("planet-moons", planet.moons ? planet.moons.length : 0);
 
  setText("planet-discoverer", planet.discoveredBy && planet.discoveredBy.trim() ? planet.discoveredBy : "Known since antiquity");
  setText("planet-discovery-date", planet.discoveryDate && planet.discoveryDate.trim() ? planet.discoveryDate : "Ancient");
  setText("planet-body-type", planet.bodyType || "Planet");
 
  if (planet.vol) {
    setText("planet-volume", `${planet.vol.volValue} × 10^${planet.vol.volExponent} km³`);
  } else {
    setText("planet-volume", "Unknown");
  }
 
  setText("planet-perihelion", planet.perihelion ? planet.perihelion.toLocaleString() + " km" : "Unknown");
  setText("planet-aphelion", planet.aphelion ? planet.aphelion.toLocaleString() + " km" : "Unknown");
  setText("planet-eccentricity", planet.eccentricity != null ? planet.eccentricity : "Unknown");
  setText("planet-inclination", planet.inclination != null ? planet.inclination + "°" : "Unknown");
  setText("planet-axial-tilt", planet.axialTilt != null ? planet.axialTilt + "°" : "Unknown");
  setText("planet-escape", planet.escape ? planet.escape + " m/s" : "Unknown");
  setText("planet-temp", planet.avgTemp ? kelvinToCelsius(planet.avgTemp) + "°C" : "N/A");
 
  showFacts(planet.id);
 
  // Fade the detail card in so the update feels intentional
  const detailSection = document.getElementById("planet-details-section");
  if (detailSection) {
    detailSection.classList.remove("fade-in");
    void detailSection.offsetWidth; // restart animation
    detailSection.classList.add("fade-in");
  }
}
  //  INITIALIZE
   
 
window.addEventListener("DOMContentLoaded", () => {
  // Today in Space
  loadAPOD(todayISO());
 
  // Launches
  loadLaunches();
 
  // Planets
  getPlanets();
});
 