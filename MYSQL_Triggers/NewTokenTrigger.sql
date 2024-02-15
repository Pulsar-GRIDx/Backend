CREATE TRIGGER TokenPurchaseNotification
AFTER INSERT ON STSTokenInfo
FOR EACH ROW
BEGIN
    IF NEW.display_msg = 'Accept' THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Token Purchase', concat(NEW.token_amount ,' dollar new token accepted'), 1);
    END IF;
END;
