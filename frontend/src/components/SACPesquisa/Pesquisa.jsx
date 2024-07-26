import React, { useState, useEffect } from 'react';
import './Pesquisa.css';
import DatePicker from '../DatePicker/DatePicker';

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
        { pedido: "234567", paciente: "Bernardo Mendonça Braga", agenda: "Pinheiros", Status: "Mensagem OK", Resposta: "Positiva", Motivo: "", Obs: "" },
        { pedido: "123456", paciente: "Felipe Moreira de Souza Campos", agenda: "Angélica", Status: "Mensagem OK", Resposta: "Negativa", Motivo: "a", Obs: "" },
        { pedido: "3", paciente: "Luiza", agenda: "9 de Julho", Status: "Telefone Inválido", Resposta: "", Motivo: "", Obs: "" },
        { pedido: "4", paciente: "João", agenda: "Pinheiros", Status: "Mensagem OK", Resposta: "Negativa", Motivo: "Outro", Obs: "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum" },
    ];

    const [selectedDate, setSelectedDate] = useState('');
    const [relatorio, setRelatorio] = useState(listaTeste);
    const [motivoNegativo, setMotivoNegativo] = useState('');
    const [comentario, setComentario] = useState('');
    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [selectedPesquisa, setSelectedPesquisa] = useState(null);

    const handleBuscar = async () => {
        try {
            const response = await fetch(`${getBaseUrl()}/sac/relatorio?data=${selectedDate}`);
            const result = await response.json();
            setRelatorio(result);
        } catch (error) {
            console.error('Erro ao buscar pesquisas:', error);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`${getBaseUrl()}/sac/download?data=${selectedDate}`);
            const blob = await response.blob();
            if (blob){
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `pesquisas_${selectedDate}.xlsx`);
                document.body.appendChild(link);
                link.click();    
            }
        } catch (error) {
            console.error('Erro ao baixar dados:', error);
        }
    };

    const handlePositivo = async (pedidoId) => {
        try {
            await fetch(`${getBaseUrl()}/sac/motivo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pedidoId, status: 'positivo' })
            });
            handleBuscar(); // Atualiza a tabela após a marcação
        } catch (error) {
            console.error('Erro ao marcar como positivo:', error);
        }
    };

    const handleNegativo = (pedido) => {
        setSelectedPesquisa(pedido);
        setShowMotivoModal(true);
    };

    const handleConfirmarNegativo = async () => {
        if (selectedPesquisa) {
            try {
                await fetch(`${getBaseUrl()}/sac/motivo`, {
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
                clearMotivoModalValues(); // Limpa seleções do Modal após marcação no db
                handleBuscar(); // Atualiza a tabela após a marcação
            } catch (error) {
                console.error('Erro ao marcar como negativo:', error);
            }
        }
    };

    const handleVoucher = async (pedidoId, pacienteNome) => {
        try {
            const response = await fetch(`${getBaseUrl()}/api/voucher?pedidoId=${pedidoId}&data=${selectedDate}&pacienteNome=${pacienteNome}`);
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

    const clearMotivoModalValues = () => {
        setMotivoNegativo('');
        setComentario('');
        setSelectedPesquisa(null);
    };

    const handleCloseMotivoModal = () => {
        setShowMotivoModal(false);
        clearMotivoModalValues();
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
                        <th>Status</th>
                        <th>Resposta</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {relatorio.map((pedido) => (
                        <tr key={pedido.pedido}>
                            <td>{pedido.paciente}</td>
                            <td>{pedido.agenda}</td>
                            <td>{pedido.pedido}</td>
                            <td>{pedido.Status}</td>
                            <td>
                                {pedido.Resposta === 'Negativa' ? (
                                    <div className="tooltip-container">
                                        <span className="resposta-negativa">Negativa</span>
                                        <div className="tooltip">
                                            <span>Motivo: {pedido.Motivo}</span><br />
                                            <span>Obs: {pedido.Obs}</span>
                                        </div>
                                    </div>
                                ) : (
                                    pedido.Resposta
                                )}
                            </td>
                            <td>
                                <button 
                                    className="positivo" 
                                    onClick={() => handlePositivo(pedido.pedido)} 
                                    disabled={pedido.Status !== 'Mensagem OK'}
                                >
                                    Positivo
                                </button>
                                <button 
                                    className="negativo" 
                                    onClick={() => handleNegativo(pedido)} 
                                    disabled={pedido.Status !== 'Mensagem OK'}
                                >
                                    Negativo
                                </button>
                                <button 
                                    onClick={() => handleVoucher(pedido.pedido, pedido.paciente)} 
                                    disabled={pedido.Status !== 'Mensagem OK'}
                                >
                                    Voucher
                                </button>
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
                    <div>
                        <button className="modalButton" onClick={handleConfirmarNegativo}>Confirmar</button>
                        <button className="modalButton" onClick={handleCloseMotivoModal}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SACPesquisa;
