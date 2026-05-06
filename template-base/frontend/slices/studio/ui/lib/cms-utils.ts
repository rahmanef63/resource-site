export { cn } from '@/lib/utils';

export const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

export const compactProps = (defaults: Record<string, any>, props: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.keys(props || {}).forEach((k) => {
    if (JSON.stringify(props[k]) !== JSON.stringify(defaults[k])) {
      out[k] = props[k];
    }
  });
  return out;
};

// Static lookup tables — Tailwind v4 requires complete class strings (no dynamic fragments)
const FLEX_DIR: Record<string, string> = { row:'flex-row', col:'flex-col', column:'flex-col', 'row-reverse':'flex-row-reverse', 'column-reverse':'flex-col-reverse' };
const GAP_CMS: Record<string, string>  = { '0':'gap-0','1':'gap-1','2':'gap-2','3':'gap-3','4':'gap-4','5':'gap-5','6':'gap-6','8':'gap-8','10':'gap-10','12':'gap-12' };
const PAD_CMS: Record<string, string>  = { '0':'p-0','1':'p-1','2':'p-2','3':'p-3','4':'p-4','5':'p-5','6':'p-6','8':'p-8','10':'p-10','12':'p-12' };
const MAR_CMS: Record<string, string>  = { '0':'m-0','1':'m-1','2':'m-2','3':'m-3','4':'m-4','5':'m-5','6':'m-6','8':'m-8','10':'m-10','12':'m-12','auto':'m-auto' };
const W_CMS: Record<string, string>    = { auto:'w-auto',full:'w-full',screen:'w-screen','1/2':'w-1/2','1/3':'w-1/3','2/3':'w-2/3','1/4':'w-1/4','3/4':'w-3/4' };
const H_CMS: Record<string, string>    = { auto:'h-auto',full:'h-full',screen:'h-screen' };
const POS_CMS: Record<string, string>  = { static:'static',relative:'relative',absolute:'absolute',fixed:'fixed',sticky:'sticky' };

export const generateSectionClasses = (props: Record<string, any>): string => {
  const classes: string[] = [];
  if (props.display) classes.push(props.display);
  if (props.direction && props.display === 'flex' && FLEX_DIR[props.direction]) classes.push(FLEX_DIR[props.direction]);
  if (props.gap     && GAP_CMS[props.gap])   classes.push(GAP_CMS[props.gap]);
  if (props.padding && PAD_CMS[props.padding]) classes.push(PAD_CMS[props.padding]);
  if (props.margin  && MAR_CMS[props.margin]) classes.push(MAR_CMS[props.margin]);
  if (props.width   && W_CMS[props.width])   classes.push(W_CMS[props.width]);
  if (props.height  && H_CMS[props.height])  classes.push(H_CMS[props.height]);
  if (props.position && POS_CMS[props.position]) classes.push(POS_CMS[props.position]);
  return classes.join(' ');
};
