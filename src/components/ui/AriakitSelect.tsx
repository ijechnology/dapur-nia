import React from 'react'
import * as Ariakit from '@ariakit/react'
import { ChevronDown, Check } from 'lucide-react'
import './ariakit-select.css'

export interface AriakitSelectOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

interface AriakitSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: AriakitSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  id?: string
}

export const AriakitSelect: React.FC<AriakitSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih pilihan...',
  disabled = false,
  className = '',
  required = false,
  id,
}) => {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={`ariakit-select-wrapper ${className}`}>
      <Ariakit.SelectProvider
        value={value}
        setValue={(val) => {
          if (typeof val === 'string') {
            onChange(val)
          }
        }}
      >
        {label && (
          <Ariakit.SelectLabel className="ariakit-select-label flex items-center gap-1">
            {label} {required && <span className="text-destructive">*</span>}
          </Ariakit.SelectLabel>
        )}

        <Ariakit.Select
          id={id}
          disabled={disabled}
          className="ariakit-select-button font-medium"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
        </Ariakit.Select>

        <Ariakit.SelectPopover
          gutter={4}
          sameWidth
          className="ariakit-select-popover border border-border shadow-xl backdrop-blur-md"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <Ariakit.SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="ariakit-select-item"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[10px] opacity-70 truncate">
                      {opt.description}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-auto" />}
              </Ariakit.SelectItem>
            )
          })}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  )
}
