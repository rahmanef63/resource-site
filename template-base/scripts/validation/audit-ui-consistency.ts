/**
 * UI Consistency Auditor
 * 
 * Scans the codebase for non-standard UI patterns and generates
 * a report of components that need attention.
 * 
 * Run: npx tsx scripts/validation/audit-ui-consistency.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SCAN_DIRS = [
  'app',
  'components',
  'frontend'
];

const SHADCN_COMPONENTS = [
  'Button', 'Input', 'Select', 'Checkbox', 'Radio',
  'Dialog', 'AlertDialog', 'Sheet', 'Drawer', 'Popover',
  'DropdownMenu', 'ContextMenu', 'Menubar',
  'Table', 'Card', 'Badge', 'Avatar',
  'Tabs', 'Accordion', 'Collapsible',
  'Toast', 'Sonner', 'Alert',
  'Form', 'Label', 'Textarea',
  'Switch', 'Slider', 'Progress',
  'Tooltip', 'ScrollArea', 'Separator',
  'Skeleton', 'Breadcrumb', 'Command'
];

interface Issue {
  file: string;
  line: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
}

interface AuditResult {
  totalFiles: number;
  filesWithIssues: number;
  issues: Issue[];
  stats: {
    nativeButtons: number;
    inlineColors: number;
    nonStandardSpacing: number;
    missingA11y: number;
    directImports: number;
  };
}

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') && !item.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath: string): Issue[] {
  const issues: Issue[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for native HTML buttons instead of Button component
    if (/<button(?![A-Z])/.test(line) && !/Button/.test(line)) {
      // Skip if it's inside a comment or string
      if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          type: 'warning',
          message: 'Use <Button> component instead of native <button>',
          code: line.trim().substring(0, 80)
        });
      }
    }
    
    // Check for inline color values
    const inlineColorPatterns = [
      /style=\{[^}]*(?:color|background|border):\s*['"]#[a-fA-F0-9]+['"]/,
      /className=["'][^"']*(?:bg|text|border)-\[[#a-fA-F0-9]+\]/,
      /style=\{[^}]*(?:color|background):\s*['"]rgb\(/
    ];
    
    for (const pattern of inlineColorPatterns) {
      if (pattern.test(line)) {
        issues.push({
          file: relativePath,
          line: lineNum,
          type: 'warning',
          message: 'Use CSS variables or Tailwind color classes instead of inline colors',
          code: line.trim().substring(0, 80)
        });
        break;
      }
    }
    
    // Check for non-standard spacing (arbitrary values instead of design system)
    const spacingPattern = /(?:p|m|gap|space)-\[\d+(?:px|rem)\]/;
    if (spacingPattern.test(line)) {
      issues.push({
        file: relativePath,
        line: lineNum,
        type: 'info',
        message: 'Consider using standard Tailwind spacing values (4, 8, 12, 16, etc.)',
        code: line.trim().substring(0, 80)
      });
    }
    
    // Check for missing aria labels on interactive elements
    if (/<(?:button|a|input)/.test(line) && 
        !line.includes('aria-') && 
        !line.includes('role=') &&
        line.includes('onClick')) {
      // Only flag if there's no visible text content
      if (line.includes('/>') || line.includes('icon') || line.includes('Icon')) {
        issues.push({
          file: relativePath,
          line: lineNum,
          type: 'info',
          message: 'Consider adding aria-label for accessibility',
          code: line.trim().substring(0, 80)
        });
      }
    }
    
    // Check for direct Radix UI imports instead of shadcn wrappers
    if (line.includes('@radix-ui/react-') && 
        !filePath.includes('components/ui/') &&
        !line.includes('Slot')) {
      issues.push({
        file: relativePath,
        line: lineNum,
        type: 'warning',
        message: 'Import shadcn/ui wrapper instead of direct Radix UI import',
        code: line.trim().substring(0, 80)
      });
    }
    
    // Check for hardcoded z-index values
    if (/z-\[\d+\]/.test(line)) {
      issues.push({
        file: relativePath,
        line: lineNum,
        type: 'info',
        message: 'Consider using standard z-index values (z-10, z-20, z-50)',
        code: line.trim().substring(0, 80)
      });
    }
    
    // Check for deprecated className patterns
    if (line.includes('className="') && line.includes('" +')) {
      issues.push({
        file: relativePath,
        line: lineNum,
        type: 'info',
        message: 'Use cn() utility for className concatenation',
        code: line.trim().substring(0, 80)
      });
    }
  });
  
  return issues;
}

function generateReport(result: AuditResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('                    UI CONSISTENCY AUDIT REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total Files Scanned: ${result.totalFiles}`);
  console.log(`Files with Issues: ${result.filesWithIssues}`);
  console.log(`Total Issues Found: ${result.issues.length}`);
  console.log();
  
  // Issue breakdown
  const errors = result.issues.filter(i => i.type === 'error').length;
  const warnings = result.issues.filter(i => i.type === 'warning').length;
  const infos = result.issues.filter(i => i.type === 'info').length;
  
  console.log('Issue Types:');
  console.log(`  🔴 Errors: ${errors}`);
  console.log(`  🟡 Warnings: ${warnings}`);
  console.log(`  ℹ️  Info: ${infos}`);
  console.log();
  
  // Stats
  console.log('📈 STATISTICS');
  console.log('-'.repeat(40));
  console.log(`Native buttons found: ${result.stats.nativeButtons}`);
  console.log(`Inline colors found: ${result.stats.inlineColors}`);
  console.log(`Non-standard spacing: ${result.stats.nonStandardSpacing}`);
  console.log(`Missing a11y attributes: ${result.stats.missingA11y}`);
  console.log(`Direct Radix imports: ${result.stats.directImports}`);
  console.log();
  
  // Top issues by file
  console.log('📋 ISSUES BY FILE');
  console.log('-'.repeat(80));
  
  const issuesByFile = new Map<string, Issue[]>();
  for (const issue of result.issues) {
    const existing = issuesByFile.get(issue.file) || [];
    existing.push(issue);
    issuesByFile.set(issue.file, existing);
  }
  
  // Sort by issue count
  const sortedFiles = [...issuesByFile.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);
  
  for (const [file, issues] of sortedFiles) {
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;
    
    console.log(`\n📄 ${file}`);
    console.log(`   Issues: ${issues.length} (🔴${errorCount} 🟡${warningCount} ℹ️${infoCount})`);
    
    // Show first 3 issues
    for (const issue of issues.slice(0, 3)) {
      const icon = issue.type === 'error' ? '🔴' :
                   issue.type === 'warning' ? '🟡' : 'ℹ️';
      console.log(`   ${icon} Line ${issue.line}: ${issue.message}`);
    }
    
    if (issues.length > 3) {
      console.log(`   ... and ${issues.length - 3} more issues`);
    }
  }
  
  if (sortedFiles.length < issuesByFile.size) {
    console.log(`\n... and ${issuesByFile.size - sortedFiles.length} more files with issues`);
  }
  
  // Recommendations
  console.log('\n');
  console.log('📝 RECOMMENDATIONS');
  console.log('-'.repeat(40));
  console.log('1. Replace native <button> elements with <Button> from @/components/ui/button');
  console.log('2. Use CSS variables (--primary, --muted, etc.) instead of hardcoded colors');
  console.log('3. Use standard Tailwind spacing (p-4, m-2, gap-3) instead of arbitrary values');
  console.log('4. Add aria-label to icon-only buttons for accessibility');
  console.log('5. Import shadcn/ui components instead of direct Radix UI primitives');
  console.log('6. Use cn() utility from @/lib/utils for className concatenation');
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
function main(): void {
  console.log('🎨 Auditing UI consistency...\n');
  
  let allFiles: string[] = [];
  
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(process.cwd(), dir);
    allFiles.push(...getAllTsxFiles(dirPath));
  }
  
  console.log(`Found ${allFiles.length} TSX files to analyze\n`);
  
  const allIssues: Issue[] = [];
  let filesWithIssues = 0;
  
  const stats = {
    nativeButtons: 0,
    inlineColors: 0,
    nonStandardSpacing: 0,
    missingA11y: 0,
    directImports: 0
  };
  
  for (const file of allFiles) {
    const issues = analyzeFile(file);
    if (issues.length > 0) {
      filesWithIssues++;
      allIssues.push(...issues);
      
      // Update stats
      for (const issue of issues) {
        if (issue.message.includes('Button')) stats.nativeButtons++;
        if (issue.message.includes('inline colors')) stats.inlineColors++;
        if (issue.message.includes('spacing')) stats.nonStandardSpacing++;
        if (issue.message.includes('aria-label')) stats.missingA11y++;
        if (issue.message.includes('Radix UI')) stats.directImports++;
      }
    }
  }
  
  const result: AuditResult = {
    totalFiles: allFiles.length,
    filesWithIssues,
    issues: allIssues,
    stats
  };
  
  generateReport(result);
}

main();
