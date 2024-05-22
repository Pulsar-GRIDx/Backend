
DELIMITER //

DROP TRIGGER IF EXISTS CurrentOverload;
CREATE TRIGGER CurrentOverload
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    DECLARE sum_current DECIMAL(18,2);

    -- Calculate the sum of the last 10 current values for the current DRN
    SELECT SUM(current) INTO sum_current
    FROM (
        SELECT current
        FROM MeteringPower
        WHERE DRN = NEW.DRN
        ORDER BY id DESC
        LIMIT 10
    ) AS subquery;
    
    -- Check if the sum exceeds the threshold
    IF sum_current >= 30 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Current', CONCAT('Too much current overload: ', sum_current), 2, 'Warning');
    END IF;    

    IF sum_current <= 5 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Current', CONCAT('Low current: ', sum_current), 2, 'Warning');    
    END IF;
END //

DELIMITER ;
