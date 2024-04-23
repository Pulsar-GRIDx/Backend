/*All days*/



WITH UsageChange AS (
    SELECT 
        DRN,
        date_time,
        units - LAG(units, 1, units) OVER (PARTITION BY DRN ORDER BY date_time) AS units_change
    FROM 
        MeterCumulativeEnergyUsage
)
SELECT 
    DATE(date_time) AS usage_date,
    SUM(units_change) AS total_units_used
FROM 
    UsageChange
GROUP BY 
    DATE(date_time)
ORDER BY 
    usage_date;




/*WeekLy Suburb*/

WITH SuburbDRNs AS (
    SELECT 
        DRN
    FROM 
        MeterLocationInfoTable
    WHERE 
        Suburb = 'your_suburb_name_here'
),
CurrentWeekUsage AS (
    SELECT 
        DATE(date_time) AS usage_date,
        SUM(units_change) AS total_units_used
    FROM 
        (
            SELECT 
                m.date_time,
                m.units - LAG(m.units, 1, m.units) OVER (PARTITION BY m.DRN ORDER BY m.date_time) AS units_change
            FROM 
                MeterCumulativeEnergyUsage m
            JOIN 
                SuburbDRNs s ON m.DRN = s.DRN
            WHERE 
                YEARWEEK(m.date_time) = YEARWEEK(CURDATE())
        ) AS subquery
    GROUP BY 
        DATE(date_time)
),
LastWeekUsage AS (
    SELECT 
        DATE(date_time) AS usage_date,
        SUM(units_change) AS total_units_used
    FROM 
        (
            SELECT 
                m.date_time,
                m.units - LAG(m.units, 1, m.units) OVER (PARTITION BY m.DRN ORDER BY m.date_time) AS units_change
            FROM 
                MeterCumulativeEnergyUsage m
            JOIN 
                SuburbDRNs s ON m.DRN = s.DRN
            WHERE 
                YEARWEEK(m.date_time) = YEARWEEK(CURDATE()) - 1
        ) AS subquery
    GROUP BY 
        DATE(date_time)
)
SELECT 
    'Current Week' AS week,
    usage_date,
    total_units_used
FROM 
    CurrentWeekUsage
UNION ALL
SELECT 
    'Last Week' AS week,
    usage_date,
    total_units_used
FROM 
    LastWeekUsage
ORDER BY 
    usage_date;


