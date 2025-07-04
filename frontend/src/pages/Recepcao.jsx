import React, { useState, useContext } from "react";
import ArquivosList from "../components/Recepcao/ArquivosList";
import TutoriaisList from "../components/Recepcao/TutoriaisList";
import TutorialModal from "../components/Recepcao/TutorialModal";
import CriarTutorial from "../components/Recepcao/TutorialNew";
import { AuthContext } from "../context/AuthContext";
import "../components/Recepcao/Recepcao.css";

const Recepcao = () => {
  const { user } = useContext(AuthContext);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const isAdmin = user?.groups?.includes("Recepção Admin");

  return (
    <div className="recepcao-container">
      <h2 className="recepcao-title">Recepção</h2>
      
      <ArquivosList />
      <TutoriaisList onSelect={setSelectedTutorial} />

      {isAdmin && (
          <>
            <button
              className="recepcao-admin-button"
              onClick={() => setShowEditor(true)}
            >
              Criar Novo Tutorial
            </button>

            {showEditor && (
              <div className="tutorial-modal-overlay" onClick={() => setShowEditor(false)}>
                <div className="tutorial-modal-content" onClick={e => e.stopPropagation()}>
                  <CriarTutorial onClose={() => setShowEditor(false)} />
                </div>
              </div>
            )}
          </>
        )}

      {selectedTutorial && (
        <TutorialModal
          tutorial={selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
        />
      )}
    </div>
  );
};

export default Recepcao;
