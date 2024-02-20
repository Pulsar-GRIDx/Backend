CREATE TRIGGER GyserOnOfWarning
AFTER INSERT ON metermainsstatetable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter State', concat(NEW.state,'meter turned off'), 2);
    END IF  NEW.state = 1 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter State', concat(NEW.state,'meter turned on'), 2);
    ;
END;