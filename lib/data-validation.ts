import { useUnifiedStore } from './unified-store'
import { globalEvents, DATA_EVENTS } from './realtime-sync'

// Data validation rules
interface ValidationRule {
  field: string
  validate: (value: any) => boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
}

// Customer validation rules
const customerValidationRules: ValidationRule[] = [
  {
    field: 'email',
    validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    message: 'Invalid email format',
    severity: 'error'
  },
  {
    field: 'ltv',
    validate: (ltv: number) => ltv >= 0,
    message: 'LTV cannot be negative',
    severity: 'error'
  },
  {
    field: 'engagement_score',
    validate: (score: number) => score >= 0 && score <= 100,
    message: 'Engagement score must be between 0 and 100',
    severity: 'error'
  },
  {
    field: 'churn_risk',
    validate: (risk: number) => risk >= 0 && risk <= 1,
    message: 'Churn risk must be between 0 and 1',
    severity: 'error'
  }
]

// Product validation rules
const productValidationRules: ValidationRule[] = [
  {
    field: 'price',
    validate: (price: number) => price > 0,
    message: 'Price must be greater than 0',
    severity: 'error'
  },
  {
    field: 'cost',
    validate: (cost: number) => cost >= 0,
    message: 'Cost cannot be negative',
    severity: 'error'
  },
  {
    field: 'stock_quantity',
    validate: (quantity: number) => quantity >= 0,
    message: 'Stock quantity cannot be negative',
    severity: 'error'
  },
  {
    field: 'profit_margin',
    validate: (margin: number) => margin >= 0 && margin <= 100,
    message: 'Profit margin must be between 0 and 100',
    severity: 'warning'
  }
]

// Order validation rules
const orderValidationRules: ValidationRule[] = [
  {
    field: 'quantity',
    validate: (quantity: number) => quantity > 0,
    message: 'Quantity must be greater than 0',
    severity: 'error'
  },
  {
    field: 'revenue',
    validate: (revenue: number) => revenue >= 0,
    message: 'Revenue cannot be negative',
    severity: 'error'
  },
  {
    field: 'profit',
    validate: (profit: number) => profit >= 0,
    message: 'Profit cannot be negative',
    severity: 'warning'
  }
]

// Validate a single object against rules
function validateObject(obj: any, rules: ValidationRule[]): ValidationResult {
  const errors = []

  for (const rule of rules) {
    const value = obj[rule.field]
    if (!rule.validate(value)) {
      errors.push({
        field: rule.field,
        message: rule.message,
        severity: rule.severity
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Cross-data consistency checks
interface ConsistencyCheck {
  name: string
  check: (data: any) => boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

const consistencyChecks: ConsistencyCheck[] = [
  {
    name: 'order_customer_consistency',
    check: ({ customers, orders }: { customers: any[], orders: any[] }) => {
      return orders.every((order: any) => 
        customers.some((customer: any) => customer.id === order.customer_id)
      )
    },
    message: 'Some orders reference non-existent customers',
    severity: 'error'
  },
  {
    name: 'order_product_consistency',
    check: ({ products, orders }: { products: any[], orders: any[] }) => {
      return orders.every((order: any) => 
        products.some((product: any) => product.id === order.product_id)
      )
    },
    message: 'Some orders reference non-existent products',
    severity: 'error'
  },
  {
    name: 'profit_margin_consistency',
    check: ({ products }: { products: any[] }) => {
      return products.every((product: any) => {
        const expectedMargin = ((product.price - product.cost) / product.price) * 100
        return Math.abs(expectedMargin - product.profit_margin) < 0.01
      })
    },
    message: 'Product profit margins do not match price and cost',
    severity: 'warning'
  },
  {
    name: 'low_stock_alert',
    check: ({ products }: { products: any[] }) => {
      const lowStockProducts = products.filter((p: any) => p.stock_quantity <= p.reorder_threshold)
      return lowStockProducts.length === 0
    },
    message: 'Some products are below reorder threshold',
    severity: 'warning'
  }
]

// Main data validation function
export function validateDataConsistency(): ValidationResult {
  const state = useUnifiedStore.getState()
  const { customers, products, orders } = state
  const allErrors: any[] = []

  // Validate individual objects
  customers.forEach(customer => {
    const result = validateObject(customer, customerValidationRules)
    if (!result.isValid) {
      allErrors.push(...result.errors.map(error => ({
        ...error,
        field: `customer.${customer.id}.${error.field}`
      })))
    }
  })

  products.forEach(product => {
    const result = validateObject(product, productValidationRules)
    if (!result.isValid) {
      allErrors.push(...result.errors.map(error => ({
        ...error,
        field: `product.${product.id}.${error.field}`
      })))
    }
  })

  orders.forEach(order => {
    const result = validateObject(order, orderValidationRules)
    if (!result.isValid) {
      allErrors.push(...result.errors.map(error => ({
        ...error,
        field: `order.${order.id}.${error.field}`
      })))
    }
  })

  // Run consistency checks
  consistencyChecks.forEach(check => {
    if (!check.check(state)) {
      allErrors.push({
        field: check.name,
        message: check.message,
        severity: check.severity
      })
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

// Hook for real-time data validation
export function useDataValidation() {
  const validateAndNotify = () => {
    const result = validateDataConsistency()
    
    if (!result.isValid) {
      result.errors.forEach(error => {
        globalEvents.emit('data:validation_error', error)
      })
    }
    
    return result
  }

  return {
    validateData: validateAndNotify,
    validationErrors: validateDataConsistency().errors
  }
}

// Auto-validation hook
export function useAutoValidation(enabled: boolean = true) {
  const { validateData } = useDataValidation()

  // Listen for data changes and validate automatically
  const validateOnDataChange = () => {
    setTimeout(validateData, 100) // Debounce validation
  }

  // Set up listeners for data changes
  const setupValidationListeners = () => {
    if (!enabled) return

    globalEvents.on(DATA_EVENTS.CUSTOMER_UPDATED, validateOnDataChange)
    globalEvents.on(DATA_EVENTS.PRODUCT_UPDATED, validateOnDataChange)
    globalEvents.on(DATA_EVENTS.ORDER_UPDATED, validateOnDataChange)
    globalEvents.on(DATA_EVENTS.ACTION_EXECUTED, validateOnDataChange)
  }

  return {
    setupValidationListeners,
    validateData
  }
}
