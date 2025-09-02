import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Subscription {
  org_id: string
  status: string
  plan: string | null
  created_at: string
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
  const isPro = subscription?.plan === 'pro'
  const isFree = subscription?.plan === 'free' || !subscription

  // Mock Stripe portal - just show an alert for now
  const openCustomerPortal = async () => {
    alert('Stripe Customer Portal would open here. This is a mock implementation.')
  }

  // Mock upgrade function
  const upgradeToPro = async () => {
    if (!orgId) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          org_id: orgId,
          status: 'active',
          plan: 'pro'
        })

      if (error) throw error
      
      alert('Successfully upgraded to Pro! (Mock implementation)')
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Error upgrading subscription')
    }
  }

  return {
    subscription,
    loading,
    error,
    isActive,
    isPastDue,
    isCanceled,
    isPro,
    isFree,
    openCustomerPortal,
    upgradeToPro
  }
}