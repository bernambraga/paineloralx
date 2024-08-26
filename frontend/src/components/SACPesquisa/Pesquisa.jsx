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
        { pedido: "234567", paciente: "Bernardo Mendonça Braga", agenda: "Pinheiros", bot_status: "OK", resposta: "Positiva", motivo: "", obs: "" },
        { pedido: "123456", paciente: "Felipe Moreira de Souza Campos De mariaaa", agenda: "Angélica", bot_status: "OK", resposta: "Negativa", motivo: "a", obs: "" },
        { pedido: "3", paciente: "Luiza", agenda: "9 de Julho", bot_status: "Telefone Inválido", resposta: "", motivo: "", obs: "" },
        { pedido: "4", paciente: "João", agenda: "Pinheiros", bot_status: "OK", resposta: "Negativa", motivo: "Outro", obs: "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem IpsumLorem IpsumLorem IpsumLorem Ipsum" },
    ];

    const handleDateChange = (date) => {
        setSelectedDate(format(date, 'dd/MM/yyyy'));
    };

    const [selectedDate, setSelectedDate] = useState(format(new Date().setDate(new Date().getDate() - 1), 'dd/MM/yyyy'));
    const [relatorio, setRelatorio] = useState(listaTeste);
    const [motivo, setMotivo] = useState('');
    const [comentario, setComentario] = useState('');
    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [motivos, setMotivos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMotivosNegativos();
    }, []);

    const fetchMotivosNegativos = async () => {
        try {
            const response = await fetch(`${getBaseUrl()}/sac/motivos/`);
            const data = await response.json();
            setMotivos(data);
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
            const response = await axios.get(`${getBaseUrl()}/sac/editar_atendimento_pos?pedido=${pedidoId}`);
    
            if (response.status === 200) {  // Verifica se a resposta foi bem-sucedida
                handleBuscar();  // Atualiza a tabela após a marcação
            } else {
                console.error('Erro ao marcar como positiva:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Erro ao marcar como positiva:', error);
        }
    };

    const handleNegativo = (pedido) => {
        setSelectedPedido(pedido);
        setShowMotivoModal(true);
    };

    const handleConfirmarNegativo = async () => {
        if (selectedPedido !== '' && motivo !== '') {
            try {
                const response = await axios.get(`${getBaseUrl()}/sac/editar_atendimento_neg?pedido=${selectedPedido}&motivo=${motivo}&comentario=${comentario}`);
        
                if (response.status === 200) {  // Verifica se a resposta foi bem-sucedida
                    setShowMotivoModal(false);
                clearMotivoModalValues(); // Limpa seleções do Modal após marcação no db
                handleBuscar();  // Atualiza a tabela após a marcação
                } else {
                    console.error('Erro ao marcar como negativa:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Erro ao marcar como negativa:', error);
            }
        }
    };

    const handleVoucher = async (pedidoId, pacienteNome) => {
        try {
            const response = await axios.get(`${getBaseUrl()}/sac/voucher?pedidoId=${pedidoId}&data=${selectedDate}&pacienteNome=${pacienteNome}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `voucher_${pacienteNome}.jpeg`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Erro ao baixar voucher:', error);
        }
    };

    const clearMotivoModalValues = () => {
        setMotivo('');
        setComentario('');
        setSelectedPedido(null);
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

    function capitalizeFirstLetter(nome) {
        return nome.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    return (
        <div className="container-pesquisa-sac">
            <h1 className='h1SAC'>SAC - Pesquisa</h1>
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
                <span className='button-clear' onClick={() => handleClearSearch}>Limpar</span>
            </div>
            <div className='table-container'>
                <table>
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
                                <td className='td-paciente'>{capitalizeFirstLetter(pedido.paciente)}</td>
                                <td className='td-table'>{capitalizeFirstLetter(pedido.agenda).split(' - ')[0]}</td>
                                <td className='td-table'>{pedido.pedido}</td>
                                <td className='td-table'>{pedido.bot_status}</td>
                                <td className='td-table'>
                                    {pedido.resposta === 'Negativa' ? (
                                        <div className="tooltip-container">
                                            <span className="resposta-negativa">Negativa</span>
                                            <div className="tooltip">
                                                <span className='tooltip-span'>Motivo: {pedido.motivo}</span>
                                                <span className='tooltip-span'>Obs: {pedido.obs}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        pedido.resposta
                                    )}
                                </td>
                                <td className='td-table'>
                                    {pedido.bot_status === 'OK' ? (<>
                                        {pedido.resposta === 'Negativa' ? (<>
                                            <button 
                                                className="positivo" 
                                                onClick={() => handlePositivo(pedido.pedido)} 
                                            >
                                                Positiva
                                            </button>
                                            <button className='voucher'
                                                onClick={() => handleVoucher(pedido.pedido, pedido.paciente)} 
                                            >
                                                Voucher
                                            </button></>
                                        ) : pedido.resposta === 'Positiva' ? (<>
                                            <button 
                                                className="negativo" 
                                                onClick={() => handleNegativo(pedido.pedido)} 
                                            >
                                                Negativa
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
                                                    Positiva
                                                </button>
                                                <button 
                                                    className="negativo" 
                                                    onClick={() => handleNegativo(pedido.pedido)} 
                                                >
                                                    Negativa
                                                </button>
                                            </div>
                                        )}</>
                                    ):(
                                        <div>
                                            <button className='invisible'>P</button>
                                        </div>
                                    )}
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            

            {showMotivoModal && (
                <div className="modal">
                    <h2>Qual foi o motivo da avaliação negativa?</h2>
                    <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Problemas no atendimento">Problemas no atendimento</option>
                        <option value="Não gostei da clínica">Não gostei da clínica</option>
                        <option value="Lorem ipsum">Lorem ipsum</option>
                        <option value="Outros">Outros</option>
                    </select>
                    <div>
                        <label>Comentário:</label>
                        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} />
                    </div>
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
                                {motivos.map(motivo => (
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
                                {motivos.map(motivo => (
                                    <option key={motivo.id} value={motivo.id}>{motivo.motivo}</option>
                                ))}
                            </select>
                            <select id="transferMotivo2">
                                <option value="" disabled>Selecione um motivo</option>
                                {motivos.filter(motivo => motivo.id !== selectedMotivo1).map(motivo => (
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
