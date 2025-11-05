
import React from 'react';
import { KnowledgeGraph, Parameter } from '../types';

interface KnowledgeGraphVisualizerProps {
  knowledgeGraph: KnowledgeGraph | null;
  isLoading: boolean;
}

const ParameterDetail: React.FC<{ parameter: Parameter }> = ({ parameter }) => (
    <div className="text-sm p-2 bg-gray-100 rounded">
        <p><strong className="font-mono text-purple-700">{parameter.name}</strong> ({parameter.type}) {parameter.required && <span className="text-red-600 font-semibold">*required</span>}</p>
        <p className="text-gray-600 pl-2">{parameter.description}</p>
    </div>
);

const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({ knowledgeGraph, isLoading }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30 h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Knowledge Graph View</h2>
      <div className="overflow-y-auto h-[calc(100vh-12rem)] pr-2">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <svg className="animate-spin mx-auto h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Generating graph...</p>
            </div>
          </div>
        )}
        {!isLoading && !knowledgeGraph && (
            <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500">
                    <p>The knowledge graph will appear here once generated.</p>
                    <p>Use the panel on the left to get started.</p>
                </div>
            </div>
        )}
        {!isLoading && knowledgeGraph && (
          <div className="space-y-4">
            {knowledgeGraph.features.map((feature, index) => (
              <div key={index} className="bg-white/80 p-4 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-indigo-700">{feature.name}</h3>
                <p className="text-gray-600 my-2">{feature.description}</p>
                
                {feature.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mt-2">Dependencies:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {feature.dependencies.map(dep => (
                        <span key={dep} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{dep}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {feature.parameters.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold">Parameters:</h4>
                    <div className="space-y-2 mt-1">
                      {feature.parameters.map((param, pIndex) => (
                        <ParameterDetail key={pIndex} parameter={param} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraphVisualizer;
