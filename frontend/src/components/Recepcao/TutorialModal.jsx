import React from "react";

const TutorialModal = ({ tutorial, onClose }) => {
  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div className="tutorial-modal-content" onClick={e => e.stopPropagation()}>
        <h3>{tutorial.titulo}</h3>
        <iframe
          src={tutorial.url}
          width="100%"
          height="500px"
          title={tutorial.titulo}
        ></iframe>
        <button className="tutorial-modal-close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
