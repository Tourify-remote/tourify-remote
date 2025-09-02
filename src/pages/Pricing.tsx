import React from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useOrganization } from '../auth/OrganizationProvider'
import { useSubscription } from '../hooks/useSubscription'
import { Check } from 'lucide-react'

export const Pricing: React.FC = () => {
  const { user } = useAuth()
  const { currentOrg } = useOrganization()
  const { upgradeToPro, isPro, isFree } = useSubscription(currentOrg?.id || null)

  const handleUpgrade = async () => {
    if (!user || !currentOrg) return
    await upgradeToPro()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Professional remote supervision tools for Metro de Santiago
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for trying out Tourify Remote
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button
                disabled
                className="mt-8 block w-full bg-gray-300 border border-gray-300 rounded-md py-2 text-sm font-semibold text-gray-500 text-center cursor-not-allowed"
              >
                {isFree ? 'Current Plan' : 'Free Plan'}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                What&apos;s included
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">1 organization</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Up to 5 sites</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Basic 360° viewer</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">AI-powered reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border border-metro-blue rounded-lg shadow-sm divide-y divide-gray-200 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-metro-blue text-white">
                Most Popular
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">
                Full-featured remote supervision platform
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$99</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button
                onClick={handleUpgrade}
                disabled={isPro}
                className="mt-8 block w-full bg-metro-blue border border-metro-blue rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-metro-light-blue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPro ? 'Current Plan' : 'Upgrade to Pro (Mock)'}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                Everything in Free, plus
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Unlimited sites</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Live video communication</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Interactive annotations</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Advanced AI features</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Team collaboration</span>
                </li>
                <li className="flex space-x-3">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}