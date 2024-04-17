DELIMITER //

CREATE PROCEDURE DeleteDuplicateNotifications()
BEGIN
    DELETE n1
    FROM MeterNotifications n1
    INNER JOIN MeterNotifications n2
    ON n1.id > n2.id
    AND n1.DRN = n2.DRN
    AND n1.AlarmType = n2.AlarmType
    AND n1.Urgency_Type = n2.Urgency_Type
    AND n1.date_time = n2.date_time;
END;
//

DELIMITER ;


DELIMITER //

CREATE EVENT IF NOT EXISTS DeleteDuplicateNotificationsEvent
ON SCHEDULE EVERY 3 MINUTE
STARTS CURRENT_TIMESTAMP
ENDS CURRENT_TIMESTAMP + INTERVAL 1 YEAR
DO
BEGIN
    CALL your_database_name.DeleteDuplicateNotifications();
END //

DELIMITER ;
