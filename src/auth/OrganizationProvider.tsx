import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

interface Organization {
  id: string
  name: string
  created_at: string
}

interface Membership {
  user_id: string
  org_id: string
  role: string
}

interface OrganizationContextType {
  currentOrg: Organization | null
  organizations: Organization[]
  memberships: Membership[]
  loading: boolean
  switchOrganization: (orgId: string) => void
  createOrganization: (name: string) => Promise<Organization>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export const useOrganization = () => {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: React.ReactNode
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserOrganizations()
    } else {
      setCurrentOrg(null)
      setOrganizations([])
      setMemberships([])
      setLoading(false)
    }
  }, [user])

  const loadUserOrganizations = async () => {
    if (!user) return

    try {
      // Get user's memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)

      if (membershipError) throw membershipError

      setMemberships(membershipData || [])

      if (membershipData && membershipData.length > 0) {
        // Get organizations for these memberships
        const orgIds = membershipData.map(m => m.org_id)
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds)

        if (orgError) throw orgError

        setOrganizations(orgData || [])

        // Set current org from localStorage or first org
        const savedOrgId = localStorage.getItem('currentOrgId')
        const targetOrg = orgData?.find(org => org.id === savedOrgId) || orgData?.[0]
        if (targetOrg) {
          setCurrentOrg(targetOrg)
        }
      } else {
        // User has no organizations, create one
        await createFirstOrganization()
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFirstOrganization = async () => {
    if (!user) return

    try {
      const orgName = `${user.email?.split('@')[0] || 'User'}'s Organization`
      const newOrg = await createOrganization(orgName)
      setCurrentOrg(newOrg)
    } catch (error) {
      console.error('Error creating first organization:', error)
    }
  }

  const createOrganization = async (name: string): Promise<Organization> => {
    if (!user) throw new Error('User not authenticated')

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name })
      .select()
      .single()

    if (orgError) throw orgError

    // Create membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: user.id,
        org_id: orgData.id,
        role: 'owner'
      })

    if (membershipError) throw membershipError

    // Create free subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        org_id: orgData.id,
        status: 'active',
        plan: 'free'
      })

    if (subscriptionError) throw subscriptionError

    // Update local state
    setOrganizations(prev => [...prev, orgData])
    setMemberships(prev => [...prev, { user_id: user.id, org_id: orgData.id, role: 'owner' }])

    return orgData
  }

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrg(org)
      localStorage.setItem('currentOrgId', orgId)
    }
  }

  const value = {
    currentOrg,
    organizations,
    memberships,
    loading,
    switchOrganization,
    createOrganization,
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}