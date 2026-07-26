import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Activity, Award } from 'lucide-react';

interface AnalyticsChartsProps {
  analyticsData: any;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analyticsData }) => {
  const categoryData = analyticsData?.crime_categories || [
    { name: 'BURGLARY', count: 184 },
    { name: 'VEHICLE THEFT', count: 142 },
    { name: 'ROBBERY', count: 98 },
    { name: 'CYBER FRAUD', count: 112 },
    { name: 'ASSAULT', count: 64 }
  ];

  const trendData = analyticsData?.monthly_trends || [
    { month: 'Oct', cases: 85 },
    { month: 'Nov', cases: 92 },
    { month: 'Dec', cases: 110 },
    { month: 'Jan', cases: 125 },
    { month: 'Feb', cases: 104 },
    { month: 'Mar', cases: 84 }
  ];

  const districtData = [
    { name: 'Bengaluru City', riskScore: 88, status: 'HIGH RISK' },
    { name: 'Mysuru City', riskScore: 64, status: 'MODERATE' },
    { name: 'Mangaluru City', riskScore: 52, status: 'MODERATE' },
    { name: 'Hubballi-Dharwad', riskScore: 45, status: 'STABLE' }
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-4 font-mono text-xs select-none">
      {/* Top Threat KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-police-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-police-muted uppercase tracking-wider">STATEWIDE THREAT INDEX</div>
            <div className="text-xl font-extrabold text-rose-400 mt-0.5">87.4 / 100</div>
            <div className="text-[9px] text-rose-300 font-mono mt-1">HIGH PATROL ALERT</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-500 opacity-80" />
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-police-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-police-muted uppercase tracking-wider">ACTIVE CCTNS FIRS</div>
            <div className="text-xl font-extrabold text-police-highlight mt-0.5">600 CASES</div>
            <div className="text-[9px] text-police-success font-mono mt-1">10 STATIONS INDEXED</div>
          </div>
          <BarChart3 className="w-8 h-8 text-police-highlight opacity-80" />
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-police-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-police-muted uppercase tracking-wider">REPEAT SUSPECT GANGS</div>
            <div className="text-xl font-extrabold text-police-gold mt-0.5">5 ACTIVE GANGS</div>
            <div className="text-[9px] text-police-gold font-mono mt-1">59 KNOWN ACCUSED</div>
          </div>
          <Activity className="w-8 h-8 text-police-gold opacity-80" />
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-police-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-police-muted uppercase tracking-wider">PATROL EFFICIENCY</div>
            <div className="text-xl font-extrabold text-police-success mt-0.5">94.2%</div>
            <div className="text-[9px] text-police-success font-mono mt-1">HOTSPOT COVERED</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-police-success opacity-80" />
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Crime Head Distribution Bar Chart */}
        <div className="glass-panel p-4 rounded-xl border border-police-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-police-border/60 pb-2">
            <div className="font-bold text-police-text uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-police-highlight" />
              Crime Category Distribution (CCTNS)
            </div>
            <span className="text-[10px] text-police-muted">600 FIRs</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#3B82F6', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Crime Rate Trend Line Chart */}
        <div className="glass-panel p-4 rounded-xl border border-police-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-police-border/60 pb-2">
            <div className="font-bold text-police-text uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-police-gold" />
              Monthly Crime Registration Trends
            </div>
            <span className="text-[10px] text-police-gold">Statewide Index</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#F59E0B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="cases" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Threat Breakdown Cards */}
      <div className="glass-panel p-4 rounded-xl border border-police-border space-y-3">
        <div className="font-bold text-police-text uppercase tracking-wider text-xs">District Vulnerability & Risk Scores</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {districtData.map((d, idx) => (
            <div key={idx} className="p-3 bg-police-dark/80 rounded-lg border border-police-border/60 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-police-text">
                <span>{d.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${d.riskScore > 75 ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>{d.status}</span>
              </div>
              <div className="w-full bg-police-card h-2 rounded-full overflow-hidden">
                <div className={`h-full ${d.riskScore > 75 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${d.riskScore}%` }} />
              </div>
              <div className="text-[10px] text-police-muted text-right">Risk Score: {d.riskScore}/100</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
