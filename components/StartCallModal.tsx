
import React, { useState } from 'react';

interface StartCallModalProps {
  onClose: () => void;
}

const StartCallModal: React.FC<StartCallModalProps> = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Only trigger the n8n webhook
      const response = await fetch('https://biltance.app.n8n.cloud/webhook/form_submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}.`);
      }
      
      console.log('Webhook triggered successfully.');
      setSuccess(`Successfully sent ${phoneNumber} to the webhook.`);

      // Close modal after a short delay on success
      setTimeout(() => {
          onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Failed to trigger webhook:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-700 animate-fade-in-up">
        <header className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Submit to Webhook</h2>
          <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-slate-400 mb-2">
              Phone Number to Submit
            </label>
            <input
              type="tel"
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            />
          </div>
          
          {error && <p className="text-sm text-red-400">{`Failed to submit: ${error}`}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
        </div>
        
        <footer className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center min-w-[100px] disabled:bg-blue-800 disabled:cursor-wait"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Submit'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default StartCallModal;