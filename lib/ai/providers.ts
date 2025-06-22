import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai'
import { isTestEnvironment } from '../constants'
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
  customerServiceModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
    languageModels: {
      'chat-model': chatModel,
      'chat-model-reasoning': reasoningModel,
      'title-model': titleModel,
      'customer-service-model': customerServiceModel,
      'artifact-model': artifactModel,
    },
  })
  : customProvider({
    languageModels: {
      'chat-model': openai('o3-mini-2025-01-31'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openai('gpt-4o-2024-11-20'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openai('gpt-4o'),
      'artifact-model': openai('gpt-4o'),
      'customer-service-model': openai('gpt-4o'),
    },
    imageModels: {
      'small-model': openai.image('gpt-4o'),
    },
  });
