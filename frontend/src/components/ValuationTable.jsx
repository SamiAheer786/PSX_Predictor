import React from 'react';

const ValuationTable = ({ industry, currentStats }) => {
    if (!industry) return null;

    // AskAnalyst industry API returns a list of competitors with their metrics
    // We want to show a comparison table

    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Valuation</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="table-header">Company</th>
                            <th className="table-header text-right">P/E</th>
                            <th className="table-header text-right">P/B</th>
                            <th className="table-header text-right">DY %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Show current company first if we had its ratios, but for now just list industry peers */}
                        {industry.slice(0, 5).map((comp, i) => ( // limit to 5
                            <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                                <td className="table-cell font-medium text-white">{comp.symbol || comp.code || "N/A"}</td>
                                <td className="table-cell text-right">{comp.per || "-"}</td>
                                <td className="table-cell text-right">{comp.pbv || "-"}</td>
                                <td className="table-cell text-right">{comp.dy || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ValuationTable;
