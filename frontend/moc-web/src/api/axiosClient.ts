import axios from 'axios';

/**
 * Resolves the ASP.NET Core API base URL (includes /api segment).
 * VITE_API_BASE_URL is the backend origin only; /api is appended for controller routes.
 */
function resolveAxiosBaseUrl(): string {
  const root = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(
    /\/$/,
    ''
  );
  return `${root}/api`;
}

/**
 * Axios client configured for the MOC API.
 * Base URL points to the ASP.NET Core backend.
 * Interceptors handle auth headers and error responses consistently.
 */
const axiosClient = axios.create({
  baseURL: resolveAxiosBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (stub for now)
axiosClient.interceptors.request.use(
  (config) => {
    // TODO: Add real auth token when identity is implemented
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // TODO: Redirect to login when auth is implemented
        console.error('Unauthorized - redirect to login');
      } else if (status === 403) {
        console.error('Forbidden - insufficient permissions');
      } else if (status === 500) {
        console.error('Server error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
