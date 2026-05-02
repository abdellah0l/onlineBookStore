
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'

export default function SearchBar({
  placeholder = "",
  onSearch,
  onClear,
  initialValue = "",
  className = ""
}) {
  const [query, setQuery] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)
  
  // Debounce search to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300)

  const handleSearch = (searchQuery) => {
    setIsSearching(true)
    onSearch(searchQuery.trim())
    // Reset searching state after a short delay
    setTimeout(() => setIsSearching(false), 1000)
  }

  const handleClear = () => {
    setQuery("")
    onClear?.()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(query)
  }

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearch(debouncedQuery)
    }
  }, [debouncedQuery, handleSearch, initialValue])

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20 h-10"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={!query.trim() || isSearching}
            className="h-6 px-3"
          >
            {isSearching ? (
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}