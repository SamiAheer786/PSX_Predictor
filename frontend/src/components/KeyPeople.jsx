import React from 'react';

const KeyPeople = ({ people }) => {
    if (!people || !people.length) return null;

    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Key People</h3>
            <div className="overflow-x-auto max-h-60 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="table-header">Name</th>
                            <th className="table-header">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {people.map((p, i) => (
                            <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                                <td className="table-cell font-medium text-slate-200">{p.name}</td>
                                <td className="table-cell text-slate-400">{p.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KeyPeople;
