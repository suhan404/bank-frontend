import React from 'react';
import { Outlet, useLocation } from 'react-router';
import NavBar from '../pages/Shared/NavBar/NavBar';

const Main = () => {
    const location = useLocation();
    console.log(location);
    const noHF = location.pathname.includes('login') || location.pathname.includes('signup');
    console.log(noHF);
    return (
        <div>
            {noHF ||<NavBar></NavBar>}
            <Outlet></Outlet>
            {/* {noHF ||<Footer></Footer>} */}
        </div>
    );
};

export default Main;