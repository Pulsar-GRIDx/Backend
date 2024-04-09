CREATE TRIGGER HighEnergyConsumption
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
    IF NEW.apparent_power > 5000.000 THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Energy', concat('High energy usage , warts used: ' , NEW.apparent_power), 1, 'Critical');
    END IF;
END;