DELIMITER //

CREATE TRIGGER HighAndLowActivePower
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.active_power >= 10000 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Active Power', CONCAT('High active power: ', NEW.active_power), 1,'Critical');
    END IF;
    IF NEW.active_power <= 100 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type,Type)
        VALUES (NEW.DRN, 'Meter Active Power', CONCAT('Low active power: ', NEW.active_power), 2,'Critical');
    END IF;
END; //

DELIMITER ;