import React from 'react';

const OverviewGrid = ({ title, data, columns = 2 }) => {
    if (!data) return null;

    const items = Array.isArray(data) ? data : Object.entries(data).map(([label, value]) => ({ label, value }));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <h3 className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                {title}
            </h3>
            <div className={`grid grid-cols-1 md:grid-cols-${columns} divide-y md:divide-y-0 md:gap-px bg-slate-200 dark:bg-slate-800`}>
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value || "-"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewGrid;
