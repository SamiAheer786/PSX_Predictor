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

export const getBalanceSheet = async (companyId) => {
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/balance-sheet`);
    return response.data;
};

export const getIncomeStatement = async (companyId) => {
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/income-statement`);
    return response.data;
};

export const getCashFlow = async (companyId) => {
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/cash-flow`);
    return response.data;
};

export const getRatios = async (companyId) => {
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/ratios`);
    return response.data;
};
