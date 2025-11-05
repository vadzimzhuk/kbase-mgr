
import React, { useState } from 'react';
import { KnowledgeGraph } from '../types';
import { parseDocumentation } from '../services/geminiService';

interface KnowledgeGraphInputProps {
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  onGraphUpdate: (graph: KnowledgeGraph) => void;
  isLoading: boolean;
}

const sampleDoc = `
Feature: 3D Secure Authentication
Description: Provides an extra layer of security for card transactions by requiring cardholder authentication.
Depends on: [Card Payments]
Parameters:
- name: "threeDSecure.version", type: "enum", description: "The 3D Secure version to use, either '2.1' or '2.2'.", required: true
- name: "threeDSecure.merchantIdentifier", type: "string", description: "Your unique merchant ID for 3D Secure services.", required: true

Feature: Card Payments
Description: Allows processing of credit and debit card payments.
Depends on: []
Parameters:
- name: "api.key", type: "string", description: "The primary API key for authenticating requests.", required: true
- name: "api.endpoint", type: "string", description: "The API endpoint URL.", required: false

Feature: Recurring Billing
Description: Enables subscription-based payments and automated recurring charges.
Depends on: [Card Payments]
Parameters:
- name: "billing.planId", type: "string", description: "The identifier for the subscription plan.", required: true
- name: "billing.trialPeriodDays", type: "number", description: "Number of free trial days before the first charge.", required: false
`;

const KnowledgeGraphInput: React.FC<KnowledgeGraphInputProps> = ({ setIsLoading, setError, onGraphUpdate, isLoading }) => {
  const [docText, setDocText] = useState<string>(sampleDoc.trim());

  const handleSubmit = async () => {
    if (!docText.trim()) {
      setError("Documentation text cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const graph = await parseDocumentation(docText);
      onGraphUpdate(graph);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">1. Update Knowledge Graph</h2>
      <p className="mb-4 text-gray-600">Paste your system's documentation below. The AI will parse it to build or update the knowledge graph.</p>
      <textarea
        value={docText}
        onChange={(e) => setDocText(e.target.value)}
        placeholder="Enter feature documentation here..."
        className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-200 resize-y"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Generate / Update Graph'
        )}
      </button>
    </div>
  );
};

export default KnowledgeGraphInput;
