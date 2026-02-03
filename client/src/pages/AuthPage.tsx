import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Removed
import { authAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { FormInput } from '../components/auth/FormInput';
import { PasswordStrength } from '../components/auth/PasswordStrength';
import Footer from '../components/layout/Footer';
import { PiggyBank, TrendingUp, Target, Wallet } from 'lucide-react';

interface AuthPageProps {
    initialView?: 'login' | 'signup';
}

export default function AuthPage({ initialView = 'login' }: AuthPageProps) {
    const [view, setView] = useState<'login' | 'signup'>(initialView);
    const navigate = useNavigate();

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Signup state
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupError, setSignupError] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);

    // Validation errors
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Email validation
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Check if signup form is valid
    const isSignupValid = () => {
        return (
            signupName.trim() &&
            validateEmail(signupEmail) &&
            signupPassword.length >= 6 &&
            signupPassword === signupConfirmPassword
        );
    };

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const res = await authAPI.login(loginEmail, loginPassword);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err: any) {
            setLoginError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle signup
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');
        setEmailError('');
        setPasswordError('');

        // Validate email
        if (!validateEmail(signupEmail)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Validate password match
        if (signupPassword !== signupConfirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setSignupLoading(true);

        try {
            const res = await authAPI.signup(signupName, signupEmail, signupPassword);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err: any) {
            setSignupError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
            {/* Mobile View Toggle */}
            <div className="lg:hidden w-full max-w-md mb-4 absolute top-4">
                <div className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1">
                    <button
                        onClick={() => setView('login')}
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${view === 'login'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setView('signup')}
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${view === 'signup'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            {/* Two-Card Layout */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl mt-16 lg:mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LOGIN CARD */}
                        <Card
                            className={`backdrop-blur-md bg-white/80 shadow-xl rounded-2xl border border-white/20 transition-all duration-300 ${view === 'login' ? 'lg:scale-105' : 'lg:scale-100 hidden lg:block'
                                } ${view === 'signup' ? 'hidden lg:block' : ''}`}
                        >
                            <CardHeader className="space-y-4 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <PiggyBank className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                                        <p className="text-sm text-gray-600">Log in to access your finances</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        value={loginEmail}
                                        onChange={setLoginEmail}
                                        placeholder="you@example.com"
                                        required
                                    />

                                    <FormInput
                                        label="Password"
                                        type="password"
                                        value={loginPassword}
                                        onChange={setLoginPassword}
                                        placeholder="Enter your password"
                                        required
                                    />

                                    <div className="flex justify-end">
                                        <a href="#" className="text-sm text-blue-600 hover:underline">
                                            Forgot Password?
                                        </a>
                                    </div>

                                    {loginError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{loginError}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loginLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-medium transition-all hover:scale-105"
                                    >
                                        {loginLoading ? 'Logging in...' : 'Log In Securely'}
                                    </Button>

                                    <p className="text-center text-sm text-gray-600 mt-4">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setView('signup')}
                                            className="text-blue-600 font-medium hover:underline"
                                        >
                                            Sign up
                                        </button>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        {/* SIGNUP CARD */}
                        <Card
                            className={`backdrop-blur-md bg-white/80 shadow-xl rounded-2xl border border-white/20 transition-all duration-300 ${view === 'signup' ? 'lg:scale-105' : 'lg:scale-100 hidden lg:block'
                                } ${view === 'login' ? 'hidden lg:block' : ''}`}
                        >
                            <CardHeader className="space-y-4 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
                                    <p className="text-sm text-gray-600">Start your financial journey today</p>
                                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2" />
                                </div>

                                {/* Feature Highlights */}
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <p className="text-xs text-gray-600">Track your spending</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2">
                                            <Target className="h-5 w-5 text-green-600" />
                                        </div>
                                        <p className="text-xs text-gray-600">Set smart goals</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-2">
                                            <Wallet className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <p className="text-xs text-gray-600">Save effortlessly</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <FormInput
                                        label="Full Name"
                                        type="text"
                                        value={signupName}
                                        onChange={setSignupName}
                                        placeholder="John Doe"
                                        required
                                    />

                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        value={signupEmail}
                                        onChange={(value) => {
                                            setSignupEmail(value);
                                            if (emailError) setEmailError('');
                                        }}
                                        placeholder="you@example.com"
                                        error={emailError}
                                        required
                                    />

                                    <div>
                                        <FormInput
                                            label="Password"
                                            type="password"
                                            value={signupPassword}
                                            onChange={(value) => {
                                                setSignupPassword(value);
                                                if (passwordError) setPasswordError('');
                                            }}
                                            placeholder="Create a strong password"
                                            required
                                        />
                                        <PasswordStrength password={signupPassword} />
                                    </div>

                                    <FormInput
                                        label="Confirm Password"
                                        type="password"
                                        value={signupConfirmPassword}
                                        onChange={(value) => {
                                            setSignupConfirmPassword(value);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        placeholder="Re-enter your password"
                                        error={passwordError}
                                        required
                                    />

                                    {signupError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{signupError}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={!isSignupValid() || signupLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {signupLoading ? 'Creating account...' : 'Sign Up'}
                                    </Button>

                                    <p className="text-center text-sm text-gray-600 mt-4">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="text-blue-600 font-medium hover:underline"
                                        >
                                            Log in
                                        </button>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Copyright Footer */}
            <Footer />
        </div>
    );
}
