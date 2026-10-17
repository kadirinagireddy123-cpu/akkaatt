import React, { useState } from 'react';
import {
  PRODUCT_BRIEF,
  POSTGRESQL_SCHEMA_SQL,
  OPENAPI_SPEC
} from '../../data/documentationData';
import {
  FileText,
  Database,
  Layers,
  Copy,
  Check,
  Server,
  Cpu,
  BookOpen,
  Milestone
} from 'lucide-react';

export const SystemDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brief' | 'schema' | 'openapi' | 'deployment' | 'roadmap'>('brief');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(POSTGRESQL_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              System Architecture & Technical Specifications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Production engineering deliverables: Product brief, PostgreSQL ER diagram, OpenAPI 3.0 schema, Docker & v2 roadmap.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('brief')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'brief'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1. Product Brief & Flows
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'schema'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2. PostgreSQL Schema
            </button>

            <button
              onClick={() => setActiveTab('openapi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'openapi'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              3. OpenAPI Spec
            </button>

            <button
              onClick={() => setActiveTab('deployment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'deployment'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              4. Deployment (Docker)
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'roadmap'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              5. Roadmap (v2)
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PRODUCT BRIEF & ROLE FLOWS */}
      {activeTab === 'brief' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500">Institution & Academic Calendar</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {PRODUCT_BRIEF.institution}
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-4 font-mono">
                <span>{PRODUCT_BRIEF.program}</span>
                <span>·</span>
                <span>{PRODUCT_BRIEF.academicYear}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              {PRODUCT_BRIEF.vision}
            </p>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Role-Based End-to-End User Journeys
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRODUCT_BRIEF.roleFlows.map(flow => (
                  <div
                    key={flow.role}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {flow.role}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {flow.title}
                      </span>
                    </div>

                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                      {flow.steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POSTGRESQL DDL & ER DIAGRAM */}
      {activeTab === 'schema' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                PostgreSQL DDL Database Schema & Entity Relationships
              </h2>
              <p className="text-xs text-slate-500">
                10 relational tables with UUIDs, composite uniqueness, foreign keys, indexes, and timezone support.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL' : 'Copy DDL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-[600px]">
            {POSTGRESQL_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* TAB 3: OPENAPI SPEC */}
      {activeTab === 'openapi' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              OpenAPI 3.0 REST Specification
            </h2>
            <p className="text-xs text-slate-500">
              API endpoints for timetable resolution, anti-proxy check-in, VTU metrics, and leave workflows.
            </p>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-[600px]">
            {JSON.stringify(OPENAPI_SPEC, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB 4: DEPLOYMENT GUIDE */}
      {activeTab === 'deployment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Deployment & Infrastructure Guide
            </h2>
            <p className="text-slate-500">
              Containerized deployment using Docker, Docker Compose, PostgreSQL 16, and Redis.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-1">
                1. Docker Compose Configuration (docker-compose.yml)
              </div>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px]">
{`version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: bitm_attendance
      POSTGRES_USER: bitm_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD:-secure_bitm_secret_2026}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://bitm_admin:\${DB_PASSWORD:-secure_bitm_secret_2026}@db:5432/bitm_attendance
      REDIS_URL: redis://redis:6379
      PORT: 3000
      NODE_ENV: production
    depends_on:
      - db
      - redis

volumes:
  postgres_data:`}
              </pre>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-1">
                2. Free-Tier / Cloud Run / Supabase Quickstart
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 text-slate-600 dark:text-slate-300">
                <p>• <strong>Database:</strong> Run schema against Supabase or Neon free-tier PostgreSQL in ap-south-1 (Mumbai) for sub-20ms latency to Ballari.</p>
                <p>• <strong>App Service:</strong> Deploy frontend and Node.js proxy to Google Cloud Run or Render with automatic SSL and zero-cost scaling.</p>
                <p>• <strong>Environment Variables:</strong> Configure <code>APP_URL</code>, <code>JWT_SECRET</code>, <code>DATABASE_URL</code>, and <code>TIMEZONE="Asia/Kolkata"</code>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: V2 ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Product Roadmap (Version 2.0 & Beyond)
            </h2>
            <p className="text-slate-500">
              Future architectural milestones for enterprise campus integration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Milestone 1: Facial Recognition
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Edge-based 128-dimensional facial embedding vectors using TensorFlow.js in the browser for passive classroom photo check-ins with anti-spoofing liveness detection.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Milestone 2: Biometric Turnstiles & BLE
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Bluetooth Low Energy (BLE) classroom beacon proximity detection + RFID turnstile hardware telemetry synchronization for campus entrance gates.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Milestone 3: VTU & ERP Sync
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Two-way scheduled automated sync adapters with college ERP (Contineo / Jenzabar / SAP Campus) and VTU digital exam hall-ticket generation portals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
