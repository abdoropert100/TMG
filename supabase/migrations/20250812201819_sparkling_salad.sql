-- ملف تثبيت قاعدة البيانات لنظام إدارة المهام المتكامل
-- يتم تشغيل هذا الملف تلقائياً عند التثبيت

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task_management;

-- جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'اسم الموظف',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'البريد الإلكتروني',
    department ENUM('تقنية المعلومات', 'الموارد البشرية', 'المالية', 'العمليات', 'أخرى') DEFAULT 'أخرى' COMMENT 'القسم',
    role ENUM('موظف', 'مسؤول قسم', 'مدير عام', 'مراقب تقارير') DEFAULT 'موظف' COMMENT 'الوظيفة',
    join_date DATE NOT NULL COMMENT 'تاريخ الانضمام',
    photo VARCHAR(255) DEFAULT NULL COMMENT 'صورة الملف الشخصي',
    performance_points INT DEFAULT 0 COMMENT 'نقاط الأداء',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_performance (performance_points)
) ENGINE=InnoDB COMMENT='جدول الموظفين';

-- جدول المهام
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'اسم المهمة',
    description TEXT COMMENT 'الوصف التفصيلي',
    priority ENUM('عالية', 'متوسطة', 'منخفضة') DEFAULT 'متوسطة' COMMENT 'الأولوية',
    start_date DATETIME NOT NULL COMMENT 'تاريخ البداية',
    end_date DATETIME NOT NULL COMMENT 'تاريخ النهاية',
    status ENUM('مفتوحة', 'جارية', 'مكتملة', 'محولة', 'متأخرة') DEFAULT 'مفتوحة' COMMENT 'الحالة',
    department ENUM('داخلي', 'نظم المعلومات', 'أخرى') DEFAULT 'أخرى' COMMENT 'القسم',
    assigned_employee_id INT DEFAULT NULL COMMENT 'الموظف المسند',
    points INT DEFAULT 10 COMMENT 'نقاط الأداء',
    notes TEXT COMMENT 'ملاحظات إضافية',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_department (department),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB COMMENT='جدول المهام';

-- جدول تعيين المهام (للموظفين المتعددين)
CREATE TABLE IF NOT EXISTS task_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (task_id, employee_id)
) ENGINE=InnoDB COMMENT='جدول تعيين المهام للموظفين';

-- جدول إنجاز المهام (للموظفين المنجزين)
CREATE TABLE IF NOT EXISTS task_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    employee_id INT NOT NULL,
    points_earned INT DEFAULT 0 COMMENT 'النقاط المكتسبة',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_completion (task_id, employee_id)
) ENGINE=InnoDB COMMENT='جدول إنجاز المهام';

-- جدول المرفقات
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL COMMENT 'اسم الملف',
    original_name VARCHAR(255) NOT NULL COMMENT 'الاسم الأصلي',
    file_size INT NOT NULL COMMENT 'حجم الملف',
    file_type VARCHAR(100) NOT NULL COMMENT 'نوع الملف',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='جدول المرفقات';

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT DEFAULT NULL COMMENT 'الموظف المستهدف (NULL للجميع)',
    message TEXT NOT NULL COMMENT 'نص الإشعار',
    type ENUM('مهمة جديدة', 'مهمة مكتملة', 'مهمة متأخرة', 'تذكير', 'تحديث النظام') DEFAULT 'تحديث النظام',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'مقروء أم لا',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_read (employee_id, is_read)
) ENGINE=InnoDB COMMENT='جدول الإشعارات';

-- جدول النشاطات
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL COMMENT 'وصف النشاط',
    user_id INT DEFAULT NULL COMMENT 'المستخدم الذي قام بالنشاط',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='جدول النشاطات';

-- جدول نقاط الأداء (تفصيلي)
CREATE TABLE IF NOT EXISTS performance_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    task_id INT DEFAULT NULL,
    points INT NOT NULL COMMENT 'النقاط (موجبة أو سالبة)',
    reason VARCHAR(255) NOT NULL COMMENT 'سبب إضافة أو خصم النقاط',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_employee_points (employee_id, points)
) ENGINE=InnoDB COMMENT='جدول نقاط الأداء التفصيلي';

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT COMMENT 'وصف الإعداد',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='جدول الإعدادات';

-- إدراج البيانات الأولية

-- إدراج موظفين تجريبيين
INSERT INTO employees (name, email, department, role, join_date, performance_points) VALUES
('أحمد محمد علي', 'ahmed@company.com', 'تقنية المعلومات', 'مدير عام', '2023-01-15', 150),
('فاطمة أحمد', 'fatima@company.com', 'الموارد البشرية', 'مسؤول قسم', '2023-02-01', 120),
('محمد عبدالله', 'mohammed@company.com', 'تقنية المعلومات', 'موظف', '2023-03-10', 95),
('سارة خالد', 'sara@company.com', 'المالية', 'موظف', '2023-04-05', 110),
('عبدالرحمن سعد', 'abdulrahman@company.com', 'العمليات', 'مسؤول قسم', '2023-05-20', 85);

-- إدراج مهام تجريبية
INSERT INTO tasks (name, description, priority, start_date, end_date, status, department, assigned_employee_id, points) VALUES
('تطوير نظام إدارة المهام', 'تطوير نظام شامل لإدارة المهام والموظفين', 'عالية', '2024-01-01 09:00:00', '2024-02-01 17:00:00', 'جارية', 'نظم المعلومات', 1, 50),
('مراجعة السياسات المالية', 'مراجعة وتحديث السياسات المالية للشركة', 'متوسطة', '2024-01-15 08:00:00', '2024-01-30 16:00:00', 'مفتوحة', 'أخرى', 4, 30),
('تدريب الموظفين الجدد', 'برنامج تدريبي للموظفين الجدد', 'منخفضة', '2024-01-10 10:00:00', '2024-01-25 15:00:00', 'مكتملة', 'داخلي', 2, 25),
('تحديث البنية التحتية', 'تحديث الخوادم والشبكة', 'عالية', '2024-01-05 08:00:00', '2024-01-20 18:00:00', 'جارية', 'نظم المعلومات', 3, 40),
('إعداد التقرير الشهري', 'إعداد التقرير المالي الشهري', 'متوسطة', '2024-01-20 09:00:00', '2024-01-31 17:00:00', 'مفتوحة', 'أخرى', 4, 20);

-- إدراج إشعارات تجريبية
INSERT INTO notifications (employee_id, message, type, is_read) VALUES
(1, 'تم تعيين مهمة جديدة لك: تطوير نظام إدارة المهام', 'مهمة جديدة', FALSE),
(2, 'تم إكمال مهمة: تدريب الموظفين الجدد', 'مهمة مكتملة', FALSE),
(3, 'تذكير: مهمة تحديث البنية التحتية تنتهي خلال يومين', 'تذكير', TRUE),
(4, 'تم تعيين مهمة جديدة لك: مراجعة السياسات المالية', 'مهمة جديدة', FALSE),
(NULL, 'تم تحديث النظام إلى الإصدار 1.0.0', 'تحديث النظام', FALSE);

-- إدراج نشاطات تجريبية
INSERT INTO activities (description, user_id) VALUES
('تم إنشاء مهمة جديدة: تطوير نظام إدارة المهام', 1),
('تم إكمال مهمة: تدريب الموظفين الجدد', 2),
('تم تحديث مهمة: تحديث البنية التحتية', 3),
('تم إضافة موظف جديد: سارة خالد', 1),
('تم تصدير تقرير الأداء الشهري', 1);

-- إدراج نقاط الأداء التفصيلية
INSERT INTO performance_points (employee_id, task_id, points, reason) VALUES
(1, 1, 50, 'إنشاء مهمة جديدة'),
(2, 3, 25, 'إكمال مهمة تدريب الموظفين'),
(3, 4, 20, 'تقدم في مهمة تحديث البنية التحتية'),
(4, 2, 15, 'بدء العمل في مراجعة السياسات'),
(1, NULL, 25, 'مكافأة الأداء المتميز');

-- إدراج الإعدادات الافتراضية
INSERT INTO settings (setting_key, setting_value, description) VALUES
('system_name', 'نظام إدارة المهام المتكامل', 'اسم النظام'),
('system_version', '1.0.0', 'إصدار النظام'),
('default_theme', 'light', 'السمة الافتراضية'),
('default_language', 'ar', 'اللغة الافتراضية'),
('points_per_task', '10', 'النقاط الافتراضية لكل مهمة'),
('notification_enabled', '1', 'تفعيل الإشعارات'),
('auto_backup', '1', 'النسخ الاحتياطي التلقائي');

-- إنشاء المؤشرات الإضافية لتحسين الأداء
CREATE INDEX idx_tasks_employee_status ON tasks(assigned_employee_id, status);
CREATE INDEX idx_notifications_unread ON notifications(employee_id, is_read, created_at);
CREATE INDEX idx_performance_employee_date ON performance_points(employee_id, created_at);

-- إنشاء Views مفيدة
CREATE VIEW employee_performance_summary AS
SELECT 
    e.id,
    e.name,
    e.department,
    e.performance_points,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'متأخرة' OR t.end_date < NOW() THEN 1 ELSE 0 END) as overdue_tasks,
    ROUND(
        (SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(COUNT(t.id), 0)), 2
    ) as completion_rate
FROM employees e
LEFT JOIN tasks t ON e.id = t.assigned_employee_id
GROUP BY e.id;

CREATE VIEW task_status_summary AS
SELECT 
    status,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tasks)), 2) as percentage
FROM tasks
GROUP BY status;

-- إنشاء Triggers لتحديث نقاط الأداء تلقائياً
DELIMITER //

CREATE TRIGGER update_employee_points_on_task_complete
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF NEW.status = 'مكتملة' AND OLD.status != 'مكتملة' AND NEW.assigned_employee_id IS NOT NULL THEN
        UPDATE employees 
        SET performance_points = performance_points + NEW.points 
        WHERE id = NEW.assigned_employee_id;
        
        INSERT INTO performance_points (employee_id, task_id, points, reason)
        VALUES (NEW.assigned_employee_id, NEW.id, NEW.points, 'إكمال المهمة');
    END IF;
    
    IF NEW.status = 'متأخرة' AND OLD.status != 'متأخرة' AND NEW.assigned_employee_id IS NOT NULL THEN
        UPDATE employees 
        SET performance_points = performance_points - (NEW.points / 2)
        WHERE id = NEW.assigned_employee_id;
        
        INSERT INTO performance_points (employee_id, task_id, points, reason)
        VALUES (NEW.assigned_employee_id, NEW.id, -(NEW.points / 2), 'تأخير في المهمة');
    END IF;
END//

CREATE TRIGGER create_notification_on_task_assign
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    IF NEW.assigned_employee_id IS NOT NULL THEN
        INSERT INTO notifications (employee_id, message, type)
        VALUES (NEW.assigned_employee_id, CONCAT('تم تعيين مهمة جديدة لك: ', NEW.name), 'مهمة جديدة');
    END IF;
END//

DELIMITER ;

-- إنشاء إجراءات مخزنة مفيدة
DELIMITER //

CREATE PROCEDURE GetEmployeePerformanceReport(IN emp_id INT)
BEGIN
    SELECT 
        e.name,
        e.department,
        e.performance_points,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'متأخرة' THEN 1 ELSE 0 END) as overdue_tasks,
        AVG(DATEDIFF(t.updated_at, t.created_at)) as avg_completion_days
    FROM employees e
    LEFT JOIN tasks t ON e.id = t.assigned_employee_id
    WHERE e.id = emp_id
    GROUP BY e.id;
END//

CREATE PROCEDURE GetDashboardStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM employees) as total_employees,
        (SELECT COUNT(*) FROM tasks WHERE status = 'مكتملة') as completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'جارية') as in_progress_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'متأخرة' OR end_date < NOW()) as overdue_tasks,
        (SELECT COUNT(*) FROM tasks WHERE priority = 'عالية') as urgent_tasks;
END//

DELIMITER ;

-- رسالة نجاح التثبيت
SELECT 'تم تثبيت قاعدة البيانات بنجاح! النظام جاهز للاستخدام.' as message;