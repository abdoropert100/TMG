# دليل الصيانة والدعم الفني
## نظام إدارة مصلحة الري
### وزارة الموارد المائية والري - جمهورية مصر العربية

---

## فهرس المحتويات

1. [نظرة عامة على النظام](#نظرة-عامة-على-النظام)
2. [متطلبات النظام](#متطلبات-النظام)
3. [التثبيت والإعداد](#التثبيت-والإعداد)
4. [إدارة قاعدة البيانات](#إدارة-قاعدة-البيانات)
5. [النسخ الاحتياطي والاستعادة](#النسخ-الاحتياطي-والاستعادة)
6. [مراقبة الأداء](#مراقبة-الأداء)
7. [استكشاف الأخطاء وإصلاحها](#استكشاف-الأخطاء-وإصلاحها)
8. [الأمان والحماية](#الأمان-والحماية)
9. [التحديثات والترقيات](#التحديثات-والترقيات)
10. [سجلات النظام](#سجلات-النظام)
11. [إجراءات الطوارئ](#إجراءات-الطوارئ)

---

## نظرة عامة على النظام

### البنية التقنية:
- **الواجهة الأمامية**: React 18 + TypeScript
- **قاعدة البيانات**: IndexedDB (محلية) + MySQL (خادم)
- **التخزين**: Local Storage + File System
- **الأمان**: JWT Authentication + Role-based Access

### المكونات الرئيسية:
```
src/
├── components/          # مكونات الواجهة
├── services/           # خدمات البيانات
├── database/           # ملفات قاعدة البيانات
├── types/              # تعريفات الأنواع
└── utils/              # أدوات مساعدة
```

### ملفات التكوين:
- `package.json`: تبعيات المشروع
- `vite.config.ts`: إعدادات البناء
- `tsconfig.json`: إعدادات TypeScript
- `tailwind.config.js`: إعدادات التصميم

---

## متطلبات النظام

### متطلبات الخادم:
- **نظام التشغيل**: Windows Server 2016+ أو Linux Ubuntu 18.04+
- **المعالج**: Intel Core i5 أو أعلى
- **الذاكرة**: 8 GB RAM كحد أدنى، 16 GB مُوصى
- **التخزين**: 100 GB مساحة فارغة كحد أدنى
- **الشبكة**: اتصال إنترنت مستقر

### متطلبات قاعدة البيانات:
- **MySQL**: الإصدار 8.0 أو أحدث
- **مساحة التخزين**: 50 GB للبيانات + 50 GB للنسخ الاحتياطية
- **الذاكرة المخصصة**: 4 GB كحد أدنى

### متطلبات العميل:
- **المتصفحات المدعومة**:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **JavaScript**: مفعل
- **Local Storage**: مدعوم
- **IndexedDB**: مدعوم

---

## التثبيت والإعداد

### 1. تثبيت Node.js:
```bash
# تحميل وتثبيت Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. تثبيت التبعيات:
```bash
cd /path/to/irrigation-system
npm install
```

### 3. إعداد قاعدة البيانات:
```bash
# تسجيل الدخول إلى MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
source src/database/schema.sql

# إدراج البيانات التجريبية (اختياري)
source src/database/sample_data.sql
```

### 4. إعداد متغيرات البيئة:
```bash
# إنشاء ملف .env
cp .env.example .env

# تعديل الإعدادات
nano .env
```

### 5. بناء المشروع:
```bash
# للتطوير
npm run dev

# للإنتاج
npm run build
```

### 6. تشغيل الخادم:
```bash
# تشغيل خادم التطوير
npm run dev

# تشغيل خادم الإنتاج
npm run preview
```

---

## إدارة قاعدة البيانات

### هيكل قاعدة البيانات:

#### الجداول الرئيسية:
1. **employees**: بيانات الموظفين
2. **departments**: الإدارات
3. **divisions**: الأقسام
4. **tasks**: المهام
5. **correspondence_incoming**: المراسلات الواردة
6. **correspondence_outgoing**: المراسلات الصادرة
7. **activity_logs**: سجل النشاطات
8. **notifications**: الإشعارات
9. **system_settings**: إعدادات النظام

### صيانة قاعدة البيانات:

#### 1. تحسين الأداء:
```sql
-- تحليل الجداول
ANALYZE TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;

-- إعادة بناء الفهارس
OPTIMIZE TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;

-- تنظيف السجلات المحذوفة
DELETE FROM activity_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

#### 2. مراقبة حجم قاعدة البيانات:
```sql
-- حجم كل جدول
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'irrigation_management_system'
ORDER BY (data_length + index_length) DESC;
```

#### 3. فحص سلامة البيانات:
```sql
-- فحص الجداول
CHECK TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;

-- إصلاح الجداول إذا لزم الأمر
REPAIR TABLE table_name;
```

### إدارة المستخدمين:
```sql
-- إنشاء مستخدم جديد
CREATE USER 'irrigation_user'@'localhost' IDENTIFIED BY 'secure_password';

-- منح الصلاحيات
GRANT SELECT, INSERT, UPDATE, DELETE ON irrigation_management_system.* TO 'irrigation_user'@'localhost';

-- تطبيق التغييرات
FLUSH PRIVILEGES;
```

---

## النسخ الاحتياطي والاستعادة

### النسخ الاحتياطي التلقائي:

#### 1. إعداد النسخ الاحتياطي اليومي:
```bash
#!/bin/bash
# ملف: /opt/irrigation/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/irrigation/backups"
DB_NAME="irrigation_management_system"
DB_USER="backup_user"
DB_PASS="backup_password"

# إنشاء مجلد النسخ الاحتياطية
mkdir -p $BACKUP_DIR

# نسخ احتياطي لقاعدة البيانات
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# ضغط النسخة الاحتياطية
gzip $BACKUP_DIR/db_backup_$DATE.sql

# نسخ احتياطي للملفات
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /opt/irrigation/uploads

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### 2. جدولة النسخ الاحتياطي:
```bash
# إضافة إلى crontab
crontab -e

# تشغيل يومياً في الساعة 2:00 صباحاً
0 2 * * * /opt/irrigation/backup.sh >> /var/log/irrigation_backup.log 2>&1
```

### الاستعادة من النسخة الاحتياطية:

#### 1. استعادة قاعدة البيانات:
```bash
# فك ضغط النسخة الاحتياطية
gunzip db_backup_20240115_020000.sql.gz

# استعادة قاعدة البيانات
mysql -u root -p irrigation_management_system < db_backup_20240115_020000.sql
```

#### 2. استعادة الملفات:
```bash
# استعادة الملفات
tar -xzf files_backup_20240115_020000.tar.gz -C /
```

### النسخ الاحتياطي السحابي:
```bash
# مزامنة مع التخزين السحابي
rsync -avz /opt/irrigation/backups/ user@backup-server:/backups/irrigation/

# أو استخدام AWS S3
aws s3 sync /opt/irrigation/backups/ s3://irrigation-backups/
```

---

## مراقبة الأداء

### مراقبة الخادم:

#### 1. استخدام الموارد:
```bash
# مراقبة استخدام المعالج والذاكرة
top -p $(pgrep -f "irrigation")

# مراقبة مساحة القرص
df -h

# مراقبة استخدام الذاكرة
free -h
```

#### 2. مراقبة قاعدة البيانات:
```sql
-- العمليات النشطة
SHOW PROCESSLIST;

-- حالة قاعدة البيانات
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Queries';
SHOW STATUS LIKE 'Uptime';

-- الاستعلامات البطيئة
SHOW VARIABLES LIKE 'slow_query_log';
```

### مراقبة الأداء:

#### 1. أوقات الاستجابة:
```javascript
// في المتصفح
console.time('page-load');
// ... تحميل الصفحة
console.timeEnd('page-load');

// مراقبة استعلامات قاعدة البيانات
const startTime = performance.now();
await databaseService.getAll('employees');
const endTime = performance.now();
console.log(`Query took ${endTime - startTime} milliseconds`);
```

#### 2. استخدام الذاكرة:
```javascript
// مراقبة استخدام الذاكرة في المتصفح
if (performance.memory) {
    console.log('Used:', performance.memory.usedJSHeapSize);
    console.log('Total:', performance.memory.totalJSHeapSize);
    console.log('Limit:', performance.memory.jsHeapSizeLimit);
}
```

### تحسين الأداء:

#### 1. تحسين قاعدة البيانات:
```sql
-- إضافة فهارس للاستعلامات الشائعة
CREATE INDEX idx_tasks_status_date ON tasks(status, start_date);
CREATE INDEX idx_correspondence_date_urgency ON correspondence_incoming(date, urgency);

-- تحسين إعدادات MySQL
SET GLOBAL innodb_buffer_pool_size = 2G;
SET GLOBAL query_cache_size = 256M;
```

#### 2. تحسين الواجهة الأمامية:
```javascript
// استخدام lazy loading للمكونات
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// تحسين الصور
const optimizedImage = {
    loading: 'lazy',
    decoding: 'async'
};

// استخدام مemoization
const MemoizedComponent = React.memo(ExpensiveComponent);
```

---

## استكشاف الأخطاء وإصلاحها

### المشاكل الشائعة:

#### 1. مشكلة تسجيل الدخول:
**الأعراض**: لا يمكن تسجيل الدخول
**الحلول**:
```bash
# فحص حالة قاعدة البيانات
systemctl status mysql

# فحص سجلات الأخطاء
tail -f /var/log/mysql/error.log

# إعادة تعيين كلمة المرور
UPDATE employees SET password = MD5('new_password') WHERE id = 'user_id';
```

#### 2. بطء في تحميل البيانات:
**الأعراض**: تحميل بطيء للصفحات
**الحلول**:
```sql
-- فحص الاستعلامات البطيئة
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- تحسين الاستعلامات
EXPLAIN SELECT * FROM tasks WHERE status = 'قيد التنفيذ';
```

#### 3. مشاكل في النسخ الاحتياطي:
**الأعراض**: فشل في إنشاء النسخة الاحتياطية
**الحلول**:
```bash
# فحص مساحة القرص
df -h

# فحص صلاحيات المجلد
ls -la /opt/irrigation/backups/

# فحص سجل النسخ الاحتياطي
tail -f /var/log/irrigation_backup.log
```

### أدوات التشخيص:

#### 1. فحص حالة النظام:
```bash
#!/bin/bash
# ملف: system_check.sh

echo "=== فحص حالة النظام ==="
echo "التاريخ: $(date)"
echo ""

echo "1. استخدام المعالج:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'

echo "2. استخدام الذاكرة:"
free -h | awk 'NR==2{printf "%.2f%%\n", $3*100/$2 }'

echo "3. مساحة القرص:"
df -h | awk '$NF=="/"{printf "%s\n", $5}'

echo "4. حالة قاعدة البيانات:"
systemctl is-active mysql

echo "5. عدد المستخدمين المتصلين:"
mysql -e "SHOW STATUS LIKE 'Threads_connected';" | awk 'NR==2{print $2}'
```

#### 2. فحص سلامة البيانات:
```sql
-- فحص تكامل البيانات
SELECT COUNT(*) as orphaned_tasks 
FROM tasks t 
LEFT JOIN employees e ON t.created_by = e.id 
WHERE e.id IS NULL;

-- فحص المراسلات بدون موظف مسؤول
SELECT COUNT(*) as unassigned_correspondence
FROM correspondence_incoming 
WHERE assigned_to IS NULL OR assigned_to = '';
```

---

## الأمان والحماية

### إعدادات الأمان:

#### 1. تأمين قاعدة البيانات:
```sql
-- إزالة المستخدمين الافتراضيين
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- تعيين كلمة مرور قوية للمدير
ALTER USER 'root'@'localhost' IDENTIFIED BY 'very_strong_password';

-- تطبيق التغييرات
FLUSH PRIVILEGES;
```

#### 2. تشفير البيانات الحساسة:
```javascript
// تشفير كلمات المرور
import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// تشفير البيانات الحساسة
import CryptoJS from 'crypto-js';

const encryptData = (data, secretKey) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};
```

#### 3. مراقبة الأمان:
```bash
# مراقبة محاولات تسجيل الدخول الفاشلة
grep "Failed password" /var/log/auth.log | tail -20

# مراقبة الاتصالات المشبوهة
netstat -an | grep :3306 | grep ESTABLISHED
```

### النسخ الاحتياطي الآمن:
```bash
# تشفير النسخ الاحتياطية
gpg --symmetric --cipher-algo AES256 db_backup.sql

# نقل آمن للنسخ الاحتياطية
scp -P 22 backup.sql.gpg user@secure-server:/secure/backups/
```

---

## التحديثات والترقيات

### تحديث النظام:

#### 1. تحديث التبعيات:
```bash
# فحص التحديثات المتاحة
npm outdated

# تحديث التبعيات
npm update

# تحديث تبعية محددة
npm install package@latest
```

#### 2. ترقية قاعدة البيانات:
```sql
-- إنشاء نسخة احتياطية قبل الترقية
mysqldump irrigation_management_system > pre_upgrade_backup.sql

-- تطبيق تحديثات الهيكل
ALTER TABLE employees ADD COLUMN last_login TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN estimated_hours INT DEFAULT 0;

-- تحديث البيانات
UPDATE system_settings SET setting_value = '"1.1"' WHERE setting_key = 'version';
```

#### 3. اختبار ما بعد الترقية:
```bash
# تشغيل اختبارات النظام
npm test

# فحص سلامة قاعدة البيانات
mysql -e "CHECK TABLE employees, tasks, correspondence_incoming, correspondence_outgoing;"
```

### إجراءات الترقية الآمنة:

#### 1. قبل الترقية:
- إنشاء نسخة احتياطية كاملة
- إشعار المستخدمين بوقت التوقف
- فحص متطلبات النظام الجديدة
- اختبار الترقية في بيئة التطوير

#### 2. أثناء الترقية:
- تطبيق وضع الصيانة
- تطبيق التحديثات بالتسلسل
- مراقبة سجلات الأخطاء
- فحص سلامة البيانات

#### 3. بعد الترقية:
- اختبار جميع الوظائف الأساسية
- فحص الأداء
- إزالة وضع الصيانة
- إشعار المستخدمين بانتهاء الصيانة

---

## سجلات النظام

### أنواع السجلات:

#### 1. سجل النشاطات:
```sql
-- عرض آخر النشاطات
SELECT * FROM activity_logs 
ORDER BY timestamp DESC 
LIMIT 50;

-- فلترة حسب المستخدم
SELECT * FROM activity_logs 
WHERE actor_id = 'user_id' 
AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY);
```

#### 2. سجل الأخطاء:
```bash
# سجل أخطاء النظام
tail -f /var/log/irrigation/error.log

# سجل أخطاء قاعدة البيانات
tail -f /var/log/mysql/error.log

# سجل أخطاء الويب
tail -f /var/log/nginx/error.log
```

#### 3. سجل الأداء:
```javascript
// تسجيل أوقات الاستجابة
const performanceLogger = {
    log: (operation, duration) => {
        console.log(`${operation}: ${duration}ms`);
        // حفظ في قاعدة البيانات أو ملف
    }
};
```

### تحليل السجلات:

#### 1. أدوات التحليل:
```bash
# تحليل سجل الوصول
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# البحث عن أخطاء محددة
grep "ERROR" /var/log/irrigation/app.log | tail -20

# إحصائيات الاستخدام
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f1 | sort | uniq -c
```

#### 2. تنظيف السجلات:
```bash
# أرشفة السجلات القديمة
find /var/log/irrigation/ -name "*.log" -mtime +30 -exec gzip {} \;

# حذف السجلات القديمة جداً
find /var/log/irrigation/ -name "*.gz" -mtime +90 -delete
```

---

## إجراءات الطوارئ

### خطة الاستجابة للطوارئ:

#### 1. انقطاع الخدمة:
**الإجراءات الفورية**:
1. فحص حالة الخادم والشبكة
2. إعادة تشغيل الخدمات إذا لزم الأمر
3. التحقق من سلامة قاعدة البيانات
4. إشعار المستخدمين

```bash
# فحص سريع للنظام
systemctl status mysql nginx
ps aux | grep irrigation
netstat -tlnp | grep :80
```

#### 2. فقدان البيانات:
**الإجراءات**:
1. إيقاف النظام فوراً
2. تقييم حجم الضرر
3. استعادة من آخر نسخة احتياطية
4. فحص سلامة البيانات المستعادة

```bash
# استعادة طارئة
mysql irrigation_management_system < /backups/latest_backup.sql
```

#### 3. اختراق أمني:
**الإجراءات**:
1. عزل النظام عن الشبكة
2. تغيير جميع كلمات المرور
3. فحص سجلات الوصول
4. تطبيق تحديثات الأمان

```bash
# تغيير كلمات المرور
mysql -e "UPDATE employees SET password = MD5(CONCAT(id, 'new_salt', 'new_password'));"
```

### جهات الاتصال في الطوارئ:

**مدير النظام الرئيسي**:
- الاسم: [اسم المدير]
- الهاتف: [رقم الهاتف]
- البريد الإلكتروني: [البريد الإلكتروني]

**فريق الدعم الفني**:
- الهاتف: 123-456-7890
- البريد الإلكتروني: emergency@irrigation.gov.eg

**مزود الخدمة**:
- الشركة: [اسم الشركة]
- الهاتف: [رقم الدعم]
- رقم العقد: [رقم العقد]

---

### قائمة مراجعة الصيانة الدورية:

#### يومياً:
- [ ] فحص حالة الخادم والخدمات
- [ ] مراجعة سجلات الأخطاء
- [ ] التحقق من نجاح النسخة الاحتياطية
- [ ] مراقبة استخدام الموارد

#### أسبوعياً:
- [ ] تحليل أداء قاعدة البيانات
- [ ] فحص مساحة التخزين
- [ ] مراجعة سجلات الأمان
- [ ] اختبار استعادة النسخة الاحتياطية

#### شهرياً:
- [ ] تحديث النظام والتبعيات
- [ ] تنظيف السجلات القديمة
- [ ] مراجعة صلاحيات المستخدمين
- [ ] تحليل تقارير الاستخدام

#### ربع سنوياً:
- [ ] مراجعة خطة الطوارئ
- [ ] تحديث وثائق النظام
- [ ] تدريب فريق الدعم
- [ ] تقييم الأمان الشامل

---

*آخر تحديث: يناير 2024*
*الإصدار: 1.0*
