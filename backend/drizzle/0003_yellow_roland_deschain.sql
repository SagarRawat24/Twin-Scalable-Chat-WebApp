CREATE TABLE "direct_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_user_id" text NOT NULL,
	"receiver_user_id" text NOT NULL,
	"message" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_receiver_user_id_user_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;