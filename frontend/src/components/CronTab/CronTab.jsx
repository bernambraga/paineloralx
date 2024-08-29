import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CronTab.css';

const CronConfig = () => {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [scriptName, setScriptName] = useState('');
  const [scripts, setScripts] = useState([]);
  const [cronJobs, setCronJobs] = useState([]);
  const [message, setMessage] = useState(''); // Estado para a mensagem temporária
  const [messageType, setMessageType] = useState(''); // Estado para o tipo de mensagem (success ou error)


  useEffect(() => {
    fetchScripts();
    fetchCronJobs();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/bots/list-scripts/`);
      setScripts(response.data.scripts);
    } catch (error) {
      console.error('Failed to fetch scripts', error);
    }
  };

  const fetchCronJobs = async () => {
    try {
        const response = await axios.get(`${getBaseUrl()}/bots/list-cronjobs/`);
        if (response.data.status !== 'success' || !response.data.jobs) {
            console.error('CrontabError', response.data.message)
            setCronJobs([]);
        } else {
            setCronJobs(response.data.jobs);
        }
    } catch (error) {
        console.error('Failed to fetch cron jobs', error);
        setCronJobs([]);  // Opcional: para lidar com erros definindo cronJobs como vazio
    }
};

  const getBaseUrl = () => {
    const hostname = window.location.hostname;
  
    if (hostname === 'localhost') {
      return 'http://localhost:8000/api';
    } else if (hostname === 'dev.paineloralx.com.br') {
      return 'https://dev.paineloralx.com.br/api';
    } else {
      return 'https://paineloralx.com.br/api';
    }
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
        `${getBaseUrl()}/bots/update-cron/`,
        {
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
          script_folder: scriptName,
        },
        {
          headers: {
            'X-CSRFToken': getCSRFToken(),
          },
          withCredentials: true,
        }
      );
      setMessage(response.data.message); // Definir a mensagem de sucesso
      if(response.data.status === 'failed')
        setMessageType('error');
      else
        setMessageType('success');
      fetchCronJobs(); // Refresh the list of cron jobs
    } catch (error) {
      console.error('Error updating cron job:', error);
      setMessage('Failed to update cron job.'); // Definir a mensagem de erro
      setMessageType('error');
    } finally {
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
          setMessage('');
          setMessageType('');
      }, 3000);
    }
  };


  const handleDelete = async (command) => {
    try {
      const response = await axios.post(
        `${getBaseUrl()}/bots/delete-cron/`,
        {
          command: command,
        },
        {
          headers: {
            'X-CSRFToken': getCSRFToken(),
          },
          withCredentials: true,
        }
      );
      setMessage(response.data.message); // Definir a mensagem de sucesso
      setMessageType('success');
      fetchCronJobs(); // Refresh the list of cron jobs
    } catch (error) {
      console.error('Error deleting cron job:', error);
        setMessage('Failed to delete cron job.'); // Definir a mensagem de erro
        setMessageType('error');
    } finally {
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
          setMessage('');
          setMessageType('');
      }, 2500);
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
    <div className="container-cron">
      <h1>Bots Cron</h1>
      {/* {message && (
        <div className={`message-cron ${messageType}`}>{message}</div> // Exibir a mensagem temporária
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-container-cron">
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
          </div>
          <div className='input-container-cron'>
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
          <button className='button-cron' type="submit">Set Cron Job</button>
        </div>
      </form>*/}
      <div className="cron-jobs">
        {/* <h2>Configured Cron Jobs</h2>  */}
        <ul>
          {cronJobs.length === 0 ? (
            <li>No cron jobs found.</li>
            ) : (
          cronJobs.map((job, index) => (
            <li key={index}>
              {job.schedule} {job.command}
              {/* <button className="button-delete" onClick={() => handleDelete(job.command)}>Delete</button> */}
            </li>
            ))
          )}
        </ul>
      </div>
    </div>
    
  );
};

export default CronConfig;
