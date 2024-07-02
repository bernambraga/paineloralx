import React, { useState } from 'react';
import axios from 'axios';
import './CronTab.css'; // Importe o CSS aqui

const CronConfig = () => {
  const [interval, setInterval] = useState(1);

  const getBaseUrl = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://paineloralx.com.br';
  };

  const getCSRFToken = () => {
    let csrfToken = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === 'csrftoken=') {
          csrfToken = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }
    return csrfToken;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${getBaseUrl()}/sac/update-cron/`,
        { interval },
        {
          headers: {
            'X-CSRFToken': getCSRFToken(),
          },
          withCredentials: true,
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error('Error updating cron:', error);
      alert('Failed to update cron job.');
    }
  };

  return (
    <div className="container">
      <h1>Configure Cron Job</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Interval (minutes):
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            min="1"
          />
        </label>
        <button type="submit">Update Cron Job</button>
      </form>
    </div>
  );
};

export default CronConfig;
