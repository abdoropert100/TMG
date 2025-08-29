<?php
// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'task_management');
define('DB_USER', 'root');
define('DB_PASS', '');

// إعدادات عامة
define('UPLOAD_PATH', 'uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('MAX_IMAGE_SIZE', 2 * 1024 * 1024); // 2MB للصور

// الاتصال بقاعدة البيانات - محسن
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                PDO::ATTR_PERSISTENT => true, // اتصال دائم لتحسين الأداء
                PDO::ATTR_TIMEOUT => 30
            ];
            
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            throw new Exception('خطأ في الاتصال بقاعدة البيانات');
        }
    }
    
    return $pdo;
}

// رفع الملفات - محسن
function uploadFile($file, $uploadDir, $allowedTypes = null, $maxSize = MAX_FILE_SIZE) {
    if (!isset($file['error']) || is_array($file['error'])) {
        throw new Exception('معاملات الملف غير صحيحة');
    }

    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            throw new Exception('لم يتم رفع أي ملف');
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            throw new Exception('حجم الملف كبير جداً');
        default:
            throw new Exception('خطأ غير معروف في رفع الملف');
    }

    if ($file['size'] > $maxSize) {
        throw new Exception('حجم الملف كبير جداً');
    }

    // التحقق من نوع الملف
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    
    if ($allowedTypes === null) {
        $allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
    }

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('نوع الملف غير مسموح');
    }

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('فشل في إنشاء مجلد الرفع');
        }
    }

    // إنشاء اسم ملف فريد
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception('فشل في حفظ الملف');
    }

    return $filename;
}

// تنظيف البيانات - محسن
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    return $data;
}

// التحقق من صحة البريد الإلكتروني - محسن
function validateEmail($email) {
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// تحويل التاريخ إلى تنسيق قاعدة البيانات
function formatDateForDB($date) {
    if (empty($date)) {
        return null;
    }
    
    $timestamp = strtotime($date);
    return $timestamp ? date('Y-m-d H:i:s', $timestamp) : null;
}

// تحويل التاريخ للعرض
function formatDateForDisplay($date, $format = 'd/m/Y H:i') {
    if (empty($date)) {
        return '';
    }
    
    $timestamp = strtotime($date);
    return $timestamp ? date($format, $timestamp) : '';
}

// إنشاء رمز عشوائي آمن
function generateRandomToken($length = 32) {
    if (function_exists('random_bytes')) {
        return bin2hex(random_bytes($length));
    } else {
        return bin2hex(openssl_random_pseudo_bytes($length));
    }
}

// تسجيل الأخطاء - محسن
function logError($message, $context = [], $file = 'logs/error.log') {
    $logDir = dirname($file);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' | Context: ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
    $logMessage = "[$timestamp] $message$contextStr" . PHP_EOL;
    
    file_put_contents($file, $logMessage, FILE_APPEND | LOCK_EX);
}

// إرسال استجابة JSON - محسن
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate');
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// التحقق من الجلسة
function checkSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['success' => false, 'error' => 'غير مصرح بالوصول'], 401);
    }
    
    return $_SESSION['user_id'];
}

// تشفير كلمة المرور
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);
}

// التحقق من كلمة المرور
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// ضغط الصور - جديد
function compressImage($source, $destination, $quality = 80) {
    $info = getimagesize($source);
    
    if ($info['mime'] == 'image/jpeg') {
        $image = imagecreatefromjpeg($source);
    } elseif ($info['mime'] == 'image/gif') {
        $image = imagecreatefromgif($source);
    } elseif ($info['mime'] == 'image/png') {
        $image = imagecreatefrompng($source);
    } else {
        return false;
    }
    
    // حفظ الصورة المضغوطة
    if ($info['mime'] == 'image/jpeg') {
        return imagejpeg($image, $destination, $quality);
    } elseif ($info['mime'] == 'image/gif') {
        return imagegif($image, $destination);
    } elseif ($info['mime'] == 'image/png') {
        return imagepng($image, $destination, 9);
    }
    
    return false;
}

// تغيير حجم الصورة - جديد
function resizeImage($source, $destination, $maxWidth = 800, $maxHeight = 600) {
    list($origWidth, $origHeight) = getimagesize($source);
    
    $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
    
    if ($ratio >= 1) {
        // الصورة أصغر من الحد الأقصى
        return copy($source, $destination);
    }
    
    $newWidth = intval($origWidth * $ratio);
    $newHeight = intval($origHeight * $ratio);
    
    $info = getimagesize($source);
    
    if ($info['mime'] == 'image/jpeg') {
        $srcImage = imagecreatefromjpeg($source);
    } elseif ($info['mime'] == 'image/gif') {
        $srcImage = imagecreatefromgif($source);
    } elseif ($info['mime'] == 'image/png') {
        $srcImage = imagecreatefrompng($source);
    } else {
        return false;
    }
    
    $destImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // الحفاظ على الشفافية للـ PNG
    if ($info['mime'] == 'image/png') {
        imagealphablending($destImage, false);
        imagesavealpha($destImage, true);
    }
    
    imagecopyresampled($destImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
    
    if ($info['mime'] == 'image/jpeg') {
        $result = imagejpeg($destImage, $destination, 85);
    } elseif ($info['mime'] == 'image/gif') {
        $result = imagegif($destImage, $destination);
    } elseif ($info['mime'] == 'image/png') {
        $result = imagepng($destImage, $destination, 8);
    }
    
    imagedestroy($srcImage);
    imagedestroy($destImage);
    
    return $result;
}

// تنظيف الملفات القديمة - جديد
function cleanupOldFiles($directory, $maxAge = 86400) { // 24 ساعة افتراضياً
    if (!is_dir($directory)) {
        return false;
    }
    
    $files = glob($directory . '/*');
    $now = time();
    $cleaned = 0;
    
    foreach ($files as $file) {
        if (is_file($file) && ($now - filemtime($file)) > $maxAge) {
            if (unlink($file)) {
                $cleaned++;
            }
        }
    }
    
    return $cleaned;
}

// إنشاء جدول سجل العمليات إذا لم يكن موجوداً
function createOperationsLogTable() {
    try {
        $db = getDB();
        $sql = "
            CREATE TABLE IF NOT EXISTS operations_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                operation_type VARCHAR(100) NOT NULL COMMENT 'نوع العملية',
                user_id INT DEFAULT NULL COMMENT 'المستخدم',
                records_count INT DEFAULT 0 COMMENT 'عدد السجلات',
                status ENUM('مكتمل', 'جزئي', 'فاشل') DEFAULT 'مكتمل' COMMENT 'حالة العملية',
                details TEXT COMMENT 'تفاصيل إضافية',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_operation_date (operation_type, created_at)
            ) ENGINE=InnoDB COMMENT='سجل العمليات'
        ";
        
        $db->exec($sql);
        return true;
    } catch (Exception $e) {
        logError('Failed to create operations_log table: ' . $e->getMessage());
        return false;
    }
}

// تهيئة النظام
function initializeSystem() {
    // إنشاء المجلدات المطلوبة
    $directories = [
        'uploads/',
        'uploads/employees/',
        'uploads/tasks/',
        'logs/',
        'cache/'
    ];
    
    foreach ($directories as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
    
    // إنشاء جدول سجل العمليات
    createOperationsLogTable();
    
    // تنظيف الملفات المؤقتة القديمة
    cleanupOldFiles('uploads/temp/', 3600); // ساعة واحدة
    
    return true;
}

// تشغيل التهيئة
initializeSystem();
?>