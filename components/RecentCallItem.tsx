import React from 'react';
import { RecentCall, CallStatus } from '../types';

interface RecentCallItemProps {
  call: RecentCall;
}

const statusStyles: { [key in CallStatus]: { dot: string, text: string, bg: string } } = {
  [CallStatus.Completed]: { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10' },
  [CallStatus.Active]: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  [CallStatus.Missed]: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
};

const SentimentDisplay: React.FC<{ sentiment: string | null }> = ({ sentiment }) => {
    if (!sentiment) return null;

    const sentimentLower = sentiment.toLowerCase();
    let dotColor = 'bg-slate-500';
    let textColor = 'text-slate-300';

    if (sentimentLower === 'positive') {
        dotColor = 'bg-green-500';
        textColor = 'text-green-400';
    } else if (sentimentLower === 'negative') {
        dotColor = 'bg-red-500';
        textColor = 'text-red-400';
    } else if (sentimentLower === 'neutral') {
        dotColor = 'bg-sky-500';
        textColor = 'text-sky-400';
    }

    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
            <span className={`text-sm capitalize ${textColor}`}>{sentiment}</span>
        </div>
    );
};


const RecentCallItem: React.FC<RecentCallItemProps> = ({ call }) => {
  const styles = statusStyles[call.status];

  return (
    <div className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 text-left">
      <div className="flex items-center">
        <img src={`https://i.pravatar.cc/40?u=${call.id}`} alt={call.name} className="w-10 h-10 rounded-full mr-4" />
        <div>
          <p className="font-semibold text-white">{call.recipient_number}</p>
          <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-slate-400">Duration: {call.duration}</p>
              <SentimentDisplay sentiment={call.sentiment} />
          </div>
        </div>
      </div>
      <div className="flex items-center text-right flex-col sm:flex-row sm:gap-4">
         <span className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full ${styles.text} ${styles.bg}`}>
            {call.status}
        </span>
        <p className="text-sm text-slate-500 mt-1 sm:mt-0">{call.timeAgo}</p>
      </div>
    </div>
  );
};

export default RecentCallItem;