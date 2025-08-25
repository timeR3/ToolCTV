-- Base de datos: `toolbox_pro`
-- --------------------------------------------------------

--
-- Estructura para la tabla `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `avatar` VARCHAR(255),
  `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL DEFAULT 'User',
  PRIMARY KEY (`id`)
);

--
-- Estructura para la tabla `categories`
--
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `icon` VARCHAR(255) DEFAULT 'Shapes',
    `iconUrl` VARCHAR(255),
    PRIMARY KEY (`id`)
);

--
-- Estructura para la tabla `tools`
--
CREATE TABLE IF NOT EXISTS `tools` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `url` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255),
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `category_id` INT,
  PRIMARY KEY (`id`),
  INDEX `idx_tool_category` (`category_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
);

--
-- Estructura para la tabla de unión `user_tools`
--
CREATE TABLE IF NOT EXISTS `user_tools` (
  `user_id` INT NOT NULL,
  `tool_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  INDEX `idx_user_tools_user` (`user_id`),
  INDEX `idx_user_tools_tool` (`tool_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON DELETE CASCADE
);

--
-- Estructura para la tabla `audit_log`
--
CREATE TABLE IF NOT EXISTS `audit_log` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `user_id` INT NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `details` TEXT,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_log_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

--
-- Estructura para la tabla `permissions`
--
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT,
    PRIMARY KEY (`id`)
);

--
-- Estructura para la tabla `role_permissions`
--
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL,
    `permission_id` INT NOT NULL,
    PRIMARY KEY (`role`, `permission_id`),
    INDEX `idx_role_permissions_role` (`role`),
    INDEX `idx_role_permissions_permission` (`permission_id`),
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);


-- --------------------------------------------------------
-- Población de las tablas (datos de prueba)
-- --------------------------------------------------------

-- Insertar usuarios
INSERT INTO `users` (`name`, `email`, `avatar`, `role`) VALUES
('Alice (Superadmin)', 'alice@example.com', 'https://placehold.co/100x100.png', 'Superadmin'),
('Bob (Admin)', 'bob@example.com', 'https://placehold.co/100x100.png', 'Admin'),
('Charlie (User)', 'charlie@example.com', 'https://placehold.co/100x100.png', 'User');

-- Insertar categorías
INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`) VALUES
(1, 'General', 'Herramientas de uso general', 1, 'Shapes'),
(2, 'Development', 'Herramientas para desarrolladores', 1, 'GitBranch'),
(3, 'Analytics', 'Herramientas para análisis de datos', 1, 'FileClock');

-- Insertar herramientas
INSERT INTO `tools` (`name`, `description`, `url`, `icon`, `enabled`, `category_id`) VALUES
('Project Dashboard', 'Overview of project metrics', 'https://example.com/dashboard', 'LayoutDashboard', 1, 1),
('Code Repository', 'Git-based version control', 'https://example.com/repo', 'GitBranch', 1, 2),
('CI/CD Pipeline', 'Continuous integration and deployment', 'https://example.com/pipeline', 'Wrench', 1, 2),
('User Analytics', 'Track user engagement', 'https://example.com/analytics', 'FileClock', 0, 3),
('Security Scanner', 'Scan for vulnerabilities', 'https://example.com/security', 'ShieldCheck', 1, 1);

-- Asignar herramientas a usuarios
-- Charlie tiene acceso a "Project Dashboard" y "Security Scanner"
INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES
((SELECT id FROM users WHERE email='charlie@example.com'), (SELECT id FROM tools WHERE name='Project Dashboard')),
((SELECT id FROM users WHERE email='charlie@example.com'), (SELECT id FROM tools WHERE name='Security Scanner'));
-- Los Admins y Superadmins tienen acceso a todas las herramientas por rol, pero podríamos asignarles algunas específicas si quisiéramos.

-- Insertar permisos disponibles en el sistema
INSERT INTO `permissions` (`name`, `description`) VALUES
('access_manage_users', 'Can view and edit users, roles, and tool assignments'),
('access_manage_tools', 'Can add, edit, and disable tools'),
('access_manage_categories', 'Can add, edit, and disable tool categories'),
('access_manage_permissions', 'Can configure permissions for different roles'),
('access_audit_log', 'Can view the audit log of all administrative actions');

-- Asignar permisos a los roles
-- El rol 'Admin' puede gestionar usuarios
INSERT INTO `role_permissions` (`role`, `permission_id`) VALUES
('Admin', (SELECT id FROM permissions WHERE name='access_manage_users'));

-- El rol 'Superadmin' tiene todos los permisos
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'Superadmin', id FROM permissions;
