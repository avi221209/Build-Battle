import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Papa from 'papaparse';
import { analyzeSingleRecord } from '../src/services/analysisEngine';
import { performDeduplication } from '../src/services/deduplication';
import { RawFeedbackRecord } from '../src/types/feedback';

const csvPath = path.resolve(process.cwd(), 'data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv');

// Simple deterministic PRNG (Mulberry32) for reproducible fixed-seed sampling
function createMulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runEvaluation() {
  if (!fs.existsSync(csvPath)) {
    console.error(
      `[NOT RUN] The file "${csvPath}" does not exist on disk.\n` +
      `Per Non-Negotiable Anti-Hallucination Protocol, we cannot invent reviews or sample fabricated data.\n` +
      `Please provide the authentic CSV file at data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv.`
    );
    process.exit(1);
  }

  const csvBuffer = fs.readFileSync(csvPath);
  const sha256 = crypto.createHash('sha256').update(csvBuffer).digest('hex');
  const csvContent = csvBuffer.toString('utf-8');

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true
  });

  const rawRecords: RawFeedbackRecord[] = parsed.data.map((row, idx) => ({
    id: `row-${idx + 1}`,
    review: row.review || '',
    category: row.category || 'Uncategorized'
  }));

  console.log('=== DATASET PROVENANCE ===');
  console.log(`Path: ${csvPath}`);
  console.log(`SHA256: ${sha256}`);
  console.log(`Total Rows Ingested: ${rawRecords.length}`);

  // Deduplication
  const dedupResult = performDeduplication(rawRecords);
  const uniqueRecords = dedupResult.deduplicatedRecords;

  console.log(`Exact Unique Count: ${dedupResult.summary.exactUniqueCount}`);
  console.log(`Normalized Unique Count: ${dedupResult.summary.normalizedUniqueCount}`);
  console.log(`Duplicates Removed: ${dedupResult.summary.normalizedDuplicatesRemoved}`);
  console.log(`Duplicate Percentage: ${dedupResult.summary.duplicatePercentage}%\n`);

  // Analyze all unique reviews
  const analyzedUnique = uniqueRecords.map(r => analyzeSingleRecord(r));

  // Distributions
  const sentimentCounts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
  const topicCounts: Record<string, number> = {};
  let lowConfidenceCount = 0;

  analyzedUnique.forEach(rec => {
    sentimentCounts[rec.sentiment] = (sentimentCounts[rec.sentiment] || 0) + 1;
    topicCounts[rec.topic] = (topicCounts[rec.topic] || 0) + 1;
    if (rec.confidence < 0.75) lowConfidenceCount++;
  });

  console.log('=== SENTIMENT DISTRIBUTION (All Unique Reviews) ===');
  Object.entries(sentimentCounts).forEach(([sent, count]) => {
    const pct = ((count / analyzedUnique.length) * 100).toFixed(1);
    console.log(`- ${sent}: ${count} (${pct}%)`);
  });

  console.log('\n=== TOPIC DISTRIBUTION (All Unique Reviews) ===');
  Object.entries(topicCounts).forEach(([topic, count]) => {
    const pct = ((count / analyzedUnique.length) * 100).toFixed(1);
    console.log(`- ${topic}: ${count} (${pct}%)`);
  });

  console.log(`\nLow Confidence Reviews (< 0.75): ${lowConfidenceCount} / ${analyzedUnique.length}`);

  // Discordances:
  // 1. Positive sentiment but category is 'Fraud and Scam'
  // 2. Negative sentiment but category is 'Product Feedback'
  console.log('\n=== DISCORDANCES AUDIT (Category vs Predicted Sentiment) ===');
  const fraudPositive = analyzedUnique.filter(r => r.sourceCategory === 'Fraud and Scam' && r.sentiment === 'positive');
  const productNegative = analyzedUnique.filter(r => r.sourceCategory === 'Product Feedback' && r.sentiment === 'negative');

  console.log(`\n[A] Positive Sentiment in "Fraud and Scam" (${fraudPositive.length} cases):`);
  if (fraudPositive.length === 0) {
    console.log('  (None detected)');
  } else {
    fraudPositive.forEach(fp => {
      console.log(`  - [${fp.id}] "${fp.review}" -> Topic: ${fp.topic}, Conf: ${fp.confidence}`);
    });
  }

  console.log(`\n[B] Negative Sentiment in "Product Feedback" (${productNegative.length} cases):`);
  if (productNegative.length === 0) {
    console.log('  (None detected)');
  } else {
    productNegative.slice(0, 10).forEach(pn => {
      console.log(`  - [${pn.id}] "${pn.review}" -> Topic: ${pn.topic}, Conf: ${pn.confidence}`);
    });
    if (productNegative.length > 10) {
      console.log(`  ... and ${productNegative.length - 10} more.`);
    }
  }

  // 40 Sampled Predictions using fixed seed PRNG
  console.log('\n=== 40 SAMPLED PREDICTIONS (Fixed Seed: 2026) ===');
  const rng = createMulberry32(2026);
  const sampleIndices = new Set<number>();
  const targetSampleSize = Math.min(40, analyzedUnique.length);

  while (sampleIndices.size < targetSampleSize) {
    const idx = Math.floor(rng() * analyzedUnique.length);
    sampleIndices.add(idx);
  }

  const sortedIndices = Array.from(sampleIndices).sort((a, b) => a - b);

  console.log('| # | ID | Source Category | Predicted Sentiment | Topic | Urgency | Conf | Evidence Snippets |');
  console.log('|---|---|---|---|---|---|---|---|');

  sortedIndices.forEach((idx, i) => {
    const r = analyzedUnique[idx];
    const evidence = r.evidenceSnippets.join('; ').replace(/\|/g, '');
    console.log(`| ${i + 1} | ${r.id} | ${r.sourceCategory} | **${r.sentiment}** | ${r.topic} | ${r.urgency} | ${r.confidence} | "${evidence}" |`);
  });
}

runEvaluation();
