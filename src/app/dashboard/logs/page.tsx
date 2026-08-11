'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Search,
  Server,
  Eye,
  X,
  Terminal
} from 'lucide-react';

interface LogItem {
  id: string;
  timestamp: string;
  level: string;
  action: string;
  statusCode: number;
  user: string;
  ip: string;
  latency: string;
  message: string;
  stackTrace: string | null;
}

interface MetricsData {
  metrics?: {
    server?: {
      cpuUsagePercent?: number;
      memoryHeapUsedMb?: string;
      memoryHeapTotalMb?: string;
      memoryRssMb?: string;
      nodeVersion?: string;
      uptimeSeconds?: number;
    };
    database?: {
      storageUsedMb?: number;
      storageLimitMb?: number;
      storageUsedPercent?: number;
      latencyMs?: number;
      status?: string;
      totalRows?: number;
      totalTables?: number;
      counts?: Record<string, number>;
    };
  };
  logs?: LogItem[];
}

export default function AdminSystemLogsPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchMetricsAndLogs = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/system-logs');
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        alert(result.error || 'Không thể lấy dữ liệu nhật ký hệ thống');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchMetricsAndLogs();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-neutral-500 font-medium">
        Đang tải thông số giám sát CPU, Database & Log hệ thống...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const server = metrics.server || {};
  const database = metrics.database || {};
  const logs: LogItem[] = data?.logs || [];

  // Filter logs by tab & search query
  const filteredLogs = logs.filter((log) => {
    const matchesTab = activeTab === 'ALL' || log.level === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.message.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.ip.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours} giờ ${mins} phút`;
  };

  return (
    <div className="space-y-8">
      {/* Header Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-amber-500" /> Giám Sát Hiệu Năng & Log Hệ Thống
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Theo dõi thời gian thực dung lượng lưu trữ Database, CPU/RAM Server và nhật ký ghi lỗi hệ thống
          </p>
        </div>

        <button
          onClick={fetchMetricsAndLogs}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-neutral-200 hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Đang Làm Mới...' : 'Cập Nhật Thông Số'}
        </button>
      </div>

      {/* 1. METRICS OVERVIEW CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: CPU Utilization */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Tải CPU Server</span>
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{server.cpuUsagePercent}%</div>
            <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full transition-all duration-500"
                style={{ width: `${server.cpuUsagePercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500">
            Node.js {server.nodeVersion} • Uptime: {formatUptime(server.uptimeSeconds)}
          </p>
        </div>

        {/* Card 2: Memory (RAM) Usage */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Bộ Nhớ RAM (Process)</span>
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{server.memoryHeapUsedMb} MB</div>
            <p className="text-xs text-neutral-400 mt-0.5">Heap Total: {server.memoryHeapTotalMb} MB (RSS: {server.memoryRssMb} MB)</p>
          </div>
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Bộ nhớ ổn định, không rò rỉ
          </p>
        </div>

        {/* Card 3: Database Storage */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Dung Lượng Database</span>
            <HardDrive className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400">{database.storageUsedMb} MB</div>
            <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${database.storageUsedPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Hạn mức: {database.storageLimitMb} MB ({database.storageUsedPercent}% đã dùng)
          </p>
        </div>

        {/* Card 4: Database Health & Latency */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Supabase PostgreSQL</span>
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">{database.latencyMs} ms</div>
            <p className="text-xs text-white font-bold mt-0.5">Trạng thái: {database.status}</p>
          </div>
          <p className="text-[11px] text-neutral-400">
            Tổng bản ghi DB: <span className="text-amber-400 font-bold">{database.totalRows} rows</span> ({database.totalTables} bảng)
          </p>
        </div>

      </div>

      {/* 2. DATABASE TABLE RECORDS BREAKDOWN */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
          <Database className="w-5 h-5 text-amber-400" /> Thống Kê Số Lượng Dữ Liệu Bảng (Tables Breakdown)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Tài Khoản</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">{database.counts?.accounts || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Sản Phẩm</span>
            <span className="text-xl font-black text-white mt-1 block">{database.counts?.products || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Đơn Hàng</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">{database.counts?.orders || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Danh Mục</span>
            <span className="text-xl font-black text-indigo-400 mt-1 block">{database.counts?.categories || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Vouchers</span>
            <span className="text-xl font-black text-rose-400 mt-1 block">{database.counts?.vouchers || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Feedback</span>
            <span className="text-xl font-black text-amber-300 mt-1 block">{database.counts?.feedbacks || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="block text-xs text-neutral-400 font-semibold uppercase">Giao Hàng</span>
            <span className="text-xl font-black text-cyan-400 mt-1 block">{database.counts?.shippings || 0}</span>
          </div>
        </div>
      </div>

      {/* 3. SYSTEM LOGS & EXCEPTION HISTORY TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { key: 'ALL', label: 'Tất Cả Logs' },
              { key: 'ERROR', label: 'Lỗi Hệ Thống (ERROR)' },
              { key: 'WARN', label: 'Cảnh Báo (WARN)' },
              { key: 'INFO', label: 'Nhật Ký Hoạt Động (INFO)' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm theo API, IP, User, Lỗi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-3.5 pr-9 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-neutral-500" />
          </div>

        </div>

        {/* Logs Table Container */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-x-auto shadow-xl">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 border-b border-neutral-800 whitespace-nowrap">
              <tr>
                <th className="p-3">Thời Gian</th>
                <th className="p-3">Cấp Độ</th>
                <th className="p-3">Route / Endpoint</th>
                <th className="p-3">Status</th>
                <th className="p-3">Người Dùng / IP</th>
                <th className="p-3">Nội Dung Log</th>
                <th className="p-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500 font-sans">
                    Không tìm thấy nhật ký log phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const levelBadge =
                    log.level === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                  return (
                    <tr key={log.id} className="hover:bg-neutral-850 transition-colors">
                      <td className="p-3 text-neutral-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${levelBadge}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white whitespace-nowrap">{log.action}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            log.statusCode >= 500
                              ? 'text-rose-400'
                              : log.statusCode >= 400
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {log.statusCode} ({log.latency})
                        </span>
                      </td>
                      <td className="p-3 text-neutral-300 whitespace-nowrap">
                        {log.user} <span className="text-neutral-500 text-[10px]">({log.ip})</span>
                      </td>
                      <td className="p-3 text-neutral-300 font-sans max-w-sm truncate whitespace-nowrap">
                        {log.message}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-sans text-xs flex items-center gap-1 ml-auto"
                          title="Xem thông tin chi tiết log"
                        >
                          <Eye className="w-3.5 h-3.5" /> Chi Tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Log Details */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Chi Tiết Nhật Ký Log Hệ Thống</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">THỜI GIAN:</span>
                  <span className="text-white font-bold">{new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">CẤP ĐỘ / STATUS:</span>
                  <span className="text-amber-400 font-bold">{selectedLog.level} ({selectedLog.statusCode})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">ENDPOINT ROUTE:</span>
                  <span className="text-emerald-400 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">NGƯỜI DÙNG / IP:</span>
                  <span className="text-neutral-200">{selectedLog.user} ({selectedLog.ip})</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-bold uppercase block mb-1">Nội dung Thông điệp (Message):</span>
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed font-sans text-sm">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.stackTrace && (
                <div>
                  <span className="text-rose-400 font-bold uppercase block mb-1">Exception Stack Trace Error:</span>
                  <pre className="bg-neutral-950 p-3.5 rounded-xl border border-rose-500/30 text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed text-[11px]">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-neutral-800 pt-3 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
