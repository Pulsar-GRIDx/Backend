DELIMITER //

CREATE TRIGGER PowerFactorCorrection
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.power_factor < 0.80 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Power Factor', CONCAT('Low/bad power factor: ', NEW.power_factor), 1);
    END IF;
END;


//

DELIMITER ;