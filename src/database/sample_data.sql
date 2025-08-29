-- بيانات تجريبية لنظام إدارة مصلحة الري
-- وزارة الموارد المائية والري - جمهورية مصر العربية

USE irrigation_management_system;

-- إدراج الإدارات
INSERT INTO departments (id, name, description, employee_count) VALUES
('dept-001', 'الإدارة الهندسية', 'إدارة المشاريع الهندسية وصيانة البنية التحتية', 25),
('dept-002', 'الشؤون الإدارية', 'إدارة الموارد البشرية والشؤون الإدارية', 18),
('dept-003', 'الإدارة المالية', 'إدارة الميزانية والشؤون المالية', 15),
('dept-004', 'إدارة المشاريع', 'تخطيط وتنفيذ المشاريع المائية', 22),
('dept-005', 'الإدارة الفنية', 'الصيانة والدعم الفني', 20),
('dept-006', 'إدارة الجودة', 'ضمان الجودة ومراقبة المعايير', 12),
('dept-007', 'الإدارة القانونية', 'الشؤون القانونية والتشريعية', 8),
('dept-008', 'إدارة التطوير', 'البحث والتطوير والابتكار', 16);

-- إدراج الأقسام
INSERT INTO divisions (id, name, description, department_id, employee_count) VALUES
-- أقسام الإدارة الهندسية
('div-001', 'قسم المشاريع', 'تصميم وتنفيذ المشاريع الهندسية', 'dept-001', 12),
('div-002', 'قسم الصيانة', 'صيانة المعدات والمنشآت', 'dept-001', 8),
('div-003', 'قسم التصميم', 'التصميم الهندسي والمخططات', 'dept-001', 5),

-- أقسام الشؤون الإدارية
('div-004', 'قسم الموارد البشرية', 'إدارة شؤون الموظفين', 'dept-002', 10),
('div-005', 'قسم الخدمات العامة', 'الخدمات الإدارية العامة', 'dept-002', 8),

-- أقسام الإدارة المالية
('div-006', 'قسم المحاسبة', 'المحاسبة والتدقيق المالي', 'dept-003', 8),
('div-007', 'قسم الميزانية', 'إعداد ومتابعة الميزانية', 'dept-003', 7),

-- أقسام إدارة المشاريع
('div-008', 'قسم التخطيط', 'تخطيط وجدولة المشاريع', 'dept-004', 10),
('div-009', 'قسم المتابعة', 'متابعة تنفيذ المشاريع', 'dept-004', 12),

-- أقسام الإدارة الفنية
('div-010', 'قسم الصيانة الوقائية', 'الصيانة الدورية والوقائية', 'dept-005', 12),
('div-011', 'قسم الطوارئ', 'التعامل مع الطوارئ والأعطال', 'dept-005', 8),

-- أقسام إدارة الجودة
('div-012', 'قسم مراقبة الجودة', 'مراقبة جودة المياه والخدمات', 'dept-006', 7),
('div-013', 'قسم المعايير', 'وضع ومراجعة المعايير', 'dept-006', 5),

-- أقسام الإدارة القانونية
('div-014', 'قسم الاستشارات القانونية', 'تقديم الاستشارات القانونية', 'dept-007', 5),
('div-015', 'قسم التقاضي', 'متابعة القضايا والدعاوى', 'dept-007', 3),

-- أقسام إدارة التطوير
('div-016', 'قسم البحث والتطوير', 'البحوث والدراسات التطويرية', 'dept-008', 8),
('div-017', 'قسم التدريب', 'تدريب وتأهيل الموظفين', 'dept-008', 8);

-- إدراج الموظفين
INSERT INTO employees (id, name, employee_number, email, phone, department_id, division_id, position, points, status, hire_date) VALUES
-- الإدارة الهندسية
('emp-001', 'أحمد محمد علي', 'EMP001', 'ahmed.ali@irrigation.gov.eg', '01234567890', 'dept-001', 'div-001', 'مهندس أول', 950, 'نشط', '2020-01-15'),
('emp-002', 'محمد حسن إبراهيم', 'EMP002', 'mohamed.hassan@irrigation.gov.eg', '01234567891', 'dept-001', 'div-001', 'مهندس', 845, 'نشط', '2021-03-10'),
('emp-003', 'خالد عبد الرحمن', 'EMP003', 'khaled.abdel@irrigation.gov.eg', '01234567892', 'dept-001', 'div-002', 'فني صيانة أول', 795, 'نشط', '2019-06-20'),
('emp-004', 'عمر سعد محمود', 'EMP004', 'omar.saad@irrigation.gov.eg', '01234567893', 'dept-001', 'div-003', 'مهندس تصميم', 720, 'نشط', '2022-01-05'),

-- الشؤون الإدارية
('emp-005', 'فاطمة السيد أحمد', 'EMP005', 'fatma.ahmed@irrigation.gov.eg', '01234567894', 'dept-002', 'div-004', 'أخصائي موارد بشرية', 890, 'نشط', '2020-09-12'),
('emp-006', 'نورا أحمد محمود', 'EMP006', 'nora.ahmed@irrigation.gov.eg', '01234567895', 'dept-002', 'div-004', 'مسؤول شؤون موظفين', 820, 'نشط', '2021-11-08'),
('emp-007', 'سارة محمد عبد الله', 'EMP007', 'sara.mohamed@irrigation.gov.eg', '01234567896', 'dept-002', 'div-005', 'مسؤول خدمات عامة', 680, 'نشط', '2022-05-15'),

-- الإدارة المالية
('emp-008', 'حسام الدين أحمد', 'EMP008', 'hossam.ahmed@irrigation.gov.eg', '01234567897', 'dept-003', 'div-006', 'محاسب أول', 760, 'نشط', '2019-12-01'),
('emp-009', 'منى عبد العزيز', 'EMP009', 'mona.abdelaziz@irrigation.gov.eg', '01234567898', 'dept-003', 'div-007', 'أخصائي ميزانية', 710, 'نشط', '2021-07-20'),

-- إدارة المشاريع
('emp-010', 'يوسف محمد علي', 'EMP010', 'youssef.mohamed@irrigation.gov.eg', '01234567899', 'dept-004', 'div-008', 'مخطط مشاريع', 830, 'نشط', '2020-04-18'),
('emp-011', 'أمل حسن محمد', 'EMP011', 'amal.hassan@irrigation.gov.eg', '01234567800', 'dept-004', 'div-009', 'مسؤول متابعة', 775, 'نشط', '2021-09-25'),

-- الإدارة الفنية
('emp-012', 'طارق عبد الحميد', 'EMP012', 'tarek.abdelhamid@irrigation.gov.eg', '01234567801', 'dept-005', 'div-010', 'فني صيانة', 650, 'نشط', '2022-02-14'),
('emp-013', 'ياسر محمد فتحي', 'EMP013', 'yasser.mohamed@irrigation.gov.eg', '01234567802', 'dept-005', 'div-011', 'مسؤول طوارئ', 700, 'نشط', '2020-10-30'),

-- إدارة الجودة
('emp-014', 'دينا أحمد سالم', 'EMP014', 'dina.ahmed@irrigation.gov.eg', '01234567803', 'dept-006', 'div-012', 'مراقب جودة', 740, 'نشط', '2021-01-12'),
('emp-015', 'رامي عبد الله', 'EMP015', 'rami.abdullah@irrigation.gov.eg', '01234567804', 'dept-006', 'div-013', 'أخصائي معايير', 690, 'نشط', '2022-03-08');

-- تحديث رؤساء الإدارات والأقسام
UPDATE departments SET head_employee_id = 'emp-001' WHERE id = 'dept-001';
UPDATE departments SET head_employee_id = 'emp-005' WHERE id = 'dept-002';
UPDATE departments SET head_employee_id = 'emp-008' WHERE id = 'dept-003';
UPDATE departments SET head_employee_id = 'emp-010' WHERE id = 'dept-004';
UPDATE departments SET head_employee_id = 'emp-012' WHERE id = 'dept-005';
UPDATE departments SET head_employee_id = 'emp-014' WHERE id = 'dept-006';

UPDATE divisions SET head_employee_id = 'emp-001' WHERE id = 'div-001';
UPDATE divisions SET head_employee_id = 'emp-003' WHERE id = 'div-002';
UPDATE divisions SET head_employee_id = 'emp-004' WHERE id = 'div-003';
UPDATE divisions SET head_employee_id = 'emp-005' WHERE id = 'div-004';
UPDATE divisions SET head_employee_id = 'emp-007' WHERE id = 'div-005';
UPDATE divisions SET head_employee_id = 'emp-008' WHERE id = 'div-006';
UPDATE divisions SET head_employee_id = 'emp-009' WHERE id = 'div-007';
UPDATE divisions SET head_employee_id = 'emp-010' WHERE id = 'div-008';
UPDATE divisions SET head_employee_id = 'emp-011' WHERE id = 'div-009';
UPDATE divisions SET head_employee_id = 'emp-012' WHERE id = 'div-010';
UPDATE divisions SET head_employee_id = 'emp-013' WHERE id = 'div-011';
UPDATE divisions SET head_employee_id = 'emp-014' WHERE id = 'div-012';
UPDATE divisions SET head_employee_id = 'emp-015' WHERE id = 'div-013';

-- إدراج المهام
INSERT INTO tasks (id, title, description, priority, status, department_id, division_id, start_date, end_date, points, created_by, assigned_to, completion_percentage) VALUES
('task-001', 'صيانة محطة ضخ المياه الرئيسية', 'إجراء صيانة دورية شاملة لمحطة ضخ المياه الرئيسية بمنطقة الدلتا', 'عالي', 'قيد التنفيذ', 'dept-001', 'div-002', '2024-01-10', '2024-01-25', 50, 'emp-001', '["emp-003", "emp-012"]', 65),
('task-002', 'مراجعة تقرير الاستهلاك المائي', 'مراجعة وتحليل تقرير استهلاك المياه للربع الأول', 'متوسط', 'مكتملة', 'dept-003', 'div-006', '2024-01-05', '2024-01-15', 30, 'emp-008', '["emp-008", "emp-009"]', 100),
('task-003', 'تحديث نظام إدارة الموظفين', 'تحديث وتطوير نظام إدارة الموظفين الإلكتروني', 'عاجل', 'قيد التنفيذ', 'dept-002', 'div-004', '2024-01-08', '2024-02-08', 80, 'emp-005', '["emp-005", "emp-006"]', 40),
('task-004', 'دراسة جدوى مشروع الري الحديث', 'إعداد دراسة جدوى لمشروع نظام الري الحديث', 'عالي', 'جديدة', 'dept-004', 'div-008', '2024-01-20', '2024-03-20', 100, 'emp-010', '["emp-010", "emp-011"]', 0),
('task-005', 'فحص جودة المياه الشهري', 'إجراء فحوصات دورية لجودة المياه في جميع المحطات', 'متوسط', 'قيد التنفيذ', 'dept-006', 'div-012', '2024-01-01', '2024-01-31', 40, 'emp-014', '["emp-014", "emp-015"]', 80),
('task-006', 'تدريب الموظفين الجدد', 'برنامج تدريبي للموظفين الجدد على أنظمة العمل', 'منخفض', 'مكتملة', 'dept-008', 'div-017', '2023-12-15', '2024-01-15', 25, 'emp-005', '["emp-005"]', 100),
('task-007', 'إعداد التقرير السنوي', 'إعداد التقرير السنوي لأنشطة المصلحة', 'عالي', 'متأخرة', 'dept-002', 'div-004', '2023-12-01', '2024-01-10', 60, 'emp-005', '["emp-005", "emp-006"]', 75);

-- إدراج المراسلات الواردة
INSERT INTO correspondence_incoming (id, number, date, sender_name, sender_organization, subject, confidentiality, urgency, status, department_id, division_id, assigned_to, created_by) VALUES
('inc-001', 'IN-2024-001', '2024-01-10', 'محافظة الجيزة', 'محافظة الجيزة - إدارة الري', 'طلب موافقة على مشروع شبكة ري جديدة', 'عادي', 'عاجل', 'قيد المراجعة', 'dept-004', 'div-008', 'emp-010', 'emp-005'),
('inc-002', 'IN-2024-002', '2024-01-12', 'وزارة البيئة', 'وزارة البيئة - قطاع حماية الطبيعة', 'تقرير تأثير بيئي لمحطة المعالجة', 'سري', 'عادي', 'محال', 'dept-006', 'div-012', 'emp-014', 'emp-005'),
('inc-003', 'IN-2024-003', '2024-01-15', 'شركة المقاولون العرب', 'شركة المقاولون العرب', 'عرض فني لمشروع تطوير الشبكة', 'عادي', 'عادي', 'مغلق', 'dept-004', 'div-008', 'emp-010', 'emp-005'),
('inc-004', 'IN-2024-004', '2024-01-18', 'رئاسة مجلس الوزراء', 'رئاسة مجلس الوزراء - الأمانة العامة', 'توجيهات بشأن ترشيد استهلاك المياه', 'سري جداً', 'فوري', 'قيد المراجعة', 'dept-001', 'div-001', 'emp-001', 'emp-005'),
('inc-005', 'IN-2024-005', '2024-01-20', 'نقابة المهندسين', 'نقابة المهندسين - فرع القاهرة', 'دعوة لحضور مؤتمر الهندسة المائية', 'عادي', 'عادي', 'مغلق', 'dept-001', 'div-001', 'emp-001', 'emp-005');

-- إدراج المراسلات الصادرة
INSERT INTO correspondence_outgoing (id, number, date, recipient_name, recipient_organization, subject, confidentiality, urgency, status, department_id, division_id, prepared_by, created_by) VALUES
('out-001', 'OUT-2024-001', '2024-01-11', 'محافظة الجيزة', 'محافظة الجيزة - إدارة الري', 'رد على طلب الموافقة على مشروع الري', 'عادي', 'عاجل', 'صادر', 'dept-004', 'div-008', 'emp-010', 'emp-005'),
('out-002', 'OUT-2024-002', '2024-01-14', 'وزارة المالية', 'وزارة المالية - قطاع الموازنة', 'طلب اعتماد ميزانية إضافية', 'سري', 'عاجل', 'صادر', 'dept-003', 'div-007', 'emp-009', 'emp-008'),
('out-003', 'OUT-2024-003', '2024-01-16', 'شركة المقاولون العرب', 'شركة المقاولون العرب', 'إشعار بقبول العرض الفني', 'عادي', 'عادي', 'صادر', 'dept-004', 'div-008', 'emp-010', 'emp-005'),
('out-004', 'OUT-2024-004', '2024-01-19', 'جميع المحافظات', 'محافظات الجمهورية', 'تعميم بشأن ترشيد استهلاك المياه', 'عادي', 'فوري', 'قيد المراجعة', 'dept-001', 'div-001', 'emp-001', 'emp-005');

-- إدراج نقاط الموظفين
INSERT INTO employee_points (id, employee_id, points_change, reason, related_entity_type, related_entity_id, description, awarded_by) VALUES
('pts-001', 'emp-001', 50, 'task_completion', 'task', 'task-001', 'إنجاز مهمة صيانة محطة الضخ في الوقت المحدد', 'emp-005'),
('pts-002', 'emp-008', 30, 'task_completion', 'task', 'task-002', 'إنجاز مراجعة تقرير الاستهلاك المائي', 'emp-005'),
('pts-003', 'emp-005', 25, 'correspondence_handling', 'correspondence_incoming', 'inc-001', 'معالجة سريعة للمراسلة الواردة', 'emp-001'),
('pts-004', 'emp-010', 40, 'task_assignment', 'task', 'task-004', 'تولي مهمة دراسة الجدوى المعقدة', 'emp-001'),
('pts-005', 'emp-014', 35, 'task_completion', 'task', 'task-005', 'إنجاز فحص جودة المياه بكفاءة عالية', 'emp-005');

-- إدراج الإشعارات
INSERT INTO notifications (id, type, target_user_id, title, message, related_entity_type, related_entity_id, is_read) VALUES
('notif-001', 'task_assigned', 'emp-003', 'مهمة جديدة مسندة إليك', 'تم إسناد مهمة "صيانة محطة ضخ المياه الرئيسية" إليك', 'task', 'task-001', FALSE),
('notif-002', 'correspondence_urgent', 'emp-001', 'مراسلة عاجلة تحتاج متابعة', 'مراسلة عاجلة من رئاسة مجلس الوزراء تحتاج مراجعة فورية', 'correspondence_incoming', 'inc-004', FALSE),
('notif-003', 'task_overdue', 'emp-005', 'مهمة متأخرة', 'مهمة "إعداد التقرير السنوي" تجاوزت الموعد المحدد', 'task', 'task-007', TRUE),
('notif-004', 'task_assigned', 'emp-010', 'مهمة جديدة مسندة إليك', 'تم إسناد مهمة "دراسة جدوى مشروع الري الحديث" إليك', 'task', 'task-004', FALSE);

-- إدراج إعدادات النظام
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, category, description, is_public) VALUES
('set-001', 'system_name', '"نظام إدارة مصلحة الري"', 'string', 'general', 'اسم النظام', TRUE),
('set-002', 'organization_name', '"وزارة الموارد المائية والري - جمهورية مصر العربية"', 'string', 'general', 'اسم المؤسسة', TRUE),
('set-003', 'theme', '"فاتح"', 'string', 'appearance', 'سمة النظام', TRUE),
('set-004', 'language', '"ar"', 'string', 'general', 'لغة النظام', TRUE),
('set-005', 'auto_backup_enabled', 'true', 'boolean', 'backup', 'تفعيل النسخ الاحتياطي التلقائي', FALSE),
('set-006', 'backup_frequency', '"daily"', 'string', 'backup', 'تكرار النسخ الاحتياطي', FALSE),
('set-007', 'notification_email_enabled', 'true', 'boolean', 'notifications', 'تفعيل إشعارات البريد الإلكتروني', FALSE),
('set-008', 'task_auto_points', '{"completion": 10, "delay_penalty": -5, "early_completion": 15}', 'json', 'tasks', 'نقاط المهام التلقائية', FALSE);

-- إدراج قاموس الجهات
INSERT INTO correspondents (id, name, organization, type, contact_info) VALUES
('corr-001', 'محافظة الجيزة', 'محافظة الجيزة - إدارة الري', 'جهة حكومية', '{"phone": "0233334444", "email": "irrigation@giza.gov.eg", "address": "الجيزة - شارع الهرم"}'),
('corr-002', 'وزارة البيئة', 'وزارة البيئة - قطاع حماية الطبيعة', 'جهة حكومية', '{"phone": "0225556666", "email": "environment@env.gov.eg", "address": "القاهرة - مدينة نصر"}'),
('corr-003', 'شركة المقاولون العرب', 'شركة المقاولون العرب', 'شركة', '{"phone": "0277778888", "email": "info@arabcont.com", "address": "القاهرة - مصر الجديدة"}'),
('corr-004', 'رئاسة مجلس الوزراء', 'رئاسة مجلس الوزراء - الأمانة العامة', 'جهة حكومية', '{"phone": "0211112222", "email": "cabinet@cabinet.gov.eg", "address": "القاهرة - قصر العروبة"}'),
('corr-005', 'نقابة المهندسين', 'نقابة المهندسين - فرع القاهرة', 'منظمة', '{"phone": "0233335555", "email": "info@eea.org.eg", "address": "القاهرة - رمسيس"}');
