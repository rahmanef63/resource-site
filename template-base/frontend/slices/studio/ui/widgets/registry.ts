import type { WidgetConfig } from '../types/index';
// Standardize widget - skip validation for now
const standardizeWidget = (key: string, config: WidgetConfig): WidgetConfig => config;

// ─── Slices: HTML/layout primitives ──────────────────────────────────────────
import { buttonManifest } from '../slices/widgets/action/button/manifest';
import { cardManifest } from '../slices/widgets/content/card/manifest';
import { textManifest } from '../slices/widgets/content/text/manifest';
import { columnManifest } from '../slices/widgets/layout/column/manifest';
import { containerManifest } from '../slices/widgets/layout/container/manifest';
import { rowManifest } from '../slices/widgets/layout/row/manifest';
import { sectionManifest as _sectionManifest } from '../slices/widgets/layout/section/manifest';
import { divManifest } from '../slices/widgets/layout/div/manifest';
import { imageManifest } from '../slices/widgets/media/image/manifest';
import { iconManifest } from './ui/icon/manifest';

// Patch section label so it appears as "Page" in the library (routing container)
const sectionManifest = {
  ..._sectionManifest,
  label: 'Page',
  description: 'Routable page container. Set a Route Path to link from a Menu.',
};
import { navGroupManifest } from '../slices/widgets/navigation/navGroup/manifest';
import { heroManifest } from '../slices/widgets/templates/hero/manifest';
import { heroCompositeManifest } from '../slices/widgets/templates/heroComposite/manifest';

// ─── Slices: Layout ───────────────────────────────────────────────────────────
import { threeColumnManifest } from '../slices/widgets/layout/threeColumn/manifest';
import { twoColumnManifest } from '../slices/widgets/layout/twoColumn/manifest';
import { gridManifest } from '../slices/widgets/layout/grid/manifest';
import { flexManifest } from '../slices/widgets/layout/flex/manifest';

// ─── shadcn/ui Components ─────────────────────────────────────────────────────
import { accordionManifest } from './ui/accordion/manifest';
import { alertManifest } from './ui/alert/manifest';
import { alertDialogManifest } from './ui/alertDialog/manifest';
import { aspectRatioManifest } from './ui/aspectRatio/manifest';
import { avatarManifest } from './ui/avatar/manifest';
import { badgeManifest } from './ui/badge/manifest';
import { breadcrumbManifest } from './ui/breadcrumb/manifest';
import { buttonGroupManifest } from './ui/buttonGroup/manifest';
import { carouselManifest } from './ui/carousel/manifest';
import { checkboxManifest } from './ui/checkbox/manifest';
import { collapsibleManifest } from './ui/collapsible/manifest';
import { commandManifest } from './ui/command/manifest';
import { contextMenuManifest } from './ui/contextMenu/manifest';
import { dialogManifest } from './ui/dialog/manifest';
import { drawerManifest } from './ui/drawer/manifest';
import { dropdownMenuManifest } from './ui/dropdownMenu/manifest';
import { formGroupManifest } from './ui/formGroup/manifest';
import { hoverCardManifest } from './ui/hoverCard/manifest';
import { inputManifest } from './ui/input/manifest';
import { inputGroupManifest } from './ui/inputGroup/manifest';
import { labelManifest } from './ui/label/manifest';
import { popoverManifest } from './ui/popover/manifest';
import { progressManifest } from './ui/progress/manifest';
import { radioGroupManifest } from './ui/radioGroup/manifest';
import { resizableManifest } from './ui/resizable/manifest';
import { scrollAreaManifest } from './ui/scrollArea/manifest';
import { selectManifest } from './ui/select/manifest';
import { separatorManifest } from './ui/separator/manifest';
import { sheetManifest } from './ui/sheet/manifest';
import { skeletonManifest } from './ui/skeleton/manifest';
import { sliderManifest } from './ui/slider/manifest';
import { sonnerManifest } from './ui/sonner/manifest';
import { switchManifest } from './ui/switch/manifest';
import { tableManifest } from './ui/table/manifest';
import { tabsManifest } from './ui/tabs/manifest';
import { textareaManifest } from './ui/textarea/manifest';
import { toggleManifest } from './ui/toggle/manifest';
import { toggleGroupManifest } from './ui/toggleGroup/manifest';
import { tooltipManifest } from './ui/tooltip/manifest';

// ─── Content Widgets (hidden legacy duplicates) ───────────────────────────────
import { dividerManifest } from './ui/divider/manifest';
import { spacerManifest } from './ui/spacer/manifest';
import { headingManifest } from './ui/heading/manifest';

// ─── Navigation Widgets ───────────────────────────────────────────────────────
import { linkManifest } from './ui/link/manifest';
import { sidebarNavManifest } from './ui/sidebarNav/manifest';
import { navItemManifest } from './ui/navItem/manifest';

// ─── Smart Blocks ─────────────────────────────────────────────────────────────
import { chartManifest as chartBlockManifest } from './blocks/Chart/manifest';
import { kanbanManifest as kanbanBlockManifest } from './blocks/Kanban/manifest';
import { tableManifest as tableBlockManifest } from './blocks/Table/manifest';
import { calendarManifest as calendarBlockManifest } from './blocks/Calendar/manifest';
import { filterManifest as filterBlockManifest } from './blocks/Filter/manifest';
import { fileManifest as fileBlockManifest } from './blocks/File/manifest';
import { commentManifest as commentBlockManifest } from './blocks/Comment/manifest';
import { richTextManifest as richTextBlockManifest } from './blocks/RichText/manifest';
import { formManifest as formBlockManifest } from './blocks/Form/manifest';
import { mediaManifest as mediaBlockManifest } from './blocks/Media/manifest';
import { profileManifest as profileBlockManifest } from './blocks/Profile/manifest';
import { metricCardManifest as metricCardBlockManifest } from './blocks/Metric/manifest';
import { activityManifest as activityBlockManifest } from './blocks/Activity/manifest';
import { listManifest as listBlockManifest } from './blocks/List/manifest';
import { eventsManifest as eventsBlockManifest } from './blocks/Events/manifest';
import { statsManifest as statsBlockManifest } from './blocks/Stats/manifest';
import { agentManifest as agentBlockManifest } from './blocks/Agent/manifest';
import { teamManifest as teamBlockManifest } from './blocks/Team/manifest';
import { timeRangeManifest as timeRangeBlockManifest } from './blocks/TimeRange/manifest';

// ─── UI Composition Blocks ───────────────────────────────────────────────────
import { navbarManifest as navbarBlockManifest } from './blocks/Navbar/manifest';
import { pricingCardManifest as pricingCardBlockManifest } from './blocks/PricingCard/manifest';
import { testimonialManifest as testimonialBlockManifest } from './blocks/Testimonial/manifest';
import { footerManifest as footerBlockManifest } from './blocks/Footer/manifest';

// =============================================================================
// Raw widget registry
//
// THREE-TAB TAXONOMY:
//   Elements   — semantic HTML primitives (div, text, img, button, form controls)
//   Components — shadcn/ui + custom UI building blocks
//   Blocks     — composite section-level components (hero, navbar, chart, etc.)
// =============================================================================
const rawWidgetRegistry: Record<string, WidgetConfig> = {

  // ── ELEMENTS: Layout primitives ────────────────────────────────────────────
  div: { ...divManifest, category: 'Elements' },
  section: { ...sectionManifest, category: 'Elements' },
  threeColumn: { ...threeColumnManifest, category: 'Elements' },
  twoColumn: { ...twoColumnManifest, category: 'Elements' },
  grid: { ...gridManifest, category: 'Elements' },
  flex: { ...flexManifest, category: 'Elements' },

  // ── ELEMENTS: Content primitives ───────────────────────────────────────────
  text: { ...textManifest, category: 'Elements' },
  image: { ...imageManifest, category: 'Elements' },
  icon: { ...iconManifest, category: 'Elements' },
  iconButton: { ...iconManifest, label: 'Icon Button', category: 'Elements' },

  // ── ELEMENTS: Action primitives ────────────────────────────────────────────
  button: { ...buttonManifest, category: 'Elements' },
  link: { ...linkManifest, category: 'Elements' },

  // ── ELEMENTS: Form primitives ──────────────────────────────────────────────
  input: { ...inputManifest, category: 'Elements' },
  textarea: { ...textareaManifest, category: 'Elements' },
  select: { ...selectManifest, category: 'Elements' },
  checkbox: { ...checkboxManifest, category: 'Elements' },
  radioGroup: { ...radioGroupManifest, category: 'Elements' },
  switch: { ...switchManifest, category: 'Elements' },
  label: { ...labelManifest, category: 'Elements' },
  slider: { ...sliderManifest, category: 'Elements' },
  toggle: { ...toggleManifest, category: 'Elements' },

  // ── ELEMENTS: Utility ──────────────────────────────────────────────────────
  spacer: { ...spacerManifest, category: 'Elements' },
  separator: { ...separatorManifest, category: 'Elements' },

  // ── COMPONENTS: shadcn/ui ──────────────────────────────────────────────────
  accordion: { ...accordionManifest, category: 'Components' },
  alert: { ...alertManifest, category: 'Components' },
  alertDialog: { ...alertDialogManifest, category: 'Components' },
  aspectRatio: { ...aspectRatioManifest, category: 'Components' },
  avatar: { ...avatarManifest, category: 'Components' },
  badge: { ...badgeManifest, category: 'Components' },
  breadcrumb: { ...breadcrumbManifest, category: 'Components' },
  buttonGroup: { ...buttonGroupManifest, category: 'Components' },
  card: { ...cardManifest, category: 'Components' },
  carousel: { ...carouselManifest, category: 'Components' },
  collapsible: { ...collapsibleManifest, category: 'Components' },
  command: { ...commandManifest, category: 'Components' },
  contextMenu: { ...contextMenuManifest, category: 'Components' },
  dialog: { ...dialogManifest, category: 'Components' },
  drawer: { ...drawerManifest, category: 'Components' },
  dropdownMenu: { ...dropdownMenuManifest, category: 'Components' },
  formGroup: { ...formGroupManifest, category: 'Components' },
  hoverCard: { ...hoverCardManifest, category: 'Components' },
  inputGroup: { ...inputGroupManifest, category: 'Components' },
  popover: { ...popoverManifest, category: 'Components' },
  progress: { ...progressManifest, category: 'Components' },
  resizable: { ...resizableManifest, category: 'Components' },
  scrollArea: { ...scrollAreaManifest, category: 'Components' },
  sheet: { ...sheetManifest, category: 'Components' },
  skeleton: { ...skeletonManifest, category: 'Components' },
  sonner: { ...sonnerManifest, category: 'Components' },
  table: { ...tableManifest, category: 'Components' },
  tabs: { ...tabsManifest, category: 'Components' },
  toggleGroup: { ...toggleGroupManifest, category: 'Components' },
  tooltip: { ...tooltipManifest, category: 'Components' },

  // ── COMPONENTS: Navigation ─────────────────────────────────────────────────
  navGroup: { ...navGroupManifest, category: 'Components' },
  navItem: { ...navItemManifest, category: 'Components' },
  sidebarNav: { ...sidebarNavManifest, category: 'Components' },

  // ── BLOCKS: Template sections ──────────────────────────────────────────────
  hero: { ...heroManifest, category: 'Blocks' },
  heroComposite: { ...heroCompositeManifest, category: 'Blocks' },

  // ── BLOCKS: UI Composition ─────────────────────────────────────────────────
  navbarBlock: { ...navbarBlockManifest, category: 'Blocks' },
  pricingCardBlock: { ...pricingCardBlockManifest, category: 'Blocks' },
  testimonialBlock: { ...testimonialBlockManifest, category: 'Blocks' },
  footerBlock: { ...footerBlockManifest, category: 'Blocks' },

  // ── BLOCKS: Smart data-connected blocks ────────────────────────────────────
  chartBlock: { ...chartBlockManifest, category: 'Blocks' },
  kanbanBlock: { ...kanbanBlockManifest, category: 'Blocks' },
  tableBlock: { ...tableBlockManifest, category: 'Blocks' },
  calendarBlock: { ...calendarBlockManifest, category: 'Blocks' },
  filterBlock: { ...filterBlockManifest, category: 'Blocks' },
  fileBlock: { ...fileBlockManifest, category: 'Blocks' },
  commentBlock: { ...commentBlockManifest, category: 'Blocks' },
  richTextBlock: { ...richTextBlockManifest, category: 'Blocks' },
  formBlock: { ...formBlockManifest, category: 'Blocks' },
  mediaBlock: { ...mediaBlockManifest, category: 'Blocks' },
  profileBlock: { ...profileBlockManifest, category: 'Blocks' },
  metricCardBlock: { ...metricCardBlockManifest, category: 'Blocks' },
  activityBlock: { ...activityBlockManifest, category: 'Blocks' },
  listBlock: { ...listBlockManifest, category: 'Blocks' },
  eventsBlock: { ...eventsBlockManifest, category: 'Blocks' },
  statsBlock: { ...statsBlockManifest, category: 'Blocks' },
  agentBlock: { ...agentBlockManifest, category: 'Blocks' },
  teamBlock: { ...teamBlockManifest, category: 'Blocks' },
  timeRangeBlock: { ...timeRangeBlockManifest, category: 'Blocks' },

  // ── LEGACY: backward-compat only, hidden from library ─────────────────────
  container: { ...containerManifest, label: 'Container (legacy)', category: 'Elements', hidden: true },
  row: { ...rowManifest, category: 'Elements', hidden: true },
  column: { ...columnManifest, category: 'Elements', hidden: true },
  divider: { ...dividerManifest, category: 'Elements', hidden: true },
  heading: { ...headingManifest, category: 'Elements', hidden: true },
};

// Standardize all widgets
const standardizeRegistry = (registry: Record<string, WidgetConfig>): Record<string, WidgetConfig> => {
  const standardized: Record<string, WidgetConfig> = {};
  Object.entries(registry).forEach(([key, config]) => {
    standardized[key] = standardizeWidget(key, config);
  });
  if (process.env.NODE_ENV === 'development') {
    Object.entries(standardized).forEach(([key, config]) => {
      if (!config.label) console.warn(`[Studio] Widget "${key}" is missing a label`);
      if (!config.render) console.warn(`[Studio] Widget "${key}" is missing a render function`);
      if (!config.category) console.warn(`[Studio] Widget "${key}" is missing a category`);
    });
  }
  return standardized;
};

export const cmsWidgetRegistry = standardizeRegistry(rawWidgetRegistry);

// Widget categories grouped by new 3-tab taxonomy
export const widgetCategories = {
  Elements: Object.entries(cmsWidgetRegistry).filter(([_, c]) => c.category === 'Elements' && !c.hidden).map(([k]) => k),
  Components: Object.entries(cmsWidgetRegistry).filter(([_, c]) => c.category === 'Components' && !c.hidden).map(([k]) => k),
  Blocks: Object.entries(cmsWidgetRegistry).filter(([_, c]) => c.category === 'Blocks' && !c.hidden).map(([k]) => k),
};

export const widgetStats = {
  total: Object.keys(cmsWidgetRegistry).filter(k => !cmsWidgetRegistry[k].hidden).length,
  byCategory: Object.fromEntries(
    Object.entries(widgetCategories).map(([cat, widgets]) => [cat, widgets.length])
  ),
};
