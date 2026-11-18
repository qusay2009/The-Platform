-- ============================================================
-- The Platform (المنصة) - Exhibition Booking System Database
-- نظام قاعدة بيانات حجز مواعيد الاستشارات لمعرض 12/12/2026
-- متوافق مع: MySQL / MariaDB / PostgreSQL / SQLite
-- ============================================================

-- إنشاء قاعدة البيانات إذا لم تكن موجودة
CREATE DATABASE IF NOT EXISTS `exhibition_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `exhibition_db`;

-- جدول حجز مواعيد الاستشارات
CREATE TABLE IF NOT EXISTS `consultation_bookings` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'معرّف الحجز الفريد',
  `service_name` VARCHAR(100) NOT NULL DEFAULT 'موعد زيارة بوث' COMMENT 'نوع الخدمة',
  `booth_id` VARCHAR(32) NOT NULL COMMENT 'معرّف البوث (b1..b7)',
  `booth_name` VARCHAR(100) NOT NULL COMMENT 'اسم البوث أو الخبير المستشار',
  `slot_id` VARCHAR(32) NOT NULL COMMENT 'معرّف الوقت (s01..s20)',
  `start_time` VARCHAR(10) NOT NULL COMMENT 'وقت بدء الموعد',
  `end_time` VARCHAR(10) NOT NULL COMMENT 'وقت نهاية الموعد',
  `slot_range` VARCHAR(100) NOT NULL COMMENT 'نطاق الموعد: من وقت إلى وقت',
  `appointment_date` DATE NOT NULL DEFAULT '2026-12-12' COMMENT 'تاريخ يوم المعرض',
  `visitor_name` VARCHAR(150) NOT NULL COMMENT 'اسم الزائر الكامل',
  `visitor_phone` VARCHAR(50) NOT NULL COMMENT 'رقم هاتف الزائر',
  `registered_at` DATETIME NOT NULL COMMENT 'الوقت الفعلي الدقيق لتسجيل الحجز (بالثانية)',
  `registered_at_formatted` VARCHAR(100) COMMENT 'توقيت التسجيل الفعلي بتوقيت عمّان',
  `status` ENUM('confirmed', 'cancelled', 'attended') NOT NULL DEFAULT 'confirmed' COMMENT 'حالة الحجز',
  `created_timestamp` BIGINT NOT NULL COMMENT 'ختم زمني رقمي Epoch بالمللي ثانية',
  
  -- الفهارس لمنع الازدواجية وتسريع عمليات البحث
  INDEX `idx_booth_slot` (`booth_id`, `slot_id`),
  INDEX `idx_phone_slot` (`visitor_phone`, `slot_id`),
  INDEX `idx_registered_at` (`registered_at`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول حجوزات الاستشارات';

-- ============================================================
-- قيود منع التضارب (Constraints):
-- 1. لا يُسمح بحجز نفس الوقت في نفس البوث لأكثر من شخص
-- 2. لا يُسمح لنفس رقم الهاتف بحجز موعدين متزامنين في نفس الوقت عبر أي بوث
-- ============================================================

ALTER TABLE `consultation_bookings` 
ADD CONSTRAINT `unique_booth_slot` UNIQUE (`booth_id`, `slot_id`);

-- استعلامات مفيدة للإدارة (Useful Admin Queries):

-- 1. عرض كافة الحجوزات مرتبة حسب وقت التسجيل الفعلي:
-- SELECT id, booth_name, slot_range, visitor_name, visitor_phone, registered_at_formatted 
-- FROM consultation_bookings 
-- WHERE status = 'confirmed' 
-- ORDER BY registered_at DESC;

-- 2. التحقق من عدم وجود تضارب لموعد زائر في نفس الوقت:
-- SELECT * FROM consultation_bookings 
-- WHERE visitor_phone = '0791234567' AND slot_id = 's01' AND status = 'confirmed';

-- 3. إحصائيات عدد الحجوزات لكل بوث:
-- SELECT booth_name, COUNT(*) AS total_booked 
-- FROM consultation_bookings 
-- WHERE status = 'confirmed' 
-- GROUP BY booth_name;
