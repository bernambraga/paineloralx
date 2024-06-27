import React, { useEffect, useState } from 'react';

const SAC = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/logs/');

    socket.onmessage = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      <h1>SAC - Log Viewer</h1>
      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default SAC;
