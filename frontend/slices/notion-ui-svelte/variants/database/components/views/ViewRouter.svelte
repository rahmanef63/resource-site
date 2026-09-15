<script lang="ts">
  import type {Database,DatabaseViewConfig,Page,PropertyValue} from "@/features/notion-ui/variants/database/types";
  import TableView from "./TableView.svelte";import BoardView from "./BoardView.svelte";import CardViews from "./CardViews.svelte";import CalendarView from "./CalendarView.svelte";import ChartView from "./ChartView.svelte";import DashboardView from "./DashboardView.svelte";import FormView from "./FormView.svelte";import MapView from "./MapView.svelte";import TimelineView from "./TimelineView.svelte";
  let {db,view,rows,readOnly=false,pages=[],onRowUpdate,onRowRemove,onOpenRow,onRowCreate,onRowAddInGroup}= $props<{db:Database;view:DatabaseViewConfig;rows:Page[];readOnly?:boolean;pages?:Page[];onRowUpdate?:(r:string,p:string,v:PropertyValue)=>void;onRowRemove?:(id:string)=>void;onOpenRow?:(id:string)=>void;onRowCreate?:(d:{title:string;rowProps:Record<string,PropertyValue>})=>Promise<void>|void;onRowAddInGroup?:(a:{groupPropId:string;groupValue:string|null})=>void}>();
</script>
{#if view.type==="table"}<TableView {db} {view} {rows} {readOnly} {pages} {onRowUpdate} {onRowRemove} {onOpenRow}/>
{:else if view.type==="board"}<BoardView {db} {view} {rows} {readOnly} {pages} {onRowUpdate} {onOpenRow} {onRowAddInGroup}/>
{:else if view.type==="list"||view.type==="gallery"||view.type==="feed"}<CardViews mode={view.type} {db} {view} {rows} {readOnly} {pages} {onRowUpdate} {onOpenRow}/>
{:else if view.type==="calendar"}<CalendarView {db} {view} {rows} {onOpenRow}/>
{:else if view.type==="chart"}<ChartView {db} {view} {rows}/>
{:else if view.type==="dashboard"}<DashboardView {db} {view} {rows} {onOpenRow}/>
{:else if view.type==="form"}<FormView {db} {view} {rows} {onRowCreate}/>
{:else if view.type==="map"}<MapView {db} {view} {rows} {onOpenRow}/>
{:else if view.type==="timeline"}<TimelineView {db} {view} {rows} {onOpenRow}/>{/if}
