import axios from 'axios';


const API_URL = import.meta.env.PROD 
  ? 'https://nba-mvp-model.onrender.com' 
  : '/api';


export const fetchLeaderboard = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/leaderboard/${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};
