DELIMITER //

CREATE TRIGGER LowEnergyUnits
AFTER INSERT ON MeterCumulativeEnergyUsage
FOR EACH ROW
BEGIN
    DECLARE urgency_type INT;
    
    IF NEW.units <= 10 THEN
        SET urgency_type = 1;
    ELSEIF NEW.units BETWEEN 20 AND 25 THEN
        SET urgency_type = 2;
    ELSEIF NEW.units > 40 THEN
        SET urgency_type = 3;
    END IF;
    
    INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
    VALUES (NEW.DRN, 'Meter Units', CONCAT('Low units remaining: ', NEW.units), urgency_type);
END;

//

DELIMITER ;