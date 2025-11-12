import React, { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeTone, rewriteText, checkClarity, generateSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { ToneAnalysis, ClarityReport } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addHistoryItem } from '../utils/historyUtils';
import Card from './common/Card';
import Loader from './common/Loader';
import { ToneAnalysisSkeleton, ClaritySkeleton } from './common/Skeleton';
import { AnalyzeIcon, ClarityIcon, RewriteIcon, SpeakerIcon, StopIcon, CopyIcon, CheckIcon, ClearIcon, PasteIcon, MicrophoneIcon } from './common/icons';

const TONE_OPTIONS = [
    { name: "Diplomatic", description: "Tactful and considerate" },
    { name: "Direct", description: "Clear and straightforward" },
    { name: "Formal", description: "Professional and structured" },
    { name: "Casual", description: "Relaxed and friendly" },
    { name: "Enthusiastic", description: "Energetic and positive" },
    { name: "Sympathetic", description: "Understanding and caring" },
    { name: "Assertive", description: "Confident and firm" },
    { name: "Polite", description: "Courteous and respectful" },
];

const TextAnalysis: React.FC = () => {
    const { currentUser } = useAuth();
    const [text, setText] = useState(() => localStorage.getItem('textAnalysisContent') || '');
    const [rewrittenText, setRewrittenText] = useState<string | null>(null);
    const [tone, setTone] = useState<ToneAnalysis | null>(null);
    const [clarity, setClarity] = useState<ClarityReport | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState<Record<string, boolean>>({
        tone: false,
        clarity: false,
        rewrite: false,
        speech: false,
    });
    const [rewritingTone, setRewritingTone] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem('textAnalysisContent', text);
        }, 500);
        return () => clearTimeout(handler);
    }, [text]);
    
    useEffect(() => {
        // Fix: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setText(prevText => prevText + finalTranscript);
            };

            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setError('Speech recognition error. Please check microphone permissions.');
                setIsRecording(false);
            };
        }
    }, []);

    const handleLoading = (key: string, value: boolean) => setLoading(prev => ({ ...prev, [key]: value }));

    const handleAnalyzeTone = useCallback(async () => {
        if (!text.trim() || !currentUser) return;
        handleLoading('tone', true);
        setError('');
        setTone(null);
        try {
            const result = await analyzeTone(text);
            setTone(result);
            addHistoryItem(currentUser, { type: 'Tone Analysis', input: text, output: result });
        } catch (e) {
            setError('Could not analyze tone. Please try again.');
        } finally {
            handleLoading('tone', false);
        }
    }, [text, currentUser]);

    const handleCheckClarity = useCallback(async () => {
        if (!text.trim() || !currentUser) return;
        handleLoading('clarity', true);
        setError('');
        setClarity(null);
        try {
            const result = await checkClarity(text);
            setClarity(result);
            addHistoryItem(currentUser, { type: 'Clarity Check', input: text, output: result });
        } catch (e) {
            setError('Could not check clarity. Please try again.');
        } finally {
            handleLoading('clarity', false);
        }
    }, [text, currentUser]);

    const handleRewrite = async (targetTone: string) => {
        if (!text.trim() || !currentUser) return;
        handleLoading('rewrite', true);
        setRewritingTone(targetTone);
        setError('');
        setRewrittenText(null);
        try {
            const result = await rewriteText(text, targetTone);
            setRewrittenText(result);
            addHistoryItem(currentUser, { type: 'Text Rewrite', input: `Rewrite to ${targetTone}: ${text}`, output: result });
        } catch (e) {
            setError(`Could not rewrite text to be more ${targetTone}.`);
        } finally {
            handleLoading('rewrite', false);
            setRewritingTone(null);
        }
    };
    
    const handlePlayAudio = async (textToPlay: string) => {
      if (!textToPlay || isPlaying) return;
      handleLoading('speech', true);
      setIsPlaying(true);
      setError('');
      try {
        const audio = await generateSpeech(textToPlay);
        await playAudio(audio);
      } catch (e) {
        setError('Could not play audio.');
      } finally {
        handleLoading('speech', false);
        setIsPlaying(false);
      }
    };

    const handleCopyToClipboard = useCallback((textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, []);

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setText(text => text + clipboardText);
        } catch (err) {
            setError("Failed to paste from clipboard. Please check browser permissions.");
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileText = e.target?.result as string;
                setText(prev => prev + fileText);
            };
            reader.readAsText(file);
        } else {
            setError("Please drop a valid .txt file.");
        }
    };

    const handleToggleRecording = () => {
        if (!recognitionRef.current) {
            setError("Voice input is not supported by your browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Your Text</h2>
                        <div className="flex items-center gap-1">
                             <button onClick={handlePaste} className="p-2 rounded-full hover:bg-gray-700 transition" title="Paste Text"><PasteIcon /></button>
                            <button onClick={() => setText('')} disabled={!text} className="p-2 rounded-full hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Clear Text"><ClearIcon /></button>
                        </div>
                    </div>
                    <div className={`relative transition-all duration-300 rounded-lg ${isDragging ? 'bg-purple-900/50 ring-2 ring-purple-500' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type, paste, dictate, or drop a text file here..." className="w-full h-64 p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
                         {isDragging && (<div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 rounded-lg pointer-events-none"><p className="text-lg font-semibold text-white">Drop text file here</p></div>)}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                             <button onClick={handleToggleRecording} className={`p-1 rounded-full hover:bg-gray-600 transition ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} title={isRecording ? "Stop Recording" : "Start Voice Input"}><MicrophoneIcon /></button>
                            <div className="text-xs text-gray-500 select-none">{wordCount} words</div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={handleAnalyzeTone} disabled={loading.tone || !text} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {loading.tone ? <Loader /> : <AnalyzeIcon />} Analyze Tone
                        </button>
                        <button onClick={handleCheckClarity} disabled={loading.clarity || !text} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {loading.clarity ? <Loader /> : <ClarityIcon />} Check Clarity
                        </button>
                    </div>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><RewriteIcon /> Tone Adjustment</h2>
                    <p className="text-gray-400 mb-4">Select a tone to rewrite your text.</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {TONE_OPTIONS.map(option => (
                            <button key={option.name} onClick={() => handleRewrite(option.name)} disabled={loading.rewrite || !text} className="p-4 bg-gray-700 rounded-lg text-left transition-all duration-200 hover:bg-gray-600 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                {loading.rewrite && rewritingTone === option.name ? (<div className="flex justify-center items-center h-full"><Loader size={5}/></div>) : (<>
                                    <p className="font-bold text-white">{option.name}</p>
                                    <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                                </>)}
                            </button>
                        ))}
                    </div>
                    {rewrittenText && (
                        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-purple-400">Suggested Rewrite:</h3>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleCopyToClipboard(rewrittenText)} className="p-2 rounded-full hover:bg-gray-700 transition" title="Copy Text">{isCopied ? <CheckIcon /> : <CopyIcon />}</button>
                                    <button onClick={() => handlePlayAudio(rewrittenText)} disabled={loading.speech || isPlaying} className="p-2 rounded-full hover:bg-gray-700 transition disabled:opacity-50" title="Play Audio">{loading.speech ? <Loader size={5}/> : isPlaying ? <StopIcon /> : <SpeakerIcon />}</button>
                                </div>
                            </div>
                            <p className="text-gray-300">{rewrittenText}</p>
                        </div>
                    )}
                </Card>
            </div>
            <div>
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><AnalyzeIcon /> Tone Analysis</h2>
                    {loading.tone ? <ToneAnalysisSkeleton /> : tone ? (
                        <div className="animate-fade-in">
                            <p className="text-3xl font-bold text-purple-400 flex items-center">{tone.emoji} {tone.tone}</p>
                            <p className="text-gray-400 mt-2">{tone.reason}</p>
                        </div>
                    ) : (<p className="text-gray-500">Analysis results will appear here.</p>)}
                </Card>
                <Card>
                     <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><ClarityIcon /> Clarity & Readability</h2>
                    {loading.clarity ? <ClaritySkeleton /> : clarity ? (
                        <div className="animate-fade-in">
                            <div className="flex items-baseline mb-4">
                                <p className="text-5xl font-bold text-blue-400">{clarity.clarityScore}</p>
                                <p className="text-2xl text-gray-400">/100</p>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Suggestions:</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {clarity.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    ) : (<p className="text-gray-500">Clarity score will appear here.</p>)}
                </Card>
            </div>
        </div>
    );
};

export default TextAnalysis;