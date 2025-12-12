/**
 * MCP Chat Interface Component
 * 
 * Development-only chat interface for interacting with the Next.js MCP server.
 * Provides a terminal-like experience for executing MCP commands and viewing responses.
 * 
 * **Features:**
 * - Auto-connect on mount (configurable)
 * - Command input with ↑↓ history navigation
 * - Message display with role-based styling (user/assistant/system/error)
 * - Tool and resource discovery via quick action buttons
 * - Responsive design matching ChatDialog
 * - Accessibility: ARIA live regions for screen readers
 * 
 * **Usage:**
 * This component is rendered inside LiveChatBubble when `NODE_ENV === 'development'`.
 * In production, the LiveChatBubble shows a "Coming Soon" placeholder instead.
 * 
 * **Commands:**
 * - `/connect` or `/init` - Initialize MCP connection
 * - `/tools` or `/list-tools` - List available tools
 * - `/resources` or `/list-resources` - List available resources
 * - `/call <tool-name> [args-json]` - Call a specific tool
 * - `/help` - Show help message
 * 
 * @module components/ui/McpChatInterface
 * @see {@link useMcpChat} The underlying hook for MCP communication
 * @see {@link LiveChatBubble} The parent component that renders this interface
 * 
 * @example
 * ```tsx
 * // Basic usage (auto-connects on mount)
 * <McpChatInterface />
 * 
 * // Disable auto-connect
 * <McpChatInterface autoConnect={false} />
 * ```
 */

'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

import classNames from 'classnames'
import { 
	Terminal, 
	Plug, 
	AlertCircle, 
	Send, 
	Trash2,
	Wrench,
	HelpCircle,
	Loader2,
	Play,
	Copy,
	Check,
	ChevronDown,
	ChevronRight,
	Star,
	Keyboard,
	Route,
	Bug,
	FileCode,
	Clock,
	Layers,
	Server,
	FileText,
	RefreshCw,
	ExternalLink,
	AlertTriangle,
	XCircle,
	Info,
	Download,
	Github,
	Settings2,
	Workflow,
	PlayCircle,
	type LucideIcon,
} from 'lucide-react'

import { logger } from '@_core/logger'

import { parseDateOrNow } from '@_lib/dates'

import { useMcpChat, useCopyToClipboard, type McpMessage, type McpTool } from '@_shared/hooks'

import Button from './Button'
import Input from './Input'
import Select from './Select'

// =============================================================================
// CONSTANTS
// =============================================================================

/** Maximum commands to store in history (matches hook constant) */
const COMMAND_HISTORY_LIMIT = 50

/** localStorage key for command history */
const HISTORY_STORAGE_KEY = 'mcp-devtools-history'

/** localStorage key for tool favorites */
const FAVORITES_STORAGE_KEY = 'mcp-devtools-favorites'

/** Maximum favorites to store */
const MAX_FAVORITES = 10

/** localStorage key for workflows */
const WORKFLOWS_STORAGE_KEY = 'mcp-devtools-workflows'

/** Maximum workflows to store */
const MAX_WORKFLOWS = 20

/** localStorage key for UI preferences */
const PREFERENCES_STORAGE_KEY = 'mcp-devtools-preferences'

/** Available font sizes */
const FONT_SIZES = ['compact', 'normal', 'comfortable'] as const
type FontSize = typeof FONT_SIZES[number]

/** Font size class mappings */
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
	compact: 'text-xs',
	normal: 'text-sm',
	comfortable: 'text-base',
}

/** Default UI preferences */
const DEFAULT_PREFERENCES: UiPreferences = {
	fontSize: 'normal',
	showTimestamps: true,
}

/** Available slash commands for autocomplete */
const SLASH_COMMANDS = [
	{ command: '/connect', description: 'Connect to MCP server' },
	{ command: '/tools', description: 'List available tools' },
	{ command: '/resources', description: 'List available resources' },
	{ command: '/call', description: 'Call a tool: /call <tool-name> [args]' },
	{ command: '/help', description: 'Show available commands' },
	{ command: '/clear', description: 'Clear chat messages' },
	{ command: '/workflow', description: 'Manage workflows: /workflow save|run|list' },
	{ command: '/export', description: 'Export chat as markdown' },
	{ command: '/config', description: 'Manage config: /config export|import|reset' },
] as const

/** localStorage key for config version (for migrations) */
const CONFIG_VERSION = 1

/**
 * DevTools Configuration - Exportable settings
 * Includes workflows, favorites, and preferences
 */
interface DevToolsConfig {
	version: number
	exportedAt: string
	workflows: Workflow[]
	favorites: string[]
	preferences: UiPreferences
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Workflow - A saved sequence of commands
 */
interface Workflow {
	id: string
	name: string
	description?: string
	commands: string[]
	createdAt: string
}

/**
 * UI Preferences
 */
interface UiPreferences {
	fontSize: FontSize
	showTimestamps: boolean
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Status configuration for each connection state */
const STATUS_CONFIG = {
	disconnected: {
		text: 'OFFLINE',
		dotColor: 'bg-base-content/30',
		textColor: 'text-base-content/40',
		pulse: false,
	},
	connecting: {
		text: 'CONNECTING',
		dotColor: 'bg-warning',
		textColor: 'text-warning',
		pulse: true,
	},
	connected: {
		text: 'CONNECTED',
		dotColor: 'bg-success',
		textColor: 'text-success',
		pulse: true,
	},
	error: {
		text: 'ERROR',
		dotColor: 'bg-error',
		textColor: 'text-error',
		pulse: false,
	},
} as const

/** Valid status configuration keys */
type StatusKey = keyof typeof STATUS_CONFIG

/**
 * Connection Status Indicator
 * 
 * Displays the current MCP connection status with a glowing dot and text.
 * Uses DaisyUI semantic colors for theme compliance.
 * 
 * @param props - Component props
 * @param props.status - Current connection status string
 * @returns JSX element displaying the connection status
 * 
 * @internal This is a private sub-component of McpChatInterface
 */
function ConnectionStatus({ status }: { status: string }) {
	const statusKey = (status in STATUS_CONFIG ? status : 'disconnected') as StatusKey
	const config = STATUS_CONFIG[statusKey]
	
	return (
		<div className="flex items-center gap-2">
			{/* Pulse indicator dot */}
			<div className="relative flex h-2 w-2">
				{config.pulse && (
					<span className={classNames(
						"animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
						config.dotColor
					)} />
				)}
				<span className={classNames(
					"relative inline-flex rounded-full h-2 w-2",
					config.dotColor
				)} />
			</div>
			<span className={classNames(
				"text-xs uppercase font-bold tracking-wider",
				config.textColor
			)}>
				{config.text}
			</span>
		</div>
	)
}

/**
 * Chat Message Display
 * 
 * Renders a single message in the chat history with role-appropriate styling.
 * Uses only DaisyUI semantic colors for full theme compliance.
 * Uses SmartContent for intelligent content rendering (JSON, tool lists).
 * 
 * @param props - Component props
 * @param props.message - The message object to render
 * @param props.tools - Available MCP tools (for rich tool list display)
 * @param props.onSelectTool - Callback when a tool's "Try It" is clicked
 * @param props.favorites - Set of favorite tool names
 * @param props.onToggleFavorite - Callback for toggling favorites
 * @returns JSX element displaying the formatted message
 * 
 * @internal This is a private sub-component of McpChatInterface
 */
function ChatMessage({ 
	message,
	tools,
	onSelectTool,
	favorites,
	onToggleFavorite,
}: { 
	message: McpMessage
	tools?: McpTool[]
	onSelectTool?: (command: string) => void
	favorites?: Set<string>
	onToggleFavorite?: (toolName: string) => void
}) {
	const roleStyles = {
		user: {
			align: 'justify-end',
			bubble: 'bg-primary text-primary-content rounded-2xl rounded-tr-sm shadow-md',
			icon: null,
			font: 'font-sans text-sm',
			useSmartContent: false, // User input is always plain text
		},
		assistant: {
			align: 'justify-start',
			bubble: 'bg-base-200 text-base-content rounded-2xl rounded-tl-sm shadow-sm border border-base-300',
			icon: Terminal,
			font: 'font-mono text-xs',
			useSmartContent: true, // Assistant responses may contain JSON/tools
		},
		system: {
			align: 'justify-center',
			bubble: 'bg-info/10 text-info border border-info/20 rounded-xl shadow-sm text-center',
			icon: null,
			font: 'font-sans text-xs',
			useSmartContent: true, // System messages may include tool lists
		},
		error: {
			align: 'justify-center',
			bubble: 'bg-error/10 text-error border border-error/20 rounded-xl shadow-sm text-center',
			icon: AlertCircle,
			font: 'font-sans text-xs',
			useSmartContent: false, // Errors are plain text
		},
	}
	
	const style = roleStyles[message.role]
	const Icon = style.icon
	
	return (
		<div className={classNames('flex w-full animate-fade-in', style.align)}>
			<div className={classNames(
				'max-w-[90%] px-4 py-3 relative group',
				style.bubble
			)}>
				<div className="flex items-start gap-3">
					{Icon && (
						<Icon size={14} className="mt-0.5 shrink-0 opacity-70" aria-hidden="true" />
					)}
					<div className="min-w-0 flex-1">
						<div className={classNames("leading-relaxed", style.font)}>
							{style.useSmartContent ? (
								<SmartContent 
									content={message.content} 
									tools={tools}
									onSelectTool={onSelectTool}
									favorites={favorites}
									onToggleFavorite={onToggleFavorite}
								/>
							) : (
								<div className="whitespace-pre-wrap">{message.content}</div>
							)}
						</div>
						{/* Metadata footer - clearly inside the bubble */}
						{message.metadata?.duration && (
							<div className="flex items-center gap-1.5 text-xs text-base-content/50 mt-3 pt-2 border-t border-base-content/10 font-mono">
								<span>⏱️ {message.metadata.duration}ms</span>
								{message.metadata.toolName && (
									<>
										<span aria-hidden="true">•</span>
										<span className="font-semibold">{message.metadata.toolName}</span>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

/**
 * Terminal Input Prefix
 * 
 * Renders the `$` prompt symbol for the terminal input.
 * Separated as a component for proper leftIcon usage in Input.
 */
function TerminalPrompt() {
	return (
		<span className="text-primary font-mono text-sm select-none" aria-hidden="true">$</span>
	)
}

/**
 * Route Tree Item
 * 
 * Represents a single route in the route tree.
 */
interface RouteItem {
	path: string
	type?: 'page' | 'api' | 'layout' | 'loading' | 'error' | 'not-found'
}

/**
 * Get icon for route type
 */
function getRouteIcon(type: RouteItem['type']): string {
	switch (type) {
		case 'api': return '🔌'
		case 'layout': return '📐'
		case 'loading': return '⏳'
		case 'error': return '❌'
		case 'not-found': return '🔍'
		default: return '📄'
	}
}

/**
 * Format path with highlighted dynamic segments
 */
function formatRoutePath(path: string): React.ReactNode {
	return path.split('/').map((segment, i) => {
		if (segment.startsWith('[') && segment.endsWith(']')) {
			return (
				<span key={i} className="text-warning font-semibold">
					{i > 0 && '/'}
					{segment}
				</span>
			)
		}
		if (segment.startsWith('(') && segment.endsWith(')')) {
			return (
				<span key={i} className="text-info/70 italic">
					{i > 0 && '/'}
					{segment}
				</span>
			)
		}
		return <span key={i}>{i > 0 && '/'}{segment}</span>
	})
}

/**
 * Route Tree Display
 * 
 * Renders app routes in a visually appealing list with icons.
 * Highlights dynamic segments [param] and route groups (group).
 * 
 * @param props - Component props
 * @param props.routes - Array of route items
 */
function RouteTree({ routes }: { routes: RouteItem[] }) {
	if (routes.length === 0) {
		return (
			<div className="text-center text-base-content/50 py-4 text-sm">
				No routes found
			</div>
		)
	}
	
	return (
		<div className="space-y-1 font-mono text-xs">
			<div className="text-xs font-semibold text-base-content/70 mb-2">
				🗺️ {routes.length} Routes
			</div>
			{routes.map(route => (
				<div 
					key={route.path}
					className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-base-200/50 group"
				>
					<span aria-hidden="true">{getRouteIcon(route.type)}</span>
					<code className="flex-1 text-base-content/80">{formatRoutePath(route.path)}</code>
					{route.type && route.type !== 'page' && (
						<span className="text-xs text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity">
							{route.type}
						</span>
					)}
				</div>
			))}
		</div>
	)
}

// =============================================================================
// PHASE 3: DEBUG COMPONENTS
// =============================================================================

/**
 * Error item from get_errors response
 */
interface McpError {
	type?: 'build' | 'runtime' | 'warning'
	message: string
	stack?: string
	file?: string
	line?: number
	column?: number
}

/**
 * Type guard for error responses
 * 
 * **Edge Cases Handled:**
 * - Empty array → false (no errors to display)
 * - Array with objects containing 'message' → true
 * - Object with 'errors' array → true
 * - Null/undefined values → false
 */
function isErrorsData(data: unknown): data is { errors: McpError[] } | McpError[] {
	if (Array.isArray(data)) {
		// Empty array is not errors data (nothing to display)
		if (data.length === 0) {return false}
		// All items must have a 'message' property with a truthy value
		return data.every(item => 
			typeof item === 'object' && 
			item !== null && 
			'message' in item &&
			typeof (item as { message: unknown }).message === 'string'
		)
	}
	if (typeof data === 'object' && data !== null && 'errors' in data) {
		const { errors } = data as { errors: unknown }
		return Array.isArray(errors) && errors.length > 0
	}
	return false
}

/**
 * Error severity icon
 */
function getErrorIcon(type?: McpError['type']): React.ReactNode {
	switch (type) {
		case 'build':
			return <XCircle size={14} className="text-error" />
		case 'runtime':
			return <AlertTriangle size={14} className="text-warning" />
		case 'warning':
			return <Info size={14} className="text-info" />
		default:
			return <AlertCircle size={14} className="text-error" />
	}
}

/**
 * Error Card Component
 * 
 * Displays a single error with expandable stack trace and copy functionality.
 */
function ErrorCard({ error }: { error: McpError }) {
	const [expanded, setExpanded] = useState(false)
	const [copied, copyToClipboard] = useCopyToClipboard()
	
	const hasStack = error.stack && error.stack.length > 0
	const location = error.file 
		? `${error.file}${error.line ? `:${error.line}` : ''}${error.column ? `:${error.column}` : ''}`
		: null
	
	const copyContent = `${error.message}${location ? `\n\nLocation: ${location}` : ''}${error.stack ? `\n\nStack Trace:\n${error.stack}` : ''}`
	
	return (
		<div className={classNames(
			"border rounded-lg overflow-hidden",
			error.type === 'warning' ? "border-warning/30 bg-warning/5" :
			error.type === 'runtime' ? "border-warning/30 bg-warning/5" :
			"border-error/30 bg-error/5"
		)}>
			<div 
				className="flex items-start gap-3 p-3 cursor-pointer hover:bg-base-200/30 transition-colors"
				onClick={() => hasStack && setExpanded(!expanded)}
				onKeyDown={(e) => e.key === 'Enter' && hasStack && setExpanded(!expanded)}
				role={hasStack ? "button" : undefined}
				tabIndex={hasStack ? 0 : undefined}
				aria-expanded={hasStack ? expanded : undefined}
			>
				<div className="mt-0.5 shrink-0">
					{getErrorIcon(error.type)}
				</div>
				<div className="flex-1 min-w-0 space-y-1">
					<p className="text-sm font-medium text-base-content text-wrap wrap-break-word">
						{error.message}
					</p>
					{location && (
						<div className="flex items-center gap-1.5 text-xs text-base-content/60">
							<FileCode size={12} />
							<code className="font-mono truncate">{location}</code>
						</div>
					)}
				</div>
				<div className="flex items-center gap-1 shrink-0">
					<Button
						variant="ghost"
						size="xs"
						onClick={(e) => {
							e.stopPropagation()
							void copyToClipboard(copyContent)
						}}
						className="h-6 w-6 min-h-0 min-w-0 p-0"
						aria-label={copied ? "Copied!" : "Copy error"}
					>
						{copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
					</Button>
					{hasStack && (
						expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
					)}
				</div>
			</div>
			
			{expanded && hasStack && (
				<div className="border-t border-base-300 p-3 bg-base-200/30">
					<pre className="text-xs font-mono text-base-content/70 whitespace-pre-wrap overflow-x-auto">
						{error.stack}
					</pre>
				</div>
			)}
		</div>
	)
}

/**
 * Error Monitor Component
 * 
 * Displays a list of errors with filtering and summary.
 */
function ErrorMonitor({ errors }: { errors: McpError[] }) {
	const buildErrors = errors.filter(e => e.type === 'build')
	const runtimeErrors = errors.filter(e => e.type === 'runtime')
	const warnings = errors.filter(e => e.type === 'warning')
	const otherErrors = errors.filter(e => !e.type)
	
	if (errors.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<Check size={32} className="text-success mb-2" />
				<p className="text-sm font-medium text-success">No Errors!</p>
				<p className="text-xs text-base-content/50">Your app is running cleanly.</p>
			</div>
		)
	}
	
	return (
		<div className="space-y-3">
			{/* Summary */}
			<div className="flex items-center gap-4 text-xs">
				<span className="font-semibold text-base-content/70">
					🐛 {errors.length} Issue{errors.length !== 1 ? 's' : ''} Found
				</span>
				{buildErrors.length > 0 && (
					<span className="flex items-center gap-1 text-error">
						<XCircle size={12} /> {buildErrors.length} build
					</span>
				)}
				{runtimeErrors.length > 0 && (
					<span className="flex items-center gap-1 text-warning">
						<AlertTriangle size={12} /> {runtimeErrors.length} runtime
					</span>
				)}
				{warnings.length > 0 && (
					<span className="flex items-center gap-1 text-info">
						<Info size={12} /> {warnings.length} warning
					</span>
				)}
			</div>
			
			{/* Error List */}
			<div className="space-y-2">
				{[...buildErrors, ...runtimeErrors, ...otherErrors, ...warnings].map((error, index) => (
					<ErrorCard key={`${error.message}-${index}`} error={error} />
				))}
			</div>
		</div>
	)
}

/**
 * Page metadata from get_page_metadata response
 */
interface PageMetadata {
	url?: string
	pathname?: string
	components?: Array<{ name: string; type?: 'server' | 'client'; renderTime?: number }>
	renderTime?: number
	dataFetching?: Array<{ name: string; duration?: number; cached?: boolean }>
	headers?: Record<string, string>
}

/**
 * Type guard for page metadata
 * 
 * **Priority Order:** This guard is more specific than isProjectMetadata.
 * It requires page-specific fields like 'components', 'renderTime', or 'dataFetching'.
 * A simple 'url' alone is not enough (could be project metadata).
 * 
 * **Edge Cases Handled:**
 * - Must have at least one page-specific field (not just url)
 * - Null values are excluded via typeof checks
 */
function isPageMetadata(data: unknown): data is PageMetadata {
	if (typeof data !== 'object' || data === null) {return false}
	
	const obj = data as Record<string, unknown>
	
	// Must have at least one page-specific field (not just url/pathname)
	const hasComponents = 'components' in obj && Array.isArray(obj.components)
	const hasRenderTime = 'renderTime' in obj && typeof obj.renderTime === 'number'
	const hasDataFetching = 'dataFetching' in obj && Array.isArray(obj.dataFetching)
	
	// If has page-specific fields, it's page metadata
	if (hasComponents || hasRenderTime || hasDataFetching) {
		return true
	}
	
	// If only has pathname (without other project-specific fields), it's page metadata
	const hasPathname = 'pathname' in obj && typeof obj.pathname === 'string'
	const hasProjectPath = 'projectPath' in obj || 'devServerUrl' in obj
	
	return hasPathname && !hasProjectPath
}

/**
 * Page Inspector Component
 * 
 * Displays page metadata with component breakdown and performance metrics.
 */
function PageInspector({ metadata }: { metadata: PageMetadata }) {
	const serverComponents = metadata.components?.filter(c => c.type === 'server') ?? []
	const clientComponents = metadata.components?.filter(c => c.type === 'client') ?? []
	
	return (
		<div className="space-y-4">
			{/* Page Info */}
			{(metadata.url || metadata.pathname) && (
				<div className="flex items-center gap-2 text-sm">
					<Route size={14} className="text-primary" />
					<code className="font-mono text-base-content/80 truncate">
						{metadata.pathname ?? metadata.url}
					</code>
				</div>
			)}
			
			{/* Render Time */}
			{metadata.renderTime !== undefined && (
				<div className="flex items-center gap-2 p-3 bg-base-200/50 rounded-lg">
					<Clock size={16} className="text-info" />
					<div>
						<p className="text-xs text-base-content/60">Total Render Time</p>
						<p className={classNames(
							"text-lg font-bold",
							metadata.renderTime < 100 ? "text-success" :
							metadata.renderTime < 500 ? "text-warning" :
							"text-error"
						)}>
							{metadata.renderTime}ms
						</p>
					</div>
				</div>
			)}
			
			{/* Components Breakdown */}
			{metadata.components && metadata.components.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-base-content/70">
						<Layers size={12} />
						Components ({metadata.components.length})
					</div>
					<div className="grid grid-cols-2 gap-2 text-xs">
						<div className="p-2 bg-info/10 border border-info/20 rounded-lg">
							<div className="flex items-center gap-1.5 mb-1">
								<Server size={12} className="text-info" />
								<span className="font-medium text-info">Server</span>
							</div>
							<span className="text-lg font-bold text-info">{serverComponents.length}</span>
						</div>
						<div className="p-2 bg-warning/10 border border-warning/20 rounded-lg">
							<div className="flex items-center gap-1.5 mb-1">
								<Wrench size={12} className="text-warning" />
								<span className="font-medium text-warning">Client</span>
							</div>
							<span className="text-lg font-bold text-warning">{clientComponents.length}</span>
						</div>
					</div>
					
					{/* Component List */}
					<div className="space-y-1 max-h-40 overflow-y-auto">
						{metadata.components.map((comp, i) => (
							<div 
								key={`${comp.name}-${i}`}
								className="flex items-center justify-between px-2 py-1 bg-base-200/30 rounded text-xs"
							>
								<code className="font-mono truncate">{comp.name}</code>
								<div className="flex items-center gap-2">
									{comp.renderTime !== undefined && (
										<span className="text-base-content/50">{comp.renderTime}ms</span>
									)}
									<span className={classNames(
										"px-1.5 py-0.5 rounded text-xs",
										comp.type === 'server' ? "bg-info/20 text-info" : "bg-warning/20 text-warning"
									)}>
										{comp.type ?? 'unknown'}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
			
			{/* Data Fetching */}
			{metadata.dataFetching && metadata.dataFetching.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-base-content/70">
						<RefreshCw size={12} />
						Data Fetching ({metadata.dataFetching.length})
					</div>
					<div className="space-y-1">
						{metadata.dataFetching.map((fetch, i) => (
							<div 
								key={`${fetch.name}-${i}`}
								className="flex items-center justify-between px-2 py-1.5 bg-base-200/30 rounded text-xs"
							>
								<code className="font-mono truncate">{fetch.name}</code>
								<div className="flex items-center gap-2">
									{fetch.duration !== undefined && (
										<span className={classNames(
											fetch.duration < 100 ? "text-success" :
											fetch.duration < 300 ? "text-warning" :
											"text-error"
										)}>
											{fetch.duration}ms
										</span>
									)}
									{fetch.cached && (
										<span className="bg-success/20 text-success px-1.5 py-0.5 rounded">
											cached
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

/**
 * Server Action data from get_server_action_by_id
 */
interface ServerActionInfo {
	id?: string
	file?: string
	line?: number
	column?: number
	exportName?: string
	name?: string
}

/**
 * Type guard for server action data
 * 
 * **Specificity:** Requires 'exportName' OR ('file' AND ('id' OR 'name'))
 * to distinguish from log info which may also have 'file'.
 * 
 * **Edge Cases Handled:**
 * - Null/undefined values excluded
 * - Simple 'file' alone could be log info, requires additional context
 */
function isServerActionData(data: unknown): data is ServerActionInfo {
	if (typeof data !== 'object' || data === null) {return false}
	
	const obj = data as Record<string, unknown>
	
	// Must have exportName (definitive) or name with proper type
	const hasExportName = 'exportName' in obj && typeof obj.exportName === 'string'
	const hasName = 'name' in obj && typeof obj.name === 'string'
	const hasFile = 'file' in obj && typeof obj.file === 'string'
	const hasId = 'id' in obj
	
	// exportName is definitive for server actions
	if (hasExportName) {return true}
	
	// file + (id or name) suggests server action
	if (hasFile && (hasId || hasName)) {return true}
	
	return false
}

/**
 * Server Action Card Component
 */
function ServerActionCard({ action }: { action: ServerActionInfo }) {
	const [copied, copyToClipboard] = useCopyToClipboard()
	
	const location = action.file 
		? `${action.file}${action.line ? `:${action.line}` : ''}${action.column ? `:${action.column}` : ''}`
		: null
	
	return (
		<div className="border border-primary/30 bg-primary/5 rounded-lg p-4 space-y-3">
			<div className="flex items-center gap-2">
				<Server size={16} className="text-primary" />
				<span className="font-semibold text-primary">Server Action</span>
				{action.id && (
					<code className="text-xs bg-base-200 px-2 py-0.5 rounded font-mono">
						{action.id}
					</code>
				)}
			</div>
			
			{(action.exportName || action.name) && (
				<div className="space-y-1">
					<p className="text-xs text-base-content/60">Export Name</p>
					<code className="text-sm font-mono font-semibold text-base-content">
						{action.exportName ?? action.name}
					</code>
				</div>
			)}
			
			{location && (
				<div className="space-y-1">
					<p className="text-xs text-base-content/60">File Location</p>
					<div className="flex items-center gap-2">
						<code className="text-sm font-mono text-base-content/80 truncate flex-1">
							{location}
						</code>
						<Button
							variant="ghost"
							size="xs"
							onClick={() => void copyToClipboard(location)}
							className="h-6 shrink-0"
							leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
						>
							{copied ? 'Copied' : 'Copy'}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

/**
 * Log info from get_logs
 */
interface LogInfo {
	path?: string
	logPath?: string
	file?: string
}

/**
 * Type guard for log info
 * 
 * **Specificity:** 'logPath' is definitive. 'path' alone requires no conflicting fields.
 * 'file' alone is too ambiguous (could be server action).
 * 
 * **Edge Cases Handled:**
 * - 'logPath' is definitive
 * - 'path' without 'projectPath' or 'devServerUrl' suggests logs
 * - 'file' alone is not enough (conflicts with server action)
 */
function isLogInfo(data: unknown): data is LogInfo {
	if (typeof data !== 'object' || data === null) {return false}
	
	const obj = data as Record<string, unknown>
	
	// 'logPath' is definitive for log info
	if ('logPath' in obj && typeof obj.logPath === 'string') {
		return true
	}
	
	// 'path' without project-specific fields suggests logs
	const hasPath = 'path' in obj && typeof obj.path === 'string'
	const hasProjectSpecificFields = 'projectPath' in obj || 'devServerUrl' in obj || 'url' in obj
	const hasServerActionFields = 'exportName' in obj || 'name' in obj || 'id' in obj
	
	if (hasPath && !hasProjectSpecificFields && !hasServerActionFields) {
		return true
	}
	
	return false
}

/**
 * Log Info Card Component
 */
function LogInfoCard({ info }: { info: LogInfo }) {
	const [copied, copyToClipboard] = useCopyToClipboard()
	
	const logPath = info.path ?? info.logPath ?? info.file ?? 'Unknown'
	
	return (
		<div className="border border-info/30 bg-info/5 rounded-lg p-4 space-y-3">
			<div className="flex items-center gap-2">
				<FileText size={16} className="text-info" />
				<span className="font-semibold text-info">Development Logs</span>
			</div>
			
			<div className="space-y-1">
				<p className="text-xs text-base-content/60">Log File Path</p>
				<div className="flex items-center gap-2">
					<code className="text-sm font-mono text-base-content/80 truncate flex-1 bg-base-200/50 px-2 py-1 rounded">
						{logPath}
					</code>
					<Button
						variant="ghost"
						size="xs"
						onClick={() => void copyToClipboard(logPath)}
						className="h-7 shrink-0"
						leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
					>
						{copied ? 'Copied' : 'Copy Path'}
					</Button>
				</div>
			</div>
			
			<p className="text-xs text-base-content/50">
				💡 Use this path to tail logs in your terminal: <code className="bg-base-200 px-1 rounded">tail -f {logPath}</code>
			</p>
		</div>
	)
}

/**
 * Project metadata from get_project_metadata
 */
interface ProjectMetadata {
	projectPath?: string
	path?: string
	devServerUrl?: string
	url?: string
	version?: string
	nextVersion?: string
}

/**
 * Type guard for project metadata
 * 
 * **Specificity:** Requires project-specific fields like 'projectPath', 'devServerUrl',
 * or 'nextVersion'. A simple 'path' or 'url' alone is not enough.
 * 
 * **Edge Cases Handled:**
 * - 'projectPath' or 'devServerUrl' are definitive
 * - 'nextVersion' or 'version' suggest project metadata
 * - 'url' alone is not enough (too generic)
 */
function isProjectMetadata(data: unknown): data is ProjectMetadata {
	if (typeof data !== 'object' || data === null) {return false}
	
	const obj = data as Record<string, unknown>
	
	// Definitive project fields
	const hasProjectPath = 'projectPath' in obj && typeof obj.projectPath === 'string'
	const hasDevServerUrl = 'devServerUrl' in obj && typeof obj.devServerUrl === 'string'
	const hasNextVersion = 'nextVersion' in obj || 'version' in obj
	
	if (hasProjectPath || hasDevServerUrl || hasNextVersion) {
		return true
	}
	
	return false
}

/**
 * Project Info Card Component
 */
function ProjectInfoCard({ info }: { info: ProjectMetadata }) {
	const projectPath = info.projectPath ?? info.path
	const serverUrl = info.devServerUrl ?? info.url
	
	return (
		<div className="border border-success/30 bg-success/5 rounded-lg p-4 space-y-3">
			<div className="flex items-center gap-2">
				<Terminal size={16} className="text-success" />
				<span className="font-semibold text-success">Project Info</span>
				{(info.version || info.nextVersion) && (
					<span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">
						Next.js {info.nextVersion ?? info.version}
					</span>
				)}
			</div>
			
			{projectPath && (
				<div className="space-y-1">
					<p className="text-xs text-base-content/60">Project Path</p>
					<code className="text-sm font-mono text-base-content/80 block truncate">
						{projectPath}
					</code>
				</div>
			)}
			
			{serverUrl && (
				<div className="space-y-1">
					<p className="text-xs text-base-content/60">Dev Server</p>
					<a 
						href={serverUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-sm text-primary hover:underline"
					>
						{serverUrl}
						<ExternalLink size={12} />
					</a>
				</div>
			)}
		</div>
	)
}

// =============================================================================
// CONFIG EXPORT/IMPORT UTILITIES (Phase 5)
// =============================================================================

/**
 * Create exportable config object
 * 
 * @param workflows - Current workflows
 * @param favorites - Current favorites set
 * @param preferences - Current UI preferences
 * @returns DevToolsConfig object ready for export
 */
function createExportConfig(
	workflows: Workflow[],
	favorites: Set<string>,
	preferences: UiPreferences
): DevToolsConfig {
	return {
		version: CONFIG_VERSION,
		exportedAt: parseDateOrNow().toISOString(),
		workflows,
		favorites: Array.from(favorites),
		preferences,
	}
}

/**
 * Validate imported config
 * 
 * **Validation Rules:**
 * - Version must be a number (0 is valid)
 * - Workflows must be an array
 * - Each workflow must have: id (string), name (non-empty string), commands (string[])
 * - Favorites must be an array of non-empty strings
 * - Preferences are validated and defaulted if invalid
 * - Size limits enforced (max workflows, max favorites)
 * 
 * @param data - Parsed JSON data
 * @returns Validated config or null if invalid
 */
function validateImportConfig(data: unknown): DevToolsConfig | null {
	if (typeof data !== 'object' || data === null) {
		return null
	}
	
	const config = data as Partial<DevToolsConfig>
	
	// Version check - must be a number (0 is valid)
	if (typeof config.version !== 'number' || !Number.isFinite(config.version)) {
		return null
	}
	
	// Workflows validation
	if (!Array.isArray(config.workflows)) {
		return null
	}
	
	// Validate each workflow with strict checks
	const validWorkflows = config.workflows
		.filter((w): w is Workflow => {
			if (typeof w !== 'object' || w === null) {return false}
			
			const workflow = w as Partial<Workflow>
			
			// Required fields
			if (typeof workflow.id !== 'string' || workflow.id.trim().length === 0) {return false}
			if (typeof workflow.name !== 'string' || workflow.name.trim().length === 0) {return false}
			if (!Array.isArray(workflow.commands)) {return false}
			
			// Commands must all be strings (empty strings allowed but filtered later)
			const allCommandsValid = workflow.commands.every(
				(cmd): cmd is string => typeof cmd === 'string'
			)
			if (!allCommandsValid) {return false}
			
			// createdAt is optional but must be string if present
			if (workflow.createdAt !== undefined && typeof workflow.createdAt !== 'string') {
				return false
			}
			
			return true
		})
		.slice(0, MAX_WORKFLOWS) // Enforce size limit
	
	// Favorites validation - must be non-empty strings
	const validFavorites = Array.isArray(config.favorites)
		? config.favorites
			.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
			.slice(0, MAX_FAVORITES) // Enforce size limit
		: []
	
	// Preferences validation - safely extract with defaults
	const prefsFontSize = config.preferences?.fontSize
	const prefsTimestamps = config.preferences?.showTimestamps
	
	const validPreferences: UiPreferences = {
		fontSize: FONT_SIZES.includes(prefsFontSize as FontSize)
			? (prefsFontSize as FontSize)
			: DEFAULT_PREFERENCES.fontSize,
		showTimestamps: typeof prefsTimestamps === 'boolean'
			? prefsTimestamps
			: DEFAULT_PREFERENCES.showTimestamps,
	}
	
	return {
		version: config.version,
		exportedAt: config.exportedAt ?? parseDateOrNow().toISOString(),
		workflows: validWorkflows,
		favorites: validFavorites,
		preferences: validPreferences,
	}
}

// =============================================================================
// EXPORT & SHARE UTILITIES (Phase 4.4)
// =============================================================================

/**
 * Format messages as Markdown for export
 * 
 * @param messages - Chat messages to format
 * @param includeTimestamps - Whether to include timestamps
 * @returns Formatted markdown string
 */
function formatMessagesAsMarkdown(messages: McpMessage[], includeTimestamps: boolean = true): string {
	const header = `# MCP DevTools Session Export

**Exported**: ${parseDateOrNow().toLocaleString()}
**Messages**: ${messages.length}

---

`
	const body = messages.map(msg => {
		const { content: rawContent, role, timestamp: msgTimestamp } = msg
		const msgDate = parseDateOrNow(msgTimestamp)
		const timestamp = includeTimestamps ? `*${msgDate.toLocaleTimeString()}*\n` : ''
		const rolePrefix = role === 'user' ? '**You**' : 
			role === 'assistant' ? '**MCP**' :
			role === 'error' ? '**Error**' : '**System**'
		
		// Format content - wrap JSON in code blocks
		let formattedContent = rawContent
		try {
			// Check if content contains JSON
			if (formattedContent.includes('{') || formattedContent.includes('[')) {
				const jsonMatch = formattedContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)?.[0]
				if (jsonMatch) {
					JSON.parse(jsonMatch) // Validate it's valid JSON
					formattedContent = formattedContent.replace(jsonMatch, `\n\`\`\`json\n${jsonMatch}\n\`\`\`\n`)
				}
			}
		} catch {
			// Not valid JSON, keep as-is
		}
		
		return `${timestamp}${rolePrefix}:\n${formattedContent}\n`
	}).join('\n---\n\n')
	
	return header + body
}

/**
 * Format messages as GitHub issue template
 * 
 * @param messages - Chat messages to format
 * @returns Formatted GitHub issue markdown
 */
function formatAsGithubIssue(messages: McpMessage[]): string {
	// Find errors in the conversation
	const errors = messages.filter(m => m.role === 'error')
	const lastError = errors.length > 0 ? errors[errors.length - 1] : null
	
	// Get last few exchanges for context
	const recentMessages = messages.slice(-10)
	
	return `## Bug Report / Debug Session

### Environment
- **Date**: ${parseDateOrNow().toLocaleString()}
- **Messages in session**: ${messages.length}

### Issue Description
<!-- Describe what you were trying to do -->

${lastError ? `### Error Encountered
\`\`\`
${lastError.content}
\`\`\`
` : ''}
### MCP Session Context
<details>
<summary>Recent Commands & Responses (click to expand)</summary>

${recentMessages.map(msg => {
	const role = msg.role === 'user' ? '**Command**' : 
		msg.role === 'assistant' ? '**Response**' :
		msg.role === 'error' ? '**Error**' : '**System**'
	return `${role}:\n\`\`\`\n${msg.content.slice(0, 500)}${msg.content.length > 500 ? '...' : ''}\n\`\`\`\n`
}).join('\n')}

</details>

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
<!-- What should have happened -->

### Additional Context
<!-- Any other relevant information -->
`
}

/**
 * Download content as file
 * 
 * **Memory Safety**: Uses try-finally to ensure URL is revoked even if DOM manipulation fails.
 * 
 * @param content - String content to download
 * @param filename - Name for the downloaded file
 * @param mimeType - MIME type (default: text/markdown)
 */
function downloadAsFile(content: string, filename: string, mimeType: string = 'text/markdown'): void {
	// Edge case: empty content
	if (!content) {
		logger.warn('downloadAsFile called with empty content', { filename })
		return
	}
	
	const blob = new Blob([content], { type: mimeType })
	const url = URL.createObjectURL(blob)
	let link: HTMLAnchorElement | null = null
	
	try {
		link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
	} finally {
		// Cleanup: always revoke URL and remove link
		if (link?.parentNode) {
			document.body.removeChild(link)
		}
		URL.revokeObjectURL(url)
	}
}

// =============================================================================
// WORKFLOW UTILITIES (Phase 4.2)
// =============================================================================

/**
 * Generate unique workflow ID
 */
function generateWorkflowId(): string {
	return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Workflow Manager Dropdown
 */
function WorkflowManager({
	workflows,
	onRun,
	onDelete,
	onClose,
}: {
	workflows: Workflow[]
	onRun: (workflow: Workflow) => void
	onDelete: (workflowId: string) => void
	onClose: () => void
}) {
	if (workflows.length === 0) {
		return (
			<div className="absolute top-full left-0 right-0 mt-1 bg-base-200 border border-base-300 rounded-lg shadow-lg p-4 z-50">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-semibold">Saved Workflows</span>
					<Button
						variant="ghost"
						size="xs"
						onClick={onClose}
						className="h-5 w-5 min-h-0 min-w-0 p-0"
						aria-label="Close"
					>
						<XCircle size={14} />
					</Button>
				</div>
				<p className="text-xs text-base-content/60">
					No workflows saved yet. Use <code className="bg-base-300 px-1 rounded">/workflow save [name]</code> to save the current session commands.
				</p>
			</div>
		)
	}
	
	return (
		<div className="absolute top-full left-0 right-0 mt-1 bg-base-200 border border-base-300 rounded-lg shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
			<div className="flex items-center justify-between px-3 py-2 border-b border-base-300 bg-base-300/30">
				<span className="text-sm font-semibold">Saved Workflows ({workflows.length})</span>
				<Button
					variant="ghost"
					size="xs"
					onClick={onClose}
					className="h-5 w-5 min-h-0 min-w-0 p-0"
					aria-label="Close"
				>
					<XCircle size={14} />
				</Button>
			</div>
			{workflows.map(workflow => (
				<div 
					key={workflow.id}
					className="flex items-center gap-2 px-3 py-2 hover:bg-base-300/30 transition-colors group"
				>
					<Workflow size={14} className="text-primary shrink-0" />
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">{workflow.name}</p>
						<p className="text-xs text-base-content/50">
							{workflow.commands.length} commands
						</p>
					</div>
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							variant="ghost"
							size="xs"
							onClick={() => onRun(workflow)}
							className="h-6 w-6 min-h-0 min-w-0 p-0 text-success"
							aria-label={`Run ${workflow.name}`}
						>
							<PlayCircle size={14} />
						</Button>
						<Button
							variant="ghost"
							size="xs"
							onClick={() => onDelete(workflow.id)}
							className="h-6 w-6 min-h-0 min-w-0 p-0 text-error"
							aria-label={`Delete ${workflow.name}`}
						>
							<Trash2 size={12} />
						</Button>
					</div>
				</div>
			))}
		</div>
	)
}

/**
 * Settings/Preferences Dropdown
 */
function PreferencesDropdown({
	preferences,
	onUpdate,
	onExportConfig,
	onCopyConfig,
	onResetConfig,
	configCopied,
	onClose,
}: {
	preferences: UiPreferences
	onUpdate: (prefs: Partial<UiPreferences>) => void
	onExportConfig: () => void
	onCopyConfig: () => void
	onResetConfig: () => void
	configCopied: boolean
	onClose: () => void
}) {
	return (
		<div className="absolute top-full right-0 mt-1 bg-base-200 border border-base-300 rounded-lg shadow-lg p-3 z-50 w-64">
			<div className="flex items-center justify-between mb-3">
				<span className="text-sm font-semibold">Preferences</span>
				<Button
					variant="ghost"
					size="xs"
					onClick={onClose}
					className="h-5 w-5 min-h-0 min-w-0 p-0"
					aria-label="Close"
				>
					<XCircle size={14} />
				</Button>
			</div>
			
			{/* Font Size */}
			<div className="space-y-2 mb-3">
				<span className="text-xs font-medium text-base-content/70">Font Size</span>
				<div className="flex items-center gap-1">
					{FONT_SIZES.map(size => (
						<Button
							key={size}
							variant={preferences.fontSize === size ? 'primary' : 'ghost'}
							size="xs"
							onClick={() => onUpdate({ fontSize: size })}
							className="flex-1 capitalize"
						>
							{size}
						</Button>
					))}
				</div>
			</div>
			
			{/* Timestamps Toggle */}
			<div className="flex items-center justify-between mb-4">
				<span className="text-xs font-medium text-base-content/70">Show Timestamps</span>
				<Button
					variant={preferences.showTimestamps ? 'primary' : 'ghost'}
					size="xs"
					onClick={() => onUpdate({ showTimestamps: !preferences.showTimestamps })}
					className="h-6 min-w-[48px]"
					aria-pressed={preferences.showTimestamps}
				>
					{preferences.showTimestamps ? 'On' : 'Off'}
				</Button>
			</div>
			
			{/* Phase 5: Config Management */}
			<div className="border-t border-base-300 pt-3 space-y-2">
				<span className="text-xs font-medium text-base-content/70">Config (Workflows + Favorites)</span>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="xs"
						onClick={onExportConfig}
						leftIcon={<Download size={12} />}
						className="flex-1"
					>
						Export
					</Button>
					<Button
						variant="ghost"
						size="xs"
						onClick={onCopyConfig}
						leftIcon={configCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
						className="flex-1"
					>
						{configCopied ? 'Copied!' : 'Copy'}
					</Button>
				</div>
				<Button
					variant="ghost"
					size="xs"
					onClick={onResetConfig}
					className="w-full text-error hover:bg-error/10"
					leftIcon={<Trash2 size={12} />}
				>
					Reset All
				</Button>
			</div>
		</div>
	)
}

// =============================================================================
// AUTOCOMPLETE
// =============================================================================

/**
 * Autocomplete Suggestion Item
 */
interface AutocompleteSuggestion {
	value: string
	description: string
	type: 'command' | 'tool'
}

/**
 * Autocomplete Dropdown
 * 
 * Shows command and tool suggestions as user types.
 */
function AutocompleteDropdown({ 
	suggestions, 
	selectedIndex, 
	onSelect 
}: { 
	suggestions: AutocompleteSuggestion[]
	selectedIndex: number
	onSelect: (value: string) => void
}) {
	if (suggestions.length === 0) {return null}
	
	return (
		<div className="absolute bottom-full left-0 right-0 mb-1 bg-base-200 border border-base-300 rounded-lg shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
			{suggestions.map((suggestion, index) => (
				<Button
					key={suggestion.value}
					type="button"
					variant="ghost"
					size="sm"
					className={classNames(
						'w-full justify-start rounded-none gap-3 h-auto py-2',
						index === selectedIndex ? 'bg-primary/10 text-primary' : ''
					)}
					onClick={() => onSelect(suggestion.value)}
				>
					<code className="text-xs font-semibold shrink-0">
						{suggestion.value}
					</code>
					<span className="text-xs text-base-content/60 truncate font-normal">
						{suggestion.description}
					</span>
					{suggestion.type === 'tool' && (
						<span className="ml-auto text-xs bg-info/10 text-info px-1.5 py-0.5 rounded shrink-0">
							tool
						</span>
					)}
				</Button>
			))}
		</div>
	)
}

/**
 * Recursively renders a JSON value as React elements with syntax highlighting.
 * 
 * **Security**: This function creates React elements directly instead of HTML strings,
 * preventing XSS attacks from malicious JSON values. All string content is rendered
 * as text nodes, never as HTML.
 * 
 * @param value - The JSON value to render
 * @param indent - Current indentation level
 * @param keyPrefix - Unique key prefix for React keys
 * @returns React elements representing the syntax-highlighted JSON
 */
function renderJsonValue(value: unknown, indent: number = 0, keyPrefix: string = ''): React.ReactNode {
	const indentStr = '  '.repeat(indent)
	
	if (value === null) {
		return <span className="text-error/70">null</span>
	}
	
	if (typeof value === 'boolean') {
		return <span className="text-warning">{String(value)}</span>
	}
	
	if (typeof value === 'number') {
		return <span className="text-accent">{String(value)}</span>
	}
	
	if (typeof value === 'string') {
		// Render as text node - React automatically escapes HTML characters
		return <span className="text-success">&quot;{value}&quot;</span>
	}
	
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return <span>{'[]'}</span>
		}
		return (
			<>
				{'[\n'}
				{value.map((item, i) => (
					<span key={`${keyPrefix}-arr-${i}`}>
						{indentStr}{'  '}
						{renderJsonValue(item, indent + 1, `${keyPrefix}-${i}`)}
						{i < value.length - 1 ? ',' : ''}
						{'\n'}
					</span>
				))}
				{indentStr}{']'}
			</>
		)
	}
	
	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>)
		if (entries.length === 0) {
			return <span>{'{}'}</span>
		}
		return (
			<>
				{'{\n'}
				{entries.map(([key, val], i) => (
					<span key={`${keyPrefix}-obj-${key}`}>
						{indentStr}{'  '}
						<span className="text-info">&quot;{key}&quot;</span>
						{': '}
						{renderJsonValue(val, indent + 1, `${keyPrefix}-${key}`)}
						{i < entries.length - 1 ? ',' : ''}
						{'\n'}
					</span>
				))}
				{indentStr}{'}'}
			</>
		)
	}
	
	// Fallback for unknown types
	return <span>{String(value)}</span>
}

/**
 * JSON Syntax Highlighter
 * 
 * Renders JSON with syntax highlighting using DaisyUI theme colors.
 * 
 * **Security**: Uses React element rendering instead of dangerouslySetInnerHTML.
 * All content is rendered as text nodes, preventing XSS attacks even if
 * MCP server returns malicious content like `{"evil": "<script>alert(1)</script>"}`.
 * 
 * **Performance**: The JSON is parsed and rendered once via useMemo, then cached.
 * 
 * @param props - Component props
 * @param props.json - JSON string to highlight
 * @param props.maxHeight - Optional max height with scroll
 */
function JsonHighlight({ json, maxHeight = '200px' }: { json: string; maxHeight?: string }) {
	// Use shared clipboard hook (DRY - avoids inline clipboard logic)
	const [copied, copyToClipboard] = useCopyToClipboard()
	
	// Parse JSON and render as React elements (XSS-safe)
	const renderedJson = useMemo((): React.ReactNode => {
		try {
			const parsed = JSON.parse(json) as unknown
			return renderJsonValue(parsed, 0, 'json')
		} catch {
			// If parsing fails, render as plain text (still safe - React escapes it)
			return <span>{json}</span>
		}
	}, [json])
	
	return (
		<div className="relative group">
			<pre 
				className="bg-base-300/50 rounded-lg p-3 text-xs font-mono overflow-auto whitespace-pre"
				style={{ maxHeight }}
			>
				{renderedJson}
			</pre>
			<Button
				variant="ghost"
				size="xs"
				onClick={() => void copyToClipboard(json)}
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn-square h-6 w-6 min-h-0"
				aria-label={copied ? 'Copied!' : 'Copy JSON'}
			>
				{copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
			</Button>
		</div>
	)
}

/**
 * Parameter schema type for tool input
 */
interface ParamSchema {
	type?: string
	description?: string
	enum?: string[]
	default?: unknown
}

/**
 * Tool Card Component
 * 
 * Displays a single MCP tool with its description and parameters.
 * Includes a "Try It" button to pre-fill the command, a star button to favorite,
 * and an interactive form to build commands with proper arguments.
 * 
 * @param props - Component props
 * @param props.tool - The MCP tool to display
 * @param props.onTry - Callback when "Try It" is clicked
 * @param props.isFavorite - Whether this tool is favorited
 * @param props.onToggleFavorite - Callback when star is clicked
 */
function ToolCard({ 
	tool, 
	onTry,
	isFavorite = false,
	onToggleFavorite,
}: { 
	tool: McpTool
	onTry: (command: string) => void
	isFavorite?: boolean
	onToggleFavorite?: (toolName: string) => void
}) {
	const [expanded, setExpanded] = useState(false)
	const [formValues, setFormValues] = useState<Record<string, string>>({})
	
	// Extract parameters with their schemas
	const { params, paramSchemas } = useMemo(() => {
		const schema = tool.inputSchema as { 
			properties?: Record<string, ParamSchema>
			required?: string[] 
		} | undefined
		
		if (!schema?.properties) {
			return { 
				params: { required: [], optional: [] },
				paramSchemas: {} as Record<string, ParamSchema>,
			}
		}
		
		const required = schema.required ?? []
		const allParams = Object.keys(schema.properties)
		
		return {
			params: {
				required: allParams.filter(p => required.includes(p)),
				optional: allParams.filter(p => !required.includes(p)),
			},
			paramSchemas: schema.properties,
		}
	}, [tool.inputSchema])
	
	const hasParams = params.required.length > 0 || params.optional.length > 0
	
	// Memoize allParams to prevent unnecessary re-renders
	const allParams = useMemo(() => 
		[...params.required, ...params.optional], 
		[params.required, params.optional]
	)
	
	// Check if form is valid (all required params filled)
	const isFormValid = useMemo(() => {
		return params.required.every(p => formValues[p]?.trim())
	}, [params.required, formValues])
	
	// Handle form field change
	const handleFieldChange = useCallback((param: string, value: string) => {
		setFormValues(prev => ({ ...prev, [param]: value }))
	}, [])
	
	// Build command from form values
	const buildCommand = useCallback(() => {
		const args: Record<string, unknown> = {}
		
		allParams.forEach(p => {
			const value = formValues[p]?.trim()
			if (value) {
				const schema = paramSchemas[p]
				// Convert to appropriate type based on schema
				if (schema?.type === 'number' || schema?.type === 'integer') {
					args[p] = Number(value)
				} else if (schema?.type === 'boolean') {
					args[p] = value.toLowerCase() === 'true'
				} else {
					args[p] = value
				}
			}
		})
		
		return Object.keys(args).length > 0
			? `/call ${tool.name} ${JSON.stringify(args)}`
			: `/call ${tool.name}`
	}, [tool.name, allParams, formValues, paramSchemas])
	
	const handleTry = useCallback(() => {
		// Build sample command with placeholder args
		const args: Record<string, string> = {}
		params.required.forEach(p => {args[p] = `<${p}>`})
		
		const command = hasParams 
			? `/call ${tool.name} ${JSON.stringify(args)}`
			: `/call ${tool.name}`
		
		onTry(command)
	}, [tool.name, params.required, hasParams, onTry])
	
	const handleRunWithForm = useCallback(() => {
		onTry(buildCommand())
	}, [buildCommand, onTry])
	
	const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation()
		onToggleFavorite?.(tool.name)
	}, [tool.name, onToggleFavorite])
	
	// Get placeholder for a parameter
	const getPlaceholder = (param: string): string => {
		const schema = paramSchemas[param]
		if (schema?.enum) {return schema.enum.join(' | ')}
		if (schema?.default !== undefined) {return `Default: ${String(schema.default)}`}
		if (schema?.type) {return schema.type}
		return 'value'
	}
	
	return (
		<div className={classNames(
			"border rounded-md transition-all duration-200",
			isFavorite 
				? "bg-warning/5 border-warning/30" 
				: "bg-base-200/30 border-base-300/50 hover:border-base-300"
		)}>
			{/* Compact Header - Single line, always visible (VS Code/Raycast style) */}
			<div 
				className={classNames(
					"flex items-center gap-2 px-2.5 py-2 cursor-pointer transition-colors",
					expanded ? "bg-base-200/50" : "hover:bg-base-200/30"
				)}
				onClick={() => setExpanded(!expanded)}
				onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
				role="button"
				tabIndex={0}
				aria-expanded={expanded}
			>
				{/* Favorite Star */}
				<Button
					variant="ghost"
					size="xs"
					onClick={handleFavoriteClick}
					className={classNames(
						"shrink-0 h-5 w-5 min-h-0 min-w-0 p-0",
						isFavorite ? "text-warning" : "text-base-content/25 hover:text-warning/60"
					)}
					aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
					aria-pressed={isFavorite}
				>
					<Star size={12} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
				</Button>
				
				{/* Tool Icon */}
				<Wrench size={12} className="text-primary/70 shrink-0" aria-hidden="true" />
				
				{/* Tool Name - Monospace, truncate with tooltip */}
				<code 
					className="text-xs font-medium text-primary flex-1 min-w-0 truncate" 
					title={tool.name}
				>
					{tool.name}
				</code>
				
				{/* Quick Try Button (compact) */}
				<Button
					variant="ghost"
					size="xs"
					onClick={(e) => {
						e.stopPropagation()
						handleTry()
					}}
					className="shrink-0 h-5 min-h-0 px-1.5 text-xs text-primary/70 hover:text-primary hover:bg-primary/10"
					aria-label={`Run ${tool.name}`}
				>
					<Play size={10} />
				</Button>
				
				{/* Expand/Collapse Chevron */}
				<span className="shrink-0 text-base-content/40">
					{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
				</span>
			</div>
			
			{/* Expanded Details Panel */}
			{expanded && (
				<div className="px-3 pb-3 pt-1 border-t border-base-300/50 space-y-3">
					{/* Description */}
					{tool.description && (
						<p className="text-xs text-base-content/70 leading-relaxed">
							{tool.description}
						</p>
					)}
					
					{/* Parameters Info */}
					<div className="flex items-center justify-between">
						<span className="text-xs text-base-content/50">
							{hasParams ? (
								<>
									<span className="text-error">{params.required.length} required</span>
									{params.optional.length > 0 && (
										<span className="text-base-content/40"> · {params.optional.length} optional</span>
									)}
								</>
							) : (
								<span className="text-success">No arguments needed</span>
							)}
						</span>
						
						<Button
							variant="primary"
							size="xs"
							onClick={(e) => {
								e.stopPropagation()
								handleTry()
							}}
							leftIcon={<Play size={10} />}
							className="h-6"
						>
							Run Tool
						</Button>
					</div>
				</div>
			)}
			
			{/* Expanded Form */}
			{expanded && hasParams && (
				<div className="border-t border-base-300 p-3 bg-base-200/30 space-y-3">
					{/* Parameter Form */}
					<div className="space-y-2">
						{allParams.map(param => {
							const schema = paramSchemas[param]
							const isRequired = params.required.includes(param)
							
							return (
								<div key={param} className="flex flex-col gap-1">
									<label className="flex items-center gap-2 text-xs">
										<code className={classNames(
											"font-semibold",
											isRequired ? "text-error" : "text-base-content/70"
										)}>
											{param}
											{isRequired && <span className="text-error">*</span>}
										</code>
										{schema?.description && (
											<span className="text-base-content/50 truncate">
												- {schema.description}
											</span>
										)}
									</label>
									{schema?.enum ? (
										<Select
											value={formValues[param] ?? ''}
											onChange={(e) => handleFieldChange(param, e.target.value)}
											options={schema.enum.map(opt => ({ value: opt, label: opt }))}
											placeholder={`Select ${param}...`}
											size="sm"
											width="full"
										/>
									) : (
										<Input
											size="sm"
											value={formValues[param] ?? ''}
											onChange={(e) => handleFieldChange(param, e.target.value)}
											placeholder={getPlaceholder(param)}
											className="font-mono text-xs h-8"
										/>
									)}
								</div>
							)
						})}
					</div>
					
					{/* Form Actions */}
					<div className="flex items-center justify-between pt-2 border-t border-base-300/50">
						<code className="text-xs text-base-content/40 font-mono truncate max-w-[60%]">
							{buildCommand()}
						</code>
						<Button
							variant="primary"
							size="xs"
							onClick={handleRunWithForm}
							disabled={!isFormValid}
							leftIcon={<Play size={10} />}
						>
							Run
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

/**
 * Tool List Display
 * 
 * Renders a list of MCP tools as cards with favorites support.
 * Favorite tools appear at the top with a distinct style.
 * 
 * @param props - Component props
 * @param props.tools - Array of MCP tools
 * @param props.onSelectTool - Callback when a tool's "Try It" is clicked
 * @param props.favorites - Set of favorite tool names
 * @param props.onToggleFavorite - Callback when star is clicked
 */
function ToolList({ 
	tools, 
	onSelectTool,
	favorites,
	onToggleFavorite,
}: { 
	tools: McpTool[]
	onSelectTool: (command: string) => void
	favorites?: Set<string>
	onToggleFavorite?: (toolName: string) => void
}) {
	const favoriteTools = tools.filter(t => favorites?.has(t.name))
	const regularTools = tools.filter(t => !favorites?.has(t.name))
	
	return (
		<div className="space-y-4">
			{/* Header with count badge */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
					<span className="text-lg">📦</span>
					<span>{tools.length} Available Tools</span>
				</div>
				{favoriteTools.length > 0 && (
					<span className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
						<Star size={10} fill="currentColor" />
						{favoriteTools.length}
					</span>
				)}
			</div>
			
			{/* Favorites Section */}
			{favoriteTools.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs font-semibold text-warning uppercase tracking-wide">
						<Star size={12} fill="currentColor" aria-hidden="true" />
						Favorites
					</div>
					<div className="space-y-2">
						{favoriteTools.map(tool => (
							<ToolCard 
								key={tool.name} 
								tool={tool} 
								onTry={onSelectTool}
								isFavorite
								onToggleFavorite={onToggleFavorite}
							/>
						))}
					</div>
				</div>
			)}
			
			{/* Divider */}
			{favoriteTools.length > 0 && regularTools.length > 0 && (
				<div className="border-t border-base-300" />
			)}
			
			{/* Regular Tools Section */}
			{regularTools.length > 0 && (
				<div className="space-y-2">
					{favoriteTools.length > 0 && (
						<div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
							All Tools
						</div>
					)}
					<div className="space-y-2">
						{regularTools.map(tool => (
							<ToolCard 
								key={tool.name} 
								tool={tool} 
								onTry={onSelectTool}
								isFavorite={false}
								onToggleFavorite={onToggleFavorite}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

/**
 * Check if data looks like a routes response
 */
function isRoutesData(data: unknown): data is { routes: RouteItem[] } | RouteItem[] {
	if (Array.isArray(data)) {
		return data.length > 0 && data.every(item => 
			typeof item === 'object' && item !== null && 'path' in item
		)
	}
	if (typeof data === 'object' && data !== null && 'routes' in data) {
		const routesObj = data as { routes: unknown }
		return Array.isArray(routesObj.routes)
	}
	return false
}

/**
 * Smart Content Renderer
 * 
 * Detects content type and renders appropriately with specialized UI for:
 * - Error data → Error monitor with stack traces
 * - Page metadata → Page inspector with metrics
 * - Server action data → Action info card
 * - Log info → Log path with copy
 * - Project metadata → Project info card
 * - Route data → Tree display with dynamic segment highlighting
 * - Tool lists → Card display with favorites
 * - JSON objects → Syntax highlighted
 * - Plain text → As-is
 * 
 * @param props - Component props
 * @param props.content - The content string to render
 * @param props.tools - Available tools (for tool list detection)
 * @param props.onSelectTool - Callback for tool selection
 * @param props.favorites - Set of favorite tool names
 * @param props.onToggleFavorite - Callback for toggling favorites
 */
function SmartContent({ 
	content, 
	tools,
	onSelectTool,
	favorites,
	onToggleFavorite,
}: { 
	content: string
	tools?: McpTool[]
	onSelectTool?: (command: string) => void
	favorites?: Set<string>
	onToggleFavorite?: (toolName: string) => void
}) {
	// Check if this is a tool list response
	const isToolListResponse = content.startsWith('📦 Found') && content.includes('tools:')
	
	// Parse JSON and check for special content types
	const parsedContent = useMemo(() => {
		// Look for JSON objects or arrays in the content
		const jsonRegex = /(\{[\s\S]*\}|\[[\s\S]*\])/
		const match = content.match(jsonRegex)
		if (match) {
			try {
				const parsed = JSON.parse(match[0]) as unknown
				return {
					json: match[0],
					parsed,
					beforeJson: content.substring(0, content.indexOf(match[0])),
					afterJson: content.substring(content.indexOf(match[0]) + match[0].length),
				}
			} catch {
				return null
			}
		}
		return null
	}, [content])
	
	// Helper to wrap specialized content with before/after text
	const wrapContent = (specialContent: React.ReactNode) => (
		<div className="space-y-2">
			{parsedContent?.beforeJson && (
				<div className="whitespace-pre-wrap">{parsedContent.beforeJson}</div>
			)}
			{specialContent}
			{parsedContent?.afterJson && (
				<div className="whitespace-pre-wrap">{parsedContent.afterJson}</div>
			)}
		</div>
	)
	
	// If it's a tool list and we have tools, show cards
	if (isToolListResponse && tools && tools.length > 0 && onSelectTool) {
		return (
			<ToolList 
				tools={tools} 
				onSelectTool={onSelectTool}
				favorites={favorites}
				onToggleFavorite={onToggleFavorite}
			/>
		)
	}
	
	// Check for specialized debug content types (Phase 3)
	if (parsedContent) {
		// Error data
		if (isErrorsData(parsedContent.parsed)) {
			const errors = Array.isArray(parsedContent.parsed) 
				? parsedContent.parsed 
				: parsedContent.parsed.errors
			return wrapContent(<ErrorMonitor errors={errors} />)
		}
		
		// Page metadata
		if (isPageMetadata(parsedContent.parsed)) {
			return wrapContent(<PageInspector metadata={parsedContent.parsed} />)
		}
		
		// Server action data
		if (isServerActionData(parsedContent.parsed)) {
			return wrapContent(<ServerActionCard action={parsedContent.parsed} />)
		}
		
		// Log info
		if (isLogInfo(parsedContent.parsed)) {
			return wrapContent(<LogInfoCard info={parsedContent.parsed} />)
		}
		
		// Project metadata
		if (isProjectMetadata(parsedContent.parsed)) {
			return wrapContent(<ProjectInfoCard info={parsedContent.parsed} />)
		}
		
		// Route data
		if (isRoutesData(parsedContent.parsed)) {
			const routes = Array.isArray(parsedContent.parsed) 
				? parsedContent.parsed 
				: parsedContent.parsed.routes
			return wrapContent(<RouteTree routes={routes} />)
		}
		
		// Generic JSON
		return wrapContent(<JsonHighlight json={parsedContent.json} />)
	}
	
	// Plain text
	return <div className="whitespace-pre-wrap">{content}</div>
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Props for McpChatInterface component
 */
export interface McpChatInterfaceProps {
	/**
	 * Whether to automatically connect to MCP server on mount
	 * @default true
	 */
	autoConnect?: boolean
}

/**
 * MCP Chat Interface
 * 
 * Terminal-like interface for MCP server interaction.
 * 
 * @example
 * ```tsx
 * <McpChatInterface autoConnect />
 * ```
 */
export default function McpChatInterface({ 
	autoConnect = true 
}: McpChatInterfaceProps) {
	const {
		messages,
		status,
		tools,
		sendMessage,
		initialize,
		clearMessages,
		isAvailable,
	} = useMcpChat()
	
	const [input, setInput] = useState('')
	const [commandHistory, setCommandHistory] = useState<string[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showAutocomplete, setShowAutocomplete] = useState(false)
	const [autocompleteIndex, setAutocompleteIndex] = useState(0)
	const [favorites, setFavorites] = useState<Set<string>>(new Set())
	
	// Phase 4: Workflows and Preferences
	const [workflows, setWorkflows] = useState<Workflow[]>([])
	const [showWorkflows, setShowWorkflows] = useState(false)
	const [preferences, setPreferences] = useState<UiPreferences>(DEFAULT_PREFERENCES)
	const [showPreferences, setShowPreferences] = useState(false)
	
	// Clipboard hook for keyboard shortcut copy (DRY - reuses shared hook)
	const [_lastResponseCopied, copyLastResponseToClipboard] = useCopyToClipboard()
	// Clipboard hook for export (DRY - separate instance for feedback)
	const [exportCopied, copyExportToClipboard] = useCopyToClipboard()
	
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	/** Guard to prevent rapid double-submit race condition */
	const isSubmittingRef = useRef(false)
	/** Track if we've attempted auto-connect to prevent infinite retries */
	const hasAutoConnectedRef = useRef(false)
	/** Track if history has been loaded from localStorage */
	const historyLoadedRef = useRef(false)
	/** Track if favorites have been loaded from localStorage */
	const favoritesLoadedRef = useRef(false)
	/** Track if workflows have been loaded from localStorage */
	const workflowsLoadedRef = useRef(false)
	/** Track if preferences have been loaded from localStorage */
	const preferencesLoadedRef = useRef(false)
	
	/**
	 * Load command history from localStorage on mount
	 * 
	 * **Defensive Programming**:
	 * - Validates data is an array
	 * - Filters to only string items (ignores corrupted data)
	 * - Sanitizes strings (trims, removes empty)
	 * - Limits to COMMAND_HISTORY_LIMIT
	 */
	useEffect(() => {
		if (historyLoadedRef.current) {return}
		historyLoadedRef.current = true
		
		try {
			const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
			if (stored) {
				const parsed: unknown = JSON.parse(stored)
				
				// Validate it's an array
				if (!Array.isArray(parsed)) {
					logger.warn('Invalid command history format in localStorage (not an array)', {
						component: 'McpChatInterface',
					})
					return
				}
				
				// Filter to valid strings only, sanitize, and limit
				const validHistory = parsed
					.filter((item): item is string => typeof item === 'string')
					.map(s => s.trim())
					.filter(s => s.length > 0)
					.slice(0, COMMAND_HISTORY_LIMIT)
				
				if (validHistory.length > 0) {
					setCommandHistory(validHistory)
				}
			}
		} catch (error) {
			logger.warn('Failed to load command history from localStorage', {
				component: 'McpChatInterface',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}, [])
	
	/**
	 * Save command history to localStorage when it changes
	 * 
	 * **Defensive Programming**:
	 * - Handles QuotaExceededError by trimming history
	 * - Only saves if history has been loaded (prevents race)
	 */
	useEffect(() => {
		if (!historyLoadedRef.current || commandHistory.length === 0) {return}
		
		try {
			localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(commandHistory))
		} catch (error) {
			// Handle QuotaExceededError by trimming history
			if (error instanceof Error && error.name === 'QuotaExceededError') {
				const trimmedHistory = commandHistory.slice(0, Math.floor(COMMAND_HISTORY_LIMIT / 2))
				try {
					localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory))
					setCommandHistory(trimmedHistory)
					logger.warn('localStorage quota exceeded, trimmed command history', {
						component: 'McpChatInterface',
						originalCount: commandHistory.length,
						trimmedCount: trimmedHistory.length,
					})
				} catch {
					// Give up and clear storage for this key
					localStorage.removeItem(HISTORY_STORAGE_KEY)
					logger.warn('Failed to save command history even after trimming, cleared storage', {
						component: 'McpChatInterface',
					})
				}
			} else {
				logger.warn('Failed to save command history to localStorage', {
					component: 'McpChatInterface',
					error: error instanceof Error ? error.message : 'Unknown error',
				})
			}
		}
	}, [commandHistory])
	
	/**
	 * Load favorites from localStorage on mount
	 */
	useEffect(() => {
		if (favoritesLoadedRef.current) {return}
		favoritesLoadedRef.current = true
		
		try {
			const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
			if (stored) {
				const parsed: unknown = JSON.parse(stored)
				
				if (!Array.isArray(parsed)) {
					logger.warn('Invalid favorites format in localStorage', {
						component: 'McpChatInterface',
					})
					return
				}
				
				// Filter to valid strings only
				const validFavorites = parsed
					.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
					.slice(0, MAX_FAVORITES)
				
				if (validFavorites.length > 0) {
					setFavorites(new Set(validFavorites))
				}
			}
		} catch (error) {
			logger.warn('Failed to load favorites from localStorage', {
				component: 'McpChatInterface',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}, [])
	
	/**
	 * Save favorites to localStorage when they change
	 */
	useEffect(() => {
		if (!favoritesLoadedRef.current) {return}
		
		try {
			const favoritesArray = Array.from(favorites)
			localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesArray))
		} catch (error) {
			logger.warn('Failed to save favorites to localStorage', {
				component: 'McpChatInterface',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}, [favorites])
	
	/**
	 * Toggle a tool as favorite
	 * 
	 * **Edge Cases Handled:**
	 * - Empty/whitespace tool names are ignored
	 * - Maximum favorites limit enforced
	 * - Set mutation is done immutably via new Set()
	 */
	const toggleFavorite = useCallback((toolName: string) => {
		// Edge case: Ignore empty or whitespace-only tool names
		const trimmedName = toolName.trim()
		if (!trimmedName) {
			logger.warn('toggleFavorite called with empty tool name', {
				component: 'McpChatInterface',
			})
			return
		}
		
		setFavorites(prev => {
			const next = new Set(prev)
			if (next.has(trimmedName)) {
				next.delete(trimmedName)
			} else if (next.size < MAX_FAVORITES) {
				next.add(trimmedName)
			} else {
				// Show a message if at max favorites
				logger.info(`Maximum ${MAX_FAVORITES} favorites reached`, {
					component: 'McpChatInterface',
				})
			}
			return next
		})
	}, [])
	
	/**
	 * Get favorite tools for quick actions
	 */
	const favoriteTools = useMemo(() => {
		return tools.filter(t => favorites.has(t.name))
	}, [tools, favorites])
	
	// =========================================================================
	// PHASE 4: WORKFLOWS
	// =========================================================================
	
	/**
	 * Load workflows from localStorage on mount
	 */
	useEffect(() => {
		if (workflowsLoadedRef.current) {return}
		workflowsLoadedRef.current = true
		
		try {
			const stored = localStorage.getItem(WORKFLOWS_STORAGE_KEY)
			if (stored) {
				const parsed: unknown = JSON.parse(stored)
				
				if (!Array.isArray(parsed)) {
					logger.warn('Invalid workflows format in localStorage', {
						component: 'McpChatInterface',
					})
					return
				}
				
				// Validate workflow structure
				const validWorkflows = parsed
					.filter((item): item is Workflow => 
						typeof item === 'object' &&
						item !== null &&
						typeof (item as Workflow).id === 'string' &&
						typeof (item as Workflow).name === 'string' &&
						Array.isArray((item as Workflow).commands)
					)
					.slice(0, MAX_WORKFLOWS)
				
				if (validWorkflows.length > 0) {
					setWorkflows(validWorkflows)
				}
			}
		} catch (error) {
			logger.warn('Failed to load workflows from localStorage', {
				component: 'McpChatInterface',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}, [])
	
	/**
	 * Save workflows to localStorage when they change
	 */
	useEffect(() => {
		if (!workflowsLoadedRef.current) {return}
		
		try {
			localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows))
		} catch (error) {
			logger.warn('Failed to save workflows to localStorage', {
				component: 'McpChatInterface',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}, [workflows])
	
	/**
	 * Save current command history as a workflow
	 */
	const saveWorkflow = useCallback((name: string) => {
		if (!name.trim()) {return}
		if (commandHistory.length === 0) {return}
		
		const workflow: Workflow = {
			id: generateWorkflowId(),
			name: name.trim(),
			commands: [...commandHistory].reverse(), // Reverse to get chronological order
			createdAt: parseDateOrNow().toISOString(),
		}
		
		setWorkflows(prev => [workflow, ...prev].slice(0, MAX_WORKFLOWS))
	}, [commandHistory])
	
	/**
	 * Run a saved workflow
	 * 
	 * **Edge Cases Handled:**
	 * - Empty commands array: Shows warning
	 * - Command failure: Logs error but continues with remaining commands
	 * - Whitespace-only commands: Skipped
	 */
	const runWorkflow = useCallback(async (workflow: Workflow) => {
		setShowWorkflows(false)
		
		// Edge case: Empty commands
		if (!workflow.commands || workflow.commands.length === 0) {
			logger.warn('Workflow has no commands to run', {
				component: 'McpChatInterface',
				workflowId: workflow.id,
				workflowName: workflow.name,
			})
			return
		}
		
		for (const command of workflow.commands) {
			// Skip empty commands
			const trimmedCommand = command.trim()
			if (!trimmedCommand) {continue}
			
			try {
				await sendMessage(trimmedCommand)
				// Small delay between commands for UX
				await new Promise(resolve => setTimeout(resolve, 500))
			} catch (error) {
				// Log error but continue with remaining commands
				logger.warn('Workflow command failed, continuing', {
					component: 'McpChatInterface',
					workflowId: workflow.id,
					command: trimmedCommand,
					error: error instanceof Error ? error.message : 'Unknown error',
				})
			}
		}
	}, [sendMessage])
	
	/**
	 * Delete a workflow
	 */
	const deleteWorkflow = useCallback((workflowId: string) => {
		setWorkflows(prev => prev.filter(w => w.id !== workflowId))
	}, [])
	
	// =========================================================================
	// PHASE 4: PREFERENCES
	// =========================================================================
	
	/**
	 * Load preferences from localStorage on mount
	 */
	useEffect(() => {
		if (preferencesLoadedRef.current) {return}
		preferencesLoadedRef.current = true
		
		try {
			const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
			if (stored) {
				const parsed: unknown = JSON.parse(stored)
				
				if (typeof parsed !== 'object' || parsed === null) {
					return
				}
				
				const prefs = parsed as Partial<UiPreferences>
				
				setPreferences({
					fontSize: FONT_SIZES.includes(prefs.fontSize as FontSize) 
						? prefs.fontSize as FontSize 
						: DEFAULT_PREFERENCES.fontSize,
					showTimestamps: typeof prefs.showTimestamps === 'boolean' 
						? prefs.showTimestamps 
						: DEFAULT_PREFERENCES.showTimestamps,
				})
			}
		} catch {
			// Silently fail - use defaults
		}
	}, [])
	
	/**
	 * Save preferences to localStorage when they change
	 */
	useEffect(() => {
		if (!preferencesLoadedRef.current) {return}
		
		try {
			localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
		} catch {
			// Silently fail
		}
	}, [preferences])
	
	/**
	 * Update preferences
	 */
	const updatePreferences = useCallback((update: Partial<UiPreferences>) => {
		setPreferences(prev => ({ ...prev, ...update }))
	}, [])
	
	// =========================================================================
	// PHASE 4: EXPORT FUNCTIONS
	// =========================================================================
	
	/**
	 * Export chat as markdown file
	 * 
	 * **Edge Cases Handled:**
	 * - Empty messages: Returns early with warning log
	 */
	const exportAsMarkdown = useCallback(() => {
		if (messages.length === 0) {
			logger.warn('No messages to export', { component: 'McpChatInterface' })
			return
		}
		
		const markdown = formatMessagesAsMarkdown(messages, preferences.showTimestamps)
		const filename = `mcp-session-${parseDateOrNow().toISOString().slice(0, 10)}.md`
		downloadAsFile(markdown, filename)
	}, [messages, preferences.showTimestamps])
	
	/**
	 * Copy chat as GitHub issue template
	 * 
	 * **Edge Cases Handled:**
	 * - Empty messages: Returns early with warning log
	 */
	const copyAsGithubIssue = useCallback(() => {
		if (messages.length === 0) {
			logger.warn('No messages to copy as issue', { component: 'McpChatInterface' })
			return
		}
		
		const issueMarkdown = formatAsGithubIssue(messages)
		void copyExportToClipboard(issueMarkdown)
	}, [messages, copyExportToClipboard])
	
	// =========================================================================
	// PHASE 5: CONFIG MANAGEMENT
	// =========================================================================
	
	/**
	 * Export all DevTools config as JSON file
	 */
	const exportConfig = useCallback(() => {
		const config = createExportConfig(workflows, favorites, preferences)
		const json = JSON.stringify(config, null, 2)
		const filename = `mcp-devtools-config-${parseDateOrNow().toISOString().slice(0, 10)}.json`
		downloadAsFile(json, filename, 'application/json')
	}, [workflows, favorites, preferences])
	
	/**
	 * Copy config to clipboard for quick sharing
	 */
	const copyConfigToClipboard = useCallback(() => {
		const config = createExportConfig(workflows, favorites, preferences)
		const json = JSON.stringify(config, null, 2)
		void copyExportToClipboard(json)
	}, [workflows, favorites, preferences, copyExportToClipboard])
	
	/**
	 * Import config from JSON string
	 * 
	 * **Note**: This function is available for programmatic config import.
	 * Currently unused in UI (import via /config import command shows instructions).
	 * Will be used when file input UI is added.
	 * 
	 * @param jsonString - JSON config string
	 * @returns true if import succeeded, false otherwise
	 */
	const _importConfig = useCallback((jsonString: string): boolean => {
		try {
			const parsed = JSON.parse(jsonString) as unknown
			const validated = validateImportConfig(parsed)
			
			if (!validated) {
				logger.warn('Invalid config format', { component: 'McpChatInterface' })
				return false
			}
			
			// Apply config
			setWorkflows(validated.workflows.slice(0, MAX_WORKFLOWS))
			setFavorites(new Set(validated.favorites.slice(0, MAX_FAVORITES)))
			setPreferences(validated.preferences)
			
			logger.info('Config imported successfully', {
				component: 'McpChatInterface',
				workflowsCount: validated.workflows.length,
				favoritesCount: validated.favorites.length,
			})
			
			return true
		} catch (error) {
			logger.warn('Failed to parse config JSON', {
				component: 'McpChatInterface',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
			return false
		}
	}, [])
	
	/**
	 * Reset all DevTools config to defaults
	 */
	const resetConfig = useCallback(() => {
		setWorkflows([])
		setFavorites(new Set())
		setPreferences(DEFAULT_PREFERENCES)
		setCommandHistory([])
		
		// Clear localStorage
		try {
			localStorage.removeItem(WORKFLOWS_STORAGE_KEY)
			localStorage.removeItem(FAVORITES_STORAGE_KEY)
			localStorage.removeItem(PREFERENCES_STORAGE_KEY)
			localStorage.removeItem(HISTORY_STORAGE_KEY)
		} catch {
			// Silently fail
		}
		
		logger.info('Config reset to defaults', { component: 'McpChatInterface' })
	}, [])
	
	/**
	 * Auto-scroll to bottom when new messages arrive
	 */
	useEffect(() => {
		logger.debug('McpChatInterface: Messages updated', {
			component: 'McpChatInterface',
			messagesCount: messages.length,
			status,
		})
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, status])
	
	/**
	 * Auto-connect on mount if enabled
	 */
	useEffect(() => {
		if (autoConnect && isAvailable && status === 'disconnected' && !hasAutoConnectedRef.current) {
			hasAutoConnectedRef.current = true
			void initialize()
		}
	}, [autoConnect, isAvailable, status, initialize])
	
	/**
	 * Generate autocomplete suggestions based on input
	 */
	const autocompleteSuggestions = useMemo((): AutocompleteSuggestion[] => {
		const trimmed = input.trim().toLowerCase()
		
		// Only show autocomplete for slash commands or after /call
		if (!trimmed.startsWith('/')) {return []}
		
		const suggestions: AutocompleteSuggestion[] = []
		
		// If typing /call and we have tools, suggest tool names
		if (trimmed.startsWith('/call ')) {
			const toolQuery = trimmed.slice(6).toLowerCase()
			tools
				.filter(t => t.name.toLowerCase().includes(toolQuery))
				.slice(0, 6)
				.forEach(t => {
					suggestions.push({
						value: `/call ${t.name}`,
						description: t.description ?? 'No description',
						type: 'tool',
					})
				})
		} else {
			// Suggest slash commands
			SLASH_COMMANDS
				.filter(c => c.command.toLowerCase().includes(trimmed))
				.forEach(c => {
					suggestions.push({
						value: c.command,
						description: c.description,
						type: 'command',
					})
				})
		}
		
		return suggestions
	}, [input, tools])
	
	/**
	 * Show/hide autocomplete based on suggestions
	 */
	useEffect(() => {
		const shouldShow = autocompleteSuggestions.length > 0 && input.startsWith('/')
		setShowAutocomplete(shouldShow)
		if (shouldShow) {
			setAutocompleteIndex(0)
		}
	}, [autocompleteSuggestions, input])
	
	/**
	 * Handle form submission with race condition guards
	 */
	const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
		e.preventDefault()
		
		const trimmed = input.trim()
		
		if (!trimmed || isSubmitting || isSubmittingRef.current) {
			return
		}
		
		isSubmittingRef.current = true
		setCommandHistory(prev => [trimmed, ...prev.slice(0, COMMAND_HISTORY_LIMIT - 1)])
		setHistoryIndex(-1)
		setInput('')
		
		setIsSubmitting(true)
		try {
			// Handle local commands (Phase 4)
			if (trimmed === '/clear') {
				clearMessages()
				return
			}
			
			if (trimmed === '/export') {
				exportAsMarkdown()
				return
			}
			
			// Phase 5: Config management
			if (trimmed.startsWith('/config')) {
				const args = trimmed.slice(8).trim().split(' ')
				const subcommand = args[0]?.toLowerCase()
				
				if (subcommand === 'export') {
					exportConfig()
					return
				}
				
				if (subcommand === 'copy') {
					copyConfigToClipboard()
					return
				}
				
				if (subcommand === 'reset') {
					resetConfig()
					// Confirm in chat
					await sendMessage('/config reset')
					return
				}
				
				if (subcommand === 'import') {
					// For import, we need to show instructions since we can't accept file input via command
					await sendMessage('/config import')
					return
				}
				
				// Show help for /config
				await sendMessage('/config')
				return
			}
			
			if (trimmed.startsWith('/workflow')) {
				const args = trimmed.slice(10).trim().split(' ')
				const subcommand = args[0]?.toLowerCase()
				
				if (subcommand === 'save') {
					const name = args.slice(1).join(' ') || `Workflow ${workflows.length + 1}`
					saveWorkflow(name)
					// Show confirmation in chat
					await sendMessage(`/workflow save "${name}"`)
					return
				}
				
				if (subcommand === 'list') {
					if (workflows.length === 0) {
						await sendMessage('/workflow list')
					} else {
						setShowWorkflows(true)
					}
					return
				}
				
				if (subcommand === 'run') {
					const workflowName = args.slice(1).join(' ').toLowerCase().trim()
					
					if (!workflowName) {
						// No name provided - show workflow list
						setShowWorkflows(true)
						return
					}
					
					// Prioritize exact match, then prefix match, then includes match
					const exactMatch = workflows.find(w => w.name.toLowerCase() === workflowName)
					const prefixMatch = !exactMatch && workflows.find(w => 
						w.name.toLowerCase().startsWith(workflowName)
					)
					const includesMatch = !exactMatch && !prefixMatch && workflows.find(w => 
						w.name.toLowerCase().includes(workflowName)
					)
					
					const workflow = exactMatch ?? prefixMatch ?? includesMatch
					
					if (workflow) {
						await runWorkflow(workflow)
					} else {
						// No match found - pass to MCP to show error
						await sendMessage(`/workflow run "${workflowName}"`)
					}
					return
				}
				
				// Show help for /workflow
				await sendMessage('/workflow')
				return
			}
			
			// Send to MCP server
			await sendMessage(trimmed)
		} finally {
			setIsSubmitting(false)
			isSubmittingRef.current = false
			inputRef.current?.focus()
		}
	}, [input, isSubmitting, sendMessage, clearMessages, exportAsMarkdown, saveWorkflow, workflows, runWorkflow, exportConfig, copyConfigToClipboard, resetConfig])
	
	/**
	 * Copy last assistant response to clipboard (uses shared hook for DRY)
	 */
	const copyLastResponse = useCallback(() => {
		const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
		if (lastAssistantMessage) {
			void copyLastResponseToClipboard(lastAssistantMessage.content)
		}
	}, [messages, copyLastResponseToClipboard])
	
	/**
	 * Global keyboard shortcuts handler
	 * 
	 * Shortcuts:
	 * - ⌘K / Ctrl+K: Focus input (command palette style)
	 * - ⌘⇧C / Ctrl+Shift+C: Copy last response
	 * - Escape: Clear input and close autocomplete
	 */
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
			const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey
			
			// ⌘K / Ctrl+K - Focus input
			if (cmdOrCtrl && e.key === 'k') {
				e.preventDefault()
				inputRef.current?.focus()
				inputRef.current?.select()
			}
			
			// ⌘⇧C / Ctrl+Shift+C - Copy last response
			if (cmdOrCtrl && e.shiftKey && e.key === 'C') {
				e.preventDefault()
				copyLastResponse()
			}
			
			// Escape - Clear input when focused
			if (e.key === 'Escape' && document.activeElement === inputRef.current) {
				if (showAutocomplete) {
					setShowAutocomplete(false)
				} else if (input.trim()) {
					setInput('')
				}
			}
		}
		
		window.addEventListener('keydown', handleGlobalKeyDown)
		return () => window.removeEventListener('keydown', handleGlobalKeyDown)
	}, [copyLastResponse, input, showAutocomplete])
	
	/**
	 * Handle keyboard navigation for command history and autocomplete
	 */
	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		// Handle autocomplete navigation
		if (showAutocomplete && autocompleteSuggestions.length > 0) {
			if (e.key === 'Tab' || (e.key === 'Enter' && autocompleteIndex >= 0)) {
				e.preventDefault()
				const selected = autocompleteSuggestions[autocompleteIndex]
				if (selected) {
					setInput(selected.value + ' ')
					setShowAutocomplete(false)
				}
				return
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setAutocompleteIndex(prev => 
					prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0
				)
				return
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				setAutocompleteIndex(prev => 
					prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1
				)
				return
			}
			if (e.key === 'Escape') {
				setShowAutocomplete(false)
				return
			}
		}
		
		// Handle command history (only when autocomplete is not shown)
		if (!showAutocomplete) {
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				if (historyIndex < commandHistory.length - 1) {
					const newIndex = historyIndex + 1
					setHistoryIndex(newIndex)
					setInput(commandHistory[newIndex])
				}
			} else if (e.key === 'ArrowDown') {
				e.preventDefault()
				if (historyIndex > 0) {
					const newIndex = historyIndex - 1
					setHistoryIndex(newIndex)
					setInput(commandHistory[newIndex])
				} else if (historyIndex === 0) {
					setHistoryIndex(-1)
					setInput('')
				}
			}
		}
	}, [historyIndex, commandHistory, showAutocomplete, autocompleteSuggestions, autocompleteIndex])
	
	/**
	 * Handle tool selection from "Try It" button
	 * Pre-fills the input with the tool command template
	 */
	const handleSelectTool = useCallback((command: string) => {
		setInput(command)
		setHistoryIndex(-1)
		inputRef.current?.focus()
	}, [])
	
	/**
	 * Quick action buttons - memoized to prevent unnecessary re-renders
	 * 
	 * Phase 3: Added debug tools (Errors, Page, Logs, Project)
	 */
	const quickActions = useMemo(() => [
		// Connection
		{ label: 'Connect', command: '/connect', icon: Plug as LucideIcon, show: status === 'disconnected' || status === 'error' },
		{ label: 'Tools', command: '/tools', icon: Wrench as LucideIcon, show: status === 'connected' },
		// Debug Tools (Phase 3)
		{ label: 'Errors', command: '/call get_errors', icon: Bug as LucideIcon, show: status === 'connected' },
		{ label: 'Routes', command: '/call get_routes', icon: Route as LucideIcon, show: status === 'connected' },
		{ label: 'Page', command: '/call get_page_metadata', icon: Layers as LucideIcon, show: status === 'connected' },
		{ label: 'Logs', command: '/call get_logs', icon: FileText as LucideIcon, show: status === 'connected' },
		{ label: 'Project', command: '/call get_project_metadata', icon: Terminal as LucideIcon, show: status === 'connected' },
		// Help
		{ label: 'Help', command: '/help', icon: HelpCircle as LucideIcon, show: true },
	], [status])
	
	// Not available in production
	if (!isAvailable) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
				<AlertCircle className="h-12 w-12 text-warning" strokeWidth={1.5} aria-hidden="true" />
				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-base-content">
						Development Only
					</h3>
					<p className="text-sm text-base-content/70 max-w-md">
						MCP Chat is only available in development mode. Start your dev server to use this feature.
					</p>
				</div>
			</div>
		)
	}
	
	return (
		<div className={classNames("flex h-full flex-col", FONT_SIZE_CLASSES[preferences.fontSize])}>
			{/* Header - Status and Actions (Mobile-first responsive) */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 pb-3">
				{/* Left: Terminal Label */}
				<div className="flex items-center gap-2 shrink-0">
					<Terminal className="h-5 w-5 text-primary" aria-hidden="true" />
					<span className="text-sm font-semibold text-base-content tracking-tight">
						MCP<span className="hidden sm:inline"> Terminal</span>
					</span>
				</div>
				
				{/* Center: Connection Status (grows on mobile) */}
				<div className="order-last sm:order-0 w-full sm:w-auto flex justify-center sm:justify-start">
					<ConnectionStatus status={status} />
				</div>
				
				{/* Right: Action Buttons */}
				<div className="flex items-center gap-1 sm:gap-2 shrink-0">
					
					{/* Phase 4: Export Actions (only show when messages exist) */}
					{messages.length > 0 && (
						<>
							<div className="w-px h-4 bg-base-300" aria-hidden="true" />
							<Button
								variant="ghost"
								size="xs"
								onClick={exportAsMarkdown}
								className="btn-circle"
								aria-label="Export as markdown"
								title="Download chat as Markdown file"
							>
								<Download size={14} aria-hidden="true" />
							</Button>
							<Button
								variant="ghost"
								size="xs"
								onClick={copyAsGithubIssue}
								className="btn-circle"
								aria-label={exportCopied ? "Copied!" : "Copy as GitHub issue"}
								title={exportCopied ? "Copied to clipboard!" : "Copy as GitHub Issue template"}
							>
								{exportCopied ? (
									<Check size={14} className="text-success" aria-hidden="true" />
								) : (
									<Github size={14} aria-hidden="true" />
								)}
							</Button>
						</>
					)}
					
					{/* Phase 4: Workflows */}
					<div className="relative">
						<Button
							variant="ghost"
							size="xs"
							onClick={() => setShowWorkflows(!showWorkflows)}
							className={classNames("btn-circle", workflows.length > 0 && "text-primary")}
							aria-label="Workflows"
							aria-expanded={showWorkflows}
							title={`Saved Workflows${workflows.length > 0 ? ` (${workflows.length})` : ''} - Save & run command sequences`}
						>
							<Workflow size={14} aria-hidden="true" />
							{workflows.length > 0 && (
								<span className="absolute -top-1 -right-1 h-3 w-3 text-[8px] bg-primary text-primary-content rounded-full flex items-center justify-center">
									{workflows.length}
								</span>
							)}
						</Button>
						{showWorkflows && (
							<WorkflowManager
								workflows={workflows}
								onRun={(wf) => void runWorkflow(wf)}
								onDelete={deleteWorkflow}
								onClose={() => setShowWorkflows(false)}
							/>
						)}
					</div>
					
					{/* Phase 4: Preferences */}
					<div className="relative">
						<Button
							variant="ghost"
							size="xs"
							onClick={() => setShowPreferences(!showPreferences)}
							className="btn-circle"
							aria-label="Preferences"
							aria-expanded={showPreferences}
							title="Preferences - Font size, timestamps, config export"
						>
							<Settings2 size={14} aria-hidden="true" />
						</Button>
						{showPreferences && (
							<PreferencesDropdown
								preferences={preferences}
								onUpdate={updatePreferences}
								onExportConfig={exportConfig}
								onCopyConfig={copyConfigToClipboard}
								onResetConfig={resetConfig}
								configCopied={exportCopied}
								onClose={() => setShowPreferences(false)}
							/>
						)}
					</div>
					
					{/* Clear Messages */}
					{messages.length > 0 && (
						<Button
							variant="ghost"
							size="xs"
							onClick={clearMessages}
							className="btn-circle"
							aria-label="Clear messages"
							title="Clear all messages"
						>
							<Trash2 size={14} aria-hidden="true" />
						</Button>
					)}
				</div>
			</div>
			
			{/* Quick Actions - Mobile-first responsive grid */}
			<div className="py-3 border-b border-base-300 space-y-3">
				{/* Primary Actions - scrollable on mobile */}
				<div className="flex flex-wrap gap-1.5 sm:gap-2">
					{quickActions.filter(a => a.show).map((action) => (
						<Button
							key={action.command}
							variant="ghost"
							size="xs"
							onClick={() => void sendMessage(action.command)}
							disabled={isSubmitting}
							leftIcon={<action.icon size={14} />}
							className="text-xs px-2 py-1.5 h-auto min-h-0 sm:px-3"
						>
							{action.label}
						</Button>
					))}
				</div>
				
				{/* Favorite Tools (separate row on mobile for clarity) */}
				{favoriteTools.length > 0 && status === 'connected' && (
					<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-base-300/50">
						<span className="text-xs text-warning font-medium flex items-center gap-1 mr-1">
							<Star size={12} fill="currentColor" />
							<span className="sr-only sm:not-sr-only">Quick:</span>
						</span>
						{favoriteTools.map(tool => (
							<Button
								key={`fav-${tool.name}`}
								variant="ghost"
								size="xs"
								onClick={() => void sendMessage(`/call ${tool.name}`)}
								disabled={isSubmitting}
								leftIcon={<Play size={10} />}
								className="text-xs px-2 py-1 h-auto min-h-0 text-warning/80 hover:text-warning hover:bg-warning/10 sm:px-3"
							>
								{tool.name.replace(/^get_/, '')}
							</Button>
						))}
					</div>
				)}
				
				{/* Tools count badge */}
				{tools.length > 0 && (
					<div className="flex items-center gap-2 text-xs text-base-content/50">
						<span className="flex items-center gap-1">
							📦 {tools.length} tools
							{favorites.size > 0 && (
								<span className="flex items-center gap-0.5 text-warning">
									• <Star size={10} fill="currentColor" /> {favorites.size}
								</span>
							)}
						</span>
					</div>
				)}
			</div>
			
			{/* Messages Area - with live region for accessibility */}
			<div 
				className="flex-1 overflow-y-auto py-4 px-2 sm:px-4 space-y-4 min-h-0"
				role="log"
				aria-live="polite"
				aria-label="MCP chat messages"
			>
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-6 opacity-60">
						<div className="relative">
							<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" aria-hidden="true" />
							<Terminal className="relative h-16 w-16 text-primary" strokeWidth={1} aria-hidden="true" />
						</div>
						<div className="space-y-2 max-w-xs">
							<h4 className="font-semibold text-base-content">Ready to Connect</h4>
							<p className="text-sm text-base-content/70">
								{status === 'disconnected' 
									? 'Connect to the local MCP server to start building with AI superpowers.' 
									: status === 'connecting'
									? 'Establishing secure connection...'
									: 'Type a command or use quick actions.'}
							</p>
						</div>
						{status === 'disconnected' && (
							<Button 
								variant="outline" 
								onClick={() => void initialize()}
								leftIcon={<Plug size={14} />}
								className="animate-pulse-smooth"
							>
								Connect Now
							</Button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{messages.map((msg) => (
							<ChatMessage 
								key={msg.id} 
								message={msg} 
								tools={tools}
								onSelectTool={handleSelectTool}
								favorites={favorites}
								onToggleFavorite={toggleFavorite}
							/>
						))}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Input Area - Using Input component (DRY) */}
			<form 
				onSubmit={(e) => void handleSubmit(e)} 
				className="p-3 sm:p-4 border-t border-base-200 bg-base-100"
			>
				{/* Autocomplete Dropdown */}
				<div className="relative">
					{showAutocomplete && (
						<AutocompleteDropdown
							suggestions={autocompleteSuggestions}
							selectedIndex={autocompleteIndex}
							onSelect={(value) => {
								setInput(value + ' ')
								setShowAutocomplete(false)
								inputRef.current?.focus()
							}}
						/>
					)}
				</div>
				<Input
					ref={inputRef}
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={status === 'connected' ? 'Execute command...' : 'Waiting for connection...'}
					disabled={isSubmitting}
					autoComplete="off"
					spellCheck={false}
					size="sm"
					leftIcon={<TerminalPrompt />}
					className="font-mono bg-base-200/50 border-base-300 focus:bg-base-100"
					wrapperClassName="w-full"
					rightElement={
						isSubmitting ? (
							<Loader2 size={16} className="text-primary animate-spin" aria-label="Sending..." />
						) : (
							<Button 
								type="submit"
								disabled={!input.trim()}
								variant="ghost"
								size="xs"
								className="h-7 w-7 min-h-0 min-w-0 p-0 rounded-md"
								aria-label="Execute command"
							>
								<Send size={14} className={input.trim() ? 'text-primary' : 'text-base-content/30'} />
							</Button>
						)
					}
				/>
				{/* Keyboard hints - Mobile-first responsive */}
				<div className="flex justify-between items-center mt-2 px-1">
					<div className="flex items-center gap-2 sm:gap-3 text-xs text-base-content/40">
						<span className="inline-flex items-center gap-1">
							<kbd className="font-mono bg-base-200 px-1.5 py-0.5 rounded text-xs">↑↓</kbd>
							<span>history</span>
						</span>
						<span className="hidden sm:inline-flex items-center gap-1">
							<kbd className="font-mono bg-base-200 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
							<span>focus</span>
						</span>
						<span className="hidden md:inline-flex items-center gap-1">
							<kbd className="font-mono bg-base-200 px-1.5 py-0.5 rounded text-xs">⌘⇧C</kbd>
							<span>copy</span>
						</span>
					</div>
					<Button
						variant="ghost"
						size="xs"
						className="h-6 w-6 min-h-0 min-w-0 p-0 opacity-40 hover:opacity-100"
						aria-label="Keyboard shortcuts"
						title="Keyboard shortcuts: ⌘K focus • ⌘⇧C copy • ↑↓ history • Esc clear"
					>
						<Keyboard size={14} />
					</Button>
				</div>
			</form>
		</div>
	)
}

