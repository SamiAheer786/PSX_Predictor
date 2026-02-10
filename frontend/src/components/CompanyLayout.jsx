import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { getCompanies, getCompanyQuote, getCompanyOverview } from '../api';
import Header from './Header';

import { NavLink } from 'react-router-dom';

const CompanyLayout = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [companyInfo, setCompanyInfo] = useState(null); // { company, quote, profile ... }
    const [loading, setLoading] = useState(true);

    // Fetch companies list for dropdown
    useEffect(() => {
        getCompanies().then(setCompanies).catch(console.error);
    }, []);

    // Fetch company basic info when ID changes
    // We can use getCompanyOverview to get everything, but maybe overkill if we just want Header info?
    // getCompanyOverview returns { company, quote, profile, financials, ... }
    // We can fetch it once here and pass it down, OR fetch just what's needed.
    // Ideally, Header needs `company` and `quote`.
    // Let's use getCompanyOverview for now, and pass relevant parts to Header.
    // The child pages can re-fetch or we can pass data down via context. 
    // For simplicity and data freshness, let's let child pages fetch their specific data, 
    // but Header data we fetch here.

    // Actually, getCompanyOverview is quite heavy (all financials).
    // Maybe we should just fetch the list and find the company object from it + fetch quote separately?
    // `getCompanies` returns the list.
    // `getCompanyQuote` returns quote.
    // That handles the Header requirements!

    useEffect(() => {
        if (companyId && companies.length) {
            const company = companies.find(c => c.value == companyId);
            if (company) {
                setLoading(true);
                getCompanyQuote(company.symbol)
                    .then(quote => {
                        setCompanyInfo({ company, quote });
                    })
                    .catch(console.error)
                    .finally(() => setLoading(false));
            }
        }
    }, [companyId, companies]);

    const handleCompanyChange = (e) => {
        navigate(`/company/${e.target.value}/overview`);
    };

    if (!companyId) return <div>Select a company</div>;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
            {/* Search / Selector */}
            <div className="flex justify-end">
                <select
                    className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={companyId}
                    onChange={handleCompanyChange}
                >
                    {companies.map(c => (
                        <option key={c.value} value={c.value}>{c.label2} - {c.name}</option>
                    ))}
                </select>
            </div>

            {companyInfo && (
                <>
                    <Header company={companyInfo.company} quote={companyInfo.quote} />

                    {/* Navigation Tabs */}
                    <div className="border-b border-slate-700 overflow-x-auto">
                        <div className="flex space-x-1 min-w-max">
                            {[
                                { path: 'overview', label: 'Overview' },
                                { path: 'income-statement', label: 'Income Statement' },
                                { path: 'balance-sheet', label: 'Balance Sheet' },
                                { path: 'cash-flow', label: 'Cash Flow' },
                                { path: 'ratios', label: 'Ratios' },
                            ].map(tab => (
                                <NavLink
                                    key={tab.path}
                                    to={tab.path}
                                    className={({ isActive }) =>
                                        `px-4 py-3 text-sm font-bold border-b-2 transition-colors duration-200 ${isActive
                                            ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                                        }`
                                    }
                                >
                                    {tab.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Render child route */}
            <Outlet context={{ companyId: parseInt(companyId), companyInfo }} />
        </div>
    );
};

export default CompanyLayout;
