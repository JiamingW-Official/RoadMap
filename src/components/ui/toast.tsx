import * as React from 'react'

const ToastContext = React.createContext<{notify:(msg:string)=>void}>({ notify: () => {} })

export function useToast(){ return React.useContext(ToastContext) }

export function Toaster(){
  const [msg, setMsg] = React.useState<string|null>(null)
  React.useEffect(()=>{
    if (!msg) return
    const t = setTimeout(()=>setMsg(null), 2500)
    return ()=>clearTimeout(t)
  }, [msg])
  return (
    <ToastContext.Provider value={{ notify: setMsg }}>
      {msg ? (
        <div className="fixed bottom-6 right-6 z-[60] rounded-md bg-card/80 border border-border/60 px-4 py-2 shadow-xl">
          <div className="text-sm">{msg}</div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}
