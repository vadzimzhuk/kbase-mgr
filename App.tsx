
import React, { useState } from 'react';
import { KnowledgeGraph, ConfigValidationResult } from './types';
import KnowledgeGraphInput from './components/KnowledgeGraphInput';
import ConfigValidator from './components/ConfigValidator';
import FeatureEnabler from './components/FeatureEnabler';
import KnowledgeGraphVisualizer from './components/KnowledgeGraphVisualizer';

const App: React.FC = () => {
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidationResult = (result: ConfigValidationResult) => {
    // This function can be used to display validation results in a modal or toast in a more complex app.
    // For now, results are displayed within the ConfigValidator component itself.
    console.log("Validation Result:", result);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            AI Knowledge Graph Manager
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Generate, validate, and explore your payment system's feature configuration.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <KnowledgeGraphInput 
              setIsLoading={setIsLoading}
              setError={setError}
              onGraphUpdate={(graph) => {
                setKnowledgeGraph(graph);
                setError(null);
              }}
              isLoading={isLoading}
            />
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
            
            {knowledgeGraph && (
              <>
                <ConfigValidator 
                  knowledgeGraph={knowledgeGraph} 
                  onValidationResult={handleValidationResult} 
                />
                <FeatureEnabler knowledgeGraph={knowledgeGraph} />
              </>
            )}
          </div>

          <div className="lg:row-span-2">
            <KnowledgeGraphVisualizer 
              knowledgeGraph={knowledgeGraph} 
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
