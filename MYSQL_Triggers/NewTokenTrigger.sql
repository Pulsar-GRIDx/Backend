CREATE TRIGGER TokenPurchaseNotification
AFTER INSERT ON STSTokesInfo
FOR EACH ROW
BEGIN
    IF NEW.display_msg = 'Accept' THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type,Type)
        VALUES (NEW.DRN, 'Token Purchase', concat(NEW.token_amount ,' dollar new token accepted'), 1,'Success');
    END IF;
END;


/*Token Is not accepted*/

DELIMITER //
CREATE TRIGGER TokenPurchaseNotificationPending1
AFTER INSERT ON STSTokesInfo
FOR EACH ROW
BEGIN
    DECLARE notification_message VARCHAR(255);
    
    -- Check if the display message is not 'Accept'
    IF NEW.display_msg != 'Accept' THEN
        SET notification_message = CONCAT(NEW.token_amount, ' dollar new token not accepted');
        
        -- Insert notification into MeterNotifications table
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Token Purchase', CONCAT(notification_message,NEW.display_msg), 1, 'Pending');
    END IF;
END;
//
DELIMITER ;
