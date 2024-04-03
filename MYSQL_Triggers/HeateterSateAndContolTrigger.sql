DELIMITER //

CREATE TRIGGER HeaterStateChange
AFTER INSERT ON MeterHeaterStateTable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 OR NEW.state = 1 THEN
        INSERT INTO MeterNotifications (DRN, state, processed, from_table, type)
        VALUES (NEW.DRN, NEW.state, NEW.processed, 'MeterHeaterStateTable', 'Information');
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER HeaterControlStateChange
AFTER INSERT ON MeterHeaterControlTable
FOR EACH ROW
BEGIN
    IF NEW.state = 0 OR NEW.state = 1 THEN
        INSERT INTO MeterNotifications (DRN, state, processed, from_table, type)
        VALUES (NEW.DRN, NEW.state, NEW.processed, 'MeterHeaterControlTable', 'Information');
    END IF;
END;
//

DELIMITER ;

