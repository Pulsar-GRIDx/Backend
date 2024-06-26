CREATE TRIGGER TamperDetection
AFTER INSERT ON MeterCumulativeEnergyUsage
FOR EACH ROW
BEGIN
    DECLARE urgency_type INT;

    IF NEW.tamper_state = 1 THEN
        SET urgency_type = 1;
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type,Type)
        VALUES (NEW.DRN, 'Tamper', 'Unauthorized access or meter interference', urgency_type,'Warning');
    END IF;
END;