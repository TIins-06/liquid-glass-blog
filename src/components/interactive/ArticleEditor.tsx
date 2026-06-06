import { useState, useEffect, useRef } from 'react';

interface ArticleData {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  draft: boolean;
}

interface Props {
  initialSlug?: string;
}

export default function ArticleEditor({ initialSlug }: Props) {
  const [article, setArticle] = useState<ArticleData>({
    slug: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    content: '',
    draft: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!!initialSlug);
  const [dark, setDark] = useState(true);
  const [MdEditor, setMdEditor] = useState<any>(null);
  const [editorReady, setEditorReady] = useState(false);

  // Dynamic import of md-editor-v3 (client only)
  useEffect(() => {
    (async () => {
      try {
        const mod = await import('md-editor-v3');
        await import('md-editor-v3/lib/style.css');
        setMdEditor(() => mod.MdEditor);
        setEditorReady(true);
      } catch (e) {
        console.error('Failed to load md-editor-v3:', e);
      }
    })();
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    setDark(theme === 'dark');

    if (initialSlug) {
      fetch('/api/articles/manage?slug=' + encodeURIComponent(initialSlug))
        .then(r => r.json())
        .then(data => {
          if (data && data.slug) {
            setArticle(data);
            setTagInput((data.tags || []).join(', '));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialSlug]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60) || 'untitled-' + Date.now();
  };

  const handleTitleChange = (val: string) => {
    setArticle(prev => ({
      ...prev,
      title: val,
      slug: prev.slug || generateSlug(val),
    }));
  };

  const handleSave = async () => {
    if (!article.title.trim()) { alert('请输入文章标题'); return; }
    setSaving(true); setSaved(false);
    const tags = tagInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    try {
      const resp = await fetch('/api/articles/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, tags }),
      });
      const result = await resp.json();
      if (result.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else alert('保存失败: ' + (result.error || ''));
    } catch { alert('网络错误'); }
    setSaving(false);
  };

  const handlePublish = async () => {
    const tags = tagInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    setSaving(true);
    try {
      const resp = await fetch('/api/articles/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, tags, draft: false }),
      });
      const result = await resp.json();
      if (result.ok) window.location.href = '/admin/articles';
      else alert('发布失败: ' + (result.error || ''));
    } catch { alert('网络错误'); }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
    fontSize: '0.75rem', outline: 'none',
  };

  if (loading) {
    return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}><p style={{ color:'var(--text-muted)' }}>加载中...</p></div>;
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'calc(100vh - 5rem)' }}>
      {/* Top toolbar */}
      <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem 1rem',borderBottom:'1px solid var(--glass-border)',flexWrap:'wrap' }}>
        <input type="text" value={article.title} onChange={e => handleTitleChange(e.target.value)}
          placeholder="文章标题..." style={{ ...inputStyle, flex:1,minWidth:'200px',fontSize:'0.875rem',fontWeight:600 }} />
        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
          placeholder="标签（逗号分隔）..." style={{ ...inputStyle, width:'200px' }} />
        <input type="date" value={article.date}
          onChange={e => setArticle(prev => ({ ...prev, date: e.target.value }))} style={inputStyle} />
        <label style={{ display:'flex',alignItems:'center',gap:'0.25rem',fontSize:'0.75rem',color:'var(--text-secondary)',cursor:'pointer' }}>
          <input type="checkbox" checked={article.draft}
            onChange={e => setArticle(prev => ({ ...prev, draft: e.target.checked }))}
            style={{ accentColor:'var(--accent-1)' }} /> 草稿
        </label>
        <button onClick={handleSave} disabled={saving}
          style={{ padding:'0.5rem 1rem',borderRadius:'0.5rem',fontSize:'0.75rem',fontWeight:500,background:'var(--glass-bg)',border:'1px solid var(--glass-border)',color: saved?'#22c55e':'var(--text-primary)',cursor:'pointer' }}>
          {saving ? '保存中...' : saved ? '✅ 已保存' : '💾 保存'}
        </button>
        <button onClick={handlePublish} disabled={saving}
          style={{ padding:'0.5rem 1rem',borderRadius:'0.5rem',fontSize:'0.75rem',fontWeight:500,background:'linear-gradient(135deg,var(--accent-1),var(--accent-2))',border:'none',color:'white',cursor:'pointer' }}>
          🚀 发布
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex:1,overflow:'hidden' }}>
        {editorReady && MdEditor ? (
          <MdEditor
            modelValue={article.content}
            onChange={(val: string) => setArticle(prev => ({ ...prev, content: val }))}
            theme={dark ? 'dark' : 'light'}
            language="zh-CN"
            previewTheme="github"
            style={{ height:'100%' }}
            preview={true}
          />
        ) : (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%' }}>
            <p style={{ color:'var(--text-muted)' }}>编辑器加载中...</p>
          </div>
        )}
      </div>
    </div>
  );
}
