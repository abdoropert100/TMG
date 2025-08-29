// نظام إدارة المهام المتكامل - JavaScript
let currentSection = 'dashboard';
let tasks = [];
let employees = [];
let notifications = [];
let charts = {};

// إعدادات النظام
const API_BASE_URL = 'api.php';
const SYSTEM_CONFIG = {
    dateFormat: 'en-US',
    dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    },
    theme: localStorage.getItem('theme') || 'light'
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    loadSavedSection();
    applyTheme();
    setupEventListeners();
});

// تهيئة النظام
async function initializeSystem() {
    try {
        showLoading(true);
        await Promise.all([
            loadEmployees(),
            loadTasks(),
            loadNotifications(),
            loadDashboardData()
        ]);
        updateUI();
        showLoading(false);
    } catch (error) {
        console.error('خطأ في تهيئة النظام:', error);
        showError('فشل في تحميل البيانات');
        showLoading(false);
    }
}

// حفظ واستعادة القسم الحالي
function saveCurrentSection(section) {
    localStorage.setItem('currentSection', section);
    currentSection = section;
}

function loadSavedSection() {
    const savedSection = localStorage.getItem('currentSection') || 'dashboard';
    showSection(savedSection);
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // مستمع لتغيير ملفات الاستيراد
    document.getElementById('importTasksFile').addEventListener('change', handleImportFile);
    document.getElementById('importEmployeesFile').addEventListener('change', handleImportFile);
    
    // مستمع لإغلاق النوافذ المنبثقة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// عرض/إخفاء شاشة التحميل
function showLoading(show) {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loading"></div>
                <p>جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
}

// تبديل السمة
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// عرض الأقسام
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الفئة النشطة من جميع عناصر القائمة
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // عرض القسم المحدد
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // تفعيل عنصر القائمة المناسب
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(sectionName)) {
            item.classList.add('active');
        }
    });
    
    // حفظ القسم الحالي
    saveCurrentSection(sectionName);
    
    // تحديث البيانات حسب القسم
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'reports':
            initializeReportDates();
            break;
    }
}

// تحميل بيانات لوحة التحكم
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=dashboard`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        updateDashboardStats(data);
        updateCharts(data);
        updateRecentActivities(data.recentActivities || []);
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
        showError('فشل في تحميل بيانات لوحة التحكم');
    }
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats(data) {
    const stats = data.taskStats || {};
    
    document.getElementById('totalTasks').textContent = stats.total_tasks || 0;
    document.getElementById('totalEmployees').textContent = data.employeeStats?.total_employees || 0;
    document.getElementById('completedTasks').textContent = stats.completed_tasks || 0;
    document.getElementById('inProgressTasks').textContent = stats.in_progress_tasks || 0;
    document.getElementById('overdueTasks').textContent = stats.overdue_tasks || 0;
    document.getElementById('urgentTasks').textContent = stats.urgent_tasks || 0;
}

// تحديث الرسوم البيانية
function updateCharts(data) {
    // رسم بياني لحالة المهام
    updateTasksStatusChart(data.tasksByStatus || []);
    
    // رسم بياني لأداء الموظفين
    updateEmployeePerformanceChart(data.employeePerformance || []);
    
    // رسم بياني لتطور الأداء
    updatePerformanceTrendChart(data.performanceTrend || []);
}

// رسم بياني لحالة المهام
function updateTasksStatusChart(data) {
    const ctx = document.getElementById('tasksStatusChart');
    if (!ctx) return;
    
    if (charts.tasksStatus) {
        charts.tasksStatus.destroy();
    }
    
    const labels = data.map(item => item.status);
    const values = data.map(item => item.count);
    const colors = ['#3498db', '#f39c12', '#2ecc71', '#17a2b8', '#e74c3c'];
    
    charts.tasksStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// رسم بياني لأداء الموظفين
function updateEmployeePerformanceChart(data) {
    const ctx = document.getElementById('employeePerformanceChart');
    if (!ctx) return;
    
    if (charts.employeePerformance) {
        charts.employeePerformance.destroy();
    }
    
    const labels = data.map(item => item.name);
    const values = data.map(item => item.performance_points);
    
    charts.employeePerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'نقاط الأداء',
                data: values,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// رسم بياني لتطور الأداء
function updatePerformanceTrendChart(data) {
    const ctx = document.getElementById('performanceTrendChart');
    if (!ctx) return;
    
    if (charts.performanceTrend) {
        charts.performanceTrend.destroy();
    }
    
    const labels = data.map(item => formatDate(item.date));
    const values = data.map(item => item.completed_tasks);
    
    charts.performanceTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'المهام المكتملة',
                data: values,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// تحديث النشاطات الأخيرة
function updateRecentActivities(activities) {
    const container = document.getElementById('recentActivitiesList');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-muted">لا توجد نشاطات حديثة</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="activity-info">
                <h4>${activity.description}</h4>
                <p class="activity-time">${formatDate(activity.created_at)}</p>
            </div>
        </div>
    `).join('');
}

// تحميل المهام
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=tasks`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            tasks = data;
            displayTasks(tasks);
            populateEmployeeSelects();
        } else {
            throw new Error('تنسيق البيانات غير صحيح');
        }
        
    } catch (error) {
        console.error('خطأ في تحميل المهام:', error);
        showError('فشل في تحميل المهام');
    }
}

// عرض المهام
function displayTasks(tasksToShow) {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;
    
    if (tasksToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مهام</td></tr>';
        return;
    }
    
    tbody.innerHTML = tasksToShow.map(task => `
        <tr>
            <td>${task.name}</td>
            <td><span class="status-badge status-${getStatusClass(task.status)}">${task.status}</span></td>
            <td><span class="priority-badge priority-${getPriorityClass(task.priority)}">${task.priority}</span></td>
            <td>${task.employee_name || 'غير محدد'}</td>
            <td>${formatDate(task.start_date)}</td>
            <td>${formatDate(task.end_date)}</td>
            <td>${task.department}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewTask(${task.id})" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editTask(${task.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteTask(${task.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// تحميل الموظفين
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=employees`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            employees = data;
            displayEmployees(employees);
            populateEmployeeSelects();
        } else {
            throw new Error('تنسيق البيانات غير صحيح');
        }
        
    } catch (error) {
        console.error('خطأ في تحميل الموظفين:', error);
        showError('فشل في تحميل الموظفين');
    }
}

// عرض الموظفين
function displayEmployees(employeesToShow) {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    
    if (employeesToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">لا يوجد موظفين</td></tr>';
        return;
    }
    
    tbody.innerHTML = employeesToShow.map(employee => `
        <tr>
            <td>
                <img src="${employee.photo ? 'uploads/employees/' + employee.photo : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'}" 
                     alt="${employee.name}" class="employee-photo">
            </td>
            <td>${employee.name}</td>
            <td>${employee.department}</td>
            <td>${employee.role}</td>
            <td>${employee.email}</td>
            <td>${employee.performance_points || 0}</td>
            <td>${employee.completed_tasks || 0}</td>
            <td>
                <div class="performance-score">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${Math.min(employee.completion_rate || 0, 100)}%"></div>
                    </div>
                    <span>${employee.completion_rate || 0}%</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editEmployee(${employee.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteEmployee(${employee.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ملء قوائم الموظفين
function populateEmployeeSelects() {
    const selects = [
        'taskAssignedEmployee',
        'taskCompletedEmployee'
    ];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">اختر الموظف</option>';
            
            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = employee.name;
                if (employee.id == currentValue) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
    });
}

// فلترة المهام
function filterTasks() {
    const searchTerm = document.getElementById('taskSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm) ||
                            (task.description && task.description.toLowerCase().includes(searchTerm));
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        const matchesDepartment = !departmentFilter || task.department === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
    
    displayTasks(filteredTasks);
}

// عرض نافذة إضافة مهمة
function showAddTaskModal() {
    document.getElementById('addTaskForm').reset();
    document.getElementById('selectedEmployeesList').innerHTML = '';
    document.getElementById('completedEmployeesList').innerHTML = '';
    populateEmployeeSelects();
    
    // تعيين التواريخ الافتراضية
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    document.getElementById('taskStartDate').value = formatDateForInput(now);
    document.getElementById('taskEndDate').value = formatDateForInput(tomorrow);
    
    showModal('addTaskModal');
}

// عرض نافذة إضافة موظف
function showAddEmployeeModal() {
    document.getElementById('addEmployeeForm').reset();
    document.getElementById('employeePhotoPreview').style.display = 'none';
    
    // تعيين تاريخ الانضمام الافتراضي
    document.getElementById('employeeJoinDate').value = formatDateForInput(new Date());
    
    showModal('addEmployeeModal');
}

// حفظ المهمة
async function saveTask() {
    const form = document.getElementById('addTaskForm');
    const formData = new FormData(form);
    
    const taskData = {
        name: document.getElementById('taskName').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        start_date: document.getElementById('taskStartDate').value,
        end_date: document.getElementById('taskEndDate').value,
        status: document.getElementById('taskStatus').value,
        department: document.getElementById('taskDepartment').value,
        assigned_employee_id: document.getElementById('taskAssignedEmployee').value || null,
        points: parseInt(document.getElementById('taskPoints').value) || 10,
        notes: document.getElementById('taskNotes').value
    };
    
    // التحقق من صحة البيانات
    if (!taskData.name || !taskData.priority || !taskData.start_date || !taskData.end_date || !taskData.department) {
        showError('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}?action=tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('تم حفظ المهمة بنجاح');
            closeModal('addTaskModal');
            await loadTasks();
            await loadDashboardData();
        } else {
            throw new Error(result.error || 'فشل في حفظ المهمة');
        }
        
    } catch (error) {
        console.error('خطأ في حفظ المهمة:', error);
        showError('فشل في حفظ المهمة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// حفظ الموظف
async function saveEmployee() {
    const employeeData = {
        name: document.getElementById('employeeName').value,
        email: document.getElementById('employeeEmail').value,
        department: document.getElementById('employeeDepartment').value,
        role: document.getElementById('employeeRole').value,
        join_date: document.getElementById('employeeJoinDate').value
    };
    
    // التحقق من صحة البيانات
    if (!employeeData.name || !employeeData.email || !employeeData.department || !employeeData.role) {
        showError('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}?action=employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('تم حفظ الموظف بنجاح');
            closeModal('addEmployeeModal');
            await loadEmployees();
            await loadDashboardData();
        } else {
            throw new Error(result.error || 'فشل في حفظ الموظف');
        }
        
    } catch (error) {
        console.error('خطأ في حفظ الموظف:', error);
        showError('فشل في حفظ الموظف: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// حذف المهمة
async function deleteTask(taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}?action=tasks&id=${taskId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('تم حذف المهمة بنجاح');
            await loadTasks();
            await loadDashboardData();
        } else {
            throw new Error(result.error || 'فشل في حذف المهمة');
        }
        
    } catch (error) {
        console.error('خطأ في حذف المهمة:', error);
        showError('فشل في حذف المهمة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// حذف الموظف
async function deleteEmployee(employeeId) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}?action=employees&id=${employeeId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('تم حذف الموظف بنجاح');
            await loadEmployees();
            await loadDashboardData();
        } else {
            throw new Error(result.error || 'فشل في حذف الموظف');
        }
        
    } catch (error) {
        console.error('خطأ في حذف الموظف:', error);
        showError('فشل في حذف الموظف: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// عرض تفاصيل المهمة
function viewTask(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    
    const content = `
        <div class="task-details">
            <div class="detail-section">
                <h3>معلومات أساسية</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>اسم المهمة:</label>
                        <span>${task.name}</span>
                    </div>
                    <div class="detail-item">
                        <label>الحالة:</label>
                        <span class="status-badge status-${getStatusClass(task.status)}">${task.status}</span>
                    </div>
                    <div class="detail-item">
                        <label>الأولوية:</label>
                        <span class="priority-badge priority-${getPriorityClass(task.priority)}">${task.priority}</span>
                    </div>
                    <div class="detail-item">
                        <label>القسم:</label>
                        <span>${task.department}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>التواريخ</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>تاريخ البداية:</label>
                        <span>${formatDate(task.start_date)}</span>
                    </div>
                    <div class="detail-item">
                        <label>تاريخ النهاية:</label>
                        <span>${formatDate(task.end_date)}</span>
                    </div>
                </div>
            </div>
            
            ${task.description ? `
            <div class="detail-section">
                <h3>الوصف</h3>
                <p>${task.description}</p>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>الموظفين</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>الموظف المسند:</label>
                        <span>${task.employee_name || 'غير محدد'}</span>
                    </div>
                    <div class="detail-item">
                        <label>نقاط الأداء:</label>
                        <span>${task.points || 0}</span>
                    </div>
                </div>
            </div>
            
            ${task.notes ? `
            <div class="detail-section">
                <h3>ملاحظات</h3>
                <p>${task.notes}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('taskDetailsTitle').textContent = `تفاصيل المهمة: ${task.name}`;
    document.getElementById('taskDetailsContent').innerHTML = content;
    showModal('taskDetailsModal');
}

// تحميل الإشعارات
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=notifications&employee_id=1`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            notifications = data;
            updateNotificationsUI();
        }
        
    } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
    }
}

// تحديث واجهة الإشعارات
function updateNotificationsUI() {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    document.getElementById('notificationCount').textContent = unreadCount;
    
    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}">
                <p>${notification.message}</p>
                <small>${formatDate(notification.created_at)}</small>
            </div>
        `).join('');
    }
}

// تبديل عرض الإشعارات
function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('show');
}

// تحديد جميع الإشعارات كمقروءة
async function markAllAsRead() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=notifications`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'mark_all_read',
                employee_id: 1
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadNotifications();
            toggleNotifications();
        }
        
    } catch (error) {
        console.error('خطأ في تحديث الإشعارات:', error);
    }
}

// معالجة استيراد الملفات
async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileType = event.target.id.includes('Tasks') ? 'tasks' : 'employees';
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);
        
        const response = await fetch(`${API_BASE_URL}?action=import`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(`تم استيراد ${result.imported} عنصر بنجاح`);
            
            // إعادة تحميل البيانات
            if (fileType === 'tasks') {
                await loadTasks();
            } else {
                await loadEmployees();
            }
            await loadDashboardData();
            
        } else {
            throw new Error(result.error || 'فشل في الاستيراد');
        }
        
    } catch (error) {
        console.error('خطأ في الاستيراد:', error);
        showError('فشل في الاستيراد: ' + error.message);
    } finally {
        showLoading(false);
        event.target.value = ''; // إعادة تعيين الحقل
    }
}

// تصدير البيانات
async function exportData(type, format) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}?action=export&type=${type}&format=${format}`);
        
        if (format === 'csv') {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showSuccess('تم تصدير البيانات بنجاح');
        } else {
            const data = await response.json();
            
            // تحويل إلى Excel باستخدام SheetJS
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, type);
            XLSX.writeFile(wb, `${type}.xlsx`);
            
            showSuccess('تم تصدير البيانات بنجاح');
        }
        
    } catch (error) {
        console.error('خطأ في التصدير:', error);
        showError('فشل في التصدير: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// إنشاء التقارير
async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    
    if (!fromDate || !toDate) {
        showError('يرجى تحديد الفترة الزمنية');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}?action=reports&type=${reportType}&from_date=${fromDate}&to_date=${toDate}`);
        const data = await response.json();
        
        displayReport(data, reportType);
        
    } catch (error) {
        console.error('خطأ في إنشاء التقرير:', error);
        showError('فشل في إنشاء التقرير');
    } finally {
        showLoading(false);
    }
}

// عرض التقرير
function displayReport(data, reportType) {
    const reportDisplay = document.getElementById('reportDisplay');
    
    let content = `
        <div class="report-content">
            <h3>تقرير ${getReportTitle(reportType)}</h3>
            <div class="report-stats">
                <div class="report-stat">
                    <h4>إجمالي السجلات</h4>
                    <span>${data.length}</span>
                </div>
            </div>
            <div class="report-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${getReportHeaders(reportType)}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${getReportRow(row, reportType)}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    reportDisplay.innerHTML = content;
}

// الحصول على عنوان التقرير
function getReportTitle(reportType) {
    const titles = {
        'tasks': 'المهام',
        'employees': 'الموظفين',
        'performance': 'الأداء',
        'departments': 'الأقسام'
    };
    return titles[reportType] || reportType;
}

// الحصول على رؤوس التقرير
function getReportHeaders(reportType) {
    const headers = {
        'tasks': '<th>اسم المهمة</th><th>الحالة</th><th>الأولوية</th><th>الموظف</th><th>تاريخ البداية</th><th>تاريخ النهاية</th>',
        'employees': '<th>الاسم</th><th>القسم</th><th>الوظيفة</th><th>نقاط الأداء</th><th>المهام المكتملة</th>',
        'performance': '<th>الموظف</th><th>نقاط الأداء</th><th>إجمالي المهام</th><th>المهام المكتملة</th>',
        'departments': '<th>القسم</th><th>إجمالي المهام</th><th>المهام المكتملة</th><th>نسبة الإنجاز</th>'
    };
    return headers[reportType] || '';
}

// الحصول على صف التقرير
function getReportRow(row, reportType) {
    switch(reportType) {
        case 'tasks':
            return `
                <td>${row.name}</td>
                <td><span class="status-badge status-${getStatusClass(row.status)}">${row.status}</span></td>
                <td><span class="priority-badge priority-${getPriorityClass(row.priority)}">${row.priority}</span></td>
                <td>${row.employee_name || 'غير محدد'}</td>
                <td>${formatDate(row.start_date)}</td>
                <td>${formatDate(row.end_date)}</td>
            `;
        case 'employees':
            return `
                <td>${row.name}</td>
                <td>${row.department}</td>
                <td>${row.role}</td>
                <td>${row.performance_points}</td>
                <td>${row.completed_tasks || 0}</td>
            `;
        case 'performance':
            return `
                <td>${row.name}</td>
                <td>${row.performance_points}</td>
                <td>${row.total_tasks || 0}</td>
                <td>${row.completed_tasks || 0}</td>
            `;
        case 'departments':
            return `
                <td>${row.department}</td>
                <td>${row.total_tasks}</td>
                <td>${row.completed_tasks}</td>
                <td>${row.completion_rate}%</td>
            `;
        default:
            return '';
    }
}

// تهيئة تواريخ التقارير
function initializeReportDates() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    document.getElementById('reportFromDate').value = formatDateForInput(lastMonth);
    document.getElementById('reportToDate').value = formatDateForInput(today);
}

// حفظ الإعدادات
function saveSettings() {
    const settings = {
        userName: document.getElementById('userName').value,
        userEmail: document.getElementById('userEmail').value,
        systemLanguage: document.getElementById('systemLanguage').value,
        systemTheme: document.getElementById('systemTheme').value,
        dateType: document.getElementById('dateType').value,
        timeFormat: document.getElementById('timeFormat').value,
        newTaskNotification: document.getElementById('newTaskNotification').checked,
        taskCompletedNotification: document.getElementById('taskCompletedNotification').checked,
        overdueTaskNotification: document.getElementById('overdueTaskNotification').checked,
        reminderNotification: document.getElementById('reminderNotification').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked
    };
    
    // حفظ الإعدادات في localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // تطبيق السمة الجديدة
    if (settings.systemTheme !== SYSTEM_CONFIG.theme) {
        document.documentElement.setAttribute('data-theme', settings.systemTheme);
        localStorage.setItem('theme', settings.systemTheme);
        SYSTEM_CONFIG.theme = settings.systemTheme;
    }
    
    showSuccess('تم حفظ الإعدادات بنجاح');
}

// إعادة تعيين الإعدادات
function resetSettings() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
        localStorage.removeItem('userSettings');
        localStorage.removeItem('theme');
        location.reload();
    }
}

// معاينة الصورة
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// عرض/إخفاء النوافذ المنبثقة
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    document.body.style.overflow = 'auto';
}

// تحديث واجهة المستخدم
function updateUI() {
    // تحديث عدد الإشعارات
    updateNotificationsUI();
}

// دوال مساعدة
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(SYSTEM_CONFIG.dateFormat, SYSTEM_CONFIG.dateOptions);
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getStatusClass(status) {
    const statusClasses = {
        'مفتوحة': 'open',
        'جارية': 'in-progress',
        'مكتملة': 'completed',
        'محولة': 'transferred',
        'متأخرة': 'overdue'
    };
    return statusClasses[status] || 'open';
}

function getPriorityClass(priority) {
    const priorityClasses = {
        'عالية': 'high',
        'متوسطة': 'medium',
        'منخفضة': 'low'
    };
    return priorityClasses[priority] || 'medium';
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // إزالة الرسائل السابقة
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}-message`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-message">×</button>
    `;
    
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// إضافة موظف مسند
function addSelectedEmployee() {
    const select = document.getElementById('taskAssignedEmployee');
    const selectedId = select.value;
    const selectedText = select.options[select.selectedIndex].text;
    
    if (!selectedId) return;
    
    const container = document.getElementById('selectedEmployeesList');
    const existingTags = container.querySelectorAll('.employee-tag');
    
    // التحقق من عدم وجود الموظف مسبقاً
    for (let tag of existingTags) {
        if (tag.dataset.employeeId === selectedId) {
            showError('الموظف مضاف مسبقاً');
            return;
        }
    }
    
    const tag = document.createElement('span');
    tag.className = 'employee-tag assigned';
    tag.dataset.employeeId = selectedId;
    tag.innerHTML = `
        ${selectedText}
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(tag);
    select.value = '';
}

// إضافة موظف منجز
function addCompletedEmployee() {
    const select = document.getElementById('taskCompletedEmployee');
    const pointsInput = document.getElementById('completedEmployeePoints');
    const selectedId = select.value;
    const selectedText = select.options[select.selectedIndex].text;
    const points = pointsInput.value || 0;
    
    if (!selectedId) return;
    
    const container = document.getElementById('completedEmployeesList');
    const existingTags = container.querySelectorAll('.employee-tag');
    
    // التحقق من عدم وجود الموظف مسبقاً
    for (let tag of existingTags) {
        if (tag.dataset.employeeId === selectedId) {
            showError('الموظف مضاف مسبقاً');
            return;
        }
    }
    
    const tag = document.createElement('span');
    tag.className = 'employee-tag completed';
    tag.dataset.employeeId = selectedId;
    tag.dataset.points = points;
    tag.innerHTML = `
        ${selectedText} (${points} نقاط)
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(tag);
    select.value = '';
    pointsInput.value = '0';
}

// دوال فارغة للتوافق مع HTML
function editTask(taskId) {
    showError('ميزة التعديل قيد التطوير');
}

function editEmployee(employeeId) {
    showError('ميزة التعديل قيد التطوير');
}

function exportReport(format) {
    showError('ميزة تصدير التقارير قيد التطوير');
}

// إغلاق الإشعارات عند النقر خارجها
document.addEventListener('click', function(e) {
    const notificationsPanel = document.getElementById('notificationsPanel');
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationsPanel && !notificationsPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
        notificationsPanel.classList.remove('show');
    }
});