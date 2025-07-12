import React from 'react';
import type { Plan, TokenPack } from '../../types';
import { LockClosedIcon, XMarkIcon, ArrowRightIcon } from '../icons';

interface CheckoutModalProps {
    item: Plan | TokenPack;
    onClose: () => void;
    onConfirm: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, onClose, onConfirm }) => {
    const isPlan = 'pricePeriod' in item;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-auto" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Confirm Purchase
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </header>

                <div className="p-6">
                    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {isPlan ? `Subscribing to ${item.name}` : `Buying ${item.name}`}
                            </span>
                            <span className="font-bold text-xl text-gray-900 dark:text-white">
                                ${item.price.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isPlan 
                                ? `You'll be billed monthly. You can cancel anytime.` 
                                : `One-time purchase of ${item.tokens.toLocaleString()} tokens.`}
                        </p>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        You will be redirected to our secure payment partner, Stripe, to complete your purchase.
                    </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center flex items-center justify-center">
                        <LockClosedIcon className="w-3 h-3 mr-1"/>
                        Secure payment powered by Stripe.
                    </p>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={onConfirm}
                        className="w-full py-3 px-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center"
                    >
                        <span>Confirm and Proceed to Payment</span>
                        <ArrowRightIcon className="w-5 h-5 ml-2"/>
                    </button>
                </footer>
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