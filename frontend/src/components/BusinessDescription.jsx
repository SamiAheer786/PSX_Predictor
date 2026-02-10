import React from 'react';

const BusinessDescription = ({ description }) => {
    if (!description) return null;

    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Profile</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default BusinessDescription;
