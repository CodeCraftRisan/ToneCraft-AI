import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateDrafts, generateSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { Draft } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addHistoryItem } from '../utils/historyUtils';
import Card from './common/Card';
import Loader from './common/Loader';
import { DraftSkeleton } from './common/Skeleton';
import { ReplyIcon, SpeakerIcon, CopyIcon, CheckIcon, ClearIcon, MicrophoneIcon } from './common/icons';

const DraftGenerator: React.FC = () => {
    const { currentUser } = useAuth();
    const [incomingMessage, setIncomingMessage] = useState(() => localStorage.getItem('draftGenMessage') || '');
    const [instruction, setInstruction] = useState(() => localStorage.getItem('draftGenInstruction') || '');
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [playingDraftIndex, setPlayingDraftIndex] = useState<number | null>(null);
    const [copiedDraftIndex, setCopiedDraftIndex] = useState<number | null>(null);

    const [isDraggingMessage, setIsDraggingMessage] = useState(false);
    const [isDraggingInstruction, setIsDraggingInstruction] = useState(false);
    
    const [recordingTarget, setRecordingTarget] = useState<'message' | 'instruction' | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const handler = setTimeout(() => localStorage.setItem('draftGenMessage', incomingMessage), 500);
        return () => clearTimeout(handler);
    }, [incomingMessage]);
    
    useEffect(() => {
        const handler = setTimeout(() => localStorage.setItem('draftGenInstruction', instruction), 500);
        return () => clearTimeout(handler);
    }, [instruction]);

    useEffect(() => {
        // Fix: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if (recordingTarget === 'message') setIncomingMessage(prev => prev + finalTranscript);
            else if (recordingTarget === 'instruction') setInstruction(prev => prev + finalTranscript);
        };

        recognition.onend = () => setRecordingTarget(null);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError('Speech recognition error. Please check microphone permissions.');
            setRecordingTarget(null);
        };

    }, [recordingTarget]);

    const handleToggleRecording = (target: 'message' | 'instruction') => {
        if (!recognitionRef.current) {
            setError("Voice input is not supported by your browser.");
            return;
        }
        if (recordingTarget) {
            recognitionRef.current.stop();
        } else {
            setRecordingTarget(target);
            recognitionRef.current.start();
        }
    };

    const handleGenerateDrafts = useCallback(async () => {
        if (!incomingMessage.trim() || !instruction.trim()) {
            setError('Please provide both an incoming message and an instruction.');
            return;
        }
        if (!currentUser) return;

        setLoading(true);
        setError('');
        setDrafts([]);
        try {
            const result = await generateDrafts(incomingMessage, instruction);
            setDrafts(result);
            const input = { incomingMessage, instruction };
            addHistoryItem(currentUser, { type: 'Draft Generation', input, output: result });
        } catch (e) {
            setError('Could not generate drafts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [incomingMessage, instruction, currentUser]);
    
    const handlePlayAudio = async (textToPlay: string, index: number) => {
      if (!textToPlay || playingDraftIndex !== null) return;
      setPlayingDraftIndex(index);
      setError('');
      try {
        const audio = await generateSpeech(textToPlay);
        await playAudio(audio);
      } catch (e) {
        setError('Could not play audio.');
      } finally {
        setPlayingDraftIndex(null);
      }
    };

    const handleCopyToClipboard = useCallback((textToCopy: string, index: number) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedDraftIndex(index);
            setTimeout(() => setCopiedDraftIndex(null), 2000);
        });
    }, []);

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>, target: 'message' | 'instruction') => {
        e.preventDefault();
        target === 'message' ? setIsDraggingMessage(false) : setIsDraggingInstruction(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                if (target === 'message') setIncomingMessage(prev => prev + text);
                else setInstruction(prev => prev + text);
            };
            reader.readAsText(file);
        } else {
            setError("Please drop a valid .txt file.");
        }
    };

    const clearInputs = () => {
        setIncomingMessage('');
        setInstruction('');
        setDrafts([]);
        setError('');
    };

    const TextAreaWithDndAndVoice = ({ id, value, onChange, placeholder, isDragging, setIsDragging, onDrop, onRecord, isRecording }: any) => (
      <div
        className={`relative transition-all duration-300 rounded-lg ${isDragging ? 'bg-purple-900/50 ring-2 ring-purple-500' : ''}`}
        onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
      >
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-full p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
        />
        <button onClick={onRecord} className={`absolute bottom-3 right-3 p-1 rounded-full hover:bg-gray-600 transition ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} title={isRecording ? "Stop Recording" : "Start Voice Input"}>
          <MicrophoneIcon />
        </button>
      </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Draft a Reply</h2>
                     <button onClick={clearInputs} disabled={!incomingMessage && !instruction} className="p-2 rounded-full hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Clear Inputs"><ClearIcon /></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="incoming-message" className="block text-sm font-medium text-gray-400 mb-2">Incoming Message</label>
                        <div className="h-40">
                            <TextAreaWithDndAndVoice id="incoming-message" value={incomingMessage} onChange={(e: any) => setIncomingMessage(e.target.value)} placeholder="Paste or drop the message you received..." isDragging={isDraggingMessage} setIsDragging={setIsDraggingMessage} onDrop={(e: any) => handleDrop(e, 'message')} onRecord={() => handleToggleRecording('message')} isRecording={recordingTarget === 'message'} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="instruction" className="block text-sm font-medium text-gray-400 mb-2">Your Instruction</label>
                        <div className="h-24">
                           <TextAreaWithDndAndVoice id="instruction" value={instruction} onChange={(e: any) => setInstruction(e.target.value)} placeholder="e.g., 'Politely decline this job offer...'" isDragging={isDraggingInstruction} setIsDragging={setIsDraggingInstruction} onDrop={(e: any) => handleDrop(e, 'instruction')} onRecord={() => handleToggleRecording('instruction')} isRecording={recordingTarget === 'instruction'} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={handleGenerateDrafts} disabled={loading || !incomingMessage || !instruction} className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed w-full md:w-auto">
                        {loading ? <Loader /> : <ReplyIcon />} Generate Drafts
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </Card>

            {loading && (
                <div className="mt-8 space-y-6">
                     <h2 className="text-2xl font-bold text-center text-white">Generating Drafts...</h2>
                    <DraftSkeleton /><DraftSkeleton />
                </div>
            )}

            {drafts.length > 0 && (
                <div className="mt-8 space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-center text-white">Generated Drafts</h2>
                    {drafts.map((draft, index) => (
                        <Card key={index} className="transition-shadow duration-300 hover:shadow-lg hover:shadow-purple-900/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="px-3 py-1 text-sm font-semibold text-purple-200 bg-purple-800/50 rounded-full">{draft.tone}</span>
                                <div className="flex items-center gap-1">
                                     <button onClick={() => handleCopyToClipboard(draft.text, index)} className="p-2 rounded-full hover:bg-gray-700 transition" title="Copy Draft">{copiedDraftIndex === index ? <CheckIcon /> : <CopyIcon />}</button>
                                    <button onClick={() => handlePlayAudio(draft.text, index)} disabled={playingDraftIndex !== null} className="p-2 rounded-full hover:bg-gray-700 transition disabled:opacity-50" title="Play Audio">{playingDraftIndex === index ? <Loader size={5}/> : <SpeakerIcon />}</button>
                                </div>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{draft.text}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DraftGenerator;