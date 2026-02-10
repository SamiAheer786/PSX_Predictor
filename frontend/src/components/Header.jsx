import React from 'react';

const Header = ({ company, quote }) => {
    if (!company || !quote) return null;

    const isPositive = quote.change && parseFloat(quote.change) >= 0;
    const colorClass = isPositive ? 'text-aa-green' : 'text-aa-red';

    return (
        <div className="card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 overflow-hidden border border-slate-600">
                    <img src={company.image} alt={company.symbol} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{company.symbol}</span>
                        <span>•</span>
                        <span>{company.sector}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-end flex-col">
                <div className="text-3xl font-black text-white">
                    {quote.last_close || '0.00'} <span className="text-lg font-normal text-slate-500">PKR</span>
                </div>
                <div className={`flex items-center gap-2 font-bold ${colorClass}`}>
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>{quote.change}</span>
                    <span>({quote.change_percent})</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    Vol: <span className="text-slate-300">{quote.volume}</span>
                </div>
            </div>
        </div>
    );
};

export default Header;
