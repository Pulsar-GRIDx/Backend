CREATE TRIGGER HighEnergyConsumption
AFTER UPDATE ON metercumulativeenergyusage
FOR EACH ROW
BEGIN
    IF NEW.active_energy > 5000.000 THEN
        INSERT INTO meternotifications (DRN, AlarmType, Alarm, Urgency_Type)
        VALUES (NEW.DRN, 'Meter Energy', concat('High energy usage , warts used: ' , NEW.active_energy), 1);
    END IF;
END;