'use client';

import { getCurrentWindow } from '@tauri-apps/api/window';

export function WindowControls() {
  const handleMinimize = () => getCurrentWindow().minimize();
  const handleMaximize = () => getCurrentWindow().toggleMaximize();
  const handleClose = () => getCurrentWindow().close();

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <button
        onClick={handleClose}
        className="h-3 w-3 rounded-full bg-[#ff5f56] hover:brightness-90 transition-all shadow-sm flex items-center justify-center group"
        title="Close"
      />
      <button
        onClick={handleMinimize}
        className="h-3 w-3 rounded-full bg-[#ffbd2e] hover:brightness-90 transition-all shadow-sm flex items-center justify-center group"
        title="Minimize"
      />
      <button
        onClick={handleMaximize}
        className="h-3 w-3 rounded-full bg-[#27c93f] hover:brightness-90 transition-all shadow-sm flex items-center justify-center group"
        title="Maximize"
      />
    </div>
  );
}

