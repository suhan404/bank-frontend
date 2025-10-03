import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const AccountBalance = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Form states
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    // Fetch user's account data
    const { data: accountData, isLoading } = useQuery({
        queryKey: ['accountData', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const response = await axiosSecure.get(`/accounts/getaccount/${user?.email}`);
            return response?.data;
        },
        enabled: !!user?.email,
    });
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (parseFloat(amount) < 100) {
            newErrors.amount = 'Minimum request amount is TK 100';
        } else if (parseFloat(amount) > 100000) {
            newErrors.amount = 'Maximum request amount is TK 100,000';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Request money mutation
    const requestMoneyMutation = useMutation({
        mutationFn: async (requestData) => {
            const response = await axiosSecure.post('/request-money', requestData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['accountData', user?.email]);
            Swal.fire({
                title: 'Success!',
                text: 'Money request sent to bank successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            resetForm();
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to send money request',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
    
    // Reset form
    const resetForm = () => {
        setAmount('');
        setDescription('');
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
            name: accountData?.name,
            accountType: accountData?.accountType,
            amount: parseFloat(amount),
            description,
            status: 'pending',
            createdAt: new Date()
        };
        
        requestMoneyMutation.mutate(requestData);
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Request Money from Bank</h1>
            
            {/* Your Account Info */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Your Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Account Number:</span>
                            <span>{accountData?.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Account Holder:</span>
                            <span>{accountData?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Available Balance:</span>
                            <span className="text-success font-bold">TK {accountData?.deposit?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Account Type:</span>
                            <span>{accountData?.accountType || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Request Money Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Request Money from Bank</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Submit a request to the bank for additional funds. The bank will review your request and process it accordingly.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Amount */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Request Amount (TK)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter amount to request"
                                className={`input input-bordered w-full ${errors.amount ? 'input-error' : ''}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="100"
                                max="100000"
                                step="0.01"
                            />
                            {errors.amount && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.amount}</span>
                                </label>
                            )}
                            <label className="label">
                                <span className="label-text-alt">Minimum request: TK 100, Maximum: TK 100,000</span>
                            </label>
                        </div>
                        
                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Reason for Request (Optional)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                placeholder="Please describe why you need this money"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="form-control">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={requestMoneyMutation.isPending}
                            >
                                {requestMoneyMutation.isPending ? (
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
                        <h3 className="font-bold text-lg">Confirm Money Request</h3>
                        <div className="py-4 space-y-2">
                            <p><strong>Account Number:</strong> {accountData?.accountNumber}</p>
                            <p><strong>Account Holder:</strong> {accountData?.name}</p>
                            <p><strong>Request Amount:</strong> TK {parseFloat(amount).toFixed(2)}</p>
                            {description && <p><strong>Reason:</strong> {description}</p>}
                            <p><strong>Status:</strong> Pending Bank Approval</p>
                            <div className="alert alert-info mt-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Your request will be reviewed by the bank. Processing time may vary.</span>
                            </div>
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
                                disabled={requestMoneyMutation.isPending}
                            >
                                {requestMoneyMutation.isPending ? (
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

export default AccountBalance;