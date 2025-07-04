import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance from "../../services/axiosInstance";

const CriarTutorial = ({ onClose }) => {
  const [titulo, setTitulo] = useState("");
  const [conteudoHtml, setConteudoHtml] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/recepcao/tutoriais/criar/", {
        titulo,
        conteudo_html: conteudoHtml,
      });
      alert("Tutorial criado com sucesso!");
      onClose();
    } catch (err) {
      alert("Erro ao criar tutorial");
    }
  };

  return (
    <div>
      <h3>Criar Tutorial</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <ReactQuill value={conteudoHtml} onChange={setConteudoHtml} />
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default CriarTutorial;
