-- Base de datos: `toolbox_pro`
--
-- Estructura de la base de datos para la aplicación Toolbox Pro.
-- Este script crea las tablas necesarias y las puebla con datos iniciales.

-- --------------------------------------------------------

--
-- Estructura de la tabla `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('User','Admin','Superadmin') NOT NULL DEFAULT 'User',
  `assignedTools` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `role`, `assignedTools`) VALUES
('user-1', 'Super Admin', 'superadmin@toolbox.pro', 'https://placehold.co/100x100.png', 'Superadmin', '[]'),
('user-2', 'Admin User', 'admin@toolbox.pro', 'https://placehold.co/100x100.png', 'Admin', '[]'),
('user-3', 'John Smith', 'john.smith@example.com', 'https://placehold.co/100x100.png', 'User', '["t1", "t2"]');

-- --------------------------------------------------------

--
-- Estructura de la tabla `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `icon` varchar(255) NOT NULL,
  `iconUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`, `iconUrl`) VALUES
('cat1', 'General', 'Herramientas de uso general', 1, 'Shapes', NULL),
('cat2', 'Proyectos', 'Herramientas para gestión de proyectos', 1, 'LayoutDashboard', NULL),
('cat3', 'IT', 'Herramientas para el equipo de TI', 1, 'ShieldCheck', NULL),
('cat4', 'Contabilidad', 'Herramientas para contabilidad y finanzas', 0, 'FileClock', NULL),
('cat5', 'Diseño', 'Herramientas para creativos', 1, 'Wrench', NULL);


-- --------------------------------------------------------

--
-- Estructura de la tabla `tools`
--

CREATE TABLE IF NOT EXISTS `tools` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `url` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `iconUrl` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `category_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `tools_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tools`
--

INSERT INTO `tools` (`id`, `name`, `description`, `url`, `icon`, `iconUrl`, `enabled`, `category_id`) VALUES
('t1', 'Project Planner', 'A Kanban board for project management.', 'https://trello.com', 'Wrench', NULL, 1, 'cat2'),
('t2', 'Security Scanner', 'Tool for scanning web vulnerabilities.', 'https://www.ssllabs.com/ssltest/', 'ShieldCheck', NULL, 1, 'cat3'),
('t3', 'Version Control', 'Git repository management.', 'https://github.com', 'GitBranch', NULL, 0, 'cat3'),
('t4', 'Time Tracker', 'Log and track work hours.', 'https://toggl.com/track/timer/', 'FileClock', NULL, 1, 'cat4');

-- --------------------------------------------------------

--
-- Estructura de la tabla `audit_logs`
--

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `adminName` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `timestamp`, `adminName`, `action`, `details`) VALUES
('log1', NOW(), 'Super Admin', 'System Initialized', 'Initial data population.');

