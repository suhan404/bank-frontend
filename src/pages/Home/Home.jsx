import React from 'react';
import { Link } from 'react-router';
import { FaMobileAlt, FaShieldAlt, FaChartLine, FaUsers, FaHandHoldingUsd, FaUniversity, FaClock, FaHeadset } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="container mx-auto px-4 py-24 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                Welcome to <span className="text-yellow-400">BanglaDigital Bank</span>
                            </h1>
                            <p className="text-xl mb-8 text-blue-100">
                                Experience the future of banking in Bangladesh. Secure, fast, and convenient digital banking solutions tailored for you.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/signup" className="btn btn-warning btn-lg text-blue-900 font-semibold">
                                    Get Started Now
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-blue-800">
                                    Login to Account
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-yellow-400" />
                                    <span>100% Secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-yellow-400" />
                                    <span>24/7 Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaUsers className="text-yellow-400" />
                                    <span>1M+ Users</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/20 rounded-lg p-4 text-center">
                                        <FaMobileAlt className="text-4xl mx-auto mb-2 text-yellow-400" />
                                        <p className="text-sm">Mobile Banking</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-4 text-center">
                                        <FaHandHoldingUsd className="text-4xl mx-auto mb-2 text-yellow-400" />
                                        <p className="text-sm">Easy Transfers</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-4 text-center">
                                        <FaChartLine className="text-4xl mx-auto mb-2 text-yellow-400" />
                                        <p className="text-sm">Track Expenses</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-4 text-center">
                                        <FaUniversity className="text-4xl mx-auto mb-2 text-yellow-400" />
                                        <p className="text-sm">Digital Savings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Why Choose BanglaDigital Bank?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            We're revolutionizing banking in Bangladesh with cutting-edge technology and customer-centric services.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaMobileAlt className="text-2xl text-blue-600" />
                                </div>
                                <h3 className="card-title text-xl mb-2">Mobile First</h3>
                                <p className="text-gray-600">Bank on the go with our user-friendly mobile app designed for Bangladeshis.</p>
                            </div>
                        </div>
                        <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaShieldAlt className="text-2xl text-green-600" />
                                </div>
                                <h3 className="card-title text-xl mb-2">Bank-Level Security</h3>
                                <p className="text-gray-600">Your money and data are protected with industry-leading security measures.</p>
                            </div>
                        </div>
                        <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaChartLine className="text-2xl text-purple-600" />
                                </div>
                                <h3 className="card-title text-xl mb-2">Smart Analytics</h3>
                                <p className="text-gray-600">Track your spending, set budgets, and achieve your financial goals.</p>
                            </div>
                        </div>
                        <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="card-body text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaHeadset className="text-2xl text-orange-600" />
                                </div>
                                <h3 className="card-title text-xl mb-2">24/7 Support</h3>
                                <p className="text-gray-600">Our dedicated support team is always here to help you in Bangla and English.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Our Digital Banking Services
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Comprehensive banking solutions designed for modern Bangladesh.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                    <FaUniversity className="text-xl text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold">Digital Savings Account</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Open a savings account in minutes with zero paperwork and competitive interest rates.</p>
                            <Link to="/accounts/create" className="text-blue-600 font-semibold hover:text-blue-800">
                                Open Account →
                            </Link>
                        </div>
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                    <FaHandHoldingUsd className="text-xl text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold">Instant Money Transfer</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Send money instantly to any bank account in Bangladesh with just a few taps.</p>
                            <Link to="/dashboard/user" className="text-blue-600 font-semibold hover:text-blue-800">
                                Send Money →
                            </Link>
                        </div>
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                    <FaChartLine className="text-xl text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold">Bill Payments</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Pay electricity, water, gas, and internet bills conveniently from your phone.</p>
                            <Link to="/dashboard/user" className="text-blue-600 font-semibold hover:text-blue-800">
                                Pay Bills →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Trusted by Millions Across Bangladesh
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400 mb-2">1M+</div>
                            <p className="text-blue-100">Active Users</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400 mb-2">৳500Cr+</div>
                            <p className="text-blue-100">Transactions Processed</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400 mb-2">64</div>
                            <p className="text-blue-100">Districts Covered</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400 mb-2">99.9%</div>
                            <p className="text-blue-100">Uptime</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Experience Digital Banking?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                        Join thousands of Bangladeshis who have already made the switch to smarter banking.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/signup" className="btn btn-warning btn-lg text-blue-900 font-semibold">
                            Create Your Free Account
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-blue-800">
                            Sign In to Existing Account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;