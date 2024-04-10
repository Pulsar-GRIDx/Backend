DELIMITER //

CREATE TRIGGER MeterOnOfWarning
AFTER INSERT ON MeterMainsStateTable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 AND NEW.processed = 1 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter State', CONCAT(NEW.state, ' meter turned off'), 2, 'Success');
    END IF;

    IF NEW.state = 1 AND NEW.processed = 1 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter State', CONCAT(NEW.state, ' meter turned on'), 2, 'Success');
    END IF;

    IF NEW.state = 0 AND NEW.processed = 0 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter State', CONCAT(NEW.state, ' meter not off'), 2, 'Pending');
    END IF;

    IF NEW.state = 1 AND NEW.processed = 0 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter State', CONCAT(NEW.state, ' meter not on'), 2, 'Pending');
    END IF;
END;
//

DELIMITER ;
