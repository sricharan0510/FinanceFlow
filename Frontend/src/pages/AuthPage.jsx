import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google'; 
import { apiService } from '../services/apiService';

// Icons
const GoogleIcon = () => ( <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.92C34.553 6.08 29.623 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691c-1.229 2.193-1.994 4.702-1.994 7.309s.765 5.116 1.994 7.309l-5.343 4.14C.646 29.84 0 27.023 0 24s.646-5.84 1.963-8.449l5.343 4.14z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.343-4.14C29.841 36.666 27.023 38 24 38c-5.213 0-9.64-3.337-11.303-7.918l-5.343 4.14C9.14 39.023 15.999 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.343 4.14C40.945 34.622 44 29.863 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg> );
const Logo = () => ( <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8l3 5m0 0l3-5m-3 5v4m0-4H6m6 0h6M6 8a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4zm-6 12a2 2 0 100-4 2 2 0 000 4z"></path></svg> );

export default function AuthPage({ onLoginSuccess }) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const { credential } = credentialResponse;
            const data = await apiService.googleLogin(credential);
            onLoginSuccess(data);
        } catch (err) {
            setError(err.message || 'Google login failed.');
            setLoading(false);
        }
    };

    const handleGoogleLoginError = () => {
        setError('Google login failed. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = isLoginView ? await apiService.login(email, password) : await apiService.register(name, email, password);
            onLoginSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl flex overflow-hidden">
                <div className="w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-white hidden md:flex flex-col justify-center items-center text-center">
                    <Logo />
                    <h1 className="text-4xl font-bold mt-4">FinanceFlow</h1>
                    <p className="mt-4 text-indigo-100">Take control of your finances.</p>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{isLoginView ? 'Welcome Back!' : 'Create Account'}</h2>
                    <form onSubmit={handleSubmit}>
                        {!isLoginView && ( <div className="mb-4"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label><input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div> )}
                        <div className="mb-4"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label><input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div className="mb-6"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label><input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition-all duration-300 disabled:opacity-50" type="submit" disabled={loading}>{loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}</button>
                        <div className="my-6 flex items-center"><div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span><div className="flex-grow border-t border-gray-300"></div></div>
                        
                        <div className="flex justify-center">
                           <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginError}
                                useOneTap
                            />
                        </div>

                    </form>
                    <p className="text-center text-gray-500 text-sm mt-8">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-bold text-indigo-600 hover:text-indigo-800 ml-2">
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
