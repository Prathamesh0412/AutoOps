import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UploadedFile {
  id: string
  name: string
  type: string // MIME type
  size: number // bytes
  uploadTimestamp: string
  status: 'uploaded' | 'analyzing' | 'completed' | 'failed'
  selected: boolean
  error?: string
  analysisProgress?: number
  recordsProcessed?: number
  totalRecords?: number
}

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
  // File management
  uploadedFiles: UploadedFile[]
  dataSources: DataSource[]
  isLoading: boolean
  isUploading: boolean
  isAnalyzing: boolean
  
  // Actions
  setUploadedFiles: (files: UploadedFile[]) => void
  uploadFiles: (files: FileList) => Promise<void>
  removeFile: (id: string) => void
  toggleFileSelection: (id: string) => void
  selectAllFiles: (selected: boolean) => void
  
  // Analysis
  analyzeSelectedFiles: () => Promise<void>
  updateAnalysisProgress: (fileId: string, progress: number, recordsProcessed?: number) => void
  completeFileAnalysis: (fileId: string, success: boolean, error?: string) => void
  simulateFileAnalysis: (fileId: string) => Promise<void>
  addDataSourceFromFile: (fileId: string) => void
  
  // Legacy compatibility
  setDataSources: (sources: DataSource[]) => void
  uploadData: (type: DataSource['type']) => Promise<void>
  updateProgress: (id: string, progress: number) => void
  completeProcessing: (id: string) => void
  simulateRealTimeUpdates: () => void
}

const SUPPORTED_FILE_TYPES = {
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/pdf': 'pdf',
  'text/plain': 'txt'
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

export const useDataAnalysisStore = create<DataAnalysisStore>()(
  persist(
    (set, get) => ({
      uploadedFiles: [],
      dataSources: generateMockDataSources(),
      isLoading: false,
      isUploading: false,
      isAnalyzing: false,

      setUploadedFiles: (files) => set({ uploadedFiles: files }),

      uploadFiles: async (files: FileList) => {
        set({ isUploading: true })
        
        const newFiles: UploadedFile[] = []
        const errors: string[] = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]
          
          if (!fileType) {
            errors.push(`Unsupported file type: ${file.name}`)
            continue
          }

          const uploadedFile: UploadedFile = {
            id: `file_${Date.now()}_${i}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadTimestamp: new Date().toISOString(),
            status: 'uploaded',
            selected: true
          }
          
          newFiles.push(uploadedFile)
        }

        if (errors.length > 0) {
          console.error('Upload errors:', errors)
        }

        set(state => ({
          uploadedFiles: [...newFiles, ...state.uploadedFiles],
          isUploading: false
        }))
      },

      removeFile: (id: string) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.filter(file => file.id !== id)
        }))
      },

      toggleFileSelection: (id) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === id ? { ...file, selected: !file.selected } : file
          )
        }))
      },

      selectAllFiles: (selected) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file => ({ ...file, selected }))
        }))
      },

      analyzeSelectedFiles: async () => {
        const { uploadedFiles } = get()
        const selectedFiles = uploadedFiles.filter(file => file.selected && file.status === 'uploaded')
        
        if (selectedFiles.length === 0) return

        set({ isAnalyzing: true })

        // Update status to analyzing for selected files
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.selected && file.status === 'uploaded'
              ? { ...file, status: 'analyzing', analysisProgress: 0, recordsProcessed: 0 }
              : file
          )
        }))

        // Simulate analysis for each file
        for (const file of selectedFiles) {
          try {
            await get().simulateFileAnalysis(file.id)
          } catch (error) {
            get().completeFileAnalysis(file.id, false, error instanceof Error ? error.message : 'Analysis failed')
          }
        }

        set({ isAnalyzing: false })
      },

      simulateFileAnalysis: async (fileId: string) => {
        const totalRecords = Math.floor(Math.random() * 5000) + 1000
        let recordsProcessed = 0
        let progress = 0

        const interval = setInterval(() => {
          recordsProcessed += Math.floor(Math.random() * 100) + 50
          progress = Math.min(100, (recordsProcessed / totalRecords) * 100)
          
          get().updateAnalysisProgress(fileId, progress, recordsProcessed)
          
          if (progress >= 100) {
            clearInterval(interval)
            get().completeFileAnalysis(fileId, true)
            
            // Update main data sources to reflect analysis
            get().addDataSourceFromFile(fileId)
          }
        }, 300 + Math.random() * 200) // 300-500ms intervals
      },

      updateAnalysisProgress: (fileId: string, progress: number, recordsProcessed?: number) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === fileId
              ? { 
                  ...file, 
                  analysisProgress: progress,
                  recordsProcessed: recordsProcessed || file.recordsProcessed
                }
              : file
          )
        }))
      },

      completeFileAnalysis: (fileId: string, success: boolean, error?: string) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === fileId
              ? { 
                  ...file, 
                  status: success ? 'completed' : 'failed',
                  analysisProgress: success ? 100 : file.analysisProgress,
                  error: error
                }
              : file
          )
        }))
      },

      addDataSourceFromFile: (fileId: string) => {
        const { uploadedFiles } = get()
        const file = uploadedFiles.find(f => f.id === fileId)
        
        if (!file) return

        const types = ['customer_database', 'sales_records', 'email_campaigns'] as const
        const randomType = types[Math.floor(Math.random() * types.length)]
        
        const newDataSource: DataSource = {
          id: `ds_${fileId}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          type: randomType,
          status: 'completed',
          records_count: file.recordsProcessed || Math.floor(Math.random() * 5000) + 1000,
          last_processed: new Date().toISOString(),
          progress: 100
        }

        set(state => ({
          dataSources: [newDataSource, ...state.dataSources]
        }))
      },

      // Legacy compatibility methods
      setDataSources: (sources) => set({ dataSources: sources }),

      uploadData: async (type: DataSource['type']) => {
        set({ isUploading: true })
        
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
    }),
    {
      name: 'data-analysis-storage',
      partialize: (state) => ({ uploadedFiles: state.uploadedFiles })
    }
  )
)
