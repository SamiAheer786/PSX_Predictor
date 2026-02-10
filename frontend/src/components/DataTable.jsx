import React from 'react';

const DataTable = ({ title, data, loading }) => {
    if (loading) return <div className="card text-slate-400">Loading...</div>;
    if (!data || !data.length) return null;

    // Extract all unique years from the first item's data points
    // Sort years descending (newest first)
    const firstItem = data[0];
    const years = firstItem?.data?.map(d => d.year).sort((a, b) => b - a) || [];

    if (years.length === 0 && data.length > 0) {
        // Fallback: try to find years from any item that has data
        const itemWithData = data.find(item => item.data && item.data.length > 0);
        if (itemWithData) {
            years.push(...itemWithData.data.map(d => d.year).sort((a, b) => b - a));
        }
    }

    return (
        <div className="card overflow-hidden">
            {title && <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-4 mb-4">{title}</h3>}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr>
                            <th className="table-header sticky left-0 z-10 bg-slate-900 border-r border-slate-700 w-64">
                                Particulars
                            </th>
                            {years.map(year => (
                                <th key={year} className="table-header text-right min-w-[100px]">
                                    {year}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors border-b border-slate-700 last:border-0">
                                <td className={`table-cell sticky left-0 z-10 bg-slate-900 border-r border-slate-700 font-medium ${item.bold ? 'text-white' : 'text-slate-300'}`}>
                                    {item.label}
                                    {item.unit && <span className="text-xs text-slate-500 font-normal ml-1">({item.unit})</span>}
                                </td>
                                {years.map(year => {
                                    const point = item.data.find(d => d.year === year);
                                    return (
                                        <td key={year} className="table-cell text-right font-mono text-slate-300">
                                            {point && point.value != null ? Number(point.value).toLocaleString() : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
