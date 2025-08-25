-- Base de datos: `portalao_ToolsCS`
--
-- Estructura de tabla para la tabla `categories`
--
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Shapes',
  `iconUrl` VARCHAR(255),
  PRIMARY KEY (`id`)
);
--
-- Volcado de datos para la tabla `categories`
--
INSERT INTO `categories` (`name`, `description`, `enabled`, `icon`) VALUES
('General', 'Herramientas de uso general', TRUE, 'Shapes'),
('Development', 'Herramientas para desarrolladores', TRUE, 'GitBranch'),
('Security', 'Herramientas de seguridad y monitoreo', TRUE, 'ShieldCheck');
--
-- Estructura de tabla para la tabla `tools`
--
CREATE TABLE IF NOT EXISTS `tools` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255),
  `enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `category_id` INT,
  PRIMARY KEY (`id`),
  INDEX `idx_category_id` (`category_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
);
--
-- Volcado de datos para la tabla `tools`
--
INSERT INTO `tools` (`name`, `description`, `url`, `icon`, `enabled`, `category_id`) VALUES
('Project Board', 'Tablero Kanban para seguimiento de proyectos', 'https://www.example.com/board', 'LayoutDashboard', TRUE, 1),
('Code Repository', 'Repositorio de código fuente Git', 'https://www.example.com/git', 'GitBranch', TRUE, 2),
('CI/CD Pipeline', 'Integración y despliegue continuo', 'https://www.example.com/pipeline', 'Wrench', TRUE, 2),
('Security Scanner', 'Escáner de vulnerabilidades de seguridad', 'https://www.example.com/scanner', 'ShieldCheck', FALSE, 3);
--
-- Estructura de tabla para la tabla `users`
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
-- Volcado de datos para la tabla `users`
--
INSERT INTO `users` (`name`, `email`, `avatar`, `role`) VALUES
('Super Admin', 'super@example.com', 'https://placehold.co/100x100.png', 'Superadmin'),
('Admin User', 'admin@example.com', 'https://placehold.co/100x100.png', 'Admin'),
('Regular User', 'user@example.com', 'https://placehold.co/100x100.png', 'User');
--
-- Estructura de tabla para la tabla `user_tools` (Tabla de Unión)
--
CREATE TABLE IF NOT EXISTS `user_tools` (
  `user_id` INT NOT NULL,
  `tool_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_tool_id` (`tool_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON DELETE CASCADE
);
--
-- Volcado de datos para la tabla `user_tools`
--
INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES
(3, 1),
(3, 2);
--
-- Estructura de tabla para la tabla `audit_log`
--
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
--
-- Estructura de tabla para la tabla `permissions`
--
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  PRIMARY KEY (`id`)
);
--
-- Volcado de datos para la tabla `permissions`
--
INSERT INTO `permissions` (`name`, `description`) VALUES
('access_manage_users', 'Permite el acceso a la página de gestión de usuarios'),
('access_manage_tools', 'Permite el acceso a la página de gestión de herramientas'),
('access_manage_categories', 'Permite el acceso a la página de gestión de categorías'),
('access_manage_permissions', 'Permite el acceso a la página de gestión de permisos'),
('access_audit_log', 'Permite ver el registro de auditoría');
--
-- Estructura de tabla para la tabla `role_permissions` (Tabla de Unión)
--
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role`, `permission_id`),
  INDEX `idx_role` (`role`),
  INDEX `idx_permission_id` (`permission_id`),
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);
--
-- Volcado de datos para la tabla `role_permissions`
--
INSERT INTO `role_permissions` (`role`, `permission_id`) VALUES
('Admin', 1),
('Admin', 2),
('Admin', 3),
('Admin', 5);
-- Superadmin tiene todos los permisos por código, no es necesario insertarlos aquí.
-- User no tiene permisos de administración por defecto.
