@echo off
echo ========================================
echo    نظام إدارة مصلحة الري
echo    وزارة الموارد المائية والري
echo ========================================
echo.

echo جاري تشغيل النظام...
echo.

REM فحص وجود Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: Node.js غير مثبت
    echo يرجى تشغيل install_system.bat أولاً
    pause
    exit /b 1
)

REM فحص وجود ملفات النظام
if not exist "package.json" (
    echo خطأ: ملفات النظام غير موجودة
    echo يرجى تشغيل install_system.bat أولاً
    pause
    exit /b 1
)

REM فحص وجود node_modules
if not exist "node_modules" (
    echo جاري تثبيت التبعيات...
    call npm install
)

echo تم فحص النظام بنجاح
echo.

echo ========================================
echo النظام جاهز للاستخدام
echo ========================================
echo.
echo رابط النظام: http://localhost:5173
echo.
echo بيانات تسجيل الدخول:
echo - مدير النظام: admin / admin123
echo - مدير إدارة: manager / manager123  
echo - موظف عادي: employee / employee123
echo.
echo لإيقاف النظام اضغط Ctrl+C
echo.

REM تشغيل النظام
call npm run dev