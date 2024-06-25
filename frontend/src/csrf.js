import axios from 'axios';

export const getCsrfToken = async () => {
  const response = await axios.get('/api/csrf/');
  const csrfToken = response.data.csrfToken;
  axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
};
