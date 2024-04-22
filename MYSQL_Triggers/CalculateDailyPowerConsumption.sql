DELIMITER //

CREATE PROCEDURE CalculateDailyPowerConsumption()
BEGIN
    INSERT INTO DailyPowerConsumption (date, daily_power_consumption)
    SELECT 
        record_date AS date,
        SUM(initial_units) - SUM(final_units) AS daily_power_consumption
    FROM (
        SELECT 
            DRN,
            DATE(date_time) AS record_date,
            MIN(units) AS initial_units,
            MAX(units) AS final_units
        FROM MeterCumulativeEnergyUsage
        WHERE DATE(date_time) = CURDATE()
        GROUP BY DRN, DATE(date_time)
    ) AS t
    GROUP BY record_date;
END;


CREATE EVENT calculate_daily_consumption_event
ON SCHEDULE EVERY 1 DAY STARTS TIMESTAMP(CURDATE(), '23:59:00')
DO CALL CalculateDailyPowerConsumption();



/* All days*/
INSERT INTO DailyPowerConsumption (date, daily_power_consumption)
SELECT 
    record_date AS date,
    SUM(initial_units) - SUM(final_units) AS daily_power_consumption
FROM (
    SELECT 
        DRN,
        DATE(date_time) AS record_date,
        MIN(units) AS initial_units,
        MAX(units) AS final_units
    FROM MeterCumulativeEnergyUsage
    GROUP BY DRN, DATE(date_time)
) AS t
GROUP BY record_date;