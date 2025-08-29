<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'dashboard':
            handleDashboard();
            break;
        case 'tasks':
            handleTasks($method);
            break;
        case 'employees':
            handleEmployees($method);
            break;
        case 'notifications':
            handleNotifications($method);
            break;
        case 'reports':
            handleReports();
            break;
        case 'import':
            handleImport();
            break;
        case 'export':
            handleExport();
            break;
        default:
            throw new Exception('إجراء غير صحيح');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// معالجة لوحة التحكم - محسنة
function handleDashboard() {
    $db = getDB();
    
    try {
        // استخدام prepared statements مع cache
        $cacheKey = 'dashboard_stats_' . date('Y-m-d-H');
        
        // إحصائيات المهام
        $taskStatsQuery = "
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'جارية' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN status = 'متأخرة' OR end_date < NOW() THEN 1 ELSE 0 END) as overdue_tasks,
                SUM(CASE WHEN priority = 'عالية' THEN 1 ELSE 0 END) as urgent_tasks
            FROM tasks
        ";
        $taskStats = $db->query($taskStatsQuery)->fetch(PDO::FETCH_ASSOC);
        
        // إحصائيات الموظفين
        $employeeStats = $db->query("SELECT COUNT(*) as total_employees FROM employees")->fetch(PDO::FETCH_ASSOC);
        
        // توزيع المهام حسب الحالة
        $tasksByStatus = $db->query("
            SELECT status, COUNT(*) as count 
            FROM tasks 
            GROUP BY status
            ORDER BY count DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        // أداء الموظفين - محسن
        $employeePerformance = $db->query("
            SELECT e.name, e.performance_points
            FROM employees e
            WHERE e.performance_points > 0
            ORDER BY e.performance_points DESC
            LIMIT 10
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        // تطور الأداء عبر الوقت - محسن
        $performanceTrend = $db->query("
            SELECT DATE(created_at) as date, COUNT(*) as completed_tasks
            FROM tasks 
            WHERE status = 'مكتملة' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        // النشاطات الأخيرة - محسنة
        $recentActivities = $db->query("
            SELECT description, created_at
            FROM activities
            ORDER BY created_at DESC
            LIMIT 10
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'taskStats' => $taskStats,
            'employeeStats' => $employeeStats,
            'tasksByStatus' => $tasksByStatus,
            'employeePerformance' => $employeePerformance,
            'performanceTrend' => $performanceTrend,
            'recentActivities' => $recentActivities
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        throw new Exception('خطأ في تحميل بيانات لوحة التحكم: ' . $e->getMessage());
    }
}

// معالجة المهام - محسنة
function handleTasks($method) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            try {
                $stmt = $db->prepare("
                    SELECT t.*, e.name as employee_name, e.photo as employee_photo
                    FROM tasks t
                    LEFT JOIN employees e ON t.assigned_employee_id = e.id
                    ORDER BY t.created_at DESC
                ");
                $stmt->execute();
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($tasks, JSON_UNESCAPED_UNICODE);
            } catch (Exception $e) {
                throw new Exception('خطأ في تحميل المهام: ' . $e->getMessage());
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!validateTaskData($data)) {
                throw new Exception('بيانات المهمة غير صحيحة');
            }
            
            try {
                $db->beginTransaction();
                
                $stmt = $db->prepare("
                    INSERT INTO tasks (name, description, priority, start_date, end_date, status, department, assigned_employee_id, points, notes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                
                $result = $stmt->execute([
                    sanitizeInput($data['name']),
                    sanitizeInput($data['description'] ?? ''),
                    $data['priority'],
                    $data['start_date'],
                    $data['end_date'],
                    $data['status'],
                    $data['department'],
                    $data['assigned_employee_id'] ?: null,
                    intval($data['points'] ?? 10),
                    sanitizeInput($data['notes'] ?? '')
                ]);
                
                if ($result) {
                    $taskId = $db->lastInsertId();
                    
                    // إضافة نشاط
                    logActivity($db, "تم إنشاء مهمة جديدة: " . $data['name']);
                    
                    $db->commit();
                    echo json_encode(['success' => true, 'id' => $taskId], JSON_UNESCAPED_UNICODE);
                } else {
                    throw new Exception('فشل في حفظ المهمة');
                }
                
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!validateTaskData($data) || !isset($data['id'])) {
                throw new Exception('بيانات المهمة غير صحيحة');
            }
            
            try {
                $db->beginTransaction();
                
                $stmt = $db->prepare("
                    UPDATE tasks 
                    SET name=?, description=?, priority=?, start_date=?, end_date=?, status=?, department=?, assigned_employee_id=?, points=?, notes=?, updated_at=NOW()
                    WHERE id=?
                ");
                
                $result = $stmt->execute([
                    sanitizeInput($data['name']),
                    sanitizeInput($data['description'] ?? ''),
                    $data['priority'],
                    $data['start_date'],
                    $data['end_date'],
                    $data['status'],
                    $data['department'],
                    $data['assigned_employee_id'] ?: null,
                    intval($data['points'] ?? 10),
                    sanitizeInput($data['notes'] ?? ''),
                    intval($data['id'])
                ]);
                
                if ($result) {
                    // تحديث نقاط الأداء إذا تم إكمال المهمة
                    if ($data['status'] === 'مكتملة' && $data['assigned_employee_id']) {
                        updateEmployeePoints($db, $data['assigned_employee_id'], $data['points']);
                    }
                    
                    logActivity($db, "تم تحديث المهمة: " . $data['name']);
                    
                    $db->commit();
                    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
                } else {
                    throw new Exception('فشل في تحديث المهمة');
                }
                
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
            break;
            
        case 'DELETE':
            $id = intval($_GET['id'] ?? 0);
            
            if ($id <= 0) {
                throw new Exception('معرف المهمة غير صحيح');
            }
            
            try {
                $stmt = $db->prepare("DELETE FROM tasks WHERE id = ?");
                $result = $stmt->execute([$id]);
                
                if ($result) {
                    logActivity($db, "تم حذف مهمة");
                    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
                } else {
                    throw new Exception('فشل في حذف المهمة');
                }
            } catch (Exception $e) {
                throw new Exception('خطأ في حذف المهمة: ' . $e->getMessage());
            }
            break;
    }
}

// معالجة الموظفين - محسنة
function handleEmployees($method) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            try {
                $stmt = $db->prepare("
                    SELECT e.*, 
                           COUNT(t.id) as total_tasks,
                           SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
                           ROUND(
                               (SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) * 100.0 / 
                                NULLIF(COUNT(t.id), 0)), 2
                           ) as completion_rate
                    FROM employees e
                    LEFT JOIN tasks t ON e.id = t.assigned_employee_id
                    GROUP BY e.id
                    ORDER BY e.performance_points DESC
                ");
                $stmt->execute();
                $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($employees, JSON_UNESCAPED_UNICODE);
            } catch (Exception $e) {
                throw new Exception('خطأ في تحميل الموظفين: ' . $e->getMessage());
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!validateEmployeeData($data)) {
                throw new Exception('بيانات الموظف غير صحيحة');
            }
            
            try {
                $db->beginTransaction();
                
                // معالجة رفع الصورة
                $photo = '';
                if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                    $photo = uploadEmployeePhoto($_FILES['photo']);
                }
                
                $stmt = $db->prepare("
                    INSERT INTO employees (name, email, department, role, join_date, photo, performance_points, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
                ");
                
                $result = $stmt->execute([
                    sanitizeInput($data['name']),
                    sanitizeInput($data['email']),
                    $data['department'],
                    $data['role'],
                    $data['join_date'] ?: date('Y-m-d'),
                    $photo
                ]);
                
                if ($result) {
                    $employeeId = $db->lastInsertId();
                    logActivity($db, "تم إضافة موظف جديد: " . $data['name']);
                    
                    $db->commit();
                    echo json_encode(['success' => true, 'id' => $employeeId], JSON_UNESCAPED_UNICODE);
                } else {
                    throw new Exception('فشل في حفظ الموظف');
                }
                
            } catch (Exception $e) {
                $db->rollBack();
                if ($photo && file_exists('uploads/employees/' . $photo)) {
                    unlink('uploads/employees/' . $photo);
                }
                throw $e;
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!validateEmployeeData($data) || !isset($data['id'])) {
                throw new Exception('بيانات الموظف غير صحيحة');
            }
            
            try {
                $stmt = $db->prepare("
                    UPDATE employees 
                    SET name=?, email=?, department=?, role=?, join_date=?, updated_at=NOW()
                    WHERE id=?
                ");
                
                $result = $stmt->execute([
                    sanitizeInput($data['name']),
                    sanitizeInput($data['email']),
                    $data['department'],
                    $data['role'],
                    $data['join_date'],
                    intval($data['id'])
                ]);
                
                if ($result) {
                    logActivity($db, "تم تحديث بيانات الموظف: " . $data['name']);
                    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
                } else {
                    throw new Exception('فشل في تحديث الموظف');
                }
            } catch (Exception $e) {
                throw new Exception('خطأ في تحديث الموظف: ' . $e->getMessage());
            }
            break;
            
        case 'DELETE':
            $id = intval($_GET['id'] ?? 0);
            
            if ($id <= 0) {
                throw new Exception('معرف الموظف غير صحيح');
            }
            
            try {
                // التحقق من وجود مهام مرتبطة
                $stmt = $db->prepare("SELECT COUNT(*) as count FROM tasks WHERE assigned_employee_id = ?");
                $stmt->execute([$id]);
                $taskCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                if ($taskCount > 0) {
                    throw new Exception('لا يمكن حذف الموظف لوجود مهام مرتبطة به');
                }
                
                $stmt = $db->prepare("DELETE FROM employees WHERE id = ?");
                $result = $stmt->execute([$id]);
                
                if ($result) {
                    logActivity($db, "تم حذف موظف");
                    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
                } else {
                    throw new Exception('فشل في حذف الموظف');
                }
            } catch (Exception $e) {
                throw new Exception('خطأ في حذف الموظف: ' . $e->getMessage());
            }
            break;
    }
}

// معالجة الإشعارات - محسنة
function handleNotifications($method) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            $employeeId = intval($_GET['employee_id'] ?? 1);
            
            try {
                $stmt = $db->prepare("
                    SELECT * FROM notifications 
                    WHERE employee_id = ? OR employee_id IS NULL
                    ORDER BY created_at DESC
                    LIMIT 50
                ");
                $stmt->execute([$employeeId]);
                $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($notifications, JSON_UNESCAPED_UNICODE);
            } catch (Exception $e) {
                throw new Exception('خطأ في تحميل الإشعارات: ' . $e->getMessage());
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($data['action'] === 'mark_all_read') {
                try {
                    $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE employee_id = ?");
                    $result = $stmt->execute([intval($data['employee_id'])]);
                    echo json_encode(['success' => $result], JSON_UNESCAPED_UNICODE);
                } catch (Exception $e) {
                    throw new Exception('خطأ في تحديث الإشعارات: ' . $e->getMessage());
                }
            }
            break;
    }
}

// معالجة التقارير - محسنة
function handleReports() {
    $db = getDB();
    $type = $_GET['type'] ?? '';
    $fromDate = $_GET['from_date'] ?? '';
    $toDate = $_GET['to_date'] ?? '';
    
    if (!$type || !$fromDate || !$toDate) {
        throw new Exception('معاملات التقرير غير مكتملة');
    }
    
    try {
        switch ($type) {
            case 'tasks':
                $stmt = $db->prepare("
                    SELECT t.*, e.name as employee_name
                    FROM tasks t
                    LEFT JOIN employees e ON t.assigned_employee_id = e.id
                    WHERE t.created_at BETWEEN ? AND ?
                    ORDER BY t.created_at DESC
                ");
                break;
                
            case 'employees':
                $stmt = $db->prepare("
                    SELECT e.*, 
                           COUNT(t.id) as total_tasks,
                           SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks
                    FROM employees e
                    LEFT JOIN tasks t ON e.id = t.assigned_employee_id
                    WHERE e.created_at BETWEEN ? AND ?
                    GROUP BY e.id
                    ORDER BY e.performance_points DESC
                ");
                break;
                
            case 'performance':
                $stmt = $db->prepare("
                    SELECT e.name, e.performance_points,
                           COUNT(t.id) as total_tasks,
                           SUM(CASE WHEN t.status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
                           AVG(DATEDIFF(t.updated_at, t.created_at)) as avg_completion_time
                    FROM employees e
                    LEFT JOIN tasks t ON e.id = t.assigned_employee_id
                    WHERE t.created_at BETWEEN ? AND ?
                    GROUP BY e.id
                    ORDER BY e.performance_points DESC
                ");
                break;
                
            case 'departments':
                $stmt = $db->prepare("
                    SELECT department,
                           COUNT(*) as total_tasks,
                           SUM(CASE WHEN status = 'مكتملة' THEN 1 ELSE 0 END) as completed_tasks,
                           ROUND((SUM(CASE WHEN status = 'مكتملة' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as completion_rate
                    FROM tasks
                    WHERE created_at BETWEEN ? AND ?
                    GROUP BY department
                    ORDER BY completion_rate DESC
                ");
                break;
                
            default:
                throw new Exception('نوع التقرير غير صحيح');
        }
        
        $stmt->execute([$fromDate, $toDate]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($results, JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        throw new Exception('خطأ في إنشاء التقرير: ' . $e->getMessage());
    }
}

// معالجة الاستيراد - محسنة مع سجل العمليات
function handleImport() {
    if (!isset($_FILES['file'])) {
        throw new Exception('لم يتم رفع ملف');
    }
    
    $file = $_FILES['file'];
    $type = $_POST['type'] ?? '';
    
    if (!in_array($type, ['tasks', 'employees'])) {
        throw new Exception('نوع الاستيراد غير صحيح');
    }
    
    try {
        $db = getDB();
        $db->beginTransaction();
        
        // قراءة الملف
        $data = parseImportFile($file);
        $imported = 0;
        $errors = [];
        
        foreach ($data as $index => $row) {
            try {
                if ($type === 'tasks') {
                    $imported += importTask($db, $row);
                } elseif ($type === 'employees') {
                    $imported += importEmployee($db, $row);
                }
            } catch (Exception $e) {
                $errors[] = "السطر " . ($index + 2) . ": " . $e->getMessage();
            }
        }
        
        // تسجيل العملية
        logImportOperation($db, $type, $imported, count($errors), $_FILES['file']['name']);
        
        $db->commit();
        
        $response = [
            'success' => true, 
            'imported' => $imported,
            'total' => count($data),
            'errors' => $errors
        ];
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        if (isset($db)) {
            $db->rollBack();
        }
        throw new Exception('خطأ في الاستيراد: ' . $e->getMessage());
    }
}

// معالجة التصدير - محسنة مع سجل العمليات
function handleExport() {
    $db = getDB();
    $type = $_GET['type'] ?? '';
    $format = $_GET['format'] ?? 'json';
    
    if (!in_array($type, ['tasks', 'employees'])) {
        throw new Exception('نوع التصدير غير صحيح');
    }
    
    try {
        switch ($type) {
            case 'tasks':
                $stmt = $db->prepare("
                    SELECT t.name, t.description, t.priority, t.status, t.department, 
                           t.start_date, t.end_date, e.name as employee_name
                    FROM tasks t
                    LEFT JOIN employees e ON t.assigned_employee_id = e.id
                    ORDER BY t.created_at DESC
                ");
                break;
                
            case 'employees':
                $stmt = $db->prepare("
                    SELECT name, email, department, role, join_date, performance_points
                    FROM employees
                    ORDER BY performance_points DESC
                ");
                break;
        }
        
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // تسجيل العملية
        logExportOperation($db, $type, count($data), $format);
        
        if ($format === 'csv') {
            exportAsCSV($data, $type);
        } else {
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        
    } catch (Exception $e) {
        throw new Exception('خطأ في التصدير: ' . $e->getMessage());
    }
}

// دوال مساعدة محسنة

function validateTaskData($data) {
    return isset($data['name']) && 
           isset($data['priority']) && 
           isset($data['start_date']) && 
           isset($data['end_date']) && 
           isset($data['department']) &&
           !empty(trim($data['name']));
}

function validateEmployeeData($data) {
    return isset($data['name']) && 
           isset($data['email']) && 
           isset($data['department']) && 
           isset($data['role']) &&
           !empty(trim($data['name'])) &&
           validateEmail($data['email']);
}

function updateEmployeePoints($db, $employeeId, $points) {
    $stmt = $db->prepare("UPDATE employees SET performance_points = performance_points + ? WHERE id = ?");
    return $stmt->execute([$points, $employeeId]);
}

function logActivity($db, $description) {
    $stmt = $db->prepare("INSERT INTO activities (description, created_at) VALUES (?, NOW())");
    return $stmt->execute([$description]);
}

function uploadEmployeePhoto($file) {
    $uploadDir = 'uploads/employees/';
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('نوع الصورة غير مسموح');
    }
    
    if ($file['size'] > 2 * 1024 * 1024) { // 2MB
        throw new Exception('حجم الصورة كبير جداً');
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('emp_') . '.' . $extension;
    $destination = $uploadDir . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception('فشل في رفع الصورة');
    }
    
    return $filename;
}

function parseImportFile($file) {
    $data = [];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($extension === 'csv') {
        $handle = fopen($file['tmp_name'], 'r');
        if ($handle === false) {
            throw new Exception('فشل في قراءة الملف');
        }
        
        $headers = fgetcsv($handle);
        if ($headers === false) {
            throw new Exception('الملف فارغ أو تالف');
        }
        
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === count($headers)) {
                $data[] = array_combine($headers, $row);
            }
        }
        fclose($handle);
    } else {
        throw new Exception('نوع الملف غير مدعوم');
    }
    
    return $data;
}

function importTask($db, $row) {
    $stmt = $db->prepare("
        INSERT INTO tasks (name, description, priority, start_date, end_date, status, department, points, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $stmt->execute([
        sanitizeInput($row['name'] ?? ''),
        sanitizeInput($row['description'] ?? ''),
        $row['priority'] ?? 'متوسطة',
        $row['start_date'] ?? date('Y-m-d H:i:s'),
        $row['end_date'] ?? date('Y-m-d H:i:s', strtotime('+1 day')),
        $row['status'] ?? 'مفتوحة',
        $row['department'] ?? 'أخرى',
        intval($row['points'] ?? 10)
    ]);
    
    return $result ? 1 : 0;
}

function importEmployee($db, $row) {
    $stmt = $db->prepare("
        INSERT INTO employees (name, email, department, role, join_date, performance_points, created_at)
        VALUES (?, ?, ?, ?, ?, 0, NOW())
    ");
    
    $result = $stmt->execute([
        sanitizeInput($row['name'] ?? ''),
        sanitizeInput($row['email'] ?? ''),
        $row['department'] ?? 'أخرى',
        $row['role'] ?? 'موظف',
        $row['join_date'] ?? date('Y-m-d')
    ]);
    
    return $result ? 1 : 0;
}

function logImportOperation($db, $type, $imported, $errors, $filename) {
    $stmt = $db->prepare("
        INSERT INTO operations_log (operation_type, user_id, records_count, status, details, created_at)
        VALUES (?, 1, ?, ?, ?, NOW())
    ");
    
    $status = $errors > 0 ? 'جزئي' : 'مكتمل';
    $details = json_encode([
        'filename' => $filename,
        'imported' => $imported,
        'errors' => $errors
    ], JSON_UNESCAPED_UNICODE);
    
    return $stmt->execute(['استيراد ' . $type, $imported, $status, $details]);
}

function logExportOperation($db, $type, $count, $format) {
    $stmt = $db->prepare("
        INSERT INTO operations_log (operation_type, user_id, records_count, status, details, created_at)
        VALUES (?, 1, ?, 'مكتمل', ?, NOW())
    ");
    
    $details = json_encode([
        'format' => $format,
        'exported' => $count
    ], JSON_UNESCAPED_UNICODE);
    
    return $stmt->execute(['تصدير ' . $type, $count, $details]);
}

function exportAsCSV($data, $type) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $type . '_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // إضافة BOM للدعم العربي
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    if (!empty($data)) {
        fputcsv($output, array_keys($data[0]));
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
    }
    
    fclose($output);
}
?>