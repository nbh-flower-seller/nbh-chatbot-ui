import { db } from "@/lib/db/db-client";
import { product, Product } from "@/lib/db/schema";
import { ProductFilter } from "@/lib/ai/models";
import { generateObject, generateText, DataStreamWriter, tool } from 'ai'
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { inArray } from "drizzle-orm";
import { Session } from 'next-auth';

interface CheckProductProps {
    session: Session;
    dataStream: DataStreamWriter;
}

export const checkProduct = ({ session, dataStream }: CheckProductProps) =>
    tool({
        description: "Check if a product exists in the database. Find product by name, description, tags, colors, sizes, providers, origins",
        parameters: z.object({
            search: z.string().describe("The search query to check"),
            categories: z.array(z.string()).describe("The categories of the product to check"),
            subCategories: z.array(z.string()).describe("The sub-categories of the product to check"),
            tags: z.array(z.string()).describe("The tags of the product to check"),
            colors: z.array(z.string()).describe("The colors of the product to check"),
            sizes: z.array(z.string()).describe("The sizes of the product to check"),
            providers: z.array(z.string()).describe("The providers of the product to check"),
            origins: z.array(z.string()).describe("The origins of the product to check"),
        }),
        execute: async ({ search, categories, subCategories, tags, colors, sizes, providers, origins }) => {
            // Log the search for the user in the data stream
            dataStream.writeData({
                type: 'search-query',
                content: search,
            });

            const products = await semanticProductSearch({ search, categories, subCategories, tags, colors, sizes, providers, origins });

            if (products.length === 0) {
                dataStream.writeData({
                    type: 'search-result',
                    content: 'No products found',
                });
                return "No products found";
            }

            const productIds = products.map(p => p.id);

            const productDetails = await db.select().from(product).where(inArray(product.id, productIds));

            dataStream.writeData({
                type: 'search-result',
                content: `Found ${productDetails.length} products`,
            });

            return productDetails;
        }
    });

// Semantic product search using AI
async function semanticProductSearch(filter: ProductFilter): Promise<Product[]> {
    // 1. Fetch all products for local filtering
    const allProducts = await db.select().from(product);

    // 2. Use AI to understand search intent and expand search terms
    const { expandedTerms, searchIntent } = await analyzeSearchQuery(filter.search || "");

    // 3. Apply standard filtering conditions
    let filteredProducts = allProducts;

    if (filter.categories) {
        filteredProducts = filteredProducts.filter(p => filter.categories?.includes(p.category || ""));
    }

    if (filter.subCategories) {
        filteredProducts = filteredProducts.filter(p => filter.subCategories?.includes(p.subCategory || ""));
    }

    if (filter.tags) {
        filteredProducts = filteredProducts.filter(p => filter.tags?.some(tag => p.tags?.includes(tag)));
    }

    if (filter.colors) {
        filteredProducts = filteredProducts.filter(p => filter.colors?.some(color => p.colors?.includes(color)));
    }

    if (filter.sizes) {
        filteredProducts = filteredProducts.filter(p => filter.sizes?.some(size => p.sizesPrices?.some(sp => sp.size === size)));
    }

    if (filter.providers) {
        filteredProducts = filteredProducts.filter(p => filter.providers?.some(provider => p.provider?.includes(provider)));
    }

    if (filter.origins) {
        filteredProducts = filteredProducts.filter(p => filter.origins?.some(origin => p.origin?.includes(origin)));
    }


    // 4. Score products based on relevance to search query
    const scoredProducts = await scoreProductsByRelevance(filteredProducts, expandedTerms, searchIntent);

    // 5. Return sorted results
    return scoredProducts;
}

// Use AI to analyze search query and expand terms
async function analyzeSearchQuery(query: string): Promise<{ expandedTerms: string[], searchIntent: string }> {
    const prompt = `
        Analyze this product search query: "${query}"
        
        1. Identify the main search intent (e.g., "looking for winter clothing", "searching for mobile phone")
        2. Extract key search terms
        3. Expand with relevant related terms
        4. Format the result as JSON with fields: searchIntent, expandedTerms (array)
    `;

    const response = await generateObject({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: prompt }],
        schema: z.object({
            searchIntent: z.string(),
            expandedTerms: z.array(z.string())
        })
    });

    const result = response.object;
    return {
        expandedTerms: result.expandedTerms || [query],
        searchIntent: result.searchIntent || query
    };
}

// Score products by relevance to search terms
async function scoreProductsByRelevance(
    products: Product[],
    searchTerms: string[],
    searchIntent: string
): Promise<Product[]> {
    if (products.length === 0) return [];

    // For small datasets, we can use AI directly
    if (products.length <= 20) {
        return await rankProductsWithAI(products, searchTerms, searchIntent);
    }

    // For larger datasets, implement a hybrid approach:
    // 1. Simple keyword matching for initial filtering
    const keywordMatched = products.filter(p =>
        searchTerms.some(term =>
            p.name.toLowerCase().includes(term.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(term.toLowerCase()))
        )
    );

    // 2. Use AI to rank the filtered results
    return await rankProductsWithAI(
        keywordMatched.length > 0 ? keywordMatched : products.slice(0, 20),
        searchTerms,
        searchIntent
    );
}

// Use AI to rank products
async function rankProductsWithAI(
    products: Product[],
    searchTerms: string[],
    searchIntent: string
): Promise<Product[]> {
    const productsData = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        tags: p.tags,
        category: p.category,
        subCategory: p.subCategory
    }));

    const prompt = `
        Rank these products by relevance to the search intent: "${searchIntent}"
        and search terms: ${JSON.stringify(searchTerms)}
        
        Products:
        ${JSON.stringify(productsData)}
        
        Return JSON array of product IDs in order of relevance.
    `;

    const response = await generateObject({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: prompt }],
        schema: z.object({
            rankedIds: z.array(z.string())
        })
    });

    const rankedIds = response.object.rankedIds || [];

    // Map back to products and preserve original order for any products not ranked
    const rankedProducts: Product[] = [];
    const rankedIdSet = new Set(rankedIds);

    // First add ranked products in their ranked order
    for (const id of rankedIds) {
        const product = products.find(p => p.id === id);
        if (product) rankedProducts.push(product);
    }

    // Then add any remaining products
    for (const product of products) {
        if (!rankedIdSet.has(product.id)) {
            rankedProducts.push(product);
        }
    }

    return rankedProducts;
}