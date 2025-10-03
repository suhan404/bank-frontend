import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const UserLoans = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    
    // Fetch user's loan applications
    const { data: loans = [], isLoading, error } = useQuery({
        queryKey: ['userLoans', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const response = await axiosSecure.get(`/loans/user-loans/${user?.email}`);
            return response?.data || [];
        },
        enabled: !!user?.email,
    });
    
    // Sort loans by most recent date
    const sortedLoans = [...loans].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Sort in descending order (newest first)
    });
    
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
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 2
        }).format(amount).replace('BDT', 'TK');
    };
    
    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'approved':
                return 'badge-success';
            case 'cancelled':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    };
    
    // Get loan type badge color
    const getLoanTypeBadgeClass = (loanType) => {
        switch (loanType) {
            case 'personal':
                return 'badge-info';
            case 'home':
                return 'badge-primary';
            case 'business':
                return 'badge-secondary';
            case 'education':
                return 'badge-accent';
            case 'car':
                return 'badge-warning';
            default:
                return 'badge-ghost';
        }
    };
    
    // Get status message based on loan status
    const getStatusMessage = (loan) => {
        switch (loan.status) {
            case 'approved':
                return {
                    type: 'success',
                    title: 'Congratulations! Your loan has been approved.',
                    message: 'Please contact the bank for further processing and disbursement details.',
                    bgColor: 'bg-green-50 border-green-200',
                    textColor: 'text-green-800',
                    icon: '✓'
                };
            case 'cancelled':
                return {
                    type: 'error',
                    title: 'Loan Application Cancelled',
                    message: 'Unfortunately, you are not eligible for this loan at this time.',
                    bgColor: 'bg-red-50 border-red-200',
                    textColor: 'text-red-800',
                    icon: '✗'
                };
            case 'pending':
                return {
                    type: 'warning',
                    title: 'Loan Application Under Review',
                    message: 'Your application is being processed. We will notify you of the decision soon.',
                    bgColor: 'bg-yellow-50 border-yellow-200',
                    textColor: 'text-yellow-800',
                    icon: '⏳'
                };
            default:
                return null;
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
                <span>Error loading your loan applications: {error.message}</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Loan Applications</h1>
            
            {sortedLoans.length === 0 ? (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center py-8">
                        <h2 className="card-title justify-center text-gray-500">No Loan Applications Found</h2>
                        <p className="text-gray-400">You haven't applied for any loans yet.</p>
                        <div className="card-actions justify-center mt-4">
                            <a href="/dashboard/apply-loan" className="btn btn-primary">
                                Apply for a Loan
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Status Messages for Each Loan */}
                    {sortedLoans.map((loan) => {
                        const statusMessage = getStatusMessage(loan);
                        if (!statusMessage) return null;
                        
                        return (
                            <div key={`status-${loan._id}`} className={`alert ${statusMessage.bgColor} border-2 ${statusMessage.textColor} rounded-lg`}>
                                <div className="flex items-start">
                                    <span className="text-2xl mr-3">{statusMessage.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-lg">{statusMessage.title}</h3>
                                        <p className="font-medium">{statusMessage.message}</p>
                                        {loan.status === 'approved' && (
                                            <div className="mt-2">
                                                <p className="text-sm">
                                                    <strong>Loan Amount:</strong> {formatCurrency(loan.loanAmount)} | 
                                                    <strong> Loan Type:</strong> {loan.loanType} | 
                                                    <strong> Term:</strong> {loan.loanTerm} months
                                                </p>
                                                <p className="text-sm mt-1">
                                                    <strong>Application Date:</strong> {formatDateTime(loan.applicationDate)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Loan Applications Table */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Your Loan Applications</h2>
                            
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>Application Date</th>
                                            <th>Loan Type</th>
                                            <th>Amount</th>
                                            <th>Term</th>
                                            <th>Purpose</th>
                                            <th>Status</th>
                                            <th>Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedLoans.map((loan) => (
                                            <tr key={loan._id}>
                                                <td>{formatDateTime(loan.applicationDate)}</td>
                                                <td>
                                                    <span className={`badge ${getLoanTypeBadgeClass(loan.loanType)}`}>
                                                        {loan.loanType}
                                                    </span>
                                                </td>
                                                <td className="font-bold">{formatCurrency(loan.loanAmount)}</td>
                                                <td>{loan.loanTerm} months</td>
                                                <td>
                                                    <div className="max-w-xs truncate" title={loan.purpose}>
                                                        {loan.purpose}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(loan.status)}`}>
                                                        {loan.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {loan.updatedAt ? formatDateTime(loan.updatedAt) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    {/* Summary Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Loan Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="stat">
                                    <div className="stat-title">Total Applications</div>
                                    <div className="stat-value text-primary">
                                        {sortedLoans.length}
                                    </div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Pending</div>
                                    <div className="stat-value text-warning">
                                        {sortedLoans.filter(loan => loan.status === 'pending').length}
                                    </div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Approved</div>
                                    <div className="stat-value text-success">
                                        {sortedLoans.filter(loan => loan.status === 'approved').length}
                                    </div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Cancelled</div>
                                    <div className="stat-value text-error">
                                        {sortedLoans.filter(loan => loan.status === 'cancelled').length}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Total Amount Summary */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="stat">
                                    <div className="stat-title">Total Amount Requested</div>
                                    <div className="stat-value text-lg">
                                        {formatCurrency(sortedLoans.reduce((sum, loan) => sum + loan.loanAmount, 0))}
                                    </div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Approved Amount</div>
                                    <div className="stat-value text-lg text-success">
                                        {formatCurrency(sortedLoans.filter(loan => loan.status === 'approved').reduce((sum, loan) => sum + loan.loanAmount, 0))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Apply for New Loan Button */}
                    <div className="text-center">
                        <a href="/dashboard/apply-loan" className="btn btn-primary btn-lg">
                            Apply for a New Loan
                        </a>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserLoans;