import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { Session } from 'next-auth';
import { db } from "@/lib/db/db-client";
import { product, Product } from "@/lib/db/schema";
import { ProductFilter } from "@/lib/ai/models";
import { generateObject } from 'ai';
import { openai } from "@ai-sdk/openai";
import { inArray } from "drizzle-orm";

interface MakeOrderProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const makeOrder = ({ session, dataStream }: MakeOrderProps) =>
  tool({
    description: 'Make an order with order information',
    parameters: z.object({
      order: z.object({
        product: z.string(),
        quantity: z.number(),
        date: z.string(),
      }),
    }),
    execute: async ({ order }) => {
      try {
        // Check if user is authenticated
        if (!session.user || !session.user.id) {
          const errorMessage = "User not authenticated. Please sign in to place an order.";
          dataStream.writeData({
            type: 'order-error',
            content: errorMessage,
          });
          return {
            success: false,
            message: errorMessage
          };
        }

        // Log order request to the data stream
        dataStream.writeData({
          type: 'order-request',
          content: `Processing order for ${order.product} (Quantity: ${order.quantity})`,
        });

        // Define search term
        const searchTerm = order.product;

        // Check if product exists directly in the database
        const productFilter: ProductFilter = {
          search: searchTerm,
          categories: [],
          subCategories: [],
          tags: [],
          colors: [],
          sizes: [],
          providers: [],
          origins: []
        };

        // Search for products
        const allProducts = await db.select().from(product);

        // Use AI to understand search intent and expand search terms
        const { expandedTerms, searchIntent } = await analyzeSearchQuery(searchTerm);

        // Apply standard filtering (simplified version of what's in checkProduct)
        let filteredProducts = allProducts.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filteredProducts.length === 0) {
          const errorMessage = `Cannot create order: ${order.product} not found in our catalog.`;
          dataStream.writeData({
            type: 'order-error',
            content: errorMessage,
          });
          return {
            success: false,
            message: errorMessage
          };
        }

        // Create the order with product details
        const response = await fetch('/api/order', {
          method: 'POST',
          body: JSON.stringify({
            order,
            userId: session.user.id,
            productDetails: filteredProducts
          }),
        });

        const data = await response.json();

        // Log the result to the data stream
        dataStream.writeData({
          type: 'order-result',
          content: data.success ? 'Order successfully placed' : `Order failed: ${data.message}`,
        });

        return data;
      } catch (error) {
        console.error('Error in makeOrder tool:', error);

        // Log the error to the data stream
        dataStream.writeData({
          type: 'order-error',
          content: error instanceof Error ? error.message : 'Unknown error occurred',
        });

        return {
          success: false,
          message: `Error processing order: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },
  });

// Analyze search query to get expanded terms - simplified version from checkProduct
async function analyzeSearchQuery(query: string): Promise<{ expandedTerms: string[], searchIntent: string }> {
  const prompt = `
    Analyze this product search query: "${query}"
    
    1. Identify the main search intent
    2. Extract key search terms
    3. Expand with related terms
    4. Format as JSON with fields: searchIntent, expandedTerms (array)
  `;

  try {
    const response = await generateObject({
      model: openai("gpt-4o"),
      messages: [{ role: "user", content: prompt }],
      schema: z.object({
        searchIntent: z.string(),
        expandedTerms: z.array(z.string())
      })
    });

    return {
      expandedTerms: response.object.expandedTerms || [query],
      searchIntent: response.object.searchIntent || query
    };
  } catch (error) {
    console.error('Error analyzing query:', error);
    // Fall back to just using the original query
    return {
      expandedTerms: [query],
      searchIntent: query
    };
  }
}