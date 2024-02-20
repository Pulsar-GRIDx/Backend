CREATE TRIGGER HighActivePower
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.active_power > 10000 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Active Power', concat('High active power: ',NEW.active_power), 1);
    END IF;
END;