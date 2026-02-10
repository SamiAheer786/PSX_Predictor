import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCashFlow } from '../api';
import DataTable from '../components/DataTable';

const CashFlow = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getCashFlow(companyId)
                .then(res => setData(res.indirect || res.annual)) // Use indirect usually, fallback to annual/direct
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Cash Flow Statement (Annual)</h2>
            <DataTable data={data} loading={loading} />
        </div>
    );
};

export default CashFlow;
