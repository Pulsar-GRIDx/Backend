CREATE TRIGGER TemperatureWarning
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.temperature > 90 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type,Type)
        VALUES (NEW.DRN, 'Meter Temperature', CONCAT('High temperature: ', NEW.temperature), 1,'Warning');
    END IF;
END;