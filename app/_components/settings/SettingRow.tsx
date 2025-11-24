/**
 * Setting Row Component
 * 
 * Renders individual setting items based on their type.
 * Uses type narrowing to provide type-safe rendering for each setting type.
 * 
 * **Supported Setting Types:**
 * - **select**: Dropdown/select input
 * - **toggle**: Checkbox/switch for boolean settings
 * - **button**: Action button for triggering actions
 * - **custom**: Fully custom React component for complex settings
 * 
 * @module SettingRow
 */

'use client'

import Button from '@_components/ui/Button'
import Select from '@_components/ui/Select'

import type { SettingItem } from '@_types/settings'

/**
 * Setting row component props interface.
 */
interface SettingRowProps {
	/**
	 * The setting item to render.
	 * Can be any of the setting types: select, toggle, button, or custom.
	 */
	setting: SettingItem
}

/**
 * Setting Row Component
 * 
 * Flexible component that renders different types of settings based on
 * the setting's type discriminator. Uses type narrowing to provide
 * type-safe rendering for each setting type.
 * 
 * **Layout:**
 * Each setting row displays:
 * - Left side: Label and optional description
 * - Right side: Setting control (select, checkbox, button, or custom component)
 * 
 * **Custom Settings:**
 * Custom settings have full control over their layout. The label and
 * description are handled by the custom component itself.
 * 
 * @param props - Setting row component props
 * @returns Rendered setting row based on setting type
 */
export default function SettingRow({ setting }: SettingRowProps) {
	const renderSetting = () => {
		switch (setting.type) {
			case 'select': {
				const selectSetting = setting as Extract<SettingItem, { type: 'select' }>
				return (
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 px-4 sm:px-6">
						<div className="flex-1 min-w-0">
							<label className="block text-sm md:text-base font-medium text-base-content mb-1">
								{selectSetting.label}
							</label>
							{selectSetting.description && (
								<p className="text-xs sm:text-sm text-base-content/70">{selectSetting.description}</p>
							)}
						</div>
						<div className="shrink-0 w-full sm:w-auto">
							<Select
								value={selectSetting.value}
								onChange={(e) => selectSetting.onChange(e.target.value)}
								options={selectSetting.options}
								placeholder={selectSetting.placeholder}
								width="full"
								size="sm"
								className="sm:!w-44"
							/>
						</div>
					</div>
				)
			}

			case 'toggle': {
				const toggleSetting = setting as Extract<SettingItem, { type: 'toggle' }>
				return (
					<div className="flex items-center justify-between gap-4 py-4 px-4 sm:px-6">
						<div className="flex-1 min-w-0">
							<label className="block text-sm md:text-base font-medium text-base-content mb-1">
								{toggleSetting.label}
							</label>
							{toggleSetting.description && (
								<p className="text-xs sm:text-sm text-base-content/70">{toggleSetting.description}</p>
							)}
						</div>
						<div className="shrink-0">
							<input
								type="checkbox"
								className="toggle toggle-primary toggle-sm sm:toggle-md"
								checked={toggleSetting.checked}
								onChange={(e) => toggleSetting.onChange(e.target.checked)}
								aria-label={toggleSetting.label}
							/>
						</div>
					</div>
				)
			}

			case 'button': {
				const buttonSetting = setting as Extract<SettingItem, { type: 'button' }>
				return (
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 px-4 sm:px-6">
						<div className="flex-1 min-w-0">
							<label className="block text-sm md:text-base font-medium text-base-content mb-1">
								{buttonSetting.label}
							</label>
							{buttonSetting.description && (
								<p className="text-xs sm:text-sm text-base-content/70">{buttonSetting.description}</p>
							)}
						</div>
						<div className="shrink-0 w-full sm:w-auto">
							<Button
								onClick={buttonSetting.onClick}
								variant={buttonSetting.variant || 'primary'}
								size="sm"
								className="w-full sm:w-auto"
							>
								{buttonSetting.label}
							</Button>
						</div>
					</div>
				)
			}

		case 'custom': {
			const customSetting = setting as Extract<SettingItem, { type: 'custom' }>
			const CustomComponent = customSetting.component
			// For custom components, the label and description are handled by the component itself
			// This allows for more flexible layouts
			return <div><CustomComponent /></div>
		}

			default:
				return null
		}
	}

	return <div className="setting-row">{renderSetting()}</div>
}

