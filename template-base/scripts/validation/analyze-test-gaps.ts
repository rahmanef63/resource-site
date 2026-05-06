/**
 * Feature Test Gap Analyzer
 * 
 * Identifies features that are missing test coverage
 * and generates a prioritized list of tests to add.
 * 
 * Run: npx tsx scripts/validation/analyze-test-gaps.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const CONVEX_FEATURES_DIR = path.join(process.cwd(), 'convex', 'features');
const FRONTEND_FEATURES_DIR = path.join(process.cwd(), 'frontend', 'slices');
const TESTS_DIR = path.join(process.cwd(), 'tests');

interface FeatureTestAnalysis {
  name: string;
  type: 'convex' | 'frontend';
  hasUnitTests: boolean;
  hasIntegrationTests: boolean;
  testFiles: string[];
  sourceFiles: number;
  estimatedTestsNeeded: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface TestGapReport {
  totalFeatures: number;
  featuresWithTests: number;
  featuresWithoutTests: number;
  analyses: FeatureTestAnalysis[];
}

function countFiles(dir: string, extensions: string[]): number {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && !item.includes('__tests__')) {
      count += countFiles(fullPath, extensions);
    } else if (extensions.some(ext => item.endsWith(ext))) {
      count++;
    }
  }
  
  return count;
}

function findTestFiles(featureName: string): string[] {
  const testFiles: string[] = [];
  const normalizedName = featureName.replace(/_/g, '-');
  
  // Check tests/features directory
  const testsFeaturePath = path.join(TESTS_DIR, 'features', normalizedName);
  if (fs.existsSync(testsFeaturePath)) {
    const files = fs.readdirSync(testsFeaturePath);
    testFiles.push(...files.filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'))
      .map(f => path.join('tests', 'features', normalizedName, f)));
  }
  
  // Check frontend/slices/__tests__ directories
  const frontendPath = path.join(FRONTEND_FEATURES_DIR, normalizedName);
  if (fs.existsSync(frontendPath)) {
    const checkDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (item === '__tests__') {
            const tests = fs.readdirSync(fullPath);
            testFiles.push(...tests.filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'))
              .map(f => path.relative(process.cwd(), path.join(fullPath, f))));
          } else {
            checkDir(fullPath);
          }
        } else if (item.endsWith('.test.ts') || item.endsWith('.test.tsx')) {
          testFiles.push(path.relative(process.cwd(), fullPath));
        }
      }
    };
    checkDir(frontendPath);
  }
  
  return testFiles;
}

function determinePriority(featureName: string, sourceFiles: number): { priority: 'high' | 'medium' | 'low'; reason: string } {
  // High priority - core features
  const highPriorityFeatures = ['core', 'database', 'auth', 'chat', 'notifications', 'projects'];
  if (highPriorityFeatures.includes(featureName)) {
    return { priority: 'high', reason: 'Core feature - critical for application' };
  }
  
  // High priority - many source files
  if (sourceFiles > 10) {
    return { priority: 'high', reason: 'Large feature with many source files' };
  }
  
  // Medium priority - important features
  const mediumPriorityFeatures = ['tasks', 'wiki', 'reports', 'crm', 'workflows', 'support'];
  if (mediumPriorityFeatures.includes(featureName)) {
    return { priority: 'medium', reason: 'Important business feature' };
  }
  
  // Medium priority - moderate source files
  if (sourceFiles > 5) {
    return { priority: 'medium', reason: 'Moderate-sized feature' };
  }
  
  // Low priority - smaller features
  return { priority: 'low', reason: 'Smaller or less critical feature' };
}

function analyzeConvexFeatures(): FeatureTestAnalysis[] {
  const analyses: FeatureTestAnalysis[] = [];
  
  if (!fs.existsSync(CONVEX_FEATURES_DIR)) return analyses;
  
  const features = fs.readdirSync(CONVEX_FEATURES_DIR);
  
  for (const feature of features) {
    if (feature.startsWith('_') || feature === 'lib' || feature === 'shared') continue;
    
    const featurePath = path.join(CONVEX_FEATURES_DIR, feature);
    const stat = fs.statSync(featurePath);
    
    if (!stat.isDirectory()) continue;
    
    const sourceFiles = countFiles(featurePath, ['.ts']);
    const testFiles = findTestFiles(feature);
    
    const hasUnitTests = testFiles.some(f => f.endsWith('.test.ts') && !f.includes('integration'));
    const hasIntegrationTests = testFiles.some(f => f.includes('integration'));
    
    const { priority, reason } = determinePriority(feature, sourceFiles);
    
    // Estimate tests needed based on source files and CRUD operations
    const estimatedTestsNeeded = Math.max(0, Math.ceil(sourceFiles * 2) - testFiles.length * 5);
    
    analyses.push({
      name: feature,
      type: 'convex',
      hasUnitTests,
      hasIntegrationTests,
      testFiles,
      sourceFiles,
      estimatedTestsNeeded,
      priority,
      reason
    });
  }
  
  return analyses;
}

function analyzeFrontendFeatures(): FeatureTestAnalysis[] {
  const analyses: FeatureTestAnalysis[] = [];
  
  if (!fs.existsSync(FRONTEND_FEATURES_DIR)) return analyses;
  
  const features = fs.readdirSync(FRONTEND_FEATURES_DIR);
  
  for (const feature of features) {
    const featurePath = path.join(FRONTEND_FEATURES_DIR, feature);
    const stat = fs.statSync(featurePath);
    
    if (!stat.isDirectory()) continue;
    
    const sourceFiles = countFiles(featurePath, ['.ts', '.tsx']);
    const testFiles = findTestFiles(feature);
    
    const hasUnitTests = testFiles.some(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
    const hasIntegrationTests = testFiles.some(f => f.includes('integration'));
    
    const { priority, reason } = determinePriority(feature, sourceFiles);
    
    const estimatedTestsNeeded = Math.max(0, Math.ceil(sourceFiles * 1.5) - testFiles.length * 5);
    
    analyses.push({
      name: feature,
      type: 'frontend',
      hasUnitTests,
      hasIntegrationTests,
      testFiles,
      sourceFiles,
      estimatedTestsNeeded,
      priority,
      reason
    });
  }
  
  return analyses;
}

function generateReport(report: TestGapReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('                    FEATURE TEST GAP ANALYSIS');
  console.log('='.repeat(80) + '\n');
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total Features Analyzed: ${report.totalFeatures}`);
  console.log(`Features with Tests: ${report.featuresWithTests}`);
  console.log(`Features without Tests: ${report.featuresWithoutTests}`);
  console.log(`Coverage: ${((report.featuresWithTests / report.totalFeatures) * 100).toFixed(1)}%`);
  console.log();
  
  // Group by priority
  const highPriority = report.analyses.filter(a => a.priority === 'high' && !a.hasUnitTests);
  const mediumPriority = report.analyses.filter(a => a.priority === 'medium' && !a.hasUnitTests);
  const lowPriority = report.analyses.filter(a => a.priority === 'low' && !a.hasUnitTests);
  
  console.log('🎯 PRIORITY BREAKDOWN');
  console.log('-'.repeat(40));
  console.log(`🔴 High Priority (needs tests): ${highPriority.length}`);
  console.log(`🟡 Medium Priority (needs tests): ${mediumPriority.length}`);
  console.log(`🟢 Low Priority (needs tests): ${lowPriority.length}`);
  console.log();
  
  // High priority details
  if (highPriority.length > 0) {
    console.log('🔴 HIGH PRIORITY - TEST IMMEDIATELY');
    console.log('-'.repeat(80));
    
    for (const feature of highPriority) {
      console.log(`\n  📦 ${feature.name} (${feature.type})`);
      console.log(`     Source Files: ${feature.sourceFiles}`);
      console.log(`     Estimated Tests Needed: ${feature.estimatedTestsNeeded}`);
      console.log(`     Reason: ${feature.reason}`);
      console.log(`     Has Unit Tests: ${feature.hasUnitTests ? '✅' : '❌'}`);
      console.log(`     Has Integration Tests: ${feature.hasIntegrationTests ? '✅' : '❌'}`);
    }
  }
  
  // Medium priority details
  if (mediumPriority.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY');
    console.log('-'.repeat(80));
    
    for (const feature of mediumPriority.slice(0, 10)) {
      console.log(`  📦 ${feature.name} (${feature.type}) - ${feature.sourceFiles} files, ${feature.reason}`);
    }
    if (mediumPriority.length > 10) {
      console.log(`  ... and ${mediumPriority.length - 10} more`);
    }
  }
  
  // Features with tests
  const withTests = report.analyses.filter(a => a.hasUnitTests);
  if (withTests.length > 0) {
    console.log('\n✅ FEATURES WITH TESTS');
    console.log('-'.repeat(80));
    
    for (const feature of withTests) {
      const integrationStatus = feature.hasIntegrationTests ? '+ integration' : '';
      console.log(`  ✅ ${feature.name} (${feature.type}) - ${feature.testFiles.length} test files ${integrationStatus}`);
    }
  }
  
  // Recommendations
  console.log('\n');
  console.log('📝 RECOMMENDED TEST PLAN');
  console.log('-'.repeat(40));
  
  console.log('\nWeek 1: High Priority Convex Features');
  for (const feature of highPriority.filter(f => f.type === 'convex').slice(0, 3)) {
    console.log(`  - Add CRUD tests for ${feature.name}`);
  }
  
  console.log('\nWeek 2: High Priority Frontend Features');
  for (const feature of highPriority.filter(f => f.type === 'frontend').slice(0, 3)) {
    console.log(`  - Add component tests for ${feature.name}`);
  }
  
  console.log('\nWeek 3: Medium Priority Features');
  for (const feature of mediumPriority.slice(0, 5)) {
    console.log(`  - Add tests for ${feature.name}`);
  }
  
  // Total estimated effort
  const totalTestsNeeded = report.analyses.reduce((sum, a) => sum + a.estimatedTestsNeeded, 0);
  console.log(`\n📈 Total Estimated Tests Needed: ~${totalTestsNeeded}`);
  console.log(`   Estimated Time: ~${Math.ceil(totalTestsNeeded / 20)} developer-days (assuming 20 tests/day)`);
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
function main(): void {
  console.log('🔍 Analyzing feature test coverage gaps...\n');
  
  const convexAnalyses = analyzeConvexFeatures();
  const frontendAnalyses = analyzeFrontendFeatures();
  
  const allAnalyses = [...convexAnalyses, ...frontendAnalyses];
  
  const report: TestGapReport = {
    totalFeatures: allAnalyses.length,
    featuresWithTests: allAnalyses.filter(a => a.hasUnitTests).length,
    featuresWithoutTests: allAnalyses.filter(a => !a.hasUnitTests).length,
    analyses: allAnalyses.sort((a, b) => {
      // Sort by priority, then by source files
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.sourceFiles - a.sourceFiles;
    })
  };
  
  generateReport(report);
}

main();
