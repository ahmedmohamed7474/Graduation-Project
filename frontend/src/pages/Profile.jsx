import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
         navigate('/login');
         return;
      }
      try {
         const res = await fetch('http://localhost:3002/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
         });
         const data = await res.json();
         if (res.ok) {
            setProfile(data);
            setName(data.name);
            setEmail(data.email);
         } else {
            setError(data.error?.message || 'فشل جلب الملف الشخصي');
         }
      } catch (err) {
         setError('خطأ في الاتصال');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
       navigate('/login');
       return;
    }
    try {
       const res = await fetch('http://localhost:3002/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name, email }),
       });
       const data = await res.json();
       if (res.ok) {
          setProfile(data);
          setUpdateSuccess('تم تحديث الملف الشخصي بنجاح');
       } else {
          setError(data.error?.message || 'فشل تحديث الملف الشخصي');
       }
    } catch (err) {
       setError('خطأ في الاتصال');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">الملف الشخصي</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {updateSuccess && <p className="text-green-500 mb-2">{updateSuccess}</p>}
      <form onSubmit={handleSubmit} className="w-full max-w-xs p-4 bg-white shadow rounded">
        <div className="mb-2">
          <label htmlFor="name" className="block text-sm font-bold mb-1">الاسم</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label htmlFor="email" className="block text-sm font-bold mb-1">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">تحديث الملف الشخصي</button>
      </form>
    </div>
  );
};

export default Profile; 