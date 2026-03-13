import React from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Notification = ({ show, title, message, type = 'info', onClose }) => {
    const bgColor = {
        info: 'bg-blue-50',
        success: 'bg-green-50',
        warning: 'bg-yellow-50',
        error: 'bg-red-50'
    }[type];

    const textColor = {
        info: 'text-blue-800',
        success: 'text-green-800',
        warning: 'text-yellow-800',
        error: 'text-red-800'
    }[type];

    return (
        <Transition
            show={show}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${bgColor}`}>
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className={`text-sm font-medium ${textColor}`}>{title}</p>
                            <p className={`mt-1 text-sm ${textColor} opacity-80`}>{message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    );
};

export default Notification;
