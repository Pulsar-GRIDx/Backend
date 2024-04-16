DELIMITER //

CREATE TRIGGER GyserOnOfWarning
AFTER UPDATE ON MeterHeaterStateTable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 AND NEW.processed = 1 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Gyser State', CONCAT('Gyser turned off: ', NEW.state), 2, 'Success');
    END IF;

    IF NEW.state = 1 AND NEW.processed = 1 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Gyser State', CONCAT('Gyser turned on: ', NEW.state), 2, 'Success');
    END IF;

    IF NEW.state = 0 AND NEW.processed = 0 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Gyser State', CONCAT('Gyser not off: ', NEW.state), 2, 'Pending');
    END IF;

    IF NEW.state = 1 AND NEW.processed = 0 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Gyser State', CONCAT('Gyser not on: ', NEW.state), 2, 'Pending');
    END IF;
END;
//

DELIMITER ;
