import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import WatchExperience from './components/WatchExperience';
import AcousticShockwave from './components/AcousticShockwave';

const chapters = ['THE OBJECT', 'IDENTIFICATION', 'ACTIVATION', 'ACOUSTIC OUTPUT', 'EXPLODED VIEW', 'RUMBL 01'];

export default function App() {
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const [holding, setHolding] = useState(false);
  const timer = useRef();
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

  const startHold = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setActivated(true);
      if (navigator.vibrate) navigator.vibrate([70, 40, 100]);
      setTimeout(() => { setActivated(false); setHolding(false); }, 1800);
    }, 400);
  };
  const cancelHold = () => { clearTimeout(timer.current); if (!activated) setHolding(false); };
  const goTo = (index) => sections.current[index]?.scrollIntoView({ behavior: 'smooth' });
  const active = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));

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
        <AcousticShockwave active={activated} count={6} />
        <Environment preset="night" />
      </Canvas>
    </div>

    <main>
      <section className="chapter hero" id="top" ref={el => sections.current[0] = el}>
        <span className="hero-ghost" aria-hidden="true">01</span>
        <div className="hero-tech hero-tech-left" aria-hidden="true"><span>RUMBL 01 / FORM 001</span><i /><span>36.7783° N<br />119.4179° W</span></div>
        <div className="hero-tech hero-tech-right" aria-hidden="true"><span>01&nbsp; ACOUSTIC TRANSDUCER</span><span>HIGH-OUTPUT DIRECTIONAL DRIVER</span><span>02&nbsp; ACTIVATION SURFACE</span><span>03&nbsp; SILICONE UNIBODY</span></div>
        <div className="hero-copy"><p className="eyebrow">PERSONAL DEFENSE SYSTEM</p><h1>RUMBL<span>01</span></h1><p className="hero-descriptor">A new instrument for personal safety.</p><button className="scroll-cue" onClick={() => goTo(1)}><b />SCROLL TO ENGAGE <span>↓</span></button></div>
        <div className="hero-caption"><span>RUMBL / HARDWARE 01</span><span>ENGINEERED TO BE WITH YOU</span></div>
        <div className="hero-specbar"><div><strong>130 <i>dB</i></strong><span>DIRECTIONAL OUTPUT / TARGET</span><small /></div><div><strong>300 <i>m</i></strong><span>RANGE / PROTOTYPE TARGET</span><small /></div><div><strong>0.4 <i>s</i></strong><span>INSTANT ENGAGEMENT</span><small /></div><div><strong>24/7</strong><span>ALWAYS READY</span><small /></div></div>
      </section>

      <section className="chapter identify" ref={el => sections.current[1] = el}>
        <div className="chapter-heading identify-copy"><p className="eyebrow">01 / FORM STUDY</p><h2>Considered<br />from every side.</h2><p className="identify-description">A soft-touch silicon unibody that houses a high-output directional acoustic transducer. Designed to be discreet, comfortable, and always ready.</p><button className="design-cta" onClick={() => goTo(4)}>EXPLORE THE DESIGN <span>↗</span></button><button className="form-tile" onClick={() => goTo(4)}><img src="/lower_Arm.png" alt=""/><span className="form-play">▶</span><b>WATCH<br/>FORM STUDY</b><span className="tile-arrow">↗</span></button></div>
        <div className="annotations">
          {[
            ['ACOUSTIC TRANSDUCER', 'High-output directional driver.'],
            ['ACTIVATION SURFACE', 'Capacitive trigger for instant response.'],
            ['SOFT-TOUCH BODY', 'Hypoallergenic silicon unibody.'],
            ['STRAP INTERFACE', 'Quick-release 20 mm standard.'],
          ].map(([label, detail], i) => <div key={label} className={`annotation annotation-${i + 1}`}><span>0{i + 1}</span><i /><b>{label}</b><small>{detail}</small></div>)}
        </div>
        <img className="identify-woman" src="/woman_Standing.png" alt="RUMBL 01 worn on the wrist" />
        <p className="edge-note">OBJECT STUDY <span>01—04</span></p>
        <div className="hero-specbar identify-specbar"><div><strong>130 <i>dB</i></strong><span>DIRECTIONAL OUTPUT / TARGET</span><small /></div><div><strong>300 <i>m</i></strong><span>RANGE / PROTOTYPE TARGET</span><small /></div><div><strong>0.4 <i>s</i></strong><span>INSTANT ENGAGEMENT</span><small /></div><div><strong>24/7</strong><span>ALWAYS READY</span><small /></div></div>
      </section>

      <section className="chapter activation" ref={el => sections.current[2] = el}>
        <div className="activation-copy"><p className="eyebrow alert"><i /> THREAT DETECTED</p><h2>{holding ? 'HOLD' : 'READY'}</h2><p className="microcopy">PRESS AND HOLD<br />FOR 0.4 SECONDS</p></div>
        <div className="activation-steps" aria-hidden="true"><span className={holding || activated ? 'step complete' : 'step'}><b>01</b> CONTACT</span><i /><span className={holding || activated ? 'step active' : 'step'}><b>02</b> HOLD 0.4s</span><i /><span className={activated ? 'step complete' : 'step'}><b>03</b> RELEASE</span></div>
        <button className={`hold-control${holding ? ' is-holding' : ''}${activated ? ' is-released' : ''}`} onPointerDown={startHold} onPointerUp={cancelHold} onPointerLeave={cancelHold} onPointerCancel={cancelHold} onContextMenu={e => e.preventDefault()}><span className={holding || activated ? 'hold-dot lit' : 'hold-dot'} />{activated ? 'PULSE RELEASED' : holding ? 'KEEP HOLDING' : 'PRESS AND HOLD'}<span className="hold-progress" aria-hidden="true"><i /></span></button>
        <p className="activation-hint">{activated ? 'DIRECTIONAL PULSE DEPLOYED' : holding ? 'KEEP PRESSURE TO DEPLOY' : 'TO ACTIVATE YOUR DEVICE'}</p>
      </section>

      <section className="chapter acoustic" ref={el => sections.current[3] = el}>
        <div className="acoustic-copy"><p className="eyebrow">02 / ACOUSTIC EVENT</p><h2>130<span>dB</span></h2><p className="subhead">DIRECTIONAL ACOUSTIC OUTPUT</p><p className="target-tag">TARGET SPECIFICATION</p></div>
        <div className="wave-mark" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <p className="edge-note">PROTOTYPE TARGET <span>NOT YET VALIDATED</span></p>
      </section>

      <section className="chapter exploded" ref={el => sections.current[4] = el}>
        <div className="chapter-heading"><p className="eyebrow">03 / COMPONENT STUDY</p><h2>Made to<br />work as one.</h2></div>
        <ol className="component-list"><li><span>01</span> HOUSING</li><li><span>02</span> TRANSDUCER</li><li><span>03</span> ACTIVATION CORE</li><li><span>04</span> CONNECTOR</li><li><span>05</span> STRAP</li></ol>
        <p className="edge-note">ASSEMBLY <span>01—05</span></p>
      </section>

      <section className="chapter finale" ref={el => sections.current[5] = el}>
        <div className="final-copy"><p className="eyebrow">RUMBL / HARDWARE 01</p><h2>RUMBL <span>01</span></h2><p className="subhead">SOFT-TOUCH SILICONE<br />PERSONAL DEFENSE SYSTEM</p><a className="final-cta" href="mailto:hello@rumbl.com?subject=RUMBL%2001%20Pre-register">PRE-REGISTER <span>↗</span></a></div>
        <p className="edge-note">RUMBL 01 <span>PERSONAL DEFENSE SYSTEM</span></p>
      </section>
    </main>
  </div>;
}
