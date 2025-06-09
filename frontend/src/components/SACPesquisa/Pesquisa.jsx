import React, { useState, useEffect } from "react";
import "./Pesquisa.css";
import axios from "axios";
import DatePicker from "../DatePicker/DatePicker";
import { format, parse, isSunday } from "date-fns";

const SACPesquisa = () => {
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

  const getCSRFToken = () => {
    let csrfToken = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === "csrftoken=") {
          csrfToken = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }
    return csrfToken;
  };

  const [selectedDate, setSelectedDate] = useState(
    format(new Date().setDate(new Date().getDate() - 1), "dd/MM/yyyy")
  );
  const [relatorio, setRelatorio] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [comentario, setComentario] = useState("");
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [showModalMotivos, setShowModalMotivos] = useState(false);
  const [showModalElogios, setShowModalElogios] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMotivo1, setSelectedMotivo1] = useState("");

  useEffect(() => {
    fetchMotivosNegativos();
  }, []);

  const fetchMotivosNegativos = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/sac/motivos/`);
      const data = await response.json();
      setMotivos(data);
    } catch (error) {
      console.error(
        "There was an error fetching the motivos negativos!",
        error
      );
    }
  };

  const handleShowModalMotivos = () => setShowModalMotivos(true);
  const handleCloseModalMotivos = () => setShowModalMotivos(false);

  const handleShowModalElogios = () => setShowModalElogios(true);
  const handleCloseModalElogios = () => setShowModalElogios(false);

  const handleAddMotivo = async () => {
    const motivo = document.getElementById("newMotivo").value;
    try {
      await axios.get(`${getBaseUrl()}/sac/criar_motivo?newMotivo=${motivo}`);
      fetchMotivosNegativos();
    } catch (error) {
      console.error("Erro ao criar novo motivo:", error);
    }
  };

  const handleDeleteMotivo = async () => {
    const motivoId = document.getElementById("deleteMotivo").value;
    try {
      await axios.get(
        `${getBaseUrl()}/sac/excluir_motivo?motivoId=${motivoId}`
      );
      fetchMotivosNegativos();
    } catch (error) {
      console.error("Erro ao excluir motivo:", error);
    }
  };

  const handleSelectedMotivo1Change = async () => {
    const motivo1 = document.getElementById("transferMotivo1").value;
    setSelectedMotivo1(motivo1);
  };

  const handleTransferMotivo = async () => {
    const motivo1 = document.getElementById("transferMotivo1").value;
    const motivo2 = document.getElementById("transferMotivo2").value;
    try {
      await axios.get(
        `${getBaseUrl()}/sac/transferir_motivos?motivoa=${motivo1}&motivob=${motivo2}`
      );
      handleCloseModalMotivos();
      handleBuscar();
    } catch (error) {
      console.error("Erro ao transferir motivos:", error);
    }
  };

  const handleAddElogio = async () => {
    const elogio = document.getElementById("newElogio").value;
  };

  const handleDateChange = (date) => {
    const parsedDate = parse(
      format(date, "dd/MM/yyyy"),
      "dd/MM/yyyy",
      new Date()
    );

    if (isSunday(parsedDate)) {
      alert("Não realizamos exames aos domingos.");
      return;
    }

    setSelectedDate(format(date, "dd/MM/yyyy"));
  };

  // Executa handleBuscar toda vez que selectedDate for alterado
  useEffect(() => {
    handleBuscar();
  }, [selectedDate]);

  const handleBuscar = async () => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/sac/relatorio?data=${selectedDate}`
      );
      const result = await response.data;
      handleClearSearch();
      setRelatorio(result);
      if (result.length === 0) {
        alert("Nenhum resultado encontrado para a data selecionada.");
      }
    } catch (error) {
      console.error("Erro ao buscar pesquisas:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/sac/download?data=${selectedDate}`
      );
      const blob = await response.blob();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `pesquisas_${selectedDate}.xlsx`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (error) {
      console.error("Erro ao baixar dados:", error);
    }
  };

  const handlePositivo = async (pedidoId) => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/sac/editar_atendimento_pos?pedido=${pedidoId}`
      );

      if (response.status === 200) {
        // Verifica se a resposta foi bem-sucedida
        handleBuscar(); // Atualiza a tabela após a marcação
      } else {
        console.error(
          "Erro ao marcar como positiva:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Erro ao marcar como positiva:", error);
    }
  };

  const handleNegativo = (pedido) => {
    setSelectedPedido(pedido);
    setShowMotivoModal(true);
  };

  const handleConfirmarNegativo = async () => {
    if (selectedPedido !== "" && motivo !== "") {
      try {
        const response = await axios.get(
          `${getBaseUrl()}/sac/editar_atendimento_neg?pedido=${selectedPedido}&motivo=${motivo}&comentario=${comentario}`
        );

        if (response.status === 200) {
          // Verifica se a resposta foi bem-sucedida
          setShowMotivoModal(false);
          clearMotivoModalValues(); // Limpa seleções do Modal após marcação no db
          handleBuscar(); // Atualiza a tabela após a marcação
        } else {
          console.error(
            "Erro ao marcar como negativa:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Erro ao marcar como negativa:", error);
      }
    }
  };

  const handleVoucher = async (pedidoId, pacienteNome) => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/sac/voucher?pedidoId=${pedidoId}`,
        {
          responseType: "blob", // Indica que esperamos um blob como resposta (imagem).
        }
      );
      const blob = await response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `voucher_${pacienteNome}.jpeg`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar voucher:", error);
    }
  };

  const clearMotivoModalValues = () => {
    setMotivo("");
    setComentario("");
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
    setSearchTerm("");
  };

  function capitalizeFirstLetter(nome) {
    return nome
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <div className="container-pesquisa-sac">
      <h1 className="h1SAC">SAC - Pesquisa</h1>
      <div className="input-container-pesquisa-sac">
        <label>Data: </label>
        <DatePicker
          selectedDate={parse(selectedDate, "dd/MM/yyyy", new Date())}
          onChange={handleDateChange}
        />
        <button className="button-sac" onClick={handleBuscar}>
          Buscar
        </button>
        {/*<button className='button-sac' onClick={handleDownload}>Download</button>*/}
        <button className="button-sac" onClick={handleShowModalMotivos}>
          Motivos
        </button>
        {/*<button className='button-sac' onClick={handleShowModalElogios}>Elogios</button>*/}
      </div>
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Buscar pelo nome"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <span className="button-clear" onClick={handleClearSearch}>
          Limpar
        </span>
      </div>
      <div className="table-container">
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
                <td className="td-paciente">
                  {capitalizeFirstLetter(pedido.paciente)}
                </td>
                <td className="td-table">
                  {capitalizeFirstLetter(pedido.agenda).split(" - ")[0]}
                </td>
                <td className="td-table">{pedido.pedido}</td>
                <td className="td-table">{pedido.bot_status}</td>
                <td className="td-table">
                  {pedido.resposta === "Negativa" ? (
                    <div className="tooltip-container">
                      <span className="resposta-negativa">Negativa</span>
                      <div className="tooltip">
                        <span className="tooltip-span">
                          Motivo: {pedido.motivo}
                        </span>
                        <span className="tooltip-span">Obs: {pedido.obs}</span>
                      </div>
                    </div>
                  ) : (
                    pedido.resposta
                  )}
                </td>
                <td className="td-table">
                  {pedido.bot_status === "OK" ? (
                    <>
                      {pedido.resposta === "Negativa" ? (
                        <>
                          <button
                            className="positivo"
                            onClick={() => handlePositivo(pedido.pedido)}
                          >
                            Positiva
                          </button>
                          <button
                            className="voucher"
                            onClick={() =>
                              handleVoucher(pedido.pedido, pedido.paciente)
                            }
                          >
                            Voucher
                          </button>
                        </>
                      ) : pedido.resposta === "Positiva" ? (
                        <>
                          <button
                            className="negativo"
                            onClick={() => handleNegativo(pedido.pedido)}
                          >
                            Negativa
                          </button>
                          <button
                            className="voucher"
                            onClick={() =>
                              handleVoucher(pedido.pedido, pedido.paciente)
                            }
                          >
                            Voucher
                          </button>
                        </>
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
                      )}
                    </>
                  ) : (
                    <div>
                      <button className="invisible">P</button>
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
          <select
            className="negativaSelect"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            <option value="" disabled>
              Selecione um motivo...
            </option>
            {motivos.map((motivo) => (
              <option key={motivo.id} value={motivo.motivo}>
                {motivo.motivo}
              </option>
            ))}
          </select>
          <div>
            <label>Comentário:</label>
            <textarea
              className="comentarioTextarea"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <div className="">
            <button className="modalButton" onClick={handleConfirmarNegativo}>
              Confirmar
            </button>
            <button className="modalButton" onClick={handleCloseMotivoModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showModalMotivos && (
        <div className="modal">
          <h2>Edição de Motivos</h2>
          <div>
            <div className="container-modal">
              <label htmlFor="newMotivo">Adicionar Motivo</label>
              <input id="newMotivo" type="text" placeholder="Novo motivo" />
              <button className="modalButton" onClick={handleAddMotivo}>
                Adicionar
              </button>
            </div>

            <div className="container-modal">
              <label htmlFor="deleteMotivo">Deletar Motivo</label>
              <select id="deleteMotivo">
                {motivos.map((motivo) => (
                  <option key={motivo.id} value={motivo.id}>
                    {motivo.motivo}
                  </option>
                ))}
              </select>
              <button
                className="modalButton"
                onClick={() => handleDeleteMotivo("selectedMotivoId")}
              >
                Deletar
              </button>
            </div>

            <div className="container-modal">
              <label htmlFor="transferMotivo">Transferir Motivos</label>
              <span>De:</span>
              <select
                id="transferMotivo1"
                value={selectedMotivo1}
                onChange={handleSelectedMotivo1Change}
              >
                <option value="" disabled></option>
                {motivos.map((motivo) => (
                  <option key={motivo.id} value={motivo.motivo}>
                    {motivo.motivo}
                  </option>
                ))}
              </select>
              <span>Para:</span>
              <select id="transferMotivo2">
                <option value="" disabled></option>
                {motivos
                  .filter((motivo) => motivo.id !== parseInt(selectedMotivo1))
                  .map((motivo) => (
                    <option key={motivo.id} value={motivo.motivo}>
                      {motivo.motivo}
                    </option>
                  ))}
              </select>
              <button
                className="modalButton"
                onClick={() =>
                  handleTransferMotivo("selectedMotivoId", "newMotivoId")
                }
              >
                Transferir
              </button>
            </div>
            <button className="modalButton" onClick={handleCloseModalMotivos}>
              Fechar
            </button>
          </div>
        </div>
      )}
      {showModalElogios && (
        <div className="modal">
          <h2>Elogios</h2>
          <div>
            <div className="container-modal">
              <label htmlFor="newMotivo">Adicionar Elogio</label>
              <input id="novoElogio1" type="text" placeholder="Para quem?" />
              <textarea
                className="comentarioTextarea"
                id="novoElogio2"
                type="text"
                placeholder="Elogio"
              />
              <button className="modalButton" onClick={handleAddElogio}>
                Adicionar
              </button>
            </div>

            <div className="container-modal">
              <label htmlFor="deleteMotivo">Elogios</label>
              <select id="deleteMotivo">
                {motivos.map((motivo) => (
                  <option key={motivo.id} value={motivo.id}>
                    {motivo.motivo}
                  </option>
                ))}
              </select>
              Estamos em testes ainda
            </div>

            <button className="modalButton" onClick={handleCloseModalElogios}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SACPesquisa;
