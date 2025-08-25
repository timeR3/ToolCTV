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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `icon` VARCHAR(255) DEFAULT 'Shapes',
  `iconUrl` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `enabled`, `icon`, `iconUrl`) VALUES
('cat_general', 'General', 'Herramientas sin categoría específica', TRUE, 'Wrench', NULL),
('cat1', 'Finanzas', 'Herramientas para gestión financiera', TRUE, 'Landmark', NULL),
('cat2', 'Marketing', 'Herramientas para campañas y análisis', TRUE, 'Megaphone', NULL),
('cat3', 'Diseño', 'Herramientas para creativos', TRUE, 'PenTool', NULL),
('cat4', 'Proyectos', 'Herramientas para gestión de proyectos', TRUE, 'KanbanSquare', NULL),
('cat5', 'Contabilidad', 'Herramientas para contabilidad y finanzas', FALSE, 'Calculator', NULL),
('cat6', 'IT', 'Herramientas para el equipo de TI', TRUE, 'Server', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tools`
--

CREATE TABLE IF NOT EXISTS `tools` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `url` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) DEFAULT 'Wrench',
  `iconUrl` VARCHAR(255),
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `category_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tool_category` (`category_id`),
  CONSTRAINT `fk_tool_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_tools` (Relación Muchos a Muchos)
--

CREATE TABLE IF NOT EXISTS `user_tools` (
  `user_id` VARCHAR(255) NOT NULL,
  `tool_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`, `tool_id`),
  KEY `idx_user_tools_user` (`user_id`),
  KEY `idx_user_tools_tool` (`tool_id`),
  CONSTRAINT `fk_user_tools_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_tools_tool` FOREIGN KEY (`tool_id`) REFERENCES `tools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_log`
--

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` VARCHAR(255),
  `adminName` VARCHAR(255) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_audit_log_user` (`user_id`),
  CONSTRAINT `fk_audit_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permissions`
--

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
('perm_access_audit_log', 'access_audit_log', 'Can view the audit log'),
('perm_access_manage_categories', 'access_manage_categories', 'Can access the category management page'),
('perm_access_manage_permissions', 'access_manage_permissions', 'Can access the permissions management page'),
('perm_access_manage_tools', 'access_manage_tools', 'Can access the tool management page'),
('perm_access_manage_users', 'access_manage_users', 'Can access the user management page');


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_permissions` (Relación Muchos a Muchos)
--
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role` ENUM('User', 'Admin', 'Superadmin') NOT NULL,
  `permission_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`role`, `permission_id`),
  KEY `idx_role_permissions_permission` (`permission_id`),
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Volcado de datos para la tabla `users`
--
INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `role`) VALUES
('user_superadmin', 'Super Admin', 'superadmin@example.com', '', 'Superadmin'),
('user_admin', 'Admin User', 'admin@example.com', '', 'Admin'),
('user_regular', 'Regular User', 'user@example.com', '', 'User');


--
-- Volcado de datos para la tabla `tools`
--
INSERT INTO `tools` (`id`, `name`, `description`, `url`, `icon`, `iconUrl`, `enabled`, `category_id`) VALUES
('t1', 'Project Planner', 'A Kanban board for project management.', 'https://trello.com', 'Wrench', NULL, TRUE, 'cat4'),
('t2', 'Security Scanner', 'Tool for scanning web vulnerabilities.', 'https://www.ssllabs.com/ssltest/', 'ShieldCheck', NULL, TRUE, 'cat6'),
('t3', 'Version Control', 'Git repository management.', 'https://github.com', 'GitBranch', NULL, FALSE, 'cat6'),
('t4', 'Time Tracker', 'Log and track work hours.', 'https://toggl.com/track/timer/', 'FileClock', NULL, TRUE, 'cat5');

--
-- Volcado de datos para la tabla `user_tools`
--
INSERT INTO `user_tools` (`user_id`, `tool_id`) VALUES
('user_regular', 't1'),
('user_regular', 't4');


--
-- Volcado de datos para la tabla `role_permissions`
--
INSERT INTO `role_permissions` (`role`, `permission_id`) VALUES
('Admin', 'perm_access_manage_categories'),
('Admin', 'perm_access_manage_users'),
('Superadmin', 'perm_access_audit_log'),
('Superadmin', 'perm_access_manage_categories'),
('Superadmin', 'perm_access_manage_permissions'),
('Superadmin', 'perm_access_manage_tools'),
('Superadmin', 'perm_access_manage_users');
