DELIMITER//

CREATE TRIGGER LowActivePower
AFTER INSERT ON MeteringPower
FOR EACH ROW

BEGIN
     IF NEW.active_power <=100 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Power', CONCAT('Low active_power: ', NEW.active_power), 1);
    END IF;
END;    


DELIMITER //
