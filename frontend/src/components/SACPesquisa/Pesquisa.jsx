import React, { useState, useEffect } from 'react';
import './Pesquisa.css';
import axios from 'axios';
import DatePicker from '../DatePicker/DatePicker';
import { format, parse } from 'date-fns';

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

    const getCSRFToken = () => {
        let csrfToken = null;
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
              csrfToken = decodeURIComponent(cookie.substring(10));
              break;
            }
          }
        }
        return csrfToken;
    };

    const listaTeste = [
        { pedido: "234567", paciente: "Bernardo Mendonça Braga", agenda: "Pinheiros", Status: "Mensagem OK", Resposta: "Positiva", Motivo: "", Obs: "" },
        { pedido: "123456", paciente: "Felipe Moreira de Souza Campos", agenda: "Angélica", Status: "Mensagem OK", Resposta: "Negativa", Motivo: "a", Obs: "" },
        { pedido: "3", paciente: "Luiza", agenda: "9 de Julho", Status: "Telefone Inválido", Resposta: "", Motivo: "", Obs: "" },
        { pedido: "4", paciente: "João", agenda: "Pinheiros", Status: "Mensagem OK", Resposta: "Negativa", Motivo: "Outro", Obs: "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum" },
    ];

    const handleDateChange = (date) => {
        setSelectedDate(format(date, 'dd/MM/yyyy'));
    };

    const [selectedDate, setSelectedDate] = useState(format(new Date().setDate(new Date().getDate() - 1), 'dd/MM/yyyy'));
    const [relatorio, setRelatorio] = useState(listaTeste);
    const [motivoNegativo, setMotivoNegativo] = useState('');
    const [comentario, setComentario] = useState('');
    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [selectedPesquisa, setSelectedPesquisa] = useState(null);
    const [motivosNegativos, setMotivosNegativos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMotivosNegativos();
    }, []);

    const fetchMotivosNegativos = async () => {
        try {
            const response = await fetch(`${getBaseUrl()}/sac/motivos/`);
            const data = await response.json();
            setMotivosNegativos(data);
        } catch (error) {
            console.error("There was an error fetching the motivos negativos!", error);
        }
    };

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleAddMotivo = async () => {
        const motivo = document.getElementById('newMotivo').value;
        try {
            await axios.post(`${getBaseUrl()}/sac/criar_motivo`,
                {
                    motivo: motivo,
                },
                {
                    headers: {
                    'X-CSRFToken': getCSRFToken(),
                    },
                    withCredentials: true,
                }
            );
            fetchMotivosNegativos();
        } catch (error) {
            console.error('Erro ao criar novo motivo:', error);
        }
    };

    const handleDeleteMotivo = (id) => {
        // Lógica para deletar um motivo
    };
    const [selectedMotivo1, setSelectedMotivo1] = useState('');
    const handleTransferMotivo = (id, newMotivo) => {
        // Lógica para transferir um motivo
        setSelectedMotivo1('')
    };

    const handleBuscar = async () => {
        try {
            const response = await axios.get(`${getBaseUrl()}/sac/relatorio?data=${selectedDate}`);
            const result = await response.data;
            console.info(result)
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
            const response = await fetch(`${getBaseUrl()}/sac/voucher?pedidoId=${pedidoId}&data=${selectedDate}&pacienteNome=${pacienteNome}`);
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

    const filteredRelatorio = relatorio.filter((pedido) => 
        pedido.paciente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleScrollToItem = (pedidoId) => {
        const element = document.getElementById(`pedido-${pedidoId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.style.backgroundColor = '#ffff99'; // Highlight item
            setTimeout(() => {
                element.style.backgroundColor = ''; // Remove highlight after 2 seconds
            }, 2000);
        }
    };

    return (
        <div className="container-pesquisa-sac">
            <h1>SAC - Pesquisa</h1>
            <div className="input-container-pesquisa-sac">
                <label>Data: </label>
                <DatePicker
                    selectedDate={parse(selectedDate, 'dd/MM/yyyy', new Date())} 
                    onChange={handleDateChange}
                />
                <button className='button-sac' onClick={handleBuscar}>Buscar</button>
                <button className='button-sac' onClick={handleDownload}>Download</button>
                <button className='button-sac' onClick={handleShowModal}>Motivos</button>
            </div>
            <div className='searchContainer'>
                <input
                    type="text"
                    placeholder="Buscar pelo nome"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className='button-clear' onClick={() => handleClearSearch}>Limpar</button>
            </div>
            <table className="pesquisa-sac-container">
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
                    {filteredRelatorio.map((pedido) => (
                        <tr key={pedido.pedido} id={`pedido-${pedido.pedido}`}>
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
                                {pedido.Status === 'Mensagem OK' ? (<>
                                    {pedido.Resposta === 'Negativa' ? (<>
                                        <button 
                                            className="positivo" 
                                            onClick={() => handlePositivo(pedido.pedido)} 
                                            disabled={pedido.Status !== 'Mensagem OK'}
                                        >
                                            Positivo
                                        </button>
                                        <button className='voucher'
                                            onClick={() => handleVoucher(pedido.pedido, pedido.paciente)} 
                                        >
                                            Voucher
                                        </button></>
                                    ) : pedido.Resposta === 'Positiva' ? (<>
                                        <button 
                                            className="negativo" 
                                            onClick={() => handleNegativo(pedido)} 
                                            disabled={pedido.Status !== 'Mensagem OK'}
                                        >
                                            Negativo
                                        </button>
                                        <button className='voucher'
                                            onClick={() => handleVoucher(pedido.pedido, pedido.paciente)} 
                                        >
                                            Voucher
                                        </button></>
                                    ) : (
                                        <div>
                                            <button 
                                                className="positivo" 
                                                onClick={() => handlePositivo(pedido.pedido)} 
                                            >
                                                Positivo
                                            </button>
                                            <button 
                                                className="negativo" 
                                                onClick={() => handleNegativo(pedido)} 
                                            >
                                                Negativo
                                            </button>
                                            <button className='voucher'
                                                onClick={() => handleVoucher(pedido.pedido, pedido.paciente)} 
                                            >
                                                Voucher
                                            </button>
                                        </div>
                                    )}</>
                                ):(
                                    <div></div>
                                )}
                                
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

            {showModal && (
                <div className="modal">
                    <h2>Edição de Motivos</h2>
                    <div>
                        <div className='container-modal'>
                            <label htmlFor="newMotivo">Adicionar Motivo</label>
                            <input id="newMotivo" type="text" placeholder="Novo motivo" />
                            <button onClick={handleAddMotivo}>
                                Adicionar
                            </button>
                        </div>

                        <div className='container-modal'>
                            <label htmlFor="deleteMotivo">Deletar Motivo</label>
                            <select id="deleteMotivo">
                                {motivosNegativos.map(motivo => (
                                    <option key={motivo.id} value={motivo.id}>{motivo.motivo}</option>
                                ))}
                            </select>
                            <button onClick={() => handleDeleteMotivo("selectedMotivoId")}>
                                Deletar
                            </button>
                        </div>

                        <div className='container-modal'>
                            <label htmlFor="transferMotivo">Transferir Atendimentos</label>
                            <select id="transferMotivo1"
                                value={selectedMotivo1}
                                onChange={(e) => setSelectedMotivo1(e.target.value)}
                            >
                                <option value="" disabled>Selecione um motivo</option>
                                {motivosNegativos.map(motivo => (
                                    <option key={motivo.id} value={motivo.id}>{motivo.motivo}</option>
                                ))}
                            </select>
                            <select id="transferMotivo2">
                                <option value="" disabled>Selecione um motivo</option>
                                {motivosNegativos.filter(motivo => motivo.id !== selectedMotivo1).map(motivo => (
                                    <option key={motivo.id} value={motivo.id}>{motivo.motivo}</option>
                                ))}
                            </select>
                            <button onClick={() => handleTransferMotivo("selectedMotivoId", "newMotivoId")}>
                                Transferir
                            </button>
                        </div>
                        <button onClick={handleCloseModal}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SACPesquisa;
