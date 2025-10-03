import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const ChequeBook = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Form state
    const [accountType, setAccountType] = useState('');
    const [numPages, setNumPages] = useState('50');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    // Fetch user's account data
    const { data: accountData, isLoading: accountLoading } = useQuery({
        queryKey: ['accountData', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const response = await axiosSecure.get(`/accounts/getaccount/${user?.email}`);
            return response?.data;
        },
        enabled: !!user?.email,
    });
    
    // Check if user already has a pending chequebook request
    const { data: existingRequest, isLoading: requestLoading } = useQuery({
        queryKey: ['chequebookRequest', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            // This endpoint might need to be created on the backend
            // For now, we'll assume it exists or handle the error gracefully
            try {
                const response = await axiosSecure.get(`/chequebook/user-request/${user?.email}`);
                return response?.data;
            } catch (error) {
                // If endpoint doesn't exist, return null (no pending request found)
                return null;
            }
        },
        enabled: !!user?.email,
    });
    
    // Request chequebook mutation
    const requestChequebookMutation = useMutation({
        mutationFn: async (requestData) => {
            const response = await axiosSecure.post('/request-chequebook', requestData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['chequebookRequest', user?.email]);
            Swal.fire({
                title: 'Request Submitted!',
                html: `
                    <div class="text-left">
                        <p>Your chequebook request has been submitted successfully.</p>
                        <p class="mt-2"><strong>Processing Time:</strong> 6-7 business days</p>
                        <p class="mt-2">You will be notified when your chequebook is ready for collection.</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            resetForm();
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to submit chequebook request',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!accountType) {
            newErrors.accountType = 'Please select an account type';
        }
        
        if (!numPages || parseInt(numPages) <= 0) {
            newErrors.numPages = 'Please select number of pages';
        }
        
        if (!reason || reason.trim().length < 10) {
            newErrors.reason = 'Please provide a reason (minimum 10 characters)';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Reset form
    const resetForm = () => {
        setAccountType('');
        setNumPages('50');
        setReason('');
        setShowConfirmation(false);
        setErrors({});
    };
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setShowConfirmation(true);
        }
    };
    
    // Confirm request
    const confirmRequest = () => {
        const requestData = {
            accountNumber: accountData?.accountNumber,
            email: user?.email,
            name: user?.displayName || accountData?.name,
            accountType,
            numPages: parseInt(numPages),
            reason,
            requestDate: new Date().toISOString()
        };
        
        requestChequebookMutation.mutate(requestData);
    };
    
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
    
    if (accountLoading || requestLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }
    
    // Check if user has a pending request
    if (existingRequest && existingRequest.status === 'pending') {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Cheque Book Request</h1>
                
                <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">Request Already Pending</h3>
                        <div className="text-sm">
                            <p>You already have a pending chequebook request.</p>
                            <p className="mt-1"><strong>Request Date:</strong> {formatDateTime(existingRequest.createdAt)}</p>
                            <p><strong>Expected Delivery:</strong> 6-7 business days from request date</p>
                            <p className="mt-2">Please wait for the current request to be processed before submitting a new one.</p>
                        </div>
                    </div>
                </div>
                
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Current Request Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium">Account Number:</span>
                                <p>{existingRequest.accountNumber}</p>
                            </div>
                            <div>
                                <span className="font-medium">Account Type:</span>
                                <p>{existingRequest.accountType}</p>
                            </div>
                            <div>
                                <span className="font-medium">Number of Pages:</span>
                                <p>{existingRequest.numPages}</p>
                            </div>
                            <div>
                                <span className="font-medium">Status:</span>
                                <p><span className="badge badge-warning">{existingRequest.status}</span></p>
                            </div>
                            <div className="md:col-span-2">
                                <span className="font-medium">Reason:</span>
                                <p>{existingRequest.reason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Request Cheque Book</h1>
            
            {/* Account Info */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Your Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Account Number:</span>
                            <span>{accountData?.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Account Type:</span>
                            <span>{accountData?.accountType || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Current Balance:</span>
                            <span className="text-success font-bold">TK {accountData?.deposit?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{user?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Processing Information */}
            <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h3 className="font-bold">Processing Information</h3>
                    <div className="text-sm">
                        <p>Chequebook requests typically take <strong>6-7 business days</strong> to process.</p>
                        <p>You will be notified via email when your chequebook is ready for collection.</p>
                    </div>
                </div>
            </div>
            
            {/* Cheque Book Request Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Cheque Book Request Form</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Account Type */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Account Type</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.accountType ? 'select-error' : ''}`}
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                            >
                                <option value="">Select account type</option>
                                <option value="savings">Savings Account</option>
                                <option value="current">Current Account</option>
                                <option value="business">Business Account</option>
                            </select>
                            {errors.accountType && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.accountType}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Number of Pages */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Number of Pages</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.numPages ? 'select-error' : ''}`}
                                value={numPages}
                                onChange={(e) => setNumPages(e.target.value)}
                            >
                                <option value="25">25 Pages</option>
                                <option value="50">50 Pages</option>
                                <option value="100">100 Pages</option>
                            </select>
                            {errors.numPages && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.numPages}</span>
                                </label>
                            )}
                            <label className="label">
                                <span className="label-text-alt">Each page contains 1 cheque leaf</span>
                            </label>
                        </div>
                        
                        {/* Reason */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Reason for Request</span>
                            </label>
                            <textarea
                                className={`textarea textarea-bordered ${errors.reason ? 'textarea-error' : ''}`}
                                placeholder="Please explain why you need a chequebook"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows="4"
                            ></textarea>
                            {errors.reason && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.reason}</span>
                                </label>
                            )}
                            <label className="label">
                                <span className="label-text-alt">Minimum 10 characters required</span>
                            </label>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="form-control">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={requestChequebookMutation.isPending}
                            >
                                {requestChequebookMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirm Cheque Book Request</h3>
                        <div className="py-4 space-y-2">
                            <p><strong>Account Number:</strong> {accountData?.accountNumber}</p>
                            <p><strong>Account Type:</strong> {accountType}</p>
                            <p><strong>Number of Pages:</strong> {numPages}</p>
                            <p><strong>Reason:</strong> {reason}</p>
                            <p className="mt-4 text-info">
                                <strong>Note:</strong> Processing will take 6-7 business days
                            </p>
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmRequest}
                                disabled={requestChequebookMutation.isPending}
                            >
                                {requestChequebookMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Request'
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowConfirmation(false)}></div>
                </div>
            )}
        </div>
    );
};

export default ChequeBook;