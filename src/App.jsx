import React, { useMemo, useState } from 'react'
import ErrorBoundary from './ErrorBoundary.jsx'
import { compute } from './lib/calc.js'

const fmt = (n)=> (Number.isFinite(Number(n)) ? Number(n).toLocaleString(undefined,{style:'currency',currency:'USD'}) : '$0.00')
const moneyInput = (s)=>{
  const v=(s||'').toString().replace(/[^0-9.\-]/g,'')
  return v? Number(v).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}) : ''
}

export default function App(){
  const [price, setPrice] = useState('$400,000')
  const [downPct, setDownPct] = useState('2')
  const [ccPct, setCcPct] = useState('3')
  const [seller, setSeller] = useState('$0')
  const [other, setOther] = useState('$0')
  const [earnest, setEarnest] = useState('$0')
  const [dpaDown, setDpaDown] = useState('$0')
  const [dpaCC, setDpaCC] = useState('$0')
  const [includeEarnestInCTC, setIncludeEarnestInCTC] = useState(true)
  const [dpaCountsTowardCap, setDpaCountsTowardCap] = useState(false)
  const [autoCTC, setAutoCTC] = useState(true)
  const [autoSeller, setAutoSeller] = useState(true)

  const data = useMemo(()=> compute({
    price, downPct:String(Number(downPct||0)/100), closingCostPct:String(Number(ccPct||0)/100),
    sellerCredits:seller, otherCredits:other, dpaToDown:dpaDown, dpaToCC:dpaCC,
    earnest, includeEarnestInCTC, dpaCountsTowardCap
  }), [price,downPct,ccPct,seller,other,dpaDown,dpaCC,earnest,includeEarnestInCTC,dpaCountsTowardCap])

  const ctcField = autoCTC ? Number(data.ctcNet||0).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}) : '$0'
  const sellerField = autoSeller ? Number(Math.max(0, Number(data.additionalCreditsToZeroAgent||0))).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}) : seller

  return (
    <div className="container">
      <h1>AHA / AFC Buyer Bonus Calculator</h1>
      <div className="footer">Build v{__APP_VERSION__}</div>
      <ErrorBoundary>
        <div className="card">
          <div className="grid2">
            <div>
              <label>Home Price</label>
              <input type="text" inputMode="numeric" value={price} onChange={e=>setPrice(moneyInput(e.target.value))} />

              <label>Down Payment (%)</label>
              <input type="text" inputMode="decimal" value={downPct} onChange={e=>setDownPct(e.target.value.replace(/[^0-9.\-]/g,''))} />

              <label>Closing Costs (%)</label>
              <input type="text" inputMode="decimal" value={ccPct} onChange={e=>setCcPct(e.target.value.replace(/[^0-9.\-]/g,''))} />

              <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
                <label>Seller Credits</label>
                <label className="toggle">
                  <input type="checkbox" checked={autoSeller} onChange={e=>setAutoSeller(e.target.checked)} />
                  Auto-calc Seller Credits to zero Agent
                  <span className="small">Needed: {fmt(data.additionalCreditsToZeroAgent||0)}</span>
                </label>
              </div>
              <input type="text" inputMode="numeric" value={sellerField} readOnly={autoSeller}
                     onChange={e=>{ setAutoSeller(false); setSeller(moneyInput(e.target.value)); }} />

              <label>Other Credits (optional)</label>
              <input type="text" inputMode="numeric" value={other} onChange={e=>setOther(moneyInput(e.target.value))} />

              <div className="row">
                <label className="toggle"><input type="checkbox" checked={includeEarnestInCTC} onChange={e=>setIncludeEarnestInCTC(e.target.checked)} /> Include Earnest Money in Net CTC</label>
                <label className="toggle"><input type="checkbox" checked={dpaCountsTowardCap} onChange={e=>setDpaCountsTowardCap(e.target.checked)} /> Count DPA toward Cap</label>
              </div>

              <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
                <label>Cash to Close</label>
                <label className="toggle"><input type="checkbox" checked={autoCTC} onChange={e=>setAutoCTC(e.target.checked)} /> Auto-calc Cash to Close</label>
              </div>
              <input type="text" inputMode="numeric" value={ctcField} readOnly={autoCTC} onChange={e=>setAutoCTC(false)} />
              <div className="small">Auto ON: uses computed Net CTC (includes DPA and credits); cap uses original CTC.</div>
            </div>

            <div>
              <label>Earnest Money</label>
              <input type="text" inputMode="numeric" value={earnest} onChange={e=>setEarnest(moneyInput(e.target.value))} />

              <label>DPA to Down</label>
              <input type="text" inputMode="numeric" value={dpaDown} onChange={e=>setDpaDown(moneyInput(e.target.value))} />

              <label>DPA to Closing</label>
              <input type="text" inputMode="numeric" value={dpaCC} onChange={e=>setDpaCC(moneyInput(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{flexWrap:'wrap'}}>
            <span className="kvpill"><span className="kicker">Gross Commission</span><span className="value">{fmt(data.grossCommission)}</span></span>
            <span className="kvpill"><span className="kicker">Agent Share (50%)</span><span className="value">{fmt(data.agentShare)}</span></span>
            <span className="kvpill"><span className="kicker">AHA Share (50%)</span><span className="value">{fmt(data.ahaShare)}</span></span>
            <span className="kvpill"><span className="kicker">Buyer Bonus Allowed</span><span className="value">{fmt(data.capUsed)}</span></span>
          </div>
          <hr className="hr"/>
          <div className="row" style={{flexDirection:'column',alignItems:'flex-start'}}>
            <span>AFC Contribution (0.375%): {fmt(data.allowedAfc)}</span>
            <span>AHA Contribution (0.375%): {fmt(data.allowedAha)}</span>
            <span>Agent Contribution (0.25%): {fmt(data.allowedAgent)}</span>
            <span>Agent Net (after credit): {fmt(data.agentNet)}</span>
            <span>AHA Net (after credit): {fmt(data.ahaNet)}</span>
            <span>CTC (before credits & DPA): {fmt(data.ctcBase)}</span>
            <span>CTC (after credits & DPA): {fmt(data.ctcNet)}</span>
            <span>Cap Used: {fmt(data.capUsed)}</span>
          </div>
          <div className="box small">Cap rule: {data.capRule}</div>
        </div>
      </ErrorBoundary>
    </div>
  )
}
