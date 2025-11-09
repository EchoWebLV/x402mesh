/**
 * Template variable resolver for chain inputs
 * Supports syntax like: {{step0.field}}, {{step1.nested.field}}
 */

/**
 * Resolve template variables in input object
 * @param input - Input object that may contain template variables
 * @param results - Array of previous step results
 * @returns Resolved input with variables replaced
 */
export function resolveTemplateVariables(input: any, results: any[]): any {
  if (input === null || input === undefined) {
    return input;
  }

  // String: check for template variables
  if (typeof input === 'string') {
    return resolveTemplateString(input, results);
  }

  // Array: resolve each element
  if (Array.isArray(input)) {
    return input.map(item => resolveTemplateVariables(item, results));
  }

  // Object: resolve each property
  if (typeof input === 'object') {
    const resolved: any = {};
    for (const [key, value] of Object.entries(input)) {
      resolved[key] = resolveTemplateVariables(value, results);
    }
    return resolved;
  }

  // Primitive: return as-is
  return input;
}

/**
 * Resolve template variables in a string
 * Supports: {{step0.field}}, {{step1.nested.field}}
 */
function resolveTemplateString(str: string, results: any[]): any {
  const templateRegex = /\{\{([^}]+)\}\}/g;
  
  // Check if the entire string is a single template variable
  const fullMatch = str.match(/^\{\{([^}]+)\}\}$/);
  if (fullMatch) {
    // Return the actual value (can be non-string)
    return resolveVariablePath(fullMatch[1].trim(), results);
  }

  // String with embedded templates - replace all and return string
  return str.replace(templateRegex, (match, path) => {
    const value = resolveVariablePath(path.trim(), results);
    // Convert to string for interpolation
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Resolve a variable path like "step0.field" or "step1.nested.field"
 */
function resolveVariablePath(path: string, results: any[]): any {
  const parts = path.split('.');
  
  // First part should be "stepN"
  const stepMatch = parts[0].match(/^step(\d+)$/);
  if (!stepMatch) {
    console.warn(`Invalid template variable: ${path} (must start with stepN)`);
    return undefined;
  }

  const stepIndex = parseInt(stepMatch[1], 10);
  
  // Check if step exists
  if (stepIndex < 0 || stepIndex >= results.length) {
    console.warn(`Invalid step index in template: step${stepIndex} (only ${results.length} steps available)`);
    return undefined;
  }

  // Navigate the path
  let value = results[stepIndex];
  for (let i = 1; i < parts.length; i++) {
    if (value === null || value === undefined) {
      console.warn(`Cannot access property ${parts[i]} of ${parts.slice(0, i).join('.')}`);
      return undefined;
    }
    value = value[parts[i]];
  }

  return value;
}

/**
 * Check if input contains any template variables
 */
export function hasTemplateVariables(input: any): boolean {
  if (typeof input === 'string') {
    return /\{\{[^}]+\}\}/.test(input);
  }

  if (Array.isArray(input)) {
    return input.some(item => hasTemplateVariables(item));
  }

  if (typeof input === 'object' && input !== null) {
    return Object.values(input).some(value => hasTemplateVariables(value));
  }

  return false;
}

/**
 * Extract all template variable references from input
 * Returns array of step indices that are referenced
 */
export function extractTemplateReferences(input: any): number[] {
  const refs = new Set<number>();

  function extract(value: any) {
    if (typeof value === 'string') {
      const matches = value.matchAll(/\{\{step(\d+)\.[^}]+\}\}/g);
      for (const match of matches) {
        refs.add(parseInt(match[1], 10));
      }
    } else if (Array.isArray(value)) {
      value.forEach(extract);
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(extract);
    }
  }

  extract(input);
  return Array.from(refs).sort((a, b) => a - b);
}

