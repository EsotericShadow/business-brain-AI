import React from 'react';
import type { User, Plan, TokenPack } from '@shared/types';
import { PLAN_DETAILS, TOKEN_PACKS } from '@shared/utils/initialData';
import { CheckBadgeIcon, BoltIcon, XMarkIcon } from '@/components/icons';

interface PricingPageProps {
    user: User;
    onSelectPurchase: (item: Plan | TokenPack) => void;
    onClose: () => void;
}

const PlanCard: React.FC<{plan: Plan, currentPlanId: string, onSelect: (plan: Plan) => void}> = ({ plan, currentPlanId, onSelect }) => {
    const isCurrent = plan.id === currentPlanId;
    const isUpgrade = !isCurrent && PLAN_DETAILS.findIndex(p => p.id === plan.id) > PLAN_DETAILS.findIndex(p => p.id === currentPlanId);
    
    let buttonText = 'Subscribe';
    if (isCurrent) buttonText = 'Current Plan';
    else if (isUpgrade) buttonText = 'Upgrade';
    else if (plan.id !== 'free') buttonText = 'Downgrade';

    return (
        <div className={`p-6 rounded-lg border-2 flex flex-col ${isCurrent ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
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
              onClick={() => onSelect(plan)}
              disabled={isCurrent || plan.id === 'free'}
              className="mt-6 w-full py-2 px-4 text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 bg-brand-600 text-white hover:bg-brand-700"
            >
                {buttonText}
            </button>
        </div>
    );
};

const TokenPackCard: React.FC<{pack: TokenPack, onSelect: (pack: TokenPack) => void}> = ({pack, onSelect}) => (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{pack.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <BoltIcon className="w-4 h-4 text-yellow-500 mr-1"/>
                {pack.tokens.toLocaleString()} Tokens
            </p>
        </div>
        <button onClick={() => onSelect(pack)} className="py-2 px-4 text-sm font-semibold rounded-lg transition-colors bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:hover:bg-brand-900">
            ${pack.price}
        </button>
    </div>
);

export const PricingPage: React.FC<PricingPageProps> = ({ user, onSelectPurchase, onClose }) => {
    return (
        <div className="fixed inset-0 z-40 bg-gray-100 dark:bg-gray-900 flex flex-col animate-fade-in">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Subscription</h2>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                 </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Choose a plan that fits your workflow. You can upgrade or downgrade at any time.</p>
                    <div className="mt-4 grid md:grid-cols-3 gap-6">
                        {PLAN_DETAILS.map(plan => (
                            <PlanCard key={plan.id} plan={plan} currentPlanId={user.planId} onSelect={onSelectPurchase}/>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Buy More Tokens</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Need a top-up? Purchase a one-time token pack.</p>
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                         {TOKEN_PACKS.map(pack => (
                            <TokenPackCard key={pack.id} pack={pack} onSelect={onSelectPurchase} />
                         ))}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
            `}</style>
        </div>
    );
};