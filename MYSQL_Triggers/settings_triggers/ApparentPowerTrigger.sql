DELIMITER //

CREATE TRIGGER ApparentPowerTrigger
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.apparent_power >= 300 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter apparent_power', CONCAT('High apparent_power: ', NEW.reactive_power), 1,'Critical');
    END IF;

    IF NEW.apparent_power <= 100 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter apparent_power', CONCAT('Low apparent_power: ', NEW.reactive_power), 1,'Critical');
    END IF;
END //

DELIMITER ;
