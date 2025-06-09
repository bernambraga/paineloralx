import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import "./comercialDentistas.css"; // Importe o CSS aqui

//Buscar por nome ou CRO
//Reorganizar front
//Na tabela fazer uma linha para cada modalidade e uma linha com o total mensal
//Botão de download de relatorio com a lista detalhada de exames realizados desse dentista
//ticket medio??

const ComercialDentistas = () => {
  const [solicitantes, setSolicitantes] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [solicitanteSelecionado, setSolicitanteSelecionado] = useState(null);
  const [graficoPacientes, setGraficoPacientes] = useState({
    meses: [],
    valores: [],
  });

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

  // Buscar a lista de solicitantes na API
  useEffect(() => {
    const CACHE_KEY = "solicitantesCache";
    const CACHE_TIME_KEY = "solicitantesCacheTime";
    const UM_DIA_MS = 72 * 60 * 60 * 1000; // 1 dia em milissegundos

    const agora = new Date().getTime();
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    const cacheData = localStorage.getItem(CACHE_KEY);

    // Verifica se os dados estão no cache e se têm menos de 1 dia
    if (cacheData && cacheTime && agora - cacheTime < UM_DIA_MS) {
      console.log("Usando cache dos solicitantes");
      setSolicitantes(JSON.parse(cacheData));
      return;
    }

    // Se o cache for antigo ou inexistente, buscar da API
    fetch(`${getBaseUrl()}/comercial/solicitantes/`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.solicitantes)) {
          setSolicitantes(data.solicitantes);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.solicitantes)); // Salvar no cache
          localStorage.setItem(CACHE_TIME_KEY, agora.toString()); // Salvar tempo de cache
          console.log("Dados atualizados da API");
        } else {
          console.error("Erro: A resposta da API não é uma lista.");
        }
      })
      .catch((error) => console.error("Erro ao buscar solicitantes:", error));
  }, []);

  // Função para buscar os detalhes do solicitante selecionado
  const handleBuscar = () => {
    console.log("Botão Buscar clicado! pesquisa:", pesquisa);
    if (pesquisa) {
      fetch(
        `${getBaseUrl()}/comercial/solicitante-details?solicitante=${pesquisa}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Resposta da API:", data);
          if (!data.erro) {
            setSolicitanteSelecionado(data);
          }
        })
        .catch((error) => console.error("Erro ao buscar detalhes:", error));
    }
  };

  const processarDadosParaGrafico = useCallback((dados) => {
    const mesesUltimos12 = getUltimos12Meses();
    const pacientesPorMes = {};

    // Inicializa todos os meses com 0 pacientes
    mesesUltimos12.forEach((mes) => {
      pacientesPorMes[mes] = 0;
    });

    // Agrupar pacientes por mês e somar os totais
    dados.forEach((item) => {
      const mesNome = formatarMesAno(item.mes, item.ano);
      if (pacientesPorMes[mesNome] !== undefined) {
        pacientesPorMes[mesNome] += item.total_pacientes;
      }
    });

    const novoEstado = {
      meses: mesesUltimos12,
      valores: mesesUltimos12.map((mesAno) => pacientesPorMes[mesAno] || 0),
    };

    // Só atualiza se os valores forem realmente diferentes
    setGraficoPacientes((prevState) =>
      JSON.stringify(prevState) === JSON.stringify(novoEstado)
        ? prevState
        : novoEstado
    );
  }, []);

  // Função para garantir que `mesAno` está no mesmo formato que `getUltimos12Meses()`
  const formatarMesAno = (mes, ano) => {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return `${meses[parseInt(mes, 10) - 1]}/${ano}`;
  };

  // Função que retorna os últimos 12 meses no formato "MMM/AAAA"
  const getUltimos12Meses = () => {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const hoje = new Date();
    const ultimos12Meses = [];

    for (let i = 12; i > 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNome = meses[data.getMonth()];
      const ano = data.getFullYear();
      ultimos12Meses.push(`${mesNome}/${ano}`);
    }

    return ultimos12Meses;
  };

  const formatarDataParaMesAno = (dataString) => {
    if (!dataString) return "Não informado"; // Evita erro se for nulo

    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const partes = dataString.split("-");
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Mês no JavaScript começa em 0

    return `${meses[mes]}/${ano}`;
  };

  useEffect(() => {
    if (
      solicitanteSelecionado &&
      solicitanteSelecionado.totalModalidade.length > 0
    ) {
      processarDadosParaGrafico(solicitanteSelecionado.totalModalidade);
    }
  }, [solicitanteSelecionado, processarDadosParaGrafico]);

  return (
    <div className="container">
      <h2>Pesquisa de Solicitantes</h2>

      {/* Barra de pesquisa com Autocomplete */}
      <div className="search-bar">
        <input className="inputDentistas"
          type="text"
          placeholder="Digite o nome do solicitante..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          list="solicitantes-list"
          onFocus={() => setPesquisa("")}
        />
        <datalist id="solicitantes-list">
          {solicitantes.map((s, index) => (
            <option key={index} value={s} />
          ))}
        </datalist>
        <button className="buttonDentistas" onClick={handleBuscar}>Buscar</button>
      </div>

      {/* Exibir os detalhes do solicitante selecionado */}
      {solicitanteSelecionado && solicitanteSelecionado.info.length > 0 && (
        <div className="card">
          <div className="infobox">
            <div className="infocol">
              <h3>{solicitanteSelecionado.info[0].nome || "Não informado"}</h3>
              <p>
                <strong>Email:</strong>{" "}
                {solicitanteSelecionado.info[0].email || "Não informado"}
              </p>
              <p>
                <strong>Telefone:</strong>{" "}
                {solicitanteSelecionado.info[0].telefone || "Não informado"}
              </p>
              <p>
                <strong>Celular:</strong>{" "}
                {solicitanteSelecionado.info[0].celular || "Não informado"}
              </p>
              <p>
                <strong>Obs:</strong>{" "}
                {solicitanteSelecionado.info[0].observacao || "Não informado"}
              </p>
            </div>
            <div className="infocol">
              <h3>
                <strong>CRO:</strong>{" "}
                {solicitanteSelecionado.info[0].cro || "Não informado"}
              </h3>
              <p>
                <strong>Endereço:</strong>{" "}
                {solicitanteSelecionado.info[0].logradouro},{" "}
                {solicitanteSelecionado.info[0].numero} -{" "}
                {solicitanteSelecionado.info[0].complemento} -{" "}
                {solicitanteSelecionado.info[0].bairro}
              </p>
              <p>
                {solicitanteSelecionado.info[0].cidade} {"  "}
                {solicitanteSelecionado.info[0].estado}
              </p>
              <p>
                <strong>CEP:</strong>{" "}
                {solicitanteSelecionado.info[0].cep || "Não informado"}
              </p>

              <p>
                <strong>Data Cadastro:</strong>{" "}
                {solicitanteSelecionado.info[0].data_cadastro ||
                  "Não informado"}
              </p>
            </div>
          </div>

          {/* Exibir pontuação e ranking */}
          {solicitanteSelecionado.pontuacao.length > 0 && (
            <>
              <div className="ranking">
                <h4>Pontuação e Ranking Últimos 12 Meses</h4>
                <div className="infobox">
                  <div className="infocol">
                    <p>
                      <strong>Pontuação:</strong>{" "}
                      {solicitanteSelecionado.pontuacao[0].pontuacao.toFixed(2)}
                    </p>
                  </div>
                  <div className="infocol">
                    <p>
                      <strong>Último Mês com Exames:</strong>{" "}
                      {formatarDataParaMesAno(
                        solicitanteSelecionado.pontuacao[0]
                          .ultimo_mes_com_exames
                      )}
                    </p>
                  </div>
                  <div className="infocol">
                    <p>
                      <strong>Total de Exames:</strong>{" "}
                      {solicitanteSelecionado.pontuacao[0].total_exames}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Gráficos */}
          {solicitanteSelecionado.pontuacao.length > 0 && (
            <>
              <div className="graficos">
                <div className="grafico">
                  <h4>Total de Exames por Mês</h4>
                  <Line
                    data={{
                      labels: graficoPacientes.meses,
                      datasets: [
                        {
                          label: "Total de Exames",
                          data: graficoPacientes.valores,
                          borderColor: "blue",
                          fill: false,
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </>
          )}
          {/* Tabela de Modalidades */}
          {solicitanteSelecionado.pontuacao.length > 0 && (
            <>
              <div className="tabela">
                <h4>Exames por Modalidade</h4>
                {(() => {
                  const dados = solicitanteSelecionado.totalModalidade;

                  // Coleta de modalidades únicas
                  const modalidades = [
                    ...new Set(dados.map((item) => item.modalidade)),
                  ];

                  // Agrupamento por "mes/ano"
                  const agrupadoPorData = {};
                  dados.forEach((item) => {
                    const chave = `${item.mes}/${item.ano}`;
                    if (!agrupadoPorData[chave]) {
                      agrupadoPorData[chave] = {};
                    }
                    agrupadoPorData[chave][item.modalidade] =
                      item.total_pacientes;
                  });

                  // Datas ordenadas
                  const datasOrdenadas = Object.keys(agrupadoPorData).sort(
                    (a, b) => {
                      const [m1, y1] = a.split("/").map(Number);
                      const [m2, y2] = b.split("/").map(Number);
                      return y1 !== y2 ? y1 - y2 : m1 - m2;
                    }
                  );

                  return (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          {modalidades.map((mod, index) => (
                            <th key={index}>{mod}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {datasOrdenadas.map((data, idx) => (
                          <tr key={idx}>
                            <td>{data}</td>
                            {modalidades.map((mod, i) => (
                              <td key={i}>{agrupadoPorData[data][mod] || 0}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ComercialDentistas;
