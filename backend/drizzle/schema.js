"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = exports.account = exports.user = exports.verification = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.verification = (0, pg_core_1.pgTable)("verification", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    identifier: (0, pg_core_1.text)().notNull(),
    value: (0, pg_core_1.text)().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { mode: 'string' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);
exports.user = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)().notNull(),
    emailVerified: (0, pg_core_1.boolean)("email_verified").default(false).notNull(),
    image: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("user_email_unique").on(table.email),
]);
exports.account = (0, pg_core_1.pgTable)("account", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    accountId: (0, pg_core_1.text)("account_id").notNull(),
    providerId: (0, pg_core_1.text)("provider_id").notNull(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    idToken: (0, pg_core_1.text)("id_token"),
    accessTokenExpiresAt: (0, pg_core_1.timestamp)("access_token_expires_at", { mode: 'string' }),
    refreshTokenExpiresAt: (0, pg_core_1.timestamp)("refresh_token_expires_at", { mode: 'string' }),
    scope: (0, pg_core_1.text)(),
    password: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.user.id],
        name: "account_user_id_user_id_fk"
    }).onDelete("cascade"),
]);
exports.session = (0, pg_core_1.pgTable)("session", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { mode: 'string' }).notNull(),
    token: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    userId: (0, pg_core_1.text)("user_id").notNull(),
}, (table) => [
    (0, pg_core_1.index)("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.user.id],
        name: "session_user_id_user_id_fk"
    }).onDelete("cascade"),
    (0, pg_core_1.unique)("session_token_unique").on(table.token),
]);
//# sourceMappingURL=schema.js.map