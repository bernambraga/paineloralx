import React from "react";
import axiosInstance from "../../services/axiosInstance";
import "./adminUsers.css";

const Users = ({ users, onReset }) => {
  const handleResetPassword = async (username) => {
    const nova_senha = prompt("Digite a nova senha para " + username);
    if (!nova_senha) return;
    try {
      await axiosInstance.post("/resetpass/", { username, nova_senha });
      alert("Senha redefinida com sucesso!");
    } catch (err) {
      alert("Erro ao redefinir senha");
    }
  };

  const handleDeleteUser = async (username) => {
    const confirmar = window.confirm(`Você quer deletar o usuário "${username}"?`);
    if (!confirmar) return;
    try {
      await axiosInstance.post("/delete-user/", { username });
      alert("Usuário deletado com sucesso!");
      onReset(); // Atualiza lista
    } catch (err) {
      alert("Erro ao deletar usuário");
    }
  };

  return (
    <div className="users-container">
      <h3 className="users-title">Lista de Usuários</h3>
      <ul className="users-list">
        {users.map((user) => (
          <li key={user.id} className="users-list-item">
            <span className="users-info">{user.first_name} {user.last_name} ({user.username})</span>
            <button className="users-button" onClick={() => handleResetPassword(user.username)}>Redefinir Senha</button>
            <button className="users-button delete" onClick={() => handleDeleteUser(user.username)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
