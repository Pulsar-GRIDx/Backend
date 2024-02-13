-- Create the stored procedure to check for meters and update meternotifications table
DELIMITER //

CREATE PROCEDURE CheckMeteringTables()
BEGIN
    DECLARE threeHoursAgo DATETIME;
    SET threeHoursAgo = NOW() - INTERVAL 3 HOUR;

    -- Insert notifications for meters that have not sent data in the last three hours from meteringpower
    INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
    SELECT DISTINCT DRN, 'Meter Power', 'Meter has not sent data in the last three hours.', 1
    FROM meteringpower
    WHERE date_time < threeHoursAgo;

    -- Insert notifications for meters that have not sent data in the last three hours from metercumulativeenergyusage
    INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
    SELECT DISTINCT DRN, 'Meter Energy', 'Meter has not sent data in the last three hours.', 1
    FROM metercumulativeenergyusage
    WHERE date_time < threeHoursAgo;
END//

DELIMITER ;

-- Create the event scheduler to execute the stored procedure every three hours
CREATE EVENT CheckMeteringTablesEvent
ON SCHEDULE EVERY 3 HOUR
DO
BEGIN
    CALL CheckMeteringTables();
END//
