-- قاعدة بيانات نظام إدارة مصلحة الري الكاملة
-- وزارة الموارد المائية والري - جمهورية مصر العربية

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS irrigation_management_system 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE irrigation_management_system;

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
    assigned_to JSON, -- مصفوفة من معرفات الموظفين
    completed_by JSON, -- مصفوفة من معرفات الموظفين المنجزين
    reviewed_by VARCHAR(36),
    approved_by VARCHAR(36),
    attachments JSON, -- مصفوفة من المرفقات
    tags JSON, -- مصفوفة من العلامات
    dependencies JSON, -- مصفوفة من معرفات المهام المعتمدة عليها
    linked_correspondence_id VARCHAR(36),
    notes TEXT,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00,
    is_milestone BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    template_id VARCHAR(36),
    recurring_pattern JSON,
    reminder_dates JSON,
    budget DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_tasks_title (title),
    INDEX idx_tasks_priority (priority),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_department (department_id),
    INDEX idx_tasks_division (division_id),
    INDEX idx_tasks_created_by (created_by),
    INDEX idx_tasks_dates (start_date, end_date),
    INDEX idx_tasks_completion (completion_percentage),
    INDEX idx_tasks_points (points)
);

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
    sender_contact JSON, -- بيانات الاتصال
    sender_address TEXT,
    subject VARCHAR(500) NOT NULL,
    body_summary TEXT,
    content TEXT,
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
    linked_task_id VARCHAR(36),
    linked_outgoing_id VARCHAR(36), -- ربط بمراسلة صادرة (رد)
    parent_correspondence_id VARCHAR(36), -- للمراسلات المترابطة
    attachments JSON,
    tags JSON,
    keywords JSON,
    category VARCHAR(100),
    reference_number VARCHAR(100),
    original_language VARCHAR(10) DEFAULT 'ar',
    translation_required BOOLEAN DEFAULT FALSE,
    security_classification VARCHAR(50),
    handling_instructions TEXT,
    routing_history JSON, -- تاريخ التحويل
    processing_notes TEXT,
    final_action TEXT,
    archive_location VARCHAR(255),
    retention_period INT DEFAULT 5, -- سنوات
    disposal_date DATE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    content TEXT,
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
    linked_incoming_id VARCHAR(36), -- ربط بمراسلة واردة (رد)
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
    approval_workflow JSON, -- سير عمل الموافقة
    approval_history JSON, -- تاريخ الموافقات
    distribution_list JSON, -- قائمة التوزيع
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    archive_location VARCHAR(255),
    retention_period INT DEFAULT 5,
    disposal_date DATE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

-- جدول المرفقات
CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY,
    module_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee', 'department', 'division') NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_extension VARCHAR(10),
    file_hash VARCHAR(64), -- للتحقق من سلامة الملف
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
    retention_period INT DEFAULT 7, -- سنوات
    disposal_date DATE,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_attachments_module (module_type, module_id),
    INDEX idx_attachments_uploader (uploaded_by),
    INDEX idx_attachments_type (mime_type),
    INDEX idx_attachments_size (file_size)
);

-- جدول سجل النشاطات
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    module ENUM('employees', 'departments', 'divisions', 'tasks', 'correspondence_incoming', 'correspondence_outgoing', 'settings', 'system', 'auth', 'reports', 'backup') NOT NULL,
    operation ENUM('create', 'read', 'update', 'delete', 'export', 'import', 'print', 'route', 'approve', 'assign', 'login', 'logout', 'backup', 'restore') NOT NULL,
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
    execution_time INT, -- milliseconds
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

-- جدول نقاط الموظفين (تفصيلي)
CREATE TABLE employee_points (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    points_change INT NOT NULL, -- موجب أو سالب
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

-- جدول الإشعارات
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('task_assigned', 'task_completed', 'task_overdue', 'task_reminder', 'correspondence_received', 'correspondence_urgent', 'correspondence_reminder', 'employee_update', 'system_alert', 'backup_completed', 'maintenance_scheduled', 'security_alert') NOT NULL,
    target_user_id VARCHAR(36) NOT NULL,
    target_role VARCHAR(100),
    target_department_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    short_message VARCHAR(160), -- للرسائل النصية
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee', 'department', 'division', 'system') NULL,
    related_entity_id VARCHAR(36) NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    channels JSON, -- قنوات الإرسال: browser, email, sms, push
    delivery_status JSON, -- حالة التسليم لكل قناة
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
    is_public BOOLEAN DEFAULT FALSE, -- هل يمكن للمستخدمين العاديين رؤيتها
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
    records_count JSON, -- عدد السجلات لكل جدول
    verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
    verification_date TIMESTAMP NULL,
    restoration_tested BOOLEAN DEFAULT FALSE,
    restoration_test_date TIMESTAMP NULL,
    retention_period INT DEFAULT 90, -- أيام
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

-- جدول قاموس الجهات (للمراسلات المتكررة)
CREATE TABLE correspondents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'أخرى') DEFAULT 'جهة حكومية',
    contact_info JSON, -- بيانات الاتصال
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
    coordinates JSON, -- GPS coordinates
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
    participants JSON, -- معرفات الموظفين المشاركين
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
    schedule JSON, -- جدول الجلسات
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
    criteria JSON, -- معايير التقييم والدرجات
    strengths TEXT,
    areas_for_improvement TEXT,
    goals JSON, -- أهداف التطوير
    action_plan TEXT,
    recommendations TEXT,
    evaluator_comments TEXT,
    subject_comments TEXT, -- تعليقات المُقيَّم
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

-- إضافة المفاتيح الخارجية المتبقية
ALTER TABLE departments ADD FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE divisions ADD FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- إدراج الإعدادات الافتراضية
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
('set-010', 'allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png", "gif"]', 'json', 'general', 'أنواع الملفات المسموحة', FALSE);