
export interface ToneAnalysis {
  tone: string;
  emoji: string;
  reason: string;
}

export interface ClarityReport {
  clarityScore: number;
  suggestions: string[];
}

export interface Draft {
  tone: string;
  text: string;
}

export interface User {
    email: string;
    // NOTE: In a real-world application, never store passwords in plain text.
    // This is for demonstration purposes only within localStorage.
    password?: string;
}

export type HistoryItem = {
    id: string;
    timestamp: string;
    type: 'Tone Analysis' | 'Text Rewrite' | 'Clarity Check' | 'Draft Generation';
    input: string | { incomingMessage: string; instruction: string };
    output: ToneAnalysis | string | ClarityReport | Draft[];
};
