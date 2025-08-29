-- قاعدة بيانات نظام إدارة مصلحة الري الكاملة والشاملة
-- وزارة الموارد المائية والري - جمهورية مصر العربية
-- م. عبدالعال محمد - المطور الرئيسي - +201000731116 - abdelaalmiti@gmail.com

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS irrigation_management_system 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE irrigation_management_system;

-- ===================================
-- الجداول الأساسية للهيكل التنظيمي
-- ===================================

-- جدول الإدارات
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    head_employee_id VARCHAR(36),
    employee_count INT DEFAULT 0,
    budget DECIMAL(15,2) DEFAULT 0.00,
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    established_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_departments_name (name),
    INDEX idx_departments_head (head_employee_id),
    INDEX idx_departments_active (is_active)
);

-- جدول الأقسام
CREATE TABLE divisions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id VARCHAR(36) NOT NULL,
    head_employee_id VARCHAR(36),
    employee_count INT DEFAULT 0,
    budget DECIMAL(15,2) DEFAULT 0.00,
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_divisions_name (name),
    INDEX idx_divisions_department (department_id),
    INDEX idx_divisions_head (head_employee_id),
    INDEX idx_divisions_active (is_active)
);

-- ===================================
-- جداول إدارة الموظفين
-- ===================================

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
    rating DECIMAL(3,2) DEFAULT 0.00,
    status ENUM('نشط', 'معطل', 'إجازة') DEFAULT 'نشط',
    permissions JSON,
    avatar_url VARCHAR(500),
    hire_date DATE,
    birth_date DATE,
    national_id VARCHAR(20) UNIQUE,
    salary DECIMAL(10,2),
    emergency_contact JSON,
    qualifications JSON,
    certifications JSON,
    languages JSON,
    skills JSON,
    notes TEXT,
    last_login TIMESTAMP NULL,
    password_hash VARCHAR(255),
    password_changed_at TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
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
    INDEX idx_employees_points (points),
    INDEX idx_employees_rating (rating),
    INDEX idx_employees_active (is_active)
);

-- جدول نقاط الموظفين (تفصيلي)
CREATE TABLE employee_points (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    points_change INT NOT NULL,
    reason ENUM('task_completion', 'task_delay', 'task_assignment', 'correspondence_handling', 'performance_bonus', 'penalty', 'manual_adjustment', 'training_completion', 'innovation', 'teamwork') NOT NULL,
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'training', 'project') NULL,
    related_entity_id VARCHAR(36) NULL,
    description TEXT,
    awarded_by VARCHAR(36),
    approved_by VARCHAR(36),
    points_multiplier DECIMAL(3,2) DEFAULT 1.00,
    bonus_percentage DECIMAL(5,2) DEFAULT 0.00,
    effective_date DATE DEFAULT (CURRENT_DATE),
    expiry_date DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSON,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_points_employee (employee_id),
    INDEX idx_points_reason (reason),
    INDEX idx_points_date (created_at),
    INDEX idx_points_entity (related_entity_type, related_entity_id),
    INDEX idx_points_category (category)
);

-- ===================================
-- جداول إدارة المهام
-- ===================================

-- جدول المهام
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority ENUM('منخفض', 'متوسط', 'عالي', 'عاجل') DEFAULT 'متوسط',
    status ENUM('جديدة', 'قيد التنفيذ', 'مكتملة', 'متأخرة', 'ملغية', 'مؤجلة') DEFAULT 'جديدة',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_completion_date DATE,
    estimated_hours INT DEFAULT 0,
    actual_hours INT DEFAULT 0,
    points INT DEFAULT 0,
    completion_percentage INT DEFAULT 0,
    created_by VARCHAR(36) NOT NULL,
    assigned_to JSON,
    completed_by JSON,
    reviewed_by VARCHAR(36),
    approved_by VARCHAR(36),
    attachments JSON,
    tags JSON,
    dependencies JSON,
    linked_correspondence_id VARCHAR(36),
    notes TEXT,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00,
    is_milestone BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSON,
    recurring_count INT DEFAULT 0,
    original_task_id VARCHAR(36),
    template_id VARCHAR(36),
    reminder_dates JSON,
    budget DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    transfer_history JSON,
    points_distributed BOOLEAN DEFAULT FALSE,
    distribution_history JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (original_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    
    INDEX idx_tasks_title (title),
    INDEX idx_tasks_priority (priority),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_department (department_id),
    INDEX idx_tasks_division (division_id),
    INDEX idx_tasks_created_by (created_by),
    INDEX idx_tasks_dates (start_date, end_date),
    INDEX idx_tasks_completion (completion_percentage),
    INDEX idx_tasks_points (points),
    INDEX idx_tasks_recurring (is_recurring)
);

-- ===================================
-- جداول إدارة المراسلات
-- ===================================

-- جدول المراسلات الواردة
CREATE TABLE correspondence_incoming (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_via ENUM('يدوي', 'إيميل', 'بوابة', 'فاكس', 'بريد', 'مراسل') DEFAULT 'يدوي',
    sender_name VARCHAR(255) NOT NULL,
    sender_organization VARCHAR(255),
    sender_type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    sender_contact JSON,
    sender_address TEXT,
    subject VARCHAR(500) NOT NULL,
    body_summary TEXT,
    body_content TEXT,
    confidentiality ENUM('عادي', 'سري', 'سري جداً') DEFAULT 'عادي',
    urgency ENUM('عادي', 'عاجل', 'فوري') DEFAULT 'عادي',
    status ENUM('مسجل', 'قيد المراجعة', 'محال', 'قيد المعالجة', 'مغلق', 'مؤرشف') DEFAULT 'مسجل',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    assigned_to VARCHAR(36),
    reviewed_by VARCHAR(36),
    approved_by VARCHAR(36),
    due_date DATE,
    response_required BOOLEAN DEFAULT FALSE,
    response_date DATE,
    response_deadline DATE,
    has_response BOOLEAN DEFAULT FALSE,
    response_id VARCHAR(36),
    linked_task_id VARCHAR(36),
    parent_correspondence_id VARCHAR(36),
    attachments JSON,
    tags JSON,
    keywords JSON,
    category VARCHAR(100),
    reference_number VARCHAR(100),
    original_language VARCHAR(10) DEFAULT 'ar',
    translation_required BOOLEAN DEFAULT FALSE,
    security_classification VARCHAR(50),
    handling_instructions TEXT,
    routing_history JSON,
    processing_notes TEXT,
    final_action TEXT,
    archive_location VARCHAR(255),
    retention_period INT DEFAULT 5,
    disposal_date DATE,
    is_repeated BOOLEAN DEFAULT FALSE,
    related_correspondence_ids JSON,
    approval_workflow JSON,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
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
    INDEX idx_incoming_due_date (due_date),
    INDEX idx_incoming_category (category)
);

-- جدول المراسلات الصادرة
CREATE TABLE correspondence_outgoing (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_organization VARCHAR(255),
    recipient_type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    recipient_contact JSON,
    recipient_address TEXT,
    subject VARCHAR(500) NOT NULL,
    body_summary TEXT,
    body_content TEXT,
    confidentiality ENUM('عادي', 'سري', 'سري جداً') DEFAULT 'عادي',
    urgency ENUM('عادي', 'عاجل', 'فوري') DEFAULT 'عادي',
    status ENUM('مسودة', 'قيد المراجعة', 'بانتظار الموافقة', 'معتمد', 'بانتظار التوقيع', 'صادر', 'مؤرشف') DEFAULT 'مسودة',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    prepared_by VARCHAR(36),
    reviewed_by VARCHAR(36),
    approved_by VARCHAR(36),
    signed_by VARCHAR(36),
    delivery_channel ENUM('بريد', 'مراسل', 'إيميل', 'بوابة', 'فاكس', 'يد بيد') DEFAULT 'بريد',
    delivery_status ENUM('لم يرسل', 'مرسل', 'مستلم', 'مرفوض', 'مفقود') DEFAULT 'لم يرسل',
    delivery_date DATE,
    delivery_confirmation VARCHAR(255),
    tracking_number VARCHAR(100),
    linked_task_id VARCHAR(36),
    linked_incoming_id VARCHAR(36),
    parent_correspondence_id VARCHAR(36),
    attachments JSON,
    tags JSON,
    keywords JSON,
    category VARCHAR(100),
    reference_number VARCHAR(100),
    language VARCHAR(10) DEFAULT 'ar',
    copies_count INT DEFAULT 1,
    security_classification VARCHAR(50),
    handling_instructions TEXT,
    approval_workflow JSON,
    approval_history JSON,
    distribution_list JSON,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    archive_location VARCHAR(255),
    retention_period INT DEFAULT 5,
    disposal_date DATE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (prepared_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
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
    INDEX idx_outgoing_delivery (delivery_status),
    INDEX idx_outgoing_category (category)
);

-- ===================================
-- جداول المرفقات والملفات
-- ===================================

-- جدول المرفقات
CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY,
    module_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee', 'department', 'division', 'report', 'backup') NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_extension VARCHAR(10),
    file_hash VARCHAR(64),
    thumbnail_path VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    uploaded_by VARCHAR(36) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL,
    virus_scan_status ENUM('pending', 'clean', 'infected', 'error') DEFAULT 'pending',
    virus_scan_date TIMESTAMP NULL,
    encryption_key VARCHAR(255),
    access_permissions JSON,
    retention_period INT DEFAULT 7,
    disposal_date DATE,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_attachments_module (module_type, module_id),
    INDEX idx_attachments_uploader (uploaded_by),
    INDEX idx_attachments_type (mime_type),
    INDEX idx_attachments_size (file_size)
);

-- ===================================
-- جداول النظام والمراقبة
-- ===================================

-- جدول سجل النشاطات
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    module ENUM('employees', 'departments', 'divisions', 'tasks', 'correspondence_incoming', 'correspondence_outgoing', 'settings', 'system', 'auth', 'reports', 'backup', 'navigation') NOT NULL,
    operation ENUM('create', 'read', 'update', 'delete', 'export', 'import', 'print', 'route', 'approve', 'assign', 'login', 'logout', 'backup', 'restore', 'page_change', 'quick_action', 'transfer', 'points_distributed', 'progress_update') NOT NULL,
    entity_id VARCHAR(36),
    entity_name VARCHAR(255),
    actor_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100),
    description TEXT,
    before_data JSON,
    after_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time INT,
    affected_records INT DEFAULT 1,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    category VARCHAR(100),
    tags JSON,
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (actor_id) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_activity_module (module),
    INDEX idx_activity_operation (operation),
    INDEX idx_activity_entity (entity_id),
    INDEX idx_activity_actor (actor_id),
    INDEX idx_activity_timestamp (timestamp),
    INDEX idx_activity_success (success),
    INDEX idx_activity_severity (severity)
);

-- جدول الإشعارات
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('task_assigned', 'task_completed', 'task_overdue', 'task_reminder', 'correspondence_received', 'correspondence_urgent', 'correspondence_reminder', 'employee_update', 'system_alert', 'backup_completed', 'maintenance_scheduled', 'security_alert') NOT NULL,
    target_user_id VARCHAR(36) NOT NULL,
    target_role VARCHAR(100),
    target_department_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    short_message VARCHAR(160),
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee', 'department', 'division', 'system') NULL,
    related_entity_id VARCHAR(36) NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    channels JSON,
    delivery_status JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (target_user_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (target_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    
    INDEX idx_notifications_user (target_user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_priority (priority),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at),
    INDEX idx_notifications_entity (related_entity_type, related_entity_id),
    INDEX idx_notifications_scheduled (scheduled_at)
);

-- جدول إعدادات النظام
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'file', 'array', 'object') DEFAULT 'string',
    category ENUM('general', 'appearance', 'notifications', 'security', 'backup', 'correspondence', 'tasks', 'employees', 'departments', 'reports', 'integration', 'performance') DEFAULT 'general',
    subcategory VARCHAR(100),
    description TEXT,
    default_value JSON,
    validation_rules JSON,
    is_public BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    requires_restart BOOLEAN DEFAULT FALSE,
    environment ENUM('development', 'staging', 'production', 'all') DEFAULT 'all',
    version_added VARCHAR(20),
    deprecated_in VARCHAR(20),
    migration_path TEXT,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_category (category),
    INDEX idx_settings_public (is_public),
    INDEX idx_settings_readonly (is_readonly)
);

-- ===================================
-- جداول النسخ الاحتياطي والأرشفة
-- ===================================

-- جدول النسخ الاحتياطية
CREATE TABLE backups (
    id VARCHAR(36) PRIMARY KEY,
    backup_name VARCHAR(255) NOT NULL,
    backup_type ENUM('full', 'incremental', 'differential', 'partial', 'data_only', 'structure_only', 'settings_only') DEFAULT 'full',
    backup_method ENUM('manual', 'scheduled', 'triggered', 'emergency') DEFAULT 'manual',
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_hash VARCHAR(64),
    compression_type ENUM('none', 'gzip', 'zip', 'tar') DEFAULT 'gzip',
    encryption_enabled BOOLEAN DEFAULT FALSE,
    encryption_algorithm VARCHAR(50),
    includes_attachments BOOLEAN DEFAULT TRUE,
    includes_logs BOOLEAN DEFAULT TRUE,
    includes_settings BOOLEAN DEFAULT TRUE,
    backup_status ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled', 'corrupted') DEFAULT 'pending',
    progress_percentage INT DEFAULT 0,
    estimated_completion TIMESTAMP NULL,
    error_message TEXT,
    error_code VARCHAR(50),
    tables_included JSON,
    records_count JSON,
    verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
    verification_date TIMESTAMP NULL,
    restoration_tested BOOLEAN DEFAULT FALSE,
    restoration_test_date TIMESTAMP NULL,
    retention_period INT DEFAULT 90,
    auto_delete_date DATE,
    storage_location ENUM('local', 'cloud', 'network', 'external') DEFAULT 'local',
    cloud_provider VARCHAR(100),
    cloud_path VARCHAR(500),
    download_url VARCHAR(500),
    access_permissions JSON,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_backups_name (backup_name),
    INDEX idx_backups_type (backup_type),
    INDEX idx_backups_status (backup_status),
    INDEX idx_backups_created (created_at),
    INDEX idx_backups_method (backup_method)
);

-- ===================================
-- جداول إضافية للنظام المتكامل
-- ===================================

-- جدول قاموس الجهات
CREATE TABLE correspondents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    contact_info JSON,
    address TEXT,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'مصر',
    website VARCHAR(255),
    social_media JSON,
    business_registration VARCHAR(100),
    tax_number VARCHAR(100),
    bank_details JSON,
    preferred_communication ENUM('email', 'phone', 'mail', 'fax') DEFAULT 'email',
    language_preference VARCHAR(10) DEFAULT 'ar',
    time_zone VARCHAR(50) DEFAULT 'Africa/Cairo',
    relationship_type ENUM('client', 'supplier', 'partner', 'government', 'internal', 'other') DEFAULT 'government',
    importance_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    correspondence_frequency ENUM('rare', 'occasional', 'regular', 'frequent') DEFAULT 'occasional',
    last_correspondence_date DATE,
    total_correspondences INT DEFAULT 0,
    notes TEXT,
    tags JSON,
    custom_fields JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATE,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_correspondents_name (name),
    INDEX idx_correspondents_organization (organization),
    INDEX idx_correspondents_type (type),
    INDEX idx_correspondents_active (is_active),
    INDEX idx_correspondents_relationship (relationship_type)
);

-- جدول المشاريع
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_code VARCHAR(50) UNIQUE,
    project_type ENUM('infrastructure', 'maintenance', 'development', 'research', 'training', 'other') DEFAULT 'infrastructure',
    status ENUM('planning', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    project_manager_id VARCHAR(36),
    team_members JSON,
    stakeholders JSON,
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0.00,
    actual_cost DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'EGP',
    funding_source VARCHAR(255),
    completion_percentage INT DEFAULT 0,
    milestones JSON,
    deliverables JSON,
    risks JSON,
    issues JSON,
    lessons_learned TEXT,
    success_criteria TEXT,
    quality_metrics JSON,
    performance_indicators JSON,
    location VARCHAR(255),
    coordinates JSON,
    environmental_impact TEXT,
    social_impact TEXT,
    sustainability_measures TEXT,
    compliance_requirements JSON,
    approval_documents JSON,
    contracts JSON,
    vendors JSON,
    equipment JSON,
    materials JSON,
    resources JSON,
    communication_plan JSON,
    reporting_schedule JSON,
    review_dates JSON,
    archive_location VARCHAR(255),
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (project_manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    INDEX idx_projects_name (name),
    INDEX idx_projects_code (project_code),
    INDEX idx_projects_type (project_type),
    INDEX idx_projects_status (status),
    INDEX idx_projects_priority (priority),
    INDEX idx_projects_manager (project_manager_id),
    INDEX idx_projects_dates (start_date, end_date)
);

-- جدول التدريب والتطوير
CREATE TABLE training_programs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    training_type ENUM('technical', 'management', 'safety', 'compliance', 'soft_skills', 'certification', 'orientation') DEFAULT 'technical',
    delivery_method ENUM('classroom', 'online', 'hybrid', 'workshop', 'seminar', 'conference') DEFAULT 'classroom',
    status ENUM('planned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'planned',
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    trainer_id VARCHAR(36),
    external_trainer VARCHAR(255),
    training_provider VARCHAR(255),
    participants JSON,
    max_participants INT DEFAULT 20,
    min_participants INT DEFAULT 5,
    prerequisites TEXT,
    learning_objectives JSON,
    curriculum JSON,
    materials JSON,
    assessment_method ENUM('exam', 'practical', 'project', 'presentation', 'none') DEFAULT 'none',
    certification_provided BOOLEAN DEFAULT FALSE,
    certification_authority VARCHAR(255),
    start_date DATE,
    end_date DATE,
    duration_hours INT DEFAULT 0,
    schedule JSON,
    location VARCHAR(255),
    venue_details JSON,
    budget DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    feedback_scores JSON,
    effectiveness_rating DECIMAL(3,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (trainer_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    INDEX idx_training_title (title),
    INDEX idx_training_type (training_type),
    INDEX idx_training_status (status),
    INDEX idx_training_dates (start_date, end_date),
    INDEX idx_training_trainer (trainer_id)
);

-- جدول التقييمات والمراجعات
CREATE TABLE evaluations (
    id VARCHAR(36) PRIMARY KEY,
    evaluation_type ENUM('performance', 'project', 'training', 'probation', '360_degree', 'self_assessment') NOT NULL,
    subject_type ENUM('employee', 'department', 'division', 'project', 'training') NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    evaluator_id VARCHAR(36) NOT NULL,
    evaluation_period_start DATE,
    evaluation_period_end DATE,
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    grade ENUM('excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory') DEFAULT 'satisfactory',
    criteria JSON,
    strengths TEXT,
    areas_for_improvement TEXT,
    goals JSON,
    action_plan TEXT,
    recommendations TEXT,
    evaluator_comments TEXT,
    subject_comments TEXT,
    hr_comments TEXT,
    manager_comments TEXT,
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'archived') DEFAULT 'draft',
    due_date DATE,
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    next_evaluation_date DATE,
    is_final BOOLEAN DEFAULT FALSE,
    affects_promotion BOOLEAN DEFAULT FALSE,
    affects_salary BOOLEAN DEFAULT FALSE,
    affects_bonus BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (evaluator_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    INDEX idx_evaluations_type (evaluation_type),
    INDEX idx_evaluations_subject (subject_type, subject_id),
    INDEX idx_evaluations_evaluator (evaluator_id),
    INDEX idx_evaluations_period (evaluation_period_start, evaluation_period_end),
    INDEX idx_evaluations_status (status),
    INDEX idx_evaluations_score (overall_score)
);

-- جدول التقارير المحفوظة
CREATE TABLE saved_reports (
    id VARCHAR(36) PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('tasks', 'correspondence', 'employees', 'departments', 'performance', 'custom') NOT NULL,
    report_data JSON NOT NULL,
    filters_applied JSON,
    date_range JSON,
    generated_by VARCHAR(36) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    file_size BIGINT,
    download_count INT DEFAULT 0,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_pattern JSON,
    next_generation TIMESTAMP NULL,
    retention_period INT DEFAULT 365,
    auto_delete_date DATE,
    is_public BOOLEAN DEFAULT FALSE,
    access_permissions JSON,
    tags JSON,
    notes TEXT,
    
    FOREIGN KEY (generated_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_reports_name (report_name),
    INDEX idx_reports_type (report_type),
    INDEX idx_reports_generated (generated_at),
    INDEX idx_reports_generator (generated_by)
);

-- جدول مستخدمي النظام
CREATE TABLE system_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('مدير النظام', 'مدير إدارة', 'رئيس قسم', 'مهندس', 'موظف') DEFAULT 'موظف',
    department VARCHAR(255),
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    session_token VARCHAR(255),
    session_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_username (username),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active),
    INDEX idx_users_department (department)
);

-- ===================================
-- إضافة المفاتيح الخارجية المتبقية
-- ===================================

ALTER TABLE departments ADD FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE divisions ADD FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ===================================
-- إدراج الإعدادات الافتراضية
-- ===================================

INSERT INTO system_settings (id, setting_key, setting_value, setting_type, category, description, is_public) VALUES
('set-001', 'system_name', '"نظام إدارة مصلحة الري"', 'string', 'general', 'اسم النظام', TRUE),
('set-002', 'organization_name', '"وزارة الموارد المائية والري - جمهورية مصر العربية"', 'string', 'general', 'اسم المؤسسة', TRUE),
('set-003', 'theme', '"فاتح"', 'string', 'appearance', 'سمة النظام', TRUE),
('set-004', 'language', '"ar"', 'string', 'general', 'لغة النظام', TRUE),
('set-005', 'auto_backup_enabled', 'true', 'boolean', 'backup', 'تفعيل النسخ الاحتياطي التلقائي', FALSE),
('set-006', 'backup_frequency', '"daily"', 'string', 'backup', 'تكرار النسخ الاحتياطي', FALSE),
('set-007', 'notification_email_enabled', 'true', 'boolean', 'notifications', 'تفعيل إشعارات البريد الإلكتروني', FALSE),
('set-008', 'session_timeout', '480', 'number', 'security', 'مهلة انتهاء الجلسة بالدقائق', FALSE),
('set-009', 'max_file_size', '10485760', 'number', 'general', 'الحد الأقصى لحجم الملف بالبايت', FALSE),
('set-010', 'allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png", "gif"]', 'json', 'general', 'أنواع الملفات المسموحة', FALSE),
('set-011', 'developer_name', '"م. عبدالعال محمد"', 'string', 'general', 'اسم المطور', TRUE),
('set-012', 'developer_phone', '"+201000731116"', 'string', 'general', 'هاتف المطور', TRUE),
('set-013', 'developer_email', '"abdelaalmiti@gmail.com"', 'string', 'general', 'بريد المطور', TRUE),
('set-014', 'system_version', '"1.0.0"', 'string', 'general', 'إصدار النظام', TRUE),
('set-015', 'correspondence_auto_numbering', 'true', 'boolean', 'correspondence', 'ترقيم المراسلات التلقائي', FALSE),
('set-016', 'task_auto_points', '{"completion": 10, "delay_penalty": -5, "early_completion": 15}', 'json', 'tasks', 'نقاط المهام التلقائية', FALSE);

-- ===================================
-- إنشاء المستخدمين الافتراضيين
-- ===================================

INSERT INTO system_users (id, username, password, name, role, department, permissions, is_active) VALUES
('admin-001', 'admin', 'YWRtaW4xMjM=', 'مدير النظام', 'مدير النظام', 'إدارة تقنية المعلومات', '["admin", "read", "write", "delete", "export", "import", "settings", "users"]', TRUE),
('manager-001', 'manager', 'bWFuYWdlcjEyMw==', 'مدير الإدارة الهندسية', 'مدير إدارة', 'الإدارة الهندسية', '["read", "write", "export", "manage_department"]', TRUE),
('engineer-001', 'engineer', 'ZW5naW5lZXIxMjM=', 'مهندس أول', 'مهندس', 'الإدارة الهندسية', '["read", "write"]', TRUE),
('employee-001', 'employee', 'ZW1wbG95ZWUxMjM=', 'موظف عادي', 'موظف', 'الشؤون الإدارية', '["read"]', TRUE);

-- ===================================
-- إنشاء Views للاستعلامات السريعة
-- ===================================

-- عرض إحصائيات المهام
CREATE VIEW task_statistics AS
SELECT 
    department_id,
    status,
    priority,
    COUNT(*) as task_count,
    AVG(points) as avg_points,
    AVG(completion_percentage) as avg_completion,
    SUM(CASE WHEN status = 'مكتملة' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN status = 'متأخرة' THEN 1 ELSE 0 END) as overdue_count
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY department_id, status, priority;

-- عرض إحصائيات المراسلات
CREATE VIEW correspondence_statistics AS
SELECT 
    'incoming' as type,
    department_id,
    status,
    urgency,
    confidentiality,
    COUNT(*) as correspondence_count,
    AVG(DATEDIFF(COALESCE(completed_at, NOW()), created_at)) as avg_processing_days
FROM correspondence_incoming 
WHERE deleted_at IS NULL
GROUP BY department_id, status, urgency, confidentiality

UNION ALL

SELECT 
    'outgoing' as type,
    department_id,
    status,
    urgency,
    confidentiality,
    COUNT(*) as correspondence_count,
    AVG(DATEDIFF(COALESCE(completed_at, NOW()), created_at)) as avg_processing_days
FROM correspondence_outgoing 
WHERE deleted_at IS NULL
GROUP BY department_id, status, urgency, confidentiality;

-- عرض أداء الموظفين
CREATE VIEW employee_performance AS
SELECT 
    e.id,
    e.name,
    e.employee_number,
    e.department_id,
    e.division_id,
    e.points,
    e.rating,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'متأخرة' THEN 1 ELSE 0 END) as overdue_tasks,
    AVG(t.quality_score) as avg_quality_score,
    SUM(t.points) as total_task_points
FROM employees e
LEFT JOIN tasks t ON JSON_CONTAINS(t.assigned_to, CONCAT('"', e.id, '"'))
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.name, e.employee_number, e.department_id, e.division_id, e.points, e.rating;

-- عرض أداء الإدارات
CREATE VIEW department_performance AS
SELECT 
    d.id,
    d.name,
    d.employee_count,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT ci.id) as total_incoming_correspondence,
    COUNT(DISTINCT co.id) as total_outgoing_correspondence,
    AVG(e.points) as avg_employee_points,
    AVG(e.rating) as avg_employee_rating,
    SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'متأخرة' THEN 1 ELSE 0 END) as overdue_tasks
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id AND e.deleted_at IS NULL
LEFT JOIN tasks t ON d.id = t.department_id AND t.deleted_at IS NULL
LEFT JOIN correspondence_incoming ci ON d.id = ci.department_id AND ci.deleted_at IS NULL
LEFT JOIN correspondence_outgoing co ON d.id = co.department_id AND co.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.employee_count;

-- ===================================
-- إنشاء Triggers للتحديث التلقائي
-- ===================================

-- Trigger لتحديث عدد الموظفين في الإدارات
DELIMITER //
CREATE TRIGGER update_department_employee_count
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    UPDATE departments 
    SET employee_count = (
        SELECT COUNT(*) FROM employees 
        WHERE department_id = NEW.department_id AND deleted_at IS NULL
    )
    WHERE id = NEW.department_id;
END//

CREATE TRIGGER update_department_employee_count_on_update
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    -- تحديث الإدارة القديمة
    IF OLD.department_id IS NOT NULL THEN
        UPDATE departments 
        SET employee_count = (
            SELECT COUNT(*) FROM employees 
            WHERE department_id = OLD.department_id AND deleted_at IS NULL
        )
        WHERE id = OLD.department_id;
    END IF;
    
    -- تحديث الإدارة الجديدة
    IF NEW.department_id IS NOT NULL THEN
        UPDATE departments 
        SET employee_count = (
            SELECT COUNT(*) FROM employees 
            WHERE department_id = NEW.department_id AND deleted_at IS NULL
        )
        WHERE id = NEW.department_id;
    END IF;
END//

-- Trigger لتحديث عدد الموظفين في الأقسام
CREATE TRIGGER update_division_employee_count
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    UPDATE divisions 
    SET employee_count = (
        SELECT COUNT(*) FROM employees 
        WHERE division_id = NEW.division_id AND deleted_at IS NULL
    )
    WHERE id = NEW.division_id;
END//

CREATE TRIGGER update_division_employee_count_on_update
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    -- تحديث القسم القديم
    IF OLD.division_id IS NOT NULL THEN
        UPDATE divisions 
        SET employee_count = (
            SELECT COUNT(*) FROM employees 
            WHERE division_id = OLD.division_id AND deleted_at IS NULL
        )
        WHERE id = OLD.division_id;
    END IF;
    
    -- تحديث القسم الجديد
    IF NEW.division_id IS NOT NULL THEN
        UPDATE divisions 
        SET employee_count = (
            SELECT COUNT(*) FROM employees 
            WHERE division_id = NEW.division_id AND deleted_at IS NULL
        )
        WHERE id = NEW.division_id;
    END IF;
END//

DELIMITER ;

-- ===================================
-- إنشاء Stored Procedures للعمليات المعقدة
-- ===================================

DELIMITER //

-- إجراء لحساب نقاط الموظف
CREATE PROCEDURE CalculateEmployeePoints(IN emp_id VARCHAR(36))
BEGIN
    DECLARE total_points INT DEFAULT 0;
    
    SELECT COALESCE(SUM(points_change), 0) INTO total_points
    FROM employee_points 
    WHERE employee_id = emp_id;
    
    UPDATE employees 
    SET points = total_points 
    WHERE id = emp_id;
END//

-- إجراء لإنشاء نسخة احتياطية
CREATE PROCEDURE CreateSystemBackup(IN backup_name VARCHAR(255), IN created_by_id VARCHAR(36))
BEGIN
    DECLARE backup_id VARCHAR(36);
    DECLARE backup_file VARCHAR(255);
    
    SET backup_id = CONCAT('backup-', UNIX_TIMESTAMP(), '-', SUBSTRING(MD5(RAND()), 1, 8));
    SET backup_file = CONCAT(backup_name, '_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'), '.sql');
    
    INSERT INTO backups (
        id, backup_name, backup_type, backup_method, file_path, file_name,
        backup_status, created_by, created_at
    ) VALUES (
        backup_id, backup_name, 'full', 'manual', '/backups/', backup_file,
        'completed', created_by_id, NOW()
    );
    
    SELECT backup_id as backup_id, backup_file as file_name;
END//

-- إجراء لتنظيف البيانات القديمة
CREATE PROCEDURE CleanupOldData()
BEGIN
    -- حذف سجلات النشاط الأقدم من سنة
    DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- حذف الإشعارات المقروءة الأقدم من 3 أشهر
    DELETE FROM notifications 
    WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
    
    -- حذف النسخ الاحتياطية المنتهية الصلاحية
    DELETE FROM backups 
    WHERE auto_delete_date IS NOT NULL AND auto_delete_date < CURDATE();
    
    -- تحديث إحصائيات الجداول
    ANALYZE TABLE departments, divisions, employees, tasks, correspondence_incoming, correspondence_outgoing;
END//

DELIMITER ;

-- ===================================
-- إنشاء Events للمهام التلقائية
-- ===================================

-- تفعيل Event Scheduler
SET GLOBAL event_scheduler = ON;

-- Event لتنظيف البيانات القديمة يومياً
CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanupOldData();

-- Event لإنشاء نسخة احتياطية تلقائية
CREATE EVENT IF NOT EXISTS daily_backup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
  CALL CreateSystemBackup('نسخة_احتياطية_تلقائية', 'admin-001');

-- ===================================
-- إنشاء Functions مساعدة
-- ===================================

DELIMITER //

-- دالة لحساب معدل إنجاز المهام
CREATE FUNCTION GetTaskCompletionRate(dept_id VARCHAR(36)) 
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_tasks INT DEFAULT 0;
    DECLARE completed_tasks INT DEFAULT 0;
    DECLARE completion_rate DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT COUNT(*) INTO total_tasks
    FROM tasks 
    WHERE department_id = dept_id AND deleted_at IS NULL;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM tasks 
    WHERE department_id = dept_id AND status = 'مكتملة' AND deleted_at IS NULL;
    
    IF total_tasks > 0 THEN
        SET completion_rate = (completed_tasks / total_tasks) * 100;
    END IF;
    
    RETURN completion_rate;
END//

-- دالة لحساب متوسط وقت معالجة المراسلات
CREATE FUNCTION GetAvgCorrespondenceProcessingTime(dept_id VARCHAR(36)) 
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE avg_days DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT AVG(DATEDIFF(COALESCE(completed_at, NOW()), created_at)) INTO avg_days
    FROM correspondence_incoming 
    WHERE department_id = dept_id AND deleted_at IS NULL;
    
    RETURN COALESCE(avg_days, 0.00);
END//

DELIMITER ;

-- ===================================
-- إنشاء Indexes إضافية للأداء
-- ===================================

-- فهارس مركبة للاستعلامات الشائعة
CREATE INDEX idx_tasks_status_dept_priority ON tasks(status, department_id, priority);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to(255), status);
CREATE INDEX idx_correspondence_dept_urgency ON correspondence_incoming(department_id, urgency);
CREATE INDEX idx_correspondence_status_date ON correspondence_incoming(status, date);
CREATE INDEX idx_employees_dept_status_points ON employees(department_id, status, points);
CREATE INDEX idx_activity_logs_module_timestamp ON activity_logs(module, timestamp);
CREATE INDEX idx_notifications_user_read_priority ON notifications(target_user_id, is_read, priority);

-- ===================================
-- إنشاء Full-Text Search Indexes
-- ===================================

-- فهارس البحث النصي للمهام
ALTER TABLE tasks ADD FULLTEXT(title, description);

-- فهارس البحث النصي للمراسلات
ALTER TABLE correspondence_incoming ADD FULLTEXT(subject, body_summary, body_content);
ALTER TABLE correspondence_outgoing ADD FULLTEXT(subject, body_summary, body_content);

-- فهارس البحث النصي للموظفين
ALTER TABLE employees ADD FULLTEXT(name, position);

-- ===================================
-- إنشاء Partitioning للجداول الكبيرة
-- ===================================

-- تقسيم جدول سجل النشاطات حسب التاريخ
ALTER TABLE activity_logs 
PARTITION BY RANGE (YEAR(timestamp)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ===================================
-- إعدادات الأمان والصلاحيات
-- ===================================

-- إنشاء مستخدمين مخصصين لقاعدة البيانات
CREATE USER IF NOT EXISTS 'irrigation_read'@'localhost' IDENTIFIED BY 'read_pass_2024!';
CREATE USER IF NOT EXISTS 'irrigation_write'@'localhost' IDENTIFIED BY 'write_pass_2024!';
CREATE USER IF NOT EXISTS 'irrigation_admin'@'localhost' IDENTIFIED BY 'admin_pass_2024!';

-- منح الصلاحيات
GRANT SELECT ON irrigation_management_system.* TO 'irrigation_read'@'localhost';
GRANT SELECT, INSERT, UPDATE ON irrigation_management_system.* TO 'irrigation_write'@'localhost';
GRANT ALL PRIVILEGES ON irrigation_management_system.* TO 'irrigation_admin'@'localhost';

-- تطبيق التغييرات
FLUSH PRIVILEGES;

-- ===================================
-- إدراج البيانات التجريبية الأساسية
-- ===================================

-- إدراج الإدارات الأساسية
INSERT INTO departments (id, name, description, employee_count, is_active) VALUES
('dept-001', 'الإدارة الهندسية', 'إدارة المشاريع الهندسية وصيانة البنية التحتية', 0, TRUE),
('dept-002', 'الشؤون الإدارية', 'إدارة الموارد البشرية والشؤون الإدارية', 0, TRUE),
('dept-003', 'الإدارة المالية', 'إدارة الميزانية والشؤون المالية', 0, TRUE),
('dept-004', 'إدارة المشاريع', 'تخطيط وتنفيذ المشاريع المائية', 0, TRUE),
('dept-005', 'الإدارة الفنية', 'الصيانة والدعم الفني', 0, TRUE),
('dept-006', 'إدارة الجودة', 'ضمان الجودة ومراقبة المعايير', 0, TRUE),
('dept-007', 'الإدارة القانونية', 'الشؤون القانونية والتشريعية', 0, TRUE),
('dept-008', 'إدارة التطوير', 'البحث والتطوير والابتكار', 0, TRUE);

-- إدراج الأقسام الأساسية
INSERT INTO divisions (id, name, description, department_id, employee_count, is_active) VALUES
-- أقسام الإدارة الهندسية
('div-001', 'قسم المشاريع', 'تصميم وتنفيذ المشاريع الهندسية', 'dept-001', 0, TRUE),
('div-002', 'قسم الصيانة', 'صيانة المعدات والمنشآت', 'dept-001', 0, TRUE),
('div-003', 'قسم التصميم', 'التصميم الهندسي والمخططات', 'dept-001', 0, TRUE),

-- أقسام الشؤون الإدارية
('div-004', 'قسم الموارد البشرية', 'إدارة شؤون الموظفين', 'dept-002', 0, TRUE),
('div-005', 'قسم الخدمات العامة', 'الخدمات الإدارية العامة', 'dept-002', 0, TRUE),

-- أقسام الإدارة المالية
('div-006', 'قسم المحاسبة', 'المحاسبة والتدقيق المالي', 'dept-003', 0, TRUE),
('div-007', 'قسم الميزانية', 'إعداد ومتابعة الميزانية', 'dept-003', 0, TRUE),

-- أقسام إدارة المشاريع
('div-008', 'قسم التخطيط', 'تخطيط وجدولة المشاريع', 'dept-004', 0, TRUE),
('div-009', 'قسم المتابعة', 'متابعة تنفيذ المشاريع', 'dept-004', 0, TRUE),

-- أقسام الإدارة الفنية
('div-010', 'قسم الصيانة الوقائية', 'الصيانة الدورية والوقائية', 'dept-005', 0, TRUE),
('div-011', 'قسم الطوارئ', 'التعامل مع الطوارئ والأعطال', 'dept-005', 0, TRUE),

-- أقسام إدارة الجودة
('div-012', 'قسم مراقبة الجودة', 'مراقبة جودة المياه والخدمات', 'dept-006', 0, TRUE),
('div-013', 'قسم المعايير', 'وضع ومراجعة المعايير', 'dept-006', 0, TRUE),

-- أقسام الإدارة القانونية
('div-014', 'قسم الاستشارات القانونية', 'تقديم الاستشارات القانونية', 'dept-007', 0, TRUE),
('div-015', 'قسم التقاضي', 'متابعة القضايا والدعاوى', 'dept-007', 0, TRUE),

-- أقسام إدارة التطوير
('div-016', 'قسم البحث والتطوير', 'البحوث والدراسات التطويرية', 'dept-008', 0, TRUE),
('div-017', 'قسم التدريب', 'تدريب وتأهيل الموظفين', 'dept-008', 0, TRUE);

-- إدراج مستخدم النظام الافتراضي
INSERT INTO employees (id, name, employee_number, email, phone, department_id, division_id, position, points, status, permissions, password_hash, is_active) VALUES
('admin-001', 'مدير النظام', 'ADMIN001', 'admin@irrigation.gov.eg', '+201000731116', 'dept-002', 'div-004', 'مدير النظام', 1000, 'نشط', '["admin", "read", "write", "delete", "export", "import"]', MD5('admin123'), TRUE);

-- تحديث رؤساء الإدارات والأقسام
UPDATE departments SET head_employee_id = 'admin-001' WHERE id = 'dept-002';
UPDATE divisions SET head_employee_id = 'admin-001' WHERE id = 'div-004';

-- إنشاء سجل نشاط أولي
INSERT INTO activity_logs (id, module, operation, entity_id, actor_id, actor_name, description, success) VALUES
('log-001', 'system', 'create', 'system', 'admin-001', 'مدير النظام', 'تم تثبيت النظام بنجاح', TRUE);

-- إنشاء إشعار ترحيبي
INSERT INTO notifications (id, type, target_user_id, title, message, priority, is_read) VALUES
('notif-001', 'system_alert', 'admin-001', 'مرحباً بك في النظام', 'تم تثبيت نظام إدارة مصلحة الري بنجاح. يمكنك الآن البدء في استخدام النظام.', 'medium', FALSE);

-- ===================================
-- إعدادات الأداء والتحسين
-- ===================================

-- تحسين إعدادات MySQL للأداء
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL max_connections = 150;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB

-- تحسين إعدادات الجداول
ALTER TABLE tasks ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
ALTER TABLE correspondence_incoming ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
ALTER TABLE correspondence_outgoing ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
ALTER TABLE activity_logs ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

-- ===================================
-- إنشاء Views للتقارير السريعة
-- ===================================

-- عرض ملخص النظام
CREATE VIEW system_summary AS
SELECT 
    (SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL) as total_employees,
    (SELECT COUNT(*) FROM employees WHERE status = 'نشط' AND deleted_at IS NULL) as active_employees,
    (SELECT COUNT(*) FROM departments WHERE deleted_at IS NULL) as total_departments,
    (SELECT COUNT(*) FROM divisions WHERE deleted_at IS NULL) as total_divisions,
    (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL) as total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'مكتملة' AND deleted_at IS NULL) as completed_tasks,
    (SELECT COUNT(*) FROM correspondence_incoming WHERE deleted_at IS NULL) as total_incoming,
    (SELECT COUNT(*) FROM correspondence_outgoing WHERE deleted_at IS NULL) as total_outgoing,
    (SELECT COUNT(*) FROM attachments WHERE deleted_at IS NULL) as total_attachments,
    (SELECT COUNT(*) FROM backups WHERE backup_status = 'completed') as total_backups;

-- عرض المهام العاجلة
CREATE VIEW urgent_tasks AS
SELECT 
    t.*,
    d.name as department_name,
    dv.name as division_name,
    e.name as created_by_name
FROM tasks t
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN divisions dv ON t.division_id = dv.id
LEFT JOIN employees e ON t.created_by = e.id
WHERE t.priority IN ('عالي', 'عاجل') 
AND t.status NOT IN ('مكتملة', 'ملغية')
AND t.deleted_at IS NULL
ORDER BY 
    CASE t.priority 
        WHEN 'عاجل' THEN 1 
        WHEN 'عالي' THEN 2 
        ELSE 3 
    END,
    t.end_date ASC;

-- عرض المراسلات العاجلة
CREATE VIEW urgent_correspondence AS
SELECT 
    'incoming' as type,
    ci.*,
    d.name as department_name,
    e.name as assigned_to_name
FROM correspondence_incoming ci
LEFT JOIN departments d ON ci.department_id = d.id
LEFT JOIN employees e ON ci.assigned_to = e.id
WHERE ci.urgency IN ('عاجل', 'فوري') 
AND ci.status NOT IN ('مغلق', 'مؤرشف')
AND ci.deleted_at IS NULL

UNION ALL

SELECT 
    'outgoing' as type,
    co.*,
    d.name as department_name,
    e.name as assigned_to_name
FROM correspondence_outgoing co
LEFT JOIN departments d ON co.department_id = d.id
LEFT JOIN employees e ON co.prepared_by = e.id
WHERE co.urgency IN ('عاجل', 'فوري') 
AND co.status NOT IN ('صادر', 'مؤرشف')
AND co.deleted_at IS NULL

ORDER BY urgency DESC, date ASC;

-- ===================================
-- إنشاء Security Policies
-- ===================================

-- تشفير كلمات المرور الموجودة
UPDATE system_users SET password = MD5(password) WHERE LENGTH(password) < 32;

-- إنشاء جدول لتتبع محاولات تسجيل الدخول
CREATE TABLE login_attempts (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_login_attempts_username (username),
    INDEX idx_login_attempts_ip (ip_address),
    INDEX idx_login_attempts_time (attempted_at)
);

-- ===================================
-- إنشاء Audit Trail
-- ===================================

-- Trigger لتسجيل تغييرات الموظفين
DELIMITER //
CREATE TRIGGER audit_employees_changes
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        id, module, operation, entity_id, actor_id, actor_name, 
        description, before_data, after_data, success
    ) VALUES (
        CONCAT('audit-', UNIX_TIMESTAMP(), '-', CONNECTION_ID()),
        'employees',
        'update',
        NEW.id,
        NEW.id, -- يمكن تحسينها لتتبع المستخدم الفعلي
        NEW.name,
        CONCAT('تم تحديث بيانات الموظف: ', NEW.name),
        JSON_OBJECT('points', OLD.points, 'status', OLD.status, 'department', OLD.department_id),
        JSON_OBJECT('points', NEW.points, 'status', NEW.status, 'department', NEW.department_id),
        TRUE
    );
END//
DELIMITER ;

-- ===================================
-- إنشاء Reports Templates
-- ===================================

-- قالب تقرير المهام الشهري
INSERT INTO saved_reports (id, report_name, report_type, report_data, generated_by) VALUES
('report-template-001', 'قالب تقرير المهام الشهري', 'tasks', 
'{"template": true, "sections": ["summary", "details", "charts"], "filters": ["department", "status", "priority"]}', 
'admin-001');

-- قالب تقرير المراسلات
INSERT INTO saved_reports (id, report_name, report_type, report_data, generated_by) VALUES
('report-template-002', 'قالب تقرير المراسلات', 'correspondence', 
'{"template": true, "sections": ["incoming", "outgoing", "urgent"], "filters": ["department", "urgency", "confidentiality"]}', 
'admin-001');

-- ===================================
-- إنشاء Maintenance Procedures
-- ===================================

DELIMITER //

-- إجراء صيانة شامل
CREATE PROCEDURE SystemMaintenance()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE cur CURSOR FOR 
        SELECT TABLE_NAME FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'irrigation_management_system' 
        AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- تنظيف البيانات القديمة
    CALL CleanupOldData();
    
    -- تحسين جميع الجداول
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;
    CLOSE cur;
    
    -- تحديث الإحصائيات
    ANALYZE TABLE departments, divisions, employees, tasks, correspondence_incoming, correspondence_outgoing;
    
    -- تسجيل عملية الصيانة
    INSERT INTO activity_logs (
        id, module, operation, actor_id, actor_name, description, success
    ) VALUES (
        CONCAT('maintenance-', UNIX_TIMESTAMP()),
        'system',
        'maintenance',
        'admin-001',
        'النظام',
        'تم تنفيذ صيانة شاملة للنظام',
        TRUE
    );
END//

DELIMITER ;

-- جدولة الصيانة الأسبوعية
CREATE EVENT IF NOT EXISTS weekly_maintenance
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
  CALL SystemMaintenance();

-- ===================================
-- إنشاء Health Check
-- ===================================

DELIMITER //

-- دالة فحص صحة النظام
CREATE PROCEDURE SystemHealthCheck()
BEGIN
    SELECT 
        'System Health Check' as check_type,
        NOW() as check_time,
        (SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL) as total_employees,
        (SELECT COUNT(*) FROM departments WHERE deleted_at IS NULL) as total_departments,
        (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL) as total_tasks,
        (SELECT COUNT(*) FROM correspondence_incoming WHERE deleted_at IS NULL) as total_incoming,
        (SELECT COUNT(*) FROM correspondence_outgoing WHERE deleted_at IS NULL) as total_outgoing,
        (SELECT COUNT(*) FROM activity_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)) as daily_activities,
        (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE) as unread_notifications,
        (SELECT COUNT(*) FROM backups WHERE backup_status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_backups;
END//

DELIMITER ;

-- ===================================
-- الانتهاء من إعداد قاعدة البيانات
-- ===================================

-- تسجيل اكتمال التثبيت
INSERT INTO activity_logs (id, module, operation, entity_id, actor_id, actor_name, description, success) VALUES
('log-install-complete', 'system', 'create', 'database', 'admin-001', 'النظام', 'تم إنشاء قاعدة البيانات الكاملة بنجاح', TRUE);

-- عرض ملخص التثبيت
SELECT 
    'تم إنشاء قاعدة البيانات بنجاح' AS status,
    NOW() AS installation_time,
    (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'irrigation_management_system') AS total_tables,
    (SELECT COUNT(*) FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'irrigation_management_system') AS total_views,
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'irrigation_management_system') AS total_procedures,
    (SELECT COUNT(*) FROM information_schema.EVENTS WHERE EVENT_SCHEMA = 'irrigation_management_system') AS total_events;

COMMIT;