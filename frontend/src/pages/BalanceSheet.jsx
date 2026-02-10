import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getBalanceSheet } from '../api';
import DataTable from '../components/DataTable';

const BalanceSheet = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getBalanceSheet(companyId)
                .then(res => {
                    let finalData = res.annual;
                    // Check for nested structure (Sections array where data contains rows, not points)
                    if (finalData && finalData.length > 0 && finalData[0].data && finalData[0].data[0] && !finalData[0].data[0].year) {
                        const flattened = [];
                        finalData.forEach(section => {
                            // Add Section Header
                            flattened.push({ ...section, data: [], bold: true, isHeader: true });
                            // Add Children Rows
                            if (Array.isArray(section.data)) {
                                flattened.push(...section.data);
                            }
                        });
                        finalData = flattened;
                    }
                    setData(finalData);
                })
                .catch(err => console.error("BS Fetch Error:", err))
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Balance Sheet (Annual)</h2>
            <DataTable data={data} loading={loading} />
        </div>
    );
};

export default BalanceSheet;
