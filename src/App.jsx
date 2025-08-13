import React, { useMemo, useState } from 'react'
import ErrorBoundary from './ErrorBoundary.jsx'
import { compute } from './lib/calc.js'

const fmt = (n)=> (Number.isFinite(Number(n)) ? Number(n).toLocaleString(undefined,{style:'currency',currency:'USD'}) : '$0.00')

export default function App(){
  const [priceInput, setPriceInput] = useState('$400,000')
  const [downPctInput, setDownPctInput] = useState('2')
  const [ccPctInput, setCcPctInput] = useState('3')
  const [sellerCreditsInput, setSellerCreditsInput] = useState('$0')
  const [otherCreditsInput, setOtherCreditsInput] = useState('$0')
  const [earnestInput, setEarnestInput] = useState('$0')
  const [dpaDownInput, setDpaDownInput] = useState('$0')
  const [dpaCcInput, setDpaCcInput] = useState('$0')

  const [includeEarnestInCTC, setIncludeEarnestInCTC] = useState(true)
  const [dpaCountsTowardCap, setDpaCountsTowardCap] = useState(false)

  const [autoCTC, setAutoCTC] = useState(true)
  const [autoSeller, setAutoSeller] = useState(true)

  const parseMoney = (s)=>{
    const v = (s||'').toString().replace(/[^0-9.\-]/g,'')
    return v ? Number(v).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}) : ''
  }

  const data = useMemo(()=> compute({
    price: priceInput,
    downPct: String(Number(downPctInput||0)/100),
    closingCostPct: String(Number(ccPctInput||0)/100),
    sellerCredits: sellerCreditsInput,
    otherCredits: otherCreditsInput,
    dpaToDown: dpaDownInput,
    dpaToCC: dpaCcInput,
    earnest: earnestInput,
    includeEarnestInCTC, dpaCountsTowardCap
  }), [priceInput, downPctInput, ccPctInput, sellerCreditsInput, otherCreditsInput, dpaDownInput, dpaCcInput, earnestInput, includeEarnestInCTC, dpaCountsTowardCap])

  const cashToCloseValue = autoCTC
    ? Number(data.ctcNet||0).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})
    : undefined

  const sellerCreditsValue = autoSeller
    ? Number(Math.max(0, Number(data.additionalCreditsToZeroAgent||0))).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})
    : undefined

  return (
    <div className="container">
      <h1>AHA / AFC Buyer Bonus Calculator</h1>
      <div className="small footer">Build v{__APP_VERSION__}</div>

      <ErrorBoundary>
        <div className="card">
          <div className="grid2">
            <div>
              <label>Home Price</label>
              <input type="text" inputMode="numeric" value={priceInput} onChange={e=>setPriceInput(parseMoney(e.target.value))} />

              <label>Down Payment (%)</label>
              <input type="text" inputMode="decimal" value={downPctInput} onChange={e=>setDownPctInput(e.target.value.replace(/[^0-9.\-]/g,''))} />

              <label>Closing Costs (%)</label>
              <input type="text" inputMode="decimal" value={ccPctInput} onChange={e=>setCcPctInput(e.target.value.replace(/[^0-9.\-]/g,''))} />

              <div className="row" style={{justifyContent:'space-between'}}>
                <label>Seller Credits</label>
                <label className="row"><input type="checkbox" checked={autoSeller} onChange={e=>setAutoSeller(e.target.checked)} /> Auto-calc Seller Credits to zero Agent</label>
              </div>
              <input type="text" inputMode="numeric"
                value={sellerCreditsValue ?? sellerCreditsInput}
                readOnly={autoSeller}
                onChange={e=>{ setAutoSeller(false); setSellerCreditsInput(parseMoney(e.target.value)); }}
              />

              <label>Other Credits (optional)</label>
              <input type="text" inputMode="numeric" value={otherCreditsInput} onChange={e=>setOtherCreditsInput(parseMoney(e.target.value))} />

              <div className="row">
                <label className="row"><input type="checkbox" checked={includeEarnestInCTC} onChange={e=>setIncludeEarnestInCTC(e.target.checked)} /> Include Earnest Money in Net CTC</label>
                <label className="row"><input type="checkbox" checked={dpaCountsTowardCap} onChange={e=>setDpaCountsTowardCap(e.target.checked)} /> Count DPA toward Cap</label>
              </div>

              <div className="row" style={{justifyContent:'space-between'}}>
                <label>Cash to Close</label>
                <label className="row"><input type="checkbox" checked={autoCTC} onChange={e=>setAutoCTC(e.target.checked)} /> Auto-calc Cash to Close</label>
              </div>
              <input type="text" inputMode="numeric"
                value={cashToCloseValue ?? '$0'}
                readOnly={autoCTC}
                onChange={e=>{ setAutoCTC(false); }}
              />
              <div className="small">Auto ON: uses computed Net CTC (includes DPA and credits); cap uses original CTC.</div>
            </div>

            <div>
              <label>Earnest Money</label>
              <input type="text" inputMode="numeric" value={earnestInput} onChange={e=>setEarnestInput(parseMoney(e.target.value))} />

              <label>DPA to Down</label>
              <input type="text" inputMode="numeric" value={dpaDownInput} onChange={e=>setDpaDownInput(parseMoney(e.target.value))} />

              <label>DPA to Closing</label>
              <input type="text" inputMode="numeric" value={dpaCcInput} onChange={e=>setDpaCcInput(parseMoney(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{flexWrap:'wrap'}}>
            <span className="kvpill"><span className="kicker">Buyer Bonus Allowed</span><span className="value">{fmt(data.capUsed)}</span></span>
            <span className="kvpill"><span className="kicker">CTC Before</span><span className="value">{fmt(data.ctcBase)}</span></span>
            <span className="kvpill"><span className="kicker">CTC After</span><span className="value">{fmt(data.ctcNet)}</span></span>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  )
}
