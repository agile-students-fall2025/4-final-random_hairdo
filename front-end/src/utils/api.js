// API utility to handle base URL for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export default getApiUrl;
