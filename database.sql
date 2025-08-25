-- Toolbox Pro - Database Schema
-- Version: 4.0
-- Description: Final robust schema with autoincremental IDs, foreign keys, and full data population.

-- Use an appropriate database name
-- CREATE DATABASE IF NOT EXISTS `toolbox_pro_db`;
-- USE `toolbox_pro_db`;

-- Drop tables in reverse order of dependency to avoid foreign key errors
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `user_tools`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `tools`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- Table: users
-- Stores user information and their role.
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `avatar` VARCHAR(255),
  `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: categories
-- Stores tool categories.
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `icon` VARCHAR(255) DEFAULT 'Shapes',
  `iconUrl` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: tools
-- Stores tool information, linked to a category and a creating user.
CREATE TABLE IF NOT EXISTS `tools` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `url` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255),
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `category_id` INT,
  `created_by_user_id` INT,
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_tool_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tool_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_tools (Junction Table)
-- Manages the many-to-many relationship between users and tools.
CREATE TABLE IF NOT EXISTS `user_tools` (
  `user_id` INT NOT NULL,
  `tool_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_tool_id` (`tool_id`),
  CONSTRAINT `fk_user_tools_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_tools_tool` FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: audit_log
-- Logs administrative actions.
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id_log` (`user_id`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: permissions
-- Defines all possible permissions in the system.
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: role_permissions (Junction Table)
-- Manages the many-to-many relationship between roles and permissions.
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL,
    `permission_id` INT NOT NULL,
    PRIMARY KEY (`role`, `permission_id`),
    INDEX `idx_role` (`role`),
    INDEX `idx_permission_id` (`permission_id`),
    CONSTRAINT `fk_role_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --- DATA POPULATION ---

-- Populate users
INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `role`) VALUES
(1, 'Super Admin', 'super@example.com', 'https://placehold.co/100x100.png', 'Superadmin'),
(2, 'Admin User', 'admin@example.com', 'https://placehold.co/100x100.png', 'Admin'),
(3, 'Regular User', 'user@example.com', 'https://placehold.co/100x100.png', 'User');

-- Populate categories
INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`, `iconUrl`) VALUES
(1, 'General', 'General purpose tools', 1, 'Shapes', NULL),
(2, 'Development', 'Tools for developers', 1, 'GitBranch', NULL),
(3, 'Security', 'Security and compliance tools', 1, 'ShieldCheck', NULL);

-- Populate tools
-- Note: created_by_user_id references the ID from the users table.
INSERT INTO `tools` (`id`, `name`, `description`, `url`, `icon`, `iconUrl`, `enabled`, `category_id`, `created_by_user_id`) VALUES
(1, 'Project Tracker', 'A tool to track project progress.', 'https://www.google.com/search?q=Project+Tracker', 'FileClock', NULL, 1, 2, 2),
(2, 'Code Repository', 'Access to the Git repository.', 'https://www.google.com/search?q=Code+Repository', 'GitBranch', NULL, 1, 2, 2),
(3, 'Security Scanner', 'Scan for vulnerabilities.', 'https://www.google.com/search?q=Security+Scanner', 'ShieldCheck', NULL, 1, 3, 1),
(4, 'User Management', 'Manage users and roles.', 'https://www.google.com/search?q=User+Management', 'Users', NULL, 0, 1, 1);

-- Populate user_tools assignments
-- Assigning tools to the Regular User
INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES
(3, 1),
(3, 2);

-- Populate permissions
INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'access_manage_users', 'Can access the user management page'),
(2, 'access_manage_tools', 'Can access the tool management page'),
(3, 'access_manage_categories', 'Can access the category management page'),
(4, 'access_manage_permissions', 'Can access the permission management page'),
(5, 'access_audit_log', 'Can view the system audit log');

-- Populate role_permissions
-- User role has no specific admin permissions by default
-- INSERT INTO `role_permissions` (`role`, `permission_id`) VALUES ('User', ...);

-- Admin role has permission to manage users
INSERT INTO `role_permissions` (`role`, `permission_id`) VALUES
('Admin', 1);

-- Superadmin role has all permissions (now explicitly defined in the DB)
INSERT INTO `role_permissions` (`role`, `permission_id`) VALUES
('Superadmin', 1),
('Superadmin', 2),
('Superadmin', 3),
('Superadmin', 4),
('Superadmin', 5);


-- End of script.
SELECT 'Database schema and initial data created successfully.' as status;
