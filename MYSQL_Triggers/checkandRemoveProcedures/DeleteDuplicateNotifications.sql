DELIMITER //

CREATE PROCEDURE DeleteDuplicateNotifications()
BEGIN
    DELETE n1
    FROM MeterNotifications n1
    INNER JOIN MeterNotifications n2
    WHERE n1.id > n2.id
    AND n1.DRN = n2.DRN
    AND n1.AlarmType = n2.AlarmType
    AND n1.Urgency_Type = n2.Urgency_Type;
END;
//

DELIMITER ;
