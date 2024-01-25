"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservedVariablesMap = exports.TriggerReservedVariables = exports.SystemVariablesWithTypes = exports.TemplateSystemVariables = void 0;
const types_1 = require("../../types");
const notification_template_1 = require("../notification-template");
exports.TemplateSystemVariables = ['subscriber', 'step', 'branding', 'tenant', 'preheader', 'actor'];
exports.SystemVariablesWithTypes = {
    subscriber: {
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        phone: 'string',
        avatar: 'string',
        locale: 'string',
        subscriberId: 'string',
    },
    actor: {
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        phone: 'string',
        avatar: 'string',
        locale: 'string',
        subscriberId: 'string',
    },
    step: {
        digest: 'boolean',
        events: 'array',
        total_count: 'number',
    },
    branding: {
        logo: 'string',
        color: 'string',
    },
    tenant: {
        name: 'string',
        data: 'object',
    },
};
exports.TriggerReservedVariables = ['tenant', 'actor'];
exports.ReservedVariablesMap = {
    [notification_template_1.TriggerContextTypeEnum.TENANT]: [{ name: 'identifier', type: types_1.TemplateVariableTypeEnum.STRING }],
    [notification_template_1.TriggerContextTypeEnum.ACTOR]: [{ name: 'subscriberId', type: types_1.TemplateVariableTypeEnum.STRING }],
};
