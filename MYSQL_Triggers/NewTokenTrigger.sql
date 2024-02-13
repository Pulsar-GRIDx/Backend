CREATE TRIGGER TokenPurchaseNotification
AFTER update ON ststokesinfo
FOR EACH ROW
BEGIN
    IF NEW.display_msg = 'Accept' THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Token Purchase', concat(NEW.token_amount ,' dollar new token accepted'), 1);
    END IF;
END;
