'use client';

import React, { useRef, useState } from 'react';
import {
  ArrowLeft, Send, MessageSquare, ShieldAlert,
  DollarSign, XCircle, Paperclip, X, Play,
  CheckCircle2, User, ShoppingBag
} from 'lucide-react';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/helpers/functions';
import { getStatusColor } from '@/app/(dashboards)/dashboard/admin/disputes/page';
import { ApiDispute, ApiMessage } from '@/app/(site)/(marketplace)/disputes/page';
import ConfirmModal from '../ConfirmModal';

interface Props {
  dispute: ApiDispute;
  onBack: () => void;
  onResolved?: () => void;
}

const uploadSingleImage = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload/upload-single-image', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url;
};

const uploadFile = async (file: File): Promise<string> => {
  return uploadSingleImage(file);
};

type AttachmentPreview = {
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  type: 'image' | 'video';
  uploading: boolean;
  error: boolean;
};

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

function isImage(file: File) {
  return file.type.startsWith('image/');
}

function isVideo(file: File) {
  return file.type.startsWith('video/');
}

const DisputeDetails: React.FC<Props> = ({ dispute, onBack, onResolved }) => {
  const fetcher = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ApiMessage[]>(dispute.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);

  const [preview, setPreview] = useState<{
    url: string;
    type: 'image' | 'video';
  } | null>(null);

  const sellerName = dispute.order?.items?.[0]?.seller?.businessName ?? 'Verified Merchant';
  const isAlreadyResolved = ['resolved_released', 'resolved_refunded', 'closed'].includes(dispute.status);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    e.target.value = '';

    const remaining = MAX_FILES - attachments.length;
    const toAdd = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.warning(`Maximum ${MAX_FILES} attachments permitted per message`);
    }

    const oversized = toAdd.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      toast.error(`Files must be under ${MAX_SIZE_MB}MB each`);
      return;
    }

    const invalid = toAdd.filter(f => !isImage(f) && !isVideo(f));
    if (invalid.length) {
      toast.error('Only image and video attachments are permitted');
      return;
    }

    const previews: AttachmentPreview[] = toAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      uploadedUrl: null,
      type: isImage(file) ? 'image' : 'video',
      uploading: true,
      error: false,
    }));

    setAttachments(prev => [...prev, ...previews]);

    previews.forEach(async (previewItem) => {
      try {
        const url = await uploadFile(previewItem.file);
        setAttachments(prev =>
          prev.map(a =>
            a.previewUrl === previewItem.previewUrl
              ? { ...a, uploadedUrl: url, uploading: false }
              : a
          )
        );
      } catch {
        setAttachments(prev =>
          prev.map(a =>
            a.previewUrl === previewItem.previewUrl
              ? { ...a, uploading: false, error: true }
              : a
          )
        );
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const stillUploading = attachments.some(a => a.uploading);
    if (stillUploading) {
      toast.warning('Please wait for file uploads to complete');
      return;
    }

    const failedUploads = attachments.filter(a => a.error);
    if (failedUploads.length) {
      toast.error('Please remove failed uploads before sending');
      return;
    }

    setSending(true);
    try {
      const uploadedUrls = attachments
        .map(a => a.uploadedUrl)
        .filter(Boolean) as string[];

      await fetcher(`/api/disputes/${dispute.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          attachments: uploadedUrls,
        }),
      });

      const newMsg: ApiMessage = {
        id: crypto.randomUUID(),
        message: newMessage,
        attachments: uploadedUrls,
        createdAt: new Date().toISOString(),
        sender: {
          id: 'admin',
          fullName: 'Platform Admin',
          role: 'admin'
        }
      };
      setMessages(prev => [...prev, newMsg]);

      setNewMessage('');
      attachments.forEach(a => URL.revokeObjectURL(a.previewUrl));
      setAttachments([]);
    } catch {
      toast.error('Failed to dispatch message');
    } finally {
      setSending(false);
    }
  };

  const [resolveActionConfirm, setResolveActionConfirm] = useState<'release' | 'refund' | null>(null);

  const handleResolve = async (action: 'release' | 'refund') => {
    setResolving(true);
    try {
      await fetcher(`/api/disputes/${dispute.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note: `Resolved via admin dashboard — ${action}`,
        }),
      });
      toast.success(action === 'release' ? 'Funds released to seller account' : 'Refund processed for buyer');
      onResolved?.();
      onBack();
    } catch {
      toast.error('Dispute resolution failed');
    } finally {
      setResolving(false);
    }
  };

  const getSenderLabel = (msg: ApiMessage) => {
    const role = msg.sender?.role?.toLowerCase();
    if (role === 'admin') return 'Platform Admin';
    if (role === 'seller') return `Seller (${sellerName})`;
    return `Buyer (${msg.sender?.fullName ?? dispute.buyer?.fullName ?? 'Buyer'})`;
  };

  const getSenderColor = (msg: ApiMessage) => {
    const role = msg.sender?.role?.toLowerCase();
    if (role === 'admin') return 'text-[#111111] bg-gray-200 border-gray-300';
    if (role === 'seller') return 'text-amber-800 bg-amber-100 border-amber-300';
    return 'text-blue-800 bg-blue-100 border-blue-300';
  };

  const isOwnMessage = (msg: ApiMessage) => msg.sender?.role?.toLowerCase() === 'admin';

  const isVideoUrl = (url: string) => /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url);

  return (
    <div className="space-y-6 flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-gray-300 bg-white hover:bg-[#111111] hover:text-white rounded-none transition-all cursor-pointer text-[#111111]"
            title="Back to Dispute List"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                Dispute #{dispute.id ? dispute.id.slice(0, 8) : '---'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider border ${getStatusColor(dispute.status)}`}>
                {dispute.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-0.5">
              Opened on {new Date(dispute.createdAt).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {!isAlreadyResolved && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setResolveActionConfirm('release')}
              disabled={resolving}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-rose-600 border-2 border-rose-600 hover:bg-rose-600 hover:text-white rounded-none text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <XCircle size={15} />
              <span>Release to Seller</span>
            </button>
            <button
              onClick={() => setResolveActionConfirm('refund')}
              disabled={resolving}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-[#111111] hover:border-[#111111] rounded-none text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <DollarSign size={15} />
              <span>Refund Buyer</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Stream Panel */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-none border-2 border-gray-200 shadow-xs overflow-hidden min-h-[560px]">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b-2 border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#111111] font-black uppercase text-xs tracking-wider">
              <MessageSquare size={16} />
              <span>Case Mediation Thread</span>
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {messages.length} Messages Exchanged
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/30">
            {!messages.length ? (
              <div className="py-16 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                No communications recorded in this dispute yet.
              </div>
            ) : (
              messages.map((msg) => {
                const own = isOwnMessage(msg);
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[82%] ${own ? 'ml-auto items-end' : 'items-start'}`}
                  >
                    {/* Sender + Timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 border ${getSenderColor(msg)}`}>
                        {getSenderLabel(msg)}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(msg.createdAt).toLocaleString('en-NG', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    {msg.message && (
                      <div className={`p-4 rounded-none text-xs font-medium leading-relaxed mb-2 shadow-2xs ${
                        own
                          ? 'bg-[#111111] text-white border border-[#111111]'
                          : 'bg-white border border-gray-300 text-[#111111]'
                      }`}>
                        {msg.message}
                      </div>
                    )}

                    {/* Attachments */}
                    {(msg.attachments ?? []).length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-1">
                        {(msg.attachments ?? []).map((url, i) => (
                          isVideoUrl(url) ? (
                            <div
                              key={i}
                              onClick={() => setPreview({ url, type: 'video' })}
                              className="relative w-32 h-24 rounded-none overflow-hidden border border-gray-300 bg-black flex items-center justify-center cursor-pointer group"
                            >
                              <video
                                src={url}
                                className="w-full h-full object-cover opacity-70"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className="w-8 h-8 rounded-none bg-[#f6c947] text-[#111111] flex items-center justify-center">
                                  <Play size={14} className="ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={i}
                              onClick={() => setPreview({ url, type: 'image' })}
                              className="relative w-32 h-24 rounded-none overflow-hidden border border-gray-300 cursor-pointer group"
                            >
                              <Image
                                src={url}
                                alt={`Attachment ${i + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          {!isAlreadyResolved && (
            <div className="border-t-2 border-gray-200 bg-white">
              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="flex gap-2 flex-wrap px-4 pt-3 bg-gray-50 border-b border-gray-200">
                  {attachments.map((a, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-none overflow-hidden border border-gray-300 bg-gray-100 shrink-0">
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

                      {a.uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-[#f6c947] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {a.error && (
                        <div className="absolute inset-0 bg-rose-600/80 flex items-center justify-center">
                          <X size={14} className="text-white" />
                        </div>
                      )}

                      {a.type === 'video' && !a.uploading && !a.error && (
                        <span className="absolute bottom-1 left-1 bg-black text-white text-[8px] font-black uppercase px-1">
                          video
                        </span>
                      )}

                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute top-0 right-0 w-4 h-4 bg-black text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}

                  {attachments.length < MAX_FILES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-none border border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:border-[#111111] hover:text-[#111111] transition-colors shrink-0 bg-white cursor-pointer"
                    >
                      <Paperclip size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Message Composer */}
              <div className="flex items-end gap-2 px-4 py-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_FILES}
                  title="Attach evidence file"
                  className="w-10 h-10 rounded-none border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 shrink-0 transition-colors cursor-pointer"
                >
                  <Paperclip size={16} />
                </button>

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
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type official administrative message or mediation reply..."
                  className="flex-1 border border-gray-300 rounded-none outline-none resize-none text-xs bg-white text-[#111111] placeholder-gray-400 p-2.5 min-h-[40px] max-h-[120px] focus:border-[#111111] transition-all"
                  rows={2}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={
                    sending ||
                    attachments.some(a => a.uploading) ||
                    (!newMessage.trim() && attachments.length === 0)
                  }
                  className="w-10 h-10 rounded-none bg-[#f6c947] text-[#111111] border border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] flex items-center justify-center disabled:opacity-40 shrink-0 transition-all cursor-pointer"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              <div className="px-4 pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-[#111111]" />
                <span>All parties have access to messages in this mediation stream. Press Ctrl+Enter to send.</span>
              </div>
            </div>
          )}

          {isAlreadyResolved && (
            <div className="px-5 py-4 border-t-2 border-gray-200 bg-gray-50 text-center">
              <p className="text-xs font-black uppercase tracking-wider text-gray-600">
                This dispute has been finalized. Communication is closed.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-5">
          {/* Order Details */}
          <div className="bg-white p-5 rounded-none border-2 border-gray-200 shadow-xs space-y-4">
            <h3 className="font-black uppercase tracking-wider text-[#111111] border-b-2 border-gray-200 pb-3 flex items-center gap-2 text-xs">
              <ShoppingBag size={16} />
              <span>Order Context</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Order ID', value: `#${dispute.order?.id ? dispute.order.id.slice(0, 8) : '---'}` },
                { label: 'Order Value', value: formatCurrency(Number(dispute.order?.totalAmount || 0)) },
                { label: 'Payment Status', value: dispute.order?.paymentStatus?.replace(/_/g, ' ') || 'Paid' },
                { label: 'Dispute Reason', value: dispute.reason },
                { label: 'Triage Priority', value: dispute.priority },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start text-xs gap-3">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] shrink-0">{row.label}</span>
                  <span className="font-black text-[#111111] text-right uppercase tracking-tight">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Involved Parties */}
          <div className="bg-white p-5 rounded-none border-2 border-gray-200 shadow-xs space-y-4">
            <h3 className="font-black uppercase tracking-wider text-[#111111] border-b-2 border-gray-200 pb-3 flex items-center gap-2 text-xs">
              <User size={16} />
              <span>Involved Parties</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-[#111111] text-[#f6c947] flex items-center justify-center font-black text-xs shrink-0 tracking-wider">
                  {dispute.buyer?.fullName?.charAt(0)?.toUpperCase() ?? 'B'}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-[#111111]">{dispute.buyer?.fullName ?? 'Anonymous'}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buyer Account</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-xs shrink-0 tracking-wider">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-[#111111]">{sellerName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant Storefront</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Note */}
          {dispute.adminResolutionNote && (
            <div className="bg-gray-50 p-4 rounded-none border-2 border-gray-200">
              <p className="font-black uppercase tracking-wider text-xs text-[#111111] mb-1">Resolution Summary</p>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">{dispute.adminResolutionNote}</p>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-[#111111] text-white p-5 rounded-none border-2 border-[#111111] space-y-3">
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs text-[#f6c947]">
              <CheckCircle2 size={16} />
              <span>Mediation Protocols</span>
            </div>
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              Examine all correspondence and photographic proof thoroughly before declaring resolution. Release funds if shipping evidence is confirmed; issue a refund if the item is substantially not as described or undelivered.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xs flex items-center justify-center z-[300] p-4">
          <button
            onClick={() => setPreview(null)}
            className="absolute top-5 right-5 text-white hover:text-[#f6c947] p-2 transition-colors cursor-pointer"
          >
            <X size={28} />
          </button>

          {preview.type === 'image' ? (
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <Image
                src={preview.url}
                alt="preview"
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto object-contain rounded-none border-2 border-white"
              />
            </div>
          ) : (
            <video
              src={preview.url}
              controls
              autoPlay
              className="max-h-[85vh] max-w-[90vw] rounded-none border-2 border-white"
            />
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(resolveActionConfirm)}
        onClose={() => setResolveActionConfirm(null)}
        onConfirm={() => {
          if (resolveActionConfirm) handleResolve(resolveActionConfirm);
        }}
        title={resolveActionConfirm === 'release' ? 'Release Escrow to Seller' : 'Execute Order Refund to Buyer'}
        message={resolveActionConfirm === 'release' 
          ? 'Are you certain you want to release the escrow payout to the seller? This mediation settlement is final and cannot be reverted.'
          : 'Are you certain you want to issue a full refund back to the buyer? The merchant will not receive escrow payment.'
        }
        confirmText={resolveActionConfirm === 'release' ? 'Release Escrow Payout' : 'Process Full Refund'}
        variant={resolveActionConfirm === 'release' ? 'warning' : 'danger'}
        isLoading={resolving}
      />
    </div>
  );
};

export default DisputeDetails;