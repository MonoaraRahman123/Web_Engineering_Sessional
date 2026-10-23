// API client using native AJAX fetch()
const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('edtech_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic AJAX Request Helper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`AJAX fetch error at ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Authentication
  login: async (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  verifyToken: async () => {
    return request('/auth/verify', {
      method: 'GET',
    });
  },

  // Startups CRUD
  getStartups: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.sector && params.sector !== 'All') searchParams.append('sector', params.sector);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const queryString = searchParams.toString();
    const endpoint = `/startups${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  getStartupById: async (id) => {
    return request(`/startups/${id}`, { method: 'GET' });
  },

  createStartup: async (startupData) => {
    return request('/startups', {
      method: 'POST',
      body: JSON.stringify(startupData),
    });
  },

  updateStartup: async (id, startupData) => {
    return request(`/startups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(startupData),
    });
  },

  deleteStartup: async (id) => {
    return request(`/startups/${id}`, {
      method: 'DELETE',
    });
  },
};
