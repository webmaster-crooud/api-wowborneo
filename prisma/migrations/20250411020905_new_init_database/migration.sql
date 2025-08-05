-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(100) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `user_id` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NULL,
    `ip` TEXT NOT NULL,
    `user_agent` TEXT NOT NULL,
    `google_id` TEXT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'PENDING',
    `role_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `accounts_email_key`(`email`),
    UNIQUE INDEX `accounts_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verify` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_id` VARCHAR(100) NOT NULL,
    `token` VARCHAR(6) NOT NULL,
    `type` ENUM('REGISTER', 'FORGOT_PASSWORD', 'CHANGE_EMAIL') NOT NULL DEFAULT 'REGISTER',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    `expired_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `email_verify_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_refresh_token` (
    `email` VARCHAR(100) NOT NULL,
    `token` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    `expired_at` TIMESTAMP NOT NULL,
    `account_id` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `account_refresh_token_email_key`(`email`),
    UNIQUE INDEX `account_refresh_token_account_id_key`(`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL DEFAULT 'MEMBER',
    `description` TEXT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `river_cruise` (
    `id` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `sub_title` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `departure` VARCHAR(100) NULL,
    `duration` VARCHAR(100) NOT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVED',
    `introduction_title` VARCHAR(100) NULL,
    `introduction_text` TEXT NULL,
    `cta` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `river_cruise_slug_key`(`slug`),
    UNIQUE INDEX `river_cruise_title_key`(`title`),
    INDEX `river_cruise_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_type` ENUM('COVER', 'PHOTO') NOT NULL,
    `alt` VARCHAR(100) NULL,
    `filename` VARCHAR(255) NOT NULL,
    `source` VARCHAR(255) NOT NULL,
    `mimetype` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `entity_id` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,

    INDEX `images_entity_id_entity_type_source_filename_idx`(`entity_id`, `entity_type`, `source`, `filename`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `highlights` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `cruise_id` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    INDEX `highlights_cruise_id_idx`(`cruise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `include` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `cruise_id` VARCHAR(50) NOT NULL,

    INDEX `include_cruise_id_idx`(`cruise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `informations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `text` TEXT NULL,
    `cruise_id` VARCHAR(50) NOT NULL,

    INDEX `informations_cruise_id_idx`(`cruise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destinations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cruise_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `days` VARCHAR(100) NOT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVED',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    INDEX `destinations_cruise_id_idx`(`cruise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boats` (
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `optionText` TEXT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `boats_name_key`(`name`),
    UNIQUE INDEX `boats_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cabins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('TWIN', 'DOUBLE', 'SUPER') NOT NULL,
    `max_capacity` INTEGER NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `boat_id` VARCHAR(100) NOT NULL,

    INDEX `cabins_boat_id_idx`(`boat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `abouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `boat_id` VARCHAR(100) NOT NULL,

    INDEX `abouts_boat_id_idx`(`boat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `boat_id` VARCHAR(100) NOT NULL,

    INDEX `experiences_boat_id_idx`(`boat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facilities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(100) NULL,
    `icon` VARCHAR(100) NULL,
    `boat_id` VARCHAR(100) NOT NULL,

    INDEX `facilities_boat_id_idx`(`boat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `decks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(100) NULL,
    `boat_id` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `decks_boat_id_key`(`boat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `id` VARCHAR(191) NOT NULL,
    `cruise_id` VARCHAR(100) NOT NULL,
    `boat_id` VARCHAR(100) NOT NULL,
    `departure_at` DATE NOT NULL,
    `arrival_at` DATE NOT NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVED',
    `duration_day` INTEGER NOT NULL,
    `available_cabin` INTEGER NOT NULL DEFAULT 0,
    `total_capacity` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    INDEX `schedules_departure_at_idx`(`departure_at`),
    INDEX `schedules_cruise_id_idx`(`cruise_id`),
    INDEX `schedules_boat_id_idx`(`boat_id`),
    INDEX `schedules_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `cabin_id` INTEGER NOT NULL,
    `schedule_id` VARCHAR(100) NOT NULL,
    `tax_rate` DECIMAL(5, 2) NOT NULL,
    `tax_amount` DECIMAL(12, 2) NOT NULL,
    `amount_payment` DECIMAL(12, 2) NOT NULL,
    `amount_payment_idr` DECIMAL(12, 2) NOT NULL,
    `balance_payment` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `balance_payment_idr` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `sub_total_price` DECIMAL(12, 2) NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL,
    `finalPrice` DECIMAL(12, 2) NOT NULL,
    `booking_status` ENUM('PENDING', 'CONFIRMED', 'DOWNPAYMENT', 'CANCELLED', 'COMPLETED', 'CHECKIN', 'DONE') NOT NULL DEFAULT 'PENDING',
    `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_type` VARCHAR(100) NULL DEFAULT 'Full Payment',
    `total_adult` INTEGER NOT NULL DEFAULT 1,
    `total_children` INTEGER NOT NULL DEFAULT 0,
    `payment_method` VARCHAR(100) NULL DEFAULT 'DOKU',
    `reference_code` VARCHAR(50) NULL,
    `cruiseTitle` VARCHAR(100) NOT NULL,
    `boatName` VARCHAR(100) NOT NULL,
    `cabinName` VARCHAR(100) NOT NULL,
    `notes` TEXT NULL,
    `cancel_reason` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    `paid_at` TIMESTAMP NULL,
    `confirmed_at` TIMESTAMP NULL,
    `confirmed_by` VARCHAR(100) NULL,
    `cancelled_at` TIMESTAMP NULL,

    INDEX `bookings_id_email_idx`(`id`, `email`),
    INDEX `bookings_created_at_idx`(`created_at`),
    INDEX `bookings_payment_status_idx`(`payment_status`),
    INDEX `bookings_booking_status_idx`(`booking_status`),
    INDEX `bookings_schedule_id_idx`(`schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `amount_idr` DECIMAL(12, 2) NOT NULL,
    `payment_method` VARCHAR(100) NOT NULL,
    `reference_code` VARCHAR(50) NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    `processed_at` TIMESTAMP NULL,

    INDEX `transactions_booking_id_idx`(`booking_id`),
    INDEX `transactions_status_idx`(`status`),
    INDEX `transactions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED') NOT NULL DEFAULT 'PENDING',
    `refund_method` VARCHAR(100) NOT NULL,
    `reference_code` VARCHAR(50) NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    `processed_at` TIMESTAMP NULL,
    `processed_by` VARCHAR(100) NULL,

    INDEX `refunds_booking_id_idx`(`booking_id`),
    INDEX `refunds_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_addons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` VARCHAR(100) NOT NULL,
    `addon_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `total_price` DECIMAL(12, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    INDEX `booking_addons_booking_id_idx`(`booking_id`),
    INDEX `booking_addons_addon_id_idx`(`addon_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_addons` (
    `schedule_id` VARCHAR(100) NOT NULL,
    `addon_id` INTEGER NOT NULL,

    INDEX `schedule_addons_addon_id_idx`(`addon_id`),
    PRIMARY KEY (`schedule_id`, `addon_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `add_ons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `cover` VARCHAR(100) NULL,
    `status` ENUM('FAVOURITED', 'ACTIVED', 'PENDING', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVED',
    `price` DECIMAL(12, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    INDEX `add_ons_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_guests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` VARCHAR(100) NOT NULL,
    `guest_id` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    INDEX `booking_guests_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NULL,
    `phone` VARCHAR(100) NOT NULL,
    `identity_number` VARCHAR(100) NOT NULL,
    `type` ENUM('ADULT', 'CHILD') NOT NULL DEFAULT 'ADULT',
    `country` VARCHAR(100) NOT NULL,
    `document` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,

    UNIQUE INDEX `guests_email_key`(`email`),
    UNIQUE INDEX `guests_identity_number_key`(`identity_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_rates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_id` VARCHAR(100) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `table` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(100) NULL,
    `details` TEXT NULL,
    `status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `created_at` TIMESTAMP NOT NULL,

    INDEX `logs_account_id_idx`(`account_id`),
    INDEX `logs_entity_id_idx`(`entity_id`),
    INDEX `logs_table_idx`(`table`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verify` ADD CONSTRAINT `email_verify_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account_refresh_token` ADD CONSTRAINT `account_refresh_token_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `highlights` ADD CONSTRAINT `highlights_cruise_id_fkey` FOREIGN KEY (`cruise_id`) REFERENCES `river_cruise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `include` ADD CONSTRAINT `include_cruise_id_fkey` FOREIGN KEY (`cruise_id`) REFERENCES `river_cruise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `informations` ADD CONSTRAINT `informations_cruise_id_fkey` FOREIGN KEY (`cruise_id`) REFERENCES `river_cruise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `destinations` ADD CONSTRAINT `destinations_cruise_id_fkey` FOREIGN KEY (`cruise_id`) REFERENCES `river_cruise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cabins` ADD CONSTRAINT `cabins_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `boats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abouts` ADD CONSTRAINT `abouts_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `boats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experiences` ADD CONSTRAINT `experiences_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `boats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facilities` ADD CONSTRAINT `facilities_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `boats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `decks` ADD CONSTRAINT `decks_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `boats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_cruise_id_fkey` FOREIGN KEY (`cruise_id`) REFERENCES `river_cruise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_boat_id_fkey` FOREIGN KEY (`boat_id`) REFERENCES `boats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_email_fkey` FOREIGN KEY (`email`) REFERENCES `accounts`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_cabin_id_fkey` FOREIGN KEY (`cabin_id`) REFERENCES `cabins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_email_fkey` FOREIGN KEY (`email`) REFERENCES `accounts`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_addons` ADD CONSTRAINT `booking_addons_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_addons` ADD CONSTRAINT `booking_addons_addon_id_fkey` FOREIGN KEY (`addon_id`) REFERENCES `add_ons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_addons` ADD CONSTRAINT `schedule_addons_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_addons` ADD CONSTRAINT `schedule_addons_addon_id_fkey` FOREIGN KEY (`addon_id`) REFERENCES `add_ons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_guests` ADD CONSTRAINT `booking_guests_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_guests` ADD CONSTRAINT `booking_guests_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
