-- Base de datos y tablas para la aplicación Toolbox Pro

-- Eliminar la base de datos si existe para empezar desde cero
DROP DATABASE IF EXISTS `portalao_ToolsCS`;

-- Crear la base de datos
CREATE DATABASE `portalao_ToolsCS`;

-- Usar la base de datos recién creada
USE `portalao_ToolsCS`;

-- Tabla para los roles de usuario
CREATE TABLE `roles` (
  `name` VARCHAR(50) NOT NULL PRIMARY KEY
);

-- Poblar la tabla de roles
INSERT INTO `roles` (`name`) VALUES
('User'),
('Admin'),
('Superadmin');

-- Tabla de usuarios
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'User',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role`) REFERENCES `roles`(`name`)
);

-- Poblar la tabla de usuarios con un Superadmin
-- La contraseña 'superadmin' está hasheada con bcrypt
INSERT INTO `users` (`id`, `name`, `email`, `password`, `avatar`, `role`) VALUES
(1, 'Super Admin', 'super@admin.com', '$2a$10$f/3p9b.mKO2i23Z3s4aN.e1zJ7V3.5t2.EvHxNFkeE8zX4iY/OFja', 'https://placehold.co/100x100.png', 'Superadmin');

-- Tabla de categorías de herramientas
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `icon` VARCHAR(255) NOT NULL DEFAULT 'Shapes',
    `iconUrl` VARCHAR(255) NULL
);

-- Poblar categorías
INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`) VALUES
(1, 'General', 'Herramientas de propósito general', TRUE, 'Wrench'),
(2, 'Development', 'Herramientas para desarrolladores', TRUE, 'GitBranch'),
(3, 'Security', 'Herramientas de seguridad', TRUE, 'ShieldCheck');


-- Tabla de herramientas
CREATE TABLE `tools` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `url` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255) NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `created_by_user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`)
);

-- Poblar herramientas de ejemplo
INSERT INTO `tools` (`id`, `name`, `description`, `url`, `icon`, `enabled`, `category_id`, `created_by_user_id`) VALUES
(1, 'Code Editor', 'Editor de código online para prototipado rápido.', 'https://codepen.io/pen/', 'FileCode', TRUE, 2, 1),
(2, 'JSON Formatter', 'Valida y formatea documentos JSON.', 'https://jsonformatter.curiousconcept.com/', 'Braces', TRUE, 2, 1),
(3, 'Password Generator', 'Genera contraseñas seguras.', 'https://www.lastpass.com/features/password-generator', 'Lock', TRUE, 3, 1);


-- Tabla de asignación de herramientas a usuarios (muchos a muchos)
CREATE TABLE `user_tools` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `tool_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON DELETE CASCADE
);

-- Tabla de permisos
CREATE TABLE `permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL
);

-- Poblar permisos
INSERT INTO `permissions` (`name`, `description`) VALUES
('access_manage_users', 'Puede acceder a la página de gestión de usuarios'),
('access_manage_tools', 'Puede acceder a la página de gestión de herramientas'),
('access_manage_categories', 'Puede acceder a la página de gestión de categorías'),
('access_manage_permissions', 'Puede acceder a la página de gestión de permisos'),
('access_audit_log', 'Puede ver el registro de auditoría');


-- Tabla de asignación de permisos a roles (muchos a muchos)
CREATE TABLE `role_permissions` (
  `role` VARCHAR(50) NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`role`, `permission_id`),
  FOREIGN KEY (`role`) REFERENCES `roles`(`name`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);

-- Asignar permisos a los roles
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'Admin', id FROM `permissions` WHERE name IN ('access_manage_users', 'access_manage_tools');

INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'Superadmin', id FROM `permissions`;


-- Tabla de registro de auditoría
CREATE TABLE `audit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT NULL,
  `timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- Índices para mejorar el rendimiento
CREATE INDEX `idx_tools_category` ON `tools`(`category_id`);
CREATE INDEX `idx_audit_log_user` ON `audit_log`(`user_id`);
CREATE INDEX `idx_audit_log_timestamp` ON `audit_log`(`timestamp`);
