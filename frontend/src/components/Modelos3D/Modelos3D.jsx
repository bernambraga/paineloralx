import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import Modelos3DTabela from "./Modelos3DTabela";
import "./modelos3d.css";

const Modelos3D = () => {
  const [modelos, setModelos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("nao_finalizados");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const carregarModelos = async () => {
    try {
      const params = {};

      if (statusFiltro === "nao_finalizados") {
        params.status = "notfinalizados";
      } else if (statusFiltro !== "todos") {
        params.status = statusFiltro;
      }

      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

      const res = await axiosInstance.get("/modelos/listmodels/", { params });
      setModelos(res.data);
    } catch (err) {
      //alert("Erro ao carregar modelos");
    }
  };

  useEffect(() => {
    carregarModelos();
  }, [statusFiltro, dataInicio, dataFim]);

  return (
    <div className="modelos3d-container">
      <h2>Modelos 3D</h2>

      <div className="modelos3d-filtros">
        <label>Status:</label>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="nao_finalizados">Somente não finalizados</option>
          <option value="todos">Todos</option>
          <option value="Pendente">Pendente</option>
          <option value="MEDIT">MEDIT</option>
          <option value="em impressão">Em Impressão</option>
          <option value="finalizado">Finalizado</option>
        </select>

        <label>Data Início:</label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />

        <label>Data Fim:</label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />

        <button onClick={carregarModelos}>Buscar</button>
      </div>

      <Modelos3DTabela modelos={modelos} onAtualizar={carregarModelos} />
    </div>
  );
};

export default Modelos3D;
