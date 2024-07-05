import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CronTab.css';

const CronConfig = () => {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [scriptName, setScriptName] = useState('');
  const [scripts, setScripts] = useState([]);
  const [cronJobs, setCronJobs] = useState([]);

  useEffect(() => {
    fetchScripts();
    fetchCronJobs();
  }, []);

  const fetchScripts = async () => {
    const response = await axios.get(`${getBaseUrl()}/sac/list-scripts/`);
    setScripts(response.data.scripts);
  };

  const fetchCronJobs = async () => {
    const response = await axios.get(`${getBaseUrl()}/sac/list-cronjobs/`);
    setCronJobs(response.data.jobs);
  };

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
        {
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
          script_name: scriptName,
        },
        {
          headers: {
            'X-CSRFToken': getCSRFToken(),
          },
          withCredentials: true,
        }
      );
      alert(response.data.message);
      fetchCronJobs(); // Refresh the list of cron jobs
    } catch (error) {
      console.error('Error updating cron:', error);
      alert('Failed to update cron job.');
    }
  };

  const handleHourChange = (e) => {
    const value = e.target.value.padStart(2, '0');
    setHour(value);
  };

  const handleMinuteChange = (e) => {
    const value = e.target.value.padStart(2, '0');
    setMinute(value);
  };

  const handleScriptChange = (e) => {
    setScriptName(e.target.value);
  };

  return (
    <div className="container">
      <h1>Cron Job Scheduler</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>
            Hour:
            <input
              type="number"
              value={hour}
              onChange={handleHourChange}
              min="0"
              max="23"
              required
            />
          </label>
          <label>
            Minute:
            <input
              type="number"
              value={minute}
              onChange={handleMinuteChange}
              min="0"
              max="59"
              required
            />
          </label>
          <label>
            Script:
            <select value={scriptName} onChange={handleScriptChange}>
              <option value="">Selecione um Bot </option>
              {scripts.map((script) => (
                <option key={script} value={script}>
                  {script}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit">Set Cron Job</button>
      </form>
      <div className="cron-jobs">
        <h2>Configured Cron Jobs</h2>
        <ul>
          {cronJobs.map((job, index) => (
            <li key={index}>
              {job.schedule} - {job.command}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CronConfig;
