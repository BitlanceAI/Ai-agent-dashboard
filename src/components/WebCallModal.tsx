import React, { useState } from 'react';
import { ClipboardIcon } from '../constants';
import { WebCallResponse } from '../../types';

interface WebCallModalProps {
  onClose: () => void;
  onCallCreated: (callData: WebCallResponse) => void;
}

const WebCallModal: React.FC<WebCallModalProps> = ({ onClose, onCallCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callData, setCallData] = useState<WebCallResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateCall = async () => {
    setIsLoading(true);
    setError(null);
    setCallData(null);

    const RETELL_API_KEY = 'key_786358f9f1e6dc3d33bbf5016919'; // WARNING: Do not expose this in a production app.
    const RETELL_AGENT_ID = 'agent_c9c27244f4f8a4dbc06ca33ec8';

    try {
      const response = await fetch('https://api.retellai.com/v2/create-web-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RETELL_API_KEY}`,
        },
        body: JSON.stringify({ agent_id: RETELL_AGENT_ID }),
      });

      if (!response.ok) {
        let errorDetail = `Request failed with status ${response.status}.`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || JSON.stringify(errorData);
        } catch (e) {
          const textError = await response.text();
          if (textError) errorDetail = textError;
        }
        throw new Error(errorDetail);
      }

      const result: WebCallResponse = await response.json();
      setCallData(result);
    } catch (err: any) {
      console.error('Failed to create web call:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
      if (!callData?.access_token) return;
      navigator.clipboard.writeText(callData.access_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinCall = () => {
      if(callData) {
          onCallCreated(callData);
      }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={handleBackdropClick}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-700 animate-fade-in-up">
        <header className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Start a Web Call</h2>
          <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-slate-400">Creating web call session...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                <p className="font-semibold">Failed to Create Call</p>
                <p className="text-sm mt-1 break-words">{error}</p>
            </div>
          ) : callData ? (
            <div className="space-y-4">
              <p className="text-center text-green-400">Web call session created successfully!</p>
              <div>
                  <label className="text-xs text-slate-400">Call ID</label>
                  <input type="text" readOnly value={callData.call_id} className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-1.5 text-xs text-slate-300 mt-1"/>
              </div>
              <div>
                  <label className="text-xs text-slate-400">Access Token</label>
                  <div className="relative mt-1">
                      <input type="text" readOnly value={callData.access_token} className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-1.5 text-xs text-slate-300 pr-10"/>
                      <button onClick={handleCopyToClipboard} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white">
                         {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
                      </button>
                  </div>
              </div>
            </div>
          ) : (
            <div className="text-center h-48 flex flex-col justify-center">
                <p className="text-slate-400">Click the button below to generate a new web call session.</p>
            </div>
          )}
        </div>
        
        <footer className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} disabled={isLoading} className="bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50">
            Cancel
          </button>
          {callData ? (
            <button onClick={handleJoinCall} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Join Call Now
            </button>
          ) : (
            <button onClick={handleCreateCall} disabled={isLoading} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[120px]">
              Create Session
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

// A simple Check icon to show feedback on copy
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


export default WebCallModal;