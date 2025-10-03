import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const SendMoney = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Form states
    const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [recipientData, setRecipientData] = useState(null);
    
    // Fetch sender's account data
    const { data: senderAccountData, isLoading: senderLoading } = useQuery({
        queryKey: ['accountData', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const response = await axiosSecure.get(`/accounts/getaccount/${user?.email}`);
            return response?.data;
        },
        enabled: !!user?.email,
    });
    
    // Verify recipient account
    const verifyRecipientAccount = async () => {
        if (!recipientAccountNumber) {
            setErrors({ ...errors, recipientAccountNumber: 'Please enter recipient account number' });
            return;
        }
        
        if (recipientAccountNumber === senderAccountData?.accountNumber) {
            setErrors({ ...errors, recipientAccountNumber: 'Cannot send money to your own account' });
            return;
        }
        
        try {
            const response = await axiosSecure.get(`/accounts/getaccountbynumber/${recipientAccountNumber}`);
            console.log(response);
            if(response.data.status === 404){
              setErrors({ ...errors, recipientAccountNumber: 'Account not found' });
              setRecipientData(null);
            }else{
            setRecipientData(response.data);
            setErrors({ ...errors, recipientAccountNumber: '' });
            }
        } catch (error) {
            setErrors({ ...errors, recipientAccountNumber: 'Account not found' });
            setRecipientData(null);
        }
    };
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!recipientAccountNumber) {
            newErrors.recipientAccountNumber = 'Recipient account number is required';
        } else if (recipientAccountNumber === senderAccountData?.accountNumber) {
            newErrors.recipientAccountNumber = 'Cannot send money to your own account';
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (parseFloat(amount) > senderAccountData?.deposit) {
            newErrors.amount = 'Insufficient balance';
        }
        
        if (!recipientData) {
            newErrors.recipientAccountNumber = 'Please verify recipient account';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Send money mutation
    const sendMoneyMutation = useMutation({
        mutationFn: async (transactionData) => {
          console.log(transactionData);
            const response = await axiosSecure.post('/transactions/send-money', transactionData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['accountData', user?.email]);
            Swal.fire({
                title: 'Success!',
                text: 'Money sent successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            resetForm();
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to send money',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
    
    // Reset form
    const resetForm = () => {
        setRecipientAccountNumber('');
        setAmount('');
        setDescription('');
        setRecipientData(null);
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
            senderAccountNumber: senderAccountData?.accountNumber,
            recipientAccountNumber,
            amount: parseFloat(amount),
            description,
            senderEmail: user?.email,
            recipientEmail: recipientData?.email,
            transactionType: 'send-money'
        };
        
        sendMoneyMutation.mutate(transactionData);
    };
    
    if (senderLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Send Money</h1>
            
            {/* Sender Account Info */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Your Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Account Number:</span>
                            <span>{senderAccountData?.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Available Balance:</span>
                            <span className="text-success font-bold">TK {senderAccountData?.deposit?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Send Money Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Transfer Details</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Recipient Account Number */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Recipient Account Number</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter account number"
                                    className={`input input-bordered w-full ${errors.recipientAccountNumber ? 'input-error' : ''}`}
                                    value={recipientAccountNumber}
                                    onChange={(e) => setRecipientAccountNumber(e.target.value)}
                                    onBlur={verifyRecipientAccount}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={verifyRecipientAccount}
                                    disabled={!recipientAccountNumber}
                                >
                                    Verify
                                </button>
                            </div>
                            {errors.recipientAccountNumber && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.recipientAccountNumber}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Recipient Info (shown after verification) */}
                        {recipientData && (
                            <div className="alert alert-success">
                                <div>
                                    <h3 className="font-bold">Recipient Verified</h3>
                                    <div className="text-sm">
                                        <p>Name: {recipientData.name}</p>
                                        <p>Account Type: {recipientData.accountType}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
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
                                min="1"
                                max={senderAccountData?.deposit}
                            />
                            {errors.amount && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.amount}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Description (Optional)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                placeholder="Enter transaction description"
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
                                disabled={sendMoneyMutation.isPending}
                            >
                                {sendMoneyMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Send Money'
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
                        <h3 className="font-bold text-lg">Confirm Transaction</h3>
                        <div className="py-4 space-y-2">
                            <p><strong>From:</strong> {senderAccountData?.accountNumber}</p>
                            <p><strong>To:</strong> {recipientAccountNumber}</p>
                            <p><strong>Recipient Name:</strong> {recipientData?.name}</p>
                            <p><strong>Amount:</strong> TK {parseFloat(amount).toFixed(2)}</p>
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
                                disabled={sendMoneyMutation.isPending}
                            >
                                {sendMoneyMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm'
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

export default SendMoney;