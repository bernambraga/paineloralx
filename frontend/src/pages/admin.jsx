// pages/admin.jsx
import React, { useEffect, useState } from 'react';
import Users from '../components/admin/adminUsers';
import NewUserModal from '../components/admin/adminNewUserModal';
import EditUserModal from '../components/admin/editUserModal';
import axiosInstance from '../services/axiosInstance';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users/');
      setUsers(res.data);
    } catch (err) {
      alert('Erro ao carregar usuários');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-actions">
        <button className="admin-button-create" onClick={() => setShowNewUserModal(true)}>
          Criar Novo Usuário
        </button>
      </div>

      <Users
        users={users}
        onReset={fetchUsers}
        onEditUser={(user) => setEditUser(user)}
      />

      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onUserCreated={fetchUsers}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
};

export default Admin;
