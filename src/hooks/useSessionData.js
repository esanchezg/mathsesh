import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

export function useSessionData() {
  const { user } = useAuth()

  async function fetchWeakFacts(operation) {
    const { data } = await supabase.rpc('get_weak_facts', { p_user_id: user.id, p_operation: operation })
    return data ?? []
  }

  async function saveSession({ operation, startedAt, endedAt, results, xpEarned }) {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        operation,
        started_at: startedAt,
        ended_at: endedAt,
        questions_answered: results.length,
        correct: results.filter(r => r.correct).length,
        xp_earned: xpEarned,
      })
      .select()
      .single()

    if (error) throw error

    const rows = results.map(r => ({
      session_id: session.id,
      user_id: user.id,
      operation,
      operand_a: r.operandA,
      operand_b: r.operandB,
      correct: r.correct,
      response_time_ms: r.responseTimeMs,
      answered_at: r.answeredAt,
    }))

    await supabase.from('question_results').insert(rows)

    await supabase.rpc('update_kid_after_session', {
      p_user_id: user.id,
      p_xp_earned: xpEarned,
    })

    return session.id
  }

  return { fetchWeakFacts, saveSession }
}
