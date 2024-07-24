// Pesquisa.jsx
import React, { useState, useEffect } from 'react';
import './Pesquisa.css'; // Importe o CSS aqui
import DatePicker from '../DatePicker/DatePicker'

const SACPesquisa = () => {
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
    const listaTeste = [
        {pedido: "1", paciente: "Amanda", agenda: "Pinheiros"},
        {pedido: "2", paciente: "Felipe", agenda: "Angélica"},
        {pedido: "3", paciente: "Luiza", agenda: "9 de Julho"},
        {pedido: "4", paciente: "João", agenda: "Pinheiros"},
      ];
    
    const [selectedDate, setSelectedDate] = useState('');
    const [pesquisas, setPesquisas] = useState(listaTeste);
    const [motivoNegativo, setMotivoNegativo] = useState('');
    const [comentario, setComentario] = useState('');
    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [selectedPesquisa, setSelectedPesquisa] = useState(null);
    
    const handleBuscar = async () => {
        try {
                const response = await fetch(`${getBaseUrl()}/sac/relatorio?data=${selectedDate}`);
                const result = await response.json();
                setPesquisas(result);
            } catch (error) {
              console.error('Erro ao buscar pesquisas:', error);
            } 
    };
  
    const handleDownload = async () => {
        try {
            const response = await fetch(`/api/download?data=${selectedDate}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pesquisas_${selectedDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Erro ao baixar dados:', error);
        }
    };

    const handlePositivo = async (pedidoId) => {
        try {
            await fetch('/api/marcar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pedidoId, status: 'positivo' })
            });
            handleBuscar(); // Atualiza a tabela após a marcação
        } catch (error) {
            console.error('Erro ao marcar como positivo:', error);
        }
    };

    const handleNegativo = (pesquisa) => {
        setSelectedPesquisa(pesquisa);
        setShowMotivoModal(true);
    };

    const handleConfirmarNegativo = async () => {
        if (selectedPesquisa) {
            try {
                await fetch('/api/marcar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pedidoId: selectedPesquisa.pedido,
                        status: 'negativo',
                        motivo: motivoNegativo,
                        comentario: motivoNegativo === 'Outros' ? comentario : ''
                    })
                });
                setShowMotivoModal(false);
                handleBuscar(); // Atualiza a tabela após a marcação
            } catch (error) {
                console.error('Erro ao marcar como negativo:', error);
            }
        }
    };

    const handleVoucher = async (pedidoId, pacienteNome) => {
        try {
            const response = await fetch(`/api/voucher?pedidoId=${pedidoId}&data=${selectedDate}&pacienteNome=${pacienteNome}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `voucher_${pedidoId}.jpeg`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Erro ao baixar voucher:', error);
        }
    };

    return (
        <div className="container-log">
            <h1>SAC - Pesquisa</h1>
            <div className="input-container-log">
                <label>Data: </label>
                <DatePicker className="dateselector" value={selectedDate} onChange={(date) => setSelectedDate(date)} />
                <button onClick={handleBuscar}>Buscar</button>
                <button onClick={handleDownload}>Download</button>
            </div>
            <table className="log-container">
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Agenda</th>
                        <th>Pedido</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pesquisas.map((pesquisa) => (
                        <tr key={pesquisa.pedido}>
                            <td>{pesquisa.paciente}</td>
                            <td>{pesquisa.agenda}</td>
                            <td>{pesquisa.pedido}</td>
                            <td>
                                <button className="positivo" onClick={() => handlePositivo(pesquisa.pedido)}>Positivo</button>
                                <button className="negativo" onClick={() => handleNegativo(pesquisa)}>Negativo</button>
                                <button onClick={() => handleVoucher(pesquisa.pedido, pesquisa.paciente)}>Voucher</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showMotivoModal && (
                <div className="modal">
                    <h2>Qual foi o motivo da avaliação negativa?</h2>
                    <select value={motivoNegativo} onChange={(e) => setMotivoNegativo(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Problemas no atendimento">Problemas no atendimento</option>
                        <option value="Não gostei da clínica">Não gostei da clínica</option>
                        <option value="Lorem ipsum">Lorem ipsum</option>
                        <option value="Outros">Outros</option>
                    </select>
                    {motivoNegativo === 'Outros' && (
                        <div>
                            <label>Comentário:</label>
                            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} />
                        </div>
                    )}
                    <button onClick={handleConfirmarNegativo}>Confirmar</button>
                    <button onClick={() => setShowMotivoModal(false)}>Cancelar</button>
                </div>
            )}
        </div>
    );
};

export default SACPesquisa;