export interface Stock {
  id: string
  user_id: string
  ticker: string
  company_name: string
  purchase_price: number
  current_price: number | null
  quantity: number
  date_purchased: string
  emoji: string | null
  usd_ils_rate: number | null
  created_at: string
  updated_at: string
}

export interface InvestmentGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  icon: string | null
  color: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  role: 'parent' | 'child'
  parent_id: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Invitation {
  id: string
  parent_id: string
  child_name: string
  child_email: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
  expires_at: string
}

export interface PortfolioStats {
  totalValueUSD: number
  totalCostUSD: number
  totalGainUSD: number
  totalGainPercent: number
  totalShares: number
  stockCount: number
}

export interface Milestone {
  name: string
  description: string
  icon: string
  threshold: number
  type: 'shares' | 'value' | 'stocks'
  unlocked: boolean
}
