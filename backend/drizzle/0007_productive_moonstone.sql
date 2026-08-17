CREATE TABLE "group_messeges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"body" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "group_messeges" ADD CONSTRAINT "group_messeges_group_id_group_chat_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group_chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_messeges" ADD CONSTRAINT "group_messeges_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;