/**
 * متتبع تقدم المشروع
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startDate?: Date;
  completedDate?: Date;
  dependencies: string[];
  tasks: {
    id: string;
    name: string;
    completed: boolean;
    notes?: string;
  }[];
  progress: number; // 0-100
}

interface ProjectProgress {
  currentPhase: string;
  overallProgress: number;
  phases: ProjectPhase[];
  lastUpdated: Date;
}

class ProgressTracker {
  private readonly STORAGE_KEY = 'irrigation_project_progress';

  /**
   * الحصول على تقدم المشروع
   */
  getProgress(): ProjectProgress {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // إنشاء هيكل التقدم الافتراضي
    return this.initializeProgress();
  }

  /**
   * تهيئة هيكل التقدم
   */
  private initializeProgress(): ProjectProgress {
    const phases: ProjectPhase[] = [
      {
        id: 'phase1',
        name: 'المرحلة الأولى: نظام الصلاحيات والمستخدمين',
        description: 'إنشاء نظام المصادقة والصلاحيات الهرمي',
        status: 'in_progress',
        dependencies: [],
        tasks: [
          { id: 'auth_types', name: 'تعريف أنواع المصادقة', completed: true },
          { id: 'auth_service', name: 'خدمة المصادقة', completed: true },
          { id: 'user_management', name: 'إدارة المستخدمين', completed: true },
          { id: 'permissions', name: 'نظام الصلاحيات', completed: true },
          { id: 'role_hierarchy', name: 'التسلسل الهرمي للأدوار', completed: false }
        ],
        progress: 80
      },
      {
        id: 'phase2',
        name: 'المرحلة الثانية: التصنيفات وسلة المحذوفات',
        description: 'إضافة نظام التصنيفات وسلة المحذوفات',
        status: 'in_progress',
        dependencies: ['phase1'],
        tasks: [
          { id: 'categories_types', name: 'تعريف أنواع التصنيفات', completed: true },
          { id: 'category_service', name: 'خدمة التصنيفات', completed: true },
          { id: 'category_manager', name: 'مدير التصنيفات', completed: true },
          { id: 'trash_types', name: 'تعريف أنواع سلة المحذوفات', completed: true },
          { id: 'trash_service', name: 'خدمة سلة المحذوفات', completed: true },
          { id: 'trash_page', name: 'صفحة سلة المحذوفات', completed: true }
        ],
        progress: 100
      },
      {
        id: 'phase3',
        name: 'المرحلة الثالثة: تحسين قاعدة البيانات',
        description: 'تحديث قاعدة البيانات لدعم الميزات الجديدة',
        status: 'pending',
        dependencies: ['phase2'],
        tasks: [
          { id: 'db_schema_update', name: 'تحديث مخطط قاعدة البيانات', completed: false },
          { id: 'new_tables', name: 'إضافة الجداول الجديدة', completed: false },
          { id: 'data_migration', name: 'ترحيل البيانات', completed: false },
          { id: 'indexes_optimization', name: 'تحسين الفهارس', completed: false }
        ],
        progress: 0
      },
      {
        id: 'phase4',
        name: 'المرحلة الرابعة: تحسين واجهة المستخدم',
        description: 'تحسين المكونات وإضافة الميزات المفقودة',
        status: 'pending',
        dependencies: ['phase3'],
        tasks: [
          { id: 'enhanced_dashboard', name: 'تحسين لوحة التحكم', completed: false },
          { id: 'category_integration', name: 'دمج التصنيفات في المكونات', completed: false },
          { id: 'trash_integration', name: 'دمج سلة المحذوفات', completed: false },
          { id: 'notifications_system', name: 'نظام الإشعارات المحسن', completed: false },
          { id: 'advanced_search', name: 'البحث المتقدم', completed: false }
        ],
        progress: 0
      },
      {
        id: 'phase5',
        name: 'المرحلة الخامسة: التقارير المتقدمة',
        description: 'إضافة التقارير المفصلة والتحليلات',
        status: 'pending',
        dependencies: ['phase4'],
        tasks: [
          { id: 'employee_detailed_reports', name: 'تقارير الموظفين المفصلة', completed: false },
          { id: 'performance_analytics', name: 'تحليلات الأداء', completed: false },
          { id: 'custom_reports', name: 'التقارير المخصصة', completed: false },
          { id: 'export_enhancements', name: 'تحسينات التصدير', completed: false }
        ],
        progress: 0
      },
      {
        id: 'phase6',
        name: 'المرحلة السادسة: الأمان والاستقرار',
        description: 'تعزيز الأمان وضمان الاستقرار',
        status: 'pending',
        dependencies: ['phase5'],
        tasks: [
          { id: 'security_enhancements', name: 'تحسينات الأمان', completed: false },
          { id: 'data_validation', name: 'التحقق من صحة البيانات', completed: false },
          { id: 'error_handling', name: 'معالجة الأخطاء', completed: false },
          { id: 'performance_optimization', name: 'تحسين الأداء', completed: false },
          { id: 'testing_suite', name: 'مجموعة الاختبارات', completed: false }
        ],
        progress: 0
      },
      {
        id: 'phase7',
        name: 'المرحلة السابعة: التوثيق والنشر',
        description: 'إكمال التوثيق وإعداد النشر',
        status: 'pending',
        dependencies: ['phase6'],
        tasks: [
          { id: 'user_documentation', name: 'دليل المستخدم', completed: false },
          { id: 'admin_documentation', name: 'دليل المدير', completed: false },
          { id: 'installation_scripts', name: 'ملفات التثبيت', completed: false },
          { id: 'deployment_guide', name: 'دليل النشر', completed: false },
          { id: 'maintenance_guide', name: 'دليل الصيانة', completed: false }
        ],
        progress: 0
      }
    ];

    const progress: ProjectProgress = {
      currentPhase: 'phase2',
      overallProgress: 25,
      phases,
      lastUpdated: new Date()
    };

    this.saveProgress(progress);
    return progress;
  }

  /**
   * تحديث تقدم المرحلة
   */
  updatePhaseProgress(phaseId: string, taskId: string, completed: boolean, notes?: string): void {
    const progress = this.getProgress();
    const phase = progress.phases.find(p => p.id === phaseId);
    
    if (phase) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = completed;
        task.notes = notes;
        
        // حساب تقدم المرحلة
        const completedTasks = phase.tasks.filter(t => t.completed).length;
        phase.progress = Math.round((completedTasks / phase.tasks.length) * 100);
        
        // تحديث حالة المرحلة
        if (phase.progress === 100) {
          phase.status = 'completed';
          phase.completedDate = new Date();
        } else if (phase.progress > 0) {
          phase.status = 'in_progress';
          if (!phase.startDate) phase.startDate = new Date();
        }
        
        // حساب التقدم العام
        const totalProgress = progress.phases.reduce((sum, p) => sum + p.progress, 0);
        progress.overallProgress = Math.round(totalProgress / progress.phases.length);
        
        // تحديث المرحلة الحالية
        const currentPhaseIndex = progress.phases.findIndex(p => p.status === 'in_progress');
        if (currentPhaseIndex !== -1) {
          progress.currentPhase = progress.phases[currentPhaseIndex].id;
        }
        
        progress.lastUpdated = new Date();
        this.saveProgress(progress);
      }
    }
  }

  /**
   * الانتقال للمرحلة التالية
   */
  moveToNextPhase(): void {
    const progress = this.getProgress();
    const currentPhaseIndex = progress.phases.findIndex(p => p.id === progress.currentPhase);
    
    if (currentPhaseIndex !== -1 && currentPhaseIndex < progress.phases.length - 1) {
      const currentPhase = progress.phases[currentPhaseIndex];
      const nextPhase = progress.phases[currentPhaseIndex + 1];
      
      // إكمال المرحلة الحالية
      currentPhase.status = 'completed';
      currentPhase.completedDate = new Date();
      
      // بدء المرحلة التالية
      nextPhase.status = 'in_progress';
      nextPhase.startDate = new Date();
      
      progress.currentPhase = nextPhase.id;
      progress.lastUpdated = new Date();
      
      this.saveProgress(progress);
    }
  }

  /**
   * حفظ التقدم
   */
  private saveProgress(progress: ProjectProgress): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  /**
   * إعادة تعيين التقدم
   */
  resetProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * تصدير تقرير التقدم
   */
  exportProgressReport(): void {
    const progress = this.getProgress();
    const report = {
      projectName: 'نظام إدارة مصلحة الري',
      generatedAt: new Date(),
      overallProgress: progress.overallProgress,
      currentPhase: progress.currentPhase,
      phases: progress.phases.map(phase => ({
        name: phase.name,
        status: phase.status,
        progress: phase.progress,
        completedTasks: phase.tasks.filter(t => t.completed).length,
        totalTasks: phase.tasks.length,
        startDate: phase.startDate,
        completedDate: phase.completedDate
      }))
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `تقرير_تقدم_المشروع_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

export const progressTracker = new ProgressTracker();

// تحديث تقدم المرحلة الحالية
progressTracker.updatePhaseProgress('phase2', 'categories_types', true);
progressTracker.updatePhaseProgress('phase2', 'category_service', true);
progressTracker.updatePhaseProgress('phase2', 'category_manager', true);
progressTracker.updatePhaseProgress('phase2', 'trash_types', true);
progressTracker.updatePhaseProgress('phase2', 'trash_service', true);
progressTracker.updatePhaseProgress('phase2', 'trash_page', true);

export default ProgressTracker;