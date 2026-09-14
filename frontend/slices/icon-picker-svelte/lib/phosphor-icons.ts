import type { Component } from "svelte";
import {
  House, Star, Heart, Bookmark, Flag, Tag, Gear, Question,
  Info, Bell, Eye, EyeSlash, Lock, LockOpen, Key, PushPin,
  MapPin, MapTrifold, Globe, Compass, Trophy, Crown, Diamond, Sparkle,
  Lightning, Flame, File, FileText, FileCode, Folder, FolderOpen, Archive,
  Package, Stack, Tray, Trash, DownloadSimple, UploadSimple, Paperclip, Image,
  Images, Envelope, ChatCircle, ChatText, PaperPlaneTilt, At, Phone, PhoneCall,
  VideoCamera, Microphone, SpeakerHigh, Megaphone, ShareNetwork, Link, ArrowSquareOut, Hash,
  ArrowBendUpLeft, CheckSquare, Square, ListChecks, ListPlus, Clipboard, ClipboardText, Calendar,
  CalendarBlank, CalendarCheck, Clock, Timer, Alarm, Hourglass, Book, BookOpen,
  Books, Notebook, NotePencil, Pencil, PencilLine, Highlighter, Eraser, Database,
  Table, GridFour, ListBullets, List, Kanban, Columns, Rows, ChartBar,
  ChartBarHorizontal, ChartLine, ChartPie, TrendUp, TrendDown, Pulse, Sigma, Calculator,
  Percent, Binary, Code, BracketsCurly, BracketsSquare, BracketsRound, GitBranch, GitMerge,
  GitPullRequest, GitCommit, GithubLogo, HardDrives, Cpu, Memory, Bug, Wrench,
  Hammer, FlowArrow, Cloud, CloudArrowUp, CloudArrowDown, Briefcase, Buildings, Storefront,
  ShoppingCart, ShoppingBag, CreditCard, Wallet, CurrencyDollar, Coins, Receipt, Money,
  Users, User, UserPlus, UserCircle, UserMinus, Handshake, Target, Crosshair,
  Camera, FilmStrip, MusicNote, Headphones, Radio, Television, Monitor, DeviceMobile,
  DeviceTablet, Laptop, SpeakerSimpleHigh, Disc, Play, Pause, SkipForward, SkipBack,
  Rewind, FastForward, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind,
  Snowflake, Drop, Tree, TreeEvergreen, Plant, Flower, Mountains, SunHorizon,
  Rainbow, Tornado, Sliders, Funnel, MagnifyingGlass, Microscope, Ruler, Scissors,
  PaintBrush, Palette, Eyedropper, Crop, MagicWand, Magnet, Circle, Triangle,
  Hexagon, Plus, Minus, Check, Asterisk, Equals, Divide, ArrowUp,
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight, CaretUp, CaretDown, CaretLeft,
  CaretRight,
} from "phosphor-svelte";

export type SvelteIconComponent = Component<Record<string, unknown>>;

export const PHOSPHOR_SVELTE_ICONS = {
  House, Star, Heart, Bookmark, Flag, Tag, Gear, Question,
  Info, Bell, Eye, EyeSlash, Lock, LockOpen, Key, PushPin,
  MapPin, MapTrifold, Globe, Compass, Trophy, Crown, Diamond, Sparkle,
  Lightning, Flame, File, FileText, FileCode, Folder, FolderOpen, Archive,
  Package, Stack, Tray, Trash, DownloadSimple, UploadSimple, Paperclip, Image,
  Images, Envelope, ChatCircle, ChatText, PaperPlaneTilt, At, Phone, PhoneCall,
  VideoCamera, Microphone, SpeakerHigh, Megaphone, ShareNetwork, Link, ArrowSquareOut, Hash,
  ArrowBendUpLeft, CheckSquare, Square, ListChecks, ListPlus, Clipboard, ClipboardText, Calendar,
  CalendarBlank, CalendarCheck, Clock, Timer, Alarm, Hourglass, Book, BookOpen,
  Books, Notebook, NotePencil, Pencil, PencilLine, Highlighter, Eraser, Database,
  Table, GridFour, ListBullets, List, Kanban, Columns, Rows, ChartBar,
  ChartBarHorizontal, ChartLine, ChartPie, TrendUp, TrendDown, Pulse, Sigma, Calculator,
  Percent, Binary, Code, BracketsCurly, BracketsSquare, BracketsRound, GitBranch, GitMerge,
  GitPullRequest, GitCommit, GithubLogo, HardDrives, Cpu, Memory, Bug, Wrench,
  Hammer, FlowArrow, Cloud, CloudArrowUp, CloudArrowDown, Briefcase, Buildings, Storefront,
  ShoppingCart, ShoppingBag, CreditCard, Wallet, CurrencyDollar, Coins, Receipt, Money,
  Users, User, UserPlus, UserCircle, UserMinus, Handshake, Target, Crosshair,
  Camera, FilmStrip, MusicNote, Headphones, Radio, Television, Monitor, DeviceMobile,
  DeviceTablet, Laptop, SpeakerSimpleHigh, Disc, Play, Pause, SkipForward, SkipBack,
  Rewind, FastForward, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind,
  Snowflake, Drop, Tree, TreeEvergreen, Plant, Flower, Mountains, SunHorizon,
  Rainbow, Tornado, Sliders, Funnel, MagnifyingGlass, Microscope, Ruler, Scissors,
  PaintBrush, Palette, Eyedropper, Crop, MagicWand, Magnet, Circle, Triangle,
  Hexagon, Plus, Minus, Check, Asterisk, Equals, Divide, ArrowUp,
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight, CaretUp, CaretDown, CaretLeft,
  CaretRight,
} as unknown as Readonly<Record<string, SvelteIconComponent>>;

export const FALLBACK_PHOSPHOR_SVELTE_ICON = FileText as unknown as SvelteIconComponent;

export function resolvePhosphorSvelteIcon(name: string): SvelteIconComponent | null {
  return PHOSPHOR_SVELTE_ICONS[name] ?? null;
}
