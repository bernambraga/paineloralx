import React, { useEffect, useState, useRef } from 'react';
import './LogReader.css'; // Importe o CSS aqui

const LogReader = () => {
  const [logs, setLogs] = useState([]);
  const [logFilePath, setLogFilePath] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const initialRender = useRef(true); // Flag para evitar chamadas múltiplas na montagem inicial
  const [message, setMessage] = useState(''); // Estado para a mensagem temporária
  const [messageType, setMessageType] = useState(''); // Estado para o tipo de mensagem (success ou error)

  useEffect(() => {
    fetchFolders();
  }, []);


  const getBaseUrl = () => {
    const hostname = window.location.hostname;
  
    if (hostname === 'localhost') {
      return 'http://localhost:8000';
    } else if (hostname === 'dev.paineloralx.com.br') {
      return 'https://dev.paineloralx.com.br';
    } else {
      return 'https://paineloralx.com.br';
    }
  };


  useEffect(() => {
    const fetchLogs = async () => {
      if (isFetching || !selectedFolder) return; // Prevent multiple simultaneous fetches and fetch only if a folder is selected

      setIsFetching(true);
      try {
        const response = await fetch(`${getBaseUrl()}/bots/logs/?folder=${selectedFolder}`);
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
      const response = await fetch(`${getBaseUrl()}/bots/list-scripts/`);
      const data = await response.json();
      setFolders(data.scripts);
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
    }
  };

  const handleFolderChange = (e) => {
    setSelectedFolder(e.target.value);
  };
  const handleDownloadClick = () => {
    if (selectedFolder) {
      setMessage("Download iniciado."); // Definir a mensagem de sucesso
      setMessageType('success');
      window.location.href = `${getBaseUrl()}/bots/download-log/?folder=${selectedFolder}`;
    } else {
      setMessage('Por favor, selecione um Bot antes de realizar o download.'); // Definir a mensagem de erro
      setMessageType('error');
    }
    setTimeout(() => {
      setMessage('');
      setMessageType('');
  }, 2500);
  };

  return (
    <div className="container-log">
      <h1>Leitor de Logs</h1>
      {message && (
        <div className={`message ${messageType}`}>{message}</div> // Exibir a mensagem temporária
      )}
      <div className="input-container-log">
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
        <button onClick={handleDownloadClick}>Baixar Log</button>
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
