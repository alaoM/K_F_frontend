'use client'

import React, { useRef, useState } from 'react'
import {
    ArrowLeft, Send, MessageSquare, ShieldAlert,
    DollarSign, XCircle, Paperclip, X, Play,
    CheckCircle2, User, ShoppingBag
} from 'lucide-react'
import Image from 'next/image'
import { useApi } from '@/hooks/useApi'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/helpers/functions'
import { getStatusColor } from '@/app/(dashboards)/dashboard/admin/disputes/page'
import { ApiDispute, ApiMessage } from '@/app/(site)/(marketplace)/disputes/page'


interface Props {
    dispute: ApiDispute
    onBack: () => void
    onResolved?: () => void
}

// ✅ Matches your existing upload helpers exactly
const uploadSingleImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/upload-single-image', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.url
}

// Videos use the same single-image endpoint since it just stores the file
// If you have a dedicated video endpoint, swap it here
const uploadFile = async (file: File): Promise<string> => {
    return uploadSingleImage(file)
}

type AttachmentPreview = {
    file: File
    previewUrl: string   // local blob URL for preview
    uploadedUrl: string | null  // null while uploading
    type: 'image' | 'video'
    uploading: boolean
    error: boolean
}

const MAX_FILES = 5
const MAX_SIZE_MB = 10

function isImage(file: File) {
    return file.type.startsWith('image/')
}

function isVideo(file: File) {
    return file.type.startsWith('video/')
}

const DisputeDetails: React.FC<Props> = ({ dispute, onBack, onResolved }) => {
    const fetcher = useApi()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [messages, setMessages] = useState<ApiMessage[]>(dispute.messages || [])
    const [newMessage, setNewMessage] = useState('')
    const [attachments, setAttachments] = useState<AttachmentPreview[]>([])
    const [sending, setSending] = useState(false)
    const [resolving, setResolving] = useState(false)

    const [preview, setPreview] = useState<{
        url: string
        type: 'image' | 'video'
    } | null>(null)

    const sellerName = dispute.order?.items?.[0]?.seller?.businessName ?? 'Unknown seller'
    const isAlreadyResolved = ['resolved_released', 'resolved_refunded', 'closed'].includes(dispute.status)
    
    // ✅ Pick files → create local previews → upload immediately in background
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (!files.length) return

        // Reset input so same file can be re-selected
        e.target.value = ''

        const remaining = MAX_FILES - attachments.length
        const toAdd = files.slice(0, remaining)

        if (files.length > remaining) {
            toast.warning(`Max ${MAX_FILES} attachments per message`)
        }

        const oversized = toAdd.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024)
        if (oversized.length) {
            toast.error(`Files must be under ${MAX_SIZE_MB}MB each`)
            return
        }

        const invalid = toAdd.filter(f => !isImage(f) && !isVideo(f))
        if (invalid.length) {
            toast.error('Only images and videos are allowed')
            return
        }

        // Add previews immediately with uploading state
        const previews: AttachmentPreview[] = toAdd.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            uploadedUrl: null,
            type: isImage(file) ? 'image' : 'video',
            uploading: true,
            error: false,
        }))

        setAttachments(prev => [...prev, ...previews])

        // Upload each file and update its uploadedUrl when done
        previews.forEach(async (preview) => {
            try {
                const url = await uploadFile(preview.file)

                setAttachments(prev =>
                    prev.map(a =>
                        a.previewUrl === preview.previewUrl
                            ? { ...a, uploadedUrl: url, uploading: false }
                            : a
                    )
                )
            } catch {
                setAttachments(prev =>
                    prev.map(a =>
                        a.previewUrl === preview.previewUrl
                            ? { ...a, uploading: false, error: true }
                            : a
                    )
                )
            }
        })
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => {
            const updated = [...prev]
            URL.revokeObjectURL(updated[index].previewUrl)
            updated.splice(index, 1)
            return updated
        })
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() && attachments.length === 0) return

        const stillUploading = attachments.some(a => a.uploading)
        if (stillUploading) {
            toast.warning('Please wait for uploads to finish')
            return
        }

        const failedUploads = attachments.filter(a => a.error)
        if (failedUploads.length) {
            toast.error('Remove failed uploads before sending')
            return
        }

        setSending(true)
        try {
            // ✅ Collect uploaded URLs — same pattern as product image submission
            const uploadedUrls = attachments
                .map(a => a.uploadedUrl)
                .filter(Boolean) as string[]

            await fetcher(`/api/disputes/${dispute.id}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newMessage,
                    attachments: uploadedUrls,
                }),
            })

            const newMsg: ApiMessage = {
                id: crypto.randomUUID(),
                message: newMessage,
                attachments: uploadedUrls,
                createdAt: new Date().toISOString(),
                sender: {
                    id: 'admin',
                    fullName: 'Admin',
                    role: 'admin'
                }
            }
            setMessages(prev => [...prev, newMsg])

            setNewMessage('')
            // Free blob URLs
            attachments.forEach(a => URL.revokeObjectURL(a.previewUrl))
            setAttachments([])
        } catch {
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const handleResolve = async (action: 'release' | 'refund') => {
        if (!confirm(action === 'release'
            ? 'Release funds to the seller? This cannot be undone.'
            : 'Issue a refund to the buyer? This cannot be undone.'
        )) return

        setResolving(true)
        try {
            await fetcher(`/api/disputes/${dispute.id}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    note: `Resolved via admin dashboard — ${action}`,
                }),
            })
            toast.success(action === 'release' ? 'Funds released to seller' : 'Refund issued to buyer')
            onResolved?.()
            onBack()
        } catch {
            toast.error('Resolution failed')
        } finally {
            setResolving(false)
        }
    }

    const getSenderLabel = (msg: ApiMessage) => {
        const role = msg.sender?.role?.toLowerCase()
        if (role === 'admin') return 'Admin'
        if (role === 'seller') return 'Seller'
        return msg.sender?.fullName ?? 'Buyer'
    }

    const getSenderColor = (msg: ApiMessage) => {
        const role = msg.sender?.role?.toLowerCase()
        if (role === 'admin') return 'text-[#243e6b]'
        if (role === 'seller') return 'text-amber-600'
        return 'text-blue-600'
    }

    const isOwnMessage = (msg: ApiMessage) =>
        msg.sender?.role?.toLowerCase() === 'admin'

    // ✅ Determine if a URL is a video by extension
    const isVideoUrl = (url: string) =>
        /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url)

    return (
        <div className="space-y-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl font-extrabold text-[#243e6b]">
                                #{dispute.id ? dispute.id.slice(0, 8) : '---'}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dispute.status)}`}>
                                {dispute.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Opened {new Date(dispute.createdAt).toLocaleDateString('en-NG', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {!isAlreadyResolved && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleResolve('release')}
                            disabled={resolving}
                            className="flex items-center gap-2 border border-rose-200 text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-50 text-sm font-bold disabled:opacity-50"
                        >
                            <XCircle size={15} />
                            Release to seller
                        </button>
                        <button
                            onClick={() => handleResolve('refund')}
                            disabled={resolving}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 text-sm font-bold disabled:opacity-50"
                        >
                            <DollarSign size={15} />
                            Refund buyer
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ───── Chat panel ───── */}
                <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-[#e2e2e2] overflow-hidden min-h-[560px]">

                    {/* Chat header */}
                    <div className="px-5 py-3 border-b border-[#e2e2e2] bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#243e6b] font-bold text-sm">
                            <MessageSquare size={16} />
                            Case communication
                        </div>
                        <span className="text-xs text-gray-400">
                            {messages.length ?? 0} messages
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/30">
                        {!messages.length ? (
                            <p className="text-center text-sm text-gray-400 py-10">No messages yet</p>
                        ) : messages.map(msg => {
                            const own = isOwnMessage(msg)
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col max-w-[78%] ${own ? 'ml-auto items-end' : 'items-start'}`}
                                >
                                    {/* Sender + time */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${getSenderColor(msg)}`}>
                                            {getSenderLabel(msg)}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.createdAt).toLocaleString('en-NG', {
                                                month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {/* Bubble */}
                                    {msg.message && (
                                        <div className={`px-4 py-3 rounded-2xl text-sm mb-2 ${own
                                            ? 'bg-[#243e6b] text-white rounded-tr-none'
                                            : 'bg-white border border-[#e2e2e2] text-gray-700 rounded-tl-none'
                                            }`}>
                                            {msg.message}
                                        </div>
                                    )}

                                    {/* ✅ Attachments — images inline, videos with play indicator */}
                                    {(msg.attachments ?? []).length > 0 && (
                                        <div className="flex gap-2 flex-wrap mt-1">
                                            {(msg.attachments ?? []).map((url, i) => (
                                                isVideoUrl(url) ? (
                                                    <div
                                                        key={i}
                                                        onClick={() => setPreview({
                                                            url,
                                                            type: isVideoUrl(url) ? 'video' : 'image'
                                                        })}

                                                        className="relative w-32 h-24 rounded-xl overflow-hidden border border-[#e2e2e2] block bg-gray-900 flex items-center justify-center"
                                                    >
                                                        <video
                                                            src={url}
                                                            className="w-full h-full object-cover opacity-70"
                                                            muted
                                                            preload="metadata"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
                                                                <Play size={16} className="text-[#243e6b] ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        key={i}
                                                        onClick={() => setPreview({
                                                            url,
                                                            type: isVideoUrl(url) ? 'video' : 'image'
                                                        })}

                                                        className="relative w-32 h-24 rounded-xl overflow-hidden border border-[#e2e2e2] block"
                                                    >
                                                        <Image
                                                            src={url}
                                                            alt={`Attachment ${i + 1}`}
                                                            fill
                                                            className="object-cover hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* ───── Input area ───── */}
                    {!isAlreadyResolved && (
                        <div className="border-t border-[#e2e2e2] bg-white">

                            {/* ✅ Attachment previews — shown above input */}
                            {attachments.length > 0 && (
                                <div className="flex gap-2 flex-wrap px-4 pt-3">
                                    {attachments.map((a, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e2e2e2] bg-gray-50 shrink-0">
                                            {a.type === 'image' ? (
                                                <Image
                                                    src={a.previewUrl}
                                                    alt="preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <video
                                                    src={a.previewUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                />
                                            )}

                                            {/* Uploading overlay */}
                                            {a.uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}

                                            {/* Error overlay */}
                                            {a.error && (
                                                <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                                                    <X size={14} className="text-white" />
                                                </div>
                                            )}

                                            {/* Video badge */}
                                            {a.type === 'video' && !a.uploading && !a.error && (
                                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                                                    video
                                                </span>
                                            )}

                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeAttachment(i)}
                                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                                            >
                                                <X size={9} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add more slot */}
                                    {attachments.length < MAX_FILES && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors shrink-0"
                                        >
                                            <Paperclip size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Text + send row */}
                            <div className="flex items-end gap-2 px-4 py-3">
                                {/* Attach button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={attachments.length >= MAX_FILES}
                                    title="Attach image or video"
                                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 shrink-0 transition-colors"
                                >
                                    <Paperclip size={16} />
                                </button>

                                {/* Hidden file input — accepts images and videos */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />

                                <textarea
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => {
                                        // Ctrl/Cmd + Enter to send
                                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="flex-1 border-none outline-none resize-none text-sm bg-transparent text-gray-800 placeholder-gray-400 py-1.5 min-h-[36px] max-h-[120px]"
                                    rows={1}
                                />

                                <button
                                    onClick={handleSendMessage}
                                    disabled={
                                        sending ||
                                        (attachments.some(a => a.uploading)) ||
                                        (!newMessage.trim() && attachments.length === 0)
                                    }
                                    className="w-9 h-9 rounded-lg bg-[#f6c947] text-[#243e6b] flex items-center justify-center hover:bg-[#f6c947]/90 disabled:opacity-50 shrink-0 transition-all"
                                >
                                    {sending ? (
                                        <div className="w-4 h-4 border-2 border-[#243e6b] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send size={15} />
                                    )}
                                </button>
                            </div>

                            <p className="px-4 pb-3 text-[10px] text-gray-400 flex items-center gap-1">
                                <ShieldAlert size={11} />
                                Messages and attachments are visible to all parties. Ctrl+Enter to send.
                            </p>
                        </div>
                    )}

                    {isAlreadyResolved && (
                        <div className="px-5 py-3 border-t border-[#e2e2e2] bg-gray-50 text-center">
                            <p className="text-xs text-gray-500 font-medium">This dispute has been resolved. No further messages can be sent.</p>
                        </div>
                    )}
                </div>

                {/* ───── Sidebar ───── */}
                <div className="space-y-5">

                    {/* Order details */}
                    <div className="bg-white p-5 rounded-xl border border-[#e2e2e2] space-y-4">
                        <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-3 flex items-center gap-2 text-sm">
                            <ShoppingBag size={16} />
                            Order details
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Order ID', value: `#${dispute.order.id.slice(0, 8)}` },
                                { label: 'Total amount', value: formatCurrency(Number(dispute.order.totalAmount)) },
                                { label: 'Payment status', value: dispute.order.paymentStatus.replace(/_/g, ' ') },
                                { label: 'Reason', value: dispute.reason },
                                { label: 'Priority', value: dispute.priority },
                            ].map(row => (
                                <div key={row.label} className="flex justify-between text-sm gap-4">
                                    <span className="text-gray-500 shrink-0">{row.label}</span>
                                    <span className="font-medium text-gray-800 text-right capitalize">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="bg-white p-5 rounded-xl border border-[#e2e2e2] space-y-4">
                        <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-3 flex items-center gap-2 text-sm">
                            <User size={16} />
                            Parties involved
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                    {dispute.buyer?.fullName?.charAt(0) ?? '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#243e6b]">{dispute.buyer?.fullName ?? 'Unknown'}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Buyer</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                                    {sellerName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#243e6b]">{sellerName}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Seller</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin resolution note */}
                    {dispute.adminResolutionNote && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="font-bold text-gray-700 text-sm mb-1">Resolution note</p>
                            <p className="text-sm text-gray-600">{dispute.adminResolutionNote}</p>
                        </div>
                    )}

                    {/* Guidelines */}
                    <div className="bg-[#243e6b] p-5 rounded-xl text-white space-y-3">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <CheckCircle2 size={16} className="text-[#f6c947]" />
                            Resolution guidelines
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">
                            Review all messages and attachments from both parties before deciding. Refund if item is not as described or not received. Release if evidence supports the seller.
                        </p>
                    </div>
                </div>
            </div>
            {preview && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

                    <button
                        onClick={() => setPreview(null)}
                        className="absolute top-5 right-5 text-white"
                    >
                        <X size={28} />
                    </button>

                    {preview.type === 'image' ? (
                        <Image
                            src={preview.url}
                            alt="preview"
                            width={800}
                            height={600}
                            className="max-h-[90vh] w-auto object-contain rounded-lg"
                        />
                    ) : (
                        <video
                            src={preview.url}
                            controls
                            autoPlay
                            className="max-h-[90vh] w-auto rounded-lg"
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DisputeDetails