import React, { useState, useEffect, useRef } from 'react';
import { WebCallResponse, TranscriptEntry } from '../types';
import { MicrophoneIcon, PhoneXMarkIcon } from '../constants';

// Since the SDK is loaded from a CDN, we access it via the window object.
// This handles cases where the SDK is loaded as a default export or a named export on the window.
const RetellClient = (window as any).RetellWebClient?.default || (window as any).RetellWebClient;

interface WebCallClientModalProps {
  callConfig: WebCallResponse;
  onClose: () => void;
}

type CallStatus = 'connecting' | 'live' | 'ended' | 'error';

const WebCallClientModal: React.FC<WebCallClientModalProps> = ({ callConfig, onClose }) => {
  const [status, setStatus] = useState<CallStatus>('connecting');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const sdkRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the transcript whenever it updates
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    if (!RetellClient) {
        console.error("Retell SDK not loaded.");
        setStatus('error');
        return;
    }
      
    const webClient = new RetellClient();
    sdkRef.current = webClient;

    webClient.on('open', () => {
        console.log('Connection established');
    });

    webClient.on('message', (message: string) => {
        const data = JSON.parse(message);
        if (data.type === 'transcript') {
            setTranscript(prev => [...prev, ...data.data]);
        }
    });

    webClient.on('error', (error: string) => {
        console.error('An error occurred:', error);
        setStatus('error');
    });

    webClient.on('close', () => {
        console.log('Connection closed');
        setStatus('ended');
    });
    
    webClient.on('conversationStarted', () => {
        setStatus('live');
    });
    
    webClient.on('conversationEnded', () => {
        setStatus('ended');
    });

    // Start the conversation automatically when component mounts
    webClient.startConversation({
        call_id: callConfig.call_id,
        access_token: callConfig.access_token,
        enable_update: true,
    });

    return () => {
      // Cleanup on unmount
      if (sdkRef.current) {
        sdkRef.current.stopConversation();
      }
    };
  }, [callConfig]);

  const handleEndCall = () => {
    if (sdkRef.current) {
      sdkRef.current.stopConversation();
    }
    onClose();
  };

  const getStatusDisplay = () => {
    switch(status) {
        case 'connecting': return { text: 'Connecting...', color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' };
        case 'live': return { text: 'Live', color: 'text-green-400', dot: 'bg-green-400 animate-pulse' };
        case 'ended': return { text: 'Call Ended', color: 'text-slate-400', dot: 'bg-slate-400' };
        case 'error': return { text: 'Error', color: 'text-red-400', dot: 'bg-red-400' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-700 animate-fade-in-up h-[70vh]">
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center">
             <div className={`w-3 h-3 rounded-full mr-3 ${statusDisplay.dot}`}></div>
             <span className={`font-semibold ${statusDisplay.color}`}>{statusDisplay.text}</span>
          </div>
          <h2 className="text-lg font-bold text-white">Live Web Call</h2>
          <button onClick={handleEndCall} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {transcript.length === 0 && status !== 'error' && (
              <div className="text-center text-slate-400 pt-16">
                  <MicrophoneIcon className="w-12 h-12 mx-auto text-slate-500"/>
                  <p className="mt-4 font-semibold">Waiting for conversation to start...</p>
                  <p className="text-sm">Once connected, the transcript will appear here.</p>
              </div>
          )}
           {status === 'error' && (
              <div className="text-center text-red-400 pt-16">
                  <p className="font-semibold">Connection Error</p>
                  <p className="text-sm mt-1">Could not connect to the call. Please close and try again.</p>
              </div>
          )}
          {transcript.map((entry, index) => (
            <div key={index} className={`flex ${entry.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${entry.role === 'agent' ? 'bg-slate-700 text-slate-200 rounded-bl-sm' : 'bg-blue-600 text-white rounded-br-sm'}`}>
                <p className="text-sm">{entry.content}</p>
              </div>
            </div>
          ))}
           <div ref={transcriptEndRef} />
        </div>
        
        <footer className="p-4 border-t border-slate-700 flex justify-center">
            <button 
                onClick={handleEndCall} 
                className="bg-red-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
            >
                <PhoneXMarkIcon className="w-5 h-5"/>
                End Call
            </button>
        </footer>
      </div>
    </div>
  );
};

export default WebCallClientModal;