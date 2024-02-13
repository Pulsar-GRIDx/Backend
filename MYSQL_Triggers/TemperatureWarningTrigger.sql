CREATE TRIGGER TemperatureWarning
AFTER UPDATE ON meteringpower
FOR EACH ROW
BEGIN
    IF NEW.temperature > 90 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Temperature', CONCAT('High temperature: ', NEW.temperature), 1);
    END IF;
END;