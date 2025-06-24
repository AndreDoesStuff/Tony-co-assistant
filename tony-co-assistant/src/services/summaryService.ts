import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Summary {
  id: string;
  title: string;
  type: 'ux-repository' | 'school-bench';
  rawContent: string;
  summaryContent: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const updateSummary = async (id: string, summaryContent: string): Promise<Summary> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/summaries/${id}`, { summaryContent });
    return response.data;
  } catch (error) {
    console.error('Error updating summary:', error);
    throw new Error('Failed to update summary');
  }
};

export const createSummary = async (summary: Omit<Summary, 'id'>): Promise<Summary> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/summaries`, summary);
    return response.data;
  } catch (error) {
    console.error('Error creating summary:', error);
    throw new Error('Failed to create summary');
  }
};

export const deleteSummary = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/summaries/${id}`);
  } catch (error) {
    console.error('Error deleting summary:', error);
    throw new Error('Failed to delete summary');
  }
}; 