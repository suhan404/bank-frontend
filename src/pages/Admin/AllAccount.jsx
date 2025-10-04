import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const AllAccount = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Fetch all accounts using React Query
    const { data: accounts = [], isLoading, error, refetch } = useQuery({
        queryKey: ['allAccounts'],
        queryFn: async () => {
            const response = await axiosSecure.get('/accounts/allaccounts');
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

    // Filter accounts based on search term and account type
    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = 
            account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountNumber?.includes(searchTerm) ||
            account.phone?.includes(searchTerm);
            
        const matchesFilter = filterType === 'all' || account.accountType === filterType;
        
        return matchesSearch && matchesFilter;
    });

    // Calculate statistics
    const totalAccounts = accounts.length;
    const totalDeposits = accounts.reduce((sum, account) => sum + (account.deposit || 0), 0);
    const accountTypes = {
        savings: accounts.filter(acc => acc.accountType === 'savings').length,
        business: accounts.filter(acc => acc.accountType === 'business').length,
        deposit: accounts.filter(acc => acc.accountType === 'deposit').length,
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
                <span>Error loading account data: {error.message}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => refetch()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">All Accounts</h1>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Total Accounts</div>
                    <div className="stat-value text-primary">{totalAccounts}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Total Deposits</div>
                    <div className="stat-value text-secondary">TK {totalDeposits.toFixed(2)}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Savings</div>
                    <div className="stat-value text-accent">{accountTypes.savings}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <div className="stat-title">Business</div>
                    <div className="stat-value text-info">{accountTypes.business}</div>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="form-control flex-1">
                            <input
                                type="text"
                                placeholder="Search by name, email, account number, or phone..."
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
                                <option value="savings">Savings</option>
                                <option value="business">Business</option>
                                <option value="deposit">Deposit</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={() => refetch()}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Account Details</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Profile</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Account Number</th>
                                    <th>Type</th>
                                    <th>Deposit</th>
                                    <th>Balance</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.map((account) => (
                                    <tr key={account._id}>
                                        <td>
                                            <div className="avatar">
                                                <div className="w-12 rounded-full">
                                                    {account.profileImage ? (
                                                        <img src={account.profileImage} alt="Profile" />
                                                    ) : (
                                                        <div className="bg-neutral text-neutral-content rounded-full w-12 h-12 flex items-center justify-center">
                                                            <span className="text-lg">
                                                                {account.name?.charAt(0) || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-medium">{account.name}</td>
                                        <td>{account.email}</td>
                                        <td>{account.phone}</td>
                                        <td className="font-mono">{account.accountNumber}</td>
                                        <td>
                                            <span className={`badge ${
                                                account.accountType === 'savings' ? 'badge-success' :
                                                account.accountType === 'business' ? 'badge-info' :
                                                'badge-warning'
                                            }`}>
                                                {account.accountType}
                                            </span>
                                        </td>
                                        <td className="font-bold">TK {(account.deposit || 0).toFixed(2)}</td>
                                        <td className={`font-bold ${
                                            account.balance > 0 ? 'text-success' : 
                                            account.balance < 0 ? 'text-error' : 
                                            ''
                                        }`}>
                                            TK {(account.balance || 0).toFixed(2)}
                                        </td>
                                        <td>{formatDate(account.createdAt)}</td>
                                        <td>
                                            <div className="dropdown dropdown-left">
                                                <label tabIndex={0} className="btn btn-ghost btn-xs">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                                    </svg>
                                                </label>
                                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                    <li><a href="#" onClick={(e) => e.preventDefault()}>View Details</a></li>
                                                    <li><a href="#" onClick={(e) => e.preventDefault()}>View NID Images</a></li>
                                                    <li><a href="#" onClick={(e) => e.preventDefault()}>Transaction History</a></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredAccounts.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No accounts found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllAccount;