
import React from 'react';
import type { Plan } from '../../types';
import { PLAN_DETAILS } from '../../utils/initialData';
import { CheckBadgeIcon } from '../icons';

interface OnboardingFlowProps {
  onComplete: (plan: Plan) => void;
}

const PlanCard: React.FC<{plan: Plan, onSelect: () => void}> = ({ plan, onSelect }) => (
    <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col hover:border-brand-500 cursor-pointer transition-all duration-200" onClick={onSelect}>
        <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400">{plan.name}</h3>
        <div className="mt-3 flex items-baseline">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
            <span className="ml-1 text-lg font-medium text-gray-500 dark:text-gray-400">/mo</span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.tokens.toLocaleString()} tokens/month</p>
        <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-grow">
            {plan.features.map(feature => (
                <li key={feature} className="flex items-center">
                    <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button 
          className="mt-6 w-full py-2 px-4 text-sm font-semibold rounded-lg transition-colors bg-brand-600 text-white hover:bg-brand-700"
        >
            Choose Plan
        </button>
    </div>
);


export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome to Business Brain!</h1>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">To get started, please select a plan that fits your needs.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {PLAN_DETAILS.map(plan => (
                        <PlanCard key={plan.id} plan={plan} onSelect={() => onComplete(plan)} />
                    ))}
                </div>
            </div>
        </div>
    );
};
