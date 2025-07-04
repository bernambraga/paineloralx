
import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";

const TutoriaisList = ({ onSelect }) => {
  const [tutoriais, setTutoriais] = useState([]);

  useEffect(() => {
    axiosInstance.get("/recepcao/tutoriais/").then(res => setTutoriais(res.data));
  }, []);

  return (
    <div className="tutoriais-list-container">
      <h3>Tutoriais / Guias</h3>
      <ul className="tutoriais-list">
        {tutoriais.map(tutorial => (
          <li key={tutorial.id}>
            <button
              className="tutoriais-button"
              onClick={() => onSelect(tutorial)}
            >
              {tutorial.titulo}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TutoriaisList;
