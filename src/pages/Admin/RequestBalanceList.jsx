import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const RequestBalanceList = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Fetch all money requests
    const { data: requests = [], isLoading, error } = useQuery({
        queryKey: ['allMoneyRequests'],
        queryFn: async () => {
            const response = await axiosSecure.get('/all-request-money');
            return response?.data || [];
        },
    });
    
    // Sort requests by most recent date (using updatedAt if available, otherwise createdAt)
    const sortedRequests = [...requests].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // Sort in descending order (newest first)
    });
    
    // Update request status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const response = await axiosSecure.patch(`/request-money-status/${id}`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allMoneyRequests']);
            Swal.fire({
                title: 'Success!',
                text: 'Request status updated successfully',
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
    
    // Deposit money mutation
    const depositMoneyMutation = useMutation({
        mutationFn: async (depositData) => {
            console.log("depositData", depositData);
            const response = await axiosSecure.post('/transactions/deposit-money', depositData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allMoneyRequests']);
            Swal.fire({
                title: 'Success!',
                text: 'Money deposited and request approved successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to deposit money',
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
        if (newStatus === 'approved') {
            // Find the request details
            const request = sortedRequests.find(req => req._id === requestId);
            
            // Show confirmation dialog
            Swal.fire({
                title: 'Approve Request',
                text: `Are you sure you want to approve this request for TK ${request.amount}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, approve it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // First update the status
                    updateStatusMutation.mutate(
                        { id: requestId, status: 'approved' },
                        {
                            onSuccess: () => {
                                // Then deposit the money
                                const depositData = {
                                    accountNumber: request.accountNumber,
                                    email: request.email,
                                    name: request.name,
                                    amount: request.amount,
                                    description: request.description,
                                    type: 'deposit',
                                    createdAt: new Date()
                                };
                                
                                depositMoneyMutation.mutate(depositData);
                            }
                        }
                    );
                }
            });
        } else if (newStatus === 'cancelled') {
            // Show confirmation dialog
            Swal.fire({
                title: 'Cancel Request',
                text: 'Are you sure you want to cancel this request?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, cancel it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    updateStatusMutation.mutate({ id: requestId, status: 'cancelled' });
                }
            });
        }
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
                <span>Error loading money requests: {error.message}</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Money Requests</h1>
            
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">All Money Requests</h2>
                    
                    {sortedRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No money requests found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Account Number</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Account Type</th>
                                        <th>Amount</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRequests.map((request) => (
                                        <tr key={request._id}>
                                            <td>{formatDateTime(request.createdAt)}</td>
                                            <td>{request.accountNumber}</td>
                                            <td>{request.name}</td>
                                            <td>{request.email}</td>
                                            <td>{request.accountType}</td>
                                            <td className="font-bold">TK {request.amount.toFixed(2)}</td>
                                            <td>{request.description || '-'}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>
                                                {request.status === 'pending' ? (
                                                    <div className="dropdown dropdown-left">
                                                        <label tabIndex={0} className="btn btn-sm btn-outline">
                                                            Change Status
                                                        </label>
                                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
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
                                                    <span className="text-gray-400">No actions</span>
                                                )}
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
                                <div className="stat-title">Approved</div>
                                <div className="stat-value text-success">
                                    {sortedRequests.filter(req => req.status === 'approved').length}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Cancelled</div>
                                <div className="stat-value text-error">
                                    {sortedRequests.filter(req => req.status === 'cancelled').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestBalanceList;