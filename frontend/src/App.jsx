import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CompanyLayout from './components/CompanyLayout';
import CompanyOverview from './pages/CompanyOverview';
import IncomeStatement from './pages/IncomeStatement';
import BalanceSheet from './pages/BalanceSheet';
import CashFlow from './pages/CashFlow';
import Ratios from './pages/Ratios';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
                <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-blue-500 tracking-tight">AskAnalyst</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold tracking-wider">CLONE</span>
                        </div>
                        <div className="text-sm text-slate-400">PKR Market Data</div>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Navigate to="/company/1/overview" replace />} />

                    <Route path="/company/:companyId" element={<CompanyLayout />}>
                        <Route path="overview" element={<ErrorBoundary><CompanyOverview /></ErrorBoundary>} />
                        <Route path="income-statement" element={<ErrorBoundary><IncomeStatement /></ErrorBoundary>} />
                        <Route path="balance-sheet" element={<ErrorBoundary><BalanceSheet /></ErrorBoundary>} />
                        <Route path="cash-flow" element={<ErrorBoundary><CashFlow /></ErrorBoundary>} />
                        <Route path="ratios" element={<ErrorBoundary><Ratios /></ErrorBoundary>} />
                        <Route index element={<Navigate to="overview" replace />} />
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
