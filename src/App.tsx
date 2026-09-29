import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Grid2X2, List, Moon, Printer, Sun, Users } from 'lucide-react'
import { getCommemorativeDate } from './commemorativeDates'
import { getCopomSchedule, type CopomSchedule } from './copomSchedule'
import { getHoliday, getOptionalDate, type HolidayCategory } from './holidays'
import { getFifthBusinessDay } from './payment'
import { getPublicPoliciesOfficer } from './publicPoliciesSchedule'
import { getCalendarDays, getGroupForDate, getTeamForDate, groupHasOfficer, OFFICERS, type Group } from './schedule'

type Filter = 'all' | 'A' | 'B' | string
type Theme = 'light' | 'dark'
type View = 'grid' | 'list'
type EventVisibility = { payment: boolean; holidays: boolean; commemorative: boolean }

const VISIBLE_EVENTS: EventVisibility = { payment: true, holidays: true, commemorative: true }
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const SHORT_MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const CATEGORY_LABELS: Record<HolidayCategory, string> = { national: 'Feriado nacional', state: 'Feriado estadual', municipal: 'Feriado municipal' }

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('escala-cicc-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}
const getInitialView = (): View => window.matchMedia('(max-width: 767px)').matches ? 'list' : 'grid'

function getDayEvents(day: Date) {
  return {
    holiday: getHoliday(day),
    optional: getOptionalDate(day),
    commemorative: getCommemorativeDate(day),
    payment: sameDay(day, getFifthBusinessDay(day.getFullYear(), day.getMonth())),
  }
}

function App() {
  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>(getInitialView)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const events = VISIBLE_EVENTS

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('escala-cicc-theme', theme)
  }, [theme])

  const days = useMemo(() => getCalendarDays(cursor.getFullYear(), cursor.getMonth()), [cursor])
  const monthDays = days.filter((day) => day.getMonth() === cursor.getMonth())
  const groupCounts = { A: monthDays.filter((day) => getGroupForDate(day) === 'A').length, B: monthDays.filter((day) => getGroupForDate(day) === 'B').length }
  const printMonthEvents = monthDays.flatMap((day) => {
    const dayEvents = getDayEvents(day)
    const date = `${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}`
    return [
      dayEvents.payment ? `${date} — Pagamento: 5º dia útil` : null,
      dayEvents.holiday ? `${date} — ${CATEGORY_LABELS[dayEvents.holiday.category]}: ${dayEvents.holiday.name}` : null,
      dayEvents.optional ? `${date} — Ponto facultativo: ${dayEvents.optional.name}` : null,
      dayEvents.commemorative ? `${date} — Data comemorativa: ${dayEvents.commemorative.name}` : null,
    ].filter((item): item is string => item !== null)
  })
  const selectedOfficer = OFFICERS.includes(filter) ? filter : null
  const officerWorkDays = selectedOfficer ? monthDays.filter((day) => groupHasOfficer(getGroupForDate(day), selectedOfficer)).length : 0
  const years = [2026, 2027, 2028]

  const moveMonth = (amount: number) => setCursor((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1))
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
  const setMonth = (month: number) => setCursor((date) => new Date(date.getFullYear(), month, 1))
  const setYear = (year: number) => setCursor((date) => new Date(year, date.getMonth(), 1))

  const isEmphasized = (group: Group) => filter === 'all' || filter === group || (selectedOfficer ? groupHasOfficer(group, selectedOfficer) : false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">ESCALA CICC</div>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} aria-label={`Ativar modo ${theme === 'light' ? 'escuro' : 'claro'}`} title={`Ativar modo ${theme === 'light' ? 'escuro' : 'claro'}`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <button className="print-button" onClick={() => window.print()}><Printer size={17} /><span>Imprimir escala</span></button>
        </div>
      </header>

      <main>
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
              {[['all', 'Todos'], ['A', 'Grupo A'], ['B', 'Grupo B']].map(([value, label]) => <button key={value} className={`${filter === value ? 'selected' : ''} filter-${value}`} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
          </div>

          <div className="screen-calendar">
            {view === 'grid' ? (
              <div className="calendar-wrap">
                <div className="week-header">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
                <div className="calendar-grid">{days.map((day) => <DayCard key={day.toISOString()} day={day} currentMonth={day.getMonth() === cursor.getMonth()} today={sameDay(day, today)} dimmed={!isEmphasized(getGroupForDate(day))} selectedOfficer={selectedOfficer} events={events} />)}</div>
              </div>
            ) : (
              <div className="list-view">{monthDays.map((day) => <DayListRow key={day.toISOString()} day={day} today={sameDay(day, today)} dimmed={!isEmphasized(getGroupForDate(day))} selectedOfficer={selectedOfficer} events={events} />)}</div>
            )}
          </div>
          <div className="print-calendar">
            <h1>ESCALA CICC — {MONTHS[cursor.getMonth()].toUpperCase()} {cursor.getFullYear()}</h1>
            <div className="calendar-wrap">
              <div className="week-header">{WEEKDAYS.map((day) => <div key={day}>{day}</div>)}</div>
              <div className="calendar-grid">{days.map((day) => <DayCard key={day.toISOString()} day={day} currentMonth={day.getMonth() === cursor.getMonth()} today={sameDay(day, today)} dimmed={false} selectedOfficer={null} events={VISIBLE_EVENTS} />)}</div>
            </div>
            <div className="print-footnotes"><h2>Ocorrências do mês</h2><ul>{printMonthEvents.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>

          <footer className="legend"><span>LEGENDA</span><div><i className="dot group-a" /> Grupo A</div><div><i className="dot group-b" /> Grupo B</div><div><i className="today-outline" /> Hoje</div><div><i className="dot payment" /> Pagamento</div><div><i className="dot national" /> Feriado nacional</div><div><i className="dot state" /> Estadual</div><div><i className="dot municipal" /> Municipal</div><div><i className="dot commemorative" /> Data comemorativa</div>{selectedOfficer && <><div><i className="dot service" /> Serviço</div><div><i className="dot off" /> Folga</div></>}</footer>
        </section>
      </main>
    </div>
  )
}

type DayProps = { day: Date; dimmed: boolean; selectedOfficer: string | null; events: EventVisibility }

function EventBadges({ day, visibility }: { day: Date; visibility: EventVisibility }) {
  const dayEvents = getDayEvents(day)
  return <div className="event-badges">
    {visibility.payment && dayEvents.payment && <div className="event-item payment"><span>Pagamento</span><b>5º dia útil</b></div>}
    {visibility.holidays && dayEvents.holiday && <div className={`event-item holiday-${dayEvents.holiday.category}`}><span>{CATEGORY_LABELS[dayEvents.holiday.category]}</span><b>{dayEvents.holiday.name}</b></div>}
    {visibility.holidays && dayEvents.optional && <div className="event-item optional"><span>Ponto facultativo</span><b>{dayEvents.optional.name}</b></div>}
    {visibility.commemorative && dayEvents.commemorative && <div className="event-item commemorative"><span>Data comemorativa</span><b>{dayEvents.commemorative.name}</b></div>}
  </div>
}

function DayCard({ day, currentMonth, today, dimmed, selectedOfficer, events }: DayProps & { currentMonth: boolean; today: boolean }) {
  const group = getGroupForDate(day)
  const team = getTeamForDate(day)
  const copom = getCopomSchedule(day)
  const publicPoliciesOfficer = getPublicPoliciesOfficer(day)
  const working = selectedOfficer ? groupHasOfficer(group, selectedOfficer) : false
  return <article className={`day-card group-${group.toLowerCase()} ${!currentMonth ? 'outside' : ''} ${today ? 'is-today' : ''} ${dimmed ? 'dimmed' : ''} ${selectedOfficer && !working ? 'day-off' : ''}`}>
    <div className="day-top"><strong><span className="mobile-weekday">{WEEKDAYS[day.getDay()]} • </span>{day.getDate()}<span className="mobile-month"> {SHORT_MONTHS[day.getMonth()]}</span></strong><div>{today && <span className="today-label">HOJE</span>}<span className="group-badge">GRUPO {group}</span></div></div>
    <EventBadges day={day} visibility={events} />
    {selectedOfficer && <div className={`duty-state ${working ? 'working' : ''}`}>{working ? 'Em serviço' : 'Folga'}</div>}
    <ScheduleBlock title="CICC — Coordenação" day={team.coordination.day} night={team.coordination.night} copom={copom} />
    <ScheduleBlock title="Cabine Muralha" day={team.cabin.day} night={team.cabin.night} copom={copom} />
    <PublicPoliciesBlock officer={publicPoliciesOfficer} />
  </article>
}

function ScheduleBlock({ title, day, night, copom }: { title: string; day: string; night: string; copom: CopomSchedule }) {
  return <div className="schedule-block"><h3>{title}</h3><p><span>Dia</span><b>{day}</b><em className="copom-team">COPOM {copom.day}</em></p><p><span>Noite</span><b>{night}</b><em className="copom-team">COPOM {copom.night}</em></p></div>
}

function PublicPoliciesBlock({ officer }: { officer: string }) {
  return <div className="public-policies"><h3>Políticas Públicas</h3><b>{officer}</b></div>
}

function DayListRow({ day, today, dimmed, selectedOfficer, events }: DayProps & { today: boolean }) {
  const group = getGroupForDate(day)
  const team = getTeamForDate(day)
  const copom = getCopomSchedule(day)
  const publicPoliciesOfficer = getPublicPoliciesOfficer(day)
  const working = selectedOfficer ? groupHasOfficer(group, selectedOfficer) : false
  return <article className={`list-row group-${group.toLowerCase()} ${today ? 'is-today' : ''} ${dimmed ? 'dimmed' : ''}`}><div className="list-date"><strong>{WEEKDAYS[day.getDay()]} <i>•</i> {String(day.getDate()).padStart(2, '0')} {SHORT_MONTHS[day.getMonth()]}</strong>{today && <span className="today-label">HOJE</span>}</div><div className="list-status"><span className="group-badge">GRUPO {group}</span>{selectedOfficer && <span className={`duty-state ${working ? 'working' : ''}`}>{working ? 'Em serviço' : 'Folga'}</span>}</div><EventBadges day={day} visibility={events} /><ScheduleBlock title="CICC — Coordenação" day={team.coordination.day} night={team.coordination.night} copom={copom} /><ScheduleBlock title="Cabine Muralha" day={team.cabin.day} night={team.cabin.night} copom={copom} /><PublicPoliciesBlock officer={publicPoliciesOfficer} /></article>
}

export default App
