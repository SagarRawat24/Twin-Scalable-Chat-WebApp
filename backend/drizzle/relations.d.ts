export declare const accountRelations: import("drizzle-orm/relations").Relations<"account", {
    user: import("drizzle-orm/relations").One<"user", true>;
}>;
export declare const userRelations: import("drizzle-orm/relations").Relations<"user", {
    accounts: import("drizzle-orm/relations").Many<"account">;
    sessions: import("drizzle-orm/relations").Many<"session">;
}>;
export declare const sessionRelations: import("drizzle-orm/relations").Relations<"session", {
    user: import("drizzle-orm/relations").One<"user", true>;
}>;
//# sourceMappingURL=relations.d.ts.map