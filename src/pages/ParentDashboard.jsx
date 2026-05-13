import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { getLevelInfo } from '../utils/xp'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const OP_LABEL = { multiply: '×', divide: '÷', add: '+', subtract: '−' }

export default function ParentDashboard() {
  const { signOut } = useAuth()
  const [kids, setKids] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [kidProfile, setKidProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [weakFacts, setWeakFacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)

  // Load all kid accounts once
  useEffect(() => {
    async function loadKids() {
      const { data } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('role', 'kid')
        .order('username')
      if (data?.length) {
        setKids(data)
        setSelectedId(data[0].id)
      }
    }
    loadKids()
  }, [])

  // Load selected kid's data
  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    setResetConfirm(false)
    async function load() {
      const [{ data: kp }, { data: sess }, { data: wf }] = await Promise.all([
        supabase.from('kid_profile').select('*').eq('user_id', selectedId).single(),
        supabase.from('sessions').select('*').eq('user_id', selectedId).order('started_at', { ascending: false }).limit(30),
        supabase.rpc('get_all_weak_facts'),
      ])
      setKidProfile(kp)
      setSessions(sess ?? [])
      setWeakFacts((wf ?? []).filter(f => f.user_id === selectedId))
      setLoading(false)
    }
    load()
  }, [selectedId])

  async function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return }
    setResetting(true)
    await supabase.rpc('reset_kid_progress', { p_user_id: selectedId })
    setResetConfirm(false)
    setResetting(false)
    // Reload
    const { data: kp } = await supabase.from('kid_profile').select('*').eq('user_id', selectedId).single()
    setKidProfile(kp)
    setSessions([])
    setWeakFacts([])
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0d0d0d] text-[#FF5F1F]">Loading…</div>

  const { current } = getLevelInfo(kidProfile?.total_xp ?? 0)
  const recentSessions = sessions.slice(0, 7)
  const last30Sessions = [...sessions].reverse().slice(-30)
  const selectedKid = kids.find(k => k.id === selectedId)

  const opAccuracy = ['multiply', 'divide', 'add', 'subtract'].map(op => {
    const opSessions = sessions.filter(s => s.operation === op)
    const totalQ = opSessions.reduce((sum, s) => sum + s.questions_answered, 0)
    const totalC = opSessions.reduce((sum, s) => sum + s.correct, 0)
    return { op: OP_LABEL[op], accuracy: totalQ ? Math.round((totalC / totalQ) * 100) : 0 }
  })

  const weakByOp = ['multiply', 'divide', 'add', 'subtract'].map(op => ({
    op, symbol: OP_LABEL[op],
    facts: weakFacts.filter(f => f.operation === op),
  })).filter(g => g.facts.length > 0)

  return (
    <div className="min-h-screen bg-[#0d0d0d] px-4 pt-8 pb-10 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Barlow_Condensed'] font-black text-4xl text-[#FF5F1F] uppercase">Parent View</h1>
        <button onClick={signOut} className="text-[#555] font-['Space_Mono'] text-xs hover:text-white">OUT</button>
      </div>

      {/* Kid selector */}
      {kids.length > 1 && (
        <div className="flex gap-2 mb-5">
          {kids.map(k => (
            <button
              key={k.id}
              onClick={() => setSelectedId(k.id)}
              className={`flex-1 py-3 font-['Barlow_Condensed'] font-black text-xl uppercase transition-colors ${
                selectedId === k.id ? 'bg-[#FF5F1F] text-black' : 'bg-[#1a1a1a] text-[#888]'
              }`}
            >
              {k.username}
            </button>
          ))}
        </div>
      )}

      {/* Overview */}
      <div className="bg-[#1a1a1a] p-5 mb-5">
        <div className="font-['Barlow_Condensed'] font-black text-3xl text-white uppercase">{current.title}</div>
        <div className="font-['Space_Mono'] text-[#FF5F1F] text-sm mt-1">Level {current.level}</div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Total XP" value={kidProfile?.total_xp ?? 0} />
          <Stat label="Day Streak" value={`${kidProfile?.current_streak_days ?? 0}🔥`} />
          <Stat label="Sessions" value={sessions.length} />
        </div>
      </div>

      {/* Reset */}
      <div className="mb-5">
        <button
          onClick={handleReset}
          disabled={resetting}
          className={`w-full py-3 font-['Barlow_Condensed'] font-black text-xl uppercase tracking-widest transition-colors ${
            resetConfirm
              ? 'bg-red-600 text-white'
              : 'bg-[#1a1a1a] text-[#555] hover:text-white'
          }`}
        >
          {resetting ? 'RESETTING…' : resetConfirm ? `CONFIRM RESET ${selectedKid?.username?.toUpperCase()}?` : 'RESET PROGRESS'}
        </button>
        {resetConfirm && (
          <button
            onClick={() => setResetConfirm(false)}
            className="w-full py-2 font-['Space_Mono'] text-xs text-[#555] hover:text-white mt-1"
          >
            cancel
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="font-['Space_Mono'] text-[#555] text-sm text-center py-10">No sessions yet.</div>
      ) : (
        <>
          <SectionTitle>Accuracy by Operation</SectionTitle>
          <div className="bg-[#1a1a1a] p-4 mb-5">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={opAccuracy} barSize={32}>
                <XAxis dataKey="op" tick={{ fill: '#888', fontFamily: 'Space Mono', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#888', fontFamily: 'Space Mono', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" width={32} />
                <Tooltip formatter={v => `${v}%`} contentStyle={{ background: '#242424', border: 'none', fontFamily: 'Space Mono', fontSize: 11 }} />
                <Bar dataKey="accuracy" fill="#FF5F1F" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SectionTitle>Recent Sessions</SectionTitle>
          <div className="space-y-2 mb-5">
            {recentSessions.map(s => (
              <div key={s.id} className="bg-[#1a1a1a] p-4 flex items-center justify-between">
                <div>
                  <span className="font-['Barlow_Condensed'] font-black text-lg text-white">{OP_LABEL[s.operation]}</span>
                  <span className="font-['Space_Mono'] text-[#555] text-xs ml-3">{new Date(s.started_at).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <div className="font-['Space_Mono'] text-[#FFE600] text-sm">+{s.xp_earned} XP</div>
                  <div className="font-['Space_Mono'] text-[#888] text-xs">{s.correct}/{s.questions_answered}</div>
                </div>
              </div>
            ))}
          </div>

          <SectionTitle>XP Over Last 30 Sessions</SectionTitle>
          <div className="bg-[#1a1a1a] p-4 mb-5">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={last30Sessions.map((s, i) => ({ i: i + 1, xp: s.xp_earned }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                <XAxis dataKey="i" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: '#242424', border: 'none', fontFamily: 'Space Mono', fontSize: 11 }} />
                <Line type="monotone" dataKey="xp" stroke="#FFE600" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {weakByOp.length > 0 && (
            <>
              <SectionTitle>Weak Facts</SectionTitle>
              {weakByOp.map(group => (
                <div key={group.op} className="bg-[#1a1a1a] p-4 mb-3">
                  <div className="font-['Barlow_Condensed'] font-black text-xl text-[#FF5F1F] mb-3 uppercase">{group.op}</div>
                  <div className="space-y-2">
                    {group.facts.map((f, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-['Space_Mono'] text-white text-sm">{f.operand_a} {group.symbol} {f.operand_b}</span>
                        <span className="font-['Space_Mono'] text-red-400 text-xs">{f.accuracy}% · {(f.avg_ms / 1000).toFixed(1)}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-['Space_Mono'] text-[#555] text-xs">{label}</div>
      <div className="font-['Barlow_Condensed'] font-black text-2xl text-white">{value}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 className="font-['Barlow_Condensed'] font-black text-lg text-[#888] uppercase tracking-widest mb-2">{children}</h3>
}
