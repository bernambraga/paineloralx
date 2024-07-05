import React, { useEffect, useState, useRef } from 'react';
import './LogReader.css'; // Importe o CSS aqui

const LogReader = () => {
  const [logs, setLogs] = useState([]);
  const [logFilePath, setLogFilePath] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const initialRender = useRef(true); // Flag para evitar chamadas múltiplas na montagem inicial

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      if (isFetching || !selectedFolder) return; // Prevent multiple simultaneous fetches and fetch only if a folder is selected

      setIsFetching(true);
      try {
        const response = await fetch(`http://localhost:8000/sac/logs/?folder=${selectedFolder}`);
        const data = await response.json();
        if (response.ok) {
          setLogs(data.logs);
          setLogFilePath(data.log_file_path);
        } else {
          console.error(data.error);
          setLogFilePath(data.log_file_path);
        }
      } catch (error) {
        console.error('Erro ao buscar logs:', error);
      }
      setIsFetching(false);
    };

    if (initialRender.current && selectedFolder) {
      fetchLogs();
      initialRender.current = false;
    }

    const intervalId = setInterval(fetchLogs, 30000);

    return () => clearInterval(intervalId);
  }, [isFetching, selectedFolder]);

  const fetchFolders = async () => {
    try {
      const response = await fetch('http://localhost:8000/sac/list-scripts/');
      const data = await response.json();
      setFolders(data.scripts);
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
    }
  };

  const handleFolderChange = (e) => {
    setSelectedFolder(e.target.value);
  };
  const [error, setError] = useState('');
  const handleDownloadClick = () => {
    if (selectedFolder) {
      setError('')
      window.location.href = `http://localhost:8000/sac/download-log/?folder=${selectedFolder}`;
    } else {
      setError('Por favor, selecione uma pasta primeiro.');
    }
  };

  return (
    <div className="container">
      <h1>Leitor de Logs</h1>
      <div className="input-container">
        <div className='column'>
          <label>
            Selecione um Bot:
            <select value={selectedFolder} onChange={handleFolderChange}>
              <option value="">Selecione um Bot</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='column'>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleDownloadClick}>Baixar Log</button>
        </div>
      </div>
      <p><strong>Caminho do arquivo de Log:</strong> {logFilePath}</p>
      <div className="log-container">
        {logs.slice(-500).reverse().map((log, index) => ( // Limita a 500 registros mais recentes e inverte a ordem
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default LogReader;
