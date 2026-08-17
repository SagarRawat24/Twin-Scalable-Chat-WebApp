CREATE TABLE "user_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_user_id" text NOT NULL,
	"receiver_user_id" text NOT NULL,
	"body" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_receiver_user_id_user_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;