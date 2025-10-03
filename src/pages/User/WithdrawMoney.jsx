import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const WithdrawMoney = () => {
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
        } else if (parseFloat(amount) > accountData?.deposit) {
            newErrors.amount = 'Insufficient balance';
        } else if (parseFloat(amount) < 500) {
            newErrors.amount = 'Minimum withdrawal amount is TK 500';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Withdraw money mutation
    const withdrawMoneyMutation = useMutation({
        mutationFn: async (transactionData) => {
            console.log("withdraw transactionData", transactionData);
            const response = await axiosSecure.post('/transactions/withdraw-money', transactionData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['accountData', user?.email]);
            Swal.fire({
                title: 'Success!',
                text: 'Money withdrawn successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            resetForm();
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to withdraw money',
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
    
    // Confirm transaction
    const confirmTransaction = () => {
        const transactionData = {
            accountNumber: accountData?.accountNumber,
            amount: parseFloat(amount),
            description,
            email: user?.email,
            transactionType: 'withdraw'
        };
        
        withdrawMoneyMutation.mutate(transactionData);
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
            <h1 className="text-3xl font-bold">Withdraw Money</h1>
            
            {/* Account Info */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Your Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Account Number:</span>
                            <span>{accountData?.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Available Balance:</span>
                            <span className="text-success font-bold">TK {accountData?.deposit?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Withdraw Money Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Withdrawal Details</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Amount */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Amount (TK)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                className={`input input-bordered w-full ${errors.amount ? 'input-error' : ''}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="500"
                                max={accountData?.deposit}
                                step="0.01"
                            />
                            {errors.amount && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.amount}</span>
                                </label>
                            )}
                            <label className="label">
                                <span className="label-text-alt">Minimum withdrawal: TK 500</span>
                            </label>
                        </div>
                        
                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Description (Optional)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                placeholder="Enter withdrawal description"
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
                                disabled={withdrawMoneyMutation.isPending}
                            >
                                {withdrawMoneyMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Withdraw Money'
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
                        <h3 className="font-bold text-lg">Confirm Withdrawal</h3>
                        <div className="py-4 space-y-2">
                            <p><strong>Account Number:</strong> {accountData?.accountNumber}</p>
                            <p><strong>Amount:</strong> TK {parseFloat(amount).toFixed(2)}</p>
                            <p><strong>New Balance:</strong> TK {(accountData?.deposit - parseFloat(amount)).toFixed(2)}</p>
                            {description && <p><strong>Description:</strong> {description}</p>}
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
                                onClick={confirmTransaction}
                                disabled={withdrawMoneyMutation.isPending}
                            >
                                {withdrawMoneyMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Withdrawal'
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

export default WithdrawMoney;