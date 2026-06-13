import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useGame } from './context/GameContext'
import AppLayout from './components/layout/AppLayout'
import AuthScreen from './screens/AuthScreen'
import Dashboard from './screens/Dashboard'
import WorldMap from './screens/WorldMap'
import ChapterView from './screens/ChapterView'
import ConceptScreen from './screens/ConceptScreen'
import QuizScreen from './screens/QuizScreen'
import BossFightScreen from './screens/BossFightScreen'
import CertTrialScreen from './screens/CertTrialScreen'
import InventoryScreen from './screens/InventoryScreen'
import ProfileScreen from './screens/ProfileScreen'
import DungeonsScreen from './screens/DungeonsScreen'

function Loader() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-2xl neon-text tracking-widest animate-pulseline">MULEQUEST</div>
        <div className="text-slate-500 text-sm mt-2 font-mono">initializing runtime…</div>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const game = useGame()

  if (loading) return <Loader />
  if (!user) return <AuthScreen />
  if (!game?.ready) return <Loader />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<WorldMap />} />
        <Route path="/chapter/:chapterId" element={<ChapterView />} />
        <Route path="/chapter/:chapterId/concept/:conceptId" element={<ConceptScreen />} />
        <Route path="/chapter/:chapterId/quiz/:conceptId" element={<QuizScreen />} />
        <Route path="/chapter/:chapterId/boss" element={<BossFightScreen />} />
        <Route path="/trial/:certId" element={<CertTrialScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/dungeons" element={<DungeonsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
