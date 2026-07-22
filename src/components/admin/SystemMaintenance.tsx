'use client';

import React, { useEffect, useState } from 'react';
import { Server, RefreshCw, AlertTriangle, Play, Undo, Cpu, HardDrive, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SystemMaintenance() {
  const {
    maintenanceMode,
    deployLogs,
    alertConfigs,
    toggleMaintenanceMode,
    logAuditAction,
    loadDatabase
  } = useAdminStore();

  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);
  const [updateConsole, setUpdateConsole] = useState<string[]>([
    '[INFRA] Standby for deploy trigger...',
    '[SYSTEM] Current version: v2.4.1 (ONLINE)'
  ]);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Monitoring stats
  const [stats, setStats] = useState({
    uptime: '14d 6h 32m',
    responseTime: 124,
    cpuUsage: 34,
    memoryUsage: 58,
    diskUsage: 42
  });

  useEffect(() => {
    loadDatabase();
    // Simulate slight fluctuations in metrics
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        responseTime: Math.floor(100 + Math.random() * 50),
        cpuUsage: Math.floor(30 + Math.random() * 15),
        memoryUsage: Math.floor(55 + Math.random() * 5)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [loadDatabase]);

  const handleSystemUpdate = () => {
    if (isUpdatingSystem) return;
    setIsUpdatingSystem(true);
    setUpdateProgress(0);
    setUpdateConsole([
      '[INFRA] Fetching codebase from remote feature/primerent-v2-notifications...',
      '[INFRA] Merging master branches...',
      '[BUILD] Starting webpack development bundle compiler...',
      '[BUILD] Verifying type definitions and lints...'
    ]);

    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUpdatingSystem(false);
            setUpdateConsole(logs => [
              ...logs,
              '[SYSTEM] Deploy completed! Dev servers reloaded safely.',
              '[SYSTEM] Status: ONLINE - Active Version: v2.4.2'
            ]);
            logAuditAction('System Patch Update & Build deployment', 'Infrastructure Server', 'Deployed version v2.4.2 successfully');
            toast({ title: 'อัปเกรดระบบจำลองสำเร็จ!' });
          }, 500);
          return 100;
        }
        const next = prev + 20;
        if (next === 40) {
          setUpdateConsole(logs => [...logs, '[DB] Migration step: Adding field classification logs...', '[DB] Applied successfully']);
        }
        if (next === 80) {
          setUpdateConsole(logs => [...logs, '[BUILD] Bundle generated (2.42MB assets compiled)', '[SYSTEM] Initializing server update hot reload...']);
        }
        return next;
      });
    }, 1000);
  };

  const handleRollback = (version: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะทำการ Rollback ระบบกลับไปยังเวอร์ชัน ${version}?`)) {
      toast({ title: `กำลังเริ่ม Rollback ไปยัง ${version}...` });
      logAuditAction('System Rollback Triggered', 'Infrastructure Server', `Rollback target version: ${version}`);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-700/20">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">System Update & Maintenance</h1>
          <p className="text-xs text-slate-500 font-bold">Deploy, rollback, monitoring, alerting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Gauges & Metrics */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            Infrastructure Resource Monitoring
          </CardTitle>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>CPU Usage</span>
                <span>{stats.cpuUsage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${stats.cpuUsage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Memory Usage</span>
                <span>{stats.memoryUsage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.memoryUsage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Disk space</span>
                <span>{stats.diskUsage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.diskUsage}%` }} />
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-2 text-center text-xs font-bold">
              <div className="p-2 bg-slate-50 rounded-xl border">
                <p className="text-slate-400 text-[10px]">UPTIME</p>
                <p className="text-slate-800 text-sm mt-0.5">{stats.uptime}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border">
                <p className="text-slate-400 text-[10px]">AVG LATENCY</p>
                <p className="text-indigo-600 text-sm mt-0.5">{stats.responseTime} ms</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Maintenance Config */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Maintenance Settings
          </CardTitle>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-bold text-xs text-slate-800">โหมดปิดปรับปรุงระบบ (Maintenance Mode)</p>
                <p className="text-[10px] text-slate-400 mt-1">ล็อกอินผู้ใช้ทั่วไปไม่ได้ แสดงหน้าปิดปรับปรุง</p>
              </div>
              <button
                onClick={() => {
                  toggleMaintenanceMode();
                  toast({ title: `เปลี่ยนโหมดบำรุงรักษาแล้ว = ${!maintenanceMode}` });
                }}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative flex items-center",
                  maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 absolute",
                  maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                )} />
              </button>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-yellow-800 font-bold">
                * ข้อควรระวัง: เมื่อเปิดโหมดนี้จะยุติเซสชันผู้ใช้อื่นทันที ยกเว้นบัญชีสิทธิ์แอดมินจำลอง
              </p>
            </div>
          </div>
        </Card>

        {/* Alert configs */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            Alerting Rules
          </CardTitle>
          <div className="space-y-3 pt-2">
            {alertConfigs.map(cfg => (
              <div key={cfg.id} className="flex items-center justify-between border rounded-xl p-3 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-xs text-slate-800">{cfg.name}</p>
                  <p className="text-[10px] text-slate-400">Threshold: {cfg.threshold}% · Channel: {cfg.notifyChannel}</p>
                </div>
                <Badge className={cfg.enabled ? 'bg-green-50 text-green-700 border-green-100 border' : 'bg-slate-100 text-slate-400'}>
                  {cfg.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Deployment console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            Update Deploy Console
          </CardTitle>
          <div className="space-y-3 pt-2">
            <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-4 rounded-xl space-y-1.5 h-44 overflow-y-auto shadow-inner">
              {updateConsole.map((log, idx) => <p key={idx}>{log}</p>)}
              {isUpdatingSystem && <p className="animate-pulse text-yellow-500">&gt;&gt;&gt; Building assets {updateProgress}% ...</p>}
            </div>
            <Button
              onClick={handleSystemUpdate}
              disabled={isUpdatingSystem}
              className="w-full bg-slate-900 text-white rounded-xl h-10 font-black text-xs gap-1.5"
            >
              <Play className={cn('w-4 h-4 text-green-400', isUpdatingSystem && 'animate-spin')} />
              {isUpdatingSystem ? 'กำลังสร้างคอมไพล์...' : 'กดปุ่มจำลองการ Deploy Update (v2.4.2)'}
            </Button>
          </div>
        </Card>

        {/* Deploy history */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Undo className="w-4 h-4 text-slate-500" />
            Deployment Logs & Rollback
          </CardTitle>
          <div className="space-y-3 max-h-[220px] overflow-y-auto font-bold text-xs pt-2">
            {deployLogs.map(log => (
              <div key={log.id} className="border rounded-xl p-3 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900">{log.version}</span>
                  <Badge className={
                    log.status === 'success' ? 'bg-green-50 text-green-700 border-green-100 border' :
                    log.status === 'rollback' ? 'bg-amber-50 text-amber-700 border-amber-100 border' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }>
                    {log.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500">{log.changelog}</p>
                <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t">
                  <span>โดย {log.deployedBy} · {new Date(log.timestamp).toLocaleDateString()}</span>
                  {log.status === 'success' && (
                    <Button
                      variant="link"
                      onClick={() => handleRollback(log.version)}
                      className="text-red-500 hover:text-red-700 text-[9px] h-auto p-0 font-bold"
                    >
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
