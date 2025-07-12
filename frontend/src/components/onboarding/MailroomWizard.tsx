import React, { useState } from 'react';
import { api } from '@/services/api';
import { CheckCircleIcon, ClipboardIcon, InboxIcon } from '../icons';

interface MailroomWizardProps {
  onFinish: () => void; // Callback to refresh the address list
}

const Step1_CreateAddress: React.FC<{ onNext: (address: string) => void }> = ({ onNext }) => {
    const [alias, setAlias] = useState('');
    const [error, setError] = useState('');

    const fullAddress = `${alias}@mail.your-app.com`;

    const handleCreate = async () => {
        setError('');
        if (!alias) {
            setError('Please enter an alias for your address.');
            return;
        }
        if (/\s/.test(alias)) {
            setError('Alias cannot contain spaces.');
            return;
        }

        try {
            const response = await api.post('/api/forwarding-addresses', { email: fullAddress });
            if (response.success) {
                onNext(response.address.email);
            } else {
                setError(response.error || 'That alias is already taken. Please try another.');
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center">Create Your Private Mailroom Address</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                This will be your unique, private email address. Choose a memorable alias.
            </p>
            <div className="my-6 flex items-center justify-center">
                <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.toLowerCase())}
                    placeholder="your-alias"
                    className="p-3 border rounded-l-md dark:bg-gray-800 dark:border-gray-700 text-right font-mono w-1/2"
                    autoFocus
                />
                <span className="p-3 border-t border-b border-r rounded-r-md bg-gray-100 dark:bg-gray-800 dark:border-gray-700 font-mono">
                    @mail.your-app.com
                </span>
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            
            <div className="mt-8 text-center">
                <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Address
                </button>
            </div>
        </div>
    );
};

const Step2_Instructions: React.FC<{ address: string; onFinish: () => void }> = ({ address, onFinish }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-green-500">
        <CheckCircleIcon className="w-12 h-12 mx-auto mb-2" />
        Address Created!
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
        Your new mailroom address is:
      </p>
      <div className="my-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-mono text-lg">
        {address}
      </div>
      <div className="flex justify-center">
        <button onClick={handleCopy} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <ClipboardIcon className="w-5 h-5 mr-2" />
          {copied ? 'Copied!' : 'Copy Address'}
        </button>
      </div>
       <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-lg">Next Steps:</h3>
            <p className="mt-2">Now, go to your email client (Gmail, Outlook, etc.) and set up a rule to automatically forward important emails to this new address.</p>
        </div>
      <div className="mt-8 text-center">
        <button onClick={onFinish} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            All Done
        </button>
      </div>
    </div>
  );
};


export const MailroomWizard: React.FC<MailroomWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [finalAddress, setFinalAddress] = useState('');

  const handleNext = (address: string) => {
    setFinalAddress(address);
    setStep(2);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_CreateAddress onNext={handleNext} />;
      case 2:
        return <Step2_Instructions address={finalAddress} onFinish={onFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="flex justify-center mb-4">
            <InboxIcon className="w-12 h-12 text-blue-500" />
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

