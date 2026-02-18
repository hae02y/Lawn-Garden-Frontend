import axios from './axios';

// 전체 유저 조회 api
export const getAllUsers = async () => {
  return await axios.get('/api/v1/users');
};

// 유저 상세 조회 api
export const getUserById = async (userId) => {
  return await axios.get(`/api/v1/users/${userId}`);
};

// 했냐 안했냐 유저 조회 api
export const getTodayUsers = async (commit) => {
  return await axios.get(`/api/v1/users/today`, {
    params: { commit }, // 'y' or 'n'
  });
};
