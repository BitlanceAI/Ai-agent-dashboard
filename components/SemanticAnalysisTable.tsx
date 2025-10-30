import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Json } from '../types';

type AnalysisRow = Database['public']['Tables']['semantic_analysis']['Row'];

// Helper functions for formatting
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatPercentage = (value: number | null): string => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
};

const JsonViewer: React.FC<{ data: Json | null }> = ({ data }) => {
    if (!data || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
        return <span className="text-slate-500">None</span>;
    }
    const content = typeof data === 'string' ? data : JSON.stringify(data);

    // Truncate long JSON strings
    const displayContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
    
    return <span className="font-mono text-xs bg-slate-700/50 px-2 py-0.5 rounded" title={content}>{displayContent}</span>;
};


const SemanticAnalysisTable: React.FC = () => {
    const [analysisData, setAnalysisData] = useState<AnalysisRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysisData = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('semantic_analysis')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching semantic analysis:', error);
                setError('Failed to load analysis data.');
            } else {
                setAnalysisData(data);
            }
            setLoading(false);
        };
        fetchAnalysisData();
    }, []);

    const TableSkeleton = () => (
        <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        {['ID', 'Call ID', 'Date', 'Sentiment', 'Score', 'Confidence', 'Alert', 'Summary', 'Positive', 'Negative', 'Buying Signals'].map(header => (
                            <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{header}</th>
                        ))}
                    </tr>
                </thead>
             </table>
            <div className="p-4 space-y-3">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-700/50 rounded-md animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    const headers = ['ID', 'Call ID', 'Date', 'Sentiment', 'Score', 'Confidence', 'Alert', 'Summary', 'Positive', 'Negative', 'Buying Signals'];

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <header>
              <h2 className="text-3xl font-bold tracking-tight text-white">Semantic Analysis Details</h2>
              <p className="mt-1 text-slate-400">A detailed, record-by-record breakdown of every analyzed call.</p>
            </header>
            <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className="text-center py-8 text-red-400 bg-red-900/20 p-4 rounded-lg">{error}</div>
                ) : analysisData.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="font-semibold">No Analysis Data</p>
                        <p className="text-sm mt-1">Processed call data will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    {headers.map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700/50">
                                {analysisData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-700/50 transition-colors text-sm">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-400">{row.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.call_id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-400">{formatDate(row.created_at)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-300 capitalize">{row.sentiment || 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatPercentage(row.sentiment_score)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{formatPercentage(row.agent_confidence)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-300 capitalize">{row.alert_status || 'N/A'}</td>
                                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={row.summary || ''}>{row.summary || 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><JsonViewer data={row.positive_indicators} /></td>
                                        <td className="px-4 py-3 whitespace-nowrap"><JsonViewer data={row.negative_indicators} /></td>
                                        <td className="px-4 py-3 whitespace-nowrap"><JsonViewer data={row.buying_signals} /></td>
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

export default SemanticAnalysisTable;
