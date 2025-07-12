import React, { useState } from 'react';
import { SparklesIcon, FolderIcon, EnvelopeIcon, CalendarDaysIcon, CheckBadgeIcon, ArrowRightIcon, LockClosedIcon } from '@/components/icons';
import { api } from '@/services/api';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300">
            {icon}
        </div>
        <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

const MagicLinkForm: React.FC<{ isHeader?: boolean }> = ({ isHeader }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const response = await api.post('/api/auth/login', { email });
            if (response.message) {
                setMessage(response.message);
            } else {
                setError(response.error || 'An unknown error occurred.');
            }
        } catch (err) {
            setError('Failed to send login link.');
        } finally {
            setLoading(false);
        }
    };

    if (isHeader) {
        return (
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    required
                />
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-600 dark:border-brand-400 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors disabled:opacity-50">
                    {loading ? 'Sending...' : 'Log In'}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center">
            <div className="flex w-full max-w-md rounded-lg shadow-lg">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to log in or sign up"
                    className="flex-grow px-6 py-4 text-lg text-gray-800 dark:text-white bg-white dark:bg-gray-800 rounded-l-lg focus:outline-none"
                    required
                />
                <button type="submit" disabled={loading} className="flex-shrink-0 px-8 py-4 bg-brand-600 text-white font-bold rounded-r-lg hover:bg-brand-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
                    {loading ? 'Sending...' : <ArrowRightIcon className="w-6 h-6" />}
                </button>
            </div>
            {message && <p className="mt-4 text-green-600 dark:text-green-400">{message}</p>}
            {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
        </form>
    );
};


export const HomePage: React.FC = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <header className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <SparklesIcon className="w-8 h-8 text-brand-600" />
                    <span className="ml-2 text-xl font-bold">Business Brain</span>
                </div>
                <MagicLinkForm isHeader />
            </header>

            <main>
                {/* Hero Section */}
                <section className="text-center py-20 px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
                        Your Personal <span className="text-brand-600">Business</span> Assistant
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                  Business Brain is your all-in-one productivity suite, combining a powerful
                  AI chat assistant with a full-featured email client, file directory, and more.
                  It&apos;s designed to be the central hub for your workflow.
                </p>
                    <MagicLinkForm />
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-gray-800">
                    <div className="container mx-auto px-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">A Central Hub for Your Entire Business</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                                Stop juggling tabs. Business Brain brings everything together in one intelligent interface.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard icon={<FolderIcon className="w-6 h-6" />} title="Unified File Management" description="Organize, edit, and query your documents and spreadsheets with natural language." />
                            <FeatureCard icon={<EnvelopeIcon className="w-6 h-6" />} title="Intelligent Email Assistant" description="Summarize threads, draft replies, and find important emails in seconds." />
                            <FeatureCard icon={<CalendarDaysIcon className="w-6 h-6" />} title="Smart Calendar Scheduling" description="Ask your assistant to create events, find open slots, and manage your day." />
                            <FeatureCard icon={<LockClosedIcon className="w-6 h-6" />} title="Secure & Private" description="Your data is your own. Granular controls let you decide exactly what the AI can see and do." />
                            <FeatureCard icon={<SparklesIcon className="w-6 h-6" />} title="Powered by Gemini" description="Leverage Google's state-of-the-art AI for powerful analysis and generation." />
                            <FeatureCard icon={<CheckBadgeIcon className="w-6 h-6" />} title="Task Automation" description="Turn repetitive workflows into simple commands and let your assistant do the heavy lifting." />
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-20 px-6">
                    <div className="container mx-auto text-center">
                         <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loved by Freelancers and Teams</h2>
                         <div className="mt-10 max-w-3xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                                <p className="text-lg text-gray-700 dark:text-gray-200">"Business Brain has saved me at least 5 hours a week. Instead of searching through Drive and my inbox, I just ask. It's a complete game-changer for my productivity."</p>
                                <div className="mt-6 flex items-center justify-center">
                                    <img className="w-12 h-12 rounded-full" src="https://picsum.photos/seed/test1/100/100" alt="User testimonial avatar"/>
                                    <div className="ml-4 text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white">Alex Johnson</p>
                                        <p className="text-gray-600 dark:text-gray-400">Freelance Designer</p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </section>
            </main>
            
            <footer className="container mx-auto px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} Business Brain. All rights reserved.</p>
            </footer>
        </div>
    );
};