import React from 'react';

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between mb-4 border border-gray-100">
            <div>
                <div className="text-lg font-semibold text-indigo-800">{subscription.name}</div>
                <div className="text-sm text-gray-500">{subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)} | Next: {new Date(subscription.billingDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-400">Status: <span className={subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}>{subscription.status}</span></div>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
                <div className="text-xl font-bold text-indigo-700 mr-6">₹{subscription.amount}</div>
                <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-900 mr-2" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-900" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
        </div>
    );
}
