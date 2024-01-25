"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOVU_SMS_EMAIL_PROVIDERS = exports.NOVU_PROVIDERS = exports.providers = exports.inAppProviders = exports.pushProviders = exports.smsProviders = exports.emailProviders = exports.chatProviders = void 0;
const channels_1 = require("./channels");
const provider_enum_1 = require("./provider.enum");
var channels_2 = require("./channels");
Object.defineProperty(exports, "chatProviders", { enumerable: true, get: function () { return channels_2.chatProviders; } });
Object.defineProperty(exports, "emailProviders", { enumerable: true, get: function () { return channels_2.emailProviders; } });
Object.defineProperty(exports, "smsProviders", { enumerable: true, get: function () { return channels_2.smsProviders; } });
Object.defineProperty(exports, "pushProviders", { enumerable: true, get: function () { return channels_2.pushProviders; } });
Object.defineProperty(exports, "inAppProviders", { enumerable: true, get: function () { return channels_2.inAppProviders; } });
exports.providers = [
    ...channels_1.emailProviders,
    ...channels_1.smsProviders,
    ...channels_1.chatProviders,
    ...channels_1.pushProviders,
    ...channels_1.inAppProviders,
];
exports.NOVU_PROVIDERS = [
    provider_enum_1.InAppProviderIdEnum.Novu,
    provider_enum_1.SmsProviderIdEnum.Novu,
    provider_enum_1.EmailProviderIdEnum.Novu,
];
exports.NOVU_SMS_EMAIL_PROVIDERS = [provider_enum_1.SmsProviderIdEnum.Novu, provider_enum_1.EmailProviderIdEnum.Novu];
