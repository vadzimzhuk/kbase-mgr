
import React, { useState, useCallback } from 'react';
import { KnowledgeGraph, ConfigValidationResult, Feature } from '../types';

interface ConfigValidatorProps {
  knowledgeGraph: KnowledgeGraph;
  onValidationResult: (result: ConfigValidationResult) => void;
}

const ConfigValidator: React.FC<ConfigValidatorProps> = ({ knowledgeGraph, onValidationResult }) => {
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const validateConfiguration = useCallback((config: any): ConfigValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const enabledFeatures: string[] = config.enabledFeatures || [];
    const allFeatureNames = new Set(knowledgeGraph.features.map(f => f.name));

    if (!Array.isArray(enabledFeatures)) {
        errors.push("`enabledFeatures` must be an array of feature names.");
        return { isValid: false, errors, warnings };
    }

    const enabledFeatureSet = new Set(enabledFeatures);

    enabledFeatures.forEach(featureName => {
        if (!allFeatureNames.has(featureName)) {
            warnings.push(`Enabled feature "${featureName}" is not defined in the knowledge graph.`);
            return;
        }

        const feature = knowledgeGraph.features.find(f => f.name === featureName) as Feature;

        // Check dependencies
        feature.dependencies.forEach(dep => {
            if (!enabledFeatureSet.has(dep)) {
                errors.push(`Feature "${featureName}" is missing dependency: "${dep}".`);
            }
        });

        // Check required parameters
        feature.parameters.forEach(param => {
            if (param.required && !(param.name in config.parameters)) {
                errors.push(`Feature "${featureName}" is missing required parameter: "${param.name}".`);
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
  }, [knowledgeGraph]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        const text = await file.text();
        const config = JSON.parse(text);
        const result = validateConfiguration(config);
        setValidationResult(result);
        onValidationResult(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to read or parse file.";
        const result: ConfigValidationResult = {
            isValid: false,
            errors: [`Error processing configuration file: ${errorMessage}`],
            warnings: [],
        };
        setValidationResult(result);
        onValidationResult(result);
      }
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">2. Validate Configuration</h2>
      <p className="mb-4 text-gray-600">Upload a JSON configuration file to validate it against the current knowledge graph.</p>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".json" onChange={handleFileChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">{fileName || 'JSON up to 10MB'}</p>
        </div>
      </div>
      
      {validationResult && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Validation Results:</h3>
          {validationResult.isValid ? (
             <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
                <p className="font-bold">Configuration is valid!</p>
                {validationResult.warnings.length === 0 && <p>No errors or warnings found.</p>}
             </div>
          ) : (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p className="font-bold">Configuration is invalid</p>
            </div>
          )}

          {validationResult.errors.length > 0 && (
            <div className="mt-4">
                <h4 className="font-semibold text-red-800">Errors:</h4>
                <ul className="list-disc list-inside text-red-700">
                    {validationResult.errors.map((err, i) => <li key={`err-${i}`}>{err}</li>)}
                </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="mt-4">
                <h4 className="font-semibold text-yellow-800">Warnings:</h4>
                <ul className="list-disc list-inside text-yellow-700">
                    {validationResult.warnings.map((warn, i) => <li key={`warn-${i}`}>{warn}</li>)}
                </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigValidator;
