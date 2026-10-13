import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { SentimentType, TopicType } from '../../types/feedback';

export const Charts: React.FC = () => {
  const {
    datasetStats,
    drilldownSentiment,
    drilldownCategory,
    drilldownTopic,
    isDarkMode,
    activeRecords
  } = useApp();

  // Sentiment Data for Donut Chart
  const sentimentData = [
    { name: 'Positive', value: datasetStats.sentimentCounts.positive, key: 'positive' as SentimentType, color: '#10B981' },
    { name: 'Neutral', value: datasetStats.sentimentCounts.neutral, key: 'neutral' as SentimentType, color: '#94A3B8' },
    { name: 'Negative', value: datasetStats.sentimentCounts.negative, key: 'negative' as SentimentType, color: '#EF4444' }
  ];

  // Category Volume Data
  const categoryData = Object.entries(datasetStats.categoriesCount).map(([cat, count]) => ({
    category: cat,
    volume: count
  }));

  // Topic Breakdown Data
  const topicData = Object.entries(datasetStats.topicCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([top, count]) => ({
      topic: top,
      count
    }));

  // Category vs Sentiment Stacked Data
  const catSentMap: Record<string, { category: string; positive: number; neutral: number; negative: number }> = {};
  activeRecords.forEach(r => {
    if (!catSentMap[r.sourceCategory]) {
      catSentMap[r.sourceCategory] = {
        category: r.sourceCategory,
        positive: 0,
        neutral: 0,
        negative: 0
      };
    }
    catSentMap[r.sourceCategory][r.sentiment]++;
  });
  const stackedCatData = Object.values(catSentMap);

  const axisColor = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Sentiment Distribution (Interactive Donut) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Sentiment Distribution</h2>
            <p className="text-xs text-slate-500">Click a sector to filter the underlying feedback</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Interactive
          </span>
        </div>
        <div className="sr-only">
          Sentiment breakdown: {sentimentData.map(d => `${d.name}: ${d.value} records`).join(', ')}.
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                onClick={(entry) => {
                  const e = entry as { key?: string } | undefined;
                  if (e?.key) drilldownSentiment(e.key as SentimentType);
                }}
                className="cursor-pointer"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: isDarkMode ? '#F8FAFC' : '#0F172A'
                }}
                formatter={(val) => [`${Number(val || 0).toLocaleString()} records`, 'Volume']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Feedback Volume by Category */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Volume by Source Category</h2>
            <p className="text-xs text-slate-500">Click a bar to inspect that category cohort</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {categoryData.length} Categories
          </span>
        </div>
        <div className="sr-only">
          Category volume: {categoryData.map(c => `${c.category}: ${c.volume} records`).join(', ')}.
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" stroke={axisColor} fontSize={11} />
              <YAxis
                type="category"
                dataKey="category"
                stroke={axisColor}
                fontSize={11}
                width={120}
                tickFormatter={(val) => val.length > 18 ? val.substring(0, 16) + '...' : val}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="volume"
                fill="#4F46E5"
                radius={[0, 6, 6, 0]}
                onClick={(entry) => {
                  const e = entry as { category?: string } | undefined;
                  if (e?.category) drilldownCategory(e.category);
                }}
                className="cursor-pointer hover:opacity-85"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Category vs Sentiment Breakdown (Stacked Bar) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Category vs. Sentiment Breakdown</h2>
            <p className="text-xs text-slate-500">Notice sentiment varies significantly across categories</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Multi-Axis
          </span>
        </div>
        <div className="sr-only">
          Category vs Sentiment: {stackedCatData.map(c => `${c.category} has ${c.positive} positive, ${c.neutral} neutral, ${c.negative} negative`).join('; ')}.
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stackedCatData}
              margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
            >
              <XAxis
                dataKey="category"
                stroke={axisColor}
                fontSize={11}
                angle={-15}
                textAnchor="end"
                height={40}
              />
              <YAxis stroke={axisColor} fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="top" height={30} />
              <Bar dataKey="positive" name="Positive" stackId="a" fill="#10B981" />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#94A3B8" />
              <Bar dataKey="negative" name="Negative" stackId="a" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Rule-Inferred Topics Distribution */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Inferred Operational Topics</h2>
            <p className="text-xs text-slate-500">Derived by rule-based NLP classification independently of source category</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {topicData.length} Topics
          </span>
        </div>
        <div className="sr-only">
          Topic distribution: {topicData.map(t => `${t.topic}: ${t.count} records`).join(', ')}.
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topicData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" stroke={axisColor} fontSize={11} />
              <YAxis
                type="category"
                dataKey="topic"
                stroke={axisColor}
                fontSize={11}
                width={130}
                tickFormatter={(val) => val.length > 20 ? val.substring(0, 18) + '...' : val}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="count"
                fill="#8B5CF6"
                radius={[0, 6, 6, 0]}
                onClick={(entry) => {
                  const e = entry as { topic?: string } | undefined;
                  if (e?.topic) drilldownTopic(e.topic as TopicType);
                }}
                className="cursor-pointer hover:opacity-85"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
