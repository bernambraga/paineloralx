import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./GPT.css"; // Importa o CSS localizado na mesma pasta

function GPTPrompt() {
  const [prompt, setPrompt] = useState("");
  const [resposta, setResposta] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);

  const enviarPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResposta("");
    setTarefas([]);
    try {
      const response = await axiosInstance.post("/gpt/gpt/", { prompt });

      setResposta(response.data.resposta || "Sem resposta");

      if (response.data.tarefas) {
        setTarefas(response.data.tarefas);
      }
    } catch (error) {
      setResposta("Erro ao processar o prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gpt-agent-wrapper">
      <h2 className="gpt-agent-title">Agente de Projetos GPT</h2>

      <textarea
        className="gpt-agent-textarea"
        rows={6}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Digite seu comando para o agente..."
      />

      <button
        className="gpt-agent-button"
        onClick={enviarPrompt}
        disabled={loading}
      >
        {loading ? "Processando..." : "Enviar"}
      </button>

      <pre className="gpt-agent-resposta">{resposta}</pre>

      {tarefas.length > 0 && (
        <div className="gpt-agent-tarefas">
          <h3>Tarefas:</h3>
          <ul>
            {tarefas.map((tarefa) => (
              <li key={tarefa.id}>
                <strong>{tarefa.nome}</strong> – {tarefa.status} (prazo:{" "}
                {tarefa.prazo || "sem prazo"})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GPTPrompt;
