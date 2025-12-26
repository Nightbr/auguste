#!/usr/bin/env node
/**
 * Auguste Onboarding CLI
 *
 * Interactive CLI for setting up a family's meal planning profile.
 * Uses the onboarding-agent for conversational setup.
 */

import * as readline from 'readline';
import { randomUUID } from 'crypto';
import { onboardingAgent } from '../mastra/agents';
import { closeDatabase } from '../domain';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatAgentMessage(message: string): string {
  // Add some visual styling to agent messages
  return `${colors.cyan}${colors.bold}Auguste:${colors.reset} ${message}`;
}

function formatUserPrompt(): string {
  return `${colors.green}You:${colors.reset} `;
}

async function runInitFlow(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Generate a unique thread ID for this conversation
  const threadId = randomUUID();

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}${colors.magenta}  🍳 Auguste - Family Meal Planner Setup${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  // Start the conversation with the agent
  try {
    // Initial greeting from the agent
    const initialResponse = await onboardingAgent.generate(
      'Start the setup process. Greet the user and ask for their family name.',
      { threadId }
    );

    console.log(formatAgentMessage(initialResponse.text) + '\n');

    // Main conversation loop
    const askQuestion = (): void => {
      rl.question(formatUserPrompt(), async (userInput) => {
        const trimmedInput = userInput.trim();

        // Handle exit commands
        if (['exit', 'quit', 'bye', 'goodbye'].includes(trimmedInput.toLowerCase())) {
          console.log(formatAgentMessage('Au revoir! Come back when you\'re ready to continue. 👋\n'));
          rl.close();
          closeDatabase();
          return;
        }

        // Handle empty input
        if (!trimmedInput) {
          askQuestion();
          return;
        }

        try {
          // Send user input to the agent
          const response = await onboardingAgent.generate(trimmedInput, { threadId });
          console.log('\n' + formatAgentMessage(response.text) + '\n');

          // Check if setup is complete (agent will indicate this)
          if (response.text.toLowerCase().includes('setup is complete') ||
              response.text.toLowerCase().includes('félicitations')) {
            console.log(`${colors.dim}(Type 'exit' to finish, or continue chatting)${colors.reset}\n`);
          }

          askQuestion();
        } catch (error) {
          console.error(`${colors.yellow}Error communicating with Auguste:${colors.reset}`, error);
          askQuestion();
        }
      });
    };

    askQuestion();

    // Handle readline close
    rl.on('close', () => {
      closeDatabase();
      process.exit(0);
    });

  } catch (error) {
    console.error(`${colors.yellow}Failed to start Auguste:${colors.reset}`, error);
    rl.close();
    closeDatabase();
    process.exit(1);
  }
}

// Run the init flow
runInitFlow().catch((error) => {
  console.error('Fatal error:', error);
  closeDatabase();
  process.exit(1);
});

