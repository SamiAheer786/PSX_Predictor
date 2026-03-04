import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Simple in-memory cache to prevent redundant fetches during tab switching
const apiCache = {};

export const getCompanies = async () => {
    if (apiCache['companies']) return apiCache['companies'];
    const response = await axios.get(`${API_BASE_URL}/companies`);
    apiCache['companies'] = response.data;
    return response.data;
};

export const getCompanyOverview = async (companyId) => {
    const cacheKey = `overview_${companyId}`;
    if (apiCache[cacheKey]) return apiCache[cacheKey];
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/overview`);
    apiCache[cacheKey] = response.data;
    return response.data;
};

export const getCompanyQuote = async (symbol) => {
    const cacheKey = `quote_${symbol}`;
    if (apiCache[cacheKey]) return apiCache[cacheKey];
    const response = await axios.get(`${API_BASE_URL}/company/${symbol}/quote`);
    apiCache[cacheKey] = response.data;
    return response.data;
};

export const getBalanceSheet = async (companyId) => {
    const cacheKey = `balance_sheet_${companyId}`;
    if (apiCache[cacheKey]) return apiCache[cacheKey];
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/balance-sheet`);
    apiCache[cacheKey] = response.data;
    return response.data;
};

export const getIncomeStatement = async (companyId) => {
    const cacheKey = `income_statement_${companyId}`;
    if (apiCache[cacheKey]) return apiCache[cacheKey];
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/income-statement`);
    apiCache[cacheKey] = response.data;
    return response.data;
};

export const getCashFlow = async (companyId) => {
    const cacheKey = `cash_flow_${companyId}`;
    if (apiCache[cacheKey]) return apiCache[cacheKey];
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/cash-flow`);
    apiCache[cacheKey] = response.data;
    return response.data;
};

export const getRatios = async (companyId) => {
    const cacheKey = `ratios_${companyId}`;
    if (apiCache[cacheKey]) return apiCache[cacheKey];
    const response = await axios.get(`${API_BASE_URL}/company/${companyId}/ratios`);
    apiCache[cacheKey] = response.data;
    return response.data;
};

export const getSectors = async () => {
    if (apiCache['sectors']) return apiCache['sectors'];
    const response = await axios.get(`${API_BASE_URL}/sectors`);
    apiCache['sectors'] = response.data;
    return response.data;
};

export const getMarketSummary = async (refresh = false) => {
    const response = await axios.get(`${API_BASE_URL}/market-summary${refresh ? '?refresh=true' : ''}`);
    return response.data;
};
