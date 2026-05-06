export function useUpdateTheme() {
  return {
    mutate: (theme: any) => {
      console.log('Updating theme:', theme)
    },
    isLoading: false,
  }
}


