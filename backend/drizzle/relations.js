"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRelations = exports.userRelations = exports.accountRelations = void 0;
const relations_1 = require("drizzle-orm/relations");
const schema_1 = require("./schema");
exports.accountRelations = (0, relations_1.relations)(schema_1.account, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.account.userId],
        references: [schema_1.user.id]
    }),
}));
exports.userRelations = (0, relations_1.relations)(schema_1.user, ({ many }) => ({
    accounts: many(schema_1.account),
    sessions: many(schema_1.session),
}));
exports.sessionRelations = (0, relations_1.relations)(schema_1.session, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.session.userId],
        references: [schema_1.user.id]
    }),
}));
//# sourceMappingURL=relations.js.map