export var TimeOperatorEnum;
(function (TimeOperatorEnum) {
    TimeOperatorEnum["DAYS"] = "days";
    TimeOperatorEnum["HOURS"] = "hours";
    TimeOperatorEnum["MINUTES"] = "minutes";
})(TimeOperatorEnum || (TimeOperatorEnum = {}));
export var FilterPartTypeEnum;
(function (FilterPartTypeEnum) {
    FilterPartTypeEnum["PAYLOAD"] = "payload";
    FilterPartTypeEnum["SUBSCRIBER"] = "subscriber";
    FilterPartTypeEnum["WEBHOOK"] = "webhook";
    FilterPartTypeEnum["IS_ONLINE"] = "isOnline";
    FilterPartTypeEnum["IS_ONLINE_IN_LAST"] = "isOnlineInLast";
    FilterPartTypeEnum["PREVIOUS_STEP"] = "previousStep";
    FilterPartTypeEnum["TENANT"] = "tenant";
})(FilterPartTypeEnum || (FilterPartTypeEnum = {}));
export var PreviousStepTypeEnum;
(function (PreviousStepTypeEnum) {
    PreviousStepTypeEnum["READ"] = "read";
    PreviousStepTypeEnum["UNREAD"] = "unread";
    PreviousStepTypeEnum["SEEN"] = "seen";
    PreviousStepTypeEnum["UNSEEN"] = "unseen";
})(PreviousStepTypeEnum || (PreviousStepTypeEnum = {}));
