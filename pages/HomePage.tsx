
import React from 'react';
import { SparklesIcon, FolderIcon, EnvelopeIcon, CalendarDaysIcon, CheckBadgeIcon, ArrowRightIcon, LockClosedIcon } from '../components/icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300">
            {icon}
        </div>
        <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

export const HomePage: React.FC = () => {
    // This is the backend endpoint that initiates the Google OAuth flow.
    // The request will be handled by the backend server.
    const loginUrl = '/api/auth/google/login';

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <header className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <SparklesIcon className="w-8 h-8 text-brand-600" />
                    <span className="ml-2 text-xl font-bold">Business Brain</span>
                </div>
                <a href={loginUrl} className="px-4 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-600 dark:border-brand-400 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors">
                    Log In
                </a>
            </header>

            <main>
                {/* Hero Section */}
                <section className="text-center py-20 px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
                        Your Personal <span className="text-brand-600">Business</span> Assistant
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                        Automate your administrative tasks, manage your entire workspace, and reclaim your focus. Business Brain is the AI-powered hub for your files, emails, and calendar.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <a href={loginUrl} className="flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            Login with Google <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </a>
                    </div>
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
