import React, { useEffect, useState, createContext } from 'react';
import axiosInstance from '../api/axios';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {

  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch logged in user (cookie auth)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axiosInstance.get('/auth/profile');
        setAuthUser(res?.data?.user || null);
      } catch (error) {
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);


  // LOGIN
  const userLogin = async (data) => {
    const res = await axiosInstance.post('/auth/login', data);
    return res?.data;
  };


  // REGISTER
  const userRegister = async (data, profileImage) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    const res = await axiosInstance.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data;
  };


  // PROFILE IMAGE UPLOAD
  const userProfileUpload = async (file) => {
    const formData = new FormData();
    formData.append("profile", file); // MUST MATCH BACKEND

    const res = await axiosInstance.patch('/auth/profile-upload', formData);

    return res?.data;
  };


  // LOGOUT
  const logoutUser = async () => {
    const res = await axiosInstance.post('/auth/logout');
    setAuthUser(null);
    return res?.data;
  };


  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        loading,
        userLogin,
        userRegister,
        userProfileUpload,
        logoutUser,
        search,
        setSearch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
