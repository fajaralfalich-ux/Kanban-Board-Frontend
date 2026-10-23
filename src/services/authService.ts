import axios from 'axios';

// Otomatis menyesuaikan IP: localhost jika di laptop, IP (192.168.x.x) jika di HP
const API_BASE_URL = `http://${window.location.hostname}:3000`;

// Helper untuk mengambil token JWT dari localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// 1. Login User
export const loginUser = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
  return response.data;
};

// 2. Register User
export const registerUser = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
  return response.data;
};

// 3. Update Username
export const updateUsername = async (newUsername: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/auth/profile`,
      { username: newUsername },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 4. Update Profile Picture
export const updateProfilePicture = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/upload-profile-picture`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};