import { ProductFilter } from "@/lib/ai/models";
import { db } from "@/lib/db/db-client";
import { Product, product } from "@/lib/db/schema";
import { eq, and, SQL, sql, inArray } from "drizzle-orm";

export async function getProductById({ id }: { id: string }) {
    try {
        const p = await db.select().from(product).where(eq(product.id, id));
        return p;
    } catch (error) {
        console.error('Failed to get product by id', error);
        throw error;
    }
}

export async function getProducts() {
    try {
        const p = await db.select().from(product);
        return p;
    } catch (error) {
        console.error('Failed to get products', error);
        throw error;
    }
}

export async function createProduct({ prod }: { prod: Product }) {
    try {
        const p = await db.insert(product).values(prod);
        return p;
    } catch (error) {
        console.error('Failed to create product', error);
        throw error;
    }
}

export async function updateProduct({ id, prod }: { id: string, prod: Product }) {
    try {
        const p = await db.update(product).set(prod).where(eq(product.id, id));
        return p;
    } catch (error) {
        console.error('Failed to update product', error);
        throw error;
    }
}

export async function deleteProduct({ id }: { id: string }) {
    try {
        const p = await db.delete(product).where(eq(product.id, id));
        return p;
    } catch (error) {
        console.error('Failed to delete product', error);
        throw error;
    }
}

export async function getProductsByFilter({ filter }: { filter: ProductFilter }) {
    try {
        // // For semantic search with AI
        // if (filter.search) {
        //     return await semanticProductSearch(filter);
        // }

        // For regular filtering without search term
        const conditions: SQL[] = [];

        if (filter.categories) {
            conditions.push(inArray(product.category, filter.categories));
        }

        if (filter.subCategories) {
            conditions.push(inArray(product.subCategory, filter.subCategories));
        }

        if (filter.providers) {
            conditions.push(inArray(product.provider, filter.providers));
        }

        if (filter.origins) {
            conditions.push(inArray(product.origin, filter.origins));
        }

        // Use SQL literals for proper JSON field filtering
        if (filter.colors) {
            conditions.push(sql`${product.colors}::jsonb ?| ${filter.colors}`);
        }

        if (filter.sizes) {
            conditions.push(sql`${product.sizesPrices}::jsonb @> ${JSON.stringify(filter.sizes.map(size => ({ size })))}::jsonb`);
        }

        // Execute regular query
        const products = conditions.length > 0
            ? await db.select().from(product).where(and(...conditions))
            : await db.select().from(product);

        return products;
    } catch (error) {
        console.error('Failed to get products by filter', error);
        throw error;
    }
}


