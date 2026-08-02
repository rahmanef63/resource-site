"use client"

import * as React from "react"

interface MobileChromeTitleContextValue {
  hasContentHeader: boolean
  registerContentHeader: () => () => void
}

const MobileChromeTitleContext = React.createContext<MobileChromeTitleContextValue | null>(null)

export function MobileChromeTitleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [registrationCount, setRegistrationCount] = React.useState(0)

  const registerContentHeader = React.useCallback(() => {
    setRegistrationCount((current) => current + 1)

    return () => {
      setRegistrationCount((current) => Math.max(0, current - 1))
    }
  }, [])

  const value = React.useMemo<MobileChromeTitleContextValue>(() => ({
    hasContentHeader: registrationCount > 0,
    registerContentHeader,
  }), [registerContentHeader, registrationCount])

  return (
    <MobileChromeTitleContext.Provider value={value}>
      {children}
    </MobileChromeTitleContext.Provider>
  )
}

export function useHasMobileContentHeader() {
  return React.useContext(MobileChromeTitleContext)?.hasContentHeader ?? false
}

export function useRegisterMobileContentHeader(enabled = true) {
  const context = React.useContext(MobileChromeTitleContext)

  React.useEffect(() => {
    if (!context || !enabled) return
    return context.registerContentHeader()
  }, [context, enabled])
}
