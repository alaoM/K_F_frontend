'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Save, Loader2, Trash2, Star } from 'lucide-react'
import { toast } from 'react-toastify'
import { useApi } from '@/hooks/useApi'

/* ================= TYPES ================= */
type Bank = {
  name: string
  code: string
}

type SavedBank = {
  id: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
  isPrimary: boolean
}

type WalletData = {
  availableBalance: number
  pendingBalance: number
}

/* ================= COMPONENT ================= */
const PaymentSettings = () => {
  const fetcher = useApi()

  const [banksList, setBanksList] = useState<Bank[]>([])
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([])
  const [wallet, setWallet] = useState<WalletData | null>(null)

  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const [isAddBankOpen, setIsAddBankOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  const [newBank, setNewBank] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
  })

  const [withdrawAmount, setWithdrawAmount] = useState('')

  /* ================= SAFE FETCH ================= */
  const safeFetch = async <T,>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    const res = await fetcher(url, options)

    if (!res?.success) {
      throw new Error(res?.message || 'Something went wrong')
    }

    return res.data as T
  }

  /* ================= API ================= */
  const api = {
    getBanks: () => safeFetch<Bank[]>('/api/payments/banks'),
    getSavedBanks: () => safeFetch<SavedBank[]>('/api/sellers/banks'),
    getWallet: () => safeFetch<WalletData>('/api/wallet/balance'),

    resolveAccount: (account: string, bank: string) =>
      safeFetch<{ account_name: string }>(
        `/api/payments/resolve?account=${account}&bank=${bank}`
      ),

    createBank: (payload: any) =>
      safeFetch<SavedBank>('/api/sellers/banks', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    deleteBank: (id: string) =>
      safeFetch(`/api/sellers/banks/${id}`, { method: 'DELETE' }),

    setPrimary: (id: string) =>
      safeFetch(`/api/sellers/banks/${id}`, { method: 'PATCH' }),

    withdraw: (payload: { amount: number; bankAccountId: string }) =>
      safeFetch('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  }

  /* ================= LOAD ================= */
  const loadInitialData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [banks, userBanks, walletData] = await Promise.all([
        api.getBanks(),
        api.getSavedBanks(),
        api.getWallet(),
      ])

      setBanksList(banks)
      setSavedBanks(userBanks)
      setWallet(walletData)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  /* ================= ACCOUNT RESOLVE ================= */
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (newBank.accountNumber.length !== 10 || !newBank.bankCode) return

      setVerifying(true)

      try {
        const res = await api.resolveAccount(
          newBank.accountNumber,
          newBank.bankCode
        )

        setNewBank((prev) => ({
          ...prev,
          accountName: res.account_name,
        }))
      } catch {
        setNewBank((prev) => ({ ...prev, accountName: '' }))
      } finally {
        setVerifying(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [newBank.accountNumber, newBank.bankCode])

  /* ================= HANDLERS ================= */

  const handleAddBank = async () => {
    const selectedBank = banksList.find(
      (b) => b.code === newBank.bankCode
    )

    if (!selectedBank) return toast.error('Select a bank')
    if (!newBank.accountName) return toast.error('Invalid account')

    setSaving(true)

    try {
      const created = await api.createBank({
        bankName: selectedBank.name,
        bankCode: newBank.bankCode,
        accountNumber: newBank.accountNumber,
        accountName: newBank.accountName,
      })

      setSavedBanks((prev) => [...prev, created])
      setIsAddBankOpen(false)

      setNewBank({
        bankCode: '',
        accountNumber: '',
        accountName: '',
      })

      toast.success('Bank linked')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Remove bank?')) return

    try {
      await api.deleteBank(id)
      setSavedBanks((prev) => prev.filter((b) => b.id !== id))
      toast.success('Removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      await api.setPrimary(id)

      setSavedBanks((prev) =>
        prev.map((b) => ({
          ...b,
          isPrimary: b.id === id,
        }))
      )

      toast.success('Primary updated')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount)
    const primary = savedBanks.find((b) => b.isPrimary)

    if (!amount || amount <= 0)
      return toast.error('Invalid amount')

    if (!primary)
      return toast.error('Set a primary bank')

    if (amount > (wallet?.availableBalance ?? 0))
      return toast.error('Insufficient balance')

    setSaving(true)

    try {
      await api.withdraw({
        amount,
        bankAccountId: primary.id,
      })

      toast.success('Withdrawal sent')
      setWithdrawAmount('')
      setIsWithdrawOpen(false)
      loadInitialData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ================= UI ================= */

  if (loadingData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* WALLET */}
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-bold mb-4">Wallet</h3>
        <p>Available: ₦{wallet?.availableBalance}</p>
        <p>Pending: ₦{wallet?.pendingBalance}</p>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="mt-4 bg-black text-white px-4 py-2 rounded text-sm"
        >
          Withdraw
        </button>
      </div>

      {/* BANKS */}
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <div className="flex justify-between">
          <h3 className="font-bold">Bank Accounts</h3>
          <button
            onClick={() => setIsAddBankOpen(true)}
            className="text-sm bg-black text-white px-3 py-1 rounded"
          >
            Add Bank
          </button>
        </div>

        {savedBanks.map((bank, idx) => (
          <div
            key={idx+1}
            className="flex justify-between border p-3 rounded"
          >
            <div>
              <p className="font-bold">{bank.bankName}</p>
              <p className="text-sm">{bank.accountNumber}</p>
              <p className="text-xs">{bank.accountName}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleSetPrimary(bank.id)}>
                <Star
                  size={16}
                  className={bank.isPrimary ? 'text-yellow-500' : ''}
                />
              </button>

              <button onClick={() => handleDeleteBank(bank.id)}>
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD BANK MODAL */}
      {isAddBankOpen && (
        <div className="p-4 border rounded bg-white space-y-3">
          <select
            value={newBank.bankCode}
            onChange={(e) =>
              setNewBank((p) => ({ ...p, bankCode: e.target.value }))
            }
            className="border p-2 w-full"
          >
            <option value="">Select Bank</option>
            {banksList.map((b, idx) => (
              <option key={idx} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Account Number"
            value={newBank.accountNumber}
            onChange={(e) =>
              setNewBank((p) => ({
                ...p,
                accountNumber: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />

          <input
            value={newBank.accountName}
            readOnly
            className="border p-2 w-full bg-gray-100"
          />

          {verifying && <Loader2 className="animate-spin" />}

          <button
            onClick={handleAddBank}
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {/* WITHDRAW */}
      {isWithdrawOpen && (
        <div className="p-4 border rounded bg-white space-y-3">
          <input
            placeholder="Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="border p-2 w-full"
          />

          <button
            onClick={handleWithdraw}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  )
}

export default PaymentSettings