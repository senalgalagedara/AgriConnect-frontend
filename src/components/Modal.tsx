"use client";

import React from 'react';

type Props = {
  show: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({ show, title, onClose, children }: Props) {
  if (!show) return null;

  return (
    <div className="ac-modal-overlay" role="dialog" aria-modal="true">
      <div className="ac-modal">
        <div className="ac-modal-header">
          <h3>{title}</h3>
          <button aria-label="Close" className="ac-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ac-modal-body">{children}</div>
      </div>

      <style jsx>{`
        .ac-modal-overlay{ position:fixed; inset:0; background:rgba(2,6,23,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; }
        .ac-modal{ background:#fff; width:100%; max-width:720px; border-radius:12px; box-shadow:0 10px 40px rgba(2,6,23,0.3); overflow:hidden; }
        .ac-modal-header{ display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #eef5ee; }
        .ac-modal-header h3{ margin:0; font-size:16px; color:#0f5132; }
        .ac-modal-close{ background:transparent; border:0; font-size:20px; line-height:1; cursor:pointer; }
        .ac-modal-body{ padding:16px; }
        @media (max-width:600px){ .ac-modal{ max-width:92%; } }
      `}</style>
    </div>
  );
}
