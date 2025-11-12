
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getHistory } from '../utils/historyUtils';
import { HistoryItem, ToneAnalysis, ClarityReport, Draft } from '../types';
import Card from './common/Card';
import { AnalyzeIcon, RewriteIcon, ClarityIcon, ReplyIcon } from './common/icons';

const History: React.FC = () => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (currentUser) {
            setHistory(getHistory(currentUser));
        }
    }, [currentUser]);

    const renderIcon = (type: HistoryItem['type']) => {
        switch (type) {
            case 'Tone Analysis': return <AnalyzeIcon />;
            case 'Text Rewrite': return <RewriteIcon />;
            case 'Clarity Check': return <ClarityIcon />;
            case 'Draft Generation': return <ReplyIcon />;
            default: return null;
        }
    };

    const renderOutput = (item: HistoryItem) => {
        switch (item.type) {
            case 'Tone Analysis':
                const tone = item.output as ToneAnalysis;
                return <p><strong>{tone.emoji} {tone.tone}:</strong> {tone.reason}</p>;
            case 'Text Rewrite':
                return <p className="p-3 bg-gray-700 rounded-md whitespace-pre-wrap">{item.output as string}</p>;
            case 'Clarity Check':
                const clarity = item.output as ClarityReport;
                return (
                    <div>
                        <p><strong>Score: {clarity.clarityScore}/100</strong></p>
                        <ul className="list-disc list-inside mt-1">
                            {clarity.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                );
            case 'Draft Generation':
                const drafts = item.output as Draft[];
                return (
                    <div className="space-y-3">
                        {drafts.map((d, i) => (
                            <div key={i} className="p-3 border border-gray-700 rounded-md">
                                <p className="font-semibold text-purple-400">{d.tone}</p>
                                <p className="text-gray-300 whitespace-pre-wrap mt-1">{d.text}</p>
                            </div>
                        ))}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Activity History</h1>
            {history.length > 0 ? (
                <div className="space-y-6">
                    {history.map(item => (
                        <Card key={item.id} className="animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        {renderIcon(item.type)}
                                        {item.type}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3 text-sm text-gray-400">
                                {typeof item.input === 'string' ? (
                                    <div>
                                        <h3 className="font-semibold text-gray-300">Input:</h3>
                                        <p className="p-3 bg-gray-900 rounded-md mt-1 whitespace-pre-wrap">{item.input}</p>
                                    </div>
                                ) : (
                                     <div>
                                        <h3 className="font-semibold text-gray-300">Input Message:</h3>
                                        <p className="p-3 bg-gray-900 rounded-md mt-1 whitespace-pre-wrap">{item.input.incomingMessage}</p>
                                        <h3 className="font-semibold text-gray-300 mt-2">Instruction:</h3>
                                        <p className="p-3 bg-gray-900 rounded-md mt-1 whitespace-pre-wrap">{item.input.instruction}</p>
                                    </div>
                                )}
                                <div className="pt-3">
                                    <h3 className="font-semibold text-gray-300">Result:</h3>
                                    <div className="mt-1 text-gray-300">{renderOutput(item)}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <p className="text-center text-gray-500">You have no activity history yet. Start by analyzing some text or generating a draft!</p>
                </Card>
            )}
        </div>
    );
};

export default History;
