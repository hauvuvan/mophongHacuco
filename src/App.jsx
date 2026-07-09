import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LoginOverlay from './components/LoginOverlay';
import Sidebar from './components/Sidebar';
import Stage from './components/Stage';
import Stats from './components/Stats';
import ScribbleOverlay from './components/ScribbleOverlay';
import Dashboard from './components/Dashboard';
import { getSession, getUsers, initDefaultAdmin, clearSession } from './utils/auth';
import { getRoofContainerDims, getLayoutCandidate } from './utils/geometry';

const TIER_PRICES = [
  { from: 0,   to: 50,       price: 1984 },
  { from: 50,  to: 100,      price: 2050 },
  { from: 100, to: 200,      price: 2380 },
  { from: 200, to: 300,      price: 2998 },
  { from: 300, to: 400,      price: 3350 },
  { from: 400, to: Infinity, price: 3460 }
];

export default function App() {
  const [user, setUser] = useState(null);

  // SIMULATIONS MANAGEMENT
  const [simulations, setSimulations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hacuco_simulations')) || [];
    } catch {
      return [];
    }
  });
  const [currentSimulationId, setCurrentSimulationId] = useState(null);
  const [scribbles, setScribbles] = useState([]);
  
  // CUSTOMER INFORMATION
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // STEP 1: MONEY
  const [moneyInput, setMoneyInput] = useState('3.000.000');
  
  // STEP 2: REQUIRED CAPACITY
  const [seasonCoef, setSeasonCoef] = useState(3);
  const [panelWattage, setPanelWattage] = useState(630);
  
  // STEP 3: ROOFS
  const [roofs, setRoofs] = useState([
    { id: 1, name: "Mái 1", shape: "rectangle", w: 4, h: 5, w2: 4 }
  ]);
  const nextRoofId = useRef(2);

  // STEP 4: PANELS
  const [machW, setMachW] = useState(1.15);
  const [machH, setMachH] = useState(2.4);
  const [gap, setGap] = useState(0);
  
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const nextId = useRef(1);

  // On mount session restore
  useEffect(() => {
    const startAuth = async () => {
      await initDefaultAdmin();
      const session = getSession();
      if (session) {
        const users = getUsers();
        const userMatch = users.find(u => u.email.toLowerCase() === session.email.toLowerCase());
        if (userMatch) {
          setUser({ email: userMatch.email, role: userMatch.role });
        } else {
          clearSession();
        }
      }
    };
    startAuth();
  }, []);

  // SIMULATIONS NAVIGATION & MANAGEMENT
  const handleCreateSimulation = (name) => {
    const newSim = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      moneyInput: '3.000.000',
      seasonCoef: 3,
      panelWattage: 630,
      roofs: [{ id: 1, name: "Mái 1", shape: "rectangle", w: 4, h: 5, w2: 4 }],
      machines: [],
      gap: 0,
      machW: 1.15,
      machH: 2.4,
      scribbles: []
    };
    
    const updated = [...simulations, newSim];
    setSimulations(updated);
    localStorage.setItem('hacuco_simulations', JSON.stringify(updated));
    loadSimulation(newSim);
  };

  const loadSimulation = (sim) => {
    setCurrentSimulationId(sim.id);
    setCustomerName(sim.customerName || '');
    setCustomerPhone(sim.customerPhone || '');
    setCustomerAddress(sim.customerAddress || '');
    setMoneyInput(sim.moneyInput || '');
    setSeasonCoef(sim.seasonCoef || 3);
    setPanelWattage(sim.panelWattage || 630);
    setRoofs(sim.roofs || [{ id: 1, name: "Mái 1", shape: "rectangle", w: 4, h: 5, w2: 4 }]);
    setMachines(sim.machines || []);
    setGap(sim.gap || 0);
    setMachW(sim.machW || 1.15);
    setMachH(sim.machH || 2.4);
    setScribbles(sim.scribbles || []);
    
    // Set next panel ID based on loaded machines
    if (sim.machines && sim.machines.length > 0) {
      nextId.current = Math.max(...sim.machines.map(m => m.id)) + 1;
    } else {
      nextId.current = 1;
    }
    
    // Set next roof ID based on loaded roofs
    if (sim.roofs && sim.roofs.length > 0) {
      nextRoofId.current = Math.max(...sim.roofs.map(r => r.id)) + 1;
    } else {
      nextRoofId.current = 1;
    }
  };

  const handleSelectSimulation = (id) => {
    const sim = simulations.find(s => s.id === id);
    if (sim) loadSimulation(sim);
  };

  const handleDeleteSimulation = (id) => {
    const updated = simulations.filter(s => s.id !== id);
    setSimulations(updated);
    localStorage.setItem('hacuco_simulations', JSON.stringify(updated));
    if (currentSimulationId === id) {
      setCurrentSimulationId(null);
    }
  };

  const handleRenameSimulation = (id, newName) => {
    const updated = simulations.map(s => {
      if (s.id === id) {
        return { ...s, name: newName, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setSimulations(updated);
    localStorage.setItem('hacuco_simulations', JSON.stringify(updated));
  };

  // AUTO-SAVE EFFECT
  useEffect(() => {
    if (!currentSimulationId) return;
    
    const currentSim = simulations.find(s => s.id === currentSimulationId);
    if (!currentSim) return;
    
    const hasChanges =
      currentSim.customerName !== customerName ||
      currentSim.customerPhone !== customerPhone ||
      currentSim.customerAddress !== customerAddress ||
      currentSim.moneyInput !== moneyInput ||
      currentSim.seasonCoef !== seasonCoef ||
      currentSim.panelWattage !== panelWattage ||
      JSON.stringify(currentSim.roofs) !== JSON.stringify(roofs) ||
      JSON.stringify(currentSim.machines) !== JSON.stringify(machines) ||
      currentSim.gap !== gap ||
      currentSim.machW !== machW ||
      currentSim.machH !== machH ||
      JSON.stringify(currentSim.scribbles) !== JSON.stringify(scribbles);
      
    if (!hasChanges) return;

    const updated = simulations.map(s => {
      if (s.id === currentSimulationId) {
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          customerName,
          customerPhone,
          customerAddress,
          moneyInput,
          seasonCoef,
          panelWattage,
          roofs,
          machines,
          gap,
          machW,
          machH,
          scribbles
        };
      }
      return s;
    });
    
    setSimulations(updated);
    localStorage.setItem('hacuco_simulations', JSON.stringify(updated));
  }, [
    currentSimulationId,
    customerName,
    customerPhone,
    customerAddress,
    moneyInput,
    seasonCoef,
    panelWattage,
    roofs,
    machines,
    gap,
    machW,
    machH,
    scribbles
  ]);

  // CALCULATE ELECTRICITY USAGE
  const parseMoney = (str) => {
    const d = (str || '').replace(/[^\d]/g, '');
    return d ? parseInt(d, 10) : 0;
  };

  const money = parseMoney(moneyInput);
  const preTax = money / 1.1; // Implicit 10% VAT
  
  let remaining = preTax;
  let totalKwh = 0;
  
  TIER_PRICES.forEach(t => {
    const width = isFinite(t.to) ? (t.to - t.from) : Infinity;
    let kwh = 0;
    if (remaining > 0 && t.price > 0) {
      if (!isFinite(width)) {
        kwh = remaining / t.price;
        remaining = 0;
      } else {
        const maxCost = width * t.price;
        if (remaining >= maxCost) {
          kwh = width;
          remaining -= maxCost;
        } else {
          kwh = remaining / t.price;
          remaining = 0;
        }
      }
    }
    totalKwh += kwh;
  });

  const dailyConsumptionKwh = totalKwh / 30;

  // REQUIRED CAPACITY CALCULATIONS
  const requiredKwp = seasonCoef > 0 ? dailyConsumptionKwh / seasonCoef : 0;
  const requiredPanelCount = requiredKwp > 0 ? Math.ceil((requiredKwp * 1000) / panelWattage) : 0;

  // AUTO LAYOUT
  const handleAutoLayout = () => {
    let quota = requiredPanelCount > 0 ? requiredPanelCount : Infinity;
    const newMachines = [];
    
    roofs.forEach(roof => {
      // Try both orientations and pick the best fitting one
      const candA = getLayoutCandidate(roof, machW, machH, gap);
      const candB = getLayoutCandidate(roof, machH, machW, gap);
      
      const bestCand = candB.length > candA.length ? candB : candA;
      const placeCount = Math.min(bestCand.length, quota);
      
      for (let i = 0; i < placeCount; i++) {
        const item = bestCand[i];
        newMachines.push({
          id: nextId.current++,
          section: roof.id,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        });
      }
      quota -= placeCount;
    });
    
    setMachines(newMachines);
    setSelectedMachineId(null);
  };

  // ADD ONE ROOF
  const handleAddRoof = () => {
    const nextNum = roofs.length > 0 ? Math.max(...roofs.map(r => {
      const match = r.name.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })) + 1 : 1;
    
    setRoofs(prev => [
      ...prev,
      {
        id: nextRoofId.current++,
        name: `Mái ${nextNum}`,
        shape: "rectangle",
        w: 4,
        h: 5,
        w2: 4
      }
    ]);
  };

  // DELETE ROOF
  const handleDeleteRoof = (roofId) => {
    setRoofs(prev => prev.filter(r => r.id !== roofId));
    setMachines(prev => prev.filter(m => m.section !== roofId));
  };

  // ROTATE ALL ON ROOF (FIXED BUG: NO LIMIT TO OTHER ROOFS QUOTA!)
  const handleRotateAllInSection = (roofId) => {
    const roof = roofs.find(r => r.id === roofId);
    if (!roof) return;
    
    const secMachines = machines.filter(m => m.section === roofId);
    let mw, mh;
    if (secMachines.length > 0) {
      mw = secMachines[0].h;
      mh = secMachines[0].w;
    } else {
      mw = machH;
      mh = machW;
    }
    
    const candidates = getLayoutCandidate(roof, mw, mh, gap);
    
    setMachines(prev => {
      const others = prev.filter(m => m.section !== roofId);
      const rotated = candidates.map(item => ({
        id: nextId.current++,
        section: roofId,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      }));
      return [...others, ...rotated];
    });
    setSelectedMachineId(null);
  };

  // ADD ONE PANEL
  const handleAddOnePanel = (roofId) => {
    const roof = roofs.find(r => r.id === roofId);
    if (!roof) return;
    
    const dims = getRoofContainerDims(roof);
    const countInSec = machines.filter(m => m.section === roofId).length;
    const cascade = countInSec % 6;
    
    const x = Math.min(0.15 + cascade * 0.25, Math.max(0, dims.w - machW));
    const y = Math.min(0.15 + cascade * 0.25, Math.max(0, dims.h - machH));
    
    const newPanel = {
      id: nextId.current++,
      section: roofId,
      x,
      y,
      w: machW,
      h: machH
    };
    
    setMachines(prev => [...prev, newPanel]);
    setSelectedMachineId(newPanel.id);
  };

  // ROTATE A PANEL
  const handleRotatePanel = (mId) => {
    setMachines(prev => prev.map(m => {
      if (m.id === mId) {
        const cx = m.x + m.w / 2;
        const cy = m.y + m.h / 2;
        const nw = m.h;
        const nh = m.w;
        return {
          ...m,
          x: cx - nw / 2,
          y: cy - nh / 2,
          w: nw,
          h: nh
        };
      }
      return m;
    }));
  };

  // REMOVE SELECTED PANEL
  const handleRemoveSelectedPanel = () => {
    if (selectedMachineId == null) return;
    setMachines(prev => prev.filter(m => m.id !== selectedMachineId));
    setSelectedMachineId(null);
  };

  // CLEAR ALL PANELS
  const handleClearAllPanels = () => {
    setMachines([]);
    setSelectedMachineId(null);
  };

  // Keyboard delete support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedMachineId != null) {
        if (document.activeElement.tagName === 'INPUT') return;
        handleRemoveSelectedPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMachineId]);

  // If not logged in, render login overlay
  if (!user) {
    return <LoginOverlay onLoginSuccess={setUser} />;
  }

  return (
    <>
      <Header
        user={user}
        onLogout={() => setUser(null)}
        currentSimulationId={currentSimulationId}
        onBackToDashboard={() => setCurrentSimulationId(null)}
      />
      
      {!currentSimulationId ? (
        <Dashboard
          simulations={simulations}
          onCreateSimulation={handleCreateSimulation}
          onDeleteSimulation={handleDeleteSimulation}
          onSelectSimulation={handleSelectSimulation}
          onRenameSimulation={handleRenameSimulation}
        />
      ) : (
        <>
          <div className="app active">
            <Sidebar
              machines={machines}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerAddress={customerAddress}
              setCustomerAddress={setCustomerAddress}
              moneyInput={moneyInput}
              setMoneyInput={setMoneyInput}
              seasonCoef={seasonCoef}
              setSeasonCoef={setSeasonCoef}
              panelWattage={panelWattage}
              setPanelWattage={setPanelWattage}
              roofs={roofs}
              setRoofs={setRoofs}
              machW={machW}
              setMachW={setMachW}
              machH={machH}
              setMachH={setMachH}
              gap={gap}
              setGap={setGap}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <Stage
                roofs={roofs}
                machines={machines}
                setMachines={setMachines}
                scale={60}
                selectedMachineId={selectedMachineId}
                setSelectedMachineId={setSelectedMachineId}
                onRotateMachine={handleRotatePanel}
                onRotateAllInSection={handleRotateAllInSection}
              />
            </div>
          </div>
          <ScribbleOverlay scribbles={scribbles} onScribblesChange={setScribbles} />
        </>
      )}
    </>
  );
}
