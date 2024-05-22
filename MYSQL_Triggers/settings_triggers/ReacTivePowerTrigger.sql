CREATE TRIGGER ReacTivePowerTrigger
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.reactive_power >= 30 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter reactive_power', CONCAT('High reactive_power: ', NEW.reactive_power), 2,${type});
    END IF;

    IF NEW.reactive_power <= 30 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter reactive_power', CONCAT('Low reactive_power: ', NEW.reactive_power), 2,${type});
    END IF;
END;