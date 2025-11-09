/**
 * Chain validation logic
 * Validates chains before execution to catch errors early
 */

import { extractTemplateReferences } from './template-resolver.js';
import { areSchemasCompatible } from './standard-schemas.js';

export interface ChainStep {
  agentId: string;
  capability: string;
  input?: any;
}

export interface AgentCapability {
  name: string;
  schema?: string;
  inputSchema?: any;
  outputSchema?: any;
}

export interface Agent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
}

export interface ValidationError {
  step: number;
  type: 'missing_agent' | 'missing_capability' | 'invalid_template' | 'schema_mismatch' | 'missing_input';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validate a chain before execution
 */
export async function validateChain(
  chain: ChainStep[],
  getAgent: (agentId: string) => Promise<Agent | null>
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  const agents: (Agent | null)[] = [];
  const capabilities: (AgentCapability | null)[] = [];

  // Validate each step
  for (let i = 0; i < chain.length; i++) {
    const step = chain[i];

    // Check agent exists
    const agent = await getAgent(step.agentId);
    agents.push(agent);

    if (!agent) {
      errors.push({
        step: i,
        type: 'missing_agent',
        message: `Agent not found: ${step.agentId}`
      });
      capabilities.push(null);
      continue;
    }

    // Check capability exists
    const capability = agent.capabilities.find(c => c.name === step.capability);
    capabilities.push(capability || null);

    if (!capability) {
      errors.push({
        step: i,
        type: 'missing_capability',
        message: `Capability '${step.capability}' not found on agent ${agent.name}`
      });
      continue;
    }

    // Validate template references
    if (step.input) {
      const refs = extractTemplateReferences(step.input);
      for (const ref of refs) {
        if (ref >= i) {
          errors.push({
            step: i,
            type: 'invalid_template',
            message: `Invalid template reference: step${ref} (cannot reference current or future steps)`
          });
        }
      }
    }

    // Check input requirements for non-first steps
    if (i > 0) {
      const hasExplicitInput = step.input !== undefined && step.input !== null;
      const prevCap = capabilities[i - 1];
      const currentCap = capability;

      if (!hasExplicitInput && prevCap && currentCap) {
        // No explicit input - check schema compatibility
        const prevSchema = prevCap.schema;
        const currentSchema = currentCap.schema;

        if (prevSchema && currentSchema) {
          if (!areSchemasCompatible(prevSchema, currentSchema)) {
            warnings.push(
              `Step ${i}: Schema mismatch (${prevSchema} → ${currentSchema}). ` +
              `Consider adding explicit input mapping.`
            );
          }
        } else if (!prevSchema || !currentSchema) {
          warnings.push(
            `Step ${i}: One or both agents don't declare schemas. ` +
            `Chaining may fail if output/input formats don't match.`
          );
        }
      }
    } else {
      // First step must have input
      if (!step.input) {
        errors.push({
          step: i,
          type: 'missing_input',
          message: 'First step must have input defined'
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

