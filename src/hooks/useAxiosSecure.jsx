import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router';
import useAuth from './useAuth';

const axiosSecure = axios.create({
    baseURL: 'http://localhost:5000'
})

const useAxiosSecure = () => {
     const navigate = useNavigate();
    const {logOut} = useAuth()
    //interceptor for request
    axiosSecure.interceptors.request.use(function(config){
        const token = localStorage.getItem('access-token');
        console.log('request stopped by interceptor');
        config.headers.authorization= `Bearer ${token}`;
        return config;
    }, function (error){
        return Promise.reject(error);
    })

    //intercepts 401 and 403 handle/ response
    axiosSecure.interceptors.response.use(function(response){
        return response;
    }, async(error)=>{
        const status = error.response.status;
        console.log('status error in the inceptor', status);
        if(status === 401 || status ===403){
            await logOut();
            navigate('/login');
        }
        return Promise.reject(error);
    })

    return axiosSecure;
};

export default useAxiosSecure;