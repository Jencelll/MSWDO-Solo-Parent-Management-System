-- Database Backup: pagsanjan_solo_parent
-- Generated: 2026-02-26 06:28:41
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS=0;

-- Table structure for table `admin_staff`
DROP TABLE IF EXISTS `admin_staff`;
CREATE TABLE `admin_staff` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','staff') NOT NULL DEFAULT 'staff',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_staff_username_unique` (`username`),
  UNIQUE KEY `admin_staff_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `admin_staff`
INSERT INTO `admin_staff` VALUES 
('1', 'admin', 'admin', '$2y$12$0c5ndqOhjNVcqKToBywd/uryFEXFYyqAzmkN4zD89lLvuixiSaBW6', 'Administrator', NULL, 'admin', 'active', '2026-02-26 02:57:33', '2026-02-02 13:46:08', '2026-02-26 02:57:33', NULL),
('2', 'gabo', 'gabo@gmail.com', '$2y$12$PxSwmYoTyHsSF24L9VdgkOCBS5acuvJVabyEqp5BO2KdZMur.fJ5S', 'Gabo Santos', NULL, 'staff', 'active', NULL, '2026-02-16 07:27:34', '2026-02-20 02:27:35', '2026-02-20 02:27:35'),
('3', 'gaboo', 'gabo1@gmail.com', '$2y$12$usrQclB3.TcH0IGI9dzWqu1QVqvGdIf8UD/GB2Mxv2Joz6iUMA4Me', 'Gabo Santos', NULL, 'staff', 'active', '2026-02-18 05:39:12', '2026-02-16 07:29:11', '2026-02-20 02:27:45', '2026-02-20 02:27:45'),
('4', 'renz', 'renz@gmail.com', '$2y$12$ZOcpZdD/EQ7zpc3gJ.a9BOgwJ6Rz.JjuoTKd11Ykhx3r6Dce/eCH2', 'Renz Calapao', NULL, 'staff', 'active', '2026-02-18 02:00:16', '2026-02-18 01:59:48', '2026-02-18 02:00:16', NULL),
('5', 'teststaff_1771397659', 'teststaff_1771397659@example.com', '$2y$12$Pcq3XSVr37EzbATo9ldSWeDun53qBw/Yi6vaZnnSxRPvQihiCE.7S', 'Test Staff', NULL, 'staff', 'active', NULL, '2026-02-18 06:54:20', '2026-02-20 02:27:54', '2026-02-20 02:27:54'),
('6', 'gekloi', 'baho@gmail.com', '$2y$12$q70VP7qa4cWtBWmaNHof5e296iiY.qTwhfIKRES8Mc./VuP3/tQWe', 'Gekloi Baho', NULL, 'staff', 'active', '2026-02-18 07:12:41', '2026-02-18 07:12:24', '2026-02-18 07:12:41', NULL);

-- Table structure for table `applicants`
DROP TABLE IF EXISTS `applicants`;
CREATE TABLE `applicants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `dob` date NOT NULL,
  `age` int(11) DEFAULT NULL,
  `sex` enum('Male','Female','Other') NOT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `educational_attainment` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `company_agency` varchar(100) DEFAULT NULL,
  `employment_status` enum('Employed','Self-employed','Not employed') DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `monthly_income` decimal(10,2) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email_address` varchar(100) DEFAULT NULL,
  `is_pantawid_beneficiary` tinyint(1) DEFAULT 0,
  `is_indigenous_person` tinyint(1) DEFAULT 0,
  `is_lgbtq` tinyint(1) DEFAULT 0,
  `classification_details` text DEFAULT NULL,
  `needs_problems` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `applicants`
INSERT INTO `applicants` VALUES 
('47', 'Renz', 'Redera', 'Calapao', '1976-07-14', NULL, 'Male', 'Dayap, Calauan, Laguna', 'Lambac, Pagsanjan, Laguna', 'Lambac', 'Post-Graduate', 'N/A', 'Subo Company', 'Not employed', 'Catholic', '10.00', '09374647292', 'renz@gmail.com', '0', '0', '0', 'Binugbog ng asawa', 'Pera', '2026-02-19 05:23:56', '2026-02-19 05:23:56', NULL),
('50', 'Jencel', 'Pogi', 'Sofer', '2002-05-19', NULL, 'Female', 'Brgy, Duhat, Sta, Cruz, Laguna', 'Calusiche, Pagsanjan, Laguna', 'Calusiche', 'College', 'Programmer', 'Dyan Langssss', 'Self-employed', 'Muslim', '999998.00', '09306942545', 'jencelsofer@gmail.com', '0', '0', '0', 'Nakakatamad', 'Pera', '2026-02-20 02:39:16', '2026-02-20 02:39:16', NULL),
('51', 'Gelo', 'Rebong', 'Redera', '1992-12-17', NULL, 'Female', 'Dayap, Calauan, Laguna', 'Magdapio, Pagsanjan, Laguna', 'Magdapio', 'Elementary', 'Tambay', 'Sinungaling Company', 'Self-employed', 'Buddism', '1444.00', '09349473874', 'gelo@gmail.com', '0', '0', '0', 'Mabaho', 'Hininga', '2026-02-20 02:50:22', '2026-02-20 02:50:22', NULL),
('52', 'Gabo', 'Arguidas', 'Redera', '1991-11-13', NULL, 'Female', 'dsffsdfs', 'fdsfssf', 'Anibong', 'High School', 'werwr', 'dfgfd', 'Employed', 'INC', '1.00', '53434334343', 'gabo@gmail.com', '0', '0', '0', 'sdfds', 'sfddsfs', '2026-02-20 06:02:16', '2026-02-20 06:02:16', NULL),
('53', 'Faith', 'Ferrera', 'Plata', '2003-11-12', NULL, 'Female', 'Bangkal, Los Banos, Laguna', 'Poblacion, Pagsanjan, Laguna', 'Poblacion Dos', 'College', 'Data Analyst', 'Mango Royal', 'Not employed', 'Born Again', '1000.00', '09437487987', 'faith@gmail.com', '0', '0', '0', 'Wala', 'Money Game', '2026-02-24 16:38:56', '2026-02-24 16:38:56', NULL),
('54', 'Dman', 'Gekloi', 'Redera', '1978-06-13', NULL, 'Male', 'Gatid, Santa Cruz, Laguna', 'Sampaloc, Pagsanjan, Laguna', 'Sampaloc', 'High School', 'Tambay', 'Tambay.com', 'Not employed', 'Catholic', '1.00', '03493493849', 'dman@gmail.com', '0', '0', '0', 'Mbaho', 'tumambay', '2026-02-26 01:35:34', '2026-02-26 01:35:34', NULL);

-- Table structure for table `application_documents`
DROP TABLE IF EXISTS `application_documents`;
CREATE TABLE `application_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_documents_application_id_foreign` (`application_id`),
  CONSTRAINT `application_documents_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `application_documents`
INSERT INTO `application_documents` VALUES 
('13', '46', 'Solo Parent Application Form', '/storage/documents/APP46_solo-parent-application-form_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-20 05:32:02'),
('14', '46', 'Brgy Cert of Solo Parent', '/storage/documents/APP46_brgy-cert-of-solo-parent_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:24:55'),
('15', '46', 'Brgy Cert of Children', '/storage/documents/APP46_brgy-cert-of-children_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:24:56'),
('16', '46', 'Marriage Contract (for married)', '/storage/documents/APP46_marriage-contract-for-married_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:01'),
('17', '46', '1x1 ID Picture (2pcs)', '/storage/documents/APP46_1x1-id-picture-2pcs_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:03'),
('18', '46', 'ITR (for working applicants)', '/storage/documents/APP46_itr-for-working-applicants_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:05'),
('19', '46', 'Sworn Statement (Affidavit of Solo Parent)', '/storage/documents/APP46_sworn-statement-affidavit-of-solo-parent_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:06'),
('20', '46', 'Brgy Cert of Applicant', '/storage/documents/APP46_brgy-cert-of-applicant_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:07'),
('21', '46', 'Birth Certificate (PSA) of the Child/ren', '/storage/documents/APP46_birth-certificate-psa-of-the-children_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:09'),
('22', '46', 'Death Cert (for widow)', '/storage/documents/APP46_death-cert-for-widow_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:10'),
('23', '46', 'Photo of Parent and Child/ren', '/storage/documents/APP46_photo-of-parent-and-children_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:14'),
('24', '46', 'Applicant\'s Narrative', '/storage/documents/APP46_applicants-narrative_1771478638.jpeg', 'Verified', NULL, '2026-02-19 05:23:58', '2026-02-19 05:25:15'),
('25', '49', 'Solo Parent Application Form', '/storage/documents/APP49_solo-parent-application-form_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:19'),
('26', '49', 'Brgy Cert of Solo Parent', '/storage/documents/APP49_brgy-cert-of-solo-parent_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:20'),
('27', '49', 'Brgy Cert of Children', '/storage/documents/APP49_brgy-cert-of-children_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:22'),
('28', '49', 'Marriage Contract (for married)', '/storage/documents/APP49_marriage-contract-for-married_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:23'),
('29', '49', '1x1 ID Picture (2pcs)', '/storage/documents/APP49_1x1-id-picture-2pcs_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:24'),
('30', '49', 'ITR (for working applicants)', '/storage/documents/APP49_itr-for-working-applicants_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:28'),
('31', '49', 'Sworn Statement (Affidavit of Solo Parent)', '/storage/documents/APP49_sworn-statement-affidavit-of-solo-parent_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:26'),
('32', '49', 'Brgy Cert of Applicant', '/storage/documents/APP49_brgy-cert-of-applicant_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:25'),
('33', '49', 'Birth Certificate (PSA) of the Child/ren', '/storage/documents/APP49_birth-certificate-psa-of-the-children_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:48'),
('34', '49', 'Death Cert (for widow)', '/storage/documents/APP49_death-cert-for-widow_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:40'),
('35', '49', 'Photo of Parent and Child/ren', '/storage/documents/APP49_photo-of-parent-and-children_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:39'),
('36', '49', 'Applicant\'s Narrative', '/storage/documents/APP49_applicants-narrative_1771555157.jpeg', 'Verified', NULL, '2026-02-20 02:39:17', '2026-02-20 05:48:41'),
('37', '51', 'Solo Parent Application Form', '/storage/documents/APP51_solo-parent-application-form_1771567338.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('38', '51', 'Brgy Cert of Solo Parent', '/storage/documents/APP51_brgy-cert-of-solo-parent_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('39', '51', 'Brgy Cert of Children', '/storage/documents/APP51_brgy-cert-of-children_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('40', '51', 'Marriage Contract (for married)', '/storage/documents/APP51_marriage-contract-for-married_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('41', '51', '1x1 ID Picture (2pcs)', '/storage/documents/APP51_1x1-id-picture-2pcs_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('42', '51', 'ITR (for working applicants)', '/storage/documents/APP51_itr-for-working-applicants_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('43', '51', 'Applicant\'s Narrative', '/storage/documents/APP51_applicants-narrative_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('44', '51', 'Photo of Parent and Child/ren', '/storage/documents/APP51_photo-of-parent-and-children_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('45', '51', 'Death Cert (for widow)', '/storage/documents/APP51_death-cert-for-widow_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('46', '51', 'Birth Certificate (PSA) of the Child/ren', '/storage/documents/APP51_birth-certificate-psa-of-the-children_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('47', '51', 'Sworn Statement (Affidavit of Solo Parent)', '/storage/documents/APP51_sworn-statement-affidavit-of-solo-parent_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('48', '51', 'Brgy Cert of Applicant', '/storage/documents/APP51_brgy-cert-of-applicant_1771567339.pdf', 'Pending', NULL, '2026-02-20 06:02:19', '2026-02-20 06:02:19'),
('49', '52', 'Solo Parent Application Form', '/storage/documents/APP52_solo-parent-application-form_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('50', '52', 'Brgy Cert of Solo Parent', '/storage/documents/APP52_brgy-cert-of-solo-parent_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('51', '52', 'Brgy Cert of Children', '/storage/documents/APP52_brgy-cert-of-children_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('52', '52', 'Marriage Contract (for married)', '/storage/documents/APP52_marriage-contract-for-married_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('53', '52', '1x1 ID Picture (2pcs)', '/storage/documents/APP52_1x1-id-picture-2pcs_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('54', '52', 'ITR (for working applicants)', '/storage/documents/APP52_itr-for-working-applicants_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('55', '52', 'Applicant\'s Narrative', '/storage/documents/APP52_applicants-narrative_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('56', '52', 'Photo of Parent and Child/ren', '/storage/documents/APP52_photo-of-parent-and-children_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('57', '52', 'Death Cert (for widow)', '/storage/documents/APP52_death-cert-for-widow_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('58', '52', 'Birth Certificate (PSA) of the Child/ren', '/storage/documents/APP52_birth-certificate-psa-of-the-children_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:57', '2026-02-24 16:38:57'),
('59', '52', 'Brgy Cert of Applicant', '/storage/documents/APP52_brgy-cert-of-applicant_1771951137.pdf', 'Pending', NULL, '2026-02-24 16:38:58', '2026-02-24 16:38:58'),
('60', '52', 'Sworn Statement (Affidavit of Solo Parent)', '/storage/documents/APP52_sworn-statement-affidavit-of-solo-parent_1771951138.pdf', 'Pending', NULL, '2026-02-24 16:38:58', '2026-02-24 16:38:58'),
('61', '53', 'Solo Parent Application Form', '/storage/documents/APP53_solo-parent-application-form_1772069738.pdf', 'Pending', NULL, '2026-02-26 01:35:38', '2026-02-26 01:35:38'),
('62', '53', 'Brgy Cert of Solo Parent', '/storage/documents/APP53_brgy-cert-of-solo-parent_1772069738.pdf', 'Pending', NULL, '2026-02-26 01:35:38', '2026-02-26 01:35:38'),
('63', '53', 'Brgy Cert of Children', '/storage/documents/APP53_brgy-cert-of-children_1772069738.pdf', 'Pending', NULL, '2026-02-26 01:35:38', '2026-02-26 01:35:38'),
('64', '53', 'Marriage Contract (for married)', '/storage/documents/APP53_marriage-contract-for-married_1772069738.pdf', 'Pending', NULL, '2026-02-26 01:35:38', '2026-02-26 01:35:38'),
('65', '53', '1x1 ID Picture (2pcs)', '/storage/documents/APP53_1x1-id-picture-2pcs_1772069738.pdf', 'Pending', NULL, '2026-02-26 01:35:38', '2026-02-26 01:35:38'),
('66', '53', 'ITR (for working applicants)', '/storage/documents/APP53_itr-for-working-applicants_1772069738.pdf', 'Pending', NULL, '2026-02-26 01:35:38', '2026-02-26 01:35:38'),
('67', '53', 'Sworn Statement (Affidavit of Solo Parent)', '/storage/documents/APP53_sworn-statement-affidavit-of-solo-parent_1772069739.pdf', 'Pending', NULL, '2026-02-26 01:35:39', '2026-02-26 01:35:39'),
('68', '53', 'Brgy Cert of Applicant', '/storage/documents/APP53_brgy-cert-of-applicant_1772069739.pdf', 'Pending', NULL, '2026-02-26 01:35:39', '2026-02-26 01:35:39'),
('69', '53', 'Birth Certificate (PSA) of the Child/ren', '/storage/documents/APP53_birth-certificate-psa-of-the-children_1772069739.pdf', 'Pending', NULL, '2026-02-26 01:35:39', '2026-02-26 01:35:39'),
('70', '53', 'Death Cert (for widow)', '/storage/documents/APP53_death-cert-for-widow_1772069739.pdf', 'Pending', NULL, '2026-02-26 01:35:39', '2026-02-26 01:35:39'),
('71', '53', 'Photo of Parent and Child/ren', '/storage/documents/APP53_photo-of-parent-and-children_1772069739.pdf', 'Pending', NULL, '2026-02-26 01:35:39', '2026-02-26 01:35:39'),
('72', '53', 'Applicant\'s Narrative', '/storage/documents/APP53_applicants-narrative_1772069739.pdf', 'Pending', NULL, '2026-02-26 01:35:39', '2026-02-26 01:35:39');

-- Table structure for table `application_status_logs`
DROP TABLE IF EXISTS `application_status_logs`;
CREATE TABLE `application_status_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `status_from` varchar(20) DEFAULT NULL,
  `status_to` varchar(20) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `application_status_logs_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `application_status_logs`
INSERT INTO `application_status_logs` VALUES 
('32', '46', 'Pending', 'Approved', '1', '2026-02-19 13:25:45', NULL),
('33', '50', 'Pending', 'Approved', '1', '2026-02-20 10:50:22', NULL),
('34', '49', 'Disapproved', 'Disapproved', '1', '2026-02-20 10:52:40', NULL),
('35', '49', 'Disapproved', 'Approved', '1', '2026-02-20 10:56:39', NULL),
('36', '49', 'Approved', 'Approved', '1', '2026-02-20 13:48:54', NULL),
('37', '51', 'Disapproved', 'Disapproved', '1', '2026-02-20 14:04:21', NULL),
('38', '52', 'Pending', 'Approved', '1', '2026-02-25 00:44:57', NULL),
('39', '53', 'Pending', 'Approved', '1', '2026-02-26 09:37:17', NULL),
('40', '53', 'Approved', 'Approved', '1', '2026-02-26 09:51:29', NULL);

-- Table structure for table `applications`
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `applicant_id` int(11) NOT NULL,
  `case_number` varchar(50) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Approved','Disapproved') DEFAULT 'Pending',
  `category_code` varchar(5) DEFAULT NULL,
  `benefit_code` char(1) DEFAULT NULL,
  `date_applied` date DEFAULT curdate(),
  `date_issued` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_number` (`case_number`),
  UNIQUE KEY `id_number` (`id_number`),
  KEY `applicant_id` (`applicant_id`),
  KEY `category_code` (`category_code`),
  KEY `benefit_code` (`benefit_code`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`category_code`) REFERENCES `solo_parent_categories` (`code`),
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`benefit_code`) REFERENCES `benefit_qualifications` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `applications`
INSERT INTO `applications` VALUES 
('46', '47', 'PSG-2026-00001', 'PSG-SP-2026-00046', 'Approved', 'a4', 'A', '2026-02-19', '2026-02-19', '2027-02-19', NULL, '29', '2026-02-19 05:23:56', '2026-02-19 05:25:44', NULL),
('49', '50', 'PSG-2026-00002', 'PSG-SP-2026-00049', 'Approved', 'a5', 'B', '2026-02-20', '2026-02-20', '2027-02-20', 'panget', '1', '2026-02-20 02:39:16', '2026-02-20 02:56:39', NULL),
('50', '51', 'PSG-2026-00003', 'PSG-SP-2026-00051', 'Approved', 'a3', 'B', '2026-02-20', '2026-02-07', '2027-02-07', 'Encoded as Existing Record', '1', '2026-02-20 02:50:22', '2026-02-20 02:50:22', NULL),
('51', '52', 'PSG-2026-00004', NULL, 'Disapproved', NULL, NULL, '2026-02-20', NULL, NULL, 'sdadsa', '1', '2026-02-20 06:02:16', '2026-02-20 06:04:21', NULL),
('52', '53', 'PSG-2026-00005', 'PSG-SP-2026-00052', 'Approved', 'f', 'B', '2026-02-24', '2026-02-24', '2027-02-24', NULL, '30', '2026-02-24 16:38:56', '2026-02-24 16:44:57', NULL),
('53', '54', 'PSG-2026-00006', 'PSG-SP-2026-00053', 'Approved', 'a7', 'A', '2026-02-26', '2026-02-26', '2027-02-26', NULL, '1', '2026-02-26 01:35:34', '2026-02-26 01:37:17', NULL);

-- Table structure for table `benefit_qualifications`
DROP TABLE IF EXISTS `benefit_qualifications`;
CREATE TABLE `benefit_qualifications` (
  `code` char(1) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `benefit_qualifications`
INSERT INTO `benefit_qualifications` VALUES 
('A', 'Subsidy, PhilHealth, Prioritization in housing'),
('B', '10% Discount and VAT Exemption on selected items');

-- Table structure for table `emergency_contacts`
DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE `emergency_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `applicant_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applicant_id` (`applicant_id`),
  CONSTRAINT `emergency_contacts_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `emergency_contacts`
INSERT INTO `emergency_contacts` VALUES 
('34', '47', 'Gelo Calapao', 'Gay Bestfriend', 'Dayap, Calauan', '09383848374', '2026-02-19 05:23:56', '2026-02-19 05:23:56', NULL),
('37', '50', 'Gelo Redera', 'Brother In-law', 'Dayap, Calauan, Laguna', '09374647292', '2026-02-20 02:39:16', '2026-02-20 02:39:16', NULL),
('38', '51', 'Renz Redera', 'Mother', 'Duhat, Laguna', '09645172634', '2026-02-20 02:50:22', '2026-02-20 02:50:22', NULL),
('39', '52', 'sdfds', 'Mother', 'sdfsfds', '34343434343', '2026-02-20 06:02:16', '2026-02-20 06:02:16', NULL),
('40', '53', 'Jem Plata', 'Cousin', 'Bangkal, Laguna', '04894848484', '2026-02-24 16:38:56', '2026-02-24 16:38:56', NULL),
('41', '54', 'Rolan Redera', 'Step-Brother', 'Magdalena, Laguna', '09374647292', '2026-02-26 01:35:34', '2026-02-26 01:51:29', '2026-02-26 01:51:29'),
('42', '54', 'Rolan Redera', 'Step-Brother', 'Magdalena, Laguna', '09374647292', '2026-02-26 01:51:29', '2026-02-26 01:51:29', NULL);

-- Table structure for table `family_members`
DROP TABLE IF EXISTS `family_members`;
CREATE TABLE `family_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `applicant_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `educational_attainment` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `monthly_income` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applicant_id` (`applicant_id`),
  CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `family_members`
INSERT INTO `family_members` VALUES 
('56', '47', 'Gekloi Baho', 'Son', '10', '2015-06-16', NULL, NULL, 'N/A', '0.00', '2026-02-19 05:23:56', '2026-02-19 05:23:56', NULL),
('59', '50', 'Steph Curry', 'Son', '9', '2016-12-01', NULL, NULL, NULL, '0.00', '2026-02-20 02:39:16', '2026-02-20 02:39:16', NULL),
('60', '51', 'Dman Redera', 'Daugther', '7', '2018-11-21', NULL, NULL, NULL, '0.00', '2026-02-20 02:50:22', '2026-02-20 02:50:22', NULL),
('61', '52', 'effdfd', 'Son', '4', '2022-02-08', NULL, NULL, NULL, '0.00', '2026-02-20 06:02:16', '2026-02-20 06:02:16', NULL),
('62', '53', 'Jencel Sofer', 'Son', '10', '2015-07-09', NULL, NULL, NULL, '0.00', '2026-02-24 16:38:56', '2026-02-24 16:38:56', NULL),
('63', '54', 'Cel Pogi', 'Son', '14', '2012-01-31', NULL, NULL, NULL, '0.00', '2026-02-26 01:35:34', '2026-02-26 01:51:28', '2026-02-26 01:51:28'),
('64', '54', 'Gabo Redera', 'Daugther', '16', '2009-06-09', NULL, 'High School', NULL, '0.00', '2026-02-26 01:35:34', '2026-02-26 01:51:28', '2026-02-26 01:51:28'),
('65', '54', 'Rolan Redera', 'Son', '8', '2017-10-24', NULL, NULL, NULL, '0.00', '2026-02-26 01:35:34', '2026-02-26 01:51:28', '2026-02-26 01:51:28'),
('66', '54', 'Cel Pogi', 'Son', '14', '2012-01-31', NULL, NULL, NULL, '0.00', '2026-02-26 01:51:28', '2026-02-26 01:51:28', NULL),
('67', '54', 'Gabo Redera', 'Daugther', '16', '2009-06-09', NULL, 'High School', NULL, '0.00', '2026-02-26 01:51:28', '2026-02-26 01:51:28', NULL),
('68', '54', 'Rolan Redera', 'Son', '8', '2017-10-24', NULL, NULL, NULL, '0.00', '2026-02-26 01:51:28', '2026-02-26 01:51:28', NULL),
('69', '54', 'Kate Macasaet', 'Daughter', '7', '2018-10-16', NULL, NULL, NULL, '0.00', '2026-02-26 01:51:28', '2026-02-26 01:51:28', NULL),
('70', '54', 'Jencel Sofer', 'Son', '5', '2020-10-20', NULL, NULL, NULL, '0.00', '2026-02-26 01:51:29', '2026-02-26 01:51:29', NULL);

-- Table structure for table `migrations`
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `migrations`
INSERT INTO `migrations` VALUES 
('1', '2024_01_01_000001_create_users_table', '1'),
('2', '2024_01_01_000002_create_applicants_table', '1'),
('3', '2024_01_01_000003_create_applications_table', '1'),
('4', '2024_01_01_000004_create_family_members_table', '1'),
('5', '2024_01_01_000005_create_emergency_contacts_table', '1'),
('6', '2024_01_01_000006_create_application_status_logs_table', '1'),
('7', '2026_02_04_000001_add_updated_at_to_users_table', '2'),
('8', '2019_12_14_000001_create_personal_access_tokens_table', '3'),
('10', '2026_02_04_082233_add_expiration_date_to_applications_table', '4'),
('11', '2026_02_05_043845_create_application_documents_table', '5'),
('13', '2026_02_12_123538_add_avatar_to_users_table', '7'),
('14', '2026_02_16_051719_add_status_to_users_table', '8'),
('15', '2026_02_11_042248_create_system_logs_table', '9'),
('16', '2026_02_18_025712_add_status_to_application_documents_table', '10'),
('17', '2026_02_18_061020_add_user_type_to_system_logs_table', '11'),
('18', '2026_02_18_061109_add_user_agent_to_system_logs_table', '12'),
('19', '2026_02_18_000002_create_admin_staff_table', '13'),
('20', '2026_02_18_000001_create_admin_staff_table', '14'),
('21', '2026_02_18_000003_migrate_users_and_rename', '15'),
('22', '2026_02_18_075049_drop_changed_by_foreign_key_from_application_status_logs_table', '16'),
('23', '2026_02_20_023645_drop_created_by_foreign_key_from_applications_table', '17');

-- Table structure for table `personal_access_tokens`
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `personal_access_tokens`
INSERT INTO `personal_access_tokens` VALUES 
('62', 'App\\Models\\User', '1', 'auth_token', 'e17446cc3698611538dab2a91380cd685feff657681f0b92f92492b6a0676ad4', '[\"*\"]', NULL, NULL, '2026-02-18 05:28:56', '2026-02-18 05:28:56'),
('63', 'App\\Models\\User', '1', 'auth_token', '7c4fc0d2849ce2dc53fa0ea329e4d350be24407ae51a205146bfc9dda10edbd6', '[\"*\"]', NULL, NULL, '2026-02-18 05:30:14', '2026-02-18 05:30:14'),
('64', 'App\\Models\\User', '1', 'auth_token', 'e26ba32231788da4ca56b5ba0f888405189ba36eb897ad461e5bf24143f91590', '[\"*\"]', NULL, NULL, '2026-02-18 05:32:13', '2026-02-18 05:32:13'),
('66', 'App\\Models\\User', '1', 'auth_token', '6143ff487c5b45b177ba75b4f325ce23eaf9f9db2f236e173d3e2e22c0315954', '[\"*\"]', NULL, NULL, '2026-02-18 05:37:39', '2026-02-18 05:37:39'),
('71', 'App\\Models\\AdminStaff', '1', 'auth_token', '49a6b87a85e3d5c29ebf0df3d4ada0c0d54253b7976b112753668b681431f8c6', '[\"*\"]', '2026-02-18 06:54:19', NULL, '2026-02-18 06:54:19', '2026-02-18 06:54:19'),
('72', 'App\\Models\\User', '22', 'auth_token', 'dcc6fe99e3ba77520eaa8081348f09588afbc270f1b5a3ff37230869aac84620', '[\"*\"]', NULL, NULL, '2026-02-18 06:54:37', '2026-02-18 06:54:37'),
('73', 'App\\Models\\User', '23', 'auth_token', 'bc83c147a67471864b713cade08e6aaf4c827b3e489b2e62f64c9d52db4cc8b8', '[\"*\"]', NULL, NULL, '2026-02-18 07:03:01', '2026-02-18 07:03:01'),
('74', 'App\\Models\\User', '23', 'auth_token', 'aada273de8a64237e98e4b5087a810317c3d403f276f4e0e7253a27c859d1ba5', '[\"*\"]', NULL, NULL, '2026-02-18 07:03:02', '2026-02-18 07:03:02'),
('75', 'App\\Models\\User', '24', 'auth_token', '6dd71f3a3d952aa3a46df82b102dd7ce48626ed46c2899b2be7427bca1bf1e8d', '[\"*\"]', NULL, NULL, '2026-02-18 07:09:13', '2026-02-18 07:09:13'),
('76', 'App\\Models\\User', '25', 'auth_token', '12b5312a03416ccbe485b768d62e4385518a5fc61ef3257672d4330b42dd8a73', '[\"*\"]', NULL, NULL, '2026-02-18 07:10:37', '2026-02-18 07:10:37'),
('81', 'App\\Models\\User', '27', 'test-token', '52150e600a6c304c42115cbe4d96c9d8b2b5fb6e8210529b117d80415af22605', '[\"*\"]', '2026-02-18 07:33:39', NULL, '2026-02-18 07:33:39', '2026-02-18 07:33:39'),
('82', 'App\\Models\\User', '28', 'auth_token', 'bf85ea7a3da110e3fe226067fa7abb52b36f0fa6a68deb6fe30668094a5811b4', '[\"*\"]', '2026-02-18 07:41:48', NULL, '2026-02-18 07:41:47', '2026-02-18 07:41:48'),
('85', 'App\\Models\\User', '29', 'auth_token', '3bde537d91ad0aede215fa36850571da58dd61342efacc16930a69e57cb58323', '[\"*\"]', NULL, NULL, '2026-02-19 05:18:52', '2026-02-19 05:18:52'),
('107', 'App\\Models\\User', '30', 'auth_token', '247da4e0c1a2591da6758763448f563cea409799deabd81e664ef34d74745f5a', '[\"*\"]', NULL, NULL, '2026-02-24 16:24:51', '2026-02-24 16:24:51'),
('122', 'App\\Models\\AdminStaff', '1', 'auth_token', '6f202939df03b230ab16d16b341e0f7b2544685059c19369fff59c83d89ee2f9', '[\"*\"]', '2026-02-26 06:28:41', NULL, '2026-02-26 02:57:33', '2026-02-26 06:28:41');

-- Table structure for table `solo_parent_categories`
DROP TABLE IF EXISTS `solo_parent_categories`;
CREATE TABLE `solo_parent_categories` (
  `code` varchar(5) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `solo_parent_categories`
INSERT INTO `solo_parent_categories` VALUES 
('a1', 'Birth of a Child as a consequence of rape'),
('a2', 'Widow/widower'),
('a3', 'Spouse of person deprived of liberty (PDL)'),
('a4', 'Spouse of person with disability (PWD)'),
('a5', 'Due to de facto separation'),
('a6', 'Due to nullity of marriage'),
('a7', 'Abandoned'),
('b', 'Spouse of the OFW / Relative of the OFW'),
('c', 'Unmarried mother/father who keeps and rears his/her child'),
('d', 'Legal guardian, adoptive or foster parent'),
('e', 'Any relative within the fourth (4th) degree of consanguinity or affinity'),
('f', 'Pregnant woman who provides sole parental care and support');

-- Table structure for table `soloparent_accounts`
DROP TABLE IF EXISTS `soloparent_accounts`;
CREATE TABLE `soloparent_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','staff','user') NOT NULL DEFAULT 'user',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `soloparent_accounts`
INSERT INTO `soloparent_accounts` VALUES 
('29', 'renz@gmail.com', 'renz@gmail.com', '$2y$12$rcgCxQd2vj9V/NVB40F4COHSbBlNB2Llo8OHeTf5w6x6m5ZTS36Qm', 'Renz Calapaoo', NULL, 'user', 'active', '2026-02-20 06:30:12', '2026-02-19 05:18:52', '2026-02-20 06:30:12', NULL),
('30', 'faith@gmail.com', 'faith@gmail.com', '$2y$12$Z5XOr5LQSXVq9Xx6lCCTDunmfgxiIPBoN2MO6PXtR7nLlcUTQaPi6', 'Faith Plata', NULL, 'user', 'active', '2026-02-26 02:40:36', '2026-02-24 16:24:51', '2026-02-26 02:40:36', NULL);

-- Table structure for table `system_logs`
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `user_type` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=263 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `system_logs`
INSERT INTO `system_logs` VALUES 
('226', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 16:24:09', '2026-02-24 16:24:09'),
('227', '1', NULL, 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-24 16:24:22', '2026-02-24 16:24:22'),
('228', '30', NULL, 'User Registered', 'User faith@gmail.com registered successfully.', '127.0.0.1', NULL, '2026-02-24 16:24:51', '2026-02-24 16:24:51'),
('229', '30', NULL, 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-24 16:25:02', '2026-02-24 16:25:02'),
('230', '30', NULL, 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-24 16:25:24', '2026-02-24 16:25:24'),
('231', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 16:25:32', '2026-02-24 16:25:32'),
('232', '1', 'user', 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-24 16:34:02', '2026-02-24 16:34:02'),
('233', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-24 16:34:11', '2026-02-24 16:34:11'),
('234', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-24 16:34:18', '2026-02-24 16:34:18'),
('235', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 16:34:25', '2026-02-24 16:34:25'),
('236', '1', 'user', 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-24 16:34:33', '2026-02-24 16:34:33'),
('237', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-24 16:34:43', '2026-02-24 16:34:43'),
('238', '30', 'user', 'Application Created', 'Registered new applicant: Faith Plata', '127.0.0.1', NULL, '2026-02-24 16:38:56', '2026-02-24 16:38:56'),
('239', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-24 16:39:05', '2026-02-24 16:39:05'),
('240', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 16:39:12', '2026-02-24 16:39:12'),
('241', '1', 'user', 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-24 16:41:56', '2026-02-24 16:41:56'),
('242', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-24 16:42:03', '2026-02-24 16:42:03'),
('243', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-24 16:42:11', '2026-02-24 16:42:11'),
('244', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 16:42:22', '2026-02-24 16:42:22'),
('245', '1', 'admin_staff', 'Application Approved', 'Approved request for Faith Plata', '127.0.0.1', NULL, '2026-02-24 16:44:57', '2026-02-24 16:44:57'),
('246', '1', 'user', 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-24 16:45:54', '2026-02-24 16:45:54'),
('247', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-24 16:46:03', '2026-02-24 16:46:03'),
('248', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-24 16:46:38', '2026-02-24 16:46:38'),
('249', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 01:29:52', '2026-02-26 01:29:52'),
('250', '1', 'admin_staff', 'Application Created', 'Registered new applicant: Dman Redera', '127.0.0.1', NULL, '2026-02-26 01:35:34', '2026-02-26 01:35:34'),
('251', '1', 'admin_staff', 'Application Approved', 'Approved request for Dman Redera', '127.0.0.1', NULL, '2026-02-26 01:37:17', '2026-02-26 01:37:17'),
('252', '1', 'admin_staff', 'Application Updated', 'Updated application for: Dman Redera', '127.0.0.1', NULL, '2026-02-26 01:51:29', '2026-02-26 01:51:29'),
('253', '1', 'user', 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-26 02:23:59', '2026-02-26 02:23:59'),
('254', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-26 02:24:15', '2026-02-26 02:24:15'),
('255', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-26 02:37:07', '2026-02-26 02:37:07'),
('256', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 02:37:15', '2026-02-26 02:37:15'),
('257', '1', 'user', 'User Logged Out', 'User admin logged out.', '127.0.0.1', NULL, '2026-02-26 02:38:19', '2026-02-26 02:38:19'),
('258', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-26 02:38:36', '2026-02-26 02:38:36'),
('259', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-26 02:38:48', '2026-02-26 02:38:48'),
('260', '30', 'user', 'User Logged In', 'User faith@gmail.com logged in.', '127.0.0.1', NULL, '2026-02-26 02:40:36', '2026-02-26 02:40:36'),
('261', '30', 'user', 'User Logged Out', 'User faith@gmail.com logged out.', '127.0.0.1', NULL, '2026-02-26 02:51:57', '2026-02-26 02:51:57'),
('262', '1', 'admin_staff', 'admin_login', 'Admin/Staff login successful', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-26 02:57:33', '2026-02-26 02:57:33');

SET FOREIGN_KEY_CHECKS=1;
