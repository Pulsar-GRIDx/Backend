DELIMITER //

CREATE TRIGGER LowEnergyUnits
AFTER INSERT ON MeterCumulativeEnergyUsage
FOR EACH ROW
BEGIN
    IF NEW.units BETWEEN 10 AND 50 THEN
        DECLARE urgency_type INT;
        
        IF NEW.units <= 20 THEN
            SET urgency_type = 1;
        ELSEIF NEW.units <= 25 THEN
            SET urgency_type = 2;
        ELSE
            SET urgency_type = 3;
        END IF;
        
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Units', CONCAT('Low units remaining: ', NEW.units), urgency_type);
    END IF;
END;

//

DELIMITER ;
