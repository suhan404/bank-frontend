import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const TransactionHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    // Fetch transaction history
    const { data: transactions = [], isLoading, error } = useQuery({
        queryKey: ['transactionHistory', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const response = await axiosSecure.get(`/transactions/history/${user?.email}`);
            return response?.data || [];
        },
        enabled: !!user?.email,
    });

    // Sort transactions by createdAt date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <span>Error loading transaction history: {error.message}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Transaction History</h1>
            
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Your Transactions</h2>
                    
                    {sortedTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No transactions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Transaction Type</th>
                                        <th>Account Number</th>
                                        <th>Name</th>
                                        <th>Amount</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTransactions.map((transaction) => {
                                        const isSender = transaction.senderEmail === user?.email;
                                        const otherAccountNumber = isSender 
                                            ? transaction.recipientAccountNumber 
                                            : transaction.senderAccountNumber;
                                        
                                        return (
                                            <tr key={transaction._id}>
                                                <td>{formatDateTime(transaction.createdAt)}</td>
                                                <td>
                                                    <span className={`badge ${isSender ? 'badge-error' : 'badge-success'}`}>
                                                        {isSender ? 'Sent' : 'Received'}
                                                    </span>
                                                </td>
                                                <td>{otherAccountNumber}</td>
                                                <td>{isSender ? 'To: ' + transaction.recipientEmail : 'From: ' + transaction.senderEmail}</td>
                                                <td className={`font-bold ${isSender ? 'text-error' : 'text-success'}`}>
                                                    {isSender ? '-' : '+'} TK {transaction.amount.toFixed(2)}
                                                </td>
                                                <td>{transaction.description || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Summary Card */}
            {sortedTransactions.length > 0 && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Transaction Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="stat">
                                <div className="stat-title">Total Transactions</div>
                                <div className="stat-value text-primary">
                                    {sortedTransactions.length}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Total Sent</div>
                                <div className="stat-value text-error">
                                    TK {sortedTransactions
                                        .filter(t => t.senderEmail === user?.email)
                                        .reduce((sum, t) => sum + t.amount, 0)
                                        .toFixed(2)}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Total Received</div>
                                <div className="stat-value text-success">
                                    TK {sortedTransactions
                                        .filter(t => t.recipientEmail === user?.email)
                                        .reduce((sum, t) => sum + t.amount, 0)
                                        .toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;