import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { TrashIcon, PlusIcon } from '../icons';

interface ForwardingAddress {
  id: string;
  email: string;
}

export const ForwardingAddressSettings: React.FC = () => {
  const [addresses, setAddresses] = useState<ForwardingAddress[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/forwarding-addresses');
      if (response.success) {
        setAddresses(response.addresses);
      }
    } catch (err) {
      setError('Failed to fetch addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress) return;
    setError(null);
    try {
      const response = await api.post('/api/forwarding-addresses', { email: newAddress });
      if (response.success) {
        setAddresses([...addresses, response.address]);
        setNewAddress('');
      } else {
        setError(response.error || 'Failed to add address.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/forwarding-addresses/${id}`);
      setAddresses(addresses.filter(addr => addr.id !== id));
    } catch (err) {
      setError('Failed to delete address.');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold">Manage Forwarding Addresses</h3>
      {error && <p className="text-red-500 my-2">{error}</p>}
      <ul className="space-y-2 my-4">
        {addresses.map(addr => (
          <li key={addr.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="font-mono">{addr.email}</span>
            <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700">
              <TrashIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddAddress} className="flex items-center space-x-2">
        <input
          type="email"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="your.alias@mail.your-app.com"
          className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
