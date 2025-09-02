import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Subscription {
  org_id: string
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: string | null
  current_period_end: string | null
  updated_at: string
}

export const useSubscription = (orgId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('org_id', orgId)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error
        }

        setSubscription(data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        setSubscription(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()

    // Subscribe to real-time changes
    const subscription_channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `org_id=eq.${orgId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setSubscription(null)
          } else {
            setSubscription(payload.new as Subscription)
          }
        }
      )
      .subscribe()

    return () => {
      subscription_channel.unsubscribe()
    }
  }, [orgId])

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled' || !subscription

  const openCustomerPortal = async () => {
    if (!orgId) return

    try {
      const response = await fetch('/api/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          return_url: window.location.origin + '/dashboard'
        })
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    }
  }

  return {
    subscription,
    loading,
    error,
    isActive,
    isPastDue,
    isCanceled,
    openCustomerPortal
  }
}