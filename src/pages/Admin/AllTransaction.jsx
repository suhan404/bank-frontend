import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const AllTransaction = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    // Fetch all transactions using React Query
    const { data: transactions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['allTransactions'],
        queryFn: async () => {
            const response = await axiosSecure.get('/transactions/all-transactions');
            return response?.data || [];
        },
    });

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format date for filtering (YYYY-MM-DD)
    const formatDateForFilter = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Filter transactions based on search term, type, and date
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = 
            transaction.senderAccountNumber?.includes(searchTerm) ||
            transaction.recipientAccountNumber?.includes(searchTerm) ||
            transaction.senderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const transactionType = transaction.transactionType || transaction.type || 'other';
        const matchesFilter = filterType === 'all' || transactionType === filterType;
        
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const transactionDate = formatDateForFilter(transaction.createdAt);
            const today = getTodayDate();
            
            if (dateFilter === 'today') {
                matchesDate = transactionDate === today;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesDate = new Date(transaction.createdAt) >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesDate = new Date(transaction.createdAt) >= monthAgo;
            }
        }
        
        return matchesSearch && matchesFilter && matchesDate;
    });

    // Calculate statistics
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    const transactionTypes = {
        'send-money': transactions.filter(t => (t.transactionType || t.type) === 'send-money').length,
        'withdraw': transactions.filter(t => (t.transactionType || t.type) === 'withdraw').length,
        'deposit': transactions.filter(t => (t.transactionType || t.type) === 'deposit').length,
    };

    const typeAmounts = {
        'send-money': transactions
            .filter(t => (t.transactionType || t.type) === 'send-money')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
        'withdraw': transactions
            .filter(t => (t.transactionType || t.type) === 'withdraw')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
        'deposit': transactions
            .filter(t => (t.transactionType || t.type) === 'deposit')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
    };

    // Get transaction type badge color
    const getTransactionTypeBadge = (type) => {
        const transactionType = type || 'other';
        switch (transactionType) {
            case 'send-money':
                return 'badge-info';
            case 'withdraw':
                return 'badge-warning';
            case 'deposit':
                return 'badge-success';
            default:
                return 'badge-neutral';
        }
    };

    // Get transaction icon
    const getTransactionIcon = (type) => {
        const transactionType = type || 'other';
        switch (transactionType) {
            case 'send-money':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                );
            case 'withdraw':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                );
            case 'deposit':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
        }
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
                <span>Error loading transaction data: {error.message}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => refetch()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">All Transactions</h1>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Total Transactions</div>
                    <div className="stat-value text-primary">{totalTransactions}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Total Amount</div>
                    <div className="stat-value text-secondary">TK {totalAmount.toFixed(2)}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Send Money</div>
                    <div className="stat-value text-info">{transactionTypes['send-money']}</div>
                    <div className="stat-desc">TK {typeAmounts['send-money'].toFixed(2)}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Withdrawals</div>
                    <div className="stat-value text-warning">{transactionTypes['withdraw']}</div>
                    <div className="stat-desc">TK {typeAmounts['withdraw'].toFixed(2)}</div>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="form-control flex-1">
                            <input
                                type="text"
                                placeholder="Search by account number, email, or description..."
                                className="input input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <select
                                className="select select-bordered"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="send-money">Send Money</option>
                                <option value="withdraw">Withdraw</option>
                                <option value="deposit">Deposit</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <select
                                className="select select-bordered"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={() => refetch()}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Transaction Details</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Date & Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => {
                                    const transactionType = transaction.transactionType || transaction.type || 'other';
                                    return (
                                        <tr key={transaction._id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {getTransactionIcon(transactionType)}
                                                    <span className={`badge ${getTransactionTypeBadge(transactionType)}`}>
                                                        {transactionType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="font-mono text-sm">{transaction.senderAccountNumber || '-'}</div>
                                                    <div className="text-xs text-gray-500">{transaction.senderEmail || '-'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="font-mono text-sm">{transaction.recipientAccountNumber || transaction.accountNumber || '-'}</div>
                                                    <div className="text-xs text-gray-500">{transaction.recipientEmail || transaction.email || '-'}</div>
                                                </div>
                                            </td>
                                            <td className="font-bold text-lg">TK {transaction.amount?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                <div className="max-w-xs truncate" title={transaction.description}>
                                                    {transaction.description || '-'}
                                                </div>
                                            </td>
                                            <td>{formatDate(transaction.createdAt)}</td>
                                            <td>
                                                <div className="dropdown dropdown-left">
                                                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                                        </svg>
                                                    </label>
                                                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                        <li><a href="#" onClick={(e) => e.preventDefault()}>View Details</a></li>
                                                        <li><a href="#" onClick={(e) => e.preventDefault()}>View Receipt</a></li>
                                                        <li><a href="#" onClick={(e) => e.preventDefault()}>Download PDF</a></li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No transactions found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllTransaction;