import React, { useEffect, useState } from 'react';
import Users from '../components/adminUsers/adminUsers';
import NewUser from '../components/adminNewUser/adminNewUser';
import axiosInstance from '../services/axiosInstance';

const Admin = () => {
  const [users, setUsers] = useState([]);

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
    <div>
      <Users users={users} onReset={fetchUsers} />
      <NewUser onUserCreated={fetchUsers} />
    </div>
  );
};

export default Admin;
