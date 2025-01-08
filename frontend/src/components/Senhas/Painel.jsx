import React, { useState, useEffect } from "react";
import axios from "axios";

const Painel = () => {
  const getBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === "localhost") {
      return "http://localhost:8000/api";
    } else if (hostname === "dev.paineloralx.com.br") {
      return "https://dev.paineloralx.com.br/api";
    } else {
      return "https://paineloralx.com.br/api";
    }
  };

  const unidades = {
    Pinheiros: "pinheiros",
    Angélica: "angelica",
    "9 de Julho": "9julho",
  };
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
  const [nomeExibidoUnidade, setNomeExibidoUnidade] = useState(""); // Nome amigável
  const [senhas, setSenhas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca as senhas da unidade selecionada
  const carregarSenhas = async (unidade) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${getBaseUrl()}/senhas/listar_senhas?unidade=${unidade}`
      );
      setSenhas(response.data);
      console.info(response.data);
    } catch (error) {
      console.error("Erro ao carregar senhas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gera uma nova senha para a unidade selecionada
  const gerarSenha = async () => {
    if (!unidadeSelecionada) {
      alert("Selecione uma unidade primeiro!");
      return;
    }
    const tipo = "prioritario";
    setLoading(true);
    try {
      const response = await axios.get(
        `${getBaseUrl()}/senhas/gerar_senha/?unidade=${unidadeSelecionada}&tipo=${tipo}`
      );
      carregarSenhas(unidadeSelecionada); // Recarrega as senhas após gerar uma nova
    } catch (error) {
      console.error("Erro ao gerar senha:", error);
      alert("Erro ao gerar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Botões das unidades */}
      <div style={styles.unidadesContainer}>
        {Object.keys(unidades).map((unidadeExibida) => (
          <button
            key={unidadeExibida}
            style={styles.unidadeButton}
            onClick={() => {
              const unidadeApi = unidades[unidadeExibida];
              setUnidadeSelecionada(unidadeApi); // Define o valor enviado para a API
              setNomeExibidoUnidade(unidadeExibida); // Define o nome amigável exibido
              carregarSenhas(unidadeApi); // Carrega as senhas da unidade selecionada
            }}
          >
            {unidadeExibida}
          </button>
        ))}
      </div>

      {/* Tabela com as senhas */}
      {unidadeSelecionada && (
        <div style={styles.tabelaContainer}>
          <h3 style={styles.h3}>Senhas - {nomeExibidoUnidade}</h3> {/* Nome amigável exibido */}
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Número</th>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Hora</th>
                </tr>
              </thead>
              <tbody>
                {senhas.length > 0 ? (
                  senhas.map((senha, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{senha.tipo}</td>
                      <td style={styles.td}>{senha.numero}</td>
                      <td style={styles.td}>{senha.data_criacao}</td>
                      <td style={styles.td}>{senha.hora_criacao}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={styles.td} colSpan="4">
                      Nenhuma senha gerada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          <button style={styles.gerarSenhaButton} onClick={gerarSenha}>
            Gerar Nova Senha
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  unidadesContainer: {
    display: "flex",
    flexDirection: "row",
    justifycontent: "center",
    alignItems: "center", // Centraliza verticalmente (se necessário)
    flexWrap: "wrap", // Permite que os botões quebrem linha se necessário
    gap: "10px",
    marginBottom: "20px",
  },
  unidadeButton: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
  },
  tabelaContainer: {
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center", // Centraliza o texto em todas as células
  },
  th: {
    border: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ddd",
    padding: "10px",
    verticalAlign: "middle", // Alinha verticalmente ao centro
  },
  gerarSenhaButton: {
    marginTop: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
  },
  h3: {
    marginBottom: "10px",
    textAlign: "center",
  }
};

export default Painel;
