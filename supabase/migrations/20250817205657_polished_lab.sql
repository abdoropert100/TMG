-- ملف تثبيت النظام الأولي
-- يتم تشغيله مرة واحدة فقط عند التثبيت الأول

-- إنشاء قاعدة البيانات
SOURCE complete_schema.sql;

-- إدراج البيانات الأساسية المطلوبة للنظام

-- إدراج الإدارات الأساسية
INSERT INTO departments (id, name, description, employee_count, is_active) VALUES
('dept-001', 'الإدارة الهندسية', 'إدارة المشاريع الهندسية وصيانة البنية التحتية', 0, TRUE),
('dept-002', 'الشؤون الإدارية', 'إدارة الموارد البشرية والشؤون الإدارية', 0, TRUE),
('dept-003', 'الإدارة المالية', 'إدارة الميزانية والشؤون المالية', 0, TRUE),
('dept-004', 'إدارة المشاريع', 'تخطيط وتنفيذ المشاريع المائية', 0, TRUE),
('dept-005', 'الإدارة الفنية', 'الصيانة والدعم الفني', 0, TRUE);

-- إدراج الأقسام الأساسية
INSERT INTO divisions (id, name, description, department_id, employee_count, is_active) VALUES
('div-001', 'قسم المشاريع', 'تصميم وتنفيذ المشاريع الهندسية', 'dept-001', 0, TRUE),
('div-002', 'قسم الصيانة', 'صيانة المعدات والمنشآت', 'dept-001', 0, TRUE),
('div-003', 'قسم الموارد البشرية', 'إدارة شؤون الموظفين', 'dept-002', 0, TRUE),
('div-004', 'قسم المحاسبة', 'المحاسبة والتدقيق المالي', 'dept-003', 0, TRUE),
('div-005', 'قسم التخطيط', 'تخطيط وجدولة المشاريع', 'dept-004', 0, TRUE),
('div-006', 'قسم الصيانة الوقائية', 'الصيانة الدورية والوقائية', 'dept-005', 0, TRUE);

-- إدراج مستخدم النظام الافتراضي
INSERT INTO employees (id, name, employee_number, email, phone, department_id, division_id, position, points, status, permissions, password_hash, is_active) VALUES
('admin-001', 'مدير النظام', 'ADMIN001', 'admin@irrigation.gov.eg', '+201000731116', 'dept-002', 'div-003', 'مدير النظام', 1000, 'نشط', '["admin", "read", "write", "delete", "export", "import"]', MD5('admin123'), TRUE);

-- تحديث رؤساء الإدارات
UPDATE departments SET head_employee_id = 'admin-001' WHERE id = 'dept-002';
UPDATE divisions SET head_employee_id = 'admin-001' WHERE id = 'div-003';

-- إنشاء سجل نشاط أولي
INSERT INTO activity_logs (id, module, operation, entity_id, actor_id, actor_name, description, success) VALUES
('log-001', 'system', 'create', 'system', 'admin-001', 'مدير النظام', 'تم تثبيت النظام بنجاح', TRUE);

-- إنشاء إشعار ترحيبي
INSERT INTO notifications (id, type, target_user_id, title, message, priority, is_read) VALUES
('notif-001', 'system_alert', 'admin-001', 'مرحباً بك في النظام', 'تم تثبيت نظام إدارة مصلحة الري بنجاح. يمكنك الآن البدء في استخدام النظام.', 'medium', FALSE);

-- إنشاء نسخة احتياطية أولية
INSERT INTO backups (id, backup_name, backup_type, backup_method, file_path, file_name, backup_status, created_by) VALUES
('backup-001', 'النسخة الاحتياطية الأولية', 'full', 'manual', '/backups/', 'initial_backup.sql', 'completed', 'admin-001');

COMMIT;