CREATE TRIGGER FrequencyDeviation
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.frequency < 0.45 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Frequency', CONCAT('Low frequency: ', NEW.frequency), 1,'Critical');
    END IF;
END;