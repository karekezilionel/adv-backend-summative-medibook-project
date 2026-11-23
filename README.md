# MediBook - Clinic Appointment Booking System

A backend REST API for a clinic appointment booking system, built with Node.js, Express.js, MySQL, and Redis.

## Table of Contents
1. Prerequisites
2. Setup Instructions
3. Running the Application
4. Technical Justifications (Parts C, D, E)

---

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18+)
- MySQL (v8+) running on port 3306
- Redis (or Memurai if you are on Windows) running on port 6379
- Git

---

## Setup Instructions

1. Clone the repository and install dependencies:
npm install

2. Environment Variables:
Create a .env file in the root directory. You can copy the provided .env.example file:
cp .env.example .env
(Open .env and fill in your actual MySQL password).

3. Database Setup:
Make sure your MySQL server is running. Run the schema and seed files to set up the database:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

---

## Running the Application

The application requires two processes to run simultaneously: the web server and the Redis worker. 

Terminal 1: Start the Web Server
npm start
(The server will run on http://localhost:3000)

Terminal 2: Start the Worker Process
Open a second terminal and run:
npm run worker
(This process handles the waitlist promotions and notification jobs)

Running Tests:
To run the unit tests (which run independently without needing MySQL or Redis):
npm test

---

## Technical Justifications

### Part C: Business Rules & Concurrency
To prevent a doctor from being double-booked even when two requests arrive at the exact same instant, I used a Database Transaction with SELECT ... FOR UPDATE. 
When a booking request is made, the createBooking model function locks the row for that specific doctor and time slot. It then checks if an appointment exists. If it does, it throws a CONFLICT error, which the controller catches and returns as a 409 Conflict. Because the row is locked, the second simultaneous request is forced to wait until the first one commits, ensuring 100% data integrity.

### Part D: Audit Logging (fs module)
I created a custom logger.js utility using fs.promises.appendFile. 
- It uses fs.mkdir({ recursive: true }) to automatically create the logs/ directory on the first run if it doesn't exist.
- It strictly uses asynchronous, non-blocking methods (promises), so there are no *Sync calls inside the request handlers.
- The entire logging function is wrapped in a try/catch block that silently swallows errors. This ensures that even if the disk is full or the file is locked, a logging failure will never crash the server or fail the user's booking request.

### Part E: Queues & Redis (Waitlist & Notifications)
- Notification Jobs: Every successful booking pushes a job to a Redis list (notifications_queue). The separate worker process pops this list and writes the confirmation message to the audit log.
- Waitlist: If a booking fails due to a CONFLICT (slot taken) or LIMIT_REACHED (12-appointment cap), the patient is pushed to a Redis waitlist_queue.
- Failure Handling (Worker): The worker process runs in an infinite loop. If a patient is popped from the waitlist, the worker attempts to book them. If this booking fails (e.g., someone else grabbed the slot a millisecond earlier), the catch block pushes the patient back onto the waitlist. This guarantees they are never lost from both the queue and the database.


## Video link: https://youtu.be/ZhttA_3K4SY
