"""XDELX — verificador independiente desde DEF-CORE (Python puro, no usa match.h). Autor: Claude.
Uso: vxdel.py --gate xdel PALABRA  -> exit 0 solo si NINGUNA orientacion (B_A, B_B) se cubre completa
     vxdel.py --gate ctl  PALABRA  -> exit 0 solo si el bloque sin +1 (quitar p bajos, z altos) NO se cubre completo
     vxdel.py --census m           -> recuento independiente (x0=0): words xdel_fail ctl_fail only_A only_B both
     vxdel.py PALABRA...           -> informe"""
import sys
def analyze(xs):
    x=[int(c) for c in xs]; N=len(x); assert (N-1)%6==0; m=(N-1)//6; L=2*m+1; T=4*m+1
    S=[sum(x[i:i+L]) for i in range(T)]; y=[x[i+m] for i in range(T)]
    seen=set(); waste=[]
    for i in range(T):
        c=(S[i],y[i])
        if c in seen: waste.append(i)
        else: seen.add(c)
    bic=sorted(h for h in set(S) if (h,0) in seen and (h,1) in seen)
    p=min(S); z=L-max(S)
    nb={h:[w for w in waste if any(S[t]==h and abs(t-w)<=m+1 for t in range(T))] for h in bic}
    def covers(levels):
        own={}
        def aug(h,vis):
            for w in nb[h]:
                if w in vis: continue
                vis.add(w)
                if w not in own or aug(own[w],vis): own[w]=h; return True
            return False
        return all(aug(h,set()) for h in levels)
    I=len(bic)
    BA=bic[p:max(p,I-z-1)]; BB=bic[p+1:max(p+1,I-z)]; BC=bic[p:max(p,I-z)]
    return dict(m=m,rho=len(seen),bound=3*m+2,p=p,z=z,I=I,okA=covers(BA),okB=covers(BB),ctl_ok=covers(BC))
if __name__=='__main__':
    if len(sys.argv)==3 and sys.argv[1]=='--census':
        # recuento independiente sobre x0=0: imprime "words xdel_fail ctl_fail only_A only_B both"
        m=int(sys.argv[2]); N=6*m+1; c=x=a=b=bo=n=0
        for v in range(0,1<<N,2):
            r=analyze(''.join(str((v>>j)&1) for j in range(N))); n+=1
            if not r['ctl_ok']: c+=1
            if not (r['okA'] or r['okB']): x+=1
            elif r['okA'] and r['okB']: bo+=1
            elif r['okA']: a+=1
            else: b+=1
        print(n,x,c,a,b,bo); sys.exit(0)
    if len(sys.argv)==4 and sys.argv[1]=='--gate':
        r=analyze(sys.argv[3])
        hit = (not r['okA'] and not r['okB']) if sys.argv[2]=='xdel' else (not r['ctl_ok'])
        print('GATE',sys.argv[2],sys.argv[3],r,'CONFIRMADO' if hit else 'NO CONFIRMADO'); sys.exit(0 if hit else 1)
    for w in sys.argv[1:]: print(w, analyze(w))
