-- ملف تشغيل النظام
-- يتم تشغيله في كل مرة لبدء النظام

USE irrigation_management_system;

-- فحص سلامة قاعدة البيانات
CHECK TABLE departments, divisions, employees, tasks, correspondence_incoming, correspondence_outgoing;

-- تحديث إحصائيات الجداول
ANALYZE TABLE departments, divisions, employees, tasks, correspondence_incoming, correspondence_outgoing;

-- تنظيف السجلات القديمة (أكثر من سنة)
DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- تنظيف الإشعارات المقروءة القديمة (أكثر من 3 أشهر)
DELETE FROM notifications WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);

-- تحديث عدد الموظفين في الإدارات والأقسام
UPDATE departments d SET employee_count = (
    SELECT COUNT(*) FROM employees e 
    WHERE e.department_id = d.id AND e.deleted_at IS NULL
);

UPDATE divisions dv SET employee_count = (
    SELECT COUNT(*) FROM employees e 
    WHERE e.division_id = dv.id AND e.deleted_at IS NULL
);

-- تسجيل بدء تشغيل النظام
INSERT INTO activity_logs (id, module, operation, entity_id, actor_id, actor_name, description, success) VALUES
(CONCAT('log-startup-', UNIX_TIMESTAMP()), 'system', 'read', 'system', 'system', 'النظام', 'تم بدء تشغيل النظام', TRUE);

-- عرض حالة النظام
SELECT 
    'النظام جاهز للاستخدام' AS status,
    NOW() AS startup_time,
    (SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL) AS total_employees,
    (SELECT COUNT(*) FROM departments WHERE deleted_at IS NULL) AS total_departments,
    (SELECT COUNT(*) FROM divisions WHERE deleted_at IS NULL) AS total_divisions,
    (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL) AS total_tasks,
    (SELECT COUNT(*) FROM correspondence_incoming WHERE deleted_at IS NULL) AS total_incoming,
    (SELECT COUNT(*) FROM correspondence_outgoing WHERE deleted_at IS NULL) AS total_outgoing;