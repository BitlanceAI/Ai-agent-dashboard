import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation } from '../types';

type Meeting = Pick<Conversation, 'id' | 'name' | 'recipient_number' | 'tour_date'>;

const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    // Add a time component to the date to ensure it's parsed in the local timezone correctly
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const Meetings: React.FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('call_history')
                .select('id, name, recipient_number, tour_date')
                .not('tour_date', 'is', null)
                .order('tour_date', { ascending: true });

            if (error) {
                console.error('Error fetching meetings:', error);
                setError('Failed to load scheduled meetings.');
            } else {
                setMeetings(data as Meeting[]);
            }
            setLoading(false);
        };

        fetchMeetings();
    }, []);

    const TableSkeleton = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        {['Tour Date', 'Name', 'Phone Number', 'Call ID'].map(header => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{header}</th>
                        ))}
                    </tr>
                </thead>
            </table>
            <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-700/50 rounded-md animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <header>
              <h2 className="text-3xl font-bold tracking-tight text-white">Scheduled Meetings</h2>
              <p className="mt-1 text-slate-400">Review all upcoming tours scheduled by the voice agent.</p>
            </header>
            <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className="text-center py-8 text-red-400 bg-red-900/20 p-4 rounded-lg">{error}</div>
                ) : meetings.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="font-semibold">No Meetings Scheduled</p>
                        <p className="text-sm mt-1">When the agent schedules a tour, it will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Tour Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Phone Number</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Reference Call ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700/50">
                                {meetings.map((meeting) => (
                                    <tr key={meeting.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatDate(meeting.tour_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{meeting.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{meeting.recipient_number || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{meeting.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Meetings;