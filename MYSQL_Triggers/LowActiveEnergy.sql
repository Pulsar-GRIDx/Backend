DELIMITER //

CREATE TRIGGER LowActiveEnergy
AFTER INSERT ON MeterCumulativeEnergyUsage
FOR EACH ROW
BEGIN
    IF NEW.active_energy <= 1000 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Energy', CONCAT('Low active_energy: ', NEW.active_energy), 1);
    END IF;
END;
//

DELIMITER ;
