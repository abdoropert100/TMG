-- قاعدة بيانات نظام إدارة مصلحة الري
-- وزارة الموارد المائية والري - جمهورية مصر العربية

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS irrigation_management_system 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE irrigation_management_system;

-- جدول الإدارات
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_employee_id VARCHAR(36),
    employee_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_departments_name (name),
    INDEX idx_departments_head (head_employee_id)
);

-- جدول الأقسام
CREATE TABLE divisions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id VARCHAR(36) NOT NULL,
    head_employee_id VARCHAR(36),
    employee_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_divisions_name (name),
    INDEX idx_divisions_department (department_id),
    INDEX idx_divisions_head (head_employee_id)
);

-- جدول الموظفين
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    position VARCHAR(255),
    points INT DEFAULT 0,
    status ENUM('نشط', 'معطل', 'إجازة') DEFAULT 'نشط',
    permissions JSON,
    avatar_url VARCHAR(500),
    hire_date DATE,
    birth_date DATE,
    national_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    INDEX idx_employees_name (name),
    INDEX idx_employees_number (employee_number),
    INDEX idx_employees_email (email),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_division (division_id),
    INDEX idx_employees_status (status),
    INDEX idx_employees_points (points)
);

-- جدول المهام
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority ENUM('منخفض', 'متوسط', 'عالي', 'عاجل') DEFAULT 'متوسط',
    status ENUM('جديدة', 'قيد التنفيذ', 'مكتملة', 'متأخرة', 'ملغية') DEFAULT 'جديدة',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    start_date DATE,
    end_date DATE,
    actual_completion_date DATE,
    points INT DEFAULT 0,
    created_by VARCHAR(36) NOT NULL,
    assigned_to JSON, -- مصفوفة من معرفات الموظفين
    completed_by JSON, -- مصفوفة من معرفات الموظفين المنجزين
    attachments JSON, -- مصفوفة من المرفقات
    notes TEXT,
    completion_percentage INT DEFAULT 0,
    estimated_hours INT,
    actual_hours INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_tasks_title (title),
    INDEX idx_tasks_priority (priority),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_department (department_id),
    INDEX idx_tasks_division (division_id),
    INDEX idx_tasks_created_by (created_by),
    INDEX idx_tasks_dates (start_date, end_date),
    INDEX idx_tasks_completion (completion_percentage)
);

-- جدول المراسلات الواردة
CREATE TABLE correspondence_incoming (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    received_via ENUM('يدوي', 'إيميل', 'بوابة', 'فاكس', 'بريد') DEFAULT 'يدوي',
    sender_name VARCHAR(255) NOT NULL,
    sender_organization VARCHAR(255),
    sender_type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    sender_contact JSON, -- بيانات الاتصال
    subject VARCHAR(500) NOT NULL,
    body_summary TEXT,
    confidentiality ENUM('عادي', 'سري', 'سري جداً') DEFAULT 'عادي',
    urgency ENUM('عادي', 'عاجل', 'فوري') DEFAULT 'عادي',
    status ENUM('مسجل', 'قيد المراجعة', 'محال', 'مغلق', 'مؤرشف') DEFAULT 'مسجل',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    assigned_to VARCHAR(36),
    due_date DATE,
    response_required BOOLEAN DEFAULT FALSE,
    response_date DATE,
    linked_task_id VARCHAR(36),
    attachments JSON,
    tags JSON,
    repeated_flag BOOLEAN DEFAULT FALSE,
    notes TEXT,
    routing_history JSON, -- تاريخ التحويل
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_incoming_number (number),
    INDEX idx_incoming_date (date),
    INDEX idx_incoming_sender (sender_name),
    INDEX idx_incoming_subject (subject),
    INDEX idx_incoming_confidentiality (confidentiality),
    INDEX idx_incoming_urgency (urgency),
    INDEX idx_incoming_status (status),
    INDEX idx_incoming_department (department_id),
    INDEX idx_incoming_division (division_id),
    INDEX idx_incoming_assigned (assigned_to),
    INDEX idx_incoming_due_date (due_date)
);

-- جدول المراسلات الصادرة
CREATE TABLE correspondence_outgoing (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_organization VARCHAR(255),
    recipient_type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    recipient_contact JSON,
    subject VARCHAR(500) NOT NULL,
    body_summary TEXT,
    confidentiality ENUM('عادي', 'سري', 'سري جداً') DEFAULT 'عادي',
    urgency ENUM('عادي', 'عاجل', 'فوري') DEFAULT 'عادي',
    status ENUM('مسودة', 'قيد المراجعة', 'بانتظار التوقيع', 'صادر', 'مؤرشف') DEFAULT 'مسودة',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    prepared_by VARCHAR(36),
    approved_by VARCHAR(36),
    signed_by VARCHAR(36),
    delivery_channel ENUM('بريد', 'مراسل', 'إيميل', 'بوابة', 'فاكس') DEFAULT 'بريد',
    delivery_status ENUM('لم يرسل', 'مرسل', 'مستلم', 'مرفوض') DEFAULT 'لم يرسل',
    delivery_date DATE,
    linked_task_id VARCHAR(36),
    linked_incoming_id VARCHAR(36), -- ربط بمراسلة واردة (رد)
    attachments JSON,
    tags JSON,
    repeated_flag BOOLEAN DEFAULT FALSE,
    notes TEXT,
    approval_history JSON, -- تاريخ الموافقات
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (prepared_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (signed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_incoming_id) REFERENCES correspondence_incoming(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_outgoing_number (number),
    INDEX idx_outgoing_date (date),
    INDEX idx_outgoing_recipient (recipient_name),
    INDEX idx_outgoing_subject (subject),
    INDEX idx_outgoing_confidentiality (confidentiality),
    INDEX idx_outgoing_urgency (urgency),
    INDEX idx_outgoing_status (status),
    INDEX idx_outgoing_department (department_id),
    INDEX idx_outgoing_division (division_id),
    INDEX idx_outgoing_delivery (delivery_status)
);

-- جدول المرفقات
CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY,
    module_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee') NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64), -- للتحقق من سلامة الملف
    uploaded_by VARCHAR(36) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_attachments_module (module_type, module_id),
    INDEX idx_attachments_uploader (uploaded_by)
);

-- جدول سجل النشاطات
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    module ENUM('employees', 'departments', 'divisions', 'tasks', 'correspondence_incoming', 'correspondence_outgoing', 'settings', 'system') NOT NULL,
    operation ENUM('create', 'update', 'delete', 'view', 'export', 'import', 'print', 'route', 'approve', 'assign') NOT NULL,
    entity_id VARCHAR(36),
    actor_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    description TEXT,
    before_data JSON,
    after_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_activity_module (module),
    INDEX idx_activity_operation (operation),
    INDEX idx_activity_entity (entity_id),
    INDEX idx_activity_actor (actor_id),
    INDEX idx_activity_timestamp (timestamp),
    INDEX idx_activity_success (success)
);

-- جدول نقاط الموظفين (تفصيلي)
CREATE TABLE employee_points (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    points_change INT NOT NULL, -- موجب أو سالب
    reason ENUM('task_completion', 'task_delay', 'task_assignment', 'correspondence_handling', 'performance_bonus', 'penalty', 'manual_adjustment') NOT NULL,
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing') NULL,
    related_entity_id VARCHAR(36) NULL,
    description TEXT,
    awarded_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_points_employee (employee_id),
    INDEX idx_points_reason (reason),
    INDEX idx_points_date (created_at),
    INDEX idx_points_entity (related_entity_type, related_entity_id)
);

-- جدول الإشعارات
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('task_assigned', 'task_overdue', 'correspondence_received', 'correspondence_urgent', 'system_alert', 'reminder') NOT NULL,
    target_user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee') NULL,
    related_entity_id VARCHAR(36) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (target_user_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (target_user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at),
    INDEX idx_notifications_entity (related_entity_type, related_entity_id)
);

-- جدول إعدادات النظام
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'file') DEFAULT 'string',
    category ENUM('general', 'appearance', 'notifications', 'security', 'backup', 'correspondence', 'tasks') DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- هل يمكن للمستخدمين العاديين رؤيتها
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_category (category),
    INDEX idx_settings_public (is_public)
);

-- جدول النسخ الاحتياطية
CREATE TABLE backups (
    id VARCHAR(36) PRIMARY KEY,
    backup_name VARCHAR(255) NOT NULL,
    backup_type ENUM('full', 'partial', 'data_only', 'structure_only') DEFAULT 'full',
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_hash VARCHAR(64),
    includes_attachments BOOLEAN DEFAULT TRUE,
    backup_status ENUM('in_progress', 'completed', 'failed') DEFAULT 'in_progress',
    error_message TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_backups_name (backup_name),
    INDEX idx_backups_type (backup_type),
    INDEX idx_backups_status (backup_status),
    INDEX idx_backups_created (created_at)
);

-- جدول قاموس الجهات (للمراسلات المتكررة)
CREATE TABLE correspondents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    contact_info JSON, -- بيانات الاتصال
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correspondents_name (name),
    INDEX idx_correspondents_organization (organization),
    INDEX idx_correspondents_type (type),
    INDEX idx_correspondents_active (is_active)
);

-- إضافة المفاتيح الخارجية المتبقية
ALTER TABLE departments ADD FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE divisions ADD FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;
