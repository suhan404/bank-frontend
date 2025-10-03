import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const AdminHome = () => {
    const axiosSecure = useAxiosSecure();
    
    // Fetch all transactions
    const { data: transactions = [], isLoading, error } = useQuery({
        queryKey: ['allTransactions'],
        queryFn: async () => {
            const response = await axiosSecure.get('/transactions/all-transactions');
            return response?.data || [];
        },
    });
    
    // Format date for charts
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    // Format date and time for table
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
    
    // Calculate statistics
    const calculateStats = () => {
        const totalTransactions = transactions.length;
        const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        const transactionTypes = {
            'send-money': 0,
            'withdraw': 0,
            'deposit': 0
        };
        
        const typeAmounts = {
            'send-money': 0,
            'withdraw': 0,
            'deposit': 0
        };
        
        transactions.forEach(transaction => {
            const type = transaction.transactionType || transaction.type || 'other';
            if (transactionTypes[type] !== undefined) {
                transactionTypes[type]++;
                typeAmounts[type] += transaction.amount;
            }
        });
        
        return {
            totalTransactions,
            totalAmount,
            transactionTypes,
            typeAmounts
        };
    };
    
    const stats = calculateStats();
    
    // Prepare data for line chart (transactions over time)
    const prepareLineChartData = () => {
        // Group transactions by date
        const transactionsByDate = {};
        
        transactions.forEach(transaction => {
            const date = formatDate(transaction.createdAt);
            if (!transactionsByDate[date]) {
                transactionsByDate[date] = {
                    count: 0,
                    amount: 0
                };
            }
            transactionsByDate[date].count++;
            transactionsByDate[date].amount += transaction.amount;
        });
        
        // Sort dates
        const sortedDates = Object.keys(transactionsByDate).sort((a, b) => {
            return new Date(a) - new Date(b);
        });
        
        // Take only last 7 days for better visualization
        const last7Days = sortedDates.slice(-7);
        
        return {
            labels: last7Days,
            datasets: [
                {
                    label: 'Transaction Count',
                    data: last7Days.map(date => transactionsByDate[date].count),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y',
                },
                {
                    label: 'Total Amount (TK)',
                    data: last7Days.map(date => transactionsByDate[date].amount),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y1',
                }
            ]
        };
    };
    
    // Prepare data for pie chart (transaction types)
    const preparePieChartData = () => {
        return {
            labels: ['Send Money', 'Withdraw', 'Deposit'],
            datasets: [
                {
                    data: [
                        stats.transactionTypes['send-money'],
                        stats.transactionTypes['withdraw'],
                        stats.transactionTypes['deposit']
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1,
                }
            ]
        };
    };
    
    // Prepare data for bar chart (amount by transaction type)
    const prepareBarChartData = () => {
        return {
            labels: ['Send Money', 'Withdraw', 'Deposit'],
            datasets: [
                {
                    label: 'Total Amount (TK)',
                    data: [
                        stats.typeAmounts['send-money'],
                        stats.typeAmounts['withdraw'],
                        stats.typeAmounts['deposit']
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1,
                }
            ]
        };
    };
    
    // Get top 5 transactions by amount
    const getTopTransactions = () => {
        return [...transactions]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };
    
    // Get recent transactions (last 5)
    const getRecentTransactions = () => {
        return [...transactions]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    };
    
    // Chart options
    const lineChartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Transaction Count'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Amount (TK)'
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };
    
    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Transaction Distribution by Type'
            }
        }
    };
    
    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Total Amount by Transaction Type'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount (TK)'
                }
            }
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
                <span>Error loading transaction data: {error.message}</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="stat-title">Total Transactions</div>
                    <div className="stat-value text-primary">{stats.totalTransactions}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    </div>
                    <div className="stat-title">Total Amount</div>
                    <div className="stat-value text-secondary">TK {stats.totalAmount.toFixed(2)}</div>
                </div>
                
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                    <div className="stat-figure text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div className="stat-title">Avg Transaction</div>
                    <div className="stat-value text-accent">
                        TK {stats.totalTransactions > 0 ? (stats.totalAmount / stats.totalTransactions).toFixed(2) : '0.00'}
                    </div>
                </div>
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Transaction Trends</h2>
                        <div className="h-64">
                            <Line data={prepareLineChartData()} options={lineChartOptions} />
                        </div>
                    </div>
                </div>
                
                {/* Pie Chart */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Transaction Types</h2>
                        <div className="h-64">
                            <Pie data={preparePieChartData()} options={pieChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bar Chart */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Amount by Transaction Type</h2>
                    <div className="h-64">
                        <Bar data={prepareBarChartData()} options={barChartOptions} />
                    </div>
                </div>
            </div>
            
            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Transactions */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Top 5 Transactions by Amount</h2>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getTopTransactions().map((transaction) => (
                                        <tr key={transaction._id}>
                                            <td className="font-bold">TK {transaction.amount.toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    transaction.transactionType === 'send-money' || transaction.type === 'send-money' ? 'badge-info' :
                                                    transaction.transactionType === 'withdraw' || transaction.type === 'withdraw' ? 'badge-warning' :
                                                    'badge-success'
                                                }`}>
                                                    {transaction.transactionType || transaction.type || 'other'}
                                                </span>
                                            </td>
                                            <td>{formatDate(transaction.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Recent Transactions */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Recent Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getRecentTransactions().map((transaction) => (
                                        <tr key={transaction._id}>
                                            <td>{formatDateTime(transaction.createdAt)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    transaction.transactionType === 'send-money' || transaction.type === 'send-money' ? 'badge-info' :
                                                    transaction.transactionType === 'withdraw' || transaction.type === 'withdraw' ? 'badge-warning' :
                                                    'badge-success'
                                                }`}>
                                                    {transaction.transactionType || transaction.type || 'other'}
                                                </span>
                                            </td>
                                            <td className="font-bold">TK {transaction.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;