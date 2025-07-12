import React, { useEffect } from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@/components/icons';

interface PaymentSuccessPageProps {
  onContinue: () => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onContinue }) => {
  useEffect(() => {
    // This effect runs once on mount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Successful!</h1>
        <p className="mt-3 max-w-sm mx-auto text-lg text-gray-600 dark:text-gray-300">
          Your account has been updated. Thank you for your purchase!
        </p>
        <button
          onClick={onContinue}
          className="mt-8 flex items-center justify-center mx-auto px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl"
        >
          <span>Continue to Workspace</span>
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};
