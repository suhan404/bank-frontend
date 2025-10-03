import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const LoanList = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Fetch all loan applications
    const { data: loans = [], isLoading, error } = useQuery({
        queryKey: ['allLoans'],
        queryFn: async () => {
            const response = await axiosSecure.get('/loans/all-loans');
            return response?.data || [];
        },
    });
    
    // Sort loans by most recent date
    const sortedLoans = [...loans].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Sort in descending order (newest first)
    });
    
    // Update loan status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const response = await axiosSecure.patch(`/loan-status/${id}`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allLoans']);
            Swal.fire({
                title: 'Success!',
                text: 'Loan status updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update loan status',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
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
    
    // Handle status change
    const handleStatusChange = (loanId, newStatus) => {
        const loan = sortedLoans.find(l => l._id === loanId);
        
        const statusText = newStatus === 'approved' ? 'approve' : 'cancel';
        const statusTitle = newStatus === 'approved' ? 'Approve Loan' : 'Cancel Loan';
        const statusMessage = newStatus === 'approved' 
            ? `Are you sure you want to approve this loan for TK ${formatCurrency(loan.loanAmount)}?`
            : 'Are you sure you want to cancel this loan application?';
        
        // Show confirmation dialog
        Swal.fire({
            title: statusTitle,
            text: statusMessage,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'approved' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${statusText} it!`
        }).then((result) => {
            if (result.isConfirmed) {
                updateStatusMutation.mutate({ id: loanId, status: newStatus });
            }
        });
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
    
    // View loan details
    const viewLoanDetails = (loan) => {
        const detailsHtml = `
            <div class="text-left">
                <p><strong>Account Number:</strong> ${loan.accountNumber}</p>
                <p><strong>Name:</strong> ${loan.name}</p>
                <p><strong>Email:</strong> ${loan.email}</p>
                <p><strong>Loan Type:</strong> ${loan.loanType}</p>
                <p><strong>Loan Amount:</strong> ${formatCurrency(loan.loanAmount)}</p>
                <p><strong>Loan Term:</strong> ${loan.loanTerm} months</p>
                <p><strong>Purpose:</strong> ${loan.purpose}</p>
                <p><strong>Employment Status:</strong> ${loan.employmentStatus}</p>
                <p><strong>Annual Income:</strong> ${formatCurrency(loan.annualIncome)}</p>
                <p><strong>Existing Loans:</strong> ${loan.existingLoans ? 'Yes' : 'No'}</p>
                <p><strong>Collateral:</strong> ${loan.collateral ? `Yes (${formatCurrency(loan.collateralValue)})` : 'No'}</p>
                <p><strong>Application Date:</strong> ${formatDateTime(loan.applicationDate)}</p>
                <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(loan.status)}">${loan.status}</span></p>
                ${loan.description ? `<p><strong>Additional Info:</strong> ${loan.description}</p>` : ''}
            </div>
        `;
        
        Swal.fire({
            title: 'Loan Application Details',
            html: detailsHtml,
            icon: 'info',
            confirmButtonText: 'Close',
            width: '600px'
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
                <span>Error loading loan applications: {error.message}</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Loan Applications</h1>
            
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">All Loan Applications</h2>
                    
                    {sortedLoans.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No loan applications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Account Number</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Loan Type</th>
                                        <th>Amount</th>
                                        <th>Term</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedLoans.map((loan) => (
                                        <tr key={loan._id}>
                                            <td>{formatDateTime(loan.createdAt)}</td>
                                            <td>{loan.accountNumber}</td>
                                            <td>{loan.name}</td>
                                            <td>{loan.email}</td>
                                            <td>
                                                <span className={`badge ${getLoanTypeBadgeClass(loan.loanType)}`}>
                                                    {loan.loanType}
                                                </span>
                                            </td>
                                            <td className="font-bold">{formatCurrency(loan.loanAmount)}</td>
                                            <td>{loan.loanTerm} months</td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(loan.status)}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {/* View Details Button */}
                                                    <button
                                                        className="btn btn-sm btn-outline btn-info"
                                                        onClick={() => viewLoanDetails(loan)}
                                                    >
                                                        View
                                                    </button>
                                                    
                                                    {/* Status Dropdown for pending loans */}
                                                    {loan.status === 'pending' ? (
                                                        <div className="dropdown dropdown-left">
                                                            <label tabIndex={0} className="btn btn-sm btn-outline">
                                                                Change Status
                                                            </label>
                                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                                                                <li>
                                                                    <a 
                                                                        onClick={() => handleStatusChange(loan._id, 'approved')}
                                                                        className="text-success"
                                                                    >
                                                                        Approve
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a 
                                                                        onClick={() => handleStatusChange(loan._id, 'cancelled')}
                                                                        className="text-error"
                                                                    >
                                                                        Cancel
                                                                    </a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No actions</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Summary Card */}
            {sortedLoans.length > 0 && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Loan Applications Summary</h2>
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
                        
                        {/* Total Loan Amount Summary */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div className="stat">
                                <div className="stat-title">Pending Amount</div>
                                <div className="stat-value text-lg text-warning">
                                    {formatCurrency(sortedLoans.filter(loan => loan.status === 'pending').reduce((sum, loan) => sum + loan.loanAmount, 0))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanList;