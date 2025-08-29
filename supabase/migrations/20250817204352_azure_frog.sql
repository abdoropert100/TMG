-- قاعدة بيانات نظام إدارة مصلحة الري المحدثة والمطورة
-- وزارة الموارد المائية والري - جمهورية مصر العربية
-- م. عبدالعال محمد - المطور الرئيسي - +201000731116 - abdelaalmiti@gmail.com

-- إنشاء قاعدة البيانات مع الترميز العربي المحسن
CREATE DATABASE IF NOT EXISTS irrigation_management_system 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE irrigation_management_system;

-- ===================================================================
-- الجداول الأساسية للهيكل التنظيمي
-- ===================================================================

-- جدول الإدارات المحسن
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    name_en VARCHAR(255),
    description TEXT,
    description_en TEXT,
    code VARCHAR(20) UNIQUE,
    head_employee_id VARCHAR(36),
    deputy_head_employee_id VARCHAR(36),
    employee_count INT DEFAULT 0,
    division_count INT DEFAULT 0,
    budget DECIMAL(15,2) DEFAULT 0.00,
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    established_date DATE,
    status ENUM('نشط', 'معطل', 'مؤقت') DEFAULT 'نشط',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_departments_name (name),
    INDEX idx_departments_code (code),
    INDEX idx_departments_head (head_employee_id),
    INDEX idx_departments_status (status),
    INDEX idx_departments_sort (sort_order)
);

-- جدول الأقسام المحسن
CREATE TABLE divisions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    description_en TEXT,
    code VARCHAR(20),
    department_id VARCHAR(36) NOT NULL,
    head_employee_id VARCHAR(36),
    deputy_head_employee_id VARCHAR(36),
    employee_count INT DEFAULT 0,
    budget DECIMAL(15,2) DEFAULT 0.00,
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    established_date DATE,
    status ENUM('نشط', 'معطل', 'مؤقت') DEFAULT 'نشط',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    
    INDEX idx_divisions_name (name),
    INDEX idx_divisions_code (code),
    INDEX idx_divisions_department (department_id),
    INDEX idx_divisions_head (head_employee_id),
    INDEX idx_divisions_status (status),
    INDEX idx_divisions_sort (sort_order),
    
    UNIQUE KEY unique_division_name_per_dept (department_id, name)
);

-- ===================================================================
-- جدول الموظفين المطور والشامل
-- ===================================================================

CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    
    -- البيانات الشخصية الأساسية
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    national_id VARCHAR(20) UNIQUE,
    birth_date DATE,
    gender ENUM('ذكر', 'أنثى'),
    marital_status ENUM('أعزب', 'متزوج', 'مطلق', 'أرمل'),
    
    -- معلومات الاتصال
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    
    -- العنوان التفصيلي
    address_street VARCHAR(500),
    address_city VARCHAR(100),
    address_governorate VARCHAR(100),
    address_postal_code VARCHAR(20),
    
    -- البيانات الوظيفية
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    position VARCHAR(255),
    position_en VARCHAR(255),
    job_grade VARCHAR(20),
    hire_date DATE,
    contract_type ENUM('دائم', 'مؤقت', 'متعاقد', 'تدريب') DEFAULT 'دائم',
    work_schedule ENUM('دوام كامل', 'دوام جزئي', 'مرن') DEFAULT 'دوام كامل',
    
    -- الراتب والمزايا
    basic_salary DECIMAL(10,2) DEFAULT 0.00,
    allowances DECIMAL(10,2) DEFAULT 0.00,
    total_salary DECIMAL(10,2) GENERATED ALWAYS AS (basic_salary + allowances) STORED,
    
    -- الأداء والتقييم
    points INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    last_evaluation_date DATE,
    performance_level ENUM('ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف') DEFAULT 'مقبول',
    
    -- الحالة والصلاحيات
    status ENUM('نشط', 'معطل', 'إجازة', 'مستقيل', 'متقاعد') DEFAULT 'نشط',
    permissions JSON,
    roles JSON,
    
    -- الملفات والمرفقات
    avatar_url VARCHAR(500),
    cv_file_path VARCHAR(500),
    documents JSON,
    
    -- بيانات النظام
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- الفهارس للبحث السريع
    INDEX idx_employees_name (name),
    INDEX idx_employees_number (employee_number),
    INDEX idx_employees_national_id (national_id),
    INDEX idx_employees_email (email),
    INDEX idx_employees_phone (phone),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_division (division_id),
    INDEX idx_employees_position (position),
    INDEX idx_employees_status (status),
    INDEX idx_employees_points (points),
    INDEX idx_employees_rating (rating),
    INDEX idx_employees_hire_date (hire_date),
    INDEX idx_employees_performance (performance_level),
    
    -- فهارس مركبة للاستعلامات المعقدة
    INDEX idx_employees_dept_status (department_id, status),
    INDEX idx_employees_div_status (division_id, status),
    INDEX idx_employees_points_rating (points, rating),
    
    -- قيود التحقق
    CONSTRAINT chk_employees_points CHECK (points >= 0),
    CONSTRAINT chk_employees_rating CHECK (rating >= 0.00 AND rating <= 5.00),
    CONSTRAINT chk_employees_salary CHECK (basic_salary >= 0 AND allowances >= 0)
);

-- ===================================================================
-- جدول المهام المطور والشامل
-- ===================================================================

CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    
    -- المعلومات الأساسية
    title VARCHAR(500) NOT NULL,
    description TEXT,
    summary VARCHAR(1000),
    category VARCHAR(100),
    tags JSON,
    
    -- التصنيف والأولوية
    priority ENUM('منخفض', 'متوسط', 'عالي', 'عاجل', 'حرج') DEFAULT 'متوسط',
    complexity ENUM('بسيط', 'متوسط', 'معقد', 'معقد جداً') DEFAULT 'متوسط',
    task_type ENUM('روتيني', 'مشروع', 'طارئ', 'تطوير', 'صيانة') DEFAULT 'روتيني',
    confidentiality ENUM('عام', 'محدود', 'سري', 'سري جداً') DEFAULT 'عام',
    
    -- الحالة والتتبع
    status ENUM('جديدة', 'قيد التنفيذ', 'مراجعة', 'مكتملة', 'مؤجلة', 'ملغية', 'متأخرة') DEFAULT 'جديدة',
    progress_percentage INT DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- التنظيم الإداري
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    project_id VARCHAR(36),
    
    -- التوقيتات
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    due_date DATE,
    
    -- الموارد والتكلفة
    estimated_hours INT DEFAULT 0,
    actual_hours INT DEFAULT 0,
    estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_cost DECIMAL(12,2) DEFAULT 0.00,
    
    -- النقاط والتقييم
    points INT DEFAULT 0,
    bonus_points INT DEFAULT 0,
    total_points GENERATED ALWAYS AS (points + bonus_points) STORED,
    
    -- الإسناد والإنجاز
    created_by VARCHAR(36) NOT NULL,
    assigned_to JSON, -- مصفوفة معرفات الموظفين
    completed_by JSON, -- مصفوفة معرفات المنجزين
    approved_by VARCHAR(36),
    reviewed_by VARCHAR(36),
    
    -- المرفقات والروابط
    attachments JSON,
    linked_tasks JSON, -- مهام مرتبطة
    linked_correspondence_id VARCHAR(36),
    external_references JSON,
    
    -- ملاحظات ومتابعة
    notes TEXT,
    internal_notes TEXT, -- ملاحظات داخلية
    completion_notes TEXT,
    rejection_reason TEXT,
    
    -- المتطلبات والمهارات
    required_skills JSON,
    required_equipment JSON,
    prerequisites JSON,
    
    -- التكرار والجدولة
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSON,
    parent_task_id VARCHAR(36),
    
    -- بيانات النظام
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_correspondence_id) REFERENCES correspondence_incoming(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- الفهارس الأساسية
    INDEX idx_tasks_title (title),
    INDEX idx_tasks_priority (priority),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_complexity (complexity),
    INDEX idx_tasks_type (task_type),
    INDEX idx_tasks_department (department_id),
    INDEX idx_tasks_division (division_id),
    INDEX idx_tasks_created_by (created_by),
    INDEX idx_tasks_approved_by (approved_by),
    INDEX idx_tasks_dates (planned_start_date, planned_end_date),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_progress (progress_percentage),
    INDEX idx_tasks_points (total_points),
    INDEX idx_tasks_quality (quality_score),
    
    -- فهارس مركبة للاستعلامات المعقدة
    INDEX idx_tasks_status_priority (status, priority),
    INDEX idx_tasks_dept_status (department_id, status),
    INDEX idx_tasks_div_status (division_id, status),
    INDEX idx_tasks_created_status (created_by, status),
    INDEX idx_tasks_date_status (due_date, status),
    
    -- قيود التحقق
    CONSTRAINT chk_tasks_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_tasks_quality CHECK (quality_score >= 0.00 AND quality_score <= 5.00),
    CONSTRAINT chk_tasks_points CHECK (points >= 0 AND bonus_points >= -1000),
    CONSTRAINT chk_tasks_hours CHECK (estimated_hours >= 0 AND actual_hours >= 0),
    CONSTRAINT chk_tasks_cost CHECK (estimated_cost >= 0 AND actual_cost >= 0),
    CONSTRAINT chk_tasks_dates CHECK (planned_end_date >= planned_start_date)
);

-- ===================================================================
-- جداول المراسلات المطورة والشاملة
-- ===================================================================

-- جدول المراسلات الواردة المحسن
CREATE TABLE correspondence_incoming (
    id VARCHAR(36) PRIMARY KEY,
    
    -- المعلومات الأساسية
    number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    received_date DATE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    summary TEXT,
    body_content LONGTEXT,
    
    -- معلومات المرسل التفصيلية
    sender_name VARCHAR(255) NOT NULL,
    sender_organization VARCHAR(255),
    sender_type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'سفارة', 'منظمة دولية') DEFAULT 'جهة حكومية',
    sender_contact JSON, -- {email, phone, address, website}
    sender_reference VARCHAR(100), -- رقم المرسل المرجعي
    
    -- التصنيف والأولوية
    confidentiality ENUM('عادي', 'سري', 'سري جداً', 'سري للغاية') DEFAULT 'عادي',
    urgency ENUM('عادي', 'عاجل', 'فوري', 'طارئ') DEFAULT 'عادي',
    category VARCHAR(100),
    keywords JSON,
    language ENUM('عربي', 'إنجليزي', 'فرنسي', 'أخرى') DEFAULT 'عربي',
    
    -- طريقة الاستلام والمعالجة
    received_via ENUM('يدوي', 'إيميل', 'بوابة', 'فاكس', 'بريد', 'مراسل', 'تليفون') DEFAULT 'يدوي',
    received_by VARCHAR(36),
    registered_by VARCHAR(36) NOT NULL,
    
    -- التوزيع والمسؤولية
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    assigned_to VARCHAR(36),
    current_handler VARCHAR(36),
    
    -- المواعيد والتوقيتات
    due_date DATE,
    response_due_date DATE,
    reminder_date DATE,
    
    -- الحالة والمعالجة
    status ENUM('مسجل', 'قيد المراجعة', 'محال', 'قيد المعالجة', 'بانتظار الرد', 'مغلق', 'مؤرشف') DEFAULT 'مسجل',
    processing_status ENUM('لم تبدأ', 'جارية', 'معلقة', 'مكتملة') DEFAULT 'لم تبدأ',
    response_required BOOLEAN DEFAULT FALSE,
    response_sent BOOLEAN DEFAULT FALSE,
    response_date DATE,
    
    -- الروابط والعلاقات
    linked_task_id VARCHAR(36),
    linked_outgoing_id VARCHAR(36), -- رد صادر
    parent_correspondence_id VARCHAR(36), -- مراسلة أصلية
    related_correspondences JSON, -- مراسلات ذات صلة
    
    -- المرفقات والوثائق
    attachments_count INT DEFAULT 0,
    attachments_total_size BIGINT DEFAULT 0,
    has_confidential_attachments BOOLEAN DEFAULT FALSE,
    
    -- العلامات والتصنيف
    tags JSON,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSON,
    priority_score INT DEFAULT 0,
    
    -- ملاحظات ومتابعة
    notes TEXT,
    internal_notes TEXT,
    processing_notes TEXT,
    closure_notes TEXT,
    
    -- بيانات النظام والتتبع
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (current_handler) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (registered_by) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (linked_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_outgoing_id) REFERENCES correspondence_outgoing(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_correspondence_id) REFERENCES correspondence_incoming(id) ON DELETE SET NULL,
    
    -- الفهارس الأساسية
    INDEX idx_incoming_number (number),
    INDEX idx_incoming_date (date),
    INDEX idx_incoming_received_date (received_date),
    INDEX idx_incoming_sender (sender_name),
    INDEX idx_incoming_organization (sender_organization),
    INDEX idx_incoming_subject (subject),
    INDEX idx_incoming_confidentiality (confidentiality),
    INDEX idx_incoming_urgency (urgency),
    INDEX idx_incoming_category (category),
    INDEX idx_incoming_status (status),
    INDEX idx_incoming_processing_status (processing_status),
    INDEX idx_incoming_department (department_id),
    INDEX idx_incoming_division (division_id),
    INDEX idx_incoming_assigned (assigned_to),
    INDEX idx_incoming_handler (current_handler),
    INDEX idx_incoming_due_date (due_date),
    INDEX idx_incoming_response_due (response_due_date),
    
    -- فهارس مركبة للاستعلامات المعقدة
    INDEX idx_incoming_dept_status (department_id, status),
    INDEX idx_incoming_urgency_status (urgency, status),
    INDEX idx_incoming_conf_urgency (confidentiality, urgency),
    INDEX idx_incoming_date_status (date, status),
    INDEX idx_incoming_assigned_status (assigned_to, status),
    
    -- فهارس النص الكامل للبحث
    FULLTEXT idx_incoming_search (subject, summary, sender_name, sender_organization),
    
    -- قيود التحقق
    CONSTRAINT chk_incoming_dates CHECK (received_date >= date),
    CONSTRAINT chk_incoming_due_dates CHECK (due_date >= date),
    CONSTRAINT chk_incoming_priority_score CHECK (priority_score >= 0 AND priority_score <= 100)
);

-- جدول المراسلات الصادرة المحسن
CREATE TABLE correspondence_outgoing (
    id VARCHAR(36) PRIMARY KEY,
    
    -- المعلومات الأساسية
    number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    summary TEXT,
    body_content LONGTEXT,
    
    -- معلومات المستلم التفصيلية
    recipient_name VARCHAR(255) NOT NULL,
    recipient_organization VARCHAR(255),
    recipient_type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'سفارة', 'منظمة دولية') DEFAULT 'جهة حكومية',
    recipient_contact JSON,
    recipient_reference VARCHAR(100),
    
    -- التصنيف والأولوية
    confidentiality ENUM('عادي', 'سري', 'سري جداً', 'سري للغاية') DEFAULT 'عادي',
    urgency ENUM('عادي', 'عاجل', 'فوري', 'طارئ') DEFAULT 'عادي',
    category VARCHAR(100),
    keywords JSON,
    language ENUM('عربي', 'إنجليزي', 'فرنسي', 'أخرى') DEFAULT 'عربي',
    
    -- الإعداد والموافقة
    department_id VARCHAR(36),
    division_id VARCHAR(36),
    prepared_by VARCHAR(36),
    reviewed_by VARCHAR(36),
    approved_by VARCHAR(36),
    signed_by VARCHAR(36),
    
    -- سير العمل والموافقة
    workflow_stage ENUM('إعداد', 'مراجعة', 'موافقة', 'توقيع', 'إصدار') DEFAULT 'إعداد',
    approval_workflow JSON,
    approval_history JSON,
    
    -- التسليم والمتابعة
    delivery_channel ENUM('بريد', 'مراسل', 'إيميل', 'بوابة', 'فاكس', 'يد بيد') DEFAULT 'بريد',
    delivery_status ENUM('معد', 'مجدول', 'مرسل', 'مستلم', 'مرفوض', 'مفقود') DEFAULT 'معد',
    scheduled_delivery_date DATE,
    actual_delivery_date DATE,
    delivery_confirmation VARCHAR(255),
    tracking_number VARCHAR(100),
    
    -- الحالة العامة
    status ENUM('مسودة', 'قيد المراجعة', 'بانتظار الموافقة', 'معتمد', 'صادر', 'مؤرشف') DEFAULT 'مسودة',
    
    -- الروابط والعلاقات
    linked_task_id VARCHAR(36),
    linked_incoming_id VARCHAR(36), -- رد على وارد
    parent_correspondence_id VARCHAR(36),
    related_correspondences JSON,
    
    -- المرفقات
    attachments_count INT DEFAULT 0,
    attachments_total_size BIGINT DEFAULT 0,
    has_confidential_attachments BOOLEAN DEFAULT FALSE,
    
    -- العلامات والتصنيف
    tags JSON,
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(100),
    priority_score INT DEFAULT 0,
    
    -- ملاحظات
    notes TEXT,
    internal_notes TEXT,
    delivery_notes TEXT,
    
    -- بيانات النظام
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    FOREIGN KEY (prepared_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (signed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_incoming_id) REFERENCES correspondence_incoming(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_correspondence_id) REFERENCES correspondence_outgoing(id) ON DELETE SET NULL,
    
    -- الفهارس الشاملة
    INDEX idx_outgoing_number (number),
    INDEX idx_outgoing_date (date),
    INDEX idx_outgoing_recipient (recipient_name),
    INDEX idx_outgoing_organization (recipient_organization),
    INDEX idx_outgoing_subject (subject),
    INDEX idx_outgoing_confidentiality (confidentiality),
    INDEX idx_outgoing_urgency (urgency),
    INDEX idx_outgoing_category (category),
    INDEX idx_outgoing_status (status),
    INDEX idx_outgoing_workflow_stage (workflow_stage),
    INDEX idx_outgoing_delivery_status (delivery_status),
    INDEX idx_outgoing_department (department_id),
    INDEX idx_outgoing_division (division_id),
    INDEX idx_outgoing_prepared_by (prepared_by),
    INDEX idx_outgoing_approved_by (approved_by),
    INDEX idx_outgoing_delivery_date (actual_delivery_date),
    
    -- فهارس مركبة
    INDEX idx_outgoing_dept_status (department_id, status),
    INDEX idx_outgoing_urgency_status (urgency, status),
    INDEX idx_outgoing_workflow_dept (workflow_stage, department_id),
    INDEX idx_outgoing_delivery_channel (delivery_channel, delivery_status),
    
    -- فهارس النص الكامل
    FULLTEXT idx_outgoing_search (subject, summary, recipient_name, recipient_organization),
    
    -- قيود التحقق
    CONSTRAINT chk_outgoing_delivery_dates CHECK (actual_delivery_date >= date),
    CONSTRAINT chk_outgoing_priority_score CHECK (priority_score >= 0 AND priority_score <= 100)
);

-- ===================================================================
-- جداول المرفقات والوثائق
-- ===================================================================

CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات الملف
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10),
    
    -- التصنيف والأمان
    file_category ENUM('وثيقة', 'صورة', 'فيديو', 'صوت', 'أرشيف', 'أخرى') DEFAULT 'وثيقة',
    confidentiality ENUM('عادي', 'سري', 'سري جداً') DEFAULT 'عادي',
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_key VARCHAR(255),
    
    -- الربط بالوحدات
    module_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee', 'department') NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    
    -- التحقق والسلامة
    file_hash VARCHAR(64) NOT NULL, -- SHA-256
    checksum VARCHAR(32), -- MD5
    virus_scanned BOOLEAN DEFAULT FALSE,
    scan_result ENUM('نظيف', 'مصاب', 'مشبوه', 'غير مفحوص') DEFAULT 'غير مفحوص',
    
    -- الوصول والتحميل
    download_count INT DEFAULT 0,
    last_accessed TIMESTAMP NULL,
    access_log JSON,
    
    -- بيانات النظام
    uploaded_by VARCHAR(36) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- الفهارس
    INDEX idx_attachments_module (module_type, module_id),
    INDEX idx_attachments_uploader (uploaded_by),
    INDEX idx_attachments_type (file_category),
    INDEX idx_attachments_confidentiality (confidentiality),
    INDEX idx_attachments_size (file_size),
    INDEX idx_attachments_uploaded (uploaded_at),
    INDEX idx_attachments_hash (file_hash),
    
    -- قيود التحقق
    CONSTRAINT chk_attachments_size CHECK (file_size > 0),
    CONSTRAINT chk_attachments_downloads CHECK (download_count >= 0)
);

-- ===================================================================
-- جداول النقاط والتقييمات المتقدمة
-- ===================================================================

CREATE TABLE employee_points (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات النقاط
    employee_id VARCHAR(36) NOT NULL,
    points_change INT NOT NULL, -- موجب أو سالب
    points_type ENUM('أساسي', 'مكافأة', 'خصم', 'تعديل') DEFAULT 'أساسي',
    
    -- سبب النقاط
    reason ENUM(
        'task_completion', 'task_early_completion', 'task_quality', 'task_delay', 
        'correspondence_handling', 'correspondence_speed', 'initiative', 
        'teamwork', 'leadership', 'innovation', 'training_completion',
        'performance_bonus', 'attendance_bonus', 'penalty', 'manual_adjustment'
    ) NOT NULL,
    
    -- الكيان المرتبط
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'evaluation', 'training') NULL,
    related_entity_id VARCHAR(36) NULL,
    
    -- التفاصيل والوصف
    description TEXT,
    calculation_details JSON, -- تفاصيل حساب النقاط
    
    -- الموافقة والاعتماد
    awarded_by VARCHAR(36),
    approved_by VARCHAR(36),
    approval_date DATE,
    is_approved BOOLEAN DEFAULT TRUE,
    
    -- التوقيت والصلاحية
    effective_date DATE NOT NULL,
    expiry_date DATE, -- للنقاط المؤقتة
    is_active BOOLEAN DEFAULT TRUE,
    
    -- بيانات النظام
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- الفهارس
    INDEX idx_points_employee (employee_id),
    INDEX idx_points_reason (reason),
    INDEX idx_points_type (points_type),
    INDEX idx_points_date (effective_date),
    INDEX idx_points_awarded_by (awarded_by),
    INDEX idx_points_entity (related_entity_type, related_entity_id),
    INDEX idx_points_active (is_active),
    
    -- فهارس مركبة
    INDEX idx_points_emp_date (employee_id, effective_date),
    INDEX idx_points_emp_reason (employee_id, reason),
    
    -- قيود التحقق
    CONSTRAINT chk_points_change CHECK (points_change BETWEEN -1000 AND 1000),
    CONSTRAINT chk_points_dates CHECK (expiry_date IS NULL OR expiry_date >= effective_date)
);

-- ===================================================================
-- جداول السجلات والتدقيق الشاملة
-- ===================================================================

CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات النشاط
    module ENUM(
        'employees', 'departments', 'divisions', 'tasks', 
        'correspondence_incoming', 'correspondence_outgoing', 
        'attachments', 'points', 'settings', 'system', 'reports'
    ) NOT NULL,
    
    operation ENUM(
        'create', 'read', 'update', 'delete', 'restore',
        'export', 'import', 'print', 'email', 'download',
        'route', 'approve', 'reject', 'assign', 'transfer',
        'login', 'logout', 'password_change', 'permission_change'
    ) NOT NULL,
    
    -- الكيان المتأثر
    entity_id VARCHAR(36),
    entity_name VARCHAR(255),
    
    -- معلومات المستخدم
    actor_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100),
    actor_department VARCHAR(255),
    
    -- تفاصيل العملية
    description TEXT,
    before_data JSON, -- البيانات قبل التغيير
    after_data JSON,  -- البيانات بعد التغيير
    changes_summary JSON, -- ملخص التغييرات
    
    -- معلومات الجلسة
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser_info JSON,
    
    -- النتيجة والحالة
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time_ms INT,
    
    -- التصنيف والأهمية
    severity ENUM('منخفض', 'متوسط', 'عالي', 'حرج') DEFAULT 'متوسط',
    category VARCHAR(100),
    tags JSON,
    
    -- التوقيت
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (actor_id) REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- الفهارس الشاملة
    INDEX idx_activity_module (module),
    INDEX idx_activity_operation (operation),
    INDEX idx_activity_entity (entity_id),
    INDEX idx_activity_actor (actor_id),
    INDEX idx_activity_timestamp (timestamp),
    INDEX idx_activity_success (success),
    INDEX idx_activity_severity (severity),
    INDEX idx_activity_ip (ip_address),
    
    -- فهارس مركبة
    INDEX idx_activity_module_operation (module, operation),
    INDEX idx_activity_actor_timestamp (actor_id, timestamp),
    INDEX idx_activity_module_timestamp (module, timestamp),
    INDEX idx_activity_success_timestamp (success, timestamp),
    
    -- فهارس النص الكامل
    FULLTEXT idx_activity_search (description, entity_name, actor_name)
);

-- ===================================================================
-- جداول الإشعارات والتنبيهات المتقدمة
-- ===================================================================

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    
    -- نوع وتصنيف الإشعار
    type ENUM(
        'task_assigned', 'task_completed', 'task_overdue', 'task_reminder',
        'correspondence_received', 'correspondence_urgent', 'correspondence_due',
        'employee_birthday', 'employee_anniversary', 'employee_evaluation',
        'system_maintenance', 'system_update', 'security_alert',
        'backup_completed', 'backup_failed', 'report_ready'
    ) NOT NULL,
    
    category ENUM('مهام', 'مراسلات', 'موظفين', 'نظام', 'أمان', 'تقارير') NOT NULL,
    priority ENUM('منخفض', 'متوسط', 'عالي', 'حرج') DEFAULT 'متوسط',
    
    -- المحتوى
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_text VARCHAR(100), -- نص زر الإجراء
    action_url VARCHAR(500),  -- رابط الإجراء
    
    -- المستهدفون
    target_user_id VARCHAR(36),
    target_department_id VARCHAR(36),
    target_division_id VARCHAR(36),
    target_role VARCHAR(100),
    is_broadcast BOOLEAN DEFAULT FALSE,
    
    -- الكيان المرتبط
    related_entity_type ENUM('task', 'correspondence_incoming', 'correspondence_outgoing', 'employee', 'system') NULL,
    related_entity_id VARCHAR(36) NULL,
    
    -- الحالة والتتبع
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP NULL,
    
    -- التوقيت والانتهاء
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- قنوات التسليم
    channels JSON, -- ['browser', 'email', 'sms', 'push']
    delivery_status JSON, -- حالة التسليم لكل قناة
    
    -- بيانات النظام
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (target_user_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (target_department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (target_division_id) REFERENCES divisions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- الفهارس
    INDEX idx_notifications_target_user (target_user_id),
    INDEX idx_notifications_target_dept (target_department_id),
    INDEX idx_notifications_target_div (target_division_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_category (category),
    INDEX idx_notifications_priority (priority),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_dismissed (is_dismissed),
    INDEX idx_notifications_scheduled (scheduled_at),
    INDEX idx_notifications_expires (expires_at),
    INDEX idx_notifications_entity (related_entity_type, related_entity_id),
    
    -- فهارس مركبة
    INDEX idx_notifications_user_read (target_user_id, is_read),
    INDEX idx_notifications_user_type (target_user_id, type),
    INDEX idx_notifications_priority_read (priority, is_read),
    
    -- قيود التحقق
    CONSTRAINT chk_notifications_dates CHECK (expires_at IS NULL OR expires_at >= created_at)
);

-- ===================================================================
-- جداول الإعدادات والتخصيص المتقدمة
-- ===================================================================

CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY,
    
    -- مفتاح الإعداد
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_name VARCHAR(255) NOT NULL,
    setting_name_en VARCHAR(255),
    
    -- القيمة والنوع
    setting_value JSON NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'file', 'color', 'date') DEFAULT 'string',
    default_value JSON,
    
    -- التصنيف والتنظيم
    category ENUM(
        'general', 'appearance', 'notifications', 'security', 'backup', 
        'correspondence', 'tasks', 'employees', 'reports', 'integration'
    ) DEFAULT 'general',
    subcategory VARCHAR(100),
    
    -- الوصف والمساعدة
    description TEXT,
    description_en TEXT,
    help_text TEXT,
    validation_rules JSON,
    
    -- الصلاحيات والعرض
    is_public BOOLEAN DEFAULT FALSE, -- يمكن للمستخدمين العاديين رؤيتها
    is_editable BOOLEAN DEFAULT TRUE,
    requires_restart BOOLEAN DEFAULT FALSE,
    show_in_ui BOOLEAN DEFAULT TRUE,
    
    -- التجميع والترتيب
    group_name VARCHAR(100),
    sort_order INT DEFAULT 0,
    
    -- التتبع والتدقيق
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    change_history JSON,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- الفهارس
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_category (category),
    INDEX idx_settings_subcategory (subcategory),
    INDEX idx_settings_public (is_public),
    INDEX idx_settings_editable (is_editable),
    INDEX idx_settings_group (group_name),
    INDEX idx_settings_sort (sort_order),
    
    -- فهارس مركبة
    INDEX idx_settings_cat_sort (category, sort_order),
    INDEX idx_settings_group_sort (group_name, sort_order)
);

-- ===================================================================
-- جداول النسخ الاحتياطي والأرشفة
-- ===================================================================

CREATE TABLE backups (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات النسخة الاحتياطية
    backup_name VARCHAR(255) NOT NULL,
    backup_type ENUM('full', 'incremental', 'differential', 'partial') DEFAULT 'full',
    backup_scope ENUM('all', 'data_only', 'structure_only', 'settings_only') DEFAULT 'all',
    
    -- الملفات والمسارات
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    compressed_size BIGINT,
    file_hash VARCHAR(64),
    compression_ratio DECIMAL(5,2),
    
    -- المحتوى والتفاصيل
    includes_attachments BOOLEAN DEFAULT TRUE,
    includes_logs BOOLEAN DEFAULT FALSE,
    table_list JSON, -- قائمة الجداول المشمولة
    record_counts JSON, -- عدد السجلات لكل جدول
    
    -- الحالة والنتيجة
    backup_status ENUM('مجدول', 'جاري', 'مكتمل', 'فاشل', 'ملغي') DEFAULT 'مجدول',
    progress_percentage INT DEFAULT 0,
    error_message TEXT,
    warning_messages JSON,
    
    -- التوقيت
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INT,
    
    -- الأمان والتشفير
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_algorithm VARCHAR(50),
    encryption_key_id VARCHAR(100),
    
    -- التحقق والاستعادة
    verification_status ENUM('غير مفحوص', 'صحيح', 'تالف', 'جزئي') DEFAULT 'غير مفحوص',
    last_verification_date TIMESTAMP,
    restore_tested BOOLEAN DEFAULT FALSE,
    restore_test_date TIMESTAMP,
    
    -- الاحتفاظ والأرشفة
    retention_policy VARCHAR(100),
    auto_delete_date DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    archive_location VARCHAR(500),
    
    -- بيانات النظام
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- الفهارس
    INDEX idx_backups_name (backup_name),
    INDEX idx_backups_type (backup_type),
    INDEX idx_backups_status (backup_status),
    INDEX idx_backups_created (created_at),
    INDEX idx_backups_completed (completed_at),
    INDEX idx_backups_size (file_size),
    INDEX idx_backups_verification (verification_status),
    INDEX idx_backups_retention (auto_delete_date),
    
    -- فهارس مركبة
    INDEX idx_backups_type_status (backup_type, backup_status),
    INDEX idx_backups_date_status (created_at, backup_status),
    
    -- قيود التحقق
    CONSTRAINT chk_backups_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_backups_duration CHECK (duration_seconds >= 0),
    CONSTRAINT chk_backups_sizes CHECK (file_size >= 0 AND compressed_size >= 0)
);

-- ===================================================================
-- جداول التقارير والإحصائيات
-- ===================================================================

CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات التقرير
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type ENUM('المهام', 'المراسلات', 'الموظفين', 'الأداء', 'الإدارات', 'مخصص') NOT NULL,
    template_id VARCHAR(36),
    
    -- المعايير والفلاتر
    date_range_start DATE,
    date_range_end DATE,
    filters JSON,
    parameters JSON,
    
    -- البيانات والنتائج
    data_snapshot JSON,
    statistics JSON,
    charts_data JSON,
    
    -- التنسيق والعرض
    format ENUM('pdf', 'excel', 'word', 'html', 'json') DEFAULT 'pdf',
    layout_template VARCHAR(100),
    include_charts BOOLEAN DEFAULT TRUE,
    include_raw_data BOOLEAN DEFAULT FALSE,
    
    -- الملف المولد
    file_path VARCHAR(500),
    file_size BIGINT,
    file_hash VARCHAR(64),
    
    -- الحالة والتوليد
    generation_status ENUM('مجدول', 'جاري', 'مكتمل', 'فاشل') DEFAULT 'مجدول',
    generation_progress INT DEFAULT 0,
    error_details TEXT,
    
    -- الوصول والمشاركة
    is_public BOOLEAN DEFAULT FALSE,
    shared_with JSON, -- قائمة المستخدمين المشارك معهم
    access_count INT DEFAULT 0,
    last_accessed TIMESTAMP,
    
    -- الجدولة والتكرار
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_pattern JSON,
    next_generation_date TIMESTAMP,
    
    -- بيانات النظام
    generated_by VARCHAR(36) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (generated_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- الفهارس
    INDEX idx_reports_title (title),
    INDEX idx_reports_type (report_type),
    INDEX idx_reports_status (generation_status),
    INDEX idx_reports_generated_by (generated_by),
    INDEX idx_reports_generated_at (generated_at),
    INDEX idx_reports_date_range (date_range_start, date_range_end),
    INDEX idx_reports_scheduled (is_scheduled),
    INDEX idx_reports_public (is_public),
    
    -- فهارس مركبة
    INDEX idx_reports_type_status (report_type, generation_status),
    INDEX idx_reports_user_type (generated_by, report_type),
    
    -- قيود التحقق
    CONSTRAINT chk_reports_date_range CHECK (date_range_end >= date_range_start),
    CONSTRAINT chk_reports_progress CHECK (generation_progress >= 0 AND generation_progress <= 100),
    CONSTRAINT chk_reports_access_count CHECK (access_count >= 0)
);

-- ===================================================================
-- جداول قاموس البيانات والمراجع
-- ===================================================================

-- قاموس الجهات للمراسلات المتكررة
CREATE TABLE correspondents (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات الجهة
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    organization VARCHAR(255),
    organization_en VARCHAR(255),
    type ENUM('فرد', 'جهة حكومية', 'شركة', 'منظمة', 'سفارة', 'منظمة دولية') DEFAULT 'جهة حكومية',
    
    -- معلومات الاتصال
    contact_info JSON, -- {email, phone, fax, website, address}
    primary_contact_person VARCHAR(255),
    secondary_contact_person VARCHAR(255),
    
    -- التصنيف والعلاقة
    relationship_type ENUM('شريك', 'مورد', 'عميل', 'جهة رقابية', 'جهة تنسيق', 'أخرى') DEFAULT 'أخرى',
    importance_level ENUM('عالي', 'متوسط', 'منخفض') DEFAULT 'متوسط',
    
    -- الإحصائيات
    correspondence_count INT DEFAULT 0,
    last_correspondence_date DATE,
    average_response_time_days INT DEFAULT 0,
    
    -- الحالة والملاحظات
    is_active BOOLEAN DEFAULT TRUE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    internal_notes TEXT,
    
    -- بيانات النظام
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- الفهارس
    INDEX idx_correspondents_name (name),
    INDEX idx_correspondents_organization (organization),
    INDEX idx_correspondents_type (type),
    INDEX idx_correspondents_relationship (relationship_type),
    INDEX idx_correspondents_importance (importance_level),
    INDEX idx_correspondents_active (is_active),
    INDEX idx_correspondents_last_contact (last_correspondence_date),
    
    -- فهارس النص الكامل
    FULLTEXT idx_correspondents_search (name, organization, primary_contact_person)
);

-- ===================================================================
-- جداول المشاريع والمبادرات (إضافة مستقبلية)
-- ===================================================================

CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات المشروع
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    objectives TEXT,
    
    -- التصنيف والنوع
    project_type ENUM('تطوير', 'صيانة', 'بحث', 'تدريب', 'استراتيجي') DEFAULT 'تطوير',
    priority ENUM('منخفض', 'متوسط', 'عالي', 'استراتيجي') DEFAULT 'متوسط',
    complexity ENUM('بسيط', 'متوسط', 'معقد', 'معقد جداً') DEFAULT 'متوسط',
    
    -- التوقيتات
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- الموارد والميزانية
    budget DECIMAL(15,2) DEFAULT 0.00,
    actual_cost DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'EGP',
    
    -- الفريق والمسؤوليات
    project_manager_id VARCHAR(36),
    sponsor_id VARCHAR(36),
    team_members JSON,
    stakeholders JSON,
    
    -- الحالة والتقدم
    status ENUM('مخطط', 'معتمد', 'جاري', 'معلق', 'مكتمل', 'ملغي') DEFAULT 'مخطط',
    progress_percentage INT DEFAULT 0,
    health_status ENUM('أخضر', 'أصفر', 'أحمر') DEFAULT 'أخضر',
    
    -- المخاطر والقضايا
    risks JSON,
    issues JSON,
    lessons_learned TEXT,
    
    -- بيانات النظام
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (project_manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (sponsor_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- الفهارس
    INDEX idx_projects_name (name),
    INDEX idx_projects_type (project_type),
    INDEX idx_projects_priority (priority),
    INDEX idx_projects_status (status),
    INDEX idx_projects_manager (project_manager_id),
    INDEX idx_projects_dates (planned_start_date, planned_end_date),
    INDEX idx_projects_progress (progress_percentage),
    INDEX idx_projects_health (health_status),
    
    -- قيود التحقق
    CONSTRAINT chk_projects_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_projects_budget CHECK (budget >= 0 AND actual_cost >= 0),
    CONSTRAINT chk_projects_dates CHECK (planned_end_date >= planned_start_date)
);

-- ===================================================================
-- جداول التدريب والتطوير
-- ===================================================================

CREATE TABLE trainings (
    id VARCHAR(36) PRIMARY KEY,
    
    -- معلومات التدريب
    title VARCHAR(255) NOT NULL,
    description TEXT,
    training_type ENUM('داخلي', 'خارجي', 'أونلاين', 'ورشة عمل', 'مؤتمر') DEFAULT 'داخلي',
    category VARCHAR(100),
    
    -- التوقيت والمدة
    start_date DATE,
    end_date DATE,
    duration_hours INT,
    schedule JSON, -- جدول التدريب التفصيلي
    
    -- المكان والموارد
    location VARCHAR(255),
    trainer_name VARCHAR(255),
    trainer_organization VARCHAR(255),
    cost DECIMAL(10,2) DEFAULT 0.00,
    
    -- المشاركون
    max_participants INT,
    enrolled_participants JSON,
    completed_participants JSON,
    
    -- التقييم والنتائج
    evaluation_scores JSON,
    certificates_issued INT DEFAULT 0,
    feedback JSON,
    
    -- الحالة
    status ENUM('مخطط', 'مفتوح للتسجيل', 'جاري', 'مكتمل', 'ملغي') DEFAULT 'مخطط',
    
    -- بيانات النظام
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- المفاتيح الخارجية
    FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- الفهارس
    INDEX idx_trainings_title (title),
    INDEX idx_trainings_type (training_type),
    INDEX idx_trainings_category (category),
    INDEX idx_trainings_status (status),
    INDEX idx_trainings_dates (start_date, end_date),
    INDEX idx_trainings_trainer (trainer_name),
    
    -- قيود التحقق
    CONSTRAINT chk_trainings_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_trainings_duration CHECK (duration_hours > 0),
    CONSTRAINT chk_trainings_participants CHECK (max_participants > 0),
    CONSTRAINT chk_trainings_cost CHECK (cost >= 0)
);

-- ===================================================================
-- إضافة المفاتيح الخارجية المتبقية
-- ===================================================================

-- ربط رؤساء الإدارات والأقسام
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_head 
FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE departments 
ADD CONSTRAINT fk_departments_deputy 
FOREIGN KEY (deputy_head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE divisions 
ADD CONSTRAINT fk_divisions_head 
FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE divisions 
ADD CONSTRAINT fk_divisions_deputy 
FOREIGN KEY (deputy_head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ===================================================================
-- إنشاء المشاهد (Views) للاستعلامات الشائعة
-- ===================================================================

-- مشهد إحصائيات المهام
CREATE VIEW task_statistics AS
SELECT 
    t.department_id,
    d.name as department_name,
    t.status,
    COUNT(*) as task_count,
    AVG(t.total_points) as avg_points,
    AVG(t.progress_percentage) as avg_progress,
    SUM(CASE WHEN t.actual_end_date <= t.planned_end_date THEN 1 ELSE 0 END) as on_time_count,
    AVG(DATEDIFF(COALESCE(t.actual_end_date, CURDATE()), t.planned_start_date)) as avg_duration_days
FROM tasks t
LEFT JOIN departments d ON t.department_id = d.id
WHERE t.deleted_at IS NULL
GROUP BY t.department_id, d.name, t.status;

-- مشهد إحصائيات الموظفين
CREATE VIEW employee_statistics AS
SELECT 
    e.department_id,
    d.name as department_name,
    e.status,
    COUNT(*) as employee_count,
    AVG(e.points) as avg_points,
    AVG(e.rating) as avg_rating,
    SUM(e.basic_salary + e.allowances) as total_salary_cost
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
WHERE e.deleted_at IS NULL
GROUP BY e.department_id, d.name, e.status;

-- مشهد إحصائيات المراسلات
CREATE VIEW correspondence_statistics AS
SELECT 
    'incoming' as type,
    ci.department_id,
    d.name as department_name,
    ci.status,
    ci.urgency,
    ci.confidentiality,
    COUNT(*) as correspondence_count,
    AVG(DATEDIFF(COALESCE(ci.response_date, CURDATE()), ci.date)) as avg_response_days
FROM correspondence_incoming ci
LEFT JOIN departments d ON ci.department_id = d.id
WHERE ci.deleted_at IS NULL
GROUP BY ci.department_id, d.name, ci.status, ci.urgency, ci.confidentiality

UNION ALL

SELECT 
    'outgoing' as type,
    co.department_id,
    d.name as department_name,
    co.status,
    co.urgency,
    co.confidentiality,
    COUNT(*) as correspondence_count,
    AVG(DATEDIFF(COALESCE(co.actual_delivery_date, CURDATE()), co.date)) as avg_delivery_days
FROM correspondence_outgoing co
LEFT JOIN departments d ON co.department_id = d.id
WHERE co.deleted_at IS NULL
GROUP BY co.department_id, d.name, co.status, co.urgency, co.confidentiality;

-- ===================================================================
-- إنشاء المحفزات (Triggers) للتحديث التلقائي
-- ===================================================================

-- محفز تحديث عدد الموظفين في الإدارة
DELIMITER //
CREATE TRIGGER update_department_employee_count
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    UPDATE departments 
    SET employee_count = (
        SELECT COUNT(*) 
        FROM employees 
        WHERE department_id = NEW.department_id 
        AND deleted_at IS NULL
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
            SELECT COUNT(*) 
            FROM employees 
            WHERE department_id = OLD.department_id 
            AND deleted_at IS NULL
        )
        WHERE id = OLD.department_id;
    END IF;
    
    -- تحديث الإدارة الجديدة
    IF NEW.department_id IS NOT NULL THEN
        UPDATE departments 
        SET employee_count = (
            SELECT COUNT(*) 
            FROM employees 
            WHERE department_id = NEW.department_id 
            AND deleted_at IS NULL
        )
        WHERE id = NEW.department_id;
    END IF;
END//

-- محفز تحديث نقاط الموظف
CREATE TRIGGER update_employee_points
AFTER INSERT ON employee_points
FOR EACH ROW
BEGIN
    UPDATE employees 
    SET points = (
        SELECT COALESCE(SUM(points_change), 0)
        FROM employee_points 
        WHERE employee_id = NEW.employee_id 
        AND is_active = TRUE
        AND (expiry_date IS NULL OR expiry_date >= CURDATE())
    )
    WHERE id = NEW.employee_id;
END//

DELIMITER ;

-- ===================================================================
-- إنشاء الإجراءات المخزنة (Stored Procedures)
-- ===================================================================

DELIMITER //

-- إجراء حساب إحصائيات الأداء
CREATE PROCEDURE CalculatePerformanceStats(
    IN dept_id VARCHAR(36),
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        'المهام' as metric_type,
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'مكتملة' THEN 1 ELSE 0 END) as completed_count,
        AVG(progress_percentage) as avg_progress,
        AVG(total_points) as avg_points
    FROM tasks 
    WHERE department_id = dept_id 
    AND created_at BETWEEN start_date AND end_date
    AND deleted_at IS NULL
    
    UNION ALL
    
    SELECT 
        'المراسلات الواردة' as metric_type,
        COUNT(*) as total_count,
        SUM(CASE WHEN status IN ('مغلق', 'مؤرشف') THEN 1 ELSE 0 END) as completed_count,
        AVG(CASE WHEN response_date IS NOT NULL THEN DATEDIFF(response_date, date) ELSE NULL END) as avg_progress,
        0 as avg_points
    FROM correspondence_incoming 
    WHERE department_id = dept_id 
    AND date BETWEEN start_date AND end_date
    AND deleted_at IS NULL
    
    UNION ALL
    
    SELECT 
        'المراسلات الصادرة' as metric_type,
        COUNT(*) as total_count,
        SUM(CASE WHEN status IN ('صادر', 'مؤرشف') THEN 1 ELSE 0 END) as completed_count,
        AVG(CASE WHEN actual_delivery_date IS NOT NULL THEN DATEDIFF(actual_delivery_date, date) ELSE NULL END) as avg_progress,
        0 as avg_points
    FROM correspondence_outgoing 
    WHERE department_id = dept_id 
    AND date BETWEEN start_date AND end_date
    AND deleted_at IS NULL;
END//

-- إجراء تنظيف البيانات القديمة
CREATE PROCEDURE CleanupOldData(
    IN retention_days INT
)
BEGIN
    DECLARE cutoff_date DATE DEFAULT DATE_SUB(CURDATE(), INTERVAL retention_days DAY);
    
    -- حذف سجلات النشاط القديمة
    DELETE FROM activity_logs 
    WHERE timestamp < cutoff_date 
    AND severity = 'منخفض';
    
    -- حذف الإشعارات القديمة المقروءة
    DELETE FROM notifications 
    WHERE created_at < cutoff_date 
    AND is_read = TRUE 
    AND is_dismissed = TRUE;
    
    -- أرشفة المراسلات القديمة المغلقة
    UPDATE correspondence_incoming 
    SET status = 'مؤرشف' 
    WHERE date < cutoff_date 
    AND status = 'مغلق';
    
    UPDATE correspondence_outgoing 
    SET status = 'مؤرشف' 
    WHERE date < cutoff_date 
    AND status = 'صادر';
    
    -- تقرير التنظيف
    SELECT 
        'تم تنظيف البيانات الأقدم من' as message,
        cutoff_date as cutoff_date,
        ROW_COUNT() as affected_rows;
END//

DELIMITER ;

-- ===================================================================
-- إدراج الإعدادات الافتراضية
-- ===================================================================

INSERT INTO system_settings (id, setting_key, setting_name, setting_value, setting_type, category, description, is_public, sort_order) VALUES
-- الإعدادات العامة
('set-001', 'system_name', 'اسم النظام', '"نظام إدارة مصلحة الري"', 'string', 'general', 'اسم النظام الذي يظهر في الواجهة', TRUE, 1),
('set-002', 'organization_name', 'اسم المؤسسة', '"وزارة الموارد المائية والري - جمهورية مصر العربية"', 'string', 'general', 'اسم المؤسسة الكامل', TRUE, 2),
('set-003', 'system_version', 'إصدار النظام', '"1.0.0"', 'string', 'general', 'رقم إصدار النظام الحالي', TRUE, 3),
('set-004', 'default_language', 'اللغة الافتراضية', '"ar"', 'string', 'general', 'لغة النظام الافتراضية', TRUE, 4),
('set-005', 'timezone', 'المنطقة الزمنية', '"Africa/Cairo"', 'string', 'general', 'المنطقة الزمنية للنظام', TRUE, 5),

-- إعدادات المظهر
('set-010', 'theme', 'السمة', '"فاتح"', 'string', 'appearance', 'سمة النظام (فاتح/داكن)', TRUE, 10),
('set-011', 'primary_color', 'اللون الأساسي', '"#2563eb"', 'color', 'appearance', 'اللون الأساسي للنظام', TRUE, 11),
('set-012', 'secondary_color', 'اللون الثانوي', '"#64748b"', 'color', 'appearance', 'اللون الثانوي للنظام', TRUE, 12),
('set-013', 'font_family', 'نوع الخط', '"Cairo, sans-serif"', 'string', 'appearance', 'نوع الخط المستخدم', TRUE, 13),
('set-014', 'logo_url', 'رابط الشعار', '"/assets/logo.png"', 'file', 'appearance', 'مسار ملف شعار النظام', TRUE, 14),

-- إعدادات الأمان
('set-020', 'session_timeout', 'انتهاء الجلسة', '30', 'number', 'security', 'مدة انتهاء الجلسة بالدقائق', FALSE, 20),
('set-021', 'max_login_attempts', 'محاولات الدخول القصوى', '5', 'number', 'security', 'عدد محاولات تسجيل الدخول المسموحة', FALSE, 21),
('set-022', 'password_min_length', 'الحد الأدنى لطول كلمة المرور', '8', 'number', 'security', 'أقل عدد أحرف لكلمة المرور', FALSE, 22),
('set-023', 'enable_two_factor', 'تفعيل المصادقة الثنائية', 'false', 'boolean', 'security', 'تفعيل المصادقة الثنائية', FALSE, 23),

-- إعدادات النسخ الاحتياطي
('set-030', 'auto_backup_enabled', 'تفعيل النسخ التلقائي', 'true', 'boolean', 'backup', 'تفعيل النسخ الاحتياطي التلقائي', FALSE, 30),
('set-031', 'backup_frequency', 'تكرار النسخ الاحتياطي', '"daily"', 'string', 'backup', 'تكرار إنشاء النسخ الاحتياطية', FALSE, 31),
('set-032', 'backup_retention_days', 'مدة الاحتفاظ بالنسخ', '30', 'number', 'backup', 'عدد الأيام للاحتفاظ بالنسخ الاحتياطية', FALSE, 32),
('set-033', 'backup_compression', 'ضغط النسخ الاحتياطية', 'true', 'boolean', 'backup', 'تفعيل ضغط النسخ الاحتياطية', FALSE, 33),

-- إعدادات الإشعارات
('set-040', 'notifications_enabled', 'تفعيل الإشعارات', 'true', 'boolean', 'notifications', 'تفعيل نظام الإشعارات', TRUE, 40),
('set-041', 'email_notifications', 'إشعارات البريد الإلكتروني', 'true', 'boolean', 'notifications', 'إرسال إشعارات عبر البريد', TRUE, 41),
('set-042', 'browser_notifications', 'إشعارات المتصفح', 'true', 'boolean', 'notifications', 'عرض إشعارات في المتصفح', TRUE, 42),
('set-043', 'notification_retention_days', 'مدة الاحتفاظ بالإشعارات', '90', 'number', 'notifications', 'عدد الأيام للاحتفاظ بالإشعارات', FALSE, 43),

-- إعدادات المهام
('set-050', 'task_auto_points', 'نقاط المهام التلقائية', '{"completion": 10, "early_completion": 15, "delay_penalty": -5, "quality_bonus": 5}', 'json', 'tasks', 'إعدادات نقاط المهام التلقائية', FALSE, 50),
('set-051', 'task_reminder_days', 'تذكير المهام (أيام)', '3', 'number', 'tasks', 'عدد الأيام قبل الموعد لإرسال تذكير', TRUE, 51),
('set-052', 'task_overdue_escalation', 'تصعيد المهام المتأخرة', 'true', 'boolean', 'tasks', 'تصعيد المهام المتأخرة للإدارة العليا', FALSE, 52),

-- إعدادات المراسلات
('set-060', 'correspondence_numbering', 'نظام ترقيم المراسلات', '{"incoming": "IN-{YYYY}-{SEQ}", "outgoing": "OUT-{YYYY}-{SEQ}"}', 'json', 'correspondence', 'نمط ترقيم المراسلات', FALSE, 60),
('set-061', 'correspondence_reminder_days', 'تذكير المراسلات (أيام)', '7', 'number', 'correspondence', 'عدد الأيام قبل الموعد لإرسال تذكير', TRUE, 61),
('set-062', 'auto_archive_days', 'أرشفة تلقائية (أيام)', '365', 'number', 'correspondence', 'عدد الأيام لأرشفة المراسلات المغلقة تلقائياً', FALSE, 62);

-- ===================================================================
-- إنشاء المستخدم الافتراضي للنظام
-- ===================================================================

-- إدراج الإدارة الافتراضية
INSERT INTO departments (id, name, description, code, status) VALUES
('dept-system', 'إدارة تقنية المعلومات', 'الإدارة المسؤولة عن تطوير وصيانة النظم الإلكترونية', 'IT', 'نشط');

-- إدراج القسم الافتراضي
INSERT INTO divisions (id, name, description, code, department_id, status) VALUES
('div-system', 'قسم تطوير النظم', 'القسم المسؤول عن تطوير وبرمجة الأنظمة الإلكترونية', 'DEV', 'dept-system', 'نشط');

-- إدراج المستخدم الافتراضي (مدير النظام)
INSERT INTO employees (
    id, name, employee_number, email, phone, 
    department_id, division_id, position, points, status, 
    permissions, hire_date, created_at
) VALUES (
    'emp-admin-001', 
    'مدير النظام', 
    'ADMIN001', 
    'admin@irrigation.gov.eg', 
    '+201000731116',
    'dept-system', 
    'div-system', 
    'مدير النظم الإلكترونية', 
    1000, 
    'نشط',
    '["admin", "read", "write", "delete", "export", "import", "backup", "settings"]',
    CURDATE(),
    NOW()
);

-- تحديث رئيس الإدارة والقسم
UPDATE departments SET head_employee_id = 'emp-admin-001' WHERE id = 'dept-system';
UPDATE divisions SET head_employee_id = 'emp-admin-001' WHERE id = 'div-system';

-- ===================================================================
-- إنشاء فهارس إضافية للأداء المحسن
-- ===================================================================

-- فهارس للبحث السريع في النصوص العربية
ALTER TABLE tasks ADD FULLTEXT(title, description);
ALTER TABLE employees ADD FULLTEXT(name, position);
ALTER TABLE departments ADD FULLTEXT(name, description);
ALTER TABLE divisions ADD FULLTEXT(name, description);

-- فهارس للتواريخ والأوقات
CREATE INDEX idx_tasks_created_month ON tasks(YEAR(created_at), MONTH(created_at));
CREATE INDEX idx_correspondence_in_month ON correspondence_incoming(YEAR(date), MONTH(date));
CREATE INDEX idx_correspondence_out_month ON correspondence_outgoing(YEAR(date), MONTH(date));
CREATE INDEX idx_activity_logs_hour ON activity_logs(DATE(timestamp), HOUR(timestamp));

-- فهارس للإحصائيات السريعة
CREATE INDEX idx_employees_points_desc ON employees(points DESC);
CREATE INDEX idx_tasks_points_desc ON tasks(total_points DESC);
CREATE INDEX idx_correspondence_urgency_date ON correspondence_incoming(urgency, date DESC);

-- ===================================================================
-- إعداد الأحداث المجدولة (Events) للصيانة التلقائية
-- ===================================================================

-- تفعيل جدولة الأحداث
SET GLOBAL event_scheduler = ON;

-- حدث تنظيف السجلات القديمة (يومياً في منتصف الليل)
CREATE EVENT IF NOT EXISTS cleanup_old_logs
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 00:00:00'
DO
BEGIN
    -- تنظيف سجلات النشاط القديمة (أكثر من سنة)
    DELETE FROM activity_logs 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR)
    AND severity = 'منخفض';
    
    -- تنظيف الإشعارات القديمة المقروءة (أكثر من 3 أشهر)
    DELETE FROM notifications 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)
    AND is_read = TRUE;
    
    -- تحديث إحصائيات الجداول
    ANALYZE TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;
END;

-- حدث تحديث الإحصائيات (كل ساعة)
CREATE EVENT IF NOT EXISTS update_statistics
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    -- تحديث عدد الموظفين في الإدارات
    UPDATE departments d
    SET employee_count = (
        SELECT COUNT(*) 
        FROM employees e 
        WHERE e.department_id = d.id 
        AND e.deleted_at IS NULL
        AND e.status = 'نشط'
    );
    
    -- تحديث عدد الموظفين في الأقسام
    UPDATE divisions dv
    SET employee_count = (
        SELECT COUNT(*) 
        FROM employees e 
        WHERE e.division_id = dv.id 
        AND e.deleted_at IS NULL
        AND e.status = 'نشط'
    );
    
    -- تحديث عدد المراسلات في قاموس الجهات
    UPDATE correspondents c
    SET correspondence_count = (
        SELECT COUNT(*) 
        FROM correspondence_incoming ci 
        WHERE ci.sender_name = c.name 
        AND ci.deleted_at IS NULL
    ) + (
        SELECT COUNT(*) 
        FROM correspondence_outgoing co 
        WHERE co.recipient_name = c.name 
        AND co.deleted_at IS NULL
    );
END;

-- ===================================================================
-- إنشاء مستخدم قاعدة البيانات للتطبيق
-- ===================================================================

-- إنشاء مستخدم التطبيق
CREATE USER IF NOT EXISTS 'irrigation_app'@'localhost' IDENTIFIED BY 'secure_app_password_2024';

-- منح الصلاحيات المطلوبة
GRANT SELECT, INSERT, UPDATE, DELETE ON irrigation_management_system.* TO 'irrigation_app'@'localhost';
GRANT EXECUTE ON irrigation_management_system.* TO 'irrigation_app'@'localhost';

-- إنشاء مستخدم النسخ الاحتياطي
CREATE USER IF NOT EXISTS 'irrigation_backup'@'localhost' IDENTIFIED BY 'secure_backup_password_2024';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON irrigation_management_system.* TO 'irrigation_backup'@'localhost';

-- تطبيق التغييرات
FLUSH PRIVILEGES;

-- ===================================================================
-- تحسين إعدادات MySQL للأداء الأمثل
-- ===================================================================

-- إعدادات الذاكرة
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_log_buffer_size = 67108864; -- 64MB

-- إعدادات الاتصالات
SET GLOBAL max_connections = 200;
SET GLOBAL max_user_connections = 50;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;

-- إعدادات الاستعلامات
SET GLOBAL query_cache_size = 268435456; -- 256MB
SET GLOBAL query_cache_type = 1;
SET GLOBAL tmp_table_size = 134217728; -- 128MB
SET GLOBAL max_heap_table_size = 134217728; -- 128MB

-- إعدادات الأمان
SET GLOBAL local_infile = 0;
SET GLOBAL secure_file_priv = '/var/lib/mysql-files/';

-- ===================================================================
-- إنشاء تقرير حالة النظام
-- ===================================================================

-- مشهد حالة النظام الشاملة
CREATE VIEW system_health_status AS
SELECT 
    'إجمالي الموظفين' as metric,
    COUNT(*) as value,
    'موظف' as unit,
    CASE 
        WHEN COUNT(*) > 100 THEN 'ممتاز'
        WHEN COUNT(*) > 50 THEN 'جيد'
        ELSE 'مقبول'
    END as status
FROM employees WHERE deleted_at IS NULL AND status = 'نشط'

UNION ALL

SELECT 
    'إجمالي المهام النشطة' as metric,
    COUNT(*) as value,
    'مهمة' as unit,
    CASE 
        WHEN COUNT(*) > 500 THEN 'عالي'
        WHEN COUNT(*) > 100 THEN 'متوسط'
        ELSE 'منخفض'
    END as status
FROM tasks WHERE deleted_at IS NULL AND status IN ('جديدة', 'قيد التنفيذ')

UNION ALL

SELECT 
    'معدل إنجاز المهام' as metric,
    ROUND(
        (SELECT COUNT(*) FROM tasks WHERE status = 'مكتملة' AND deleted_at IS NULL) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL), 0)
    ) as value,
    '%' as unit,
    CASE 
        WHEN ROUND(
            (SELECT COUNT(*) FROM tasks WHERE status = 'مكتملة' AND deleted_at IS NULL) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL), 0)
        ) >= 80 THEN 'ممتاز'
        WHEN ROUND(
            (SELECT COUNT(*) FROM tasks WHERE status = 'مكتملة' AND deleted_at IS NULL) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL), 0)
        ) >= 60 THEN 'جيد'
        ELSE 'يحتاج تحسين'
    END as status

UNION ALL

SELECT 
    'المراسلات المعلقة' as metric,
    COUNT(*) as value,
    'مراسلة' as unit,
    CASE 
        WHEN COUNT(*) > 50 THEN 'تحذير'
        WHEN COUNT(*) > 20 THEN 'متابعة'
        ELSE 'طبيعي'
    END as status
FROM correspondence_incoming 
WHERE deleted_at IS NULL 
AND status NOT IN ('مغلق', 'مؤرشف')
AND date < DATE_SUB(CURDATE(), INTERVAL 7 DAY);

-- ===================================================================
-- النهاية - تأكيد إنشاء قاعدة البيانات
-- ===================================================================

-- عرض ملخص الجداول المنشأة
SELECT 
    TABLE_NAME as 'اسم الجدول',
    TABLE_ROWS as 'عدد الصفوف',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'الحجم (MB)',
    TABLE_COMMENT as 'التعليق'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'irrigation_management_system'
ORDER BY TABLE_NAME;

-- عرض الفهارس المنشأة
SELECT 
    TABLE_NAME as 'الجدول',
    INDEX_NAME as 'اسم الفهرس',
    COLUMN_NAME as 'العمود',
    INDEX_TYPE as 'نوع الفهرس'
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'irrigation_management_system'
AND INDEX_NAME != 'PRIMARY'
ORDER BY TABLE_NAME, INDEX_NAME;

-- رسالة تأكيد
SELECT 'تم إنشاء قاعدة بيانات نظام إدارة مصلحة الري بنجاح' as message;
SELECT 'النظام جاهز للاستخدام' as status;
SELECT NOW() as 'وقت الإنشاء';