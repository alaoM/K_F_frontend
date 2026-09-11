'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Save, Loader2, Trash2, Star } from 'lucide-react'
import { toast } from 'react-toastify'
import { useApi } from '@/hooks/useApi'
import ConfirmModal from '../ConfirmModal'

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

  const [removeBankConfirmId, setRemoveBankConfirmId] = useState<string | null>(null);

  const handleDeleteBank = async (id: string) => {
    try {
      await api.deleteBank(id)
      setSavedBanks((prev) => prev.filter((b) => b.id !== id))
      toast.success('Bank details removed')
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
        <Loader2 className="animate-spin text-[#111111]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* WALLET */}
      <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Wallet Balance</h3>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Real-time store funds and pending payouts</p>
          </div>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] px-5 py-2.5 rounded-none text-xs font-black uppercase tracking-wider transition-all shadow-sm"
          >
            Withdraw Funds
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-gray-50 border border-gray-300 rounded-none">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 block">Available For Payout</span>
            <span className="text-2xl font-black text-[#111111] mt-1 block">₦{Number(wallet?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-300 rounded-none">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 block">Pending Clearance</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">₦{Number(wallet?.pendingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* BANKS */}
      <div className="bg-white p-6 rounded-none border border-gray-300 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h3 className="font-black uppercase tracking-tight text-[#111111] text-base">Settlement Accounts</h3>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Manage bank accounts where your earnings will be deposited</p>
          </div>
          <button
            onClick={() => setIsAddBankOpen(true)}
            className="text-xs font-black uppercase tracking-wider bg-[#111111] text-[#f6c947] hover:bg-[#f6c947] hover:text-[#111111] border border-[#111111] px-4 py-2 rounded-none transition-all"
          >
            Add Bank
          </button>
        </div>

        {savedBanks.length === 0 ? (
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center py-6">No bank accounts linked yet.</p>
        ) : (
          savedBanks.map((bank, idx) => (
            <div
              key={idx+1}
              className={`flex justify-between items-center border p-4 rounded-none transition-all ${
                bank.isPrimary ? 'border-[#111111] bg-gray-50/70' : 'border-gray-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm uppercase tracking-wider text-[#111111]">{bank.bankName}</p>
                  {bank.isPrimary && (
                    <span className="bg-[#f6c947] text-[#111111] text-[10px] font-black uppercase px-2 py-0.5 rounded-none border border-[#111111]">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono font-bold text-gray-700 mt-0.5">{bank.accountNumber}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{bank.accountName}</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSetPrimary(bank.id)}
                  title={bank.isPrimary ? "Primary Account" : "Set as Primary"}
                  className="p-2 border border-gray-300 rounded-none bg-white hover:bg-gray-100 transition-colors"
                >
                  <Star
                    size={15}
                    className={bank.isPrimary ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}
                  />
                </button>

                <button 
                  onClick={() => setRemoveBankConfirmId(bank.id)}
                  title="Remove Account"
                  className="p-2 border border-rose-200 text-rose-600 rounded-none bg-white hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD BANK MODAL */}
      {isAddBankOpen && (
        <div className="p-6 border border-gray-300 rounded-none bg-white space-y-4 shadow-sm">
          <h4 className="font-black uppercase tracking-tight text-[#111111] text-sm">Add New Bank Account</h4>
          
          <select
            value={newBank.bankCode}
            onChange={(e) =>
              setNewBank((p) => ({ ...p, bankCode: e.target.value }))
            }
            className="border border-gray-300 rounded-none p-2.5 w-full text-xs font-semibold bg-white outline-none focus:border-[#111111]"
          >
            <option value="">Select Bank</option>
            {banksList.map((b, idx) => (
              <option key={`${b.code}-${idx}`} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="10-Digit Account Number"
            value={newBank.accountNumber}
            onChange={(e) =>
              setNewBank((p) => ({
                ...p,
                accountNumber: e.target.value,
              }))
            }
            className="border border-gray-300 rounded-none p-2.5 w-full text-xs font-semibold bg-white outline-none focus:border-[#111111]"
          />

          <input
            type="text"
            placeholder="Account Name (Auto-resolved)"
            value={newBank.accountName}
            readOnly
            className="border border-gray-300 rounded-none p-2.5 w-full bg-gray-100 text-xs font-bold text-[#111111]"
          />

          {verifying && <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resolving account name...</p>}

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setIsAddBankOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-none text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBank}
              disabled={saving || !newBank.accountName}
              className="px-5 py-2 bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] text-xs font-black uppercase tracking-wider rounded-none disabled:opacity-50 transition-all"
            >
              Save Bank
            </button>
          </div>
        </div>
      )}

      {/* WITHDRAW */}
      {isWithdrawOpen && (
        <div className="p-6 border border-gray-300 rounded-none bg-white space-y-4 shadow-sm">
          <h4 className="font-black uppercase tracking-tight text-[#111111] text-sm">Withdraw to Primary Account</h4>
          <input
            placeholder="Amount to withdraw (₦)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="border border-gray-300 rounded-none p-2.5 w-full text-xs font-semibold bg-white outline-none focus:border-[#111111]"
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsWithdrawOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-none text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={saving}
              className="bg-[#f6c947] text-[#111111] border-2 border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] px-5 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(removeBankConfirmId)}
        onClose={() => setRemoveBankConfirmId(null)}
        onConfirm={() => {
          if (removeBankConfirmId) handleDeleteBank(removeBankConfirmId)
        }}
        title="Remove Bank Account"
        message="Are you sure you want to remove this bank account? You will no longer be able to withdraw to it."
        confirmText="Remove Bank"
        variant="danger"
      />
    </div>
  )
}

export default PaymentSettings