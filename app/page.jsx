"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import LoginOverlay from '@/components/LoginOverlay';
import Sidebar from '@/components/Sidebar';
import Stage from '@/components/Stage';
import ScribbleOverlay from '@/components/ScribbleOverlay';
import Dashboard from '@/components/Dashboard';
import { useSession } from 'next-auth/react';
import { loadSimulations, saveSimulation, deleteSimulation } from '@/lib/actions';
import { getRoofContainerDims, getLayoutCandidate } from '@/utils/geometry';

import { TIER_PRICES, PRICES, HOURS_PER_WEEK } from '@/utils/electricity';

export default function App() {
  const { data: session, status } = useSession();
  const user = session?.user || null;

  // SIMULATIONS
  const [simulations, setSimulations] = useState([]);
  const [loadingSims, setLoadingSims] = useState(true);
  const [currentSimulationId, setCurrentSimulationId] = useState(null);
  const [scribbles, setScribbles] = useState([]);

  // CUSTOMER
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // STEP 1: ELECTRICITY
  const [elecType, setElecType] = useState('dan_dung'); // dan_dung, san_xuat, kinh_doanh, hanh_chinh
  const [elecVoltage, setElecVoltage] = useState('<6');
  const [elecAdminTarget, setElecAdminTarget] = useState('benh_vien');
  const [elecInputType, setElecInputType] = useState('money');
  const [elecKwhBT, setElecKwhBT] = useState('');
  const [elecKwhCD, setElecKwhCD] = useState('');
  const [elecKwhTD, setElecKwhTD] = useState('');
  const [moneyInput, setMoneyInput] = useState('3.000.000');

  // STEP 2: CAPACITY
  const [seasonCoef, setSeasonCoef] = useState(3);
  const [panelWattage, setPanelWattage] = useState(630);

  // STEP 3: ROOFS
  const [roofs, setRoofs] = useState([{ id: 1, name: 'Mái 1', shape: 'rectangle', w: 4, h: 5, w2: 4 }]);
  const nextRoofId = useRef(2);

  // STEP 4: PANELS
  const [machW, setMachW] = useState(1.15);
  const [machH, setMachH] = useState(2.4);
  const [gap, setGap] = useState(0);
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const nextId = useRef(1);

  // Debounce timer for auto-save
  const saveTimer = useRef(null);

  // ── AUTH & DATA ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email) {
      setLoadingSims(true);
      loadSimulations(user.email).then(sims => {
        setSimulations(sims || []);
        setLoadingSims(false);
      }).catch(err => {
        console.error(err);
        setLoadingSims(false);
      });
    } else {
      setSimulations([]);
      setCurrentSimulationId(null);
      setLoadingSims(false);
    }
  }, [user?.email]);

  // ── AUTO-SAVE (debounced 2s) ──────────────────────────────────
  const buildCurrentSim = useCallback(() => {
    if (!currentSimulationId || !user) return null;
    const base = simulations.find(s => s.id === currentSimulationId);
    if (!base) return null;
    return {
      ...base,
      updatedAt: new Date().toISOString(),
      customerName, customerPhone, customerAddress,
      elecType, elecVoltage, elecAdminTarget, elecInputType, elecKwhBT, elecKwhCD, elecKwhTD,
      moneyInput, seasonCoef, panelWattage,
      roofs, machines, gap, machW, machH, scribbles,
    };
  }, [currentSimulationId, user, simulations, customerName, customerPhone, customerAddress,
      elecType, elecVoltage, elecAdminTarget, elecInputType, elecKwhBT, elecKwhCD, elecKwhTD,
      moneyInput, seasonCoef, panelWattage, roofs, machines, gap, machW, machH, scribbles]);

  useEffect(() => {
    if (!currentSimulationId || !user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const sim = buildCurrentSim();
      if (!sim) return;
      // Update local state
      setSimulations(prev => prev.map(s => s.id === currentSimulationId ? sim : s));
      // Save to Supabase
      try {
        await saveSimulation(sim, user.email);
      } catch (e) {
        console.error('Lỗi lưu simulation:', e);
      }
    }, 2000);
    return () => clearTimeout(saveTimer.current);
  }, [customerName, customerPhone, customerAddress, elecType, elecVoltage, elecAdminTarget, elecInputType, elecKwhBT, elecKwhCD, elecKwhTD, moneyInput, seasonCoef, panelWattage,
      roofs, machines, gap, machW, machH, scribbles, currentSimulationId]);

  // ── SIMULATION CRUD ───────────────────────────────────────────
  const handleCreateSimulation = async (name) => {
    const newSim = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: '', customerPhone: '', customerAddress: '',
      elecType: 'dan_dung', elecVoltage: '<6', elecAdminTarget: 'benh_vien', elecInputType: 'money', elecKwhBT: '', elecKwhCD: '', elecKwhTD: '',
      moneyInput: '3.000.000', seasonCoef: 3, panelWattage: 630,
      roofs: [{ id: 1, name: 'Mái 1', shape: 'rectangle', w: 4, h: 5, w2: 4 }],
      machines: [], gap: 0, machW: 1.15, machH: 2.4, scribbles: [],
    };
    setSimulations(prev => [newSim, ...prev]);
    try { await saveSimulation(newSim, user.email); } catch (e) { console.error(e); }
    loadSimulationIntoState(newSim);
  };

  const loadSimulationIntoState = (sim) => {
    setCurrentSimulationId(sim.id);
    setCustomerName(sim.customerName || '');
    setCustomerPhone(sim.customerPhone || '');
    setCustomerAddress(sim.customerAddress || '');
    setElecType(sim.elecType || 'dan_dung');
    setElecVoltage(sim.elecVoltage || '<6');
    setElecAdminTarget(sim.elecAdminTarget || 'benh_vien');
    setElecInputType(sim.elecInputType || 'money');
    setElecKwhBT(sim.elecKwhBT || '');
    setElecKwhCD(sim.elecKwhCD || '');
    setElecKwhTD(sim.elecKwhTD || '');
    setMoneyInput(sim.moneyInput || '3.000.000');
    setSeasonCoef(sim.seasonCoef || 3);
    setPanelWattage(sim.panelWattage || 630);
    setRoofs(sim.roofs || [{ id: 1, name: 'Mái 1', shape: 'rectangle', w: 4, h: 5, w2: 4 }]);
    setMachines(sim.machines || []);
    setGap(sim.gap || 0);
    setMachW(sim.machW || 1.15);
    setMachH(sim.machH || 2.4);
    setScribbles(sim.scribbles || []);
    nextId.current = sim.machines?.length ? Math.max(...sim.machines.map(m => m.id)) + 1 : 1;
    nextRoofId.current = sim.roofs?.length ? Math.max(...sim.roofs.map(r => r.id)) + 1 : 2;
  };

  const handleSelectSimulation = (id) => {
    const sim = simulations.find(s => s.id === id);
    if (sim) loadSimulationIntoState(sim);
  };

  const handleDeleteSimulation = async (id) => {
    setSimulations(prev => prev.filter(s => s.id !== id));
    if (currentSimulationId === id) setCurrentSimulationId(null);
    try { await deleteSimulation(id); } catch (e) { console.error(e); }
  };

  const handleRenameSimulation = async (id, newName) => {
    const updated = simulations.map(s =>
      s.id === id ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
    );
    setSimulations(updated);
    const sim = updated.find(s => s.id === id);
    if (sim) try { await saveSimulation(sim, user.email); } catch (e) { console.error(e); }
  };

  // ── ELECTRICITY CALCULATION ───────────────────────────────────
  const parseMoney = (str) => { const d = (str || '').replace(/[^\d]/g, ''); return d ? parseInt(d, 10) : 0; };
  let money = parseMoney(moneyInput);
  let totalKwh = 0;

  if (elecType === 'dan_dung') {
    const preTax = money / 1.1;
    let remaining = preTax;
    TIER_PRICES.forEach(t => {
      const width = isFinite(t.to) ? t.to - t.from : Infinity;
      let kwh = 0;
      if (remaining > 0 && t.price > 0) {
        if (!isFinite(width)) { kwh = remaining / t.price; remaining = 0; }
        else { const mc = width * t.price; if (remaining >= mc) { kwh = width; remaining -= mc; } else { kwh = remaining / t.price; remaining = 0; } }
      }
      totalKwh += kwh;
    });
  } else if (elecType === 'hanh_chinh') {
    const flat_price = PRICES.hanh_chinh[elecAdminTarget]?.[elecVoltage] || 2072;
    const preTax = money / 1.1;
    totalKwh = preTax / flat_price;
  } else {
    // san_xuat or kinh_doanh
    const rates = PRICES[elecType]?.[elecVoltage] || PRICES.san_xuat['<6'];
    if (elecInputType === 'money') {
      const avg_price = (rates.bt * HOURS_PER_WEEK.bt + rates.cd * HOURS_PER_WEEK.cd + rates.td * HOURS_PER_WEEK.td) / HOURS_PER_WEEK.total;
      const preTax = money / 1.1;
      totalKwh = preTax / avg_price;
    } else {
      const bt = parseFloat(elecKwhBT) || 0;
      const cd = parseFloat(elecKwhCD) || 0;
      const td = parseFloat(elecKwhTD) || 0;
      totalKwh = bt + cd + td;
      const preTaxMoney = bt * rates.bt + cd * rates.cd + td * rates.td;
      money = preTaxMoney * 1.1; // estimate total money
    }
  }

  const dailyConsumptionKwh = totalKwh / 30;
  const requiredKwp = seasonCoef > 0 ? dailyConsumptionKwh / seasonCoef : 0;
  const requiredPanelCount = requiredKwp > 0 ? Math.ceil((requiredKwp * 1000) / panelWattage) : 0;

  // ── ROOF / PANEL ACTIONS ──────────────────────────────────────
  const handleAutoLayout = () => {
    let quota = requiredPanelCount > 0 ? requiredPanelCount : Infinity;
    const newMachines = [];
    roofs.forEach(roof => {
      const candA = getLayoutCandidate(roof, machW, machH, gap);
      const candB = getLayoutCandidate(roof, machH, machW, gap);
      const best = candB.length > candA.length ? candB : candA;
      const place = Math.min(best.length, quota);
      for (let i = 0; i < place; i++) newMachines.push({ id: nextId.current++, section: roof.id, ...best[i] });
      quota -= place;
    });
    setMachines(newMachines);
    setSelectedMachineId(null);
  };

  const handleAddRoof = () => {
    const nextNum = roofs.length > 0 ? Math.max(...roofs.map(r => parseInt(r.name.match(/\d+/)?.[0] || 0))) + 1 : 1;
    setRoofs(prev => [...prev, { id: nextRoofId.current++, name: `Mái ${nextNum}`, shape: 'rectangle', w: 4, h: 5, w2: 4 }]);
  };

  const handleDeleteRoof = (roofId) => {
    setRoofs(prev => prev.filter(r => r.id !== roofId));
    setMachines(prev => prev.filter(m => m.section !== roofId));
  };

  const handleRotateAllInSection = (roofId) => {
    const roof = roofs.find(r => r.id === roofId);
    if (!roof) return;
    const secM = machines.filter(m => m.section === roofId);
    const mw = secM.length > 0 ? secM[0].h : machH;
    const mh = secM.length > 0 ? secM[0].w : machW;
    const candidates = getLayoutCandidate(roof, mw, mh, gap);
    setMachines(prev => [
      ...prev.filter(m => m.section !== roofId),
      ...candidates.map(item => ({ id: nextId.current++, section: roofId, ...item })),
    ]);
    setSelectedMachineId(null);
  };

  const handleAddOnePanel = (roofId) => {
    const roof = roofs.find(r => r.id === roofId);
    if (!roof) return;
    const dims = getRoofContainerDims(roof);
    const cascade = machines.filter(m => m.section === roofId).length % 6;
    const x = Math.min(0.15 + cascade * 0.25, Math.max(0, dims.w - machW));
    const y = Math.min(0.15 + cascade * 0.25, Math.max(0, dims.h - machH));
    const p = { id: nextId.current++, section: roofId, x, y, w: machW, h: machH };
    setMachines(prev => [...prev, p]);
    setSelectedMachineId(p.id);
  };

  const handleRotatePanel = (mId) => {
    setMachines(prev => prev.map(m => {
      if (m.id !== mId) return m;
      const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
      return { ...m, x: cx - m.h / 2, y: cy - m.w / 2, w: m.h, h: m.w };
    }));
  };

  const selectedMachineIdRef = useRef(selectedMachineId);
  useEffect(() => { selectedMachineIdRef.current = selectedMachineId; }, [selectedMachineId]);

  const handleRemoveSelectedPanel = useCallback((id = null) => {
    const idToRemove = id?.target ? selectedMachineIdRef.current : (id ?? selectedMachineIdRef.current);
    if (idToRemove == null) return;
    setMachines(prev => prev.filter(m => String(m.id) !== String(idToRemove)));
    setSelectedMachineId(null);
  }, []);

  const handleClearAllPanels = () => { setMachines([]); setSelectedMachineId(null); };

  // Keyboard delete
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        if (selectedMachineIdRef.current != null) {
          e.preventDefault();
          handleRemoveSelectedPanel();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRemoveSelectedPanel]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── RENDER ────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-muted)]">
        <p className="text-sm text-[var(--color-muted-foreground)]">Đang kết nối…</p>
      </div>
    );
  }

  if (!user) return <LoginOverlay />;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        user={user}
        currentSimulationId={currentSimulationId}
        onBackToDashboard={() => setCurrentSimulationId(null)}
      />

      {!currentSimulationId ? (
        <main className="flex-1 overflow-auto bg-[var(--color-muted)]">
          <Dashboard
            loading={loadingSims}
            simulations={simulations}
            onCreateSimulation={handleCreateSimulation}
            onDeleteSimulation={handleDeleteSimulation}
            onSelectSimulation={handleSelectSimulation}
            onRenameSimulation={handleRenameSimulation}
          />
        </main>
      ) : (
        <>
          <div className="flex flex-1 overflow-hidden relative">
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              machines={machines}
              customerName={customerName} setCustomerName={setCustomerName}
              customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
              customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
              moneyInput={moneyInput} setMoneyInput={setMoneyInput}
              elecType={elecType} setElecType={setElecType}
              elecVoltage={elecVoltage} setElecVoltage={setElecVoltage}
              elecAdminTarget={elecAdminTarget} setElecAdminTarget={setElecAdminTarget}
              elecInputType={elecInputType} setElecInputType={setElecInputType}
              elecKwhBT={elecKwhBT} setElecKwhBT={setElecKwhBT}
              elecKwhCD={elecKwhCD} setElecKwhCD={setElecKwhCD}
              elecKwhTD={elecKwhTD} setElecKwhTD={setElecKwhTD}
              calculatedMoney={money}
              seasonCoef={seasonCoef} setSeasonCoef={setSeasonCoef}
              panelWattage={panelWattage} setPanelWattage={setPanelWattage}
              roofs={roofs} setRoofs={setRoofs}
              machW={machW} setMachW={setMachW}
              machH={machH} setMachH={setMachH}
              gap={gap} setGap={setGap}
              totalKwh={totalKwh}
              dailyConsumptionKwh={dailyConsumptionKwh}
              requiredKwp={requiredKwp}
              requiredPanelCount={requiredPanelCount}
              onAddRoof={handleAddRoof}
              onDeleteRoof={handleDeleteRoof}
              onAutoLayout={handleAutoLayout}
              onAddPanel={handleAddOnePanel}
              onRemoveSelectedPanel={handleRemoveSelectedPanel}
              onClearAllPanels={handleClearAllPanels}
              selectedMachineId={selectedMachineId}
            />
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              <Stage
                roofs={roofs} machines={machines} setMachines={setMachines}
                scale={60} selectedMachineId={selectedMachineId}
                setSelectedMachineId={setSelectedMachineId}
                onRotateMachine={handleRotatePanel}
                onRotateAllInSection={handleRotateAllInSection}
                onToggleSidebar={() => setSidebarOpen(o => !o)}
              />
            </div>
          </div>
          <ScribbleOverlay scribbles={scribbles} onScribblesChange={setScribbles} />
        </>
      )}
    </div>
  );
}
