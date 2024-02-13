CREATE TRIGGER FrequencyDeviation
AFTER INSERT ON meteringpower
FOR EACH ROW
BEGIN
    IF NEW.frequency < 0.45 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Frequency', CONCAT('Low frequency: ', NEW.frequency), 1);
    END IF;
END;