-- This script updates the password for the superadmin user.
-- The plain text password will be 'superadmin'.
UPDATE users
SET
  password = '$2a$10$f.w2s3TDBt3pYg2iA6k7O.5lJdchO4h2i.sWpWvJzW/9u0f3dEaGq'
WHERE
  email = 'super@example.com';
