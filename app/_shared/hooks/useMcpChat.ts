/**
 * MCP Chat Hook
 * 
 * Provides communication with the Next.js built-in MCP server via JSON-RPC 2.0 over SSE.
 * Only available in development mode when the MCP server is enabled.
 * 
 * **⚠️ Barrel Import Note:**
 * This hook is exported from `@_shared/hooks` but intentionally NOT from `@_shared`.
 * This is because:
 * 1. It's development-only (would fail in production)
 * 2. It has dev server dependencies (MCP endpoint only exists in dev)
 * 3. Tree-shaking from the main barrel would still include it in production bundles
 * 
 * **Correct Import:**
 * ```typescript
 * // ✅ Correct - from hooks barrel
 * import { useMcpChat } from '@_shared/hooks'
 * 
 * // ❌ Wrong - not exported from main barrel
 * import { useMcpChat } from '@_shared'  // Will not work
 * ```
 * 
 * **Protocol:**
 * - Transport: Server-Sent Events (SSE) with `Accept: text/event-stream`
 * - Format: JSON-RPC 2.0
 * - Endpoint: http://localhost:3000/_next/mcp
 * 
 * **MCP Operations:**
 * - `initialize` - Initialize the MCP connection
 * - `tools/list` - List available tools
 * - `tools/call` - Execute a tool
 * - `resources/list` - List available resources
 * - `prompts/list` - List available prompts
 * 
 * **Prerequisites:**
 * - Next.js 16+ with `experimental.mcpServer: true` in next.config.mjs
 * - Development mode only (`NODE_ENV === 'development'`)
 * 
 * @module hooks/useMcpChat
 * @see {@link https://nextjs.org/docs/app/guides/mcp} Next.js MCP Documentation
 * @see {@link https://modelcontextprotocol.io/} Model Context Protocol Specification
 * 
 * @example
 * ```tsx
 * // Basic usage in a component
 * import { useMcpChat } from '@_shared/hooks'
 * 
 * function McpTerminal() {
 *   const { messages, sendMessage, status, initialize } = useMcpChat()
 *   
 *   useEffect(() => {
 *     initialize()
 *   }, [initialize])
 *   
 *   return (
 *     <div>
 *       <p>Status: {status}</p>
 *       {messages.map(msg => <p key={msg.id}>{msg.content}</p>)}
 *       <button onClick={() => sendMessage('/help')}>Help</button>
 *     </div>
 *   )
 * }
 * ```
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

import { logger, normalizeError } from '@_core/logger'

import { parseDateOrNow } from '@_lib/dates'

import { REQUEST_TIMEOUT_MS } from '@_shared/services/httpService.constants'

// =============================================================================
// TYPES
// =============================================================================

/**
 * JSON-RPC 2.0 Request
 * @see {@link https://www.jsonrpc.org/specification} JSON-RPC 2.0 Specification
 */
export interface JsonRpcRequest {
	/** Protocol version - always "2.0" */
	jsonrpc: '2.0'
	/** Unique request identifier for correlating responses */
	id: number | string
	/** Method name to invoke (e.g., "initialize", "tools/list") */
	method: string
	/** Optional parameters for the method */
	params?: Record<string, unknown>
}

/**
 * JSON-RPC 2.0 Response
 * @see {@link https://www.jsonrpc.org/specification} JSON-RPC 2.0 Specification
 */
export interface JsonRpcResponse {
	/** Protocol version - always "2.0" */
	jsonrpc: '2.0'
	/** Request identifier this response correlates to (null for notifications) */
	id: number | string | null
	/** Successful result data (mutually exclusive with error) */
	result?: unknown
	/** Error information if request failed (mutually exclusive with result) */
	error?: {
		/** Error code (standard JSON-RPC codes or custom) */
		code: number
		/** Human-readable error message */
		message: string
		/** Additional error data */
		data?: unknown
	}
}

/**
 * Chat message in the MCP terminal
 * Represents a single message in the conversation history
 */
export interface McpMessage {
	/** Unique message identifier (generated via timestamp + random) */
	id: string
	/** Message role determining display styling and semantics */
	role: 'user' | 'assistant' | 'system' | 'error'
	/** Message content (may contain markdown for system messages) */
	content: string
	/** When the message was created */
	timestamp: Date
	/** Optional metadata for tool calls and performance tracking */
	metadata?: {
		/** MCP method that produced this message */
		method?: string
		/** Execution duration in milliseconds */
		duration?: number
		/** Tool name if this was a tool call result */
		toolName?: string
	}
}

/**
 * MCP Tool definition from the server
 * @see {@link https://modelcontextprotocol.io/docs/concepts/tools} MCP Tools Specification
 */
export interface McpTool {
	/** Unique tool identifier used in tool/call requests */
	name: string
	/** Human-readable description of what the tool does */
	description?: string
	/** JSON Schema for the tool's input parameters */
	inputSchema?: Record<string, unknown>
}

/**
 * MCP Resource definition from the server
 * @see {@link https://modelcontextprotocol.io/docs/concepts/resources} MCP Resources Specification
 */
export interface McpResource {
	/** Unique resource URI (e.g., "file:///path/to/file") */
	uri: string
	/** Human-readable resource name */
	name?: string
	/** Description of the resource */
	description?: string
	/** MIME type of the resource content */
	mimeType?: string
}

/**
 * MCP Connection Status
 * 
 * Represents the current state of the MCP server connection.
 * Used for UI feedback and conditional rendering.
 */
export type McpConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Return type for useMcpChat hook
 * 
 * Provides all state and methods for MCP server interaction.
 * Designed for easy consumption in React components.
 */
export interface UseMcpChatReturn {
	/** Array of all chat messages in chronological order (limited to MAX_MESSAGE_HISTORY) */
	messages: McpMessage[]
	/** Current connection status for UI feedback */
	status: McpConnectionStatus
	/** List of available MCP tools from the server */
	tools: McpTool[]
	/** List of available MCP resources from the server */
	resources: McpResource[]
	/** Send a message or command (parses /commands automatically) */
	sendMessage: (content: string) => Promise<void>
	/** Initialize connection to MCP server (call on mount) */
	initialize: () => Promise<void>
	/** Refresh the list of available tools */
	listTools: () => Promise<void>
	/** Refresh the list of available resources */
	listResources: () => Promise<void>
	/** Execute a specific tool by name with optional arguments */
	callTool: (name: string, args?: Record<string, unknown>) => Promise<void>
	/** Clear all messages from history */
	clearMessages: () => void
	/** Last error message (null if no error) */
	error: string | null
	/** Whether MCP is available (true only in development mode) */
	isAvailable: boolean
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** MCP server endpoint (Next.js built-in) */
const MCP_ENDPOINT = 'http://localhost:3000/_next/mcp'

/** Maximum messages to keep in history (prevents unbounded memory growth) */
const MAX_MESSAGE_HISTORY = 100

/** Maximum SSE buffer size in bytes (1MB - prevents memory exhaustion from large responses) */
const MAX_SSE_BUFFER_SIZE = 1024 * 1024

// Note: REQUEST_TIMEOUT_MS is imported from httpService.constants (DRY)

// =============================================================================
// UTILITIES
// =============================================================================

// Note: Error handling uses normalizeError from @_core/logger (DRY)
// Usage: normalizeError(err).message to get error message string

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * MCP Chat Hook
 * 
 * Enables communication with the Next.js MCP server for AI-assisted development.
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage, status, initialize } = useMcpChat()
 * 
 * useEffect(() => {
 *   initialize()
 * }, [])
 * 
 * const handleSend = () => {
 *   sendMessage('List all available tools')
 * }
 * ```
 */
export function useMcpChat(): UseMcpChatReturn {
	const [messages, setMessages] = useState<McpMessage[]>([])
	const [status, setStatus] = useState<McpConnectionStatus>('disconnected')
	const [tools, setTools] = useState<McpTool[]>([])
	const [resources, setResources] = useState<McpResource[]>([])
	const [error, setError] = useState<string | null>(null)
	
	const requestIdRef = useRef(1)
	const abortControllerRef = useRef<AbortController | null>(null)
	/** Guard to prevent double initialization race condition */
	const isInitializingRef = useRef(false)
	
	// Check if MCP is available (development mode only)
	const isAvailable = process.env.NODE_ENV === 'development'
	
	/**
	 * Generate unique message ID
	 */
	const generateMessageId = useCallback(() => {
		return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	}, [])
	
	/**
	 * Add a message to the chat
	 * Maintains a maximum history to prevent unbounded memory growth
	 */
	const addMessage = useCallback((
		role: McpMessage['role'],
		content: string,
		metadata?: McpMessage['metadata']
	) => {
		const message: McpMessage = {
			id: generateMessageId(),
			role,
			content,
			timestamp: parseDateOrNow(),
			metadata,
		}
		logger.debug('useMcpChat: Adding message', {
			component: 'useMcpChat',
			role,
			contentPreview: content.slice(0, 50),
			messageId: message.id,
		})
		setMessages(prev => {
			const updated = [...prev, message]
			logger.debug('useMcpChat: Messages state updated', {
				component: 'useMcpChat',
				previousCount: prev.length,
				newCount: updated.length,
			})
			// Trim oldest messages if exceeding limit (keep last MAX_MESSAGE_HISTORY)
			return updated.length > MAX_MESSAGE_HISTORY 
				? updated.slice(-MAX_MESSAGE_HISTORY) 
				: updated
		})
		return message
	}, [generateMessageId])
	
	/**
	 * Handle Server-Sent Events response
	 * 
	 * Parses SSE stream and extracts JSON-RPC response matching the request ID.
	 * Handles [DONE] sentinel and partial data gracefully.
	 * 
	 * @param response - The fetch Response with SSE stream
	 * @param requestId - The request ID to match in responses
	 * @returns The parsed JSON-RPC response
	 * @throws {Error} If no response body or no valid response received
	 */
	const handleSseResponse = useCallback(async (
		response: Response,
		requestId: number
	): Promise<JsonRpcResponse> => {
		const reader = response.body?.getReader()
		if (!reader) {
			throw new Error('No response body')
		}
		
		const decoder = new TextDecoder()
		let buffer = ''
		let result: JsonRpcResponse | null = null
		let isDone = false // Track if we hit [DONE] sentinel
		
		try {
			while (!isDone) {
				const { done, value } = await reader.read()
				
				if (done) { break }
				
				buffer += decoder.decode(value, { stream: true })
				
				// Guard: Prevent memory exhaustion from abnormally large responses
				if (buffer.length > MAX_SSE_BUFFER_SIZE) {
					throw new Error(`Response too large (>${MAX_SSE_BUFFER_SIZE / 1024}KB). Possible malformed stream.`)
				}
				
				// Parse SSE events
				const lines = buffer.split('\n')
				buffer = lines.pop() ?? '' // Keep incomplete line in buffer
				
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6).trim()
						if (data === '[DONE]') {
							isDone = true // Signal to exit outer loop
							break
						}
						try {
							const parsed = JSON.parse(data) as JsonRpcResponse
							if (parsed.id === requestId || parsed.id === null) {
								result = parsed
							}
						} catch {
							// Ignore parse errors for partial data
						}
					}
				}
			}
		} finally {
			reader.releaseLock()
		}
		
		if (!result) {
			throw new Error('No valid response received')
		}
		
		return result
	}, [])
	
	/**
	 * Send JSON-RPC request to MCP server via SSE
	 * Includes timeout handling to prevent hanging requests
	 */
	const sendJsonRpcRequest = useCallback(async (
		method: string,
		params?: Record<string, unknown>
	): Promise<JsonRpcResponse> => {
		const requestId = requestIdRef.current++
		const startTime = Date.now()
		
		const request: JsonRpcRequest = {
			jsonrpc: '2.0',
			id: requestId,
			method,
			params,
		}
		
		// Cancel any existing request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}
		
		abortControllerRef.current = new AbortController()
		const { signal } = abortControllerRef.current
		
		// Set up timeout
		const timeoutId = setTimeout(() => {
			abortControllerRef.current?.abort()
		}, REQUEST_TIMEOUT_MS)
		
		try {
			const response = await fetch(MCP_ENDPOINT, {
				method: 'POST',
				headers: {
					// HTTP headers use kebab-case by RFC 7230 specification
					// eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP headers (RFC 7230)
					'Content-Type': 'application/json',
					'Accept': 'text/event-stream, application/json',
				},
				body: JSON.stringify(request),
				signal,
			})
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}
			
			const contentType = response.headers.get('content-type') ?? ''
			
			// Handle SSE response
			if (contentType.includes('text/event-stream')) {
				return await handleSseResponse(response, requestId)
			}
			
			// Handle JSON response
			const data = await response.json() as JsonRpcResponse
			const duration = Date.now() - startTime
			
			return { ...data, _duration: duration } as JsonRpcResponse & { _duration?: number }
		} catch (err) {
			if ((err as Error).name === 'AbortError') {
				// Differentiate between user cancellation and timeout
				const elapsed = Date.now() - startTime
				if (elapsed >= REQUEST_TIMEOUT_MS - 100) {
					throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`)
				}
				throw new Error('Request cancelled')
			}
			throw err
		} finally {
			clearTimeout(timeoutId)
		}
	}, [handleSseResponse])
	
	/**
	 * Initialize MCP connection
	 * 
	 * Establishes connection to the MCP server and fetches available tools/resources.
	 * Includes guard against double initialization race condition.
	 * 
	 * @returns Promise that resolves when initialization completes (success or failure)
	 */
	const initialize = useCallback(async (): Promise<void> => {
		// Guard: Check availability
		if (!isAvailable) {
			setError('MCP is only available in development mode')
			return
		}
		
		// Guard: Prevent double initialization (race condition fix)
		if (isInitializingRef.current) {
			return
		}
		
		isInitializingRef.current = true
		setStatus('connecting')
		setError(null)
		
		addMessage('system', '🔌 Connecting to MCP server...')
		
		try {
			const response = await sendJsonRpcRequest('initialize', {
				protocolVersion: '2024-11-05',
				capabilities: {
					roots: { listChanged: true },
					sampling: {},
				},
				clientInfo: {
					name: 'MedSource Pro Chat',
					version: '1.0.0',
				},
			})
			
			if (response.error) {
				throw new Error(response.error.message)
			}
			
		setStatus('connected')
		setError(null) // Clear any previous errors
		addMessage('system', '✅ Connected to MCP server successfully!')
		
		// Auto-fetch tools and resources SEQUENTIALLY (not parallel!)
		// CRITICAL: sendJsonRpcRequest aborts any existing request, so parallel calls would cancel each other
		// This is intentional to prevent request queue buildup, but means we must serialize these calls
		try {
			// Fetch tools first
			const toolsRes = await sendJsonRpcRequest('tools/list')
			if (!toolsRes.error) {
				const toolList = (toolsRes.result as { tools?: McpTool[] })?.tools ?? []
				setTools(toolList)
				if (toolList.length > 0) {
					addMessage('system', `📦 Found ${toolList.length} available tools: ${toolList.map(t => t.name).join(', ')}`)
				}
			}
			
			// Then fetch resources (non-critical)
			try {
				const resourcesRes = await sendJsonRpcRequest('resources/list')
				if (!resourcesRes.error) {
					const resourceList = (resourcesRes.result as { resources?: McpResource[] })?.resources ?? []
					setResources(resourceList)
					if (resourceList.length > 0) {
						addMessage('system', `📂 Found ${resourceList.length} available resources`)
					}
				}
			} catch {
				// Resources might not be available - not critical (silent fail)
			}
		} catch {
			// Tool/resource fetch failures don't affect connection status (silent fail)
		}
			
		} catch (err) {
			const errorMsg = normalizeError(err).message || 'Connection failed'
			setStatus('error')
			setError(errorMsg)
			addMessage('error', `❌ Connection failed: ${errorMsg}`)
		} finally {
			isInitializingRef.current = false
		}
	}, [isAvailable, addMessage, sendJsonRpcRequest])
	
	/**
	 * List available tools
	 * 
	 * Fetches the current list of tools from the MCP server.
	 * Safe to call when disconnected - will show appropriate error.
	 */
	const listTools = useCallback(async (): Promise<void> => {
		// Guard: Provide better UX when not connected
		if (status !== 'connected') {
			addMessage('error', '❌ Not connected. Use /connect first.')
			return
		}
		
		try {
			const response = await sendJsonRpcRequest('tools/list')
			
			if (response.error) {
				throw new Error(response.error.message)
			}
			
			const toolList = (response.result as { tools?: McpTool[] })?.tools ?? []
			setTools(toolList)
			
			if (toolList.length > 0) {
				addMessage('system', `📦 Found ${toolList.length} available tools: ${toolList.map(t => t.name).join(', ')}`)
			} else {
				addMessage('system', '📦 No tools available from MCP server')
			}
			
		} catch (err) {
			const errorMsg = normalizeError(err).message || 'Failed to list tools'
			addMessage('error', `❌ ${errorMsg}`)
		}
	}, [status, sendJsonRpcRequest, addMessage])
	
	/**
	 * List available resources
	 * 
	 * Fetches the current list of resources from the MCP server.
	 * Shows error when disconnected (consistent with listTools UX).
	 */
	const listResources = useCallback(async (): Promise<void> => {
		// Guard: Provide better UX when not connected (consistent with listTools)
		if (status !== 'connected') {
			addMessage('error', '❌ Not connected. Use /connect first.')
			return
		}
		
		try {
			const response = await sendJsonRpcRequest('resources/list')
			
			if (response.error) {
				throw new Error(response.error.message)
			}
			
			const resourceList = (response.result as { resources?: McpResource[] })?.resources ?? []
			setResources(resourceList)
			
			if (resourceList.length > 0) {
				addMessage('system', `📂 Found ${resourceList.length} available resources`)
			} else {
				addMessage('system', '📂 No resources available from MCP server')
			}
			
		} catch {
			// Resources might not be available - not critical (silent fail)
		}
	}, [status, sendJsonRpcRequest, addMessage])
	
	/**
	 * Safely stringify an object, handling circular references
	 * @param obj - Object to stringify
	 * @returns JSON string or fallback message
	 */
	const safeStringify = (obj: unknown): string => {
		try {
			return JSON.stringify(obj, null, 2)
		} catch {
			return '[Object with circular reference]'
		}
	}
	
	/**
	 * Call a specific tool
	 * 
	 * Executes an MCP tool by name with optional arguments.
	 * 
	 * @param name - Tool name to execute
	 * @param args - Optional arguments to pass to the tool
	 */
	const callTool = useCallback(async (
		name: string,
		args?: Record<string, unknown>
	): Promise<void> => {
		addMessage('user', `🔧 Calling tool: ${name}${args ? `\nArgs: ${safeStringify(args)}` : ''}`)
		
		try {
			const startTime = Date.now()
			const response = await sendJsonRpcRequest('tools/call', {
				name,
				arguments: args ?? {},
			})
			const duration = Date.now() - startTime
			
			if (response.error) {
				throw new Error(response.error.message)
			}
			
			const result = response.result as { content?: Array<{ type: string; text?: string }> }
			// Safely format the result, handling potential circular references
			const content = result?.content?.map(c => {
				if (c.text) { return c.text }
				try {
					return JSON.stringify(c)
				} catch {
					return '[Complex object]'
				}
			}).join('\n') ?? safeStringify(result)
			
			addMessage('assistant', content, { method: 'tools/call', toolName: name, duration })
			
		} catch (err) {
			const errorMsg = normalizeError(err).message || 'Tool call failed'
			addMessage('error', `❌ ${errorMsg}`)
		}
	}, [sendJsonRpcRequest, addMessage])
	
	/**
	 * Send a user message - parses commands or sends as prompt
	 */
	const sendMessage = useCallback(async (content: string): Promise<void> => {
		const trimmed = content.trim()
		if (!trimmed) { return }
		
		// Check for commands
		if (trimmed.startsWith('/')) {
			const [command, ...args] = trimmed.slice(1).split(' ')
			
			switch (command.toLowerCase()) {
				case 'tools':
				case 'list-tools':
					await listTools()
					return
					
				case 'resources':
				case 'list-resources':
					await listResources()
					return
					
			case 'call':
				if (args.length > 0) {
					const toolName = args[0]?.trim()
					// Guard: Empty tool name (e.g., "/call " with trailing space)
					if (!toolName) {
						addMessage('error', '❌ Tool name cannot be empty. Usage: /call <tool-name> [args-json]')
						return
					}
					let toolArgs: Record<string, unknown> | undefined
					if (args.length > 1) {
						try {
							const parsedArgs = JSON.parse(args.slice(1).join(' '))
							// Guard: Ensure args is an object (MCP spec requires object arguments)
							if (typeof parsedArgs !== 'object' || parsedArgs === null || Array.isArray(parsedArgs)) {
								addMessage('error', '❌ Arguments must be a JSON object. Usage: /call <tool-name> {"key": "value"}')
								return
							}
							toolArgs = parsedArgs as Record<string, unknown>
						} catch {
							addMessage('error', '❌ Invalid JSON arguments. Usage: /call <tool-name> {"key": "value"}')
							return
						}
					}
					await callTool(toolName, toolArgs)
				} else {
					addMessage('error', '❌ Usage: /call <tool-name> [args-json]')
				}
				return
					
				case 'connect':
				case 'init':
					await initialize()
					return
					
				case 'help':
					addMessage('system', `📚 **Available Commands:**
					
• \`/connect\` or \`/init\` - Initialize MCP connection
• \`/tools\` or \`/list-tools\` - List available tools
• \`/resources\` or \`/list-resources\` - List available resources
• \`/call <tool-name> [args]\` - Call a tool with optional JSON args
• \`/help\` - Show this help message

**Example:**
\`/call get_project_info\`
\`/call read_file {"path": "package.json"}\``)
					return
					
				default:
					addMessage('error', `❌ Unknown command: /${command}. Type /help for available commands.`)
					return
			}
		}
		
		// Regular message - try to interpret as a tool call or send as-is
		addMessage('user', trimmed)
		
		// If connected, try to find a matching tool
		if (status === 'connected' && tools.length > 0) {
			const inputLower = trimmed.toLowerCase()
			
			// Priority 1: Exact match (case-insensitive)
			let matchingTool = tools.find(t => t.name.toLowerCase() === inputLower)
			
			// Priority 2: Input starts with tool name followed by space (for potential args)
			// This prevents "get" matching "get_files" - requires word boundary
			matchingTool ??= tools.find(t => {
				const toolNameLower = t.name.toLowerCase()
				return inputLower.startsWith(toolNameLower + ' ')
			})
			
			if (matchingTool) {
				await callTool(matchingTool.name)
				return
			}
		}
		
		// Otherwise, show hint
		addMessage('system', `💡 Tip: Use /help to see available commands, or /tools to list available MCP tools.`)
		
	}, [status, tools, listTools, listResources, callTool, initialize, addMessage])
	
	/**
	 * Clear all messages
	 */
	const clearMessages = useCallback(() => {
		setMessages([])
	}, [])
	
	/**
	 * Cleanup on unmount
	 */
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [])
	
	return {
		messages,
		status,
		tools,
		resources,
		sendMessage,
		initialize,
		listTools,
		listResources,
		callTool,
		clearMessages,
		error,
		isAvailable,
	}
}

export default useMcpChat

