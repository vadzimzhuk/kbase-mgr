
import React, { useState, useMemo, useCallback } from 'react';
import { KnowledgeGraph, Feature, Parameter } from '../types';

interface FeatureEnablerProps {
  knowledgeGraph: KnowledgeGraph;
}

interface EnablementInfo {
  featuresToEnable: string[];
  requiredParameters: Parameter[];
}

const FeatureEnabler: React.FC<FeatureEnablerProps> = ({ knowledgeGraph }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [enablementInfo, setEnablementInfo] = useState<EnablementInfo | null>(null);

  const featureOptions = useMemo(() => 
    knowledgeGraph.features.map(f => f.name).sort(),
    [knowledgeGraph]
  );
  
  const getEnablementInfo = useCallback((featureName: string): EnablementInfo | null => {
    const featureMap = new Map<string, Feature>(knowledgeGraph.features.map(f => [f.name, f]));
    const rootFeature = featureMap.get(featureName);

    if (!rootFeature) return null;

    const featuresToEnable = new Set<string>();
    const requiredParameters = new Map<string, Parameter>();
    
    const resolveDependencies = (name: string) => {
        if (featuresToEnable.has(name)) return;
        
        const feature = featureMap.get(name);
        if (!feature) return;

        featuresToEnable.add(name);
        feature.parameters.forEach(p => {
            if (!requiredParameters.has(p.name)) {
                requiredParameters.set(p.name, p);
            }
        });
        
        feature.dependencies.forEach(dep => resolveDependencies(dep));
    };

    resolveDependencies(featureName);

    return {
        featuresToEnable: Array.from(featuresToEnable).sort(),
        requiredParameters: Array.from(requiredParameters.values()).sort((a,b) => a.name.localeCompare(b.name)),
    };
  }, [knowledgeGraph]);

  const handleShowInfo = () => {
    if (selectedFeature) {
      const info = getEnablementInfo(selectedFeature);
      setEnablementInfo(info);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">3. Enable a Feature</h2>
      <p className="mb-4 text-gray-600">Select a feature to see all required dependencies and configuration parameters.</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-200"
        >
          <option value="">-- Select a Feature --</option>
          {featureOptions.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <button
          onClick={handleShowInfo}
          disabled={!selectedFeature}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Show Info
        </button>
      </div>

      {enablementInfo && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Features to Enable:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {enablementInfo.featuresToEnable.map(name => (
                <span key={name} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{name}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Required Parameters:</h3>
            <ul className="mt-2 space-y-2">
              {enablementInfo.requiredParameters.map(param => (
                <li key={param.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-mono font-semibold text-purple-800">{param.name} <span className="text-sm font-sans text-gray-500">({param.type})</span></p>
                  <p className="text-sm text-gray-600">{param.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureEnabler;
