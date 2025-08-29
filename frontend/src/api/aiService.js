import axios from 'axios';

const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_URL,
});

export const analyzePolicy = async (text) => {
  const response = await aiClient.post('/nlp/analyze', text);
  return response.data;
};

export const assessRisk = async (text) => {
  const response = await aiClient.post('/risk/assess', text);
  return response.data;
};