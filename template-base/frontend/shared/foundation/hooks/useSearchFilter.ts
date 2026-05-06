"use client"

import { useState, useMemo } from "react"

/**
 * useSearchFilter - Generic search filtering hook
 *
 * Provides search state and filtered results for any list of items
 *
 * @param items - Array of items to filter
 * @param searchKeys - Key(s) to search in (e.g., 'name' or ['name', 'email'])
 * @param caseSensitive - Whether search should be case-sensitive (default: false)
 *
 * @example
 * ```tsx
 * const chats = [{ name: 'Alice' }, { name: 'Bob' }]
 * const { query, setQuery, filteredItems } = useSearchFilter(chats, 'name')
 *
 * return (
 *   <>
 *     <input value={query} onChange={e => setQuery(e.target.value)} />
 *     {filteredItems.map(chat => <div>{chat.name}</div>)}
 *   </>
 * )
 * ```
 */
export function useSearchFilter<T extends Record<string, any>>(
  items: T[],
  searchKeys: keyof T | (keyof T)[],
  caseSensitive = false
) {
  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items
    }

    const searchValue = caseSensitive ? query : query.toLowerCase()
    const keys = Array.isArray(searchKeys) ? searchKeys : [searchKeys]

    return items.filter((item) => {
      return keys.some((key) => {
        const value = item[key]
        if (value === null || value === undefined) return false

        const stringValue = String(value)
        const compareValue = caseSensitive
          ? stringValue
          : stringValue.toLowerCase()

        return compareValue.includes(searchValue)
      })
    })
  }, [items, query, searchKeys, caseSensitive])

  const clearSearch = () => setQuery("")

  return {
    /** Current search query */
    query,
    /** Update search query */
    setQuery,
    /** Filtered items based on query */
    filteredItems,
    /** Clear the search query */
    clearSearch,
    /** Whether a search is active */
    isSearching: query.trim().length > 0,
    /** Number of results after filtering */
    resultCount: filteredItems.length,
  }
}
