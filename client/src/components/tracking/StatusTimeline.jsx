import React from 'react';
import { format } from 'date-fns';

const StatusTimeline = ({ history }) => {
    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {history?.map((event, idx) => (
                    <li key={idx}>
                        <div className="relative pb-8">
                            {idx !== history.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${idx === 0 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                        <div className="h-2 w-2 bg-white rounded-full" />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {event.status}{' '}
                                            <span className="font-medium text-gray-900">{event.location}</span>
                                        </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={event.timestamp}>{format(new Date(event.timestamp), 'MMM d, h:mm a')}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StatusTimeline;
