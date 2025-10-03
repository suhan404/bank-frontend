import React, { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useLocation, useNavigate } from 'react-router';

const Login = () => {
    // State to hold the input values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {signIn} = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    // handleLogin function to log data
    const handleLogin = (e) => {
        e.preventDefault(); // prevent form submission
        console.log({
            email,
            password,
        });

        signIn(email,password)
    .then(result =>{
      const user = result.user;
      console.log(user);
      navigate(from, {replace: true})
    })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-semibold text-center text-primary">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input input-bordered input-primary w-full mt-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input input-bordered input-primary w-full mt-2"
                        />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary w-full mt-4">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
