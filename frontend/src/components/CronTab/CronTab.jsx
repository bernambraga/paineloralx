import React, { useState } from 'react';
import axios from 'axios';
import './CronTab.css'; // Importe o CSS aqui

const CronConfig = () => {
  const [interval, setInterval] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/update-cron/', { interval });
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
