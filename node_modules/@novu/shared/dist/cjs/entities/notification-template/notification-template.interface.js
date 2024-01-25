"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerContextTypeEnum = exports.TriggerTypeEnum = exports.IGroupedBlueprint = void 0;
class IGroupedBlueprint {
}
exports.IGroupedBlueprint = IGroupedBlueprint;
var TriggerTypeEnum;
(function (TriggerTypeEnum) {
    TriggerTypeEnum["EVENT"] = "event";
})(TriggerTypeEnum = exports.TriggerTypeEnum || (exports.TriggerTypeEnum = {}));
var TriggerContextTypeEnum;
(function (TriggerContextTypeEnum) {
    TriggerContextTypeEnum["TENANT"] = "tenant";
    TriggerContextTypeEnum["ACTOR"] = "actor";
})(TriggerContextTypeEnum = exports.TriggerContextTypeEnum || (exports.TriggerContextTypeEnum = {}));
