// GallaMandi API configuration
// Local Live Server → local Express backend
// Deployed frontend → deployed Render backend

const IS_LOCAL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = IS_LOCAL
  ? "http://localhost:5000"
  : "https://gallamandi.onrender.com";
