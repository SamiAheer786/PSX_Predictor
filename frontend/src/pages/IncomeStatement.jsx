import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getIncomeStatement } from '../api';
import DataTable from '../components/DataTable';

const IncomeStatement = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getIncomeStatement(companyId)
                .then(res => {
                    let finalData = res.annual;
                    // Check for nested structure
                    if (finalData && finalData.length > 0 && finalData[0].data && finalData[0].data[0] && !finalData[0].data[0].year) {
                        const flattened = [];
                        finalData.forEach(section => {
                            flattened.push({ ...section, data: [], bold: true, isHeader: true });
                            if (Array.isArray(section.data)) {
                                flattened.push(...section.data);
                            }
                        });
                        finalData = flattened;
                    }
                    setData(finalData);
                })
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Income Statement (Annual)</h2>
            <DataTable data={data} loading={loading} />
        </div>
    );
};

export default IncomeStatement;
