import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getRatios } from '../api';
import DataTable from '../components/DataTable';

const Ratios = () => {
    const { companyId } = useOutletContext();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getRatios(companyId)
                .then(res => setSections(res))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    if (loading) return <div className="text-slate-400">Loading ratios...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Financial Ratios</h2>
            {sections.map((section, idx) => (
                <DataTable
                    key={idx}
                    title={section.section}
                    data={section.data}
                    loading={false}
                />
            ))}
        </div>
    );
};

export default Ratios;
