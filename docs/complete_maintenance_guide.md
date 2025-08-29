# دليل الصيانة والدعم الفني الشامل
## نظام إدارة مصلحة الري
### وزارة الموارد المائية والري - جمهورية مصر العربية

---

## فهرس المحتويات الشامل

1. [نظرة عامة على النظام والبنية](#نظرة-عامة-على-النظام-والبنية)
2. [متطلبات النظام التفصيلية](#متطلبات-النظام-التفصيلية)
3. [التثبيت والإعداد الكامل](#التثبيت-والإعداد-الكامل)
4. [إدارة قاعدة البيانات الشاملة](#إدارة-قاعدة-البيانات-الشاملة)
5. [النسخ الاحتياطي والاستعادة المتقدمة](#النسخ-الاحتياطي-والاستعادة-المتقدمة)
6. [مراقبة الأداء والتحسين](#مراقبة-الأداء-والتحسين)
7. [استكشاف الأخطاء وإصلاحها](#استكشاف-الأخطاء-وإصلاحها)
8. [الأمان والحماية المتقدمة](#الأمان-والحماية-المتقدمة)
9. [التحديثات والترقيات](#التحديثات-والترقيات)
10. [سجلات النظام والمراقبة](#سجلات-النظام-والمراقبة)
11. [إجراءات الطوارئ](#إجراءات-الطوارئ)
12. [الصيانة الدورية](#الصيانة-الدورية)
13. [استكشاف أخطاء المكونات](#استكشاف-أخطاء-المكونات)
14. [تحسين الأداء المتقدم](#تحسين-الأداء-المتقدم)

---

## نظرة عامة على النظام والبنية

### البنية التقنية الكاملة:

#### الطبقة الأمامية (Frontend):
- **React 18**: مكتبة بناء واجهات المستخدم
- **TypeScript**: لغة البرمجة مع الأنواع الثابتة
- **Vite**: أداة البناء والتطوير السريع
- **Tailwind CSS**: إطار عمل التصميم المتجاوب
- **Recharts**: مكتبة الرسوم البيانية التفاعلية
- **Lucide React**: مكتبة الأيقونات الحديثة

#### طبقة البيانات (Data Layer):
- **IndexedDB**: قاعدة البيانات المحلية في المتصفح
- **Local Storage**: تخزين الإعدادات والتفضيلات
- **Session Storage**: بيانات الجلسة المؤقتة
- **File System API**: للتعامل مع الملفات

#### طبقة الخدمات (Services Layer):
- **DatabaseService**: إدارة قاعدة البيانات المحلية
- **ExcelService**: استيراد وتصدير ملفات Excel
- **NotificationService**: إدارة الإشعارات والتنبيهات
- **ValidationService**: التحقق من صحة البيانات

### هيكل الملفات التفصيلي:
```
src/
├── components/              # مكونات واجهة المستخدم
│   ├── Layout/             # مكونات التخطيط العام
│   │   ├── Header.tsx      # شريط الرأس العلوي
│   │   └── Sidebar.tsx     # الشريط الجانبي للتنقل
│   ├── Dashboard/          # مكونات لوحة التحكم
│   │   ├── Dashboard.tsx   # الصفحة الرئيسية
│   │   ├── StatsCards.tsx  # بطاقات الإحصائيات
│   │   ├── AdvancedCharts.tsx # الرسوم البيانية المتقدمة
│   │   ├── QuickActions.tsx   # الإجراءات السريعة
│   │   ├── RecentActivity.tsx # النشاطات الأخيرة
│   │   ├── TopPerformers.tsx  # أفضل الموظفين
│   │   ├── AlertsNotifications.tsx # التنبيهات
│   │   ├── PerformanceMetrics.tsx  # مقاييس الأداء
│   │   └── SystemOverview.tsx      # ملخص النظام
│   ├── Tasks/              # مكونات إدارة المهام
│   │   ├── TaskList.tsx    # قائمة المهام
│   │   ├── TaskCard.tsx    # بطاقة المهمة
│   │   └── TaskForm.tsx    # نموذج إضافة/تعديل المهمة
│   ├── Employees/          # مكونات إدارة الموظفين
│   │   ├── EmployeeList.tsx # قائمة الموظفين
│   │   └── EmployeeForm.tsx # نموذج إضافة/تعديل الموظف
│   ├── Correspondence/     # مكونات إدارة المراسلات
│   │   ├── CorrespondenceList.tsx # قائمة المراسلات
│   │   ├── CorrespondenceCard.tsx # بطاقة المراسلة
│   │   ├── IncomingForm.tsx       # نموذج المراسلة الواردة
│   │   └── OutgoingForm.tsx       # نموذج المراسلة الصادرة
│   ├── Departments/        # مكونات إدارة الأقسام
│   │   ├── DepartmentList.tsx # قائمة الإدارات والأقسام
│   │   ├── DepartmentForm.tsx # نموذج الإدارة
│   │   └── DivisionForm.tsx   # نموذج القسم
│   ├── Reports/            # مكونات التقارير
│   │   ├── Reports.tsx     # الصفحة الرئيسية للتقارير
│   │   ├── ReportsMain.tsx # التقارير الرئيسية
│   │   ├── TasksReport.tsx # تقرير المهام
│   │   ├── EmployeesReport.tsx # تقرير الموظفين
│   │   ├── CorrespondenceReport.tsx # تقرير المراسلات
│   │   └── DepartmentsReport.tsx    # تقرير الأقسام
│   └── Settings/           # مكونات الإعدادات
│       ├── Settings.tsx    # الإعدادات العامة
│       ├── SettingsMain.tsx # الإعدادات الرئيسية
│       ├── AdvancedSettings.tsx # الإعدادات المتقدمة
│       ├── UserSettings.tsx     # إعدادات المستخدم
│       ├── SecuritySettings.tsx # إعدادات الأمان
│       ├── DatabaseSettings.tsx # إعدادات قاعدة البيانات
│       ├── NotificationSettings.tsx # إعدادات الإشعارات
│       ├── AppearanceSettings.tsx   # إعدادات المظهر
│       └── SystemSettings.tsx       # إعدادات النظام
├── services/               # خدمات النظام
│   ├── DatabaseService.ts # خدمة قاعدة البيانات
│   ├── ExcelService.ts    # خدمة Excel
│   └── NotificationService.ts # خدمة الإشعارات
├── context/                # سياق التطبيق
│   └── AppContext.tsx      # السياق الرئيسي
├── hooks/                  # خطافات مخصصة
│   ├── useDatabase.ts      # خطاف قاعدة البيانات
│   ├── useLocalStorage.ts # خطاف التخزين المحلي
│   └── useNotifications.ts # خطاف الإشعارات
├── types/                  # تعريفات الأنواع
│   └── index.ts           # جميع الأنواع
├── utils/                  # أدوات مساعدة
│   ├── dateUtils.ts       # أدوات التاريخ
│   ├── formatUtils.ts     # أدوات التنسيق
│   └── validationUtils.ts # أدوات التحقق
├── data/                   # البيانات التجريبية
│   └── mockData.ts        # البيانات الأولية
└── database/              # ملفات قاعدة البيانات
    ├── schema.sql         # هيكل قاعدة البيانات
    └── sample_data.sql    # البيانات التجريبية
```

---

## متطلبات النظام التفصيلية

### متطلبات الخادم:

#### الحد الأدنى:
- **نظام التشغيل**: Windows Server 2016+ أو Linux Ubuntu 18.04+
- **المعالج**: Intel Core i3 أو AMD Ryzen 3
- **الذاكرة**: 4 GB RAM
- **التخزين**: 50 GB مساحة فارغة
- **الشبكة**: اتصال إنترنت 10 Mbps

#### المُوصى به:
- **نظام التشغيل**: Windows Server 2022 أو Linux Ubuntu 22.04 LTS
- **المعالج**: Intel Core i7 أو AMD Ryzen 7
- **الذاكرة**: 16 GB RAM أو أكثر
- **التخزين**: 200 GB SSD
- **الشبكة**: اتصال إنترنت 100 Mbps

#### للاستخدام المكثف:
- **المعالج**: Intel Xeon أو AMD EPYC
- **الذاكرة**: 32 GB RAM أو أكثر
- **التخزين**: 500 GB NVMe SSD
- **الشبكة**: اتصال مخصص 1 Gbps

### متطلبات قاعدة البيانات:

#### IndexedDB (محلية):
- **مساحة التخزين**: 2 GB كحد أدنى
- **دعم المتصفح**: Chrome 23+, Firefox 10+, Safari 7+
- **حجم الكائن**: 64 MB كحد أقصى
- **عدد الكائنات**: مليون كائن كحد أقصى

#### MySQL (خادم):
- **الإصدار**: MySQL 8.0+ أو MariaDB 10.5+
- **الذاكرة المخصصة**: 2 GB كحد أدنى، 8 GB مُوصى
- **مساحة التخزين**: 100 GB للبيانات + 100 GB للنسخ الاحتياطية
- **الاتصالات المتزامنة**: 100 اتصال كحد أدنى

### متطلبات العميل:

#### المتصفحات المدعومة:
- **Google Chrome**: 90+ (مُوصى بشدة)
- **Mozilla Firefox**: 88+
- **Microsoft Edge**: 90+
- **Safari**: 14+ (macOS/iOS)
- **Opera**: 76+

#### إعدادات المتصفح:
- **JavaScript**: مفعل (ضروري)
- **Cookies**: مفعلة
- **Local Storage**: مدعوم (5 MB كحد أدنى)
- **IndexedDB**: مدعوم
- **WebGL**: مفعل (للرسوم البيانية)

---

## التثبيت والإعداد الكامل

### التثبيت على Windows Server:

#### 1. تثبيت Node.js:
```powershell
# تحميل Node.js 18 LTS
Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi" -OutFile "nodejs.msi"
Start-Process msiexec.exe -Wait -ArgumentList '/I nodejs.msi /quiet'

# التحقق من التثبيت
node --version
npm --version
```

#### 2. تثبيت MySQL:
```powershell
# تحميل MySQL 8.0
Invoke-WebRequest -Uri "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.35.0.msi" -OutFile "mysql-installer.msi"
Start-Process mysql-installer.msi -Wait

# إعداد قاعدة البيانات
mysql -u root -p < src/database/schema.sql
```

#### 3. تثبيت النظام:
```powershell
# استنساخ المشروع
git clone https://github.com/irrigation-ministry/management-system.git
cd management-system

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
copy .env.example .env
notepad .env

# بناء المشروع
npm run build

# تشغيل الخادم
npm run preview
```

### التثبيت على Linux Ubuntu:

#### 1. تحديث النظام:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git -y
```

#### 2. تثبيت Node.js:
```bash
# إضافة مستودع Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# التحقق من التثبيت
node --version
npm --version
```

#### 3. تثبيت MySQL:
```bash
# تثبيت MySQL Server
sudo apt install mysql-server -y

# تأمين التثبيت
sudo mysql_secure_installation

# إنشاء قاعدة البيانات
sudo mysql -u root -p < src/database/schema.sql
```

#### 4. إعداد Nginx (اختياري):
```bash
# تثبيت Nginx
sudo apt install nginx -y

# إعداد الموقع
sudo nano /etc/nginx/sites-available/irrigation-system

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/irrigation-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### إعداد متغيرات البيئة:

#### ملف .env:
```env
# إعدادات قاعدة البيانات
DB_HOST=localhost
DB_PORT=3306
DB_NAME=irrigation_management_system
DB_USER=irrigation_user
DB_PASSWORD=secure_password

# إعدادات النظام
SYSTEM_NAME="نظام إدارة مصلحة الري"
ORGANIZATION_NAME="وزارة الموارد المائية والري"
SYSTEM_VERSION=1.0.0

# إعدادات الأمان
JWT_SECRET=your_jwt_secret_key_here
SESSION_TIMEOUT=30
MAX_LOGIN_ATTEMPTS=5

# إعدادات الملفات
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,png,gif

# إعدادات النسخ الاحتياطي
BACKUP_ENABLED=true
BACKUP_INTERVAL=24
BACKUP_RETENTION_DAYS=30

# إعدادات الإشعارات
NOTIFICATIONS_ENABLED=true
EMAIL_NOTIFICATIONS=true
BROWSER_NOTIFICATIONS=true
```

---

## إدارة قاعدة البيانات الشاملة

### هيكل قاعدة البيانات التفصيلي:

#### الجداول الرئيسية:

##### 1. جدول الموظفين (employees):
```sql
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
    salary DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
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
    INDEX idx_employees_rating (rating)
);
```

##### 2. جدول المهام (tasks):
```sql
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
    assigned_to JSON,
    completed_by JSON,
    attachments JSON,
    notes TEXT,
    completion_percentage INT DEFAULT 0,
    estimated_hours INT,
    actual_hours INT,
    linked_correspondence_id VARCHAR(36),
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
```

### صيانة قاعدة البيانات:

#### 1. التحسين الدوري:
```sql
-- تحليل الجداول لتحسين الأداء
ANALYZE TABLE employees, tasks, correspondence_incoming, correspondence_outgoing, departments, divisions;

-- إعادة بناء الفهارس
OPTIMIZE TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;

-- تنظيف السجلات المحذوفة منطقياً
DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH) AND is_read = TRUE;
```

#### 2. مراقبة الأداء:
```sql
-- فحص حجم الجداول
SELECT 
    table_name AS 'الجدول',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'الحجم (MB)',
    table_rows AS 'عدد الصفوف'
FROM information_schema.tables 
WHERE table_schema = 'irrigation_management_system'
ORDER BY (data_length + index_length) DESC;

-- فحص الاستعلامات البطيئة
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log 
ORDER BY query_time DESC 
LIMIT 10;
```

#### 3. النسخ الاحتياطي المتقدم:
```bash
#!/bin/bash
# ملف: /opt/irrigation/scripts/advanced_backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/irrigation/backups"
DB_NAME="irrigation_management_system"
DB_USER="backup_user"
DB_PASS="backup_password"

# إنشاء مجلدات النسخ الاحتياطي
mkdir -p $BACKUP_DIR/{daily,weekly,monthly}

# تحديد نوع النسخة الاحتياطية
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)

if [ "$DAY_OF_MONTH" = "01" ]; then
    BACKUP_TYPE="monthly"
    RETENTION_DAYS=365
elif [ "$DAY_OF_WEEK" = "7" ]; then
    BACKUP_TYPE="weekly"
    RETENTION_DAYS=90
else
    BACKUP_TYPE="daily"
    RETENTION_DAYS=30
fi

# نسخ احتياطي لقاعدة البيانات
mysqldump -u$DB_USER -p$DB_PASS \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    $DB_NAME > $BACKUP_DIR/$BACKUP_TYPE/db_backup_$DATE.sql

# ضغط النسخة الاحتياطية
gzip $BACKUP_DIR/$BACKUP_TYPE/db_backup_$DATE.sql

# نسخ احتياطي للملفات
tar -czf $BACKUP_DIR/$BACKUP_TYPE/files_backup_$DATE.tar.gz \
    /opt/irrigation/uploads \
    /opt/irrigation/config \
    /opt/irrigation/logs

# حذف النسخ القديمة
find $BACKUP_DIR/$BACKUP_TYPE -name "*.gz" -mtime +$RETENTION_DAYS -delete

# تسجيل النتيجة
echo "$(date): $BACKUP_TYPE backup completed successfully" >> /var/log/irrigation_backup.log

# إرسال تقرير (اختياري)
if [ "$BACKUP_TYPE" = "monthly" ]; then
    echo "Monthly backup completed for $DB_NAME" | mail -s "Backup Report" admin@irrigation.gov.eg
fi
```

---

## النسخ الاحتياطي والاستعادة المتقدمة

### استراتيجية النسخ الاحتياطي:

#### 1. النسخ التلقائي المتدرج:
- **يومي**: نسخ تزايدية للتغييرات
- **أسبوعي**: نسخ تفاضلية للأسبوع
- **شهري**: نسخ كاملة شاملة
- **ربع سنوي**: نسخ أرشيفية طويلة المدى

#### 2. أنواع النسخ الاحتياطي:
- **نسخ كاملة**: جميع البيانات والملفات
- **نسخ البيانات فقط**: بدون المرفقات
- **نسخ الإعدادات**: التكوين والتخصيصات
- **نسخ انتقائية**: جداول أو أقسام محددة

#### 3. التحقق من سلامة النسخ:
```bash
#!/bin/bash
# فحص سلامة النسخة الاحتياطية

BACKUP_FILE=$1
TEMP_DB="irrigation_test_restore"

# إنشاء قاعدة بيانات مؤقتة
mysql -u root -p -e "CREATE DATABASE $TEMP_DB;"

# استعادة النسخة في قاعدة البيانات المؤقتة
gunzip -c $BACKUP_FILE | mysql -u root -p $TEMP_DB

# فحص سلامة البيانات
TABLES_COUNT=$(mysql -u root -p -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TEMP_DB';" | tail -1)
RECORDS_COUNT=$(mysql -u root -p -e "SELECT SUM(table_rows) FROM information_schema.tables WHERE table_schema='$TEMP_DB';" | tail -1)

echo "عدد الجداول: $TABLES_COUNT"
echo "عدد السجلات: $RECORDS_COUNT"

# حذف قاعدة البيانات المؤقتة
mysql -u root -p -e "DROP DATABASE $TEMP_DB;"

if [ $TABLES_COUNT -gt 0 ] && [ $RECORDS_COUNT -gt 0 ]; then
    echo "النسخة الاحتياطية سليمة"
    exit 0
else
    echo "النسخة الاحتياطية تالفة"
    exit 1
fi
```

### الاستعادة المتقدمة:

#### 1. الاستعادة الكاملة:
```bash
#!/bin/bash
# استعادة كاملة للنظام

BACKUP_DATE=$1
BACKUP_DIR="/opt/irrigation/backups"
DB_NAME="irrigation_management_system"

# إيقاف النظام
systemctl stop nginx
systemctl stop mysql

# نسخ احتياطي للحالة الحالية
mysqldump $DB_NAME > /tmp/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة قاعدة البيانات
gunzip -c $BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz | mysql $DB_NAME

# استعادة الملفات
tar -xzf $BACKUP_DIR/files_backup_$BACKUP_DATE.tar.gz -C /

# إعادة تشغيل الخدمات
systemctl start mysql
systemctl start nginx

# فحص سلامة النظام
curl -f http://localhost/health-check || echo "تحذير: النظام قد لا يعمل بشكل صحيح"

echo "تمت الاستعادة بنجاح"
```

#### 2. الاستعادة الانتقائية:
```sql
-- استعادة جدول واحد فقط
CREATE TABLE employees_backup AS SELECT * FROM employees;
DROP TABLE employees;

-- استعادة من النسخة الاحتياطية
SOURCE /path/to/backup/employees_only.sql;

-- التحقق من البيانات
SELECT COUNT(*) FROM employees;
SELECT * FROM employees LIMIT 5;
```

---

## مراقبة الأداء والتحسين

### مراقبة الخادم:

#### 1. مراقبة الموارد:
```bash
#!/bin/bash
# ملف: /opt/irrigation/scripts/monitor_system.sh

# مراقبة استخدام المعالج
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')

# مراقبة استخدام الذاكرة
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')

# مراقبة مساحة القرص
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')

# مراقبة قاعدة البيانات
DB_CONNECTIONS=$(mysql -e "SHOW STATUS LIKE 'Threads_connected';" | awk 'NR==2{print $2}')
DB_QUERIES=$(mysql -e "SHOW STATUS LIKE 'Queries';" | awk 'NR==2{print $2}')

# تسجيل النتائج
echo "$(date): CPU: $CPU_USAGE%, Memory: $MEMORY_USAGE%, Disk: $DISK_USAGE%, DB Connections: $DB_CONNECTIONS, DB Queries: $DB_QUERIES" >> /var/log/irrigation_monitoring.log

# تنبيهات للاستخدام العالي
if [ $(echo "$CPU_USAGE > 80" | bc) -eq 1 ]; then
    echo "تحذير: استخدام المعالج عالي ($CPU_USAGE%)" | mail -s "CPU Alert" admin@irrigation.gov.eg
fi

if [ $(echo "$MEMORY_USAGE > 85" | bc) -eq 1 ]; then
    echo "تحذير: استخدام الذاكرة عالي ($MEMORY_USAGE%)" | mail -s "Memory Alert" admin@irrigation.gov.eg
fi

if [ $DISK_USAGE -gt 90 ]; then
    echo "تحذير: مساحة القرص ممتلئة ($DISK_USAGE%)" | mail -s "Disk Alert" admin@irrigation.gov.eg
fi
```

#### 2. مراقبة قاعدة البيانات:
```sql
-- مراقبة الأداء
SELECT 
    SCHEMA_NAME as 'قاعدة البيانات',
    DEFAULT_CHARACTER_SET_NAME as 'ترميز الأحرف',
    DEFAULT_COLLATION_NAME as 'ترتيب الأحرف'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'irrigation_management_system';

-- مراقبة الاتصالات
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
SHOW STATUS LIKE 'Aborted_connects';

-- مراقبة الاستعلامات
SHOW STATUS LIKE 'Queries';
SHOW STATUS LIKE 'Slow_queries';
SHOW STATUS LIKE 'Questions';

-- مراقبة الذاكرة
SHOW STATUS LIKE 'Innodb_buffer_pool_pages_total';
SHOW STATUS LIKE 'Innodb_buffer_pool_pages_free';
SHOW STATUS LIKE 'Innodb_buffer_pool_pages_data';
```

### تحسين الأداء:

#### 1. تحسين قاعدة البيانات:
```sql
-- تحسين إعدادات MySQL
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
SET GLOBAL query_cache_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;

-- إضافة فهارس للاستعلامات الشائعة
CREATE INDEX idx_tasks_status_date ON tasks(status, start_date);
CREATE INDEX idx_correspondence_date_urgency ON correspondence_incoming(date, urgency);
CREATE INDEX idx_employees_dept_status ON employees(department_id, status);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- تحسين الجداول
OPTIMIZE TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;
```

#### 2. تحسين الواجهة الأمامية:
```javascript
// تحسين تحميل المكونات
const LazyTaskList = React.lazy(() => import('./components/Tasks/TaskList'));
const LazyEmployeeList = React.lazy(() => import('./components/Employees/EmployeeList'));
const LazyCorrespondenceList = React.lazy(() => import('./components/Correspondence/CorrespondenceList'));

// تحسين الصور
const optimizeImage = (file) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = Math.min(img.width, 800);
        canvas.height = Math.min(img.height, 600);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            // استخدام الصورة المحسنة
        }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
};

// تحسين الذاكرة
const useMemoryOptimization = () => {
    useEffect(() => {
        const cleanup = () => {
            // تنظيف المراجع غير المستخدمة
            if (window.gc) {
                window.gc();
            }
        };
        
        const interval = setInterval(cleanup, 300000); // كل 5 دقائق
        return () => clearInterval(interval);
    }, []);
};
```

---

## استكشاف الأخطاء وإصلاحها

### المشاكل الشائعة والحلول:

#### 1. مشاكل تسجيل الدخول:

**المشكلة**: "اسم المستخدم أو كلمة المرور غير صحيحة"
**الحلول**:
```sql
-- فحص بيانات المستخدم
SELECT id, name, email, status FROM employees WHERE email = 'user@irrigation.gov.eg';

-- إعادة تعيين كلمة المرور
UPDATE employees SET password = MD5('new_password_123') WHERE id = 'user_id';

-- فحص حالة الحساب
SELECT status, deleted_at FROM employees WHERE id = 'user_id';
```

#### 2. مشاكل في تحميل البيانات:

**المشكلة**: "خطأ في تحميل البيانات"
**الحلول**:
```javascript
// فحص حالة IndexedDB
const checkIndexedDB = async () => {
    try {
        const request = indexedDB.open('IrrigationManagementDB');
        request.onsuccess = () => {
            console.log('قاعدة البيانات المحلية تعمل بشكل صحيح');
        };
        request.onerror = () => {
            console.error('خطأ في قاعدة البيانات المحلية');
            // إعادة تهيئة قاعدة البيانات
            await databaseService.initialize();
        };
    } catch (error) {
        console.error('خطأ في فحص قاعدة البيانات:', error);
    }
};

// مسح البيانات التالفة
const clearCorruptedData = () => {
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.deleteDatabase('IrrigationManagementDB');
    window.location.reload();
};
```

#### 3. مشاكل في الطباعة:

**المشكلة**: التقارير لا تطبع بشكل صحيح
**الحلول**:
```css
/* إعدادات الطباعة المحسنة */
@media print {
    /* إخفاء عناصر غير ضرورية */
    .no-print, .sidebar, .header-actions {
        display: none !important;
    }
    
    /* تحسين التخطيط للطباعة */
    .print-container {
        width: 100% !important;
        margin: 0 !important;
        padding: 20px !important;
    }
    
    /* ألوان مناسبة للطباعة */
    .bg-blue-600 {
        background-color: #1e40af !important;
        color: white !important;
    }
    
    /* فواصل الصفحات */
    .page-break {
        page-break-before: always;
    }
    
    /* حجم الخط للطباعة */
    body {
        font-size: 12pt !important;
        line-height: 1.4 !important;
    }
}
```

#### 4. مشاكل في الاستيراد/التصدير:

**المشكلة**: فشل في استيراد ملف Excel
**الحلول**:
```javascript
// فحص صحة ملف Excel
const validateExcelFile = (file) => {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. يرجى استخدام ملف Excel (.xlsx أو .xls)');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
    }
    
    return true;
};

// معالجة أخطاء الاستيراد
const handleImportError = (error, rowIndex) => {
    const errorMessages = {
        'DUPLICATE_ENTRY': `الصف ${rowIndex}: بيانات مكررة`,
        'INVALID_DATE': `الصف ${rowIndex}: تاريخ غير صحيح`,
        'MISSING_REQUIRED': `الصف ${rowIndex}: حقول مطلوبة مفقودة`,
        'INVALID_EMAIL': `الصف ${rowIndex}: بريد إلكتروني غير صحيح`
    };
    
    return errorMessages[error.code] || `الصف ${rowIndex}: خطأ غير معروف`;
};
```

---

## الأمان والحماية المتقدمة

### طبقات الأمان:

#### 1. أمان التطبيق:
```javascript
// تشفير البيانات الحساسة
import CryptoJS from 'crypto-js';

const encryptSensitiveData = (data, secretKey) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptSensitiveData = (encryptedData, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// التحقق من صحة الجلسة
const validateSession = () => {
    const sessionData = sessionStorage.getItem('userSession');
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    const now = new Date().getTime();
    
    if (now > session.expiresAt) {
        sessionStorage.removeItem('userSession');
        return false;
    }
    
    return true;
};
```

#### 2. أمان قاعدة البيانات:
```sql
-- إنشاء مستخدمين مخصصين
CREATE USER 'irrigation_read'@'localhost' IDENTIFIED BY 'read_password_123';
CREATE USER 'irrigation_write'@'localhost' IDENTIFIED BY 'write_password_456';
CREATE USER 'irrigation_admin'@'localhost' IDENTIFIED BY 'admin_password_789';

-- منح صلاحيات محددة
GRANT SELECT ON irrigation_management_system.* TO 'irrigation_read'@'localhost';
GRANT SELECT, INSERT, UPDATE ON irrigation_management_system.* TO 'irrigation_write'@'localhost';
GRANT ALL PRIVILEGES ON irrigation_management_system.* TO 'irrigation_admin'@'localhost';

-- تطبيق التغييرات
FLUSH PRIVILEGES;

-- تشفير الاتصالات
ALTER USER 'irrigation_admin'@'localhost' REQUIRE SSL;
```

#### 3. مراقبة الأمان:
```bash
#!/bin/bash
# مراقبة محاولات الاختراق

# فحص محاولات تسجيل الدخول الفاشلة
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | wc -l)
if [ $FAILED_LOGINS -gt 10 ]; then
    echo "تحذير: $FAILED_LOGINS محاولة دخول فاشلة" | mail -s "Security Alert" admin@irrigation.gov.eg
fi

# فحص الاتصالات المشبوهة
SUSPICIOUS_CONNECTIONS=$(netstat -an | grep :3306 | grep -v "127.0.0.1\|localhost" | wc -l)
if [ $SUSPICIOUS_CONNECTIONS -gt 5 ]; then
    echo "تحذير: $SUSPICIOUS_CONNECTIONS اتصال مشبوه بقاعدة البيانات" | mail -s "Database Security Alert" admin@irrigation.gov.eg
fi

# فحص تغييرات الملفات المهمة
find /opt/irrigation/config -name "*.conf" -mtime -1 -exec echo "تم تعديل ملف التكوين: {}" \; | mail -s "Config Change Alert" admin@irrigation.gov.eg
```

---

## التحديثات والترقيات

### عملية الترقية الآمنة:

#### 1. التحضير للترقية:
```bash
#!/bin/bash
# ملف: /opt/irrigation/scripts/prepare_upgrade.sh

# إنشاء نسخة احتياطية كاملة
./backup.sh full

# فحص متطلبات النظام
node --version
npm --version
mysql --version

# فحص مساحة القرص
AVAILABLE_SPACE=$(df -BG /opt/irrigation | awk 'NR==2{print $4}' | sed 's/G//')
if [ $AVAILABLE_SPACE -lt 5 ]; then
    echo "خطأ: مساحة القرص غير كافية للترقية"
    exit 1
fi

# إيقاف النظام
systemctl stop nginx
systemctl stop irrigation-app

echo "النظام جاهز للترقية"
```

#### 2. تطبيق الترقية:
```bash
#!/bin/bash
# ملف: /opt/irrigation/scripts/apply_upgrade.sh

VERSION=$1
BACKUP_DIR="/opt/irrigation/backups/pre_upgrade"

# إنشاء نسخة احتياطية قبل الترقية
mkdir -p $BACKUP_DIR
cp -r /opt/irrigation/app $BACKUP_DIR/
mysqldump irrigation_management_system > $BACKUP_DIR/database.sql

# تحميل الإصدار الجديد
wget https://releases.irrigation.gov.eg/v$VERSION/irrigation-system-v$VERSION.tar.gz
tar -xzf irrigation-system-v$VERSION.tar.gz

# تطبيق تحديثات قاعدة البيانات
if [ -f "database/upgrade_to_$VERSION.sql" ]; then
    mysql irrigation_management_system < database/upgrade_to_$VERSION.sql
fi

# تحديث التبعيات
npm install

# بناء النظام الجديد
npm run build

# تشغيل اختبارات ما بعد الترقية
npm test

# إعادة تشغيل النظام
systemctl start irrigation-app
systemctl start nginx

echo "تمت الترقية إلى الإصدار $VERSION بنجاح"
```

#### 3. التراجع عن الترقية:
```bash
#!/bin/bash
# ملف: /opt/irrigation/scripts/rollback_upgrade.sh

BACKUP_DIR="/opt/irrigation/backups/pre_upgrade"

# إيقاف النظام
systemctl stop nginx
systemctl stop irrigation-app

# استعادة الملفات
rm -rf /opt/irrigation/app
cp -r $BACKUP_DIR/app /opt/irrigation/

# استعادة قاعدة البيانات
mysql irrigation_management_system < $BACKUP_DIR/database.sql

# إعادة تشغيل النظام
systemctl start irrigation-app
systemctl start nginx

echo "تم التراجع عن الترقية بنجاح"
```

---

## سجلات النظام والمراقبة

### أنواع السجلات:

#### 1. سجل التطبيق:
```bash
# مسار السجل: /var/log/irrigation/app.log

# عرض آخر الأخطاء
tail -f /var/log/irrigation/app.log | grep ERROR

# فحص أخطاء معينة
grep "Database connection failed" /var/log/irrigation/app.log

# إحصائيات الأخطاء
awk '/ERROR/ {count++} END {print "إجمالي الأخطاء:", count}' /var/log/irrigation/app.log
```

#### 2. سجل قاعدة البيانات:
```bash
# سجل أخطاء MySQL
tail -f /var/log/mysql/error.log

# سجل الاستعلامات البطيئة
tail -f /var/log/mysql/slow.log

# سجل الاتصالات
grep "Connect" /var/log/mysql/mysql.log
```

#### 3. سجل الويب:
```bash
# سجل وصول Nginx
tail -f /var/log/nginx/access.log

# سجل أخطاء Nginx
tail -f /var/log/nginx/error.log

# إحصائيات الزيارات
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

### تحليل السجلات:

#### 1. أدوات التحليل:
```bash
# تحليل أداء النظام
#!/bin/bash

# تحليل أوقات الاستجابة
awk '{print $NF}' /var/log/nginx/access.log | awk '{sum+=$1; count++} END {print "متوسط وقت الاستجابة:", sum/count, "ثانية"}'

# تحليل رموز الحالة
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# تحليل أكثر الصفحات زيارة
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# تحليل ساعات الذروة
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c | sort -nr
```

#### 2. تنبيهات تلقائية:
```bash
#!/bin/bash
# ملف: /opt/irrigation/scripts/log_alerts.sh

# تنبيه للأخطاء الكثيرة
ERROR_COUNT=$(grep -c "ERROR" /var/log/irrigation/app.log)
if [ $ERROR_COUNT -gt 50 ]; then
    echo "تحذير: $ERROR_COUNT خطأ في سجل التطبيق" | mail -s "High Error Count" admin@irrigation.gov.eg
fi

# تنبيه لاستخدام الذاكرة العالي
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "تحذير: استخدام الذاكرة $MEMORY_USAGE%" | mail -s "High Memory Usage" admin@irrigation.gov.eg
fi

# تنبيه للاتصالات المرفوضة
REJECTED_CONNECTIONS=$(grep "Connection refused" /var/log/mysql/error.log | wc -l)
if [ $REJECTED_CONNECTIONS -gt 10 ]; then
    echo "تحذير: $REJECTED_CONNECTIONS اتصال مرفوض لقاعدة البيانات" | mail -s "Database Connection Issues" admin@irrigation.gov.eg
fi
```

---

## إجراءات الطوارئ

### خطة الاستجابة للطوارئ:

#### 1. انقطاع الخدمة الكامل:

**الإجراءات الفورية** (خلال 5 دقائق):
```bash
# فحص سريع للنظام
systemctl status nginx mysql irrigation-app
ps aux | grep -E "(nginx|mysql|node)"
netstat -tlnp | grep -E "(80|443|3306)"

# إعادة تشغيل الخدمات
systemctl restart mysql
systemctl restart nginx
systemctl restart irrigation-app

# فحص السجلات
tail -20 /var/log/nginx/error.log
tail -20 /var/log/mysql/error.log
tail -20 /var/log/irrigation/app.log
```

**الإجراءات المتوسطة** (خلال 15 دقيقة):
```bash
# فحص شامل للنظام
df -h  # فحص مساحة القرص
free -h  # فحص الذاكرة
top  # فحص العمليات

# فحص قاعدة البيانات
mysql -e "SELECT 1;" # فحص الاتصال
mysql -e "SHOW PROCESSLIST;" # فحص العمليات النشطة
mysql -e "CHECK TABLE employees, tasks, correspondence_incoming;"

# فحص الشبكة
ping -c 4 8.8.8.8  # فحص الإنترنت
netstat -i  # فحص واجهات الشبكة
```

#### 2. فقدان البيانات:

**الإجراءات الطارئة**:
```bash
# إيقاف النظام فوراً
systemctl stop nginx irrigation-app

# تقييم الضرر
mysql -e "SELECT COUNT(*) FROM employees;"
mysql -e "SELECT COUNT(*) FROM tasks;"
mysql -e "SELECT COUNT(*) FROM correspondence_incoming;"

# استعادة من آخر نسخة احتياطية
LATEST_BACKUP=$(ls -t /opt/irrigation/backups/daily/*.sql.gz | head -1)
gunzip -c $LATEST_BACKUP | mysql irrigation_management_system

# فحص سلامة البيانات المستعادة
mysql -e "SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL;"
mysql -e "SELECT MAX(created_at) FROM activity_logs;"

# إعادة تشغيل النظام
systemctl start irrigation-app
systemctl start nginx
```

#### 3. اختراق أمني:

**الإجراءات الفورية**:
```bash
# عزل النظام
iptables -A INPUT -j DROP  # حظر جميع الاتصالات الواردة
iptables -A OUTPUT -j DROP  # حظر جميع الاتصالات الصادرة

# فحص السجلات الأمنية
grep "Failed password" /var/log/auth.log | tail -50
grep "Invalid user" /var/log/auth.log | tail -50
last -f /var/log/wtmp | head -20

# تغيير كلمات المرور
mysql -e "UPDATE employees SET password = MD5(CONCAT(id, 'new_salt', RAND()));"

# فحص الملفات المعدلة
find /opt/irrigation -type f -mtime -1 -ls

# تقرير الحادث
echo "تم اكتشاف نشاط مشبوه في $(date)" > /tmp/security_incident.txt
echo "تفاصيل الحادث:" >> /tmp/security_incident.txt
tail -100 /var/log/auth.log >> /tmp/security_incident.txt
```

### جهات الاتصال في الطوارئ:

#### فريق الدعم الفني:
- **مدير النظام الرئيسي**: +20-10-0073-1116
- **مطور النظام**: abdelaalmiti@gmail.com
- **الدعم الفني**: support@irrigation.gov.eg
- **الأمان السيبراني**: security@irrigation.gov.eg

#### الإدارة العليا:
- **مدير عام المصلحة**: +20-2-xxxx-xxxx
- **مدير إدارة تقنية المعلومات**: +20-2-xxxx-xxxx
- **مسؤول الأمان**: +20-2-xxxx-xxxx

---

## الصيانة الدورية

### جدول الصيانة:

#### يومياً:
- [ ] فحص حالة الخدمات (nginx, mysql, app)
- [ ] مراجعة سجلات الأخطاء
- [ ] التحقق من نجاح النسخة الاحتياطية
- [ ] مراقبة استخدام الموارد (CPU, Memory, Disk)
- [ ] فحص الاتصالات النشطة
- [ ] مراجعة الإشعارات الأمنية

#### أسبوعياً:
- [ ] تحليل أداء قاعدة البيانات
- [ ] تنظيف السجلات القديمة
- [ ] فحص سلامة النسخ الاحتياطية
- [ ] مراجعة تقارير الاستخدام
- [ ] تحديث قوائم الأمان
- [ ] فحص مساحة التخزين

#### شهرياً:
- [ ] تحديث النظام والتبعيات
- [ ] تحسين قاعدة البيانات (OPTIMIZE)
- [ ] مراجعة صلاحيات المستخدمين
- [ ] تحليل تقارير الأداء
- [ ] فحص أمان شامل
- [ ] تدريب المستخدمين الجدد

#### ربع سنوياً:
- [ ] مراجعة خطة الطوارئ
- [ ] تحديث وثائق النظام
- [ ] تقييم الأمان الشامل
- [ ] مراجعة عقود الدعم
- [ ] تخطيط الترقيات
- [ ] تدريب فريق الدعم

#### سنوياً:
- [ ] ترقية رئيسية للنظام
- [ ] مراجعة شاملة للأمان
- [ ] تحديث خطة الاستمرارية
- [ ] تقييم الأداء السنوي
- [ ] تجديد الشهادات الأمنية
- [ ] مراجعة السياسات والإجراءات

---

## استكشاف أخطاء المكونات

### مشاكل المكونات الفردية:

#### 1. مشاكل لوحة التحكم:
```javascript
// فحص تحميل البيانات
const debugDashboard = () => {
    console.log('حالة البيانات:');
    console.log('المهام:', state.tasks.length);
    console.log('الموظفين:', state.employees.length);
    console.log('المراسلات:', state.correspondence.length);
    console.log('الإدارات:', state.departments.length);
    
    // فحص الرسوم البيانية
    const chartData = {
        tasks: state.tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {}),
        correspondence: state.correspondence.reduce((acc, corr) => {
            acc[corr.type] = (acc[corr.type] || 0) + 1;
            return acc;
        }, {})
    };
    
    console.log('بيانات الرسوم البيانية:', chartData);
};
```

#### 2. مشاكل إدارة المهام:
```javascript
// فحص حفظ المهام
const debugTaskSave = async (taskData) => {
    try {
        console.log('بيانات المهمة:', taskData);
        
        // التحقق من صحة البيانات
        const validation = validateTask(taskData);
        console.log('نتيجة التحقق:', validation);
        
        if (!validation.isValid) {
            console.error('أخطاء التحقق:', validation.errors);
            return;
        }
        
        // محاولة الحفظ
        const result = await databaseService.add('tasks', taskData);
        console.log('تم الحفظ بنجاح:', result);
        
    } catch (error) {
        console.error('خطأ في حفظ المهمة:', error);
        
        // فحص حالة قاعدة البيانات
        const dbStatus = await databaseService.getStatus();
        console.log('حالة قاعدة البيانات:', dbStatus);
    }
};
```

#### 3. مشاكل المراسلات:
```javascript
// فحص تحميل المراسلات
const debugCorrespondence = async () => {
    try {
        const incoming = await databaseService.getAll('correspondence_incoming');
        const outgoing = await databaseService.getAll('correspondence_outgoing');
        
        console.log('المراسلات الواردة:', incoming.length);
        console.log('المراسلات الصادرة:', outgoing.length);
        
        // فحص البيانات التالفة
        const corruptedIncoming = incoming.filter(c => !c.subject || !c.number);
        const corruptedOutgoing = outgoing.filter(c => !c.subject || !c.number);
        
        if (corruptedIncoming.length > 0) {
            console.warn('مراسلات واردة تالفة:', corruptedIncoming);
        }
        
        if (corruptedOutgoing.length > 0) {
            console.warn('مراسلات صادرة تالفة:', corruptedOutgoing);
        }
        
    } catch (error) {
        console.error('خطأ في تحميل المراسلات:', error);
    }
};
```

---

## تحسين الأداء المتقدم

### تحسين قاعدة البيانات:

#### 1. تحسين الاستعلامات:
```sql
-- فحص خطط التنفيذ
EXPLAIN SELECT * FROM tasks WHERE status = 'قيد التنفيذ' AND department_id = 'dept-001';

-- إضافة فهارس مركبة
CREATE INDEX idx_tasks_status_dept ON tasks(status, department_id);
CREATE INDEX idx_correspondence_date_urgency ON correspondence_incoming(date, urgency);

-- تحسين استعلامات الإحصائيات
CREATE VIEW task_statistics AS
SELECT 
    department_id,
    status,
    COUNT(*) as task_count,
    AVG(points) as avg_points
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY department_id, status;
```

#### 2. تحسين التخزين:
```sql
-- ضغط الجداول
ALTER TABLE activity_logs ROW_FORMAT=COMPRESSED;
ALTER TABLE attachments ROW_FORMAT=COMPRESSED;

-- تقسيم الجداول الكبيرة (إذا لزم الأمر)
CREATE TABLE activity_logs_2024 LIKE activity_logs;
INSERT INTO activity_logs_2024 SELECT * FROM activity_logs WHERE YEAR(timestamp) = 2024;

-- أرشفة البيانات القديمة
CREATE TABLE archived_tasks AS 
SELECT * FROM tasks 
WHERE status = 'مكتملة' 
AND completed_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

### تحسين الواجهة:

#### 1. تحسين التحميل:
```javascript
// تحميل تدريجي للبيانات
const useProgressiveLoading = (dataType) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 50;

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await databaseService.getPaginated(dataType, page, pageSize);
                setData(prev => page === 1 ? result : [...prev, ...result]);
                setLoading(false);
            } catch (error) {
                console.error('خطأ في التحميل:', error);
            }
        };

        loadData();
    }, [dataType, page]);

    const loadMore = () => setPage(prev => prev + 1);

    return { data, loading, loadMore };
};
```

#### 2. تحسين الذاكرة:
```javascript
// تنظيف الذاكرة التلقائي
const useMemoryCleanup = () => {
    useEffect(() => {
        const cleanup = () => {
            // إزالة المستمعين غير المستخدمين
            document.removeEventListener('click', unusedHandler);
            
            // تنظيف المؤقتات
            clearInterval(unusedInterval);
            clearTimeout(unusedTimeout);
            
            // تنظيف المراجع
            unusedRef.current = null;
        };

        // تنظيف دوري
        const interval = setInterval(() => {
            if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024) {
                cleanup();
            }
        }, 60000);

        return () => {
            clearInterval(interval);
            cleanup();
        };
    }, []);
};
```

---

## معلومات الاتصال والدعم

### فريق التطوير والصيانة:
- **المطور الرئيسي**: م. عبدالعال محمد
- **الهاتف**: +201000731116
- **البريد الإلكتروني**: abdelaalmiti@gmail.com
- **ساعات العمل**: 24/7 للطوارئ

### الدعم الفني:
- **الخط الساخن**: 123-456-7890
- **البريد الإلكتروني**: support@irrigation.gov.eg
- **نظام التذاكر**: https://support.irrigation.gov.eg
- **ساعات العمل**: الأحد - الخميس (8:00 ص - 4:00 م)

### الدعم المتقدم:
- **استشارات فنية**: consulting@irrigation.gov.eg
- **تطوير مخصص**: development@irrigation.gov.eg
- **تدريب**: training@irrigation.gov.eg

---

*تم إعداد هذا الدليل بواسطة فريق تطوير النظم*
*وزارة الموارد المائية والري - جمهورية مصر العربية*
*م. عبدالعال محمد - المطور الرئيسي*
*آخر تحديث: يناير 2024*
*الإصدار: 1.0*