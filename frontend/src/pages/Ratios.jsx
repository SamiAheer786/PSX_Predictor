import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getRatios } from '../api';
import DataTable from '../components/DataTable';
import DynamicDataView from '../components/DynamicDataView';

const RatioSection = ({ section, data }) => {
    return (
        <div className="space-y-6 mb-12 border-b border-slate-800/50 pb-12 last:border-0">
            <DynamicDataView
                data={data}
                title={section}
                defaultChartType="area"
            />
            <DataTable
                title={`${section} Data`}
                data={data}
                loading={false}
            />
        </div>
    );
};

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

    if (loading) return <div className="text-slate-400 p-6">Loading ratios...</div>;

    return (
        <div className="space-y-12">
            <h2 className="text-xl font-bold text-white px-6 pt-6">Financial Ratios</h2>
            <div className="px-6 pb-6 space-y-12">
                {sections.map((section, idx) => (
                    <RatioSection
                        key={idx}
                        section={section.section}
                        data={section.data}
                    />
                ))}
            </div>
        </div>
    );
};

export default Ratios;
