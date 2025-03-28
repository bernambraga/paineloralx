import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './Top15.css'; // Importe o CSS aqui

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

const Top15 = () => {
    const [topSolicitantes, setTopSolicitantes] = useState([]);

    const [solicitantesSelecionados, setSolicitantesSelecionados] = useState([]);

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

    // Carregar top 15 solicitantes e selecionar os top 5 iniciais
    useEffect(() => {
        fetch(`${getBaseUrl()}/comercial/top-15-solicitantes/`)
            .then(response => response.json())
            .then(data => {
                setTopSolicitantes(data);  // Manter os dados completos para os gráficos

                // Criar lista de solicitantes únicos apenas para os botões
                const solicitantesUnicos = Array.from(new Set(data.map(solicitante => solicitante.solicitante)));

                // Seleciona os top 5 solicitantes iniciais
                const top5 = solicitantesUnicos.slice(0, 5);
                setSolicitantesSelecionados(top5);
            });
    }, []);

    // Função para selecionar/deselecionar solicitantes
    const toggleSolicitante = (solicitante) => {
        setSolicitantesSelecionados(prevState =>
            prevState.includes(solicitante)
                ? prevState.filter(item => item !== solicitante)
                : [...prevState, solicitante]
        );
    };

    // Definir os 12 meses do ano para o eixo X
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Função para associar o dado ao mês correto
    const getMonthIndex = (dateString) => {
        const date = new Date(dateString);
        return date.getMonth();  // Adiciona 1 ao índice do mês
    };

    return (
        <div className="container-log">
            <div className="grafico-container">
                <h2>Top 15 Solicitantes</h2>
                {/* Gráfico com os solicitantes selecionados */}
                <Line
                    data={{
                        labels: meses, // Usar os mesmos 12 meses no eixo X
                        datasets: solicitantesSelecionados.map((solicitante, index) => ({
                            label: solicitante,
                            data: meses.map((mes, idx) => {
                                if (idx === 0) {
                                    // Tratar o dado de janeiro separadamente
                                    const solicitanteDados = topSolicitantes
                                        .filter(s => s.solicitante === solicitante)
                                        .find(s => getMonthIndex(s.mes) === 11); // Mapeia o mês de janeiro para o índice 11 (dezembro)
                                    return solicitanteDados ? solicitanteDados.total_exames : null;
                                } else {
                                    // Para os outros meses, aplicar a correção
                                    const solicitanteDados = topSolicitantes
                                        .filter(s => s.solicitante === solicitante)
                                        .find(s => (getMonthIndex(s.mes) + 1) === idx); // +1 para corrigir o deslocamento
                                    return solicitanteDados ? solicitanteDados.total_exames : null;
                                }
                            }),
                            borderColor: `hsl(${index * 360 / solicitantesSelecionados.length}, 100%, 50%)`, // Cores dinâmicas
                        })),
                    }}
                />
                <div className="solicitantes-container">
                    {/* Gerar botões a partir de solicitantes únicos */}
                    {Array.from(new Set(topSolicitantes.map(s => s.solicitante))).map(solicitante => (
                        <button
                            key={solicitante}
                            className={`solicitante-btn ${solicitantesSelecionados.includes(solicitante) ? 'selected' : ''}`}
                            onClick={() => toggleSolicitante(solicitante)}
                        >
                            {solicitante}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Top15;