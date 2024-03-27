DELIMITER //

CREATE TRIGGER CheckMeterReset
BEFORE INSERT ON MeterCumulativeEnergyUsage
FOR EACH ROW
BEGIN
    DECLARE last_reset INT;
    SET last_reset = NULL;
    
    CALL GetLastMeterReset(last_reset);
    
    IF last_reset IS NOT NULL AND NEW.meter_reset != last_reset THEN
        -- Your trigger action here
        -- For example:
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Reset', CONCAT('Meter reset value changed from ', last_reset, ' to ', NEW.meter_reset), 1);
    END IF;
END;
//

DELIMITER ;
