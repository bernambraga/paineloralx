import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "./Top15.css"; // Importe o CSS aqui

// para total de pacientes é necessário uma outra regra pois um paciente realizando 3 exames esta sendo contado como 3 pacientes

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar os componentes necessários
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Top15 = () => {
  const [topSolicitantes, setTopSolicitantes] = useState([]);

  const [solicitantesSelecionados, setSolicitantesSelecionados] = useState([]);

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

  // Carregar top 15 solicitantes e selecionar os top 5 iniciais
  useEffect(() => {
    fetch(`${getBaseUrl()}/comercial/top-15-solicitantes/`)
      .then((response) => response.json())
      .then((data) => {
        setTopSolicitantes(data); // Manter os dados completos para os gráficos

        // Criar lista de solicitantes únicos apenas para os botões
        const solicitantesUnicos = Array.from(
          new Set(data.map((solicitante) => solicitante.solicitante))
        );

        // Seleciona os top 5 solicitantes iniciais
        const top5 = solicitantesUnicos.slice(0, 5);
        setSolicitantesSelecionados(top5);
      });
  }, []);

  // Função para selecionar/deselecionar solicitantes
  const toggleSolicitante = (solicitante) => {
    setSolicitantesSelecionados((prevState) =>
      prevState.includes(solicitante)
        ? prevState.filter((item) => item !== solicitante)
        : [...prevState, solicitante]
    );
  };
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
  // Função para obter os últimos 12 meses a partir do mês atual
  const getUltimos12Meses = () => {
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

  // Últimos 12 meses para o eixo X
  const ult12meses = getUltimos12Meses();

  return (
    <div className="container-log">
      <div className="grafico-container">
        <h2>Top 15 Solicitantes - CT</h2>
        <Line
          data={{
            labels: ult12meses,
            datasets: solicitantesSelecionados.map((solicitante, index) => ({
              label: solicitante,
              data: ult12meses.map((mesAno) => {
                const solicitanteDados = topSolicitantes
                  .filter((s) => s.solicitante === solicitante)
                  .find((s) => {
                    const mesFormatado = `${meses[s.mes - 1]}/${s.ano}`;
                    console.log(mesFormatado);
                    console.log(mesAno);
                    return mesFormatado === mesAno;
                  });
                return solicitanteDados ? solicitanteDados.total_exames : 0;
              }),
              borderColor: `hsl(${
                (index * 360) / solicitantesSelecionados.length
              }, 100%, 50%)`,
            })),
          }}
        />
        <div className="solicitantes-container">
          {Array.from(new Set(topSolicitantes.map((s) => s.solicitante))).map(
            (solicitante) => (
              <button
                key={solicitante}
                className={`solicitante-btn ${
                  solicitantesSelecionados.includes(solicitante)
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleSolicitante(solicitante)}
              >
                {solicitante}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Top15;
