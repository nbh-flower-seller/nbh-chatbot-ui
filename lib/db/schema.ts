import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const userCredentials = pgTable('UserCredentials', {
  userId: uuid('userId')
    .notNull()
    .references(() => userAccount.id),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type UserCredentials = InferSelectModel<typeof userCredentials>;

export const address = pgTable('Address', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 64 }).notNull(),
  address: varchar('address', { length: 64 }).notNull(),
});

export type Address = InferSelectModel<typeof address>;

export const userAccount = pgTable('UserAccount', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 64 }).notNull(),
  email: varchar('email', { length: 64 }).notNull(),
  phone: varchar('phone', { length: 64 }),
  address: varchar('address', { length: 64 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type UserAccount = InferSelectModel<typeof userAccount>;

export const conversation = pgTable('Conversation', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => userAccount.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Conversation = InferSelectModel<typeof conversation>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  conversationId: uuid('conversationId')
    .notNull()
    .references(() => conversation.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    conversationId: uuid('conversationId')
      .notNull()
      .references(() => conversation.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.conversationId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => userAccount.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => userAccount.id),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const userStatus = pgEnum('userStatus', ['pending', 'active', 'inactive']);

export type UserStatus = (typeof userStatus.enumValues)[number];

export const customerProfile = pgTable('CustomerProfile', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => userAccount.id),
  billingAddress: uuid('billingAddress').references(() => address.id),
  deliveryAddress: uuid('deliveryAddress').references(() => address.id),
  status: userStatus('status').notNull().default('pending'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type CustomerProfile = InferSelectModel<typeof customerProfile>;

export const orderStatus = pgEnum('orderStatus', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);

export type OrderStatus = (typeof orderStatus.enumValues)[number];

export const order = pgTable('Order', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => userAccount.id),
  status: orderStatus('status').notNull().default('pending'),
  discount: integer('discount').notNull(),
  receivedAt: timestamp('receivedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type Order = InferSelectModel<typeof order>;

export const labelType = pgEnum('labelType', ['origin', 'category', 'subCategory', 'tag', 'color', 'size']);

export type LabelType = (typeof labelType.enumValues)[number];

export const label = pgTable('Label', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  labelType: labelType('labelType').notNull(),
  name: varchar('name', { length: 64 }).notNull(),
  description: text('description'),
});

export type Label = InferSelectModel<typeof label>;

export const provider = pgTable('Provider', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 64 }).notNull(),
  origin: uuid('origin').references(() => label.id),
});

export type Provider = InferSelectModel<typeof provider>;

export const product = pgTable('Product', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 64 }).notNull(),
  description: text('description'),
  origin: uuid('origin').references(() => label.id),
  provider: uuid('provider').references(() => provider.id),
  colors: json('colors').$type<Array<string>>().notNull(),
  sizesPrices: json('sizesPrices').$type<Array<{ size: string, price: number }>>().notNull(),
  category: uuid('category').references(() => label.id),
  subCategory: uuid('subCategory').references(() => label.id),
  tags: json('tags').$type<Array<string>>().notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type Product = InferSelectModel<typeof product>;

export const orderItem = pgTable('OrderItem', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  orderId: uuid('orderId')
    .notNull()
    .references(() => order.id),
  stockId: uuid('stockId')
    .notNull()
    .references(() => stock.id),
  quantity: integer('quantity').notNull(),
  discount: integer('discount').notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type OrderItem = InferSelectModel<typeof orderItem>;

export const role = pgEnum('role', ['customer', 'admin', 'vendor', 'manager', 'system', 'staff', 'shipper']);

export type Role = (typeof role.enumValues)[number];

export const userRole = pgTable('UserRole', {
  userId: uuid('userId')
    .notNull()
    .references(() => userAccount.id),
  role: role('role').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type UserRole = InferSelectModel<typeof userRole>;

export const permission = pgEnum('permission', ['read', 'write', 'delete']);

export type Permission = (typeof permission.enumValues)[number];

export const resource = pgEnum('resource', ['user', 'product', 'order', 'conversation', 'message', 'vote', 'document', 'suggestion', 'customerProfile', 'orderItem', 'label', 'provider']);

export type Resource = (typeof resource.enumValues)[number];

export const userRolePermission = pgTable('UserRolePermission', {
  role: role('role').notNull(),
  permission: permission('permission').notNull(),
  resource: resource('resource').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type UserRolePermission = InferSelectModel<typeof userRolePermission>;

export const stockStatus = pgEnum('stockStatus', ['in-stock', 'on-air', 'vendor-comfirmed']);

export type StockStatus = (typeof stockStatus.enumValues)[number];

export const stock = pgTable('Stocks', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  productId: uuid('productId')
    .notNull()
    .references(() => product.id),
  quantity: integer('quantity').notNull(),
  status: stockStatus('status').notNull().default('vendor-comfirmed'),
  availableAt: timestamp('availableAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type Stock = InferSelectModel<typeof stock>;

export const shipmentStatus = pgEnum('shipmentStatus', ['waiting', 'shipping', 'delivered', 'cancelled']);

export type ShipmentStatus = (typeof shipmentStatus.enumValues)[number];

export const shipment = pgTable('Shipment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  orderId: uuid('orderId')
    .notNull()
    .references(() => order.id),
  deliveryAddress: uuid('deliveryAddress').references(() => address.id),
  deliveryDate: timestamp('deliveryDate').notNull(),
  deliveryTime: timestamp('deliveryTime').notNull(),
  deliveryCost: integer('deliveryCost').notNull(),
  deliverStaff: uuid('deliverStaff').references(() => userAccount.id),
  status: shipmentStatus('status').notNull().default('waiting'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type Shipment = InferSelectModel<typeof shipment>;

