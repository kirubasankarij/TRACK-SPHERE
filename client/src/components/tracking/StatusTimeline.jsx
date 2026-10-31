import React from 'react';
import { format } from 'date-fns';

const formatDate = (ts) => {
    if (!ts) return 'Just now';
    try {
        return format(new Date(ts), 'MMM d, h:mm a');
    } catch {
        return 'Just now';
    }
};

const StatusTimeline = ({ history }) => {
    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {history?.map((event, idx) => (
                    <li key={idx}>
                        <div className="relative pb-8">
                            {idx !== history.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/10" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-ai-bg ${idx === history.length - 1 ? 'bg-primary' : 'bg-white/20'}`}>
                                        <div className="h-2 w-2 bg-white rounded-full" />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">
                                            {event.status}{' '}
                                            <span className="font-normal text-gray-400 capitalize">({event.location || 'Hub'})</span>
                                        </p>
                                        {event.details && (
                                            <p className="text-xs text-gray-400 font-medium mt-0.5">{event.details}</p>
                                        )}
                                    </div>
                                    <div className="text-right text-xs whitespace-nowrap text-gray-400 font-mono">
                                        <time dateTime={event.timestamp}>{formatDate(event.timestamp)}</time>
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
