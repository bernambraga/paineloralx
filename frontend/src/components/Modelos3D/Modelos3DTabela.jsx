import React, { useState } from "react";
import Modelos3DDropdown from "./Modelos3DDropdown";
import "./modelos3d.css";

//Adicionar linha grossa na tabela entre cada 4 pacientes simulando uma bandeja na impressora

const Modelos3DTabela = ({ modelos, onAtualizar }) => {
  const [ordenarPor, setOrdenarPor] = useState("prazo");
  const [ordemAsc, setOrdemAsc] = useState(true);

  const ordenar = (lista) => {
    const listaOrdenada = [...lista];

    listaOrdenada.sort((a, b) => {
      let valorA = a[ordenarPor];
      let valorB = b[ordenarPor];

      if (ordenarPor === "prazo" || ordenarPor === "data") {
        const dataA = new Date(valorA.split("/").reverse().join("-"));
        const dataB = new Date(valorB.split("/").reverse().join("-"));
        return ordemAsc ? dataA - dataB : dataB - dataA;
      }

      if (typeof valorA === "string") {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
        return ordemAsc
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return 0;
    });

    return listaOrdenada;
  };

  const handleOrdenar = (campo) => {
    if (ordenarPor === campo) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(campo);
      setOrdemAsc(true);
    }
  };

  const getClassePrazo = (prazoStr, status) => {
    try {
      if (status.toLowerCase() === "finalizado") return "prazo-verde";

      const hoje = new Date();
      const [dia, mes, ano] = prazoStr.split("/");
      const prazoData = new Date(`${ano}-${mes}-${dia}`);
      const diffDias = Math.ceil((prazoData - hoje) / (1000 * 60 * 60 * 24));

      if (diffDias <= 1) return "prazo-vermelho";
      if (diffDias <= 3) return "prazo-amarelo";
      return "";
    } catch (e) {
      return "";
    }
  };

  const modelosOrdenados = ordenar(modelos);

  return (
    <table className="modelos3d-tabela">
      <thead>
        <tr>
          <th onClick={() => handleOrdenar("paciente")}>Paciente</th>
          <th onClick={() => handleOrdenar("codigo_paciente")}>Código</th>
          <th onClick={() => handleOrdenar("solicitante")}>Solicitante</th>
          <th onClick={() => handleOrdenar("data")}>Data</th>
          <th onClick={() => handleOrdenar("prazo")}>Prazo</th>
          <th>Exame</th>
          <th>Agenda</th>
          <th onClick={() => handleOrdenar("status")}>Status</th>
        </tr>
      </thead>
      <tbody>
        {modelosOrdenados.map((modelo, index) => (
          <React.Fragment key={modelo.pedido}>
            <tr
              className={
                index % 4 === 0 && index !== 0 ? "linha-com-divisoria" : ""
              }
            >
              <td>{modelo.paciente}</td>
              <td>{modelo.codigo_paciente}</td>
              <td>{modelo.solicitante}</td>
              <td>{modelo.data}</td>
              <td className={getClassePrazo(modelo.prazo, modelo.status)}>
                {modelo.prazo}
              </td>
              <td>{modelo.exame}</td>
              <td>{modelo.agenda}</td>
              <td>
                <Modelos3DDropdown
                  pedido={modelo.pedido}
                  statusAtual={modelo.status}
                  onAtualizar={onAtualizar}
                />
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default Modelos3DTabela;
