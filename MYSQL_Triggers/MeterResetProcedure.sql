DELIMITER //

CREATE PROCEDURE GetLastMeterReset(INOUT last_reset_value INT)
BEGIN
    SELECT meter_reset INTO last_reset_value
    FROM MeterCumulativeEnergyUsage
    ORDER BY id DESC
    LIMIT 1;
END;
//

DELIMITER ;
