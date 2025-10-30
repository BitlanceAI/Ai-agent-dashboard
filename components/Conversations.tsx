import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation } from '../types';

const formatDuration = (seconds: number | null): string => {
    if (seconds === null || typeof seconds === 'undefined') return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const TranscriptViewer: React.FC<{ transcript: string | null }> = ({ transcript }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!transcript) {
        return <span className="text-slate-500">Not available</span>;
    }

    return (
        <div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
                {isExpanded ? 'Hide Transcript' : 'View Transcript'}
            </button>
            {isExpanded && (
                <div className="mt-2 p-3 bg-slate-900/50 rounded-lg whitespace-pre-wrap text-xs text-slate-300 border border-slate-700 max-h-48 overflow-y-auto">
                    {transcript}
                </div>
            )}
        </div>
    );
};

const Conversations: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('call_history')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching conversations:', error);
                setError('Failed to load conversations. Please check your connection and Supabase configuration.');
            } else {
                setConversations(data);
            }
            setLoading(false);
        };

        fetchConversations();
    }, []);

    const TableSkeleton = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        {['Call ID', 'Recipient', 'Duration', 'Date', 'Recording', 'Transcript'].map(header => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{header}</th>
                        ))}
                    </tr>
                </thead>
            </table>
            <div className="p-4 space-y-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-700/50 rounded-md animate-pulse"></div>
                ))}
            </div>
        </div>
    );


    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <header>
              <h2 className="text-3xl font-bold tracking-tight text-white">Conversations</h2>
              <p className="mt-1 text-slate-400">Review all recorded calls and their transcripts.</p>
            </header>
            <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className="text-center py-8 text-red-400 bg-red-900/20 p-4 rounded-lg">{error}</div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="font-semibold">No Conversations Found</p>
                        <p className="text-sm mt-1">When calls are made, they will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Call ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Recipient</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Duration</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Recording</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Transcript</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700/50">
                                {conversations.map((call) => (
                                    <tr key={call.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{call.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{call.recipient_number || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatDuration(call.call_duration)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(call.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {call.recording_url ? (
                                                <a href={call.recording_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Listen to Recording</a>
                                            ) : (
                                                <span className="text-slate-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                           <TranscriptViewer transcript={call.transcript} />
                                        </td>
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

export default Conversations;
