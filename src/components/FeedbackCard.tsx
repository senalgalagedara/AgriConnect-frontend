import React from 'react';
import { Calendar } from 'lucide-react';

interface Feedback {
  id: string | number;
  feedbackType?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  userId?: string;
}

const getTypeColor = (type?: string) => {
  switch (type) {
    case 'user-experience': return 'bg-green-100 text-green-800';
    case 'performance': return 'bg-blue-100 text-blue-800';
  case 'product_service': return 'bg-purple-100 text-purple-800';
    case 'transactional': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const containerStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: 18, border: '1px solid #f3f4f6' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 };
const titleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 6 };

export default function FeedbackCard({ feedback, onDelete, deleting }: { feedback: Feedback; onDelete?: (id: string | number) => void; deleting?: boolean }) {
  const rawType = feedback.feedbackType || '';
  const typeLabel = rawType ? String(rawType).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General';
  const badge = getTypeColor(feedback.feedbackType);
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={titleStyle}>{typeLabel}</h3>
          <div style={{display: 'flex', gap: 8}}>
            <span style={{ padding: '6px 10px', borderRadius: 9999, fontSize: 13, fontWeight: 600 }} className={badge}>
              {typeLabel}
            </span>
            <span style={{ padding: '6px 10px', borderRadius: 9999, fontSize: 13, fontWeight: 600, background: '#fff7ed', color: '#ea580c' }}>
              {feedback.rating ?? '-'} / 5
            </span>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => !deleting && onDelete(feedback.id)}
            disabled={deleting}
            title="Delete feedback"
            style={{background:'#fef2f2', color:'#b91c1c', border:'1px solid #fee2e2', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:600, cursor: deleting? 'not-allowed':'pointer'}}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>

      <div style={{ color: '#6b7280' }}>
        <p style={{ marginBottom: 12 }}>{feedback.comment || <em className="text-sm">No comment provided</em>}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
          <Calendar size={14} />
          <span style={{ fontSize: 13 }}>{feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : '—'}</span>
        </div>
      </div>
    </div>
  );
}
