import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Monitor
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'compact', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // If already installed and running as standalone app, suppress the button
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    // If the browser provided native install prompt, launch it directly
    if (isInstallable) {
      try {
        setIsInstalling(true);
        const success = await install();
        if (!success) {
          setShowGuideModal(true);
        }
      } catch {
        setShowGuideModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If native prompt is not yet ready or in iframe / iOS / desktop, show the guided instructions
      setShowGuideModal(true);
    }
  };

  const getDirectAppUrl = () => {
    // Check if in iframe or use current location
    try {
      if (window.self !== window.top && window.location.ancestorOrigins?.length) {
        return window.location.href;
      }
    } catch {
      // Ignore cross-origin frame errors
    }
    return window.location.href;
  };

  const handleCopyLink = () => {
    const url = getDirectAppUrl();
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleOpenDirect = () => {
    const url = getDirectAppUrl();
    window.open(url, '_blank');
  };

  // Detect user environment for guidance
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const isAndroid = /android/.test(userAgent);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <>
      {variant === 'full' ? (
        <button
          onClick={handleButtonClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-amber-600/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 transition-all font-medium text-xs cursor-pointer shadow-sm ${className}`}
          title="ติดตั้ง Worship SongBook ลงเครื่อง"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-left">
              <span className="block font-bold text-amber-200">ติดตั้งแอป (Install App)</span>
              <span className="block text-[10px] text-amber-400/80">
                เปิดเต็มจอ • ออฟไลน์ 100% ไม่ต้องต่อเน็ต
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-bold text-[10px] shrink-0">
            ติดตั้ง
          </span>
        </button>
      ) : (
        <button
          onClick={handleButtonClick}
          disabled={isInstalling}
          title="ติดตั้ง Worship SongBook เป็นแอปบนเครื่อง"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/15 hover:from-amber-500/30 hover:to-amber-600/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-sm ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Install App</span>
        </button>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-5 sm:p-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ติดตั้ง Worship SongBook</h3>
                  <p className="text-[11px] text-neutral-400">วิธีติดตั้งลงมือถือหรือคอมพิวเตอร์</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If in iframe / preview notification */}
            {isInIframe && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <span>💡 กำลังเปิดในหน้าพรีวิว (Preview Frame)</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  เพื่อให้เบราว์เซอร์แสดงปุ่มติดตั้งบนหน้าจอโฮมได้ แนะนำให้เปิดด้วยเบราว์เซอร์จริงของมือถือโดยตรง:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleOpenDirect}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดในแท็บใหม่</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกลิงก์</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Platform Guides */}
            <div className="mt-4 space-y-3 text-xs">
              {/* iOS Guide */}
              <div className={`p-3 rounded-xl border ${isIOS ? 'bg-neutral-950/80 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-neutral-950/40 border-neutral-800'}`}>
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>สำหรับ iPhone / iPad (Safari)</span>
                  {isIOS && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-normal">อุปกรณ์ของคุณ</span>}
                </div>
                <div className="space-y-2 text-neutral-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>เปิดเว็บในเบราว์เซอร์ <strong>Safari</strong> แล้วกดปุ่ม <strong>แชร์ (Share)</strong> <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" /> ที่แถบด้านล่าง</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>เลื่อนเมนูลงมาแล้วกดเลือก <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-400" /></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>กด <strong>"เพิ่ม" (Add)</strong> มุมขวาบน จะได้ไอคอนแอปบนหน้าจอมือถือทันที</span>
                  </div>
                </div>
              </div>

              {/* Android Guide */}
              <div className={`p-3 rounded-xl border ${isAndroid ? 'bg-neutral-950/80 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-neutral-950/40 border-neutral-800'}`}>
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>สำหรับ Android (Chrome)</span>
                  {isAndroid && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-normal">อุปกรณ์ของคุณ</span>}
                </div>
                <div className="space-y-2 text-neutral-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>แตะปุ่มเมนู <strong>จุด 3 จุด (⋮)</strong> ที่มุมบนขวาของ Chrome</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>เลือก <strong>"ติดตั้งแอป" (Install app)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>ยืนยันการติดตั้ง จากนั้นเปิดแอปจากหน้าจอหลักได้ทันที</span>
                  </div>
                </div>
              </div>

              {/* Desktop Guide */}
              <div className="p-3 rounded-xl border bg-neutral-950/40 border-neutral-800">
                <div className="flex items-center gap-2 font-bold text-sky-300 mb-2">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <span>สำหรับคอมพิวเตอร์ (Chrome / Edge)</span>
                </div>
                <div className="space-y-2 text-neutral-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>มองหาไอคอน <strong>ติดตั้ง (Install)</strong> ที่แถบ Address bar ด้านขวาสุด</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>คลิกปุ่ม <strong>ติดตั้ง</strong> เพื่อเปิดเป็นหน้าต่างแอปสำหรับใช้งานบนเวที</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Highlight */}
            <div className="mt-4 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>เมื่อติดตั้งแล้ว สามารถเปิดใช้งานได้ 100% แม้ไม่มีสัญญาณเน็ต</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </>
  );
};
