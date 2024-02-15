CREATE TRIGGER CurrentOverload
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    DECLARE sum_current DECIMAL(18,2);
    DECLARE drn_value INT;
    
    -- Calculate the sum of the last 20 current values for the current DRN
    SELECT SUM(current) INTO sum_current
    FROM (
        SELECT current
        FROM MeteringPower
        WHERE DRN = NEW.DRN
        ORDER BY id DESC
        LIMIT 20
    ) AS subquery;
    
    -- Check if the sum exceeds the threshold
    IF sum_current > 30 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Current',  concat('Too much current overload: ',sum_current), 1);
    END IF;
END;