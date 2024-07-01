import React, { useEffect, useState } from 'react';

const SAC = () => {
  const [logs, setLogs] = useState([]);
  const [logFilePath, setLogFilePath] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/logs/');
        const data = await response.json();
        console.log("Fetched data:", data);  // Debugging information
        if (response.ok) {
          setLogs(data.logs);
          setLogFilePath(data.log_file_path);
        } else {
          console.error(data.error);
          setLogFilePath(data.log_file_path);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    // Call fetchLogs immediately to load data on page load
    fetchLogs();

    // Set an interval to call fetchLogs every 30 seconds
    const intervalId = setInterval(fetchLogs, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>SAC - Log Viewer</h1>
      <p><strong>Log File Path:</strong> {logFilePath}</p>
      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default SAC;