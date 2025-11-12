
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './common/Card';

const Profile: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <div className="max-w-md mx-auto">
                <Card><p className="text-center">Not logged in.</p></Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
            <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <p className="text-lg text-white p-3 bg-gray-700 rounded-md mt-1">{currentUser.email}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                         <h3 className="text-lg font-semibold text-white">Account Management</h3>
                         <p className="text-sm text-gray-500 mb-4">These features require a server and are not implemented in this demo.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                             <button disabled className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-blue-500 text-white opacity-50 cursor-not-allowed">
                                Change Password
                            </button>
                             <button disabled className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white opacity-50 cursor-not-allowed">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Profile;
