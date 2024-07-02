import React, { useEffect, useState, useRef } from 'react';

const SAC = () => {
  const [logs, setLogs] = useState([]);
  const [logFilePath, setLogFilePath] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const initialRender = useRef(true); // Flag para evitar chamadas múltiplas na montagem inicial

  useEffect(() => {
    const fetchLogs = async () => {
      if (isFetching) return; // Prevent multiple simultaneous fetches

      setIsFetching(true);
      try {
        const response = await fetch('http://localhost:8000/sac/logs/');
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
      setIsFetching(false);
    };

    // Call fetchLogs immediately to load data on page load
    if (initialRender.current) {
      fetchLogs();
      initialRender.current = false;
    }

    // Set an interval to call fetchLogs every 30 seconds
    const intervalId = setInterval(fetchLogs, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [isFetching]); // Dependência de isFetching para reexecutar o efeito quando necessário

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
