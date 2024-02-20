CREATE TRIGGER GyserOnOfWarning
AFTER update ON meterheaterstatetable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Gyser State', concat(NEW.state,'gyser turned off'), 2);
    END IF  NEW.state = 1 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Gyser State', concat(NEW.state,'gyser turned on'), 2);
    ;
END;