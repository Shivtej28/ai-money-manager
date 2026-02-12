

const BASE_URL = 'https://finsight-backend-q5lh.onrender.com'; 

// Log the origin so the user can easily find it for their CORS configuration
console.log(`%c[System] %cFrontend Origin: %c${window.location.origin}`, 
  'color: #14b8a6; font-weight: bold', 
  'color: #fff', 
  'color: #fbbf24; font-weight: bold; text-decoration: underline'
);

export const getAuthToken = () => localStorage.getItem('zenmoney_token');
export const setAuthToken = (token: string) => localStorage.setItem('zenmoney_token', token);
export const removeAuthToken = () => localStorage.removeItem('zenmoney_token');



async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  headers.set('Accept', 'application/json');
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  console.log(`%c[API Request] %c${options.method || 'GET'} %c${url}`, 
    'color: #14b8a6; font-weight: bold', 
    'color: #fff; font-weight: bold', 
    'color: #94a3b8'
  );

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail?.[0]?.msg || errorData.detail || errorMessage;
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }

    if (response.status === 204) return [] as unknown as T;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }
    
    return [] as unknown as T;
  } catch (error: any) {
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
