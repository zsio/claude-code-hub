CREATE TABLE "keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "message_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"key" varchar NOT NULL,
	"message" jsonb NOT NULL,
	"duration_ms" integer,
	"cost_usd" numeric(10, 8) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "model_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_name" varchar NOT NULL,
	"price_data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"url" varchar NOT NULL,
	"key" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"tpm" integer DEFAULT 0,
	"rpm" integer DEFAULT 0,
	"rpd" integer DEFAULT 0,
	"cc" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"role" varchar DEFAULT 'user',
	"rpm_limit" integer DEFAULT 60,
	"daily_limit_usd" numeric(10, 2) DEFAULT '100.00',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
