import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";

const Painel = () => {
  const unidades = {
    Pinheiros: "pinheiros",
    Angélica: "angelica",
    NovedeJulho: "9julho",
    Tatuape: "tatuape",
  };

  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
  const [nomeExibidoUnidade, setNomeExibidoUnidade] = useState("");
  const [senhas, setSenhas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const carregarSenhas = async (unidade) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/senhas/listar_senhas?unidade=${unidade}`
      );
      setSenhas(response.data);
    } catch (error) {
      console.error("Erro ao carregar senhas:", error);
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const gerarSenha = async () => {
    if (!unidadeSelecionada) {
      setStatusMessage("Selecione uma unidade primeiro!");
      return;
    }
    const tipo = "prioritario";
    setLoading(true);
    try {
      await axiosInstance.get(
        `/senhas/gerar_senha/?unidade=${unidadeSelecionada}&tipo=${tipo}`
      );
      carregarSenhas(unidadeSelecionada);
    } catch (error) {
      console.error("Erro ao gerar senha:", error);
      setStatusMessage("Erro ao gerar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.unidadesContainer}>
        {Object.keys(unidades).map((unidadeExibida) => (
          <button
            key={unidadeExibida}
            style={styles.unidadeButton}
            onClick={() => {
              const unidadeApi = unidades[unidadeExibida];
              setUnidadeSelecionada(unidadeApi);
              setNomeExibidoUnidade(unidadeExibida);
              carregarSenhas(unidadeApi);
            }}
          >
            {unidadeExibida}
          </button>
        ))}
      </div>

      {unidadeSelecionada && (
        <div style={styles.tabelaContainer}>
          <h3 style={styles.h3}>Senhas - {nomeExibidoUnidade}</h3>
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
          <div>
            <button style={styles.gerarSenhaButton} onClick={gerarSenha}>
              Gerar Nova Senha
            </button>
            <label>{statusMessage}</label>
          </div>
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
    alignItems: "center",
    flexWrap: "wrap",
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
    textAlign: "center",
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
    verticalAlign: "middle",
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
  },
};

export default Painel;
