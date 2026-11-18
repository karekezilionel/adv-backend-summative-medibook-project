-- Create the database
DROP DATABASE IF EXISTS medibook;
CREATE DATABASE medibook;
USE medibook;

-- 1. Patients Table
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctors Table
CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    room VARCHAR(20) NOT NULL
);

-- 3. Appointments Table
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    status ENUM('booked', 'cancelled') DEFAULT 'booked',
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    cancelled_at DATETIME DEFAULT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    
    -- CRITICAL BUSINESS RULE: A doctor cannot have two appointments at the same date/time!
    UNIQUE KEY unique_doctor_slot (doctor_id, appointment_datetime)
);