import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const UserHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    // Fetch account data using React Query
    const { data: accountData, isLoading, error } = useQuery({
        queryKey: ['accountData', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const response = await axiosSecure.get(`/accounts/getaccount/${user?.email}`);
            return response?.data;
        },
        enabled: !!user?.email,
    });

    console.log(accountData);

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
                <span>Error loading account information: {error.message}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            {/* Account Overview Card */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Account Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-4">
                            {accountData?.profileImage ? (
                                <div className="avatar">
                                    <div className="w-20 rounded-full">
                                        <img src={accountData.profileImage} alt="Profile" />
                                    </div>
                                </div>
                            ) : (
                                <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content rounded-full w-20">
                                        <span className="text-2xl">
                                            {accountData?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold">{accountData?.name || 'N/A'}</h3>
                                <p className="text-sm opacity-70">{user?.email}</p>
                            </div>
                        </div>
                        
                        {/* Account Details */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Account Number:</span>
                                <span>{accountData?.accountNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Account Type:</span>
                                <span className="capitalize">{accountData?.accountType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Phone:</span>
                                <span>{accountData?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Card */}
            <div className="card bg-primary text-primary-content shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Current Balance</h2>
                    <div className="text-4xl font-bold">
                        TK {accountData?.deposit?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm opacity-80">Available balance in your account</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                    <div className="card-body text-center">
                        <h3 className="card-title justify-center">Send Money</h3>
                        <p>Transfer money to other accounts</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                    <div className="card-body text-center">
                        <h3 className="card-title justify-center">Withdraw Money</h3>
                        <p>Withdraw money from your account</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                    <div className="card-body text-center">
                        <h3 className="card-title justify-center">Transaction History</h3>
                        <p>View your past transactions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHome;