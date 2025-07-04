import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./modelos3d.css";

const statusOpcoes = ["Pendente", "MEDIT", "Em impressão", "Finalizado", "Erro Impressão", "Sem STL"];

const Modelos3DDropdown = ({ pedido, statusAtual, onAtualizar }) => {
  const [status, setStatus] = useState(statusAtual);
  const [carregando, setCarregando] = useState(false);

  const handleChange = async (e) => {
    const novoStatus = e.target.value;
    setStatus(novoStatus);
    setCarregando(true);

    try {
      await axiosInstance.patch(`/modelos/${pedido}/`, {
        status: novoStatus,
      });
      onAtualizar(); // Atualiza a lista após a mudança
    } catch (err) {
      alert("Erro ao atualizar status");
      setStatus(statusAtual); // Volta ao original em caso de erro
    } finally {
      setCarregando(false);
    }
  };

  return (
    <select
      className="modelos3d-dropdown"
      value={status}
      onChange={handleChange}
      disabled={carregando}
    >
      {statusOpcoes.map((opcao) => (
        <option key={opcao} value={opcao}>
          {opcao}
        </option>
      ))}
    </select>
  );
};

export default Modelos3DDropdown;
