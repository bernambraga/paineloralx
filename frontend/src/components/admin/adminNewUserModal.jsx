// components/adminNewUser/NewUserModal.jsx
import React from "react";
import "./admin.css";
import NewUser from "./adminNewUser";

const NewUserModal = ({ onClose, onUserCreated }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Criar Novo Usuário</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <NewUser onUserCreated={() => { onUserCreated(); onClose(); }} />
      </div>
    </div>
  );
};

export default NewUserModal;
