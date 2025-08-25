-- Base de datos: `toolbox_pro`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `avatar` VARCHAR(255),
  `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL DEFAULT 'User',
  PRIMARY KEY (`id`)
);

--
-- Estructura de tabla para la tabla `categories`
--
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Shapes',
  `iconUrl` VARCHAR(255),
  PRIMARY KEY (`id`)
);

--
-- Estructura de tabla para la tabla `tools`
--
CREATE TABLE IF NOT EXISTS `tools` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `url` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255),
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `category` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category`) REFERENCES `categories`(`name`) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Estructura de tabla para la tabla `user_tools`
--
CREATE TABLE IF NOT EXISTS `user_tools` (
  `user_id` VARCHAR(255) NOT NULL,
  `tool_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON DELETE CASCADE
);


--
-- Estructura de tabla para la tabla `audit_log`
--
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `adminName` VARCHAR(255) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  PRIMARY KEY (`id`)
);

--
-- Volcado de datos para la tabla `users`
--
INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `role`) VALUES
('user-1', 'Alicia Keys', 'alicia@example.com', 'https://placehold.co/100x100.png', 'Superadmin'),
('user-2', 'Bob Marley', 'bob@example.com', 'https://placehold.co/100x100.png', 'Admin'),
('user-3', 'Charlie Garcia', 'charlie@example.com', 'https://placehold.co/100x100.png', 'User');

--
-- Volcado de datos para la tabla `categories`
--
INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`, `iconUrl`) VALUES
('cat1', 'Finanzas', 'Herramientas para gestión financiera', 1, 'Shapes', NULL),
('cat2', 'Marketing', 'Herramientas para campañas y análisis', 1, 'Shapes', NULL),
('cat3', 'Diseño', 'Herramientas para creativos', 1, 'Shapes', NULL),
('cat4', 'Proyectos', 'Herramientas para gestión de proyectos', 1, 'Shapes', NULL),
('cat5', 'Contabilidad', 'Herramientas para contabilidad y finanzas', 0, 'Shapes', NULL),
('cat6', 'IT', 'Herramientas para el equipo de TI', 1, 'Shapes', NULL),
('cat7', 'General', 'Herramientas generales', 1, 'Shapes', NULL);

--
-- Volcado de datos para la tabla `tools`
--
INSERT INTO `tools` (`id`, `name`, `description`, `url`, `icon`, `iconUrl`, `enabled`, `category`) VALUES
('t1', 'Project Planner', 'A Kanban board for project management.', 'https://trello.com', 'Wrench', '', 1, 'Proyectos'),
('t2', 'Security Scanner', 'Tool for scanning web vulnerabilities.', 'https://www.ssllabs.com/ssltest/', 'ShieldCheck', '', 1, 'IT'),
('t3', 'Version Control', 'Git repository management.', 'https://github.com', 'GitBranch', '', 0, 'IT'),
('t4', 'Time Tracker', 'Log and track work hours.', 'https://toggl.com/track/timer/', 'FileClock', '', 1, 'Contabilidad');

--
-- Volcado de datos para la tabla `user_tools`
--
INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES
('user-3', 't1'),
('user-3', 't2');
