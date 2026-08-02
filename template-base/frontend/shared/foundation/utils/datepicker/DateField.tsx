"use client"

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form"
import { format, parseISO } from "date-fns"
import { SharedDatePicker, type SharedDatePickerProps } from "./SharedDatePicker"

export interface DateFieldProps<TFieldValues extends FieldValues>
  extends Omit<SharedDatePickerProps, "date" | "onChange"> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  dateFormat?: string
}

/**
 * react-hook-form-aware wrapper around <SharedDatePicker>.
 * Stores the value as a date-fns-formatted string (default: "yyyy-MM-dd"),
 * matching the storage shape most form schemas expect.
 */
export function DateField<TFieldValues extends FieldValues>({
  name,
  control,
  dateFormat = "yyyy-MM-dd",
  ...pickerProps
}: DateFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const raw = field.value as string | undefined | null
        const date = raw ? parseISO(raw) : undefined
        return (
          <SharedDatePicker
            {...pickerProps}
            date={date}
            onChange={(d) => field.onChange(d ? format(d, dateFormat) : "")}
          />
        )
      }}
    />
  )
}
