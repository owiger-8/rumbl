import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import WatchExperience from './components/WatchExperience';
import AcousticShockwave from './components/AcousticShockwave';

const chapters = ['THE OBJECT', 'IDENTIFICATION', 'ACTIVATION', 'ACOUSTIC OUTPUT', 'EXPLODED VIEW', 'RUMBL 01'];

export default function App() {
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const [sosPending, setSosPending] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef();
  const activationTimer = useRef();
  const sirenTimer = useRef();
  const tapResetTimer = useRef();
  const pressStartedAt = useRef(0);
  const tapCount = useRef(0);
  const sections = useRef([]);

  useEffect(() => {
    const update = () => setProgress(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    addEventListener('scroll', update, { passive: true });
    update();
    return () => removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    let accumulated = 0;
    let settleTimer;
    let lockedUntil = 0;
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      if (Date.now() < lockedUntil) return;
      accumulated += event.deltaY;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (Math.abs(accumulated) < 36) { accumulated = 0; return; }
        const direction = Math.sign(accumulated);
        const current = Math.round(window.scrollY / Math.max(1, innerHeight));
        const next = Math.max(0, Math.min(chapters.length - 1, current + direction));
        accumulated = 0;
        lockedUntil = Date.now() + 560;
        sections.current[next]?.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, 55);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => () => {
    clearTimeout(holdTimer.current);
    clearTimeout(activationTimer.current);
    clearTimeout(sirenTimer.current);
    clearTimeout(tapResetTimer.current);
  }, []);

  const triggerDevice = () => {
    setActivated(true);
    setSosPending(true);
    setHolding(false);
    if (navigator.vibrate) navigator.vibrate([70, 40, 100]);
    clearTimeout(activationTimer.current);
    clearTimeout(sirenTimer.current);
    sirenTimer.current = setTimeout(() => setActivated(false), 1800);
    activationTimer.current = setTimeout(() => setSosPending(false), 6000);
  };
  const startHold = () => {
    if (activated) return;
    setHolding(true);
    pressStartedAt.current = Date.now();
    holdTimer.current = setTimeout(triggerDevice, 2500);
  };
  const endHold = () => {
    const heldFor = Date.now() - pressStartedAt.current;
    clearTimeout(holdTimer.current);
    if (activated) return;
    setHolding(false);
    if (heldFor > 350) return;
    tapCount.current += 1;
    clearTimeout(tapResetTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      triggerDevice();
    } else {
      tapResetTimer.current = setTimeout(() => { tapCount.current = 0; }, 700);
    }
  };
  const cancelHold = () => { clearTimeout(holdTimer.current); if (!activated) setHolding(false); };
  const cancelActivation = () => {
    clearTimeout(activationTimer.current);
    setSosPending(false);
  };
  const goTo = (index) => sections.current[index]?.scrollIntoView({ behavior: 'smooth' });
  const active = Math.min(chapters.length - 1, Math.round(progress * (chapters.length - 1)));

  return <div className="experience">
    <header className="nav">
      <span className="nav-center">HARDWARE // 01</span>
      <a className="wordmark" href="#top" aria-label="RUMBL home" onClick={(e) => { e.preventDefault(); goTo(0); }}><img src="/white_logo.png" alt="RUMBL" /></a>
      <button className="nav-cta" onClick={() => goTo(chapters.length - 1)}>RESERVE <span>↗</span></button>
    </header>
    <aside className="chapter-index" aria-label="Chapters">
      {chapters.map((name, i) => <button key={name} className={i === active ? 'current' : ''} onClick={() => goTo(i)} aria-label={`${String(i + 1).padStart(2, '0')} ${name}`}><span>{String(i + 1).padStart(2, '0')}</span><i /></button>)}
    </aside>
    <div className={`product-scene ${activated ? 'is-activated' : ''}`} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 1.4]} fov={36} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 2, 2]} intensity={2.5} color="#fff1e9" />
        <directionalLight position={[-2, 1, -1]} intensity={1.7} color="#ff5a1f" />
        <pointLight position={[0.2, 0.1, 0.5]} intensity={activated ? 5 : 0.7} color="#ff5a1f" distance={3} />
        <WatchExperience scrollProgress={progress} isActivated={activated} isHolding={holding} />
        <AcousticShockwave active={activated || (progress >= 3 / 5 && progress < 4 / 5)} count={6} />
        <Environment preset="night" />
      </Canvas>
    </div>

    <main>
      <section className={`chapter hero${active === 0 ? ' is-current' : ''}`} id="top" ref={el => sections.current[0] = el}>
        <span className="hero-ghost" aria-hidden="true">01</span>
        <div className="hero-tech hero-tech-left" aria-hidden="true"><span>RUMBL 01 / CORE STUDY</span><i /><span>30 mm / CORE TARGET<br />8 mm / PROFILE TARGET</span></div>
        <div className="hero-tech hero-tech-right" aria-hidden="true"><span>01&nbsp; WATCH STRAP CLIP</span><span>02&nbsp; PHONE CHARM LOOP</span><span>03&nbsp; SHOELACE CLIP</span><span>ONE CORE / THREE MOUNTS</span></div>
        <div className="hero-copy"><p className="eyebrow">PERSONAL SAFETY / MODULAR SYSTEM</p><h1>RUMBL<span>01</span></h1><p className="hero-descriptor">One compact safety core. Three everyday mounts.<br />Ready when you need it.</p><button className="scroll-cue" onClick={() => goTo(1)}><b />MEET THE MODULAR SYSTEM <span>↓</span></button></div>
        <div className="hero-caption"><span>RUMBL / HARDWARE 01</span><span>*CURRENT ENGINEERING TARGETS</span><span>SUBJECT TO VALIDATION</span></div>
        <div className="hero-specbar"><div><strong>3 <i>WAYS</i></strong><span>WATCH / PHONE / SHOE</span><small /></div><div><strong>2 <i>TRIGGERS</i></strong><span>HOLD / TRIPLE TAP</span><small /></div><div><strong>130 <i>dB*</i></strong><span>LOCAL SIREN TARGET</span><small /></div><div><strong>~7 <i>DAYS*</i></strong><span>BATTERY LIFE TARGET</span><small /></div></div>
      </section>

      <section className={`chapter identify${active === 1 ? ' is-current' : ''}`} ref={el => sections.current[1] = el}>
        <div className="chapter-heading identify-copy"><p className="eyebrow">01 / MODULAR BY DESIGN</p><h2>One core.<br />Your everyday.</h2><p className="identify-description">A compact safety module clips beside the watch you already wear. Swap the mount to carry the same core on a phone charm loop or shoelace.</p><button className="design-cta" onClick={() => goTo(4)}>EXPLORE THE MATERIALS <span>↗</span></button><button className="form-tile" onClick={() => goTo(4)}><img src="/lower_Arm.png" alt=""/><span className="form-play">↗</span><b>SEE HOW IT<br/>SITS ON-WRIST</b><span className="tile-arrow">01—03</span></button></div>
        <div className="annotations">
          {[
            ['WATCH STRAP CLIP', 'Threads onto the strap you already wear.'],
            ['FLEXIBLE SILICONE', 'Designed to grip varied straps; fit testing is pending.'],
            ['RIGID CORE SHELL', 'Protects the electronics inside.'],
            ['THREE MOUNT TYPES', 'Watch strap, phone charm, or shoelace.'],
          ].map(([label, detail], i) => <div key={label} className={`annotation annotation-${i + 1}`}><span>0{i + 1}</span><i /><b>{label}</b><small>{detail}</small></div>)}
        </div>
        <img className="identify-woman" src="/woman_Standing.png" alt="RUMBL 01 worn on the wrist" />
        <p className="edge-note">OBJECT STUDY <span>01—04</span></p>
        <div className="hero-specbar identify-specbar"><div><strong>01 <i>CORE</i></strong><span>ONE DEVICE / THREE MOUNT TARGETS</span><small /></div><div><strong>30 <i>mm*</i></strong><span>COMPACT PUCK TARGET</span><small /></div><div><strong>8 <i>mm*</i></strong><span>LOW-PROFILE THICKNESS</span><small /></div><div><strong>FIT <i>TEST</i></strong><span>STRAP COMPATIBILITY IN VALIDATION</span><small /></div></div>
      </section>

      <section className={`chapter activation${active === 2 ? ' is-current' : ''}`} ref={el => sections.current[2] = el}>
        <div className="activation-copy"><p className="eyebrow alert"><i />{activated ? 'LOCAL SIREN ACTIVE' : sosPending ? 'SOS PREVIEW / CANCEL WINDOW' : 'TWO DELIBERATE TRIGGERS'}</p><h2>{activated ? 'ACTIVE' : holding ? 'HOLD' : 'READY'}</h2><p className="microcopy">PRESS &amp; HOLD FOR 2.5 SECONDS<br />OR TAP THE CONTROL THREE TIMES</p></div>
        <div className="activation-steps" aria-hidden="true"><span className={holding || activated ? 'step complete' : 'step'}><b>01</b> PRESS</span><i /><span className={holding || activated ? 'step active' : 'step'}><b>02</b> HOLD / TAP ×3</span><i /><span className={activated ? 'step complete' : 'step'}><b>03</b> SIREN + SOS</span></div>
        <button className={`hold-control${holding ? ' is-holding' : ''}${activated ? ' is-released' : ''}`} onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={cancelHold} onPointerCancel={cancelHold} onContextMenu={e => e.preventDefault()}><span className={holding || activated ? 'hold-dot lit' : 'hold-dot'} />{activated ? 'SIREN ACTIVE · DEMO' : holding ? 'KEEP HOLDING' : 'HOLD OR TAP 3×'}<span className="hold-progress" aria-hidden="true"><i /></span></button>
        {sosPending ? <button className="activation-cancel" onClick={cancelActivation}>CANCEL SOS PREVIEW</button> : <p className="activation-hint">INTERACTION PREVIEW · NO CONTACTS ARE NOTIFIED</p>}
        <div className="trigger-detail-grid"><article><span>01 / PRIMARY</span><b>Press and hold</b><p>A deliberate 2–3 second press is designed to resist accidental pressure in a pocket or bag.</p></article><article><span>02 / DISCREET</span><b>Triple-tap</b><p>The planned motion-sensor gesture offers an alternative when a visible hold is difficult.</p></article></div>
      </section>

      <section className={`chapter acoustic${active === 3 ? ' is-current' : ''}`} ref={el => sections.current[3] = el}>
        <div className="acoustic-copy"><p className="eyebrow">03 / TWO-LAYER RESPONSE</p><h2>130<span>dB*</span></h2><p className="subhead">LOCAL SIREN / PHONE-INDEPENDENT</p><p className="target-tag">*OUTPUT TARGET / NOT YET VALIDATED</p></div>
        <div className="wave-mark" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="response-grid"><article><span>01 / IMMEDIATE</span><b>On-device siren</b><p>Designed to sound instantly without a paired phone or open app.</p></article><article><span>02 / CONNECTED</span><b>Planned BLE SOS</b><p>With your phone nearby, the companion app can share location with chosen contacts.</p></article><article><span>03 / CONTROL</span><b>6-second cancel window</b><p>Cancel an accidental SOS before it reaches your contacts. The siren remains immediate.</p></article><article><span>04 / OPTIONAL</span><b>Private voice note</b><p>An optional future app feature, stored locally on your phone.</p></article></div>
        <p className="edge-note">LOCAL ALARM / PHONE-INDEPENDENT <span>CONNECTED SOS / PHONE REQUIRED</span></p>
      </section>

      <section className={`chapter exploded${active === 4 ? ' is-current' : ''}`} ref={el => sections.current[4] = el}>
        <div className="chapter-heading"><p className="eyebrow">04 / MATERIALS &amp; POWER</p><h2>Soft clip.<br />Protected core.</h2><p className="identify-description">Flexible silicone grips the strap close to the wrist. A separate rigid shell protects the electronics inside.</p></div>
        <ol className="component-list"><li><span>01</span> RIGID MODULE SHELL</li><li><span>02</span> RECESSED TRIGGER</li><li><span>03</span> FLEXIBLE SILICONE CLIP</li><li><span>04</span> USB-C RECHARGE</li><li><span>05</span> LI-PO BATTERY</li></ol>
        <div className="build-notes"><article><span>01 / SKIN CONTACT</span><b>Soft-touch silicone</b><p>Flexible, grippy, and comfortable against the wrist through daily wear.</p></article><article><span>02 / CORE MODULE</span><b>Rigid molded shell</b><p>Compact 30 × 8 mm form target keeps the device beside your watch face.</p></article><article><span>03 / DAILY POWER</span><b>Rechargeable by USB-C</b><p>About one week per charge is the current battery-life target.</p></article></div>
        <p className="edge-note">ENGINEERING TARGETS <span>FIT / DURABILITY / BATTERY TESTING PENDING</span></p>
      </section>

      <section className={`chapter finale${active === 5 ? ' is-current' : ''}`} ref={el => sections.current[5] = el}>
        <div className="final-copy"><p className="eyebrow">RUMBL / HARDWARE 01</p><h2>Safety,<br />already<br />with you.</h2><p className="subhead">ONE CORE. THREE MOUNTS.<br />A LOCAL ALARM WITH A CONNECTED BACKUP.</p><a className="final-cta" href="mailto:hello@rumbl.com?subject=RUMBL%2001%20Early%20access">REQUEST EARLY ACCESS <span>↗</span></a><p className="prototype-note">RUMBL 01 IS IN DEVELOPMENT. SPECIFICATIONS SHOWN ARE CURRENT TARGETS.</p></div>
        <div className="final-checklist"><p><b>01</b><span>Use the watch strap you already own.</span></p><p><b>02</b><span>Switch to a phone charm or shoe clip.</span></p><p><b>03</b><span>Trigger the local siren with a hold or triple-tap.</span></p><p><b>04</b><span>Add phone-based SOS when your phone is nearby.</span></p><div className="final-micro">NO REPLACEMENT WATCH<br />NO NEW DAILY HABIT</div></div>
        <p className="edge-note">RUMBL 01 <span>PERSONAL SAFETY / MODULAR SYSTEM</span></p>
      </section>
    </main>
  </div>;
}
