import { TypingRecord } from '../types';

/**
 * KeyWarp Data Export and Import Utilities
 * Supports native KeyWarp JSON, legacy TypePulse JSON, and Monkeytype export JSON formats.
 */

export function exportRecordsToJson(records: TypingRecord[]): void {
  const dataStr = JSON.stringify({
    app: 'KeyWarp',
    version: '1.4.5',
    exportedAt: new Date().toISOString(),
    recordsCount: records.length,
    records
  }, null, 2);

  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keywarp_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedJson(jsonText: string): { records: TypingRecord[]; count: number } {
  const parsed = JSON.parse(jsonText);

  // Case 1: Native KeyWarp or legacy TypePulse JSON format
  if ((parsed.app === 'KeyWarp' || parsed.app === 'TypePulse') && Array.isArray(parsed.records)) {
    return {
      records: parsed.records,
      count: parsed.records.length
    };
  }

  // Case 2: Array of TypingRecord directly
  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].grossWpm !== undefined) {
    return {
      records: parsed,
      count: parsed.length
    };
  }

  // Case 3: Monkeytype JSON export format
  // Monkeytype exports an array or an object with results
  const results = Array.isArray(parsed) ? parsed : parsed.results || [];
  if (Array.isArray(results) && results.length > 0) {
    const converted: TypingRecord[] = results.map((mt: Record<string, any>, idx: number) => {
      const netWpm = typeof mt.wpm === 'number' ? Math.round(mt.wpm * 10) / 10 : 0;
      const rawWpm = typeof mt.rawWpm === 'number' ? Math.round(mt.rawWpm * 10) / 10 : netWpm;
      const accuracy = typeof mt.acc === 'number' ? Math.round(mt.acc * 10) / 10 : 100;
      const duration = typeof mt.testDuration === 'number' ? mt.testDuration : 30;
      const ts = mt.timestamp ? new Date(mt.timestamp).toISOString() : new Date().toISOString();

      return {
        id: `rec_mt_${Date.now()}_${idx}`,
        timestamp: ts,
        mode: mt.mode ? `MT ${mt.mode}` : 'Monkeytype Import',
        difficulty: 'Medium',
        passageLength: Math.round((netWpm * 5) * (duration / 60)),
        charactersTyped: Math.round((rawWpm * 5) * (duration / 60)),
        timeSeconds: duration,
        grossWpm: rawWpm,
        netWpm: netWpm,
        accuracy: accuracy,
        totalErrors: typeof mt.restartCount === 'number' ? mt.restartCount : 0,
        mistypedKeys: 'None'
      };
    });

    return {
      records: converted,
      count: converted.length
    };
  }

  throw new Error('Unsupported JSON file format. Expected KeyWarp, TypePulse, or Monkeytype backup.');
}
