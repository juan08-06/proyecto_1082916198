import fs from 'fs';
import path from 'path';

export interface AuditEntry {
  id: string;
  createdAt: string;
  userId: string;
  userName: string;
  userRole: string;
  event: string;
  detail: string;
}

const auditFilePath = path.join(process.cwd(), 'data', 'audit.json');

function ensureAuditFile() {
  if (!fs.existsSync(auditFilePath)) {
    fs.writeFileSync(auditFilePath, JSON.stringify({ entries: [] }, null, 2));
  }
}

export function readAuditEntries() {
  ensureAuditFile();
  const raw = fs.readFileSync(auditFilePath, 'utf-8');
  const parsed = JSON.parse(raw) as { entries: AuditEntry[] };
  return parsed.entries;
}

export function appendAuditEntry(entry: Omit<AuditEntry, 'id' | 'createdAt'>) {
  const entries = readAuditEntries();
  const nextEntry: AuditEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  fs.writeFileSync(auditFilePath, JSON.stringify({ entries: [...entries, nextEntry] }, null, 2));
  return nextEntry;
}

export function readAuditMonth(yyyymm: string) {
  const entries = readAuditEntries();
  return entries.filter((entry) => entry.createdAt.startsWith(yyyymm));
}
