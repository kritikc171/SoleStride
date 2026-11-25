const API_URL = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const token = localStorage.getItem('solestride-token');
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  let result;
  try { result = await response.json(); } catch { throw new Error('The server returned an invalid response'); }
  if (!response.ok || !result.success) {
    const error = new Error(result.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return result.data;
}

export function imageUrl(image) {
  if (!image) return '';
  return image.startsWith('http') ? image : `${API_URL}${image}`;
}
