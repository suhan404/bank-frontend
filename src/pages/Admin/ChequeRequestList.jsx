import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const ChequeRequestList = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Fetch all cheque book requests
    const { data: requests = [], isLoading, error } = useQuery({
        queryKey: ['allChequeRequests'],
        queryFn: async () => {
            const response = await axiosSecure.get('/chequebooks/all-requests');
            return response?.data || [];
        },
    });
    
    // Sort requests by most recent date
    const sortedRequests = [...requests].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Sort in descending order (newest first)
    });
    
    // Update request status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const response = await axiosSecure.patch(`/chequebook-status/${id}`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allChequeRequests']);
            Swal.fire({
                title: 'Success!',
                text: 'Cheque book request status updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update request status',
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
    
    // Handle status change
    const handleStatusChange = (requestId, newStatus) => {
        const request = sortedRequests.find(req => req._id === requestId);
        
        const statusText = {
            'processing': 'process',
            'approved': 'approve',
            'cancelled': 'cancel'
        }[newStatus];
        
        const statusTitle = {
            'processing': 'Process Request',
            'approved': 'Approve Request',
            'cancelled': 'Cancel Request'
        }[newStatus];
        
        const statusMessage = {
            'processing': `Are you sure you want to mark this request as processing?`,
            'approved': `Are you sure you want to approve this cheque book request for ${request.numPages} pages?`,
            'cancelled': 'Are you sure you want to cancel this cheque book request?'
        }[newStatus];
        
        // Show confirmation dialog
        Swal.fire({
            title: statusTitle,
            text: statusMessage,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: {
                'processing': '#3b82f6',
                'approved': '#10b981',
                'cancelled': '#ef4444'
            }[newStatus],
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${statusText} it!`
        }).then((result) => {
            if (result.isConfirmed) {
                updateStatusMutation.mutate({ id: requestId, status: newStatus });
            }
        });
    };
    
    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'processing':
                return 'badge-info';
            case 'approved':
                return 'badge-success';
            case 'cancelled':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    };
    
    // Get account type badge color
    const getAccountTypeBadgeClass = (accountType) => {
        switch (accountType) {
            case 'savings':
                return 'badge-primary';
            case 'current':
                return 'badge-secondary';
            case 'business':
                return 'badge-accent';
            default:
                return 'badge-ghost';
        }
    };
    
    // View request details
    const viewRequestDetails = (request) => {
        const detailsHtml = `
            <div class="text-left">
                <p><strong>Account Number:</strong> ${request.accountNumber}</p>
                <p><strong>Name:</strong> ${request.name}</p>
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Account Type:</strong> ${request.accountType}</p>
                <p><strong>Number of Pages:</strong> ${request.numPages}</p>
                <p><strong>Request Date:</strong> ${formatDateTime(request.requestDate)}</p>
                <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(request.status)}">${request.status}</span></p>
                <p><strong>Reason:</strong> ${request.reason}</p>
                ${request.updatedAt ? `<p><strong>Last Updated:</strong> ${formatDateTime(request.updatedAt)}</p>` : ''}
            </div>
        `;
        
        Swal.fire({
            title: 'Cheque Book Request Details',
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
                <span>Error loading cheque book requests: {error.message}</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Cheque Book Requests</h1>
            
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">All Cheque Book Requests</h2>
                    
                    {sortedRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No cheque book requests found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Request Date</th>
                                        <th>Account Number</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Account Type</th>
                                        <th>Pages</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRequests.map((request) => (
                                        <tr key={request._id}>
                                            <td>{formatDateTime(request.requestDate)}</td>
                                            <td>{request.accountNumber}</td>
                                            <td>{request.name}</td>
                                            <td>{request.email}</td>
                                            <td>
                                                <span className={`badge ${getAccountTypeBadgeClass(request.accountType)}`}>
                                                    {request.accountType}
                                                </span>
                                            </td>
                                            <td>{request.numPages}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {/* View Details Button */}
                                                    <button
                                                        className="btn btn-sm btn-outline btn-info"
                                                        onClick={() => viewRequestDetails(request)}
                                                    >
                                                        View
                                                    </button>
                                                    
                                                    {/* Status Dropdown for pending and processing requests */}
                                                    {(request.status === 'pending' || request.status === 'processing') ? (
                                                        <div className="dropdown dropdown-left">
                                                            <label tabIndex={0} className="btn btn-sm btn-outline">
                                                                Change Status
                                                            </label>
                                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36">
                                                                {request.status === 'pending' && (
                                                                    <li>
                                                                        <a 
                                                                            onClick={() => handleStatusChange(request._id, 'processing')}
                                                                            className="text-info"
                                                                        >
                                                                            Processing
                                                                        </a>
                                                                    </li>
                                                                )}
                                                                <li>
                                                                    <a 
                                                                        onClick={() => handleStatusChange(request._id, 'approved')}
                                                                        className="text-success"
                                                                    >
                                                                        Approve
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a 
                                                                        onClick={() => handleStatusChange(request._id, 'cancelled')}
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
            {sortedRequests.length > 0 && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Request Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="stat">
                                <div className="stat-title">Total Requests</div>
                                <div className="stat-value text-primary">
                                    {sortedRequests.length}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Pending</div>
                                <div className="stat-value text-warning">
                                    {sortedRequests.filter(req => req.status === 'pending').length}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Processing</div>
                                <div className="stat-value text-info">
                                    {sortedRequests.filter(req => req.status === 'processing').length}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Approved</div>
                                <div className="stat-value text-success">
                                    {sortedRequests.filter(req => req.status === 'approved').length}
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional Stats */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="stat">
                                <div className="stat-title">Cancelled</div>
                                <div className="stat-value text-error">
                                    {sortedRequests.filter(req => req.status === 'cancelled').length}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Total Pages Requested</div>
                                <div className="stat-value text-lg">
                                    {sortedRequests.reduce((sum, req) => sum + req.numPages, 0)}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Avg Pages per Request</div>
                                <div className="stat-value text-lg">
                                    {sortedRequests.length > 0 
                                        ? Math.round(sortedRequests.reduce((sum, req) => sum + req.numPages, 0) / sortedRequests.length)
                                        : 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChequeRequestList;