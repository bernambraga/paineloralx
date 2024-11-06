import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './ComercialGraficos.css'; // Importe o CSS aqui

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
} from 'chart.js';

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

const modalidadesDisponiveis = ['CT', 'OT', 'IO', 'SERVIÇOS', 'CR']

const ComercialGraficos = () => {
  const [graficoGeral, setGraficoGeral] = useState({});
  
  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState(["CT"]);
  
  const getBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:8000/api';
    } else if (hostname === 'dev.paineloralx.com.br') {
      return 'https://dev.paineloralx.com.br/api';
    } else {
      return 'https://paineloralx.com.br/api';
    }
  };

  // Carregar dados gerais da empresa (CT)
  useEffect(() => {
    fetch(`${getBaseUrl()}/comercial/grafico-geral/`)
      .then(response => response.json())
      .then(data => { setGraficoGeral(data) })
  }, []);

  // Definir os 12 meses do ano para o eixo X
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Função para associar o dado ao mês correto
  const getMonthIndex = (dateString) => {
    const date = new Date(dateString);
    return date.getMonth();  // Adiciona 1 ao índice do mês
  };

  const handleCheckboxChange = (modalidade) => {
    setModalidadesSelecionadas((prev) => {
      // Se a modalidade já estiver selecionada, remova-a
      if (prev.includes(modalidade)) {
        // Se for a última modalidade selecionada, não permita a desmarcação
        if (prev.length === 1) return prev;
        return prev.filter((mod) => mod !== modalidade);
      }
      // Caso contrário, adicione a modalidade
      return [...prev, modalidade];
    });
  };

  // Função de filtragem para as modalidades
  const filtrarDadosPorModalidade = (dados, modalidadesSelecionadas) => {
    if (!dados) return [];
    const dadosFiltrados = dados.filter(item => modalidadesSelecionadas.includes(item.modalidade));
    return dadosFiltrados;
  };

  // Dados filtrados para exames, pacientes e valores monetários com base nas modalidades selecionadas
  const examesAnoAtual = graficoGeral.exames_mensal?.filter(item => item.ano === new Date().getFullYear());
  const examesAnoAnterior = graficoGeral.exames_mensal?.filter(item => item.ano === new Date().getFullYear() - 1);

  const dadosExames = {
    labels: meses,
    datasets: [
      {
        label: 'Ano Atual',
        data: (() => {
          // Filtrar os dados uma vez para o ano atual
          const examesFiltradosAnoAtual = filtrarDadosPorModalidade(examesAnoAtual, modalidadesSelecionadas);

          // Mapear os dados mensais usando o array filtrado
          return meses.map((_, index) => {
            if (index === 0) {
              // Filtra e acumula os dados de dezembro para janeiro
              const totalExamesMes = examesFiltradosAnoAtual
                .filter(item => getMonthIndex(item.mes) === 11)
                .reduce((acc, item) => acc + (item.total_exames || 0), 0);
              return totalExamesMes === 0 ? null : totalExamesMes;
            } else {
              const totalExamesMes = examesFiltradosAnoAtual
                .filter(item => (getMonthIndex(item.mes) + 1) === index)
                .reduce((acc, item) => acc + (item.total_exames || 0), 0);
              return totalExamesMes === 0 ? null : totalExamesMes;
            }
          });
        })(),
        borderColor: 'green',
      },
      {
        label: 'Ano Anterior',
        data: (() => {
          // Filtrar os dados uma vez para o ano anterior
          const examesFiltradosAnoAnterior = filtrarDadosPorModalidade(examesAnoAnterior, modalidadesSelecionadas);

          // Mapear os dados mensais usando o array filtrado
          return meses.map((_, index) => {
            if (index === 0) {
              const totalExamesMesAnterior = examesFiltradosAnoAnterior
                .filter(item => getMonthIndex(item.mes) === 11)
                .reduce((acc, item) => acc + (item.total_exames || 0), 0);
              return totalExamesMesAnterior === 0 ? null : totalExamesMesAnterior;
            } else {
              const totalExamesMesAnterior = examesFiltradosAnoAnterior
                .filter(item => (getMonthIndex(item.mes) + 1) === index)
                .reduce((acc, item) => acc + (item.total_exames || 0), 0);
              return totalExamesMesAnterior === 0 ? null : totalExamesMesAnterior;
            }
          });
        })(),
        borderColor: 'blue',
      }
    ]
  };

  const pacientesAnoAtual = graficoGeral.exames_mensal?.filter(item => item.ano === new Date().getFullYear());
  const pacientesAnoAnterior = graficoGeral.exames_mensal?.filter(item => item.ano === new Date().getFullYear() - 1);

  const dadosPacientes = {
    labels: meses,
    datasets: [
      {
        label: 'Ano Atual',
        data: (() => {
          // Filtrar os dados uma vez para o ano atual
          const pacientesFiltradosAnoAtual = filtrarDadosPorModalidade(pacientesAnoAtual, modalidadesSelecionadas);

          // Mapear os dados mensais usando o array filtrado
          return meses.map((_, index) => {
            if (index === 0) {
              // Filtra e acumula os dados de dezembro para janeiro
              const totalPacientesMes = pacientesFiltradosAnoAtual
                .filter(item => getMonthIndex(item.mes) === 11)
                .reduce((acc, item) => acc + (item.total_pacientes || 0), 0);
              return totalPacientesMes === 0 ? null : totalPacientesMes
            } else {
              const totalPacientesMes = pacientesFiltradosAnoAtual
                .filter(item => (getMonthIndex(item.mes) + 1) === index)
                .reduce((acc, item) => acc + (item.total_pacientes || 0), 0);
              return totalPacientesMes === 0 ? null : totalPacientesMes
            }
          });
        })(),
        borderColor: 'green',
      },
      {
        label: 'Ano Anterior',
        data: (() => {
          // Filtrar os dados uma vez para o ano anterior
          const pacientesFiltradosAnoAnterior = filtrarDadosPorModalidade(pacientesAnoAnterior, modalidadesSelecionadas);

          // Mapear os dados mensais usando o array filtrado
          return meses.map((_, index) => {
            if (index === 0) {
              const totalPacientesMesAnterior = pacientesFiltradosAnoAnterior
                .filter(item => getMonthIndex(item.mes) === 11)
                .reduce((acc, item) => acc + (item.total_pacientes || 0), 0);
              return totalPacientesMesAnterior === 0 ? null : totalPacientesMesAnterior
            } else {
              const totalPacientesMesAnterior = pacientesFiltradosAnoAnterior
                .filter(item => (getMonthIndex(item.mes) + 1) === index)
                .reduce((acc, item) => acc + (item.total_pacientes || 0), 0);
              return totalPacientesMesAnterior === 0 ? null : totalPacientesMesAnterior
            }
          });
        })(),
        borderColor: 'blue',
      }
    ]
  };

  const valorAnoAtual = graficoGeral.exames_mensal?.filter(item => item.ano === new Date().getFullYear());
  const valorAnoAnterior = graficoGeral.exames_mensal?.filter(item => item.ano === new Date().getFullYear() - 1);

  const dadosMonetario = {
    labels: meses,
    datasets: [
      {
        label: 'Ano Atual',
        data: (() => {
          // Filtrar os dados uma vez para o ano atual
          const valorFiltradoAnoAtual = filtrarDadosPorModalidade(valorAnoAtual, modalidadesSelecionadas);
          // Mapear os dados mensais usando o array filtrado
          return meses.map((_, index) => {
            const totalValorMes = (index === 0)
              ? valorFiltradoAnoAtual
                .filter(item => getMonthIndex(item.mes) === 11)
                .reduce((acc, item) => acc + (parseFloat(item.total_valor) || 0), 0)
              : valorFiltradoAnoAtual
                .filter(item => (getMonthIndex(item.mes) + 1) === index)
                .reduce((acc, item) => acc + (parseFloat(item.total_valor) || 0), 0);

            return totalValorMes === 0 ? null : totalValorMes;
          });
        })(),
        borderColor: 'green',
      },
      {
        label: 'Ano Anterior',
        data: (() => {
          // Filtrar os dados uma vez para o ano anterior
          const valorFiltradoAnoAnterior = filtrarDadosPorModalidade(valorAnoAnterior, modalidadesSelecionadas);
          // Mapear os dados mensais usando o array filtrado
          return meses.map((_, index) => {
            const totalValorMesAnterior = (index === 0)
              ? valorFiltradoAnoAnterior
                .filter(item => getMonthIndex(item.mes) === 11)
                .reduce((acc, item) => acc + (parseFloat(item.total_valor) || 0), 0)
              : valorFiltradoAnoAnterior
                .filter(item => (getMonthIndex(item.mes) + 1) === index)
                .reduce((acc, item) => acc + (parseFloat(item.total_valor) || 0), 0);

            return totalValorMesAnterior === 0 ? null : totalValorMesAnterior;
          });
        })(),
        borderColor: 'blue',
      }
    ]
  };

  return (
    <div className="container-log">
      <h2>Filtro de Modalidades</h2>
      <div className='modalidades_div'>
        {modalidadesDisponiveis.map((modalidade) => (
          <label className='modalidades_cb' key={modalidade}>
            <input
              type="checkbox"
              checked={modalidadesSelecionadas.includes(modalidade)}
              onChange={() => handleCheckboxChange(modalidade)}
            />
            {modalidade}
          </label>
        ))}
      </div>
      <div className="grafico-container">
        <h2>Quantidade de Pacientes</h2>
        <Line data={dadosPacientes} />
      </div>
      <div className="grafico-container">
        <h2>Quantidade de Exames</h2>
        <Line data={dadosExames} />
      </div>
      <div className="grafico-container">
        <h2>Visão Monetária</h2>
        <Line data={dadosMonetario} />
      </div>
    </div>
  )
}

export default ComercialGraficos;