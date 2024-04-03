DELIMITER //

CREATE TRIGGER MeterStateChange
AFTER INSERT ON MeterMainsStateTable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 OR NEW.state = 1 THEN
        INSERT INTO MeterNotifications (DRN, state, processed, from_table, type)
        VALUES (NEW.DRN, NEW.state, NEW.processed, 'MeterMainsStateTable', 'Information');
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER MeterControlStateChange
AFTER INSERT ON MeterMainsControlTable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 OR NEW.state = 1 THEN
        INSERT INTO MeterNotifications (DRN, state, processed, from_table, type)
        VALUES (NEW.DRN, NEW.state, NEW.processed, 'MeterMainsControlTable', 'Information');
    END IF;
END;
//

DELIMITER ;