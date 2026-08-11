'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingRow {
  id: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  date: string;
  period: string;
  withSkipper: boolean;
  totalPrice: number;
  depositPaid: number;
  remainingAmount: number;
  boatName: string;
  notes: string | null;
}

interface BoatRow {
  id: string;
  slug: string;
  name: string;
  priceHalfDay: number;
  priceFullDay: number;
  skipperHalfDay: number;
  skipperFullDay: number;
  securityDeposit: number | null;
  active: boolean;
}

interface Props {
  bookings: BookingRow[];
  boats: BoatRow[];
}

const dateFmt = new Intl.DateTimeFormat('ca-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function AdminDashboard({ bookings, boats }: Props) {
  const [tab, setTab] = useState<'bookings' | 'boats'>('bookings');
  const [bookingRows, setBookingRows] = useState(bookings);
  const [boatRows, setBoatRows] = useState(boats);
  const router = useRouter();

  const stats = useMemo(() => {
    const confirmed = bookingRows.filter((b) => b.status === 'CONFIRMED');
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = confirmed.filter((b) => b.date.slice(0, 10) >= today);
    const depositsCollected = confirmed.reduce((sum, b) => sum + b.depositPaid, 0);
    return {
      upcomingCount: upcoming.length,
      confirmedCount: confirmed.length,
      depositsCollected,
    };
  }, [bookingRows]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function cancelBooking(id: string) {
    if (!confirm('Cancel·lar aquesta reserva i avisar el client per email?')) return;
    const res = await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, status: 'CANCELLED' }),
    });
    if (res.ok) {
      setBookingRows((rows) => rows.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r)));
    } else {
      alert('No s\'ha pogut cancel·lar la reserva.');
    }
  }

  function updateBoatField(id: string, field: keyof BoatRow, value: number | boolean) {
    setBoatRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function saveBoat(boat: BoatRow) {
    const res = await fetch('/api/admin/boats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boatId: boat.id,
        priceHalfDay: Number(boat.priceHalfDay),
        priceFullDay: Number(boat.priceFullDay),
        skipperHalfDay: Number(boat.skipperHalfDay),
        skipperFullDay: Number(boat.skipperFullDay),
        securityDeposit: boat.securityDeposit === null ? null : Number(boat.securityDeposit),
        active: boat.active,
      }),
    });
    if (!res.ok) alert('No s\'han pogut desar els canvis.');
  }

  return (
    <div className="admin-root">
      <div className="admin-header">
        <h1>⛵ Rent A Boat Cadaqués — Admin</h1>
        <button className="admin-logout" onClick={handleLogout}>Sortir</button>
      </div>

      <div className="admin-body">
        <div className="admin-stats">
          <div className="admin-stat">
            <div className="num">{stats.upcomingCount}</div>
            <div className="label">Reserves properes</div>
          </div>
          <div className="admin-stat">
            <div className="num">{stats.confirmedCount}</div>
            <div className="label">Confirmades (total)</div>
          </div>
          <div className="admin-stat">
            <div className="num">{stats.depositsCollected.toFixed(0)}€</div>
            <div className="label">Dipòsits cobrats</div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
            Reserves
          </button>
          <button className={`admin-tab ${tab === 'boats' ? 'active' : ''}`} onClick={() => setTab('boats')}>
            Embarcacions i preus
          </button>
        </div>

        {tab === 'bookings' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Barca</th>
                  <th>Data</th>
                  <th>Torn</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Dipòsit</th>
                  <th>Estat</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Encara no hi ha reserves.</td></tr>
                )}
                {bookingRows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bookingRef}</td>
                    <td>{b.boatName}</td>
                    <td>{dateFmt.format(new Date(b.date))}</td>
                    <td>{b.period === 'HALF_DAY' ? 'Mig dia' : 'Dia complet'}{b.withSkipper ? ' · patró' : ''}</td>
                    <td>
                      {b.customerName}<br />
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{b.customerEmail} · {b.customerPhone}</span>
                    </td>
                    <td>{b.totalPrice.toFixed(0)}€</td>
                    <td>{b.depositPaid.toFixed(0)}€</td>
                    <td><span className={`admin-badge ${b.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}>{b.status === 'CONFIRMED' ? 'Confirmada' : 'Cancel·lada'}</span></td>
                    <td>
                      {b.status === 'CONFIRMED' && (
                        <button className="admin-action-btn danger" onClick={() => cancelBooking(b.id)}>Cancel·lar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'boats' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Barca</th>
                  <th>Mig dia (€)</th>
                  <th>Dia complet (€)</th>
                  <th>Patró mig dia (€)</th>
                  <th>Patró dia complet (€)</th>
                  <th>Fiança (€)</th>
                  <th>Activa</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {boatRows.map((boat) => (
                  <tr key={boat.id}>
                    <td>{boat.name}</td>
                    <td><input type="number" value={boat.priceHalfDay} onChange={(e) => updateBoatField(boat.id, 'priceHalfDay', Number(e.target.value))} /></td>
                    <td><input type="number" value={boat.priceFullDay} onChange={(e) => updateBoatField(boat.id, 'priceFullDay', Number(e.target.value))} /></td>
                    <td><input type="number" value={boat.skipperHalfDay} onChange={(e) => updateBoatField(boat.id, 'skipperHalfDay', Number(e.target.value))} /></td>
                    <td><input type="number" value={boat.skipperFullDay} onChange={(e) => updateBoatField(boat.id, 'skipperFullDay', Number(e.target.value))} /></td>
                    <td><input type="number" value={boat.securityDeposit ?? 0} onChange={(e) => updateBoatField(boat.id, 'securityDeposit', Number(e.target.value))} /></td>
                    <td><input type="checkbox" checked={boat.active} onChange={(e) => updateBoatField(boat.id, 'active', e.target.checked)} /></td>
                    <td><button className="admin-action-btn save" onClick={() => saveBoat(boat)}>Desar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
