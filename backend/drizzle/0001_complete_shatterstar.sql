CREATE TABLE "chat_list" (
	"owner_id" text NOT NULL,
	"added_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
ALTER TABLE "chat_list" ADD CONSTRAINT "chat_list_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_list" ADD CONSTRAINT "chat_list_added_user_id_user_id_fk" FOREIGN KEY ("added_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_list_owner_idx" ON "chat_list" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "chat_list_added_user_idx" ON "chat_list" USING btree ("added_user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");