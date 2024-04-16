DELIMITER //

CREATE TRIGGER LowActiveEnergy
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.apparent_power <= 1000 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type,Type)
        VALUES (NEW.DRN, 'Meter Energy', CONCAT('Low active_energy: ', NEW.apparent_power), 1,'Critical');
    END IF;
END;
//

DELIMITER ;
