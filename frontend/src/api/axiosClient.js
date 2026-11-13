import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true, // send the Django session cookie for authenticated endpoints
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// axios's built-in xsrfCookieName/xsrfHeaderName only auto-attaches the header for
// same-origin requests. localhost:5173 -> localhost:8000 is cross-origin (different port),
// so we read Django's csrftoken cookie and attach the header ourselves.
axiosClient.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default axiosClient;
