/**
 * CRUD Coverage Analyzer
 * 
 * Analyzes each Convex feature for CRUD operation completeness
 * and generates a report of missing operations.
 * 
 * Run: npx tsx scripts/validation/analyze-crud-coverage.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const CONVEX_FEATURES_DIR = path.join(process.cwd(), 'convex', 'features');

// Standard CRUD operations to look for
const CRUD_PATTERNS = {
  create: [/^create\w*$/i, /^add\w*$/i, /^insert\w*$/i],
  read: [/^get\w*$/i, /^list\w*$/i, /^search\w*$/i, /^find\w*$/i],
  update: [/^update\w*$/i, /^patch\w*$/i, /^edit\w*$/i, /^upsert\w*$/i],
  delete: [/^delete\w*$/i, /^remove\w*$/i]
};

interface FeatureAnalysis {
  name: string;
  path: string;
  hasMutations: boolean;
  hasQueries: boolean;
  crudOperations: {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
  };
  coverage: number;
  issues: string[];
}

function extractExportedFunctions(fileContent: string): string[] {
  const exports: string[] = [];
  
  // Match: export const functionName = mutation/query/...
  const exportConstPattern = /export\s+const\s+(\w+)\s*=/g;
  let match;
  while ((match = exportConstPattern.exec(fileContent)) !== null) {
    exports.push(match[1]);
  }
  
  // Match: export { functionName }
  const exportBracketPattern = /export\s*\{([^}]+)\}/g;
  while ((match = exportBracketPattern.exec(fileContent)) !== null) {
    const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim());
    exports.push(...names.filter(n => n && !n.startsWith('*')));
  }
  
  return exports;
}

function categorizeFunctions(functions: string[]): { create: string[]; read: string[]; update: string[]; delete: string[] } {
  const categorized = {
    create: [] as string[],
    read: [] as string[],
    update: [] as string[],
    delete: [] as string[]
  };
  
  for (const func of functions) {
    for (const [operation, patterns] of Object.entries(CRUD_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(func))) {
        categorized[operation as keyof typeof categorized].push(func);
        break;
      }
    }
  }
  
  return categorized;
}

function analyzeFeature(featurePath: string, featureName: string): FeatureAnalysis {
  const analysis: FeatureAnalysis = {
    name: featureName,
    path: featurePath,
    hasMutations: false,
    hasQueries: false,
    crudOperations: { create: [], read: [], update: [], delete: [] },
    coverage: 0,
    issues: []
  };
  
  // Check for mutations file
  const mutationsLocations = [
    path.join(featurePath, 'mutations.ts'),
    path.join(featurePath, 'api', 'mutations.ts'),
    path.join(featurePath, 'mutations', 'index.ts')
  ];
  
  for (const mutationsPath of mutationsLocations) {
    if (fs.existsSync(mutationsPath)) {
      analysis.hasMutations = true;
      const content = fs.readFileSync(mutationsPath, 'utf-8');
      const functions = extractExportedFunctions(content);
      const categorized = categorizeFunctions(functions);
      
      analysis.crudOperations.create.push(...categorized.create);
      analysis.crudOperations.update.push(...categorized.update);
      analysis.crudOperations.delete.push(...categorized.delete);
    }
  }
  
  // Check for queries file
  const queriesLocations = [
    path.join(featurePath, 'queries.ts'),
    path.join(featurePath, 'api', 'queries.ts'),
    path.join(featurePath, 'queries', 'index.ts')
  ];
  
  for (const queriesPath of queriesLocations) {
    if (fs.existsSync(queriesPath)) {
      analysis.hasQueries = true;
      const content = fs.readFileSync(queriesPath, 'utf-8');
      const functions = extractExportedFunctions(content);
      const categorized = categorizeFunctions(functions);
      
      analysis.crudOperations.read.push(...categorized.read);
    }
  }
  
  // Calculate coverage
  let operationsFound = 0;
  if (analysis.crudOperations.create.length > 0) operationsFound++;
  if (analysis.crudOperations.read.length > 0) operationsFound++;
  if (analysis.crudOperations.update.length > 0) operationsFound++;
  if (analysis.crudOperations.delete.length > 0) operationsFound++;
  
  analysis.coverage = (operationsFound / 4) * 100;
  
  // Identify issues
  if (!analysis.hasMutations && !analysis.hasQueries) {
    analysis.issues.push('No mutations or queries found');
  } else {
    if (analysis.crudOperations.create.length === 0) {
      analysis.issues.push('Missing CREATE operation');
    }
    if (analysis.crudOperations.read.length === 0) {
      analysis.issues.push('Missing READ operation');
    }
    if (analysis.crudOperations.update.length === 0) {
      analysis.issues.push('Missing UPDATE operation');
    }
    if (analysis.crudOperations.delete.length === 0) {
      analysis.issues.push('Missing DELETE operation');
    }
  }
  
  return analysis;
}

function analyzeSubFeatures(featurePath: string, parentName: string): FeatureAnalysis[] {
  const analyses: FeatureAnalysis[] = [];
  
  if (!fs.existsSync(featurePath)) return analyses;
  
  const items = fs.readdirSync(featurePath);
  
  for (const item of items) {
    const itemPath = path.join(featurePath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('_') && !item.startsWith('.')) {
      // Check if this directory has mutations/queries
      const hasMutations = fs.existsSync(path.join(itemPath, 'mutations.ts')) ||
                          fs.existsSync(path.join(itemPath, 'api', 'mutations.ts'));
      const hasQueries = fs.existsSync(path.join(itemPath, 'queries.ts')) ||
                        fs.existsSync(path.join(itemPath, 'api', 'queries.ts'));
      
      if (hasMutations || hasQueries) {
        analyses.push(analyzeFeature(itemPath, `${parentName}/${item}`));
      }
      
      // Recursively check subdirectories
      analyses.push(...analyzeSubFeatures(itemPath, `${parentName}/${item}`));
    }
  }
  
  return analyses;
}

function generateReport(analyses: FeatureAnalysis[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('                    CRUD COVERAGE ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Summary
  const totalFeatures = analyses.length;
  const fullCoverage = analyses.filter(a => a.coverage === 100).length;
  const partialCoverage = analyses.filter(a => a.coverage > 0 && a.coverage < 100).length;
  const noCoverage = analyses.filter(a => a.coverage === 0).length;
  const avgCoverage = analyses.reduce((sum, a) => sum + a.coverage, 0) / totalFeatures;
  
  console.log('📊 SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total Features Analyzed: ${totalFeatures}`);
  console.log(`Full CRUD Coverage (100%): ${fullCoverage}`);
  console.log(`Partial Coverage: ${partialCoverage}`);
  console.log(`No Coverage: ${noCoverage}`);
  console.log(`Average Coverage: ${avgCoverage.toFixed(1)}%`);
  console.log();
  
  // Detailed breakdown by feature
  console.log('📋 FEATURE BREAKDOWN');
  console.log('-'.repeat(80));
  
  // Sort by coverage (lowest first to highlight issues)
  const sorted = [...analyses].sort((a, b) => a.coverage - b.coverage);
  
  for (const analysis of sorted) {
    const statusIcon = analysis.coverage === 100 ? '✅' :
                       analysis.coverage >= 75 ? '🟡' :
                       analysis.coverage >= 50 ? '🟠' : '🔴';
    
    console.log(`\n${statusIcon} ${analysis.name} (${analysis.coverage.toFixed(0)}%)`);
    console.log(`   Path: ${path.relative(process.cwd(), analysis.path)}`);
    
    if (analysis.crudOperations.create.length > 0) {
      console.log(`   ✅ CREATE: ${analysis.crudOperations.create.join(', ')}`);
    } else if (analysis.hasMutations || analysis.hasQueries) {
      console.log(`   ⚠️  CREATE: Not found`);
    }
    
    if (analysis.crudOperations.read.length > 0) {
      console.log(`   ✅ READ: ${analysis.crudOperations.read.join(', ')}`);
    } else if (analysis.hasMutations || analysis.hasQueries) {
      console.log(`   ⚠️  READ: Not found`);
    }
    
    if (analysis.crudOperations.update.length > 0) {
      console.log(`   ✅ UPDATE: ${analysis.crudOperations.update.join(', ')}`);
    } else if (analysis.hasMutations || analysis.hasQueries) {
      console.log(`   ⚠️  UPDATE: Not found`);
    }
    
    if (analysis.crudOperations.delete.length > 0) {
      console.log(`   ✅ DELETE: ${analysis.crudOperations.delete.join(', ')}`);
    } else if (analysis.hasMutations || analysis.hasQueries) {
      console.log(`   ⚠️  DELETE: Not found`);
    }
    
    if (analysis.issues.length > 0 && analysis.issues[0] !== 'No mutations or queries found') {
      console.log(`   Issues: ${analysis.issues.filter(i => i !== 'No mutations or queries found').join(', ')}`);
    }
  }
  
  // Recommendations
  console.log('\n');
  console.log('📝 RECOMMENDATIONS');
  console.log('-'.repeat(40));
  
  const needsWork = analyses.filter(a => a.coverage < 100 && (a.hasMutations || a.hasQueries));
  if (needsWork.length > 0) {
    console.log('Features needing CRUD completion:');
    for (const feature of needsWork.slice(0, 10)) {
      console.log(`  - ${feature.name}: ${feature.issues.join(', ')}`);
    }
    if (needsWork.length > 10) {
      console.log(`  ... and ${needsWork.length - 10} more`);
    }
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
function main(): void {
  console.log('🔍 Analyzing Convex features for CRUD coverage...\n');
  
  if (!fs.existsSync(CONVEX_FEATURES_DIR)) {
    console.error(`Error: Features directory not found at ${CONVEX_FEATURES_DIR}`);
    process.exit(1);
  }
  
  const allAnalyses: FeatureAnalysis[] = [];
  const topLevelFeatures = fs.readdirSync(CONVEX_FEATURES_DIR);
  
  for (const feature of topLevelFeatures) {
    const featurePath = path.join(CONVEX_FEATURES_DIR, feature);
    const stat = fs.statSync(featurePath);
    
    if (stat.isDirectory() && !feature.startsWith('_')) {
      // Analyze top-level feature
      allAnalyses.push(analyzeFeature(featurePath, feature));
      
      // For cms_lite, analyze sub-features
      if (feature === 'cms_lite') {
        allAnalyses.push(...analyzeSubFeatures(featurePath, feature));
      }
    }
  }
  
  // Filter out utility modules
  const featureAnalyses = allAnalyses.filter(a => 
    a.hasMutations || a.hasQueries || 
    (a.crudOperations.create.length + a.crudOperations.read.length + 
     a.crudOperations.update.length + a.crudOperations.delete.length) > 0
  );
  
  generateReport(featureAnalyses);
}

main();
