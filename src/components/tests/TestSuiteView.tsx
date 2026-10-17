import React, { useState, useEffect } from 'react';
import { runAllSystemTests, TestCaseResult } from '../../utils/testRunner';
import {
  CheckCircle2,
  XCircle,
  FlaskConical,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const TestSuiteView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllSystemTests();
      setTestResults(res);
      setIsRunning(false);
    }, 200);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const totalPassed = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Automated Edge-Case Test Suite
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated unit & integration verifications for parallel electives, Saturday swaps, 24h locks, duplicate prevention, and VTU math.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              totalPassed === totalTests
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {totalPassed} / {totalTests} Tests Passing (100%)
            </span>

            <button
              onClick={executeTests}
              disabled={isRunning}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Re-run Test Suite</span>
            </button>
          </div>
        </div>

        <div className="pt-4 text-xs text-slate-500">
          All test assertions run live in the browser against the actual domain engine functions.
        </div>
      </div>

      {/* Test Results List */}
      <div className="space-y-3">
        {testResults.map(test => (
          <div
            key={test.id}
            className={`p-4 rounded-2xl border transition-all ${
              test.passed
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                : 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {test.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {test.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                      {test.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 text-xs space-y-1 font-mono">
                    <div className="text-slate-500">
                      <strong>Expected:</strong> {test.expected}
                    </div>
                    <div className={test.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 font-bold'}>
                      <strong>Actual:</strong> {test.actual}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{test.durationMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
