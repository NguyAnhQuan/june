-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: june_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,2,'Nguyễn Văn A','0912345678','TP. Hồ Chí Minh','Quận 1','Phường Bến Nghé','123 Đường Nguyễn Huệ',1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(2,2,'Nguyễn Văn A','0912345678','TP. Hồ Chí Minh','Quận 7','Phường Tân Phong','456 Đường Nguyễn Thị Thập',0,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(3,3,'Trần Thị B','0923456789','Hà Nội','Quận Hoàn Kiếm','Phường Tràng Tiền','78 Phố Tràng Tiền',1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(4,4,'Lê Minh C','0934567890','Đà Nẵng','Quận Hải Châu','Phường Thạch Thang','12 Đường Bạch Đằng',1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(5,5,'Phạm Thuỳ D','0945678901','TP. Hồ Chí Minh','Quận 3','Phường Võ Thị Sáu','234 Đường Hai Bà Trưng',1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(6,6,'Hoàng Anh E','0956789012','TP. Hồ Chí Minh','Quận Bình Thạnh','Phường 25','567 Đường Xô Viết Nghệ Tĩnh',1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(7,1,'test','0338787878','Tỉnh Hà Giang','Thành phố Hà Giang','Phường Quang Trung','111',1,'2026-03-01 10:26:27','2026-03-01 10:26:27');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `position` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Bộ sưu tập Hè 2026','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=500&fit=crop','/products',1,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,'Giảm giá 50% toàn bộ','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=500&fit=crop','/products',2,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,'Xu hướng thời trang mới','https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=500&fit=crop','/products',3,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(4,'Flash Sale cuối tuần','https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=700&h=400&fit=crop','/products?sort=best_selling',10,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(5,'Miễn phí vận chuyển đơn từ 500K','https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=700&h=400&fit=crop','/products',11,1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(6,'Bộ sưu tập Váy mới','https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=700&h=400&fit=crop','/products?category=vay',12,1,'2026-03-01 09:38:30','2026-03-01 09:38:30');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `cart_items_ibfk_11` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_ibfk_12` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,3,6,2,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,3,107,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,4,47,1,'2026-03-01 09:38:29','2026-03-01 09:38:29');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Áo','ao','https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop',NULL,1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(2,'Quần','quan','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop',NULL,1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(3,'Váy','vay','https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',NULL,1,'2026-03-01 09:38:28','2026-03-01 09:38:28'),(4,'Phụ kiện','phu-kien','https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=500&fit=crop',NULL,1,'2026-03-01 09:38:28','2026-03-01 09:38:28');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'Nguyễn Thanh Tùng','thanhtung@gmail.com','0901111222','Cho mình hỏi sản phẩm áo khoác bomber có bảo hành không ạ? Mình muốn mua số lượng lớn cho công ty.',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(2,'Lê Thị Hương','huongle@gmail.com','0903334444','Mình muốn đổi size quần jean từ M sang L. Đơn hàng vừa nhận hôm qua. Nhờ tư vấn giúp mình quy trình đổi trả.',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(3,'Trần Đức Mạnh','ducmanh@gmail.com','0905556666','Shop có nhận hợp tác với influencer không ạ? Mình có kênh TikTok 50K followers về thời trang.',1,'2026-03-01 09:38:30','2026-03-01 10:14:17'),(4,'Phạm Ngọc Ánh','ngocanh@gmail.com','0907778888','Sản phẩm váy hoa nhí size S còn hàng không ạ? Trên web hết màu hồng rồi. Bao giờ có hàng lại?',1,'2026-03-01 09:38:30','2026-03-01 10:14:17'),(5,'Võ Minh Khôi','minhkhoi@gmail.com','','Mình rất thích thiết kế của June. Hy vọng shop sẽ ra thêm nhiều mẫu áo polo màu sắc đa dạng hơn nữa nhé!',1,'2026-03-01 09:38:30','2026-03-01 10:14:19'),(6,'test','test@gmai.com','','test',1,'2026-03-01 10:37:19','2026-03-01 10:37:22');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percent','fixed') COLLATE utf8mb4_unicode_ci DEFAULT 'percent',
  `discount_value` decimal(12,0) NOT NULL,
  `min_order` decimal(12,0) DEFAULT '0',
  `max_discount` decimal(12,0) DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `usage_limit` int DEFAULT '0',
  `used_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'WELCOME10','percent',10,300000,100000,'2026-01-01 00:00:00','2026-12-31 00:00:00',100,12,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,'SALE50K','fixed',50000,500000,50000,'2026-01-01 00:00:00','2026-06-30 00:00:00',50,8,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,'SUMMER20','percent',20,400000,200000,'2026-05-01 00:00:00','2026-08-31 00:00:00',200,0,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(4,'FREESHIP','fixed',30000,0,30000,'2026-01-01 00:00:00','2026-12-31 00:00:00',0,25,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(5,'VIP30','percent',30,1000000,500000,'2026-03-01 00:00:00','2026-03-31 00:00:00',20,3,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(6,'TEST','percent',12,200000,100000,'2025-01-01 00:00:00','2026-03-24 00:00:00',0,1,1,'2026-03-01 09:51:03','2026-03-01 10:36:58');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'order',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Đơn hàng hoàn thành','Đơn hàng #JN909554001 đã được giao thành công. Cảm ơn bạn đã mua sắm tại June!','order',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(2,2,'Đơn hàng đang giao','Đơn hàng #JN909598002 đang được giao đến bạn. Vui lòng chú ý điện thoại.','order',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(3,3,'Đơn hàng hoàn thành','Đơn hàng #JN909639004 đã được giao thành công. Cảm ơn bạn đã mua sắm tại June!','order',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(4,3,'Đơn hàng đã xác nhận','Đơn hàng #JN909690005 đã được xác nhận và đang chuẩn bị hàng.','order',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(5,4,'Đơn hàng hoàn thành','Đơn hàng #JN909707006 đã được giao thành công. Cảm ơn bạn đã mua sắm tại June!','order',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(6,5,'Đơn hàng hoàn thành','Đơn hàng #JN909760008 đã được giao thành công. Cảm ơn bạn đã mua sắm tại June!','order',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(7,5,'Đơn hàng đang giao','Đơn hàng #JN909794009 đang được giao đến bạn. Vui lòng chú ý điện thoại.','order',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(8,6,'Đơn hàng hoàn thành','Đơn hàng #JN909819010 đã được giao thành công. Cảm ơn bạn đã mua sắm tại June!','order',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(9,2,'Ưu đãi đặc biệt','Nhập mã SUMMER20 để giảm 20% cho đơn hàng từ 400K. Áp dụng đến hết 31/08/2026.','promotion',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(10,3,'Ưu đãi đặc biệt','Nhập mã SUMMER20 để giảm 20% cho đơn hàng từ 400K. Áp dụng đến hết 31/08/2026.','promotion',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(11,4,'Chào mừng thành viên mới','Cảm ơn bạn đã đăng ký tài khoản June. Nhập mã WELCOME10 để giảm 10% đơn hàng đầu tiên!','promotion',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(12,5,'Sản phẩm yêu thích đang giảm giá','Áo thun trơn cổ tròn bạn yêu thích đang giảm 29%. Mua ngay kẻo hết!','promotion',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(13,6,'Đánh giá đơn hàng','Hãy đánh giá sản phẩm trong đơn hàng gần đây để nhận 50 điểm tích luỹ!','order',0,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(14,1,'Đặt hàng thành công','Đơn hàng #JN2603013930 đã được đặt thành công','order',0,'2026-03-01 10:26:29','2026-03-01 10:26:29'),(15,1,'Đặt hàng thành công','Đơn hàng #JN2603013536 đã được đặt thành công','order',0,'2026-03-01 10:26:49','2026-03-01 10:26:49'),(16,1,'Thanh toán thành công','Đơn hàng #JN2603013536 đã thanh toán thành công qua VNPay','payment',0,'2026-03-01 10:27:10','2026-03-01 10:27:10'),(17,1,'Thanh toán thành công','Đơn hàng #JN2603013536 đã thanh toán thành công qua VNPay','payment',0,'2026-03-01 10:27:10','2026-03-01 10:27:10'),(18,1,'Đặt hàng thành công','Đơn hàng #JN2603010774 đã được đặt thành công','order',0,'2026-03-01 10:36:58','2026-03-01 10:36:58'),(19,1,'Hủy đơn hàng','Đơn hàng #JN2603010774 đã được hủy','order',0,'2026-03-01 10:37:06','2026-03-01 10:37:06');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `size` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(12,0) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `order_items_ibfk_11` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_12` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,9,'Áo thun trơn cổ tròn','','L','Đen',2,250000),(2,1,32,'Quần jean slim fit','','M','Xanh đậm',1,550000),(3,2,107,'Áo khoác bomber','','L','Đen',1,650000),(4,3,89,'Áo polo nam classic','','M','Trắng',1,320000),(5,3,20,'Áo sơ mi trắng dài tay','','M','Trắng',1,450000),(6,4,57,'Váy liền hoa nhí','','S','Hồng',1,380000),(7,4,70,'Váy midi xếp ly','','S','Be',1,420000),(8,4,19,'Áo sơ mi trắng dài tay','','S','Hồng nhạt',1,450000),(9,5,106,'Áo khoác bomber','','M','Be',1,650000),(10,6,37,'Quần jean slim fit','','L','Đen',2,550000),(11,6,52,'Quần tây công sở','','L','Navy',1,480000),(12,7,16,'Áo thun trơn cổ tròn','','XL','Navy',3,250000),(13,8,61,'Váy liền hoa nhí','','M','Xanh mint',1,380000),(14,8,76,'Váy midi xếp ly','','M','Đỏ đô',1,420000),(15,9,88,'Áo polo nam classic','','S','Đỏ',1,320000),(16,9,2,'Áo thun trơn cổ tròn','','S','Trắng',2,250000),(17,10,111,'Áo khoác bomber','','XL','Xanh rêu',1,650000),(18,10,53,'Quần tây công sở','','XL','Đen',1,480000),(19,10,15,'Áo thun trơn cổ tròn','','XL','Xám',1,250000),(20,11,24,'Áo sơ mi trắng dài tay','','L','Xanh nhạt',1,450000),(21,12,41,'Quần tây công sở','https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop','S','Đen',2,480000),(22,13,41,'Quần tây công sở','https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop','S','Đen',1,480000),(23,14,90,'Áo polo nam classic','https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop','M','Đen',1,320000);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(12,0) NOT NULL,
  `discount` decimal(12,0) DEFAULT '0',
  `shipping_fee` decimal(12,0) DEFAULT '0',
  `total` decimal(12,0) NOT NULL,
  `coupon_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `payment_method` enum('cod','vnpay') COLLATE utf8mb4_unicode_ci DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `order_status` enum('pending','confirmed','shipping','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  UNIQUE KEY `order_code_2` (`order_code`),
  UNIQUE KEY `order_code_3` (`order_code`),
  UNIQUE KEY `order_code_4` (`order_code`),
  UNIQUE KEY `order_code_5` (`order_code`),
  UNIQUE KEY `order_code_6` (`order_code`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,'JN909554001','Nguyễn Văn A','0912345678','123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh','Giao giờ hành chính',1050000,0,0,1050000,'','cod','paid','completed','2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,2,'JN909598002','Nguyễn Văn A','0912345678','123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh','',650000,50000,0,600000,'SALE50K','vnpay','paid','shipping','2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,2,'JN909615003','Nguyễn Văn A','0912345678','123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh','Gọi trước khi giao',770000,0,0,770000,'','cod','pending','pending','2026-03-01 09:38:29','2026-03-01 09:38:29'),(4,3,'JN909639004','Trần Thị B','0923456789','78 Phố Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội','',1250000,100000,0,1150000,'WELCOME10','vnpay','paid','completed','2026-03-01 09:38:29','2026-03-01 09:38:29'),(5,3,'JN909690005','Trần Thị B','0923456789','78 Phố Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội','Giao buổi chiều',650000,0,0,650000,'','cod','pending','confirmed','2026-03-01 09:38:29','2026-03-01 09:38:29'),(6,4,'JN909707006','Lê Minh C','0934567890','12 Đường Bạch Đằng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','',1580000,0,0,1580000,'','cod','paid','completed','2026-03-01 09:38:29','2026-03-01 09:38:29'),(7,4,'JN909742007','Lê Minh C','0934567890','12 Đường Bạch Đằng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','Đổi ý không mua nữa',750000,0,0,750000,'','vnpay','failed','cancelled','2026-03-01 09:38:29','2026-03-01 09:38:29'),(8,5,'JN909760008','Phạm Thuỳ D','0945678901','234 Đường Hai Bà Trưng, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh','',800000,50000,0,750000,'SALE50K','cod','paid','completed','2026-03-01 09:38:29','2026-03-01 09:38:29'),(9,5,'JN909794009','Phạm Thuỳ D','0945678901','234 Đường Hai Bà Trưng, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh','',820000,0,0,820000,'','vnpay','paid','shipping','2026-03-01 09:38:29','2026-03-01 09:38:29'),(10,6,'JN909819010','Hoàng Anh E','0956789012','567 Đường Xô Viết Nghệ Tĩnh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh','',1380000,0,0,1380000,'','vnpay','paid','completed','2026-03-01 09:38:29','2026-03-01 09:38:29'),(11,6,'JN909866011','Hoàng Anh E','0956789012','567 Đường Xô Viết Nghệ Tĩnh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh','Giao cuối tuần',450000,30000,30000,450000,'FREESHIP','cod','pending','pending','2026-03-01 09:38:29','2026-03-01 09:38:29'),(12,1,'JN2603013930','test','0338787878','111, Phường Quang Trung, Thành phố Hà Giang, Tỉnh Hà Giang','',960000,0,0,960000,'','vnpay','pending','pending','2026-03-01 10:26:29','2026-03-01 10:26:29'),(13,1,'JN2603013536','test','0338787878','111, Phường Quang Trung, Thành phố Hà Giang, Tỉnh Hà Giang','',480000,0,30000,510000,'','vnpay','paid','pending','2026-03-01 10:26:49','2026-03-01 10:27:10'),(14,1,'JN2603010774','test','0338787878','111, Phường Quang Trung, Thành phố Hà Giang, Tỉnh Hà Giang','',320000,5000,30000,345000,'TEST','cod','pending','cancelled','2026-03-01 10:36:58','2026-03-01 10:37:06');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vnpay_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `amount` decimal(12,0) NOT NULL,
  `status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `vnpay_response` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'cod','',1050000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,2,'vnpay','VNP17723579096101',600000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,3,'cod','',770000,'pending',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(4,4,'vnpay','VNP17723579096843',1150000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(5,5,'cod','',650000,'pending',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(6,6,'cod','',1580000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(7,7,'vnpay','',750000,'failed',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(8,8,'cod','',750000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(9,9,'vnpay','VNP17723579098138',820000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(10,10,'vnpay','VNP17723579098609',1380000,'paid',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(11,11,'cod','',450000,'pending',NULL,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(12,12,'vnpay','',960000,'pending',NULL,'2026-03-01 10:26:29','2026-03-01 10:26:29'),(13,13,'vnpay','15434621',510000,'paid','{\"vnp_Amount\":\"51000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15434621\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toán đơn hàng JN2603013536\",\"vnp_PayDate\":\"20260301172707\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"B77INC60\",\"vnp_TransactionNo\":\"15434621\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"13\"}','2026-03-01 10:26:49','2026-03-01 10:27:10'),(14,14,'cod','',345000,'pending',NULL,'2026-03-01 10:36:58','2026-03-01 10:36:58');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'Xu hướng thời trang Hè 2026 không thể bỏ lỡ','xu-huong-thoi-trang-he-2026','Mùa hè 2026 hứa hẹn sẽ là mùa của những bộ trang phục thoải mái, năng động. Các tông màu pastel như xanh mint, hồng nhạt, vàng nhạt tiếp tục thống trị sàn diễn thời trang. Chất liệu cotton, linen và voan mỏng được ưa chuộng vì sự thoáng mát.\n\nBên cạnh đó, phong cách minimalist với các item basic như áo thun trơn, quần jean slim fit vẫn là lựa chọn an toàn cho mọi dịp. Váy midi xếp ly và váy hoa nhí cũng là must-have cho các bạn nữ trong mùa hè này.\n\nJune Fashion mang đến cho bạn những bộ sưu tập mới nhất, cập nhật xu hướng nhanh chóng với giá cả hợp lý.','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(2,'Cách phối đồ công sở vừa đẹp vừa thoải mái','cach-phoi-do-cong-so','Đi làm hàng ngày không có nghĩa là bạn phải hy sinh phong cách. Với một vài mẹo nhỏ, bạn có thể vừa lịch sự vừa thời trang.\n\n1. Áo sơ mi + Quần tây: Combo kinh điển nhưng không bao giờ lỗi thời. Chọn áo sơ mi màu pastel thay vì trắng đơn điệu.\n\n2. Polo + Chinos: Phong cách smart casual, phù hợp với môi trường công sở hiện đại.\n\n3. Váy midi + Blazer: Dành cho các bạn nữ muốn vừa thanh lịch vừa nữ tính.\n\nHãy ghé June Fashion để tìm cho mình những item công sở chất lượng nhất!','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=400&fit=crop',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(3,'5 lý do bạn nên sở hữu một chiếc áo khoác bomber','5-ly-do-nen-so-huu-ao-khoac-bomber','Áo khoác bomber không chỉ là item thời trang mà còn là món đầu tư thông minh:\n\n1. Phù hợp mọi thời tiết: Chất liệu dù nhẹ, chống gió hiệu quả.\n\n2. Dễ phối đồ: Mix được với áo thun, sơ mi, hoodie.\n\n3. Unisex: Cả nam và nữ đều mặc được.\n\n4. Bền bỉ: Chất liệu dù bền, ít phai màu, dễ giặt.\n\n5. Đa năng: Mặc đi chơi, đi làm, đi du lịch đều phù hợp.\n\nÁo khoác bomber của June Fashion được thiết kế với form chuẩn, chất liệu dù cao cấp. Hãy sắm ngay một chiếc cho tủ đồ của bạn!','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=400&fit=crop',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(4,'Hướng dẫn chọn size quần jean phù hợp','huong-dan-chon-size-quan-jean','Chọn đúng size quần jean là bước quan trọng để có được phong cách hoàn hảo. Dưới đây là hướng dẫn chi tiết:\n\n- Size S: Eo 68-72cm, mông 88-92cm\n- Size M: Eo 72-76cm, mông 92-96cm\n- Size L: Eo 76-80cm, mông 96-100cm\n- Size XL: Eo 80-84cm, mông 100-104cm\n\nMẹo: Nếu bạn thích form slim fit, nên chọn đúng size. Nếu thích form rộng thoải mái, chọn lên 1 size.','https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=400&fit=crop',1,'2026-03-01 09:38:30','2026-03-01 09:38:30'),(5,'Chương trình ưu đãi tháng 6 - Mừng sinh nhật June','uu-dai-thang-6-sinh-nhat-june','Nhân dịp kỷ niệm ngày thành lập, June Fashion dành tặng hàng loạt ưu đãi hấp dẫn cho khách hàng:\n\n- Giảm 20% tất cả sản phẩm với mã SUMMER20\n- Miễn phí vận chuyển toàn quốc với mã FREESHIP\n- Tặng voucher 100K cho đơn hàng từ 500K\n\nChương trình áp dụng từ 01/06 đến 30/06/2026. Số lượng mã có hạn, nhanh tay để không bỏ lỡ!','https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop',0,'2026-03-01 09:38:30','2026-03-01 09:38:30');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',1),(2,1,'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop',0),(3,2,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',1),(4,2,'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop',0),(5,3,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',1),(6,3,'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',0),(7,4,'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',1),(8,4,'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop',0),(9,5,'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop',1),(10,5,'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop',0),(11,6,'https://images.unsplash.com/photo-1583496661160-fb5886a0aaef?w=600&h=800&fit=crop',1),(12,6,'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=600&h=800&fit=crop',0),(13,7,'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop',1),(14,7,'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=800&fit=crop',0),(15,8,'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',1),(16,8,'https://images.unsplash.com/photo-1544923246-77307dd270b1?w=600&h=800&fit=crop',0),(17,10,'https://res.cloudinary.com/daytrfyrg/image/upload/v1772361970/june-store/izyorlar3dbvvold7xxv.jpg',1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int DEFAULT '0',
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'S','Đen',28,'AO-THUN-TRON-CO-TRON-S-ĐEN'),(2,1,'S','Trắng',49,'AO-THUN-TRON-CO-TRON-S-TRẮNG'),(3,1,'S','Xám',29,'AO-THUN-TRON-CO-TRON-S-XÁM'),(4,1,'S','Navy',31,'AO-THUN-TRON-CO-TRON-S-NAVY'),(5,1,'M','Đen',30,'AO-THUN-TRON-CO-TRON-M-ĐEN'),(6,1,'M','Trắng',55,'AO-THUN-TRON-CO-TRON-M-TRẮNG'),(7,1,'M','Xám',87,'AO-THUN-TRON-CO-TRON-M-XÁM'),(8,1,'M','Navy',20,'AO-THUN-TRON-CO-TRON-M-NAVY'),(9,1,'L','Đen',66,'AO-THUN-TRON-CO-TRON-L-ĐEN'),(10,1,'L','Trắng',72,'AO-THUN-TRON-CO-TRON-L-TRẮNG'),(11,1,'L','Xám',76,'AO-THUN-TRON-CO-TRON-L-XÁM'),(12,1,'L','Navy',95,'AO-THUN-TRON-CO-TRON-L-NAVY'),(13,1,'XL','Đen',80,'AO-THUN-TRON-CO-TRON-XL-ĐEN'),(14,1,'XL','Trắng',22,'AO-THUN-TRON-CO-TRON-XL-TRẮNG'),(15,1,'XL','Xám',33,'AO-THUN-TRON-CO-TRON-XL-XÁM'),(16,1,'XL','Navy',71,'AO-THUN-TRON-CO-TRON-XL-NAVY'),(17,2,'S','Trắng',46,'AO-SO-MI-TRANG-DAI-TAY-S-TRẮNG'),(18,2,'S','Xanh nhạt',77,'AO-SO-MI-TRANG-DAI-TAY-S-XANH-NHẠT'),(19,2,'S','Hồng nhạt',85,'AO-SO-MI-TRANG-DAI-TAY-S-HỒNG-NHẠT'),(20,2,'M','Trắng',28,'AO-SO-MI-TRANG-DAI-TAY-M-TRẮNG'),(21,2,'M','Xanh nhạt',99,'AO-SO-MI-TRANG-DAI-TAY-M-XANH-NHẠT'),(22,2,'M','Hồng nhạt',98,'AO-SO-MI-TRANG-DAI-TAY-M-HỒNG-NHẠT'),(23,2,'L','Trắng',36,'AO-SO-MI-TRANG-DAI-TAY-L-TRẮNG'),(24,2,'L','Xanh nhạt',97,'AO-SO-MI-TRANG-DAI-TAY-L-XANH-NHẠT'),(25,2,'L','Hồng nhạt',39,'AO-SO-MI-TRANG-DAI-TAY-L-HỒNG-NHẠT'),(26,2,'XL','Trắng',89,'AO-SO-MI-TRANG-DAI-TAY-XL-TRẮNG'),(27,2,'XL','Xanh nhạt',97,'AO-SO-MI-TRANG-DAI-TAY-XL-XANH-NHẠT'),(28,2,'XL','Hồng nhạt',39,'AO-SO-MI-TRANG-DAI-TAY-XL-HỒNG-NHẠT'),(29,3,'S','Xanh đậm',72,'QUAN-JEAN-SLIM-FIT-S-XANH-ĐẬM'),(30,3,'S','Xanh nhạt',40,'QUAN-JEAN-SLIM-FIT-S-XANH-NHẠT'),(31,3,'S','Đen',47,'QUAN-JEAN-SLIM-FIT-S-ĐEN'),(32,3,'M','Xanh đậm',34,'QUAN-JEAN-SLIM-FIT-M-XANH-ĐẬM'),(33,3,'M','Xanh nhạt',59,'QUAN-JEAN-SLIM-FIT-M-XANH-NHẠT'),(34,3,'M','Đen',51,'QUAN-JEAN-SLIM-FIT-M-ĐEN'),(35,3,'L','Xanh đậm',34,'QUAN-JEAN-SLIM-FIT-L-XANH-ĐẬM'),(36,3,'L','Xanh nhạt',38,'QUAN-JEAN-SLIM-FIT-L-XANH-NHẠT'),(37,3,'L','Đen',59,'QUAN-JEAN-SLIM-FIT-L-ĐEN'),(38,3,'XL','Xanh đậm',85,'QUAN-JEAN-SLIM-FIT-XL-XANH-ĐẬM'),(39,3,'XL','Xanh nhạt',28,'QUAN-JEAN-SLIM-FIT-XL-XANH-NHẠT'),(40,3,'XL','Đen',77,'QUAN-JEAN-SLIM-FIT-XL-ĐEN'),(41,4,'S','Đen',21,'QUAN-TAY-CONG-SO-S-ĐEN'),(42,4,'S','Xám đậm',46,'QUAN-TAY-CONG-SO-S-XÁM-ĐẬM'),(43,4,'S','Be',62,'QUAN-TAY-CONG-SO-S-BE'),(44,4,'S','Navy',26,'QUAN-TAY-CONG-SO-S-NAVY'),(45,4,'M','Đen',30,'QUAN-TAY-CONG-SO-M-ĐEN'),(46,4,'M','Xám đậm',45,'QUAN-TAY-CONG-SO-M-XÁM-ĐẬM'),(47,4,'M','Be',45,'QUAN-TAY-CONG-SO-M-BE'),(48,4,'M','Navy',29,'QUAN-TAY-CONG-SO-M-NAVY'),(49,4,'L','Đen',52,'QUAN-TAY-CONG-SO-L-ĐEN'),(50,4,'L','Xám đậm',45,'QUAN-TAY-CONG-SO-L-XÁM-ĐẬM'),(51,4,'L','Be',43,'QUAN-TAY-CONG-SO-L-BE'),(52,4,'L','Navy',42,'QUAN-TAY-CONG-SO-L-NAVY'),(53,4,'XL','Đen',39,'QUAN-TAY-CONG-SO-XL-ĐEN'),(54,4,'XL','Xám đậm',81,'QUAN-TAY-CONG-SO-XL-XÁM-ĐẬM'),(55,4,'XL','Be',36,'QUAN-TAY-CONG-SO-XL-BE'),(56,4,'XL','Navy',89,'QUAN-TAY-CONG-SO-XL-NAVY'),(57,5,'S','Hồng',87,'VAY-LIEN-HOA-NHI-S-HỒNG'),(58,5,'S','Xanh mint',49,'VAY-LIEN-HOA-NHI-S-XANH-MINT'),(59,5,'S','Vàng nhạt',57,'VAY-LIEN-HOA-NHI-S-VÀNG-NHẠT'),(60,5,'M','Hồng',95,'VAY-LIEN-HOA-NHI-M-HỒNG'),(61,5,'M','Xanh mint',52,'VAY-LIEN-HOA-NHI-M-XANH-MINT'),(62,5,'M','Vàng nhạt',40,'VAY-LIEN-HOA-NHI-M-VÀNG-NHẠT'),(63,5,'L','Hồng',73,'VAY-LIEN-HOA-NHI-L-HỒNG'),(64,5,'L','Xanh mint',42,'VAY-LIEN-HOA-NHI-L-XANH-MINT'),(65,5,'L','Vàng nhạt',25,'VAY-LIEN-HOA-NHI-L-VÀNG-NHẠT'),(66,5,'XL','Hồng',87,'VAY-LIEN-HOA-NHI-XL-HỒNG'),(67,5,'XL','Xanh mint',81,'VAY-LIEN-HOA-NHI-XL-XANH-MINT'),(68,5,'XL','Vàng nhạt',81,'VAY-LIEN-HOA-NHI-XL-VÀNG-NHẠT'),(69,6,'S','Đen',52,'VAY-MIDI-XEP-LY-S-ĐEN'),(70,6,'S','Be',92,'VAY-MIDI-XEP-LY-S-BE'),(71,6,'S','Nâu',36,'VAY-MIDI-XEP-LY-S-NÂU'),(72,6,'S','Đỏ đô',25,'VAY-MIDI-XEP-LY-S-ĐỎ-ĐÔ'),(73,6,'M','Đen',44,'VAY-MIDI-XEP-LY-M-ĐEN'),(74,6,'M','Be',27,'VAY-MIDI-XEP-LY-M-BE'),(75,6,'M','Nâu',90,'VAY-MIDI-XEP-LY-M-NÂU'),(76,6,'M','Đỏ đô',57,'VAY-MIDI-XEP-LY-M-ĐỎ-ĐÔ'),(77,6,'L','Đen',68,'VAY-MIDI-XEP-LY-L-ĐEN'),(78,6,'L','Be',30,'VAY-MIDI-XEP-LY-L-BE'),(79,6,'L','Nâu',48,'VAY-MIDI-XEP-LY-L-NÂU'),(80,6,'L','Đỏ đô',45,'VAY-MIDI-XEP-LY-L-ĐỎ-ĐÔ'),(81,6,'XL','Đen',21,'VAY-MIDI-XEP-LY-XL-ĐEN'),(82,6,'XL','Be',76,'VAY-MIDI-XEP-LY-XL-BE'),(83,6,'XL','Nâu',90,'VAY-MIDI-XEP-LY-XL-NÂU'),(84,6,'XL','Đỏ đô',71,'VAY-MIDI-XEP-LY-XL-ĐỎ-ĐÔ'),(85,7,'S','Trắng',25,'AO-POLO-NAM-CLASSIC-S-TRẮNG'),(86,7,'S','Đen',39,'AO-POLO-NAM-CLASSIC-S-ĐEN'),(87,7,'S','Xanh rêu',69,'AO-POLO-NAM-CLASSIC-S-XANH-RÊU'),(88,7,'S','Đỏ',43,'AO-POLO-NAM-CLASSIC-S-ĐỎ'),(89,7,'M','Trắng',64,'AO-POLO-NAM-CLASSIC-M-TRẮNG'),(90,7,'M','Đen',98,'AO-POLO-NAM-CLASSIC-M-ĐEN'),(91,7,'M','Xanh rêu',66,'AO-POLO-NAM-CLASSIC-M-XANH-RÊU'),(92,7,'M','Đỏ',51,'AO-POLO-NAM-CLASSIC-M-ĐỎ'),(93,7,'L','Trắng',85,'AO-POLO-NAM-CLASSIC-L-TRẮNG'),(94,7,'L','Đen',64,'AO-POLO-NAM-CLASSIC-L-ĐEN'),(95,7,'L','Xanh rêu',88,'AO-POLO-NAM-CLASSIC-L-XANH-RÊU'),(96,7,'L','Đỏ',20,'AO-POLO-NAM-CLASSIC-L-ĐỎ'),(97,7,'XL','Trắng',20,'AO-POLO-NAM-CLASSIC-XL-TRẮNG'),(98,7,'XL','Đen',29,'AO-POLO-NAM-CLASSIC-XL-ĐEN'),(99,7,'XL','Xanh rêu',40,'AO-POLO-NAM-CLASSIC-XL-XANH-RÊU'),(100,7,'XL','Đỏ',52,'AO-POLO-NAM-CLASSIC-XL-ĐỎ'),(101,8,'S','Đen',24,'AO-KHOAC-BOMBER-S-ĐEN'),(102,8,'S','Xanh rêu',57,'AO-KHOAC-BOMBER-S-XANH-RÊU'),(103,8,'S','Be',68,'AO-KHOAC-BOMBER-S-BE'),(104,8,'M','Đen',26,'AO-KHOAC-BOMBER-M-ĐEN'),(105,8,'M','Xanh rêu',66,'AO-KHOAC-BOMBER-M-XANH-RÊU'),(106,8,'M','Be',48,'AO-KHOAC-BOMBER-M-BE'),(107,8,'L','Đen',40,'AO-KHOAC-BOMBER-L-ĐEN'),(108,8,'L','Xanh rêu',31,'AO-KHOAC-BOMBER-L-XANH-RÊU'),(109,8,'L','Be',75,'AO-KHOAC-BOMBER-L-BE'),(110,8,'XL','Đen',29,'AO-KHOAC-BOMBER-XL-ĐEN'),(111,8,'XL','Xanh rêu',26,'AO-KHOAC-BOMBER-XL-XANH-RÊU'),(112,8,'XL','Be',24,'AO-KHOAC-BOMBER-XL-BE'),(115,10,'32','Hồng',52,'T-32-PNK');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,0) NOT NULL,
  `original_price` decimal(12,0) DEFAULT '0',
  `category_id` int NOT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `is_active` tinyint(1) DEFAULT '1',
  `sold_count` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Áo thun trơn cổ tròn','ao-thun-tron-co-tron','Áo thun trơn chất liệu cotton 100%, thoáng mát, phù hợp mặc hàng ngày.',250000,350000,1,'June',1,3,'2026-03-01 09:38:28','2026-03-01 09:38:29'),(2,'Áo sơ mi trắng dài tay','ao-so-mi-trang-dai-tay','Áo sơ mi trắng form regular, chất liệu vải kate mềm mịn.',450000,550000,1,'June',1,1,'2026-03-01 09:38:28','2026-03-01 09:38:29'),(3,'Quần jean slim fit','quan-jean-slim-fit','Quần jean nam form slim fit, co giãn tốt, thoải mái khi vận động.',550000,700000,2,'June',1,3,'2026-03-01 09:38:28','2026-03-01 09:38:29'),(4,'Quần tây công sở','quan-tay-cong-so','Quần tây nam form regular, phù hợp mặc đi làm, đi sự kiện.',480000,600000,2,'June',1,5,'2026-03-01 09:38:29','2026-03-01 10:26:49'),(5,'Váy liền hoa nhí','vay-lien-hoa-nhi','Váy liền nữ họa tiết hoa nhí, chất liệu voan nhẹ nhàng.',380000,500000,3,'June',1,2,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(6,'Váy midi xếp ly','vay-midi-xep-ly','Váy midi xếp ly thanh lịch, phù hợp đi chơi, đi làm.',420000,520000,3,'June',1,2,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(7,'Áo polo nam classic','ao-polo-nam-classic','Áo polo nam phong cách lịch sự, chất liệu cotton pha co giãn.',320000,420000,1,'June',1,1,'2026-03-01 09:38:29','2026-03-01 10:36:58'),(8,'Áo khoác bomber','ao-khoac-bomber','Áo khoác bomber unisex, chất liệu dù nhẹ chống gió.',650000,850000,1,'June',1,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(10,'test','test-10','',120000,0,3,'',1,0,'2026-03-01 10:46:02','2026-03-01 10:46:11');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `reviews_ibfk_11` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_12` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,1,1,5,'Chất vải rất thoáng mát, mặc rất thoải mái. Sẽ mua thêm màu khác.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,2,3,1,4,'Quần đẹp, form slim fit vừa vặn. Chất jean co giãn tốt.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,3,5,4,5,'Váy rất xinh, vải voan nhẹ nhàng. Mặc đi chơi rất hợp!',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(4,3,6,4,4,'Váy xếp ly đẹp, thanh lịch. Hơi dài so với mình.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(5,3,2,4,5,'Sơ mi đẹp lắm, vải mềm mịn không nhăn. Rất ưng ý!',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(6,4,3,6,5,'Jean rất chất lượng, đường may cẩn thận. Đã mua lần 2.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(7,4,4,6,4,'Quần tây đẹp, form chuẩn. Mặc đi làm rất lịch sự.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(8,5,5,8,4,'Váy đẹp, giao hàng nhanh. Màu xanh mint rất dễ thương.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(9,5,6,8,5,'Váy midi rất sang trọng, vải dày dặn. Mặc đi làm cực đẹp!',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(10,6,8,10,5,'Áo khoác bomber đẹp xuất sắc, chất dù nhẹ mà ấm. Rất đáng tiền!',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(11,6,4,10,3,'Quần tây ổn, nhưng hơi rộng ở phần eo. Nên chọn nhỏ hơn 1 size.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(12,6,1,10,4,'Áo thun tốt, nhưng sau vài lần giặt hơi xù lông. Nhìn chung vẫn ok.',1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(13,2,7,NULL,5,'Áo polo rất đẹp, chất cotton mát. Form vừa vặn!',0,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(14,5,7,NULL,4,'Polo đẹp, màu đỏ rất nổi bật. Giao hàng hơi lâu.',0,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(15,1,7,NULL,4,'tt',1,'2026-03-01 10:46:18','2026-03-01 10:46:25');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `key_2` (`key`),
  UNIQUE KEY `key_3` (`key`),
  UNIQUE KEY `key_4` (`key`),
  UNIQUE KEY `key_5` (`key`),
  UNIQUE KEY `key_6` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'shop_name','June Fashion 1','2026-03-01 09:38:30','2026-03-01 09:53:04'),(2,'shop_phone','0901234567','2026-03-01 09:38:30','2026-03-01 09:53:04'),(3,'shop_email','contact@june.vn','2026-03-01 09:38:30','2026-03-01 09:53:04'),(4,'shop_address','123 Đường ABC, Quận 1, TP.HCM','2026-03-01 09:38:30','2026-03-01 09:53:04'),(5,'shipping_fee','30000','2026-03-01 09:38:30','2026-03-01 09:53:04'),(6,'free_shipping_min','500000','2026-03-01 09:38:30','2026-03-01 09:53:04');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@june.vn','$2b$10$Y5lu84dyEA.By2XxvntrruwLp/7IpNh.bjKqQ7JB20INsoXukzdFO','0901234567','','admin',1,'2026-03-01 09:38:28','2026-03-01 09:38:28',NULL,NULL),(2,'Nguyễn Văn A','user@june.vn','$2b$10$wXdJ88Ik5V4YhecNf7p1Zefznp7b6QJFJ1OkITUk0OXKOUFguGjfi','0912345678','','user',1,'2026-03-01 09:38:28','2026-03-01 09:38:28',NULL,NULL),(3,'Trần Thị B','tranthib@gmail.com','$2b$10$nGukOC3NdoJS1sJhAxqTDOIbW1FAjYqvgT5E1CSRB0cB2tizKXPg6','0923456789','','user',1,'2026-03-01 09:38:28','2026-03-01 09:38:28',NULL,NULL),(4,'Lê Minh C','leminhc@gmail.com','$2b$10$P5b6BoSbTrmroBg95P7Px.YN0SD6B77VBzVAkwaqzEDFI96B3YcGi','0934567890','','user',1,'2026-03-01 09:38:28','2026-03-01 09:38:28',NULL,NULL),(5,'Phạm Thuỳ D','phamthuyd@gmail.com','$2b$10$shOIdf4..jkDAv/ppdpp0uFdI2VmVBHRkdmOeDG8ibLNgP8EduW.G','0945678901','','user',1,'2026-03-01 09:38:28','2026-03-01 09:38:28',NULL,NULL),(6,'Hoàng Anh E','hoanganhe@gmail.com','$2b$10$o8nrPwBw9heCz8gSqwpso.d5UBDZs/fwsXzyYERc/dgqj5gLD4w0W','0956789012','','user',1,'2026-03-01 09:38:28','2026-03-01 09:38:28',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlists_ibfk_11` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wishlists_ibfk_12` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,2,5,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(2,2,8,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(3,3,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(4,3,7,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(5,3,8,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(6,4,2,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(7,5,1,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(8,5,3,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(9,6,5,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(10,6,6,'2026-03-01 09:38:29','2026-03-01 09:38:29'),(12,1,7,'2026-03-01 10:39:06','2026-03-01 10:39:06');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- =====================================================================
-- Bổ sung (2026-04-09): RAG + lưu hội thoại chatbot — database june_db
-- Chi tiết đầy đủ: file database_rag_chatbot.sql
-- =====================================================================
SET NAMES utf8mb4;
USE `june_db`;

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

-- Dump completed on 2026-03-06 13:26:57
