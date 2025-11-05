
export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Feature {
  name: string;
  description: string;
  dependencies: string[];
  parameters: Parameter[];
}

export interface KnowledgeGraph {
  features: Feature[];
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
