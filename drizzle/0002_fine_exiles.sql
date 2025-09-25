CREATE INDEX "idx_keys_user_id" ON "keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_keys_created_at" ON "keys" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_keys_deleted_at" ON "keys" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_message_request_user_date_cost" ON "message_request" USING btree ("user_id","created_at","cost_usd") WHERE "message_request"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_message_request_user_query" ON "message_request" USING btree ("user_id","created_at") WHERE "message_request"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_message_request_provider_id" ON "message_request" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_message_request_user_id" ON "message_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_message_request_key" ON "message_request" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_message_request_created_at" ON "message_request" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_message_request_deleted_at" ON "message_request" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_model_prices_latest" ON "model_prices" USING btree ("model_name","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_model_prices_model_name" ON "model_prices" USING btree ("model_name");--> statement-breakpoint
CREATE INDEX "idx_model_prices_created_at" ON "model_prices" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_providers_enabled_weight" ON "providers" USING btree ("is_enabled","weight") WHERE "providers"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_providers_created_at" ON "providers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_providers_deleted_at" ON "providers" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_users_active_role_sort" ON "users" USING btree ("deleted_at","role","id") WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at");