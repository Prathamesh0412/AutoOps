import { create } from 'zustand'

export interface DataSource {
  id: string
  name: string
  type: 'customer_database' | 'sales_records' | 'email_campaigns' | 'invoice' | 'review' | 'sales_log'
  status: 'processing' | 'completed' | 'error'
  records_count: number
  last_processed: string | null
  progress: number
}

interface DataAnalysisStore {
  dataSources: DataSource[]
  isLoading: boolean
  isUploading: boolean
  
  // Actions
  setDataSources: (sources: DataSource[]) => void
  uploadData: (type: DataSource['type']) => Promise<void>
  updateProgress: (id: string, progress: number) => void
  completeProcessing: (id: string) => void
  simulateRealTimeUpdates: () => void
}

const generateMockDataSources = (): DataSource[] => [
  {
    id: '1',
    name: 'Customer Database',
    type: 'customer_database',
    status: 'completed',
    records_count: 15420,
    last_processed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    progress: 100
  },
  {
    id: '2', 
    name: 'Sales Records',
    type: 'sales_records',
    status: 'processing',
    records_count: 8934,
    last_processed: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    progress: 65
  },
  {
    id: '3',
    name: 'Email Campaigns', 
    type: 'email_campaigns',
    status: 'completed',
    records_count: 2567,
    last_processed: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    progress: 100
  }
]

export const useDataAnalysisStore = create<DataAnalysisStore>((set, get) => ({
  dataSources: generateMockDataSources(),
  isLoading: false,
  isUploading: false,

  setDataSources: (sources) => set({ dataSources: sources }),

  uploadData: async (type: DataSource['type']) => {
    set({ isUploading: true })
    
    // Simulate file upload and processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newSource: DataSource = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} ${new Date().toLocaleDateString()}`,
      type,
      status: 'processing',
      records_count: Math.floor(Math.random() * 10000) + 1000,
      last_processed: null,
      progress: 0
    }

    set(state => ({
      dataSources: [newSource, ...state.dataSources],
      isUploading: false
    }))

    // Simulate processing progress
    const interval = setInterval(() => {
      const { dataSources } = get()
      const source = dataSources.find(s => s.id === newSource.id)
      
      if (source && source.status === 'processing') {
        const newProgress = Math.min(100, source.progress + Math.random() * 15 + 5)
        get().updateProgress(newSource.id, newProgress)
        
        if (newProgress >= 100) {
          clearInterval(interval)
          get().completeProcessing(newSource.id)
        }
      } else {
        clearInterval(interval)
      }
    }, 1000)
  },

  updateProgress: (id: string, progress: number) => {
    set(state => ({
      dataSources: state.dataSources.map(source =>
        source.id === id
          ? { ...source, progress, status: progress >= 100 ? 'completed' : 'processing' }
          : source
      )
    }))
  },

  completeProcessing: (id: string) => {
    set(state => ({
      dataSources: state.dataSources.map(source =>
        source.id === id
          ? { 
              ...source, 
              status: 'completed' as const,
              progress: 100,
              last_processed: new Date().toISOString()
            }
          : source
      )
    }))
  },

  simulateRealTimeUpdates: () => {
    // Simulate occasional progress updates for processing items
    const interval = setInterval(() => {
      const { dataSources } = get()
      const processingSources = dataSources.filter(s => s.status === 'processing')
      
      if (processingSources.length > 0) {
        const randomSource = processingSources[Math.floor(Math.random() * processingSources.length)]
        const newProgress = Math.min(100, randomSource.progress + Math.random() * 10 + 2)
        get().updateProgress(randomSource.id, newProgress)
      }
    }, 3000)

    return () => clearInterval(interval)
  }
}))
