// components/adminUsers/EditUserModal.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./admin.css";

const EditUserModal = ({ user, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    groups: user.groups || [],
  });
  const [availableGroups, setAvailableGroups] = useState([]);

  useEffect(() => {
    axiosInstance.get("/getgroups/")
      .then((res) => setAvailableGroups(res.data))
      .catch(() => alert("Erro ao carregar grupos"));
  }, []);

  const handleGroupChange = (group) => {
    setForm((prev) => {
      const already = prev.groups.includes(group);
      return {
        ...prev,
        groups: already
          ? prev.groups.filter((g) => g !== group)
          : [...prev.groups, group],
      };
    });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.post("/update-user/", {
        username: user.username,
        ...form,
      });
      alert("Usuário atualizado com sucesso!");
      onUpdated();
      onClose();
    } catch {
      alert("Erro ao atualizar usuário");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Editar Usuário</h2>
        <p><b>Username:</b> {user.username}</p>
        <p><b>Email:</b> {user.email}</p>

        <label>Nome:</label>
        <input
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <label>Sobrenome:</label>
        <input
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />

        <label>Grupos:</label>
        {availableGroups.map((group) => (
          <label key={group}>
            <input
              type="checkbox"
              checked={form.groups.includes(group)}
              onChange={() => handleGroupChange(group)}
            />
            {group}
          </label>
        ))}

        <div className="modal-buttons">
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
