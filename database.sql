-- Studio AI-generated SQL script.
-- This script is to define and populate the MySQL database schema for the Toolbox Pro application.

-- Drop tables in reverse order of dependency to avoid foreign key constraint errors.
DROP TABLE IF EXISTS `user_tools`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `tools`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;


-- Table structure for `users`
-- Stores user information and their roles.
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `avatar` VARCHAR(255),
  `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL DEFAULT 'User',
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `categories`
-- Stores tool categories.
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Shapes',
  `iconUrl` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `tools`
-- Stores individual tools and their metadata.
CREATE TABLE IF NOT EXISTS `tools` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `url` VARCHAR(2048) NOT NULL,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255),
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `category_id` VARCHAR(255),
  PRIMARY KEY (`id`),
  INDEX `idx_category_id` (`category_id`),
  CONSTRAINT `fk_tool_category`
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`)
    ON DELETE SET NULL -- If a category is deleted, tools are not deleted but their category is set to NULL.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `user_tools`
-- This is a pivot table to manage the many-to-many relationship between users and tools.
CREATE TABLE IF NOT EXISTS `user_tools` (
  `user_id` VARCHAR(255) NOT NULL,
  `tool_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_tool_id` (`tool_id`),
  CONSTRAINT `fk_user_tools_user`
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`)
    ON DELETE CASCADE, -- If a user is deleted, their tool assignments are also deleted.
  CONSTRAINT `fk_user_tools_tool`
    FOREIGN KEY (`tool_id`) 
    REFERENCES `tools` (`id`)
    ON DELETE CASCADE -- If a tool is deleted, its assignments to users are also deleted.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `audit_log`
-- Logs administrative actions performed in the system.
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` VARCHAR(255) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id_log` (`user_id`),
  INDEX `idx_timestamp` (`timestamp`),
  CONSTRAINT `fk_log_user`
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`)
    ON DELETE CASCADE -- If a user is deleted, their logs are also deleted.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Populate the tables with initial data.

-- Populate `users`
INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `role`) VALUES
('user-1', 'Alicia Keys', 'alicia@example.com', 'https://i.pravatar.cc/150?u=alicia', 'Superadmin'),
('user-2', 'Bob Marley', 'bob@example.com', 'https://i.pravatar.cc/150?u=bob', 'Admin'),
('user-3', 'Charlie Puth', 'charlie@example.com', 'https://i.pravatar.cc/150?u=charlie', 'User');

-- Populate `categories`
INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`) VALUES
('cat-general', 'General', 'Default category for uncategorized tools', TRUE, 'Shapes'),
('cat-projects', 'Proyectos', 'Herramientas para gestión de proyectos', TRUE, 'LayoutDashboard'),
('cat-it', 'IT', 'Herramientas para el equipo de TI', TRUE, 'ShieldCheck'),
('cat-accounting', 'Contabilidad', 'Herramientas para contabilidad y finanzas', FALSE, 'FileClock'),
('cat-design', 'Diseño', 'Herramientas para creativos', TRUE, 'Brush');


-- Populate `tools`
INSERT INTO `tools` (`id`, `name`, `description`, `url`, `icon`, `enabled`, `category_id`) VALUES
('t1', 'Project Planner', 'A Kanban board for project management.', 'https://trello.com', 'Wrench', TRUE, 'cat-projects'),
('t2', 'Security Scanner', 'Tool for scanning web vulnerabilities.', 'https://www.ssllabs.com/ssltest/', 'ShieldCheck', TRUE, 'cat-it'),
('t3', 'Version Control', 'Git repository management.', 'https://github.com', 'GitBranch', FALSE, 'cat-it'),
('t4', 'Time Tracker', 'Log and track work hours.', 'https://toggl.com/track/timer/', 'FileClock', TRUE, 'cat-accounting'),
('t5', 'Design Platform', 'Collaborative interface design tool.', 'https://figma.com', 'PenTool', TRUE, 'cat-design');

-- Populate `user_tools`
-- Assign some tools to users. Superadmin and Admin will have access to all tools by role logic.
-- Assign "Project Planner" to Charlie (User)
INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES
('user-3', 't1');

-- You can add more assignments here if needed.
-- Example: INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES ('user-3', 't5');
