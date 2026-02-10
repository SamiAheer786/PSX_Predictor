import React from 'react';

const StockData = ({ stockData }) => {
    if (!stockData) return null;

    // Transform nested API response for "Adjusted Stock Prices"
    // API: [ {label: "Adjusted Stock Prices", data: [ {label: "Close", data: [...]}, ... ] } ]

    // For now, let's just display the Share Capital / Outstanding Shares if available in a table
    // The API structure is a bit complex, strictly for the table we might want the straightforward quote data.
    // We'll use this component to display "Stock Price Data" composition if possible, but for simplicity let's stick to key stats.

    // If stockData doesn't have the simple key-value pairs we expect from a summary, 
    // maybe we can visualize the return composition.

    // Let's rely on extracting "Sharpe Ratio" etc if present, or just dump the "Return Composition"

    const returns = stockData.find(item => item.label === "Return Composition");
    const priceData = stockData.find(item => item.label === "Adjusted Stock Prices");

    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Stock Data</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Placeholder for complex stock data visualization */}
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Items Found</div>
                    <div className="text-xl font-mono text-white">{stockData.length} Datasets</div>
                </div>

                {returns && (
                    <div className="bg-slate-900 p-4 rounded border border-slate-700 col-span-2">
                        <h4 className="text-sm font-bold text-slate-300 mb-2">Return Types</h4>
                        <div className="flex flex-wrap gap-2">
                            {returns.data.map((r, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-xs rounded border border-slate-600 text-slate-300">
                                    {r.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockData;
