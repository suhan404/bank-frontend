import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const ApplyLoan = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // Form states
    const [loanType, setLoanType] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [loanTerm, setLoanTerm] = useState('');
    const [purpose, setPurpose] = useState('');
    const [employmentStatus, setEmploymentStatus] = useState('');
    const [annualIncome, setAnnualIncome] = useState('');
    const [existingLoans, setExistingLoans] = useState('');
    const [collateral, setCollateral] = useState('');
    const [collateralValue, setCollateralValue] = useState('');
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
        
        if (!loanType) {
            newErrors.loanType = 'Please select a loan type';
        }
        
        if (!loanAmount || parseFloat(loanAmount) <= 0) {
            newErrors.loanAmount = 'Please enter a valid loan amount';
        } else if (parseFloat(loanAmount) < 10000) {
            newErrors.loanAmount = 'Minimum loan amount is TK 10,000';
        } else if (parseFloat(loanAmount) > 5000000) {
            newErrors.loanAmount = 'Maximum loan amount is TK 50,00,000';
        }
        
        if (!loanTerm || parseInt(loanTerm) <= 0) {
            newErrors.loanTerm = 'Please select a loan term';
        }
        
        if (!purpose) {
            newErrors.purpose = 'Please specify the purpose of the loan';
        }
        
        if (!employmentStatus) {
            newErrors.employmentStatus = 'Please select your employment status';
        }
        
        if (!annualIncome || parseFloat(annualIncome) <= 0) {
            newErrors.annualIncome = 'Please enter your annual income';
        }
        
        if (existingLoans === '') {
            newErrors.existingLoans = 'Please specify if you have existing loans';
        }
        
        if (collateral === 'yes' && (!collateralValue || parseFloat(collateralValue) <= 0)) {
            newErrors.collateralValue = 'Please enter the collateral value';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Apply loan mutation
    const applyLoanMutation = useMutation({
        mutationFn: async (loanData) => {
            const response = await axiosSecure.post('/apply-loan', loanData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['loanApplications', user?.email]);
            Swal.fire({
                title: 'Application Submitted!',
                text: 'Your loan application has been submitted successfully. It is now under review.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            resetForm();
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to submit loan application',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
    
    // Reset form
    const resetForm = () => {
        setLoanType('');
        setLoanAmount('');
        setLoanTerm('');
        setPurpose('');
        setEmploymentStatus('');
        setAnnualIncome('');
        setExistingLoans('');
        setCollateral('');
        setCollateralValue('');
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
    
    // Confirm loan application
    const confirmApplication = () => {
        const loanData = {
            accountNumber: accountData?.accountNumber,
            email: user?.email,
            name: user?.displayName || accountData?.name,
            loanType,
            loanAmount: parseFloat(loanAmount),
            loanTerm: parseInt(loanTerm),
            purpose,
            employmentStatus,
            annualIncome: parseFloat(annualIncome),
            existingLoans: existingLoans === 'yes',
            collateral: collateral === 'yes',
            collateralValue: collateral === 'yes' ? parseFloat(collateralValue) : 0,
            description,
            applicationDate: new Date().toISOString()
        };
        
        applyLoanMutation.mutate(loanData);
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
            <h1 className="text-3xl font-bold">Apply for a Loan</h1>
            
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
            
            {/* Loan Application Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Loan Application Details</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Loan Type */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Loan Type</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.loanType ? 'select-error' : ''}`}
                                value={loanType}
                                onChange={(e) => setLoanType(e.target.value)}
                            >
                                <option value="">Select loan type</option>
                                <option value="personal">Personal Loan</option>
                                <option value="home">Home Loan</option>
                                <option value="business">Business Loan</option>
                                <option value="education">Education Loan</option>
                                <option value="car">Car Loan</option>
                            </select>
                            {errors.loanType && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.loanType}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Loan Amount */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Loan Amount (TK)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter loan amount"
                                className={`input input-bordered w-full ${errors.loanAmount ? 'input-error' : ''}`}
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                min="10000"
                                max="5000000"
                                step="1000"
                            />
                            {errors.loanAmount && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.loanAmount}</span>
                                </label>
                            )}
                            <label className="label">
                                <span className="label-text-alt">Range: TK 10,000 - TK 50,00,000</span>
                            </label>
                        </div>
                        
                        {/* Loan Term */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Loan Term (Months)</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.loanTerm ? 'select-error' : ''}`}
                                value={loanTerm}
                                onChange={(e) => setLoanTerm(e.target.value)}
                            >
                                <option value="">Select loan term</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                                <option value="24">24 Months</option>
                                <option value="36">36 Months</option>
                                <option value="48">48 Months</option>
                                <option value="60">60 Months</option>
                                <option value="120">120 Months</option>
                                <option value="180">180 Months</option>
                                <option value="240">240 Months</option>
                            </select>
                            {errors.loanTerm && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.loanTerm}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Purpose */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Purpose of Loan</span>
                            </label>
                            <textarea
                                className={`textarea textarea-bordered ${errors.purpose ? 'textarea-error' : ''}`}
                                placeholder="Describe the purpose of this loan"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                rows="3"
                            ></textarea>
                            {errors.purpose && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.purpose}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Employment Status */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Employment Status</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.employmentStatus ? 'select-error' : ''}`}
                                value={employmentStatus}
                                onChange={(e) => setEmploymentStatus(e.target.value)}
                            >
                                <option value="">Select employment status</option>
                                <option value="employed">Employed</option>
                                <option value="self-employed">Self-Employed</option>
                                <option value="business">Business Owner</option>
                                <option value="retired">Retired</option>
                                <option value="student">Student</option>
                                <option value="unemployed">Unemployed</option>
                            </select>
                            {errors.employmentStatus && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.employmentStatus}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Annual Income */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Annual Income (TK)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter your annual income"
                                className={`input input-bordered w-full ${errors.annualIncome ? 'input-error' : ''}`}
                                value={annualIncome}
                                onChange={(e) => setAnnualIncome(e.target.value)}
                                min="0"
                                step="1000"
                            />
                            {errors.annualIncome && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.annualIncome}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Existing Loans */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Do you have any existing loans?</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="cursor-pointer label">
                                    <input
                                        type="radio"
                                        name="existingLoans"
                                        className="radio radio-primary"
                                        value="yes"
                                        checked={existingLoans === 'yes'}
                                        onChange={(e) => setExistingLoans(e.target.value)}
                                    />
                                    <span className="label-text ml-2">Yes</span>
                                </label>
                                <label className="cursor-pointer label">
                                    <input
                                        type="radio"
                                        name="existingLoans"
                                        className="radio radio-primary"
                                        value="no"
                                        checked={existingLoans === 'no'}
                                        onChange={(e) => setExistingLoans(e.target.value)}
                                    />
                                    <span className="label-text ml-2">No</span>
                                </label>
                            </div>
                            {errors.existingLoans && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.existingLoans}</span>
                                </label>
                            )}
                        </div>
                        
                        {/* Collateral */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Do you have any collateral to offer?</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="cursor-pointer label">
                                    <input
                                        type="radio"
                                        name="collateral"
                                        className="radio radio-primary"
                                        value="yes"
                                        checked={collateral === 'yes'}
                                        onChange={(e) => setCollateral(e.target.value)}
                                    />
                                    <span className="label-text ml-2">Yes</span>
                                </label>
                                <label className="cursor-pointer label">
                                    <input
                                        type="radio"
                                        name="collateral"
                                        className="radio radio-primary"
                                        value="no"
                                        checked={collateral === 'no'}
                                        onChange={(e) => setCollateral(e.target.value)}
                                    />
                                    <span className="label-text ml-2">No</span>
                                </label>
                            </div>
                        </div>
                        
                        {/* Collateral Value */}
                        {collateral === 'yes' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Collateral Value (TK)</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter collateral value"
                                    className={`input input-bordered w-full ${errors.collateralValue ? 'input-error' : ''}`}
                                    value={collateralValue}
                                    onChange={(e) => setCollateralValue(e.target.value)}
                                    min="0"
                                    step="1000"
                                />
                                {errors.collateralValue && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.collateralValue}</span>
                                    </label>
                                )}
                            </div>
                        )}
                        
                        {/* Additional Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Additional Information (Optional)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                placeholder="Any additional information that may support your application"
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
                                disabled={applyLoanMutation.isPending}
                            >
                                {applyLoanMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Submit Application'
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
                        <h3 className="font-bold text-lg">Confirm Loan Application</h3>
                        <div className="py-4 space-y-2">
                            <p><strong>Account Number:</strong> {accountData?.accountNumber}</p>
                            <p><strong>Loan Type:</strong> {loanType}</p>
                            <p><strong>Loan Amount:</strong> TK {parseFloat(loanAmount).toLocaleString()}</p>
                            <p><strong>Loan Term:</strong> {loanTerm} months</p>
                            <p><strong>Purpose:</strong> {purpose}</p>
                            <p><strong>Employment Status:</strong> {employmentStatus}</p>
                            <p><strong>Annual Income:</strong> TK {parseFloat(annualIncome).toLocaleString()}</p>
                            <p><strong>Existing Loans:</strong> {existingLoans === 'yes' ? 'Yes' : 'No'}</p>
                            {collateral === 'yes' && (
                                <p><strong>Collateral Value:</strong> TK {parseFloat(collateralValue).toLocaleString()}</p>
                            )}
                            {description && <p><strong>Additional Info:</strong> {description}</p>}
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
                                onClick={confirmApplication}
                                disabled={applyLoanMutation.isPending}
                            >
                                {applyLoanMutation.isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Application'
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

export default ApplyLoan;