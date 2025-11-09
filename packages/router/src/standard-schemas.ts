/**
 * Standard schemas for agent interoperability
 * Agents that follow these schemas can auto-chain without manual mapping
 */

export interface StandardSchema {
  name: string;
  version: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

/**
 * Standard schemas registry
 */
export const STANDARD_SCHEMAS: Record<string, StandardSchema> = {
  // Text processing - for translation, summarization, analysis, etc.
  'text_processing_v1': {
    name: 'text_processing',
    version: 'v1',
    description: 'Standard schema for text input/output operations',
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', description: 'The text to process' },
        language: { type: 'string', description: 'Language code (ISO 639-1)' },
        metadata: { type: 'object', description: 'Optional metadata' }
      }
    },
    outputSchema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', description: 'The processed text result' },
        language: { type: 'string', description: 'Language code of result' },
        metadata: { type: 'object', description: 'Additional result metadata' }
      }
    }
  },

  // Image processing - for generation, transformation, analysis
  'image_processing_v1': {
    name: 'image_processing',
    version: 'v1',
    description: 'Standard schema for image operations',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'URL to input image' },
        image_base64: { type: 'string', description: 'Base64 encoded image' },
        prompt: { type: 'string', description: 'Text prompt for generation/editing' },
        metadata: { type: 'object', description: 'Optional metadata' }
      }
    },
    outputSchema: {
      type: 'object',
      required: ['image_url'],
      properties: {
        image_url: { type: 'string', description: 'URL to output image' },
        image_base64: { type: 'string', description: 'Base64 encoded result' },
        metadata: { type: 'object', description: 'Image metadata (size, format, etc)' }
      }
    }
  },

  // Sentiment/Analysis - for sentiment, intent, classification
  'analysis_v1': {
    name: 'analysis',
    version: 'v1',
    description: 'Standard schema for analysis operations',
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', description: 'Text to analyze' },
        analysis_type: { type: 'string', description: 'Type of analysis requested' },
        metadata: { type: 'object' }
      }
    },
    outputSchema: {
      type: 'object',
      required: ['result'],
      properties: {
        result: { type: 'object', description: 'Analysis results' },
        confidence: { type: 'number', description: 'Confidence score 0-1' },
        metadata: { type: 'object' }
      }
    }
  },

  // Generic data transformation
  'data_transform_v1': {
    name: 'data_transform',
    version: 'v1',
    description: 'Standard schema for arbitrary data transformations',
    inputSchema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: { description: 'Input data (any type)' },
        transform_params: { type: 'object', description: 'Transformation parameters' }
      }
    },
    outputSchema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: { description: 'Transformed output data' },
        metadata: { type: 'object' }
      }
    }
  }
};

/**
 * Check if two schemas are compatible for chaining
 */
export function areSchemasCompatible(outputSchema: string, inputSchema: string): boolean {
  // Same schema = compatible
  if (outputSchema === inputSchema) {
    return true;
  }

  // Define compatible schema pairs
  const compatiblePairs: Record<string, string[]> = {
    'text_processing_v1': ['text_processing_v1', 'analysis_v1'], // text can go to analysis
    'image_processing_v1': ['image_processing_v1'], // images stay in image domain
    'analysis_v1': ['text_processing_v1', 'analysis_v1'], // analysis can go back to text
  };

  return compatiblePairs[outputSchema]?.includes(inputSchema) || false;
}

/**
 * Map data between compatible schemas
 */
export function mapBetweenSchemas(
  data: any,
  fromSchema: string,
  toSchema: string
): any {
  // Same schema = no mapping needed
  if (fromSchema === toSchema) {
    return data;
  }

  // text_processing -> analysis
  if (fromSchema === 'text_processing_v1' && toSchema === 'analysis_v1') {
    return {
      text: data.text,
      metadata: data.metadata
    };
  }

  // analysis -> text_processing
  if (fromSchema === 'analysis_v1' && toSchema === 'text_processing_v1') {
    // If analysis result has text, use it; otherwise stringify result
    return {
      text: data.result?.text || JSON.stringify(data.result),
      metadata: data.metadata
    };
  }

  // Default: pass through
  return data;
}

