USE medibook;

-- Insert Patients
INSERT INTO patients (name, email, phone) VALUES
('Ama Mensah', 'ama@mail.com', '0244-111-222'),
('Kojo Owusu', 'kojo@mail.com', '0555-333-444'),
('Yaa Asantewaa', 'yaa@mail.com', '0277-555-666');

-- Insert Doctors
INSERT INTO doctors (name, specialty, consultation_fee, room) VALUES
('Dr. Boateng', 'Dermatology', 150.00, 'R-12'),
('Dr. Adjei', 'Paediatrics', 100.00, 'R-03'),
('Dr. Zorro', 'Cardiology', 200.00, 'R-05'); -- Dr. Zorro has NO appointments (tests LEFT JOIN later)

-- Insert Appointments (8 normal ones)
INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, amount_paid) VALUES
(1, 1, '2026-08-10 09:00:00', 150.00),
(2, 1, '2026-08-10 09:30:00', 150.00),
(3, 2, '2026-08-15 10:00:00', 100.00),
(1, 2, '2026-08-15 10:30:00', 100.00),
(2, 1, '2026-08-11 11:00:00', 150.00),
(3, 1, '2026-08-11 11:30:00', 150.00),
(1, 1, '2026-08-12 14:00:00', 150.00),
(2, 1, '2026-08-12 14:30:00', 150.00);

-- Fill up Dr. Boateng's day (Aug 13) to test the 12-slot daily cap
-- (We already added 2 for him above, so we need 10 more to reach 12)
INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, amount_paid) VALUES
(1, 1, '2026-08-13 09:00:00', 150.00),
(2, 1, '2026-08-13 09:30:00', 150.00),
(3, 1, '2026-08-13 10:00:00', 150.00),
(1, 1, '2026-08-13 10:30:00', 150.00),
(2, 1, '2026-08-13 11:00:00', 150.00),
(3, 1, '2026-08-13 11:30:00', 150.00),
(1, 1, '2026-08-13 12:00:00', 150.00),
(2, 1, '2026-08-13 12:30:00', 150.00),
(3, 1, '2026-08-13 13:00:00', 150.00),
(1, 1, '2026-08-13 13:30:00', 150.00);