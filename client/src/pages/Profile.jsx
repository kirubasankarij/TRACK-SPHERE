import React from 'react';

const Profile = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                        JD
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
                        <p className="text-gray-500">Member since February 2026</p>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-lg font-semibold">john.doe@example.com</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Account Type</label>
                        <p className="text-lg font-semibold capitalize">Customer</p>
                    </div>
                </div>

                <div className="pt-4">
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
