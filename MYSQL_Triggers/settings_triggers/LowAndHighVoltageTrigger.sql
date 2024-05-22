DELIMITER //

CREATE TRIGGER LowAndHighVoltageTrigger
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.voltage >= 300 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Voltage', CONCAT('High Voltage: ', NEW.voltage), 2, 'Warning');
    END IF;

    IF NEW.voltage <= 100 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Voltage', CONCAT('Low Voltage: ', NEW.voltage), 2, 'Warning');
    END IF;
END //

DELIMITER ;
