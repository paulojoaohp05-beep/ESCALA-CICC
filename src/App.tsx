import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clipboard, Grid2X2, List, Moon, Printer, Sun, Users } from 'lucide-react'
import { getCalendarDays, getGroupForDate, groupHasOfficer, OFFICERS, TEAMS, type Group } from './schedule'

type Filter = 'all' | 'A' | 'B' | string
type Theme = 'light' | 'dark'
type View = 'grid' | 'list'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const SHORT_MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const formatFullDate = (date: Date) => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date)
const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('escala-cicc-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}
const getInitialView = (): View => window.matchMedia('(max-width: 767px)').matches ? 'list' : 'grid'

function App() {
  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>(getInitialView)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('escala-cicc-theme', theme)
  }, [theme])

  const days = useMemo(() => getCalendarDays(cursor.getFullYear(), cursor.getMonth()), [cursor])
  const monthDays = days.filter((day) => day.getMonth() === cursor.getMonth())
  const groupCounts = { A: monthDays.filter((day) => getGroupForDate(day) === 'A').length, B: monthDays.filter((day) => getGroupForDate(day) === 'B').length }
  const selectedOfficer = OFFICERS.includes(filter) ? filter : null
  const officerWorkDays = selectedOfficer ? monthDays.filter((day) => groupHasOfficer(getGroupForDate(day), selectedOfficer)).length : 0
  const years = Array.from({ length: 31 }, (_, index) => today.getFullYear() - 10 + index)

  const moveMonth = (amount: number) => setCursor((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1))
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
  const setMonth = (month: number) => setCursor((date) => new Date(date.getFullYear(), month, 1))
  const setYear = (year: number) => setCursor((date) => new Date(year, date.getMonth(), 1))

  const copyDay = async (day: Date) => {
    const group = getGroupForDate(day)
    const team = TEAMS[group]
    const text = `${formatFullDate(day)} — Grupo ${group}\nCoordenação: Dia ${team.coordination.day} | Noite ${team.coordination.night}\nCabine Muralha: Dia ${team.cabin.day} | Noite ${team.cabin.night}`
    await navigator.clipboard.writeText(text)
    const key = day.toISOString()
    setCopied(key)
    window.setTimeout(() => setCopied(null), 1500)
  }

  const isEmphasized = (group: Group) => filter === 'all' || filter === group || (selectedOfficer ? groupHasOfficer(group, selectedOfficer) : false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Escala CICC</div>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} aria-label={`Ativar modo ${theme === 'light' ? 'escuro' : 'claro'}`} title={`Ativar modo ${theme === 'light' ? 'escuro' : 'claro'}`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <button className="print-button" onClick={() => window.print()}><Printer size={17} /><span>Imprimir</span></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div><p className="eyebrow"><CalendarDays size={14} /> PLANEJAMENTO MENSAL</p><h1>Escala de serviço</h1><p>Coordenação e Cabine Muralha</p></div>
          <div className="status-pill"><span /> Escala atualizada</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card stat-a"><div className="stat-icon"><Users size={20} /></div><div><span>PLANTÕES GRUPO A</span><strong>{groupCounts.A}</strong><small>dias em {MONTHS[cursor.getMonth()].toLowerCase()}</small></div></article>
          <article className="stat-card stat-b"><div className="stat-icon"><Users size={20} /></div><div><span>PLANTÕES GRUPO B</span><strong>{groupCounts.B}</strong><small>dias em {MONTHS[cursor.getMonth()].toLowerCase()}</small></div></article>
          <article className="stat-card stat-person"><div className="stat-icon"><CalendarDays size={20} /></div><div><span>{selectedOfficer ? 'SERVIÇO NO MÊS' : 'DIAS NO MÊS'}</span><strong>{selectedOfficer ? officerWorkDays : monthDays.length}</strong><small>{selectedOfficer ? `${monthDays.length - officerWorkDays} dias de folga` : `${MONTHS[cursor.getMonth()]} de ${cursor.getFullYear()}`}</small></div></article>
        </section>

        <section className="calendar-panel">
          <div className="calendar-toolbar">
            <div className="month-heading"><h2>{MONTHS[cursor.getMonth()]} <span>{cursor.getFullYear()}</span></h2><p>Visualização mensal da escala</p></div>
            <div className="mobile-month-nav"><button onClick={() => moveMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={20} /></button><strong>{MONTHS[cursor.getMonth()]} <span>{cursor.getFullYear()}</span></strong><button onClick={() => moveMonth(1)} aria-label="Próximo mês"><ChevronRight size={20} /></button></div>
            <div className="toolbar-actions">
              <div className="nav-buttons"><button onClick={() => moveMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={18} /></button><button className="today-button" onClick={goToday}>Hoje</button><button onClick={() => moveMonth(1)} aria-label="Próximo mês"><ChevronRight size={18} /></button></div>
              <button className="mobile-today" onClick={goToday}>Hoje</button>
              <select value={cursor.getMonth()} onChange={(event) => setMonth(Number(event.target.value))} aria-label="Selecionar mês">{MONTHS.map((month, index) => <option value={index} key={month}>{month}</option>)}</select>
              <select className="year-select" value={cursor.getFullYear()} onChange={(event) => setYear(Number(event.target.value))} aria-label="Selecionar ano">{years.map((year) => <option key={year}>{year}</option>)}</select>
              <div className="view-toggle"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Visualização em grade" title="Grade"><Grid2X2 size={17} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Visualização em lista" title="Lista"><List size={18} /></button></div>
            </div>
          </div>

          <div className="filters">
            <span>DESTACAR</span>
            <div className="filter-scroll">
              {[['all', 'Todos'], ['A', 'Grupo A'], ['B', 'Grupo B'], ...OFFICERS.map((officer) => [officer, officer])].map(([value, label]) => <button key={value} className={`${filter === value ? 'selected' : ''} filter-${value}`} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
          </div>

          {view === 'grid' ? (
            <div className="calendar-wrap">
              <div className="week-header">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
              <div className="calendar-grid">{days.map((day) => <DayCard key={day.toISOString()} day={day} currentMonth={day.getMonth() === cursor.getMonth()} today={sameDay(day, today)} dimmed={!isEmphasized(getGroupForDate(day))} selectedOfficer={selectedOfficer} copied={copied === day.toISOString()} onCopy={() => copyDay(day)} />)}</div>
            </div>
          ) : (
            <div className="list-view">{monthDays.map((day) => <DayListRow key={day.toISOString()} day={day} today={sameDay(day, today)} dimmed={!isEmphasized(getGroupForDate(day))} selectedOfficer={selectedOfficer} copied={copied === day.toISOString()} onCopy={() => copyDay(day)} />)}</div>
          )}

          <footer className="legend"><span>LEGENDA</span><div><i className="dot group-a" /> Grupo A</div><div><i className="dot group-b" /> Grupo B</div><div><i className="today-outline" /> Dia atual</div>{selectedOfficer && <><div><i className="dot service" /> Serviço</div><div><i className="dot off" /> Folga</div></>}</footer>
        </section>
      </main>
    </div>
  )
}

type DayProps = { day: Date; dimmed: boolean; selectedOfficer: string | null; copied: boolean; onCopy: () => void }

function DayCard({ day, currentMonth, today, dimmed, selectedOfficer, copied, onCopy }: DayProps & { currentMonth: boolean; today: boolean }) {
  const group = getGroupForDate(day)
  const team = TEAMS[group]
  const working = selectedOfficer ? groupHasOfficer(group, selectedOfficer) : false
  return <article className={`day-card group-${group.toLowerCase()} ${!currentMonth ? 'outside' : ''} ${today ? 'is-today' : ''} ${dimmed ? 'dimmed' : ''} ${selectedOfficer && !working ? 'day-off' : ''}`}>
    <div className="day-top"><strong><span className="mobile-weekday">{WEEKDAYS[day.getDay()]} • </span>{day.getDate()}<span className="mobile-month"> {SHORT_MONTHS[day.getMonth()]}</span></strong><div>{today && <span className="today-label">HOJE</span>}<span className="group-badge">GRUPO {group}</span></div></div>
    {selectedOfficer && <div className={`duty-state ${working ? 'working' : ''}`}>{working ? 'Em serviço' : 'Folga'}</div>}
    <ScheduleBlock title="Coordenação" day={team.coordination.day} night={team.coordination.night} />
    <ScheduleBlock title="Cabine Muralha" day={team.cabin.day} night={team.cabin.night} />
    <button className="copy-button" onClick={onCopy} title="Copiar escala do dia">{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? 'Copiado' : 'Copiar'}</button>
  </article>
}

function ScheduleBlock({ title, day, night }: { title: string; day: string; night: string }) {
  return <div className="schedule-block"><h3>{title}</h3><p><span>Dia</span><b>{day}</b></p><p><span>Noite</span><b>{night}</b></p></div>
}

function DayListRow({ day, today, dimmed, selectedOfficer, copied, onCopy }: DayProps & { today: boolean }) {
  const group = getGroupForDate(day)
  const team = TEAMS[group]
  const working = selectedOfficer ? groupHasOfficer(group, selectedOfficer) : false
  return <article className={`list-row group-${group.toLowerCase()} ${today ? 'is-today' : ''} ${dimmed ? 'dimmed' : ''}`}><div className="list-date"><strong>{WEEKDAYS[day.getDay()]} <i>•</i> {String(day.getDate()).padStart(2, '0')} {SHORT_MONTHS[day.getMonth()]}</strong>{today && <span className="today-label">HOJE</span>}</div><span className="group-badge">GRUPO {group}</span>{selectedOfficer && <span className={`duty-state ${working ? 'working' : ''}`}>{working ? 'Em serviço' : 'Folga'}</span>}<ScheduleBlock title="Coordenação" day={team.coordination.day} night={team.coordination.night} /><ScheduleBlock title="Cabine Muralha" day={team.cabin.day} night={team.cabin.night} /><button className="copy-button" onClick={onCopy}>{copied ? <Check size={15} /> : <Clipboard size={15} />}<span>{copied ? 'Copiado' : 'Copiar'}</span></button></article>
}

export default App
