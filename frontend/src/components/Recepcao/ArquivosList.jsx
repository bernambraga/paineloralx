
import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";

const ArquivosList = () => {
  const [arquivos, setArquivos] = useState([]);

  useEffect(() => {
    axiosInstance.get("/recepcao/arquivos/").then(res => setArquivos(res.data));
  }, []);

  return (
    <div className="arquivos-list-container">
      <h3>Arquivos para Download</h3>
      <ul className="arquivos-list">
        {arquivos.map(arquivo => (
          <li key={arquivo.nome}>
            <a
              href={arquivo.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {arquivo.nome}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArquivosList;
