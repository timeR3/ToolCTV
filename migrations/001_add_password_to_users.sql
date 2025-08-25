-- This script updates the existing 'users' table to add the password column
-- and sets a default password for the Superadmin user.

-- Step 1: Add the password column to the users table.
-- It's set as NOT NULL because all users must have a password.
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL;

-- Step 2: Update the existing Superadmin user with a hashed password.
-- The password is 'superadmin'. This is the hashed version of it.
-- IMPORTANT: Make sure the email for your superadmin user is 'superadmin@example.com'.
-- If it's different, change it in the WHERE clause below.
UPDATE users 
SET password = '$2a$10$fJ.p9.qL/s5.O3R0.gQJ2.3eZ7s.2X/aE/5L8f/g9E6c8Q3/w4fI.' 
WHERE email = 'superadmin@example.com';