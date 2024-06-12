-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 11 juin 2024 à 14:16
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `campus`
--

-- --------------------------------------------------------

--
-- Structure de la table `fcm_tokens`
--

DROP TABLE IF EXISTS `fcm_tokens`;
CREATE TABLE IF NOT EXISTS `fcm_tokens` (
  `userId` int NOT NULL,
  `token` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`token`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `groupId` int NOT NULL,
  `userId` int NOT NULL,
  `text` text,
  `imageUri` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `groupId` (`groupId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `groupId`, `userId`, `text`, `imageUri`, `timestamp`) VALUES
(1, 2, 1, 'Jhy', NULL, '2024-06-11 14:01:46'),
(2, 3, 1, 'Ctigy', NULL, '2024-06-11 14:03:36'),
(3, 3, 1, 'Yrug', NULL, '2024-06-11 14:03:38'),
(4, 4, 3, 'Uy', NULL, '2024-06-11 14:04:52'),
(5, 4, 3, '', 'content://com.android.providers.media.documents/document/image%3A1553', '2024-06-11 14:04:57'),
(6, 4, 3, '', 'file:///data/user/0/com.campusconnect/cache/rn_image_picker_lib_temp_5388736c-56dd-4090-96a2-ec2542ad5103.jpg', '2024-06-11 14:05:06'),
(7, 4, 3, '', 'file:///data/user/0/com.campusconnect/cache/rn_image_picker_lib_temp_96fda6a6-6207-4cf6-80ea-12686b09ba69.jpg', '2024-06-11 14:05:45'),
(8, 5, 3, 'Uyy', NULL, '2024-06-11 14:08:34'),
(9, 5, 3, 'Jhgy', NULL, '2024-06-11 14:08:36'),
(10, 5, 3, '', 'content://com.android.providers.media.documents/document/image%3A1553', '2024-06-11 14:08:42'),
(11, 5, 3, '', 'file:///data/user/0/com.campusconnect/cache/rn_image_picker_lib_temp_1cb9db14-0534-4562-b702-56d61091471d.jpg', '2024-06-11 14:08:53'),
(12, 3, 1, 'Hh', NULL, '2024-06-11 14:15:25'),
(13, 5, 1, 'Ttt', NULL, '2024-06-11 14:15:33'),
(14, 1, 1, 'Ht6', NULL, '2024-06-11 14:15:56');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `photoUri` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `username`, `phone`, `firstName`, `photoUri`, `created_at`, `updated_at`) VALUES
(1, 'Grui@gmail.com0', '$2a$10$mJyRLBXDyP6If4iiz/gcdOmfzzn3aYqKRHmvkSPSz3lkDcsT8PXke', 'Grui@gmail.com0', NULL, NULL, NULL, '2024-06-11 13:47:08', '2024-06-11 13:47:08'),
(3, 'Grui@gmail.com0Grui@gmail.com0', '$2a$10$Q01QhJ/0nndCLO73Mw/46OOVTi9ynFSXtPJL/yyu7Lglh9gA5wWHG', 'Grui@gmail.com0Grui@gmail.com0', NULL, NULL, NULL, '2024-06-11 14:04:11', '2024-06-11 14:04:11');

-- --------------------------------------------------------

--
-- Structure de la table `user_groups`
--

DROP TABLE IF EXISTS `user_groups`;
CREATE TABLE IF NOT EXISTS `user_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `user_groups`
--

INSERT INTO `user_groups` (`id`, `name`, `created_by`, `created_at`) VALUES
(1, 'Yo', 1, '2024-06-11 13:47:14'),
(2, 'Hgt', 1, '2024-06-11 14:01:42'),
(3, 'Htui', 1, '2024-06-11 14:03:32'),
(4, 'Yu', 3, '2024-06-11 14:04:30'),
(5, 'Yo', 3, '2024-06-11 14:08:18');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `user_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_groups`
--
ALTER TABLE `user_groups`
  ADD CONSTRAINT `user_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
