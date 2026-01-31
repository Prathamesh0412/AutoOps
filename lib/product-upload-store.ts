import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useDataStore } from './core/data-store'

export interface UploadedProductFile {
  id: string
  name: string
  type: string // MIME type
  size: number // bytes
  uploadTimestamp: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  selected: boolean
  error?: string
  processingProgress?: number
  recordsProcessed?: number
  totalRecords?: number
  parsedData?: any[]
}

export interface ParsedProductRecord {
  productName?: string
  sku?: string
  quantitySold?: number
  sellingPrice?: number
  costPrice?: number
  availableStock?: number
  orderDate?: string
  category?: string
  // Raw mapping for debugging
  _rawData?: any
  _mappingWarnings?: string[]
}

interface ProductUploadStore {
  // File management
  uploadedFiles: UploadedProductFile[]
  isUploading: boolean
  isProcessing: boolean
  
  // Actions
  setUploadedFiles: (files: UploadedProductFile[]) => void
  uploadFiles: (files: FileList) => Promise<void>
  removeFile: (id: string) => void
  toggleFileSelection: (id: string) => void
  selectAllFiles: (selected: boolean) => void
  
  // Processing
  processSelectedFiles: () => Promise<void>
  updateProcessingProgress: (fileId: string, progress: number, recordsProcessed?: number) => void
  completeFileProcessing: (fileId: string, success: boolean, error?: string, parsedData?: any[]) => void
  parseFileContent: (file: File) => Promise<ParsedProductRecord[]>
  mapFieldsToSchema: (data: any[], fileName: string) => ParsedProductRecord[]
  updateDatabaseWithParsedData: (parsedData: ParsedProductRecord[]) => Promise<void>
  simulateFileProcessing: (fileId: string) => Promise<void>
  generateMockParsedData: () => ParsedProductRecord[]
}

export const useProductUploadStore = create<ProductUploadStore>()(
  persist(
    (set, get) => ({
      // Initial state
      uploadedFiles: [],
      isUploading: false,
      isProcessing: false,

      // File management actions
      setUploadedFiles: (files) => set({ uploadedFiles: files }),

      uploadFiles: async (files: FileList) => {
        set({ isUploading: true })
        
        const newFiles: UploadedProductFile[] = []
        const errors: string[] = []
        const uploadBatchId = Date.now()
        const randomSuffix = Math.random().toString(36).substr(2, 9)

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileId = `prod_file_${uploadBatchId}_${randomSuffix}_${i}`
          
          // Validate file type
          const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json'
          ]
          
          if (!allowedTypes.includes(file.type)) {
            errors.push(`${file.name}: Unsupported file type`)
            continue
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            errors.push(`${file.name}: File too large (max 10MB)`)
            continue
          }

          newFiles.push({
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadTimestamp: new Date().toISOString(),
            status: 'uploading',
            selected: true,
            processingProgress: 0,
            recordsProcessed: 0,
            totalRecords: 0
          })
        }

        if (errors.length > 0) {
          console.error('Upload errors:', errors)
        }

        set(state => ({
          uploadedFiles: [...newFiles, ...state.uploadedFiles],
          isUploading: false
        }))

        // Simulate upload completion
        setTimeout(() => {
          set(state => ({
            uploadedFiles: state.uploadedFiles.map(file =>
              newFiles.find(nf => nf.id === file.id)
                ? { ...file, status: 'completed' }
                : file
            )
          }))
        }, 1000)
      },

      removeFile: (id: string) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.filter(file => file.id !== id)
        }))
      },

      toggleFileSelection: (id: string) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === id ? { ...file, selected: !file.selected } : file
          )
        }))
      },

      selectAllFiles: (selected: boolean) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file => ({ ...file, selected }))
        }))
      },

      // Processing actions
      processSelectedFiles: async () => {
        const { uploadedFiles } = get()
        const selectedFiles = uploadedFiles.filter(file => file.selected && file.status === 'completed')
        
        if (selectedFiles.length === 0) return

        set({ isProcessing: true })

        for (const file of selectedFiles) {
          try {
            // Update status to processing
            set(state => ({
              uploadedFiles: state.uploadedFiles.map(f =>
                f.id === file.id ? { ...f, status: 'processing', processingProgress: 0 } : f
              )
            }))

            // Get the actual file (in real app, this would come from file input)
            // For now, simulate processing
            await get().simulateFileProcessing(file.id)
            
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error)
            get().completeFileProcessing(file.id, false, error instanceof Error ? error.message : 'Unknown error')
          }
        }

        set({ isProcessing: false })
      },

      simulateFileProcessing: async (fileId: string) => {
        const totalSteps = 100
        const stepDelay = 50 // 50ms per step for smooth animation

        for (let step = 0; step <= totalSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDelay))
          get().updateProcessingProgress(fileId, step, Math.floor((step / 100) * 150))
        }

        // Generate mock parsed data
        const mockParsedData = get().generateMockParsedData()
        get().completeFileProcessing(fileId, true, undefined, mockParsedData)
      },

      generateMockParsedData: (): ParsedProductRecord[] => {
        // Simulate different types of business data
        const dataTypes = ['sales', 'inventory', 'products']
        const selectedType = dataTypes[Math.floor(Math.random() * dataTypes.length)]
        
        const baseRecords: ParsedProductRecord[] = []
        const recordCount = Math.floor(Math.random() * 50) + 20 // 20-70 records

        for (let i = 0; i < recordCount; i++) {
          const record: ParsedProductRecord = {
            productName: selectedType === 'products' ? `Product ${i + 1}` : `Item ${i + 1}`,
            sku: `SKU${String(i + 1).padStart(4, '0')}`,
            quantitySold: selectedType === 'sales' ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 20),
            sellingPrice: Math.floor(Math.random() * 5000) + 500, // ₹500-₹5500
            costPrice: Math.floor(Math.random() * 3000) + 200, // ₹200-₹3200
            availableStock: Math.floor(Math.random() * 500) + 50,
            orderDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            category: ['Clothing', 'Electronics', 'Home', 'Sports'][Math.floor(Math.random() * 4)],
            _mappingWarnings: []
          }

          // Add some mapping warnings for realism
          if (Math.random() > 0.8) {
            record._mappingWarnings?.push('Category field inferred from product name')
          }
          if (Math.random() > 0.9) {
            record._mappingWarnings?.push('Cost price estimated at 60% of selling price')
          }

          baseRecords.push(record)
        }

        return baseRecords
      },

      updateProcessingProgress: (fileId: string, progress: number, recordsProcessed?: number) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === fileId
              ? { 
                  ...file, 
                  processingProgress: progress,
                  recordsProcessed: recordsProcessed || file.recordsProcessed
                }
              : file
          )
        }))
      },

      completeFileProcessing: (fileId: string, success: boolean, error?: string, parsedData?: any[]) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === fileId
              ? { 
                  ...file, 
                  status: success ? 'completed' : 'error',
                  processingProgress: success ? 100 : file.processingProgress,
                  error: error,
                  parsedData: parsedData
                }
              : file
          )
        }))

        // If successful, update the database
        if (success && parsedData) {
          get().updateDatabaseWithParsedData(parsedData)
        }
      },

      parseFileContent: async (file: File): Promise<ParsedProductRecord[]> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string
              let rawData: any[] = []

              if (file.type === 'application/json') {
                rawData = JSON.parse(content)
                if (!Array.isArray(rawData)) {
                  rawData = [rawData]
                }
              } else if (file.type === 'text/csv') {
                // Simple CSV parsing (in real app, use a proper CSV library)
                const lines = content.split('\n').filter(line => line.trim())
                if (lines.length < 2) {
                  reject(new Error('CSV file must have header and data rows'))
                  return
                }
                
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                rawData = lines.slice(1).map(line => {
                  const values = line.split(',').map(v => v.trim())
                  const obj: any = {}
                  headers.forEach((header, index) => {
                    obj[header] = values[index] || ''
                  })
                  return obj
                })
              } else {
                // For Excel files, in real app would use a library like xlsx
                reject(new Error('Excel parsing not implemented in demo'))
                return
              }

              const mappedData = get().mapFieldsToSchema(rawData, file.name)
              resolve(mappedData)
            } catch (error) {
              reject(error)
            }
          }

          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsText(file)
        })
      },

      mapFieldsToSchema: (data: any[], fileName: string): ParsedProductRecord[] => {
        return data.map((row, index) => {
          const warnings: string[] = []
          const record: ParsedProductRecord = {
            _rawData: row,
            _mappingWarnings: warnings
          }

          // Product name mapping
          const nameFields = ['product name', 'product', 'name', 'title', 'item', 'description']
          record.productName = getFieldValue(row, nameFields) || `Product ${index + 1}`

          // SKU mapping
          const skuFields = ['sku', 'product id', 'id', 'code', 'product_code']
          record.sku = getFieldValue(row, skuFields) || `SKU${String(index + 1).padStart(4, '0')}`

          // Quantity mapping
          const quantityFields = ['quantity', 'qty', 'units sold', 'sold', 'sales', 'amount']
          record.quantitySold = getNumericValue(row, quantityFields) || Math.floor(Math.random() * 50) + 1

          // Selling price mapping
          const priceFields = ['price', 'selling price', 'unit price', 'rate', 'amount']
          record.sellingPrice = getNumericValue(row, priceFields) || Math.floor(Math.random() * 5000) + 500

          // Cost price mapping
          const costFields = ['cost', 'cost price', 'purchase price', 'buy price']
          record.costPrice = getNumericValue(row, costFields) || (record.sellingPrice * 0.6)

          // Stock mapping
          const stockFields = ['stock', 'inventory', 'available', 'quantity on hand', 'balance']
          record.availableStock = getNumericValue(row, stockFields) || Math.floor(Math.random() * 200) + 50

          // Date mapping
          const dateFields = ['date', 'order date', 'created', 'timestamp']
          const dateValue = getFieldValue(row, dateFields)
          record.orderDate = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString()

          // Category mapping
          const categoryFields = ['category', 'type', 'classification', 'group']
          record.category = getFieldValue(row, categoryFields) || 'Uncategorized'

          // Add warnings for missing critical fields
          if (!getFieldValue(row, nameFields)) {
            warnings.push('Product name inferred')
          }
          if (!getNumericValue(row, priceFields)) {
            warnings.push('Price estimated')
          }

          record._mappingWarnings = warnings
          return record
        })
      },

      updateDatabaseWithParsedData: async (parsedData: ParsedProductRecord[]) => {
        const dataStore = useDataStore.getState()
        const batchId = Date.now()
        const randomSuffix = Math.random().toString(36).substr(2, 9)
        
        // Group by product to aggregate sales data
        const productMap = new Map<string, any>()
        const orderMap = new Map<string, any[]>()

        parsedData.forEach((record, index) => {
          const productKey = record.sku || record.productName || `product_${index}`
          
          if (!productMap.has(productKey)) {
            productMap.set(productKey, {
              id: `prod_${batchId}_${randomSuffix}_${index}`,
              name: record.productName || `Product ${index + 1}`,
              sku: record.sku || `SKU${String(index + 1).padStart(4, '0')}`,
              category: record.category || 'Uncategorized',
              price: record.sellingPrice || 1000,
              cost: record.costPrice || 600,
              stock_quantity: record.availableStock || 100,
              sales_velocity: 0, // Will be calculated
              demand_score: 0, // Will be calculated
              profit_margin: 0, // Will be calculated
              reorder_threshold: 20,
              supplier_lead_time: 7,
              created_at: new Date().toISOString()
            })
          }

          // Create order records
          if (record.quantitySold && record.quantitySold > 0) {
            if (!orderMap.has(productKey)) {
              orderMap.set(productKey, [])
            }
            
            const product = productMap.get(productKey)
            if (!product) return // Skip if product wasn't created
            
            const revenue = record.quantitySold * product.price
            const profit = record.quantitySold * (product.price - product.cost)
            
            const orders = orderMap.get(productKey)
            if (orders) {
              orders.push({
                id: `order_${batchId}_${randomSuffix}_${index}`,
                customer_id: `cust_${Math.floor(Math.random() * 1000) + 1}`,
                product_id: product.id,
                quantity: record.quantitySold,
                revenue: revenue,
                profit: profit,
                status: 'completed',
                created_at: record.orderDate || new Date().toISOString()
              })
            }
          }
        })

        // Calculate derived metrics for products
        productMap.forEach((product, key) => {
          const orders = orderMap.get(key) || []
          const totalSold = orders.reduce((sum, order) => sum + order.quantity, 0)
          const totalRevenue = orders.reduce((sum, order) => sum + order.revenue, 0)
          const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0)
          
          product.sales_velocity = totalSold / 4 // Assume 4 weeks data
          product.profit_margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 40
          product.demand_score = Math.min(100, (totalSold / 10) * 10) // Simple demand scoring
        })

        // Update the data store
        const newProducts = Array.from(productMap.values())
        const newOrders = Array.from(orderMap.values()).flat()

        // Add products (checking for duplicates by SKU)
        newProducts.forEach(product => {
          const existingProduct = dataStore.products.find(p => p.sku === product.sku)
          if (existingProduct) {
            // Update existing product with new data, but keep the original ID
            dataStore.updateProduct(existingProduct.id, {
              name: product.name,
              category: product.category,
              price: product.price,
              cost: product.cost,
              stock_quantity: product.stock_quantity,
              // Keep existing calculated metrics, they will be updated below
            })
          } else {
            // Add new product with unique ID
            dataStore.addProduct(product)
          }
        })

        // Add new orders (with deduplication)
        const existingOrderIds = new Set(dataStore.orders.map(o => o.id))
        const uniqueNewOrders = newOrders.filter(order => !existingOrderIds.has(order.id))
        
        uniqueNewOrders.forEach(order => {
          dataStore.addOrder(order)
        })

        // Trigger insights regeneration
        dataStore.generateInsights()
        dataStore.updateMetrics()
      }
    }),
    {
      name: 'product-upload-storage',
      partialize: (state) => ({
        uploadedFiles: state.uploadFiles
      })
    }
  )
)

// Helper functions
function getFieldValue(row: any, possibleFields: string[]): string | undefined {
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      return String(row[field]).trim()
    }
  }
  return undefined
}

function getNumericValue(row: any, possibleFields: string[]): number | undefined {
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      const value = parseFloat(String(row[field]).replace(/[^0-9.-]/g, ''))
      if (!isNaN(value)) {
        return value
      }
    }
  }
  return undefined
}
