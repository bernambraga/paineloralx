import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./adminNewUser.css";

const NewUser = ({ onUserCreated }) => {
  const [form, setForm] = useState({
    newusername: "",
    email: "",
    newpassword: "",
    first_name: "",
    last_name: "",
    groups: [],
  });

  const [availableGroups, setAvailableGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axiosInstance.get("/getgroups/");
        setAvailableGroups(res.data);
      } catch (err) {
        alert("Erro ao carregar grupos");
      }
    };
    fetchGroups();
  }, []);

  const handleGroupChange = (groupName) => {
    setForm((prevForm) => {
      const exists = prevForm.groups.includes(groupName);
      const newGroups = exists
        ? prevForm.groups.filter((g) => g !== groupName)
        : [...prevForm.groups, groupName];
      return { ...prevForm, groups: newGroups };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/newuser/", form);
      alert("Usuário criado com sucesso!");
      setForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        groups: [],
      });
      onUserCreated(); // chama o refresh da lista
    } catch (err) {
      alert("Erro ao criar usuário: " + err.response?.data?.error);
    }
  };

  return (
    <div className="new-user-container">
      <form className="new-user-form" onSubmit={handleSubmit}>
        <label className="new-user-form-label">*Usuário:</label>
        <input
          className="new-user-form-input"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <label className="new-user-form-label">*Senha:</label>
        <input
          className="new-user-form-input"
          placeholder="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <label className="new-user-form-label">E-mail:</label>
        <input
          className="new-user-form-input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label className="new-user-form-label">Nome:</label>
        <input
          className="new-user-form-input"
          placeholder="Nome"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <label className="new-user-form-label">Sobrenome:</label>
        <input
          className="new-user-form-input"
          placeholder="Sobrenome"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />

        <div className="new-user-form-container">
          <label className="new-user-form-label">Grupos:</label>
          {availableGroups.map((group) => (
            <label className="new-user-form-cbox-label" key={group}>
              <input
                className="new-user-form-cbox"
                type="checkbox"
                checked={form.groups.includes(group)}
                onChange={() => handleGroupChange(group)}
              />
              {group}
            </label>
          ))}
        </div>

        <button className="new-user-form-button" type="submit">
          Criar
        </button>
      </form>
    </div>
  );
};

export default NewUser;
