import { config } from 'dotenv';
import postgres from 'postgres';
import {
  userCredentials,
  userAccount,
  conversation,
  message,
  vote,
  address,
  customerProfile,
  order,
  orderItem,
  label,
  provider,
  product,
  suggestion,
  document,
  userStatus,
  orderStatus,
  labelType,
} from '../schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { inArray } from 'drizzle-orm';
import { appendResponseMessages, UIMessage } from 'ai';

config({
  path: '.env.local',
});

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const client = postgres(process.env.POSTGRES_URL);
const db = drizzle(client);

const BATCH_SIZE = 50; // Process 10 chats at a time
const INSERT_BATCH_SIZE = 100; // Insert 100 messages at a time

type NewMessageInsert = {
  id: string;
  conversationId: string;
  parts: any[];
  role: string;
  attachments: any[];
  createdAt: Date;
};

type NewVoteInsert = {
  messageId: string;
  conversationId: string;
  isUpvoted: boolean;
};

async function createNewTable() {
  const conversations = await db.select().from(conversation);
  let processedCount = 0;

  // Process chats in batches
  for (let i = 0; i < conversations.length; i += BATCH_SIZE) {
    const conversationBatch = conversations.slice(i, i + BATCH_SIZE);
    const conversationIds = conversationBatch.map((conversation) => conversation.id);

    // Fetch all messages and votes for the current batch of chats in bulk
    const allMessages = await db
      .select()
      .from(message)
      .where(inArray(message.conversationId, conversationIds));

    const allVotes = await db
      .select()
      .from(vote)
      .where(inArray(vote.conversationId, conversationIds));

    // Prepare batches for insertion
    const newMessagesToInsert: NewMessageInsert[] = [];
    const newVotesToInsert: NewVoteInsert[] = [];

    // Process each chat in the batch
    for (const conversation of conversationBatch) {
      processedCount++;
      console.info(`Processed ${processedCount}/${conversations.length} conversations`);

      // Filter messages and votes for this specific chat
      const messages = allMessages.filter((msg) => msg.conversationId === conversation.id);
      const votes = allVotes.filter((v) => v.conversationId === conversation.id);

      // Group messages into sections
      const messageSection: Array<UIMessage> = [];
      const messageSections: Array<Array<UIMessage>> = [];

      for (const message of messages) {
        const { role } = message;

        if (role === 'user' && messageSection.length > 0) {
          messageSections.push([...messageSection]);
          messageSection.length = 0;
        }

        // @ts-expect-error message.content has different type
        messageSection.push(message);
      }

      if (messageSection.length > 0) {
        messageSections.push([...messageSection]);
      }

      // Process each message section
      for (const section of messageSections) {
        const [userMessage, ...assistantMessages] = section;

        const [firstAssistantMessage] = assistantMessages;

        try {
          const uiSection = appendResponseMessages({
            messages: [userMessage],
            // @ts-expect-error: message.content has different type
            responseMessages: assistantMessages,
            _internal: {
              currentDate: () => firstAssistantMessage.createdAt ?? new Date(),
            },
          });

          const projectedUISection = uiSection
            .map((message) => {
              if (message.role === 'user') {
                return {
                  id: message.id,
                  conversationId: conversation.id,
                  parts: [{ type: 'text', text: message.content }],
                  role: message.role,
                  createdAt: message.createdAt,
                  attachments: [],
                } as NewMessageInsert;
              } else if (message.role === 'assistant') {
                return {
                  id: message.id,
                  conversationId: conversation.id,
                  parts: message.parts || [],
                  role: message.role,
                  createdAt: message.createdAt,
                  attachments: [],
                } as NewMessageInsert;
              }
              return null;
            })
            .filter((msg): msg is NewMessageInsert => msg !== null);

          // Add messages to batch
          for (const msg of projectedUISection) {
            newMessagesToInsert.push(msg);

            if (msg.role === 'assistant') {
              const voteByMessage = votes.find((v) => v.messageId === msg.id);
              if (voteByMessage) {
                newVotesToInsert.push({
                  messageId: msg.id,
                  conversationId: msg.conversationId,
                  isUpvoted: voteByMessage.isUpvoted,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error processing conversation ${conversation.id}: ${error}`);
        }
      }
    }

    // Batch insert messages
    for (let j = 0; j < newMessagesToInsert.length; j += INSERT_BATCH_SIZE) {
      const messageBatch = newMessagesToInsert.slice(j, j + INSERT_BATCH_SIZE);
      if (messageBatch.length > 0) {
        // Ensure all required fields are present
        const validMessageBatch = messageBatch.map((msg) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          parts: msg.parts,
          role: msg.role,
          attachments: msg.attachments,
          createdAt: msg.createdAt,
        }));

        await db.insert(message).values(validMessageBatch);
      }
    }

    // Batch insert votes
    for (let j = 0; j < newVotesToInsert.length; j += INSERT_BATCH_SIZE) {
      const voteBatch = newVotesToInsert.slice(j, j + INSERT_BATCH_SIZE);
      if (voteBatch.length > 0) {
        await db.insert(vote).values(voteBatch);
      }
    }
  }

  console.info(`Migration completed: ${processedCount} chats processed`);
}

createNewTable()
  .then(() => {
    console.info('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
