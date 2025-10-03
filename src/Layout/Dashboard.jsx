import React from 'react';
import { Outlet } from 'react-router';
import DashboardSidebar from './components/DashboardSidebar';

const Dashboard = () => {
    return (
        <div className="flex">
            <DashboardSidebar></DashboardSidebar>
            <div className="flex-1 p-6">
                <Outlet></Outlet>
            </div>
        </div>
    );
};

export default Dashboard;