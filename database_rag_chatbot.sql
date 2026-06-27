-- =====================================================================
-- June: bảng RAG + lưu hội thoại chatbot (MySQL 8)
-- Tự chạy khi khởi động backend (server/) với DB_NAME trong .env.
-- Hoặc thủ công: mysql -u root -p <DB_NAME> < database_rag_chatbot.sql
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `june_db`;

-- Tài liệu admin (vector lưu JSON trong embedding)
CREATE TABLE IF NOT EXISTS `rag_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chunk_count` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rag_documents_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rag_chunks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `chunk_index` int NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `embedding` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rag_chunks_document_id` (`document_id`),
  CONSTRAINT `rag_chunks_document_fk` FOREIGN KEY (`document_id`) REFERENCES `rag_documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File user đính kèm theo phiên (session_id = UUID trình duyệt)
CREATE TABLE IF NOT EXISTS `rag_session_chunks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `embedding` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rag_session_chunks_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Phiên chat + tin nhắn lưu MySQL
CREATE TABLE IF NOT EXISTS `rag_chat_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `public_session_key` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `context_json` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rag_chat_sessions_public_key` (`public_session_key`),
  KEY `rag_chat_sessions_user_id` (`user_id`),
  CONSTRAINT `rag_chat_sessions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rag_chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_session_id` int NOT NULL,
  `role` enum('user','assistant','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `sources_json` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rag_chat_messages_session` (`chat_session_id`),
  CONSTRAINT `rag_chat_messages_session_fk` FOREIGN KEY (`chat_session_id`) REFERENCES `rag_chat_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
