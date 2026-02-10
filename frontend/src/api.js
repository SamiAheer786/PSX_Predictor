import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const getCompanies = async () => {
    const response = await axios.get(`${API_BASE_URL}/companies`);
    return response.data;
};

export const getCompanyOverview = async (companyId) => {
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/overview`);
    return response.data;
};

export const getCompanyQuote = async (symbol) => {
    const response = await axios.get(`${API_BASE_URL}/company/${symbol}/quote`);
    return response.data;
};
