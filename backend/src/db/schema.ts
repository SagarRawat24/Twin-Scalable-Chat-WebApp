
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, uuid, serial,primaryKey , integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);


// chat ui

export const chatList = pgTable(
  "chat_list",
  { 
    id: uuid("id").defaultRandom().primaryKey(), 
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    addedUserId: text("added_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // indexing for fast qury
    index("chat_list_owner_idx").on(table.ownerId),
    index("chat_list_added_user_idx").on(table.addedUserId),

    // Composite unique constraint  Now user cannot add same person twice.
    {
      name: "chat_list_unique",
      columns: [table.ownerId, table.addedUserId],
      unique: true,
    },
  ]
);

// one to one msg table 

export const  UserMessages = pgTable("user_messages",{
  id: uuid("id").defaultRandom().primaryKey(),
  senderUserId: text("sender_user_id").notNull().references(() => user.id,{ onDelete: "cascade" }),
  receiverUserId: text("receiver_user_id").notNull().references(() => user.id,{ onDelete: "cascade" }),
  body: text("body"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// storing group chat msg

export const GroupMesseges = pgTable("group_messeges",{
   
   id: uuid('id').defaultRandom().primaryKey(),
   groupid: uuid('group_id').notNull().references(() => GroupChat.id, {onDelete:"cascade"}),
   senderId: text('sender_id').notNull().references(() => user.id , {onDelete:"cascade"}),
   body:text('body'),
   imageUrl: text("image_url"),
   createdAt: timestamp("created_at").defaultNow().notNull()

})


// group chat msg table 

export const GroupChat = pgTable("group_chat",{

 id: uuid('id').defaultRandom().primaryKey(),
 groupName: text('group_name').notNull(),
 createdBy: text('created_by').references(()=> user.id),
 createdAt: timestamp("created_at").defaultNow(),


})


// group members tables 

export const GroupMembers = pgTable('group_members' , {
   
   groupId: uuid("group_id").notNull().references(() => GroupChat.id, {onDelete:"cascade"}),
   userId: text("user_id").notNull().references(() => user.id , {onDelete:"cascade"})

},
  
// so it is rule applied on the whole table purpose of at function is that a user cant be member of same group twice like this [(g1,u1),(g1,u1)]
// in dono ko mila kr ek composite or single primary key bna rhe h 
   (table) => ({
        pk: primaryKey({ columns: [table.groupId, table.userId] }),
    }),

)


//syntax 

// export const <CurrentTable>Relations = relations(<CurrentTable>, ({ one, many }) => ({
//   <relationName>: one(<TARGET_TABLE>, {
//     fields: [<CurrentTable>.<fkColumnInCurrentTable>],
//     references: [<TARGET_TABLE>.<pkColumnInTargetTable>],
//   }),
// }));

// groupmessages table relation
export const GroupMessegesRelations = relations(GroupMesseges , ({one}) => ({
 group: one(GroupChat,{fields:[GroupMesseges.groupid],references:[GroupChat.id]}),
 sender: one(user,{fields:[GroupMesseges.senderId],references:[user.id]})
   

}))

export const groupRelations = relations(GroupChat , ({many,one}) => ({
  members:many(GroupMembers),
  creator: one(user,{fields:[GroupChat.createdBy], references: [user.id] })
  
}))

export const groupMembersRelations = relations(GroupMembers, ({one}) => ({
  group: one(GroupChat,{fields:[GroupMembers.groupId],references:[GroupChat.id]}),
  user: one(user,{fields:[GroupMembers.userId], references:[user.id]})
}))


export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  groupMemberships: many(GroupMembers)

}));


export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));


// relation for chat list 

export const chatListRelations = relations(chatList, ({ one }) => ({
  owner: one(user, {
    fields: [chatList.ownerId],
    references: [user.id],
  }),
  addedUser: one(user, {
    fields: [chatList.addedUserId],
    references: [user.id],
  }),
}));


// // relation one to one msg

export const directMessageRelations = relations(UserMessages, ({ one }) => ({
  sender: one(user, {
    fields: [UserMessages.senderUserId],
    references: [user.id],
    relationName: "dm_sender",
  }),
  receiver: one(user, {
    fields: [UserMessages.receiverUserId],
    references: [user.id],
    relationName: "dm_receiver",
  }),
}));