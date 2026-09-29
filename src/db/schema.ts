import { pgTable, text, integer, timestamp, jsonb, serial, real, pgEnum } from 'drizzle-orm/pg-core';

export const leadTagEnum = pgEnum('lead_tag', ['hot', 'warm', 'cold']);

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  location: text('location').notNull(),
  propertyType: text('property_type').notNull(),
  propertyRequirement: text('property_requirement'),
  bhkConfig: text('bhk_config'),
  sqftMin: integer('sqft_min'),
  sqftMax: integer('sqft_max'),
  preferredFloor: text('preferred_floor'),
  facingDirection: text('facing_direction'),
  budgetMin: real('budget_min'),
  budgetMax: real('budget_max'),
  loanReady: text('loan_ready'),
  maxLoanAmount: real('max_loan_amount'),
  creditScoreRange: text('credit_score_range'),
  downPaymentAvailable: real('down_payment_available'),
  buyingTimeline: text('buying_timeline').notNull(),
  occupancyType: text('occupancy_type'),
  possessionPreference: text('possession_preference'),
  preferredAmenities: jsonb('preferred_amenities'),
  mustHaveFeatures: text('must_have_features'),
  dealBreakers: text('deal_breakers'),
  customerMessage: text('customer_message').notNull(),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const leadAnalyses = pgTable('lead_analyses', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  summary: text('summary').notNull(),
  intent: text('intent').notNull(),
  keyRequirements: jsonb('key_requirements').notNull(),
  objectionsAndConcerns: jsonb('objections_and_concerns').notNull(),
  recommendedNextAction: text('recommended_next_action').notNull(),
  suggestedResponse: text('suggested_response').notNull(),
  score: integer('score').notNull(),
  tag: leadTagEnum('tag').notNull(),
  reasoning: text('reasoning').notNull(),
  callPrepQuestions: jsonb('call_prep_questions').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  type: text('type').notNull(),
  bhk: text('bhk'),
  sqft: integer('sqft').notNull(),
  priceInr: real('price_inr').notNull(),
  amenities: jsonb('amenities'),
  builder: text('builder').notNull(),
  possessionStatus: text('possession_status').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
